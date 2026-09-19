"use client";
import { noiseContributions, powerAtFraction, svgCoord, svgPoint } from "../../../lib/tools/satellite/visuals.js";
export function NoisePlot({ values }) {
  const rows = noiseContributions(values.stages, values.referenceTemperatureK);
  const total = rows.reduce((sum, row) => sum + row.inputK, 0);
  return (
    <figure data-noise-contributions tabIndex={0}>
      <svg
        viewBox={`0 0 620 ${100 + rows.length * 65}`}
        role="img"
        aria-label={`Input-referred noise contributions, total ${total.toFixed(2)} Kelvin`}
      >
        <title>Receiver-stage input-referred noise</title>
        <text x="35" y="30">
          Total equivalent temperature: {total.toFixed(3)} K
        </text>
        {rows.map((r, i) => (
          <g key={r.stage}>
            <text x="35" y={65 + i * 65}>
              Stage {r.stage}: {r.localK.toFixed(2)} K ÷ {r.precedingGain.toPrecision(4)} ={" "}
              {r.inputK.toFixed(3)} K
            </text>
            <rect
              data-noise-stage={r.stage}
              x="35"
              y={75 + i * 65}
              width={svgCoord(total > 0 ? (550 * r.inputK) / total : 0)}
              height="20"
              fill="currentColor"
              opacity=".6"
            />
          </g>
        ))}
      </svg>
      <figcaption>
        Every bar is referred to the cascade input. A later stage’s equivalent temperature is
        divided by the product of preceding linear power gains. Change the first stage gain to see
        later contributions change. The first stage’s own contribution is not divided by its gain.
      </figcaption>
    </figure>
  );
}
export function PowerPlot({ values, results }) {
  const max = Math.max(results.bolPowerW, values.requiredPowerW, 1) * 1.12;
  const y = (p) => 225 - (p / max) * 180;
  const path = Array.from(
    { length: 61 },
    (_, i) =>
      `${i ? "L" : "M"}${svgPoint(70 + (500 * i) / 60, y(powerAtFraction(values, results, i / 60)))}`
  ).join(" ");
  return (
    <figure data-power-plot tabIndex={0}>
      <svg
        viewBox="0 0 620 300"
        role="img"
        aria-label={`Power timeline from ${results.bolPowerW.toFixed(1)} to ${results.eolPowerW.toFixed(1)} watts`}
      >
        <title>Solar-array power over mission lifetime</title>
        <path d="M70 40V225H580" stroke="currentColor" fill="none" />
        <path data-power-curve d={path} stroke="currentColor" strokeWidth="3" fill="none" />
        <path
          d={`M70 ${svgCoord(y(values.requiredPowerW))}H580`}
          stroke="currentColor"
          strokeDasharray="5 5"
        />
        <text x="70" y="28">
          BOL: {results.bolPowerW.toFixed(1)} W → EOL: {results.eolPowerW.toFixed(1)} W
        </text>
        <text x="70" y="252">
          Start
        </text>
        <text x="490" y="252">
          {values.powerMode === "annual" ? `${values.years} years` : "Mission end"}
        </text>
        <text x="70" y="280">
          Required at EOL: {values.requiredPowerW} W ·{" "}
          {results.eolPowerW >= values.requiredPowerW ? "Requirement met" : "Power shortfall"}
        </text>
      </svg>
      <figcaption>
        {values.powerMode === "annual"
          ? "Annual degradation compounds over mission time."
          : "The total-degradation model specifies endpoints only; the straight connecting line is an illustrative interpolation, not a measured degradation law."}{" "}
        The dashed line marks the required end-of-life load.
      </figcaption>
    </figure>
  );
}
