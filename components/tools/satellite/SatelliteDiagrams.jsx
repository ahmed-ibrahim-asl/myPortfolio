"use client";
import { AntennaPlot, TdmaPlot, OrbitPlot, LookAnglePlot } from "./SatelliteLivePlots";
import { NoisePlot, PowerPlot } from "./SatelliteNoisePowerPlots";
import { FdmaPlot, TdmaBursts } from "./SatelliteAccessPlots";
import SatelliteConceptDiagrams from "./SatelliteConceptDiagrams";
import SatelliteDopplerPlot from "./SatelliteDopplerPlot";
import SatelliteLeoPass from "./SatelliteLeoPass";

function Frame({ title, description, children }) {
  return (
    <figure tabIndex={0}>
      <svg viewBox="0 0 620 260" role="img" aria-label={`${title}. ${description}`}>
        <title>{title}</title>
        <desc>{description}</desc>
        <defs>
          <marker id="sat-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0 0L6 3L0 6" fill="currentColor" />
          </marker>
        </defs>
        {children}
      </svg>
      <figcaption>{description}</figcaption>
    </figure>
  );
}
function Station({ x, y, label }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-25 -18Q0 22 25 -18M0 0V25M-15 25H15M0 -2L18 -32"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <text y="49" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}
function Satellite({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-12" y="-12" width="24" height="24" rx="3" fill="currentColor" />
      <path
        d="M-18 -14H-54V14H-18M18 -14H54V14H18M-36 -14V14M36 -14V14"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
      />
    </g>
  );
}
export function SignalPath({ values = {}, pulse = false }) {
  return (
    <Frame
      title="Satellite signal path"
      description="An Earth transmitter sends the uplink to an active satellite. The transponder translates or processes the signal and sends the downlink to the receiving Earth station."
    >
      <path
        d="M95 178L310 52L525 178"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray="7 5"
      />
      <Station x={95} y={177} label="Ground TX" />
      <Satellite x={310} y={52} />
      <Station x={525} y={177} label="Ground RX" />
      <text x="168" y="95">
        Uplink
      </text>
      <text x="408" y="95">
        Downlink
      </text>
      <text x="310" y="105" textAnchor="middle">
        Transponder
      </text>
      {pulse && (
        <circle cx="95" cy="177" r="6" fill="currentColor">
          <animateMotion path="M0 0L215 -125L430 0" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
      <text x="310" y="212" textAnchor="middle">
        RF propagation ≈ speed of light
      </text>
    </Frame>
  );
}
export default function SatelliteDiagrams({ slug, values = {}, results = {}, mode = "course" }) {
  if (slug === "doppler-delay")
    return (
      <>
        <SatelliteDopplerPlot values={values} results={results} />
        <SatelliteLeoPass frequencyHz={values.frequencyHz} mode={mode} />
      </>
    );
  if (["subsystems", "transponders"].includes(slug))
    return <SatelliteConceptDiagrams slug={slug} />;
  if (slug === "orbit") return <OrbitPlot values={values} results={results} />;
  if (slug === "look-angles") return <LookAnglePlot results={results} />;
  if (slug === "antenna") return <AntennaPlot values={values} results={results} />;
  if (slug === "noise-gt" && values.noiseMode === "cascade") return <NoisePlot values={values} />;
  if (slug === "noise-gt")
    return (
      <Frame
        title="Receiver noise cascade"
        description="Noise added by later stages is divided by the preceding power gains when referred to the input. A low-noise first stage strongly influences the full receiver."
      >
        <Station x={70} y={90} label="Antenna T" />
        {["Feeder loss", "First LNA", "Receiver"].map((s, i) => (
          <g key={s}>
            <rect
              x={150 + i * 145}
              y="65"
              width="120"
              height="70"
              rx="5"
              fill="none"
              stroke="currentColor"
            />
            <text x={210 + i * 145} y="104" textAnchor="middle">
              {s}
            </text>
            <path
              d={`M${130 + i * 145} 100H${150 + i * 145}`}
              stroke="currentColor"
              markerEnd="url(#sat-arrow)"
            />
            <path
              d={`M${210 + i * 145} 195V140`}
              stroke="currentColor"
              markerEnd="url(#sat-arrow)"
            />
            <text x={210 + i * 145} y="222" textAnchor="middle">
              Added noise
            </text>
          </g>
        ))}
      </Frame>
    );
  if (slug === "multiple-access") {
    if (values.accessMode === "tdma")
      return (
        <>
          <TdmaPlot values={values} />
          <TdmaBursts values={values} />
        </>
      );
    if (["fdma", "scpc"].includes(values.accessMode)) return <FdmaPlot values={values} />;
    const tdma = values.accessMode === "tdma";
    const fdma = values.accessMode === "fdma" || values.accessMode === "scpc";
    return (
      <Frame
        title={
          tdma ? "TDMA frame timeline" : fdma ? "FDMA frequency slots" : "CDMA spreading codes"
        }
        description={
          tdma
            ? "Reference bursts, guard intervals and preambles consume frame capacity. The remaining bits carry traffic."
            : fdma
              ? "Separate carriers occupy separate frequency slots. Guard bands prevent adjacent-channel interference."
              : "Users share time and frequency resources with distinct spreading codes. Orthogonal codes can separate ideal synchronized signals."
        }
      >
        {Array.from({ length: tdma ? 5 : fdma ? 7 : 4 }, (_, i) => (
          <g key={i}>
            <rect
              x={45 + i * (tdma ? 108 : fdma ? 77 : 132)}
              y="75"
              width={tdma ? 100 : fdma ? 65 : 118}
              height="75"
              fill="currentColor"
              opacity={i === 0 ? 0.22 : 0.1}
            />
            <rect
              x={45 + i * (tdma ? 108 : fdma ? 77 : 132)}
              y="75"
              width={tdma ? 100 : fdma ? 65 : 118}
              height="75"
              fill="none"
              stroke="currentColor"
            />
            <text x={55 + i * (tdma ? 108 : fdma ? 77 : 132)} y="117">
              {tdma
                ? i === 0
                  ? "Reference"
                  : `Traffic ${i}`
                : fdma
                  ? `CH ${i + 1}`
                  : ["+ + + +", "+ − + −", "+ + − −", "+ − − +"][i]}
            </text>
          </g>
        ))}
        <path d="M45 190H570" stroke="currentColor" markerEnd="url(#sat-arrow)" />
        <text x="300" y="220" textAnchor="middle">
          {tdma
            ? "Time → one repeating frame"
            : fdma
              ? "Frequency → transponder bandwidth"
              : "Distinct orthogonal code sequences"}
        </text>
      </Frame>
    );
  }
  if (slug === "power-lifetime") return <PowerPlot values={values} results={results} />;
  return null;
}
