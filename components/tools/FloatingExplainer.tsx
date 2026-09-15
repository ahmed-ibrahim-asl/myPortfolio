"use client";

import { useEffect, useId, type ReactNode } from "react";
import { useDraggable, type Position } from "./useDraggable";

export interface FloatingExplainerProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  anchorPosition?: Position;
  children: ReactNode;
}

// A small, non-modal, draggable window for looking something up without losing your place in
// a busy tool. Unlike a dialog it never blocks the page behind it - the visitor can keep
// adjusting controls while this stays open, and close it whenever with Escape or the × button.
export function FloatingExplainer({
  title,
  isOpen,
  onClose,
  anchorPosition,
  children,
}: FloatingExplainerProps) {
  const titleId = useId();
  const { position, isDragging, handleProps } = useDraggable({
    initialPosition: anchorPosition,
    disabled: !isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <aside
      role="region"
      aria-labelledby={titleId}
      className={`floating-explainer${isDragging ? " is-dragging" : ""}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    >
      <header className="floating-explainer-header" {...handleProps}>
        <span className="floating-explainer-grip" aria-hidden="true">⠿</span>
        <span id={titleId} className="floating-explainer-title">
          {title}
        </span>
        <button
          type="button"
          data-no-drag
          className="floating-explainer-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </header>
      <div className="floating-explainer-body">{children}</div>
    </aside>
  );
}
