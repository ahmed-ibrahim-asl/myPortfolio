"use client";

import { useEffect, useState } from "react";
import { formatEngineering } from "@/lib/units";
import { Timer555Diagram } from "./diagrams/Timer555Diagram";
import styles from "./Timer555Behavior.module.css";

export function Timer555Behavior({ mode, high, low = 0 }) {
  const repeating = mode === "astable";
  const valid = Number.isFinite(high) && high > 0 && (!repeating || (Number.isFinite(low) && low > 0));
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  // Display time is deliberately bounded so microsecond pulses remain visible.
  const duration = Math.min(5, Math.max(1.5, high || 1.5));
  useEffect(() => {
    if (!running) return;
    const timeout = setTimeout(() => { setRunning(false); setFinished(true); }, duration * 1000);
    return () => clearTimeout(timeout);
  }, [running, duration]);
  const duty = valid ? high / (high + low) : 0.5;
  let path = "M 45 130";
  for (let i = 0; i < 3; i++) {
    const x = 45 + i * 140;
    const end = x + 140 * duty;
    path += ` L ${x} 55 L ${end} 55 L ${end} 130 L ${x + 140} 130`;
  }
  return <section className={styles.behavior} aria-label={`${mode} behavior preview`}>
    <h2>{repeating ? "Keeps pulsing" : "One trigger. One pulse."}</h2>
    <p>{repeating ? "Runs automatically: HIGH → LOW → repeat." : "Press Trigger. The output goes HIGH, then returns LOW and waits."}</p>
    <svg viewBox="0 0 510 170" role="img" aria-label={repeating ? "Three repeating output cycles" : "One output pulse following a short low trigger"}>
      <text x="8" y="58">HIGH</text><text x="8" y="134">LOW</text>
      <path d="M45 145H485" className={styles.axis}/>
      {repeating ? <>
        <path d={path} className={styles.output}/>
        {valid && <line x1="45" y1="35" x2="45" y2="145" className={styles.cursor} style={{animationPlayState:paused ? "paused" : "running"}}/>}
      </> : <>
        <path d="M45 15H110V30H135V15H485" className={styles.trigger}/>
        <path d="M45 130H110V55H390V130H485" className={styles.reference}/>
        <path d={running || finished ? "M45 130H110V55H390V130H485" : "M45 130H485"} className={styles.output}/>
        {running && <line x1="110" y1="40" x2="110" y2="145" className={styles.once} style={{animationDuration:`${duration}s`}}/>}
      </>}
      <text x="460" y="165">Time</text>
    </svg>
    {repeating && <div className={styles.actions}><button type="button" disabled={!valid} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume preview" : "Pause preview"}</button></div>}
    {!repeating && <div className={styles.actions}>
      <button type="button" disabled={!valid || running} onClick={() => { setFinished(false); setRunning(true); }}>Trigger pulse</button>
      <span role="status">{!valid ? "Enter positive R and C" : running ? "HIGH: pulse active" : finished ? "LOW: complete; waiting for trigger" : "LOW: waiting for trigger"}</span>
    </div>}
    <p className={styles.timing}>{valid ? (repeating ? `HIGH ${formatEngineering(high,"s")} · LOW ${formatEngineering(low,"s")} · repeats continuously` : `Calculated pulse: ${formatEngineering(high,"s")}`) : "Enter positive component values to preview timing."}</p>
    <small>{repeating ? "Illustrative playback; each displayed cycle is 1 second. HIGH/LOW proportions follow your inputs." : `Illustrative playback: ${duration.toFixed(1)} seconds on screen. Use the calculated pulse duration for the circuit.`}</small>
    <div className={styles.circuit}>
      <h3>NE555 circuit &amp; pin connections</h3>
      <Timer555Diagram mode={mode}/>
    </div>
  </section>;
}
