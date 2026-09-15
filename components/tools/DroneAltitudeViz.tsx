"use client";
import React, { useRef, useEffect } from "react";
import { createPidEngine, calculatePidMetrics } from "@/lib/tools/pid-physics";

interface DroneAltitudeVizProps {
  kp: number;
  ki: number;
  kd: number;
  target: number;
  mass: number;
  damping: number;
  isRunning: boolean;
  onMetricsUpdate: (metrics: { overshoot: number; steadyStateError: number; settlingTime: number | null }) => void;
  resetTrigger: number;
}

const FIXED_STEP_SEC = 1 / 120;
const MAX_FRAME_SEC = 0.1;
const HISTORY_INTERVAL_SEC = 1 / 30;
const MAX_HEIGHT = 100;
const VIEW_W = 1000;
const VIEW_H = 260;
const GROUND_Y = VIEW_H - 20;
const CEILING_Y = 20;

function heightToY(height: number) {
  const clamped = Math.max(0, Math.min(MAX_HEIGHT, height));
  return GROUND_Y - (clamped / MAX_HEIGHT) * (GROUND_Y - CEILING_Y);
}

export function DroneAltitudeViz({ kp, ki, kd, target, mass, damping, isRunning, onMetricsUpdate, resetTrigger }: DroneAltitudeVizProps) {
  const droneRef = useRef<SVGGElement>(null);
  const targetLineRef = useRef<SVGLineElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);
  const thrustRef = useRef<SVGPathElement>(null);

  const engineRef = useRef(createPidEngine());
  const simStateRef = useRef({
    travelStartPos: 0,
    currentTarget: target,
    lastHistoryTime: 0,
    settlingTime: null as number | null,
    inToleranceSince: null as number | null,
    lastMetricsUpdate: 0
  });

  useEffect(() => {
    engineRef.current.reset();
    simStateRef.current = {
      travelStartPos: 0,
      currentTarget: target,
      lastHistoryTime: 0,
      settlingTime: null,
      inToleranceSince: null,
      lastMetricsUpdate: 0
    };
    onMetricsUpdate({ overshoot: 0, steadyStateError: 0, settlingTime: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  useEffect(() => {
    if (target !== simStateRef.current.currentTarget) {
      simStateRef.current.travelStartPos = engineRef.current.getState().position;
      simStateRef.current.currentTarget = target;
      simStateRef.current.settlingTime = null;
      simStateRef.current.inToleranceSince = null;
      engineRef.current.resetPeak();
    }
  }, [target]);

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

      let lastForce = 0;
      let ranPhysics = false;
      while (accumulatorSec >= FIXED_STEP_SEC && isRunning) {
        const before = engineRef.current.getState();
        engineRef.current.step({ dt: FIXED_STEP_SEC, mass, damping, target, kp, ki, kd, plant: "drone" });
        const after = engineRef.current.getState();
        lastForce = mass * ((after.velocity - before.velocity) / FIXED_STEP_SEC + 9.8);
        accumulatorSec -= FIXED_STEP_SEC;
        ranPhysics = true;

        const currentState = engineRef.current.getState();
        if (currentState.timeSec - simStateRef.current.lastHistoryTime >= HISTORY_INTERVAL_SEC) {
          engineRef.current.pushHistory({ timeSec: currentState.timeSec, position: currentState.position, target });
          simStateRef.current.lastHistoryTime = currentState.timeSec;
        }

        const travel = Math.abs(target - simStateRef.current.travelStartPos);
        const tolerance = Math.max(0.02 * travel, 0.005);
        if (Math.abs(target - currentState.position) <= tolerance) {
          if (simStateRef.current.inToleranceSince === null) {
            simStateRef.current.inToleranceSince = currentState.timeSec;
          } else if (currentState.timeSec - simStateRef.current.inToleranceSince >= 1.0 && simStateRef.current.settlingTime === null) {
            simStateRef.current.settlingTime = simStateRef.current.inToleranceSince;
          }
        } else {
          simStateRef.current.inToleranceSince = null;
        }
      }

      if (ranPhysics || !isRunning) {
        const state = engineRef.current.getState();
        if (droneRef.current && targetLineRef.current && trailRef.current) {
          const y = heightToY(state.position);
          droneRef.current.setAttribute("transform", `translate(500, ${y})`);
          const targetY = heightToY(target);
          targetLineRef.current.setAttribute("y1", String(targetY));
          targetLineRef.current.setAttribute("y2", String(targetY));

          if (thrustRef.current) {
            const intensity = Math.max(0, Math.min(1, (lastForce + 20) / 70));
            thrustRef.current.setAttribute("opacity", String(0.15 + intensity * 0.7));
          }

          if (!isReducedMotion) {
            const points = (state.history as any[]).map((h, i) => {
              const hy = heightToY(h.position);
              const x = 40 + (i / 300) * 120;
              return `${x},${hy}`;
            }).join(" ");
            trailRef.current.setAttribute("points", points);
          } else {
            trailRef.current.setAttribute("points", "");
          }
        }

        if (timestampMs - simStateRef.current.lastMetricsUpdate > 200) {
          const metrics = calculatePidMetrics({ state, target, travelStartPos: simStateRef.current.travelStartPos });
          onMetricsUpdate({
            overshoot: metrics.overshootPercent,
            steadyStateError: metrics.steadyStateError,
            settlingTime: simStateRef.current.settlingTime
          });
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
  }, [isRunning, kp, ki, kd, target, mass, damping, onMetricsUpdate]);

  return (
    <div className="tool-canvas-frame">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="pid-svg"
        role="img"
        aria-label="Drone hovering at its current altitude, with a dashed line marking the target height"
        style={{ shapeRendering: "geometricPrecision", width: "100%", height: "240px", backgroundColor: "#050711", border: "1px solid #30395e" }}
      >
        <line x1="0" x2={VIEW_W} y1={GROUND_Y} y2={GROUND_Y} stroke="#3a4568" strokeWidth="3" />
        <line ref={targetLineRef} className="pid-target" x1="0" x2={VIEW_W} y1={GROUND_Y} y2={GROUND_Y} stroke="var(--pixel-gold)" strokeWidth="2" strokeDasharray="6 6" />
        <polyline ref={trailRef} className="pid-trail" fill="none" stroke="#55d5d855" strokeWidth="2" />

        <g ref={droneRef} transform={`translate(500, ${GROUND_Y})`}>
          <path ref={thrustRef} d="M -22 8 L -10 34 L 10 34 L 22 8 Z" fill="var(--pixel-cyan)" opacity="0.15" />
          <line x1="-30" y1="0" x2="30" y2="0" stroke="var(--ink)" strokeWidth="3" />
          <line x1="0" y1="-14" x2="0" y2="14" stroke="var(--ink)" strokeWidth="3" />
          <circle cx="-30" cy="0" r="9" fill="none" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="30" cy="0" r="9" fill="none" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="0" cy="-14" r="9" fill="none" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="0" cy="14" r="9" fill="none" stroke="var(--ink)" strokeWidth="2" />
          <rect x="-10" y="-8" width="20" height="16" rx="3" fill="var(--pixel-cyan)" />
        </g>
      </svg>
    </div>
  );
}
