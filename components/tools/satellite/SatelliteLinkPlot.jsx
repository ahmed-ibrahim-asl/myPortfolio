"use client";
import { linkVisual } from "../../../lib/tools/satellite/link-visual.js";
export default function SatelliteLinkPlot({ values, mode }) {
  const panels = linkVisual(values, mode);
  return (
    <section aria-label="Link budget waterfalls">
      {panels.map((panel) => {
        const all = panel.rows.flatMap((r) => [r.start, r.end]);
        const min = Math.min(0, ...all) - 10,
          max = Math.max(0, ...all) + 10;
        const y = (v) => 45 + ((max - v) / (max - min)) * 170;
        const width = 500 / panel.rows.length;
        return (
          <figure key={panel.title} data-link-waterfall tabIndex={0}>
            <h3>{panel.title}</h3>
            <svg
              viewBox="0 0 620 310"
              role="img"
              aria-label={`${panel.title}, cumulative ${panel.unit}`}
            >
              <title>{panel.title}</title>
              <path
                d={`M50 ${y(0)}H580`}
                stroke="currentColor"
                strokeDasharray="4 4"
                opacity=".5"
              />
              {panel.rows.map((r, i) => (
                <g key={r.label}>
                  <rect
                    x={60 + i * width}
                    y={Math.min(y(r.start), y(r.end))}
                    width={width - 12}
                    height={Math.max(1, Math.abs(y(r.end) - y(r.start)))}
                    fill="currentColor"
                    fillOpacity={r.delta < 0 ? 0.25 : 0.65}
                    stroke="currentColor"
                  >
                    <title>
                      {`${r.label}: ${r.delta.toFixed(2)} dB; cumulative ${r.end.toFixed(2)}`}
                    </title>
                  </rect>
                  <text x={60 + i * width} y="240" transform={`rotate(30 ${60 + i * width} 240)`}>
                    {r.label}
                  </text>
                  <text x={60 + i * width} y={Math.max(25, Math.min(y(r.start), y(r.end)) - 8)}>
                    {r.end.toFixed(1)}
                  </text>
                </g>
              ))}
            </svg>
            <figcaption>
              Final {panel.rows.at(-1).end.toFixed(3)} {panel.unit}. Each bar begins at the previous
              cumulative value; gain raises it and loss lowers it.{" "}
              {values.linkMode === "standard"
                ? "Intermediate terms form a C/N₀ equation, not standalone powers."
                : "Losses are applied once; feeder and extra path losses are separate from free-space loss."}
            </figcaption>
          </figure>
        );
      })}
    </section>
  );
}
