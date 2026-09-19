"use client";
import { fdmaAllocation, tdmaBurstLayout } from "../../../lib/tools/satellite/visuals.js";
export function FdmaPlot({ values }) {
  const a = fdmaAllocation(values),
    shown = Math.min(6, a.count),
    zoomSlots = Math.max(1, shown);
  const occupied = (520 * a.occupiedHz) / values.transponderBandwidthHz;
  return (
    <figure data-fdma-plot tabIndex={0}>
      <svg
        viewBox="0 0 620 330"
        role="img"
        aria-label={`${a.count} complete channels and ${a.unusedHz} Hz unused`}
      >
        <title>FDMA frequency allocation</title>
        <text x="50" y="28">
          Full transponder: {(values.transponderBandwidthHz / 1e6).toFixed(3)} MHz
        </text>
        <rect x="50" y="48" width="520" height="35" fill="none" stroke="currentColor" />
        <rect x="50" y="48" width={occupied} height="35" fill="currentColor" opacity=".35" />
        <text x="50" y="107">
          {a.count} complete slots · unused {(a.unusedHz / 1000).toFixed(3)} kHz
        </text>
        <text x="50" y="145">
          Zoom: {shown ? `first ${shown} slots` : "no complete slot fits"}
        </text>
        {Array.from({ length: shown }, (_, i) => {
          const slotWidth = 520 / zoomSlots,
            guardWidth = (slotWidth * a.guardHz) / a.slotHz;
          return (
            <g key={i}>
              <rect
                x={50 + i * slotWidth}
                y="170"
                width={slotWidth - guardWidth}
                height="60"
                fill="currentColor"
                opacity=".35"
                stroke="currentColor"
              />
              <rect
                data-fdma-guard
                x={50 + (i + 1) * slotWidth - guardWidth}
                y="170"
                width={guardWidth}
                height="60"
                fill="currentColor"
                opacity=".8"
              />
              <text x={60 + i * slotWidth} y="206">
                CH {i + 1}
              </text>
            </g>
          );
        })}
        <text x="50" y="260">
          Each slot: {(a.slotHz / 1000).toFixed(3)} kHz
        </text>
        <text x="50" y="287">
          Dark strip: {(a.guardHz / 1000).toFixed(3)} kHz extra guard / slot
        </text>
        <text x="50" y="314">
          Frequency →
        </text>
      </svg>
      <figcaption>
        The upper bar shows the whole transponder; the lower view magnifies the first slots. Channel
        spacing may already include a guard; only additional entered guards are drawn separately.
        This bandwidth ceiling does not guarantee adequate transponder power.
      </figcaption>
    </figure>
  );
}
export function TdmaBursts({ values }) {
  return (
    <section aria-label="TDMA burst structure">
      {tdmaBurstLayout(values)
        .filter((row) => row.count > 0)
        .map((row) => {
          const bits = row.parts.reduce((n, p) => n + p.bits, 0);
          let x = 50;
          return (
            <figure key={row.label} tabIndex={0}>
              <svg
                viewBox="0 0 620 190"
                role="img"
                aria-label={`${row.label} repeated ${row.count} times`}
              >
                <title>{`${row.label} structure`}</title>
                <text x="50" y="28">
                  {row.label} × {row.count} / frame
                </text>
                {row.parts.map((part, i) => {
                  const width = bits ? (520 * part.bits) / bits : 0,
                    start = x;
                  x += width;
                  return (
                    <rect
                      key={part.label}
                      x={start}
                      y="48"
                      width={width}
                      height="45"
                      fill="currentColor"
                      fillOpacity={0.25 + 0.25 * i}
                      stroke="currentColor"
                    >
                      <title>{`${part.label}: ${part.bits.toFixed(2)} bits`}</title>
                    </rect>
                  );
                })}
                {row.parts.map((part, i) => (
                  <text key={part.label} x="50" y={117 + i * 24}>
                    {part.label}: {part.bits.toFixed(2)} bits
                  </text>
                ))}
              </svg>
              <figcaption>
                Magnified burst structure, read left to right.{" "}
                {row.label === "Traffic burst"
                  ? "Available payload time is divided equally among traffic terminals for this illustration; real networks may schedule unequal allocations."
                  : "Burst components use the selected overhead convention."}
              </figcaption>
            </figure>
          );
        })}
    </section>
  );
}
