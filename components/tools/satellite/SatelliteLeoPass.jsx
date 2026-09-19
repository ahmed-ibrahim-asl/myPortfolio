"use client";
import { useState } from "react";
import { leoPass } from "../../../lib/tools/satellite/engine.js";
export default function SatelliteLeoPass({ frequencyHz, mode }) {
  const [altitude, setAltitude] = useState(800),
    [fraction, setFraction] = useState(0.5);
  const input = { altitudeM: altitude * 1000, frequencyHz, passFraction: fraction };
  const current = leoPass(input, mode);
  const samples = Array.from({ length: 101 }, (_, i) =>
    leoPass({ ...input, passFraction: i / 100 }, mode)
  );
  const peak = Math.max(...samples.map((p) => Math.abs(p.dopplerHz)), 1);
  const y = (p) => 145 - (p.dopplerHz / peak) * 85;
  const curve = samples.map((p, i) => `${i ? "L" : "M"}${60 + i * 5} ${y(p)}`).join(" ");
  return (
    <section data-leo-pass aria-label="LEO overhead pass model">
      <h3>LEO overhead pass</h3>
      <p>
        Circular orbit above a fixed station on a non-rotating spherical Earth. This is a teaching
        model, not a real satellite tracker.
      </p>
      <label>
        LEO altitude: {altitude} km
        <input
          aria-label="LEO altitude"
          type="range"
          min="200"
          max="2000"
          step="10"
          value={altitude}
          onChange={(e) => setAltitude(Number(e.target.value))}
        />
      </label>
      <label>
        Visible pass: {(fraction * 100).toFixed(0)}%
        <input
          aria-label="LEO pass position"
          type="range"
          min="0"
          max="1"
          step=".01"
          value={fraction}
          onChange={(e) => setFraction(Number(e.target.value))}
        />
      </label>
      <figure tabIndex={0}>
        <svg
          viewBox="0 0 620 300"
          role="img"
          aria-label={`Current Doppler ${current.dopplerHz.toFixed(1)} Hz, elevation ${current.elevationDeg.toFixed(1)} degrees.`}
        >
          <title>Doppler versus elapsed visible-pass time</title>
          <path d="M60 45V245H560M60 145H560" stroke="currentColor" fill="none" />
          <path d={curve} stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx={60 + 500 * fraction} cy={y(current)} r="6" fill="currentColor" />
          <text x="60" y="25">
            Doppler ±{(peak / 1000).toFixed(1)} kHz · zero at zenith
          </text>
          <text x="60" y="275">
            Rise: approaching
          </text>
          <text x="405" y="275">
            Set: receding
          </text>
        </svg>
        <figcaption>
          Time {current.elapsedS.toFixed(1)} / {current.passDurationS.toFixed(1)} s · elevation{" "}
          {current.elevationDeg.toFixed(1)}° · range {(current.slantRangeM / 1000).toFixed(1)} km
        </figcaption>
      </figure>
      <p data-leo-result>
        Radial velocity {current.radialVelocityMps.toFixed(1)} m/s · Doppler{" "}
        {current.dopplerHz.toFixed(1)} Hz · orbital speed {current.orbitalSpeedMps.toFixed(1)} m/s
      </p>
      <p>
        At zenith radial velocity is zero while orbital speed is not. Uses the carrier frequency and
        constant mode selected above. Independent pass controls do not replace your entered radial
        velocity. Earth rotation, inclined/off-centre passes, drag and refraction are excluded.
      </p>
    </section>
  );
}
