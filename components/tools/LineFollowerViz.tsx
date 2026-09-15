"use client";
import React, { useRef, useEffect, useMemo } from "react";
import { createLineFollowerEngine, calculateLineFollowerMetrics, trackLateralOffset } from "@/lib/tools/line-follower-physics";

interface LineFollowerVizProps {
  kp: number;
  ki: number;
  kd: number;
  speed: number;
  isRunning: boolean;
  onMetricsUpdate: (metrics: { averageAbsError: number; maxAbsError: number }) => void;
  resetTrigger: number;
}

const FIXED_STEP_SEC = 1 / 120;
const MAX_FRAME_SEC = 0.1;
const HISTORY_INTERVAL_SEC = 1 / 30;
const VIEW_W = 1000;
const VIEW_H = 260;
const MID_Y = VIEW_H / 2;
const TRACK_LENGTH = 800;
const X_OFFSET = 60;

export function LineFollowerViz({ kp, ki, kd, speed, isRunning, onMetricsUpdate, resetTrigger }: LineFollowerVizProps) {
  const carRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);

  const engineRef = useRef(createLineFollowerEngine());
  const simStateRef = useRef({
    lastHistoryTime: 0,
    lastMetricsUpdate: 0,
    trail: [] as { x: number; y: number }[]
  });

  const trackPath = useMemo(() => {
    const points: string[] = [];
    for (let i = 0; i <= 100; i += 1) {
      const x = (i / 100) * TRACK_LENGTH;
      const y = MID_Y + trackLateralOffset(x, TRACK_LENGTH);
      points.push(`${i === 0 ? "M" : "L"} ${X_OFFSET + x} ${y}`);
    }
    return points.join(" ");
  }, []);

  useEffect(() => {
    engineRef.current.reset();
    simStateRef.current = { lastHistoryTime: 0, lastMetricsUpdate: 0, trail: [] };
    onMetricsUpdate({ averageAbsError: 0, maxAbsError: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  useEffect(() => {
    let raf: number;
    let previousTimestampMs: number | null = null;
    let accumulatorSec = 0;

    const tick = (timestampMs: number) => {
      if (previousTimestampMs === null) previousTimestampMs = timestampMs;
      const frameSec = Math.min((timestampMs - previousTimestampMs) / 1000, MAX_FRAME_SEC);
      previousTimestampMs = timestampMs;

      const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isRunning || isReducedMotion) accumulatorSec += frameSec;

      let ranPhysics = false;
      while (accumulatorSec >= FIXED_STEP_SEC && isRunning) {
        // step()'s return value carries the transient `error`/`targetY` computed this tick;
        // getState() only persists x/y/heading, so history must be pushed from this, not that.
        const stepResult = engineRef.current.step({ dt: FIXED_STEP_SEC, speed, kp, ki, kd, trackLength: TRACK_LENGTH });
        accumulatorSec -= FIXED_STEP_SEC;
        ranPhysics = true;

        if (stepResult.timeSec - simStateRef.current.lastHistoryTime >= HISTORY_INTERVAL_SEC) {
          engineRef.current.pushHistory({ timeSec: stepResult.timeSec, error: stepResult.error });
          simStateRef.current.lastHistoryTime = stepResult.timeSec;
          simStateRef.current.trail.push({ x: stepResult.x, y: stepResult.y });
          if (simStateRef.current.trail.length > 60) simStateRef.current.trail.shift();
        }
      }

      if (ranPhysics || !isRunning) {
        const state = engineRef.current.getState();
        if (carRef.current) {
          const cx = X_OFFSET + state.x;
          const cy = MID_Y + state.y;
          const headingDeg = (state.heading * 180) / Math.PI;
          carRef.current.setAttribute("transform", `translate(${cx}, ${cy}) rotate(${headingDeg})`);
        }
        if (trailRef.current) {
          if (!isReducedMotion) {
            const points = simStateRef.current.trail
              .filter((p) => p.x < state.x || simStateRef.current.trail.indexOf(p) > simStateRef.current.trail.length - 10)
              .map((p) => `${X_OFFSET + p.x},${MID_Y + p.y}`)
              .join(" ");
            trailRef.current.setAttribute("points", points);
          } else {
            trailRef.current.setAttribute("points", "");
          }
        }

        if (timestampMs - simStateRef.current.lastMetricsUpdate > 200) {
          const metrics = calculateLineFollowerMetrics(engineRef.current.getState());
          onMetricsUpdate(metrics);
          simStateRef.current.lastMetricsUpdate = timestampMs;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    const handleVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        previousTimestampMs = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", handleVis);
    };
  }, [isRunning, kp, ki, kd, speed, onMetricsUpdate]);

  return (
    <div className="tool-canvas-frame">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="pid-svg"
        role="img"
        aria-label="Top-down view of a car following a curved track, steered by the PID controller"
        style={{ shapeRendering: "geometricPrecision", width: "100%", height: "240px", backgroundColor: "#050711", border: "1px solid #30395e" }}
      >
        <path d={trackPath} fill="none" stroke="var(--pixel-gold)" strokeWidth="3" strokeDasharray="10 8" opacity="0.85" />
        <polyline ref={trailRef} className="pid-trail" fill="none" stroke="#55d5d855" strokeWidth="2" />

        <g ref={carRef} transform={`translate(${X_OFFSET}, ${MID_Y})`}>
          <polygon points="14,0 -10,-8 -6,0 -10,8" fill="var(--pixel-cyan)" stroke="var(--ink)" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
