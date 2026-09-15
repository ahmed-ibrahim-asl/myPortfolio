"use client";

import React, { useState, useMemo } from "react";
import { ToolShell } from "@/components/tools/ToolShell";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolSlider } from "@/components/tools/ToolSlider";
import { ToolResultCard } from "@/components/tools/ToolResultCard";
import { BATTERY_FIELD_RANGES, estimateBatteryLife, formatBatteryLife } from "@/lib/tools/battery-math";
import { BATTERY_CHIP_PRESETS, getBatteryChipPreset } from "@/lib/tools/battery-presets";

function rangeHint(name: keyof typeof BATTERY_FIELD_RANGES) {
  const range = BATTERY_FIELD_RANGES[name];
  return `Valid range ${range.min.toLocaleString()} to ${range.max.toLocaleString()} ${range.unit}`;
}

export default function BatteryEstimatorPage() {
  const [inputs, setInputs] = useState({
    capacityMah: 2000,
    usableCapacityPercent: 100,
    activeCurrentMa: 120,
    activeDurationMs: 500,
    wifiEnabled: true,
    wifiCurrentMa: 140,
    wifiDurationMs: 2000,
    sleepCurrentUa: 10,
    sleepDurationSec: 300
  });
  const [presetId, setPresetId] = useState("");
  const [presetBoardType, setPresetBoardType] = useState<"bareChipUa" | "devBoardUa">("devBoardUa");
  const [notices, setNotices] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value)
    }));
    if (notices[name]) setNotices((prev) => ({ ...prev, [name]: "" }));
  };

  // Number fields have no HTML max, so a visitor can type anything. On blur we clamp the
  // displayed value to the same range the calculation uses and say so - the calculation must
  // never use a number the visitor cannot see reflected in the field.
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof BATTERY_FIELD_RANGES;
    const range = BATTERY_FIELD_RANGES[name];
    if (!range) return;
    setInputs((prev) => {
      const raw = prev[name as keyof typeof prev] as number;
      if (!Number.isFinite(raw)) {
        setNotices((n) => ({ ...n, [name]: `${range.label} must be a number - reset to ${range.default.toLocaleString()} ${range.unit}.` }));
        return { ...prev, [name]: range.default };
      }
      const clamped = Math.max(range.min, Math.min(range.max, raw));
      if (clamped !== raw) {
        setNotices((n) => ({
          ...n,
          [name]: `${range.label} is capped to ${range.min.toLocaleString()} to ${range.max.toLocaleString()} ${range.unit}; set to ${clamped.toLocaleString()} ${range.unit}.`
        }));
        return { ...prev, [name]: clamped };
      }
      return prev;
    });
  };

  const activePreset = getBatteryChipPreset(presetId);

  const applyPreset = (nextPresetId: string, boardType: "bareChipUa" | "devBoardUa" = presetBoardType) => {
    setPresetId(nextPresetId);
    const preset = getBatteryChipPreset(nextPresetId);
    const value = preset ? preset[boardType] : null;
    if (typeof value === "number") {
      setInputs((prev) => ({ ...prev, sleepCurrentUa: value }));
    }
  };

  const results = useMemo(() => estimateBatteryLife(inputs), [inputs]);
  const effectiveCapacityMah = inputs.capacityMah * (inputs.usableCapacityPercent / 100);

  return (
    <ToolShell
      slug="battery-estimator"
      title="ESP32 Battery Life & Power Estimator"
      description="Estimate idealized battery life from repeating operating phases."
    >
      <div className="tool-controls battery-estimator">
        <section className="tool-phase-group" aria-labelledby="phase-battery">
          <h2 id="phase-battery" className="mono tool-phase-heading">BATTERY</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            <ToolInput
              label="Battery Capacity (mAh)"
              id="capacityMah"
              name="capacityMah"
              type="number"
              min={BATTERY_FIELD_RANGES.capacityMah.min}
              max={BATTERY_FIELD_RANGES.capacityMah.max}
              value={inputs.capacityMah}
              onChange={handleChange}
              onBlur={handleBlur}
              hint={rangeHint("capacityMah")}
              notice={notices.capacityMah}
            />
            <ToolSlider label="" id="capacityMahSlide" name="capacityMah" min="50" max="50000" step="10" value={inputs.capacityMah} onChange={handleChange} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            <ToolInput
              label="Usable Capacity (%)"
              id="usableCapacityPercent"
              name="usableCapacityPercent"
              type="number"
              min={BATTERY_FIELD_RANGES.usableCapacityPercent.min}
              max={BATTERY_FIELD_RANGES.usableCapacityPercent.max}
              value={inputs.usableCapacityPercent}
              onChange={handleChange}
              onBlur={handleBlur}
              hint="How much of the rated capacity is usable before cutoff voltage - derating for age, temperature, and discharge curve."
              notice={notices.usableCapacityPercent}
            />
            <ToolSlider label="" id="usableCapacityPercentSlide" name="usableCapacityPercent" min="10" max="100" step="1" value={inputs.usableCapacityPercent} onChange={handleChange} />
          </div>
        </section>

        <section className="tool-phase-group" aria-labelledby="phase-sleep">
          <h2 id="phase-sleep" className="mono tool-phase-heading">SLEEP</h2>

          <div className="tool-input" style={{ marginBottom: "4px" }}>
            <label htmlFor="chipPreset">
              Chip preset (optional)
              <select
                id="chipPreset"
                value={presetId}
                onChange={(e) => applyPreset(e.target.value)}
              >
                <option value="">Custom / manual entry</option>
                {BATTERY_CHIP_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.label}</option>
                ))}
              </select>
            </label>
          </div>

          {activePreset ? (
            typeof activePreset.bareChipUa === "number" ? (
              <div
                role="radiogroup"
                aria-label="Sleep-current source"
                style={{ display: "flex", gap: "8px", marginBottom: "4px" }}
              >
                {(["devBoardUa", "bareChipUa"] as const).map((boardType) => (
                  <label
                    key={boardType}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 10px",
                      border: "1px solid",
                      borderColor: presetBoardType === boardType ? "var(--pixel-cyan)" : "#354064",
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      color: presetBoardType === boardType ? "var(--pixel-cyan)" : "var(--muted)",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="radio"
                      name="presetBoardType"
                      value={boardType}
                      checked={presetBoardType === boardType}
                      onChange={() => {
                        setPresetBoardType(boardType);
                        applyPreset(presetId, boardType);
                      }}
                    />
                    {boardType === "devBoardUa"
                      ? `Typical dev board (${activePreset.devBoardUa}µA)`
                      : `Bare chip / datasheet (${activePreset.bareChipUa}µA)`}
                  </label>
                ))}
              </div>
            ) : null
          ) : null}

          {activePreset ? (
            <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "var(--muted)" }}>
              {activePreset.sourceNote}
            </p>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            <ToolInput
              label="Deep Sleep Draw (µA)"
              id="sleepCurrentUa"
              name="sleepCurrentUa"
              type="number"
              min={BATTERY_FIELD_RANGES.sleepCurrentUa.min}
              max={BATTERY_FIELD_RANGES.sleepCurrentUa.max}
              value={inputs.sleepCurrentUa}
              onChange={handleChange}
              onBlur={handleBlur}
              hint={rangeHint("sleepCurrentUa")}
              notice={notices.sleepCurrentUa}
            />
            <ToolSlider label="" id="sleepCurrentUaSlide" name="sleepCurrentUa" min="1" max="100000" step="1" value={inputs.sleepCurrentUa} onChange={handleChange} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            <ToolInput
              label="Sleep Duration (sec)"
              id="sleepDurationSec"
              name="sleepDurationSec"
              type="number"
              min={BATTERY_FIELD_RANGES.sleepDurationSec.min}
              max={BATTERY_FIELD_RANGES.sleepDurationSec.max}
              value={inputs.sleepDurationSec}
              onChange={handleChange}
              onBlur={handleBlur}
              hint={rangeHint("sleepDurationSec")}
              notice={notices.sleepDurationSec}
            />
            <ToolSlider label="" id="sleepDurationSecSlide" name="sleepDurationSec" min="1" max="604800" step="1" value={inputs.sleepDurationSec} onChange={handleChange} />
          </div>
        </section>

        <section className="tool-phase-group" aria-labelledby="phase-active">
          <h2 id="phase-active" className="mono tool-phase-heading">ACTIVE</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            <ToolInput
              label="Active Draw (mA)"
              id="activeCurrentMa"
              name="activeCurrentMa"
              type="number"
              min={BATTERY_FIELD_RANGES.activeCurrentMa.min}
              max={BATTERY_FIELD_RANGES.activeCurrentMa.max}
              value={inputs.activeCurrentMa}
              onChange={handleChange}
              onBlur={handleBlur}
              hint={rangeHint("activeCurrentMa")}
              notice={notices.activeCurrentMa}
            />
            <ToolSlider label="" id="activeCurrentMaSlide" name="activeCurrentMa" min="1" max="1000" step="1" value={inputs.activeCurrentMa} onChange={handleChange} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            <ToolInput
              label="Active Duration (ms)"
              id="activeDurationMs"
              name="activeDurationMs"
              type="number"
              min={BATTERY_FIELD_RANGES.activeDurationMs.min}
              max={BATTERY_FIELD_RANGES.activeDurationMs.max}
              value={inputs.activeDurationMs}
              onChange={handleChange}
              onBlur={handleBlur}
              hint={rangeHint("activeDurationMs")}
              notice={notices.activeDurationMs}
            />
            <ToolSlider label="" id="activeDurationMsSlide" name="activeDurationMs" min="1" max="60000" step="10" value={inputs.activeDurationMs} onChange={handleChange} />
          </div>
        </section>

        <section className="tool-phase-group" aria-labelledby="phase-wifi">
          <h2 id="phase-wifi" className="mono tool-phase-heading">WI-FI</h2>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--pixel-cyan)", fontSize: "0.8rem", textTransform: "uppercase" }}>
            <input type="checkbox" name="wifiEnabled" checked={inputs.wifiEnabled} onChange={handleChange} style={{ width: "20px", height: "20px" }} />
            Enable Wi-Fi Phase
          </label>

          {inputs.wifiEnabled && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                <ToolInput
                  label="Wi-Fi Draw (mA)"
                  id="wifiCurrentMa"
                  name="wifiCurrentMa"
                  type="number"
                  min={BATTERY_FIELD_RANGES.wifiCurrentMa.min}
                  max={BATTERY_FIELD_RANGES.wifiCurrentMa.max}
                  value={inputs.wifiCurrentMa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  hint={rangeHint("wifiCurrentMa")}
                  notice={notices.wifiCurrentMa}
                />
                <ToolSlider label="" id="wifiCurrentMaSlide" name="wifiCurrentMa" min="1" max="1000" step="1" value={inputs.wifiCurrentMa} onChange={handleChange} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                <ToolInput
                  label="Wi-Fi Duration (ms)"
                  id="wifiDurationMs"
                  name="wifiDurationMs"
                  type="number"
                  min={BATTERY_FIELD_RANGES.wifiDurationMs.min}
                  max={BATTERY_FIELD_RANGES.wifiDurationMs.max}
                  value={inputs.wifiDurationMs}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  hint={rangeHint("wifiDurationMs")}
                  notice={notices.wifiDurationMs}
                />
                <ToolSlider label="" id="wifiDurationMsSlide" name="wifiDurationMs" min="0" max="60000" step="10" value={inputs.wifiDurationMs} onChange={handleChange} />
              </div>
            </>
          )}
        </section>

        <div className="tool-result-card" style={{ padding: "16px", background: "rgba(255, 228, 166, 0.05)", borderColor: "#465176", marginTop: "16px" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
            <strong>Estimate, not a measurement:</strong> this assumes constant battery-side current in each phase. Real battery life varies with regulator losses, battery age, temperature, self-discharge, voltage limits, and radio behavior.
          </p>
        </div>
      </div>

      <div className="tool-results" aria-live="polite" aria-atomic="true" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {!results.ok ? (
          <div className="tool-result-card">
            <span className="hud-card-label mono" style={{ color: "var(--tool-error)" }}>ERROR</span>
            <div className="metric-value mono" style={{ fontSize: "1.5rem" }}>INVALID MODEL</div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Check inputs. Cannot calculate with zero energy or zero duration.</p>
          </div>
        ) : (
          <>
            <ToolResultCard
              label="ESTIMATED BATTERY LIFE"
              value={formatBatteryLife(results.totalDays as number).primary}
            >
              <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "8px" }}>
                Approximately {formatBatteryLife(results.totalDays as number).secondary}
              </div>

              <details style={{ marginTop: "14px" }}>
                <summary
                  className="mono"
                  style={{ cursor: "pointer", fontSize: "0.7rem", color: "var(--pixel-cyan)", textTransform: "uppercase" }}
                >
                  Show the math
                </summary>
                <ol
                  className="mono"
                  style={{
                    margin: "10px 0 0",
                    paddingLeft: "18px",
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                    lineHeight: 1.7
                  }}
                >
                  <li>
                    Usable capacity: {inputs.capacityMah} mAh &times; {inputs.usableCapacityPercent}% ={" "}
                    {effectiveCapacityMah.toFixed(0)} mAh
                  </li>
                  <li>
                    Active phase draw: {inputs.activeCurrentMa} mA &times; {(inputs.activeDurationMs / 1000).toFixed(2)}s ={" "}
                    {(results.phaseConsumptionMah as any).active.toPrecision(3)} mAh
                  </li>
                  {inputs.wifiEnabled ? (
                    <li>
                      Wi-Fi phase draw: {inputs.wifiCurrentMa} mA &times; {(inputs.wifiDurationMs / 1000).toFixed(2)}s ={" "}
                      {(results.phaseConsumptionMah as any).wifi.toPrecision(3)} mAh
                    </li>
                  ) : null}
                  <li>
                    Sleep phase draw: {(inputs.sleepCurrentUa / 1000).toFixed(4)} mA &times; {inputs.sleepDurationSec}s ={" "}
                    {(results.phaseConsumptionMah as any).sleep.toPrecision(3)} mAh
                  </li>
                  <li>
                    Total per cycle: {(results.cycleConsumptionMah as number).toPrecision(3)} mAh over{" "}
                    {(results.cycleDurationSec as number).toFixed(1)}s
                  </li>
                  <li>
                    Cycles until exhausted: {effectiveCapacityMah.toFixed(0)} mAh &divide;{" "}
                    {(results.cycleConsumptionMah as number).toPrecision(3)} mAh ={" "}
                    {Math.round(effectiveCapacityMah / (results.cycleConsumptionMah as number)).toLocaleString()} cycles
                  </li>
                  <li>
                    Total runtime: cycles &times; cycle length &divide; 3600 = {(results.totalHours as number).toFixed(1)} hours
                  </li>
                </ol>
              </details>
            </ToolResultCard>

            <ToolResultCard label="AVERAGE CURRENT" value={(results.averageCurrentMa as number).toFixed(2)} unit="mA" />
            
            <div className="tool-result-card">
              <span className="hud-card-label mono">ENERGY PER CYCLE</span>
              <div className="metric-value mono" style={{ fontSize: "1.5rem" }}>
                {(results.cycleConsumptionMah as number).toPrecision(3)} <span style={{ fontSize: "0.5em" }}>mAh</span>
              </div>
              <div style={{ display: "flex", height: "24px", width: "100%", marginTop: "12px", border: "1px solid #354064" }}>
                <div style={{ width: `${(results.phaseConsumptionMah as any).sleep / (results.cycleConsumptionMah as number) * 100}%`, background: "#30395e" }} title="Sleep" />
                <div style={{ width: `${(results.phaseConsumptionMah as any).active / (results.cycleConsumptionMah as number) * 100}%`, background: "var(--pixel-cyan)" }} title="Active" />
                <div style={{ width: `${(results.phaseConsumptionMah as any).wifi / (results.cycleConsumptionMah as number) * 100}%`, background: "var(--pixel-gold)" }} title="Wi-Fi" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase" }}>
                <span>Sleep: {((results.phaseConsumptionMah as any).sleep / (results.cycleConsumptionMah as number) * 100).toFixed(1)}%</span>
                <span>Active: {((results.phaseConsumptionMah as any).active / (results.cycleConsumptionMah as number) * 100).toFixed(1)}%</span>
                <span>Wi-Fi: {((results.phaseConsumptionMah as any).wifi / (results.cycleConsumptionMah as number) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <ToolResultCard label="CYCLES/DAY" value={Math.round(results.cyclesPerDay as number)} />
              <ToolResultCard label="ACTIVE TIME" value={(results.activeTimePercent as number).toFixed(2)} unit="%" />
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}
