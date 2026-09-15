"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ToolShell } from "@/components/tools/ToolShell";
import { ToolSlider } from "@/components/tools/ToolSlider";
import { ToolInput } from "@/components/tools/ToolInput";
import { DroneAltitudeViz } from "@/components/tools/DroneAltitudeViz";
import { LineFollowerViz } from "@/components/tools/LineFollowerViz";
import { ToolResultCard } from "@/components/tools/ToolResultCard";

type Vehicle = "drone" | "car";

interface Lesson {
  id: string;
  label: string;
  title: string;
  blurb: string;
  vehicle: Vehicle;
  vehicleLocked: boolean;
  lockedGains: { ki?: number; kd?: number };
}

const LESSONS: Lesson[] = [
  {
    id: "p-only",
    label: "1. P only",
    title: "Proportional only",
    blurb:
      "Kp alone pushes thrust toward the target height, proportional to how far away the drone is. Push it up and the climb gets faster - but watch STEADY-STATE ERR: gravity keeps pulling down, and a proportional controller always needs some remaining error to keep producing enough thrust to fight it. It never quite reaches the line.",
    vehicle: "drone",
    vehicleLocked: true,
    lockedGains: { ki: 0, kd: 0 }
  },
  {
    id: "add-integral",
    label: "2. Add I",
    title: "Adding integral",
    blurb:
      "Ki accumulates that leftover error over time and keeps adding thrust until it's gone - watch STEADY-STATE ERR drop toward zero, the drone finally holding the line. The trade-off shows up in OVERSHOOT: the accumulated thrust doesn't cut out the instant the target is reached, so the drone tends to climb past it before settling back down.",
    vehicle: "drone",
    vehicleLocked: true,
    lockedGains: { kd: 0 }
  },
  {
    id: "add-derivative",
    title: "Adding derivative",
    label: "3. Add D",
    blurb:
      "Kd reacts to how fast the height is changing, not the error itself - it acts as a brake on the climb. Raise it and watch OVERSHOOT come back down from where Lesson 2 left it, usually without giving back much of the SETTLING TIME improvement.",
    vehicle: "drone",
    vehicleLocked: true,
    lockedGains: {}
  },
  {
    id: "line-follower",
    title: "A different kind of system",
    label: "4. Line follower",
    blurb:
      "Same three-term controller, a completely different plant: instead of thrust fighting gravity on one axis, the output now steers a car around a curved track. Too little Kp and it drifts wide on every bend; crank Kp up with no Kd and watch it zig-zag across the line instead of tracking it smoothly - the exact same P/I/D trade-offs from Lessons 1 to 3, just steering instead of climbing.",
    vehicle: "car",
    vehicleLocked: true,
    lockedGains: {}
  },
  {
    id: "free",
    title: "Free tuning",
    label: "5. Your turn",
    blurb:
      "Everything unlocked, including which vehicle you fly or drive. Try to beat Lesson 3's settling time on the drone without overshoot climbing back above a few percent - or switch to the car and see how differently the same idea behaves when the job is steering instead of climbing.",
    vehicle: "drone",
    vehicleLocked: false,
    lockedGains: {}
  }
];

const DRONE_RESULT_GLOSSARY = {
  overshoot:
    "How far past the target height the drone climbs before settling - driven by momentum (or accumulated I) carrying past the setpoint.",
  settlingTime:
    "How long until the height stays within a small tolerance band of the target for a full second.",
  steadyStateError:
    "The remaining gap between the target height and the drone's height once it's no longer actively correcting."
};

const CAR_RESULT_GLOSSARY = {
  averageError: "The average distance between the car and the line over the last second - lower means tighter tracking.",
  maxError: "The single worst moment of drift from the line in the last second - a rough gauge of how wide the car swings on bends."
};

export default function PidSimulatorPage() {
  const [lessonId, setLessonId] = useState(LESSONS[0].id);
  const [droneParams, setDroneParams] = useState({
    kp: 2,
    ki: 0,
    kd: 0.5,
    target: 70,
    mass: 1,
    damping: 0.8
  });
  const [carParams, setCarParams] = useState({
    kp: 0.09,
    ki: 0.015,
    kd: 0.03,
    speed: 40
  });
  const [freeVehicle, setFreeVehicle] = useState<Vehicle>("drone");

  const [isRunning, setIsRunning] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [droneMetrics, setDroneMetrics] = useState({
    overshoot: 0,
    steadyStateError: 0,
    settlingTime: null as number | null
  });
  const [carMetrics, setCarMetrics] = useState({ averageAbsError: 0, maxAbsError: 0 });

  const lesson = useMemo(
    () => LESSONS.find((item) => item.id === lessonId) || LESSONS[0],
    [lessonId]
  );
  const vehicle = lesson.vehicleLocked ? lesson.vehicle : freeVehicle;

  const handleDroneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDroneParams({ ...droneParams, [e.target.name]: Number(e.target.value) });
  };
  const handleCarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarParams({ ...carParams, [e.target.name]: Number(e.target.value) });
  };

  const handleDroneMetricsUpdate = useCallback((newMetrics: any) => {
    setDroneMetrics(newMetrics);
  }, []);
  const handleCarMetricsUpdate = useCallback((newMetrics: any) => {
    setCarMetrics(newMetrics);
  }, []);

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
  };

  const selectLesson = (nextLessonId: string) => {
    const nextLesson = LESSONS.find((item) => item.id === nextLessonId);
    if (!nextLesson) return;
    setLessonId(nextLessonId);
    if (nextLesson.vehicle === "drone") {
      setDroneParams((prev) => ({
        ...prev,
        ...(typeof nextLesson.lockedGains.ki === "number" ? { ki: nextLesson.lockedGains.ki } : {}),
        ...(typeof nextLesson.lockedGains.kd === "number" ? { kd: nextLesson.lockedGains.kd } : {})
      }));
    }
    setResetTrigger((prev) => prev + 1);
  };

  const kiLocked = typeof lesson.lockedGains.ki === "number";
  const kdLocked = typeof lesson.lockedGains.kd === "number";

  return (
    <ToolShell
      slug="pid-simulator"
      title="Interactive PID Simulator"
      description="Five short lessons on proportional, integral, and derivative control - fly a drone to a target height, then steer a car around a curved track."
    >
      <div className="tool-controls pid-simulator">
        <h2 className="mono" style={{ fontSize: "0.8rem", color: "var(--pixel-gold)", margin: "0 0 8px" }}>LESSON</h2>
        <div
          role="tablist"
          aria-label="PID lessons"
          style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}
        >
          {LESSONS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={lesson.id === item.id}
              onClick={() => selectLesson(item.id)}
              className="button"
              style={{
                padding: "6px 10px",
                fontSize: "0.7rem",
                background: lesson.id === item.id ? "var(--gold-500)" : "transparent",
                color: lesson.id === item.id ? "#050711" : "var(--muted)",
                border: "1px solid",
                borderColor: lesson.id === item.id ? "var(--pixel-cyan)" : "#354064"
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          className="tool-result-card"
          style={{ padding: "12px 14px", marginBottom: "16px", borderColor: "#465176" }}
        >
          <span className="hud-card-label mono" style={{ color: "var(--pixel-gold)" }}>{lesson.title.toUpperCase()}</span>
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
            {lesson.blurb}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2 className="mono" style={{ fontSize: "0.8rem", color: "var(--pixel-gold)", margin: 0 }}>CONTROLLER TUNING</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`button ${isRunning ? 'text-button' : 'primary'}`}
              onClick={() => setIsRunning(!isRunning)}
              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
            >
              {isRunning ? "PAUSE" : "START"}
            </button>
            <button
              className="button text-button"
              onClick={handleReset}
              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
            >
              RESET
            </button>
          </div>
        </div>

        {!lesson.vehicleLocked ? (
          <div className="tool-input" style={{ marginBottom: "4px" }}>
            <label htmlFor="freeVehicle">
              Vehicle
              <select
                id="freeVehicle"
                value={freeVehicle}
                onChange={(e) => {
                  setFreeVehicle(e.target.value as Vehicle);
                  setResetTrigger((prev) => prev + 1);
                }}
              >
                <option value="drone">Drone - hold a target height</option>
                <option value="car">Car - follow a curved line</option>
              </select>
            </label>
          </div>
        ) : null}

        {vehicle === "drone" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <ToolInput label="Proportional (Kp)" id="kp" name="kp" type="number" step="0.01" value={droneParams.kp} onChange={handleDroneChange} />
              <ToolSlider label="" id="kpSlide" name="kp" min="0" max="10" step="0.01" value={droneParams.kp} onChange={handleDroneChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", opacity: kiLocked ? 0.4 : 1 }}>
              <ToolInput label={`Integral (Ki)${kiLocked ? " - locked at 0" : ""}`} id="ki" name="ki" type="number" step="0.001" value={droneParams.ki} onChange={handleDroneChange} disabled={kiLocked} />
              <ToolSlider label="" id="kiSlide" name="ki" min="0" max="2" step="0.001" value={droneParams.ki} onChange={handleDroneChange} disabled={kiLocked} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", opacity: kdLocked ? 0.4 : 1 }}>
              <ToolInput label={`Derivative (Kd)${kdLocked ? " - locked at 0" : ""}`} id="kd" name="kd" type="number" step="0.01" value={droneParams.kd} onChange={handleDroneChange} disabled={kdLocked} />
              <ToolSlider label="" id="kdSlide" name="kd" min="0" max="5" step="0.01" value={droneParams.kd} onChange={handleDroneChange} disabled={kdLocked} />
            </div>

            <h2 className="mono" style={{ fontSize: "0.8rem", color: "var(--pixel-gold)", margin: "16px 0 0" }}>DRONE</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <ToolInput label="Target Height (%)" id="target" name="target" type="number" value={droneParams.target} onChange={handleDroneChange} />
              <ToolSlider label="" id="targetSlide" name="target" min="10" max="90" step="1" value={droneParams.target} onChange={handleDroneChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <ToolInput label="Drone Mass (kg)" id="mass" name="mass" type="number" step="0.1" value={droneParams.mass} onChange={handleDroneChange} />
              <ToolSlider label="" id="massSlide" name="mass" min="0.5" max="5" step="0.1" value={droneParams.mass} onChange={handleDroneChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <ToolInput label="Air Damping" id="damping" name="damping" type="number" step="0.05" value={droneParams.damping} onChange={handleDroneChange} />
              <ToolSlider label="" id="dampingSlide" name="damping" min="0" max="5" step="0.05" value={droneParams.damping} onChange={handleDroneChange} />
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <ToolInput label="Proportional (Kp)" id="carKp" name="kp" type="number" step="0.005" value={carParams.kp} onChange={handleCarChange} />
              <ToolSlider label="" id="carKpSlide" name="kp" min="0" max="0.5" step="0.005" value={carParams.kp} onChange={handleCarChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <ToolInput label="Integral (Ki)" id="carKi" name="ki" type="number" step="0.001" value={carParams.ki} onChange={handleCarChange} />
              <ToolSlider label="" id="carKiSlide" name="ki" min="0" max="0.15" step="0.001" value={carParams.ki} onChange={handleCarChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <ToolInput label="Derivative (Kd)" id="carKd" name="kd" type="number" step="0.005" value={carParams.kd} onChange={handleCarChange} />
              <ToolSlider label="" id="carKdSlide" name="kd" min="0" max="0.3" step="0.005" value={carParams.kd} onChange={handleCarChange} />
            </div>

            <h2 className="mono" style={{ fontSize: "0.8rem", color: "var(--pixel-gold)", margin: "16px 0 0" }}>CAR</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <ToolInput label="Forward Speed" id="speed" name="speed" type="number" step="1" value={carParams.speed} onChange={handleCarChange} />
              <ToolSlider label="" id="speedSlide" name="speed" min="10" max="80" step="1" value={carParams.speed} onChange={handleCarChange} />
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {vehicle === "drone" ? (
          <DroneAltitudeViz
            kp={droneParams.kp}
            ki={droneParams.ki}
            kd={droneParams.kd}
            target={droneParams.target}
            mass={droneParams.mass}
            damping={droneParams.damping}
            isRunning={isRunning}
            resetTrigger={resetTrigger}
            onMetricsUpdate={handleDroneMetricsUpdate}
          />
        ) : (
          <LineFollowerViz
            kp={carParams.kp}
            ki={carParams.ki}
            kd={carParams.kd}
            speed={carParams.speed}
            isRunning={isRunning}
            resetTrigger={resetTrigger}
            onMetricsUpdate={handleCarMetricsUpdate}
          />
        )}

        {vehicle === "drone" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
            <ToolResultCard label="OVERSHOOT" value={droneMetrics.overshoot.toFixed(1)} unit="%">
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                {DRONE_RESULT_GLOSSARY.overshoot}
              </p>
            </ToolResultCard>
            <ToolResultCard
              label="SETTLING TIME"
              value={droneMetrics.settlingTime !== null ? droneMetrics.settlingTime.toFixed(2) : "-"}
              unit={droneMetrics.settlingTime !== null ? "s" : ""}
            >
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                {DRONE_RESULT_GLOSSARY.settlingTime}
              </p>
            </ToolResultCard>
            <ToolResultCard label="STEADY-STATE ERR" value={droneMetrics.steadyStateError.toFixed(2)} unit="%">
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                {DRONE_RESULT_GLOSSARY.steadyStateError}
              </p>
            </ToolResultCard>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
            <ToolResultCard label="AVG TRACKING ERROR" value={carMetrics.averageAbsError.toFixed(1)} unit="units">
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                {CAR_RESULT_GLOSSARY.averageError}
              </p>
            </ToolResultCard>
            <ToolResultCard label="MAX TRACKING ERROR" value={carMetrics.maxAbsError.toFixed(1)} unit="units">
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                {CAR_RESULT_GLOSSARY.maxError}
              </p>
            </ToolResultCard>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
