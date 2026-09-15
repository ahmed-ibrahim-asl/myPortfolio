"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export interface Position {
  x: number;
  y: number;
}

// Minimal pointer-based drag: no external dependency, works for mouse, pen, and touch alike.
// The caller attaches `handleProps` to whatever element should act as the drag handle (a
// header bar, typically) and reads `position`/`isDragging` back to place and style the window.
export function useDraggable({
  initialPosition,
  disabled = false,
}: {
  initialPosition?: Position;
  disabled?: boolean;
}) {
  const [position, setPosition] = useState<Position>(initialPosition ?? { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    if (initialPosition) setPosition(initialPosition);
    // Only reset when a caller hands us a brand-new anchor point, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPosition?.x, initialPosition?.y]);

  const clampToViewport = useCallback((next: Position): Position => {
    if (typeof window === "undefined") return next;
    const margin = 8;
    const maxX = window.innerWidth - margin;
    const maxY = window.innerHeight - margin;
    return {
      x: Math.min(Math.max(next.x, -maxX + 120), maxX - 40),
      y: Math.min(Math.max(next.y, margin), maxY - 40)
    };
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (disabled) return;
      // Let the header's own close button (or any control inside it) work normally.
      if ((event.target as HTMLElement).closest("[data-no-drag]")) return;
      dragState.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y
      };
      setIsDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [disabled, position.x, position.y]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent) => {
      if (!dragState.current) return;
      const dx = event.clientX - dragState.current.startX;
      const dy = event.clientY - dragState.current.startY;
      setPosition(clampToViewport({ x: dragState.current.originX + dx, y: dragState.current.originY + dy }));
    },
    [clampToViewport]
  );

  const endDrag = useCallback(() => {
    dragState.current = null;
    setIsDragging(false);
  }, []);

  return {
    position,
    setPosition,
    isDragging,
    handleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag
    }
  };
}
