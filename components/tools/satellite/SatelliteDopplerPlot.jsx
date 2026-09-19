"use client";
import { useEffect, useState } from "react";
import { svgCoord } from "../../../lib/tools/satellite/visuals.js";

export default function SatelliteDopplerPlot({ values, results }) {
  const [progress, setProgress] = useState(0),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    let frame, previous;
    const tick = (now) => {
      if (previous !== undefined) setProgress((p) => Math.min(1, p + (now - previous) / 4000));
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  useEffect(() => {
    if (progress >= 1) setPlaying(false);
  }, [progress]);
  const speed = Number(values.radialVelocityMps),
    direction = speed < 0 ? "Approaching" : speed > 0 ? "Receding" : "No radial motion";
  const total = Number(values.uplinkDistanceM) + Number(values.downlinkDistanceM);
  const split = total ? Number(values.uplinkDistanceM) / total : 0;
  const first = progress < split;
  const leg = first ? progress / split : split < 1 ? (progress - split) / (1 - split) : 1;
  const px = first ? 80 + 230 * leg : 310 + 230 * leg,
    py = first ? 290 - 85 * leg : 205 + 85 * leg;
  const sx = speed < 0 ? 500 - 250 * progress : speed > 0 ? 250 + 250 * progress : 375;
  const elapsed = results.oneWayDelayS * progress * 1000;
  return (
    <figure data-doppler-visual tabIndex={0}>
      <svg
        viewBox="0 0 620 355"
        role="img"
        aria-label={`${direction}. Doppler shift ${results.dopplerHz.toFixed(2)} Hz. Relay flight time ${(results.oneWayDelayS * 1000).toFixed(2)} milliseconds.`}
      >
        <title>Doppler direction and signal flight time</title>
        <text x="35" y="25">
          {direction} · Δf = {results.dopplerHz.toFixed(2)} Hz
        </text>
        <path d="M80 100H540" stroke="currentColor" strokeDasharray="4 4" />
        <rect x="65" y="85" width="30" height="30" fill="none" stroke="currentColor" />
        <circle data-doppler-satellite cx={svgCoord(sx)} cy="100" r="10" fill="currentColor" />
        <text x="35" y="145">
          Ground receiver
        </text>
        <text x="280" y="145">
          {speed === 0
            ? "Carrier unchanged"
            : speed < 0
              ? "Higher received frequency"
              : "Lower received frequency"}
        </text>
        <text x="35" y="185">
          Relay pulse · elapsed {elapsed.toFixed(2)} ms
        </text>
        <path d="M80 290L310 205L540 290" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="310" cy="205" r="5" fill="currentColor" />
        <circle
          data-delay-pulse
          cx={svgCoord(total ? px : 80)}
          cy={svgCoord(total ? py : 290)}
          r="7"
          fill="currentColor"
        />
        <text x="35" y="320">
          Station A
        </text>
        <text x="470" y="320">
          Station B
        </text>
        <text x="130" y="235">
          Uplink
        </text>
        <text x="425" y="235">
          Downlink
        </text>
        <text x="150" y="350">
          One way {(results.oneWayDelayS * 1000).toFixed(2)} ms · RTT{" "}
          {(results.roundTripDelayS * 1000).toFixed(2)} ms
        </text>
      </svg>
      <label>
        Signal flight progress
        <input
          aria-label="Signal flight progress"
          type="range"
          min="0"
          max="1"
          step=".01"
          value={progress}
          onChange={(e) => {
            setPlaying(false);
            setProgress(Number(e.target.value));
          }}
        />
      </label>
      <button
        type="button"
        onClick={() => {
          if (progress >= 1) setProgress(0);
          setPlaying((p) => !p);
        }}
      >
        {playing ? "Pause animation" : "Play animation"}
      </button>
      <figcaption>
        Motion is illustrative along the line of sight, not an orbital pass prediction. Positive
        radial velocity means recession. The pulse spends time on each leg in proportion to its
        distance; the drawn legs are schematic. Playback expands one computed relay flight to four
        seconds. No autoplay; use the slider for a motion-free view. Processing and network delays
        are excluded.
      </figcaption>
    </figure>
  );
}
