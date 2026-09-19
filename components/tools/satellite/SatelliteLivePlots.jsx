"use client";
import { useState } from "react";
import {
  relativeBeamPower,
  buildAntennaPattern,
  tdmaSegments,
  orbitPosition,
  orbitSweep,
  svgCoord,
  svgPoint,
  svgPoints
} from "../../../lib/tools/satellite/visuals.js";

export function OrbitPlot({ values, results }) {
  const [fraction, setFraction] = useState(0);
  if (values.orbitMode === "coverage") return <CoveragePlot values={values} results={results} />;
  if (values.orbitMode === "vis-viva")
    return (
      <figure>
        <figcaption>
          Vis-viva determines speed from instantaneous radius and semi-major axis. Those two inputs
          alone do not determine eccentricity or orbital phase, so no unique orbit is drawn.
        </figcaption>
      </figure>
    );
  const e = results.eccentricity || 0;
  const a =
    results.semiMajorAxisM ||
    results.radiusM ||
    Number(values.earthRadiusM) + Number(values.altitudeM);
  const scale = 100;
  const earthX = 310 + e * scale;
  const position = orbitPosition(e, fraction);
  const x = earthX + position.x * scale,
    y = 135 - position.y * scale;
  const earthSize = Math.max(4, Math.min(95, (Number(values.earthRadiusM || 6371e3) / a) * scale));
  const sector = svgPoints(
    orbitSweep(e, fraction, Math.min(0.05, 1 - fraction)).map((p) => [
      earthX + p.x * scale,
      135 - p.y * scale
    ])
  );
  return (
    <figure data-orbit-plot tabIndex={0}>
      <svg
        viewBox="0 0 620 300"
        role="img"
        aria-label={`Orbit at ${(fraction * 100).toFixed(0)} percent of its period, eccentricity ${e.toFixed(3)}`}
      >
        <title>Orbit geometry and equal-time sweep</title>
        <ellipse
          cx="310"
          cy="135"
          rx={scale}
          ry={svgCoord(scale * Math.sqrt(1 - e * e))}
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <polygon points={`${svgPoint(earthX, 135)} ${sector}`} fill="currentColor" opacity=".25" />
        {[0, 0.5].map((start, i) => (
          <polygon
            key={start}
            data-equal-area-sector={i + 1}
            points={`${svgPoint(earthX, 135)} ${svgPoints(
              orbitSweep(e, start, 0.05).map((p) => [earthX + p.x * scale, 135 - p.y * scale])
            )}`}
            fill="currentColor"
            fillOpacity={i === 0 ? 0.35 : 0.12}
            stroke="currentColor"
            strokeDasharray={i === 0 ? undefined : "3 3"}
          />
        ))}
        <circle cx={svgCoord(earthX)} cy="135" r={svgCoord(earthSize)} fill="currentColor" opacity=".2" />
        <circle cx={svgCoord(earthX)} cy="135" r="3" fill="currentColor" />
        <path d={`M${svgCoord(earthX)} 135L${svgCoord(x)} ${svgCoord(y)}`} stroke="currentColor" />
        <circle data-orbit-satellite cx={svgCoord(x)} cy={svgCoord(y)} r="6" fill="currentColor" />
        <text x="40" y="26">
          e = {e.toFixed(4)} · Earth at one focus
        </text>
        <text x="40" y="263">
          Radius = {((position.radius * a) / 1000).toFixed(1)} km
        </text>
        <text x="40" y="286">
          Shaded sweep: next {Math.min(5, (1 - fraction) * 100).toFixed(0)}% of period
        </text>
        <text x="195" y="245">
          Apogee
        </text>
        <text x="380" y="245">
          Perigee
        </text>
      </svg>
      <label>
        Elapsed fraction of one orbit
        <input
          aria-label="Orbit time fraction"
          type="range"
          min="0"
          max="1"
          step=".01"
          value={fraction}
          onChange={(event) => setFraction(Number(event.target.value))}
        />
      </label>
      <figcaption>
        Solid outline near perigee and dashed outline near apogee each span 5% of the orbital period
        and enclose equal areas. A longer angular sweep near perigee compensates for the shorter
        radius. The moving shaded sector follows the time slider. Move time forward to compare
        equal-duration sweeps. Kepler’s equation places the satellite faster near perigee and slower
        near apogee. Earth and orbit share the same length scale (Earth minimum marker enlarged for
        very distant orbits). No atmospheric drag or perturbations are modeled.
      </figcaption>
    </figure>
  );
}

export function CoveragePlot({ values, results }) {
  const theta = results.centralAngleRad;
  const earth = Number(values.earthRadiusM || 6371e3);
  const orbitalRadius = earth + Number(values.altitudeM);
  const scale = 220 / (orbitalRadius + earth);
  const r = earth * scale,
    cx = 230,
    cy = 270 - r;
  const satelliteY = cy - orbitalRadius * scale;
  const dx = r * Math.sin(theta),
    boundaryY = cy - r * Math.cos(theta);
  const cap = `M${svgCoord(cx - dx)} ${svgCoord(boundaryY)} A${svgCoord(r)} ${svgCoord(r)} 0 0 1 ${svgCoord(cx + dx)} ${svgCoord(boundaryY)} Z`;
  const summary = `Central angle ${results.centralAngleDeg.toFixed(2)}°, surface coverage ${(results.coverageFraction * 100).toFixed(2)}%, minimum elevation ${Number(values.minimumElevationDeg).toFixed(1)}°.`;
  return (
    <figure data-coverage-plot tabIndex={0}>
      <svg viewBox="0 0 620 330" role="img" aria-label={summary}>
        <title>Satellite surface coverage cross-section</title>
        <circle cx={svgCoord(cx)} cy={svgCoord(cy)} r={svgCoord(r)} fill="currentColor" opacity=".08" />
        <circle cx={svgCoord(cx)} cy={svgCoord(cy)} r={svgCoord(r)} fill="none" stroke="currentColor" />
        <path data-coverage-cap d={cap} fill="currentColor" opacity=".45" />
        <path
          d={`M${svgCoord(cx - dx)} ${svgCoord(boundaryY)} L${svgCoord(cx)} ${svgCoord(satelliteY)} L${svgCoord(cx + dx)} ${svgCoord(boundaryY)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d={`M${svgCoord(cx - dx)} ${svgCoord(boundaryY)} L${svgCoord(cx)} ${svgCoord(cy)} L${svgCoord(cx + dx)} ${svgCoord(boundaryY)} M${svgCoord(cx)} ${svgCoord(cy)} V${svgCoord(satelliteY)}`}
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 4"
          opacity=".6"
        />
        <circle cx={svgCoord(cx)} cy={svgCoord(satelliteY)} r="5" fill="currentColor" />
        <text x={cx + 12} y={satelliteY - 8}>
          Satellite
        </text>
        <text x="380" y="110">
          θ = {results.centralAngleDeg.toFixed(2)}°
        </text>
        <text x="380" y="140">
          Coverage {(results.coverageFraction * 100).toFixed(2)}%
        </text>
        <text x="380" y="170">
          El min = {Number(values.minimumElevationDeg).toFixed(1)}°
        </text>
        <text x="35" y="305">
          Surface area = {(results.areaM2 / 1e6).toFixed(0)} km²
        </text>
      </svg>
      <figcaption>
        Shaded cap marks the covered surface in cross-section. Rotate this cap around the
        satellite–Earth axis to obtain the spherical coverage area, not a flat disc. Earth and
        altitude use the same scale; increasing minimum elevation shrinks coverage. Atmospheric
        refraction and terrain are excluded.
      </figcaption>
    </figure>
  );
}

export function LookAnglePlot({ results }) {
  const el = (results.elevationDeg * Math.PI) / 180,
    az = (results.azimuthDeg * Math.PI) / 180;
  const x = 170 + 100 * Math.cos(el),
    y = 145 - 100 * Math.sin(el);
  return (
    <figure tabIndex={0}>
      <svg
        viewBox="0 0 620 300"
        role="img"
        aria-label={`Satellite elevation ${results.elevationDeg?.toFixed(2)} degrees, azimuth ${results.azimuthDeg?.toFixed(2)} degrees`}
      >
        <title>Local horizon and compass bearing</title>
        <path d="M45 145H300M170 40V250" stroke="currentColor" strokeDasharray="4 4" />
        <path d={`M170 145L${svgCoord(x)} ${svgCoord(y)}`} stroke="currentColor" strokeWidth="3" />
        <circle data-elevation-point cx={svgCoord(x)} cy={svgCoord(y)} r="6" fill="currentColor" />
        <text x="50" y="28">
          Elevation {results.elevationDeg?.toFixed(2)}°
        </text>
        <text x="45" y="167">
          Local horizon
        </text>
        <circle cx="465" cy="145" r="85" fill="none" stroke="currentColor" />
        <path
          d={`M465 145L${svgCoord(465 + 75 * Math.sin(az))} ${svgCoord(145 - 75 * Math.cos(az))}`}
          stroke="currentColor"
          strokeWidth="3"
        />
        <text x="460" y="47">
          N
        </text>
        <text x="558" y="150">
          E
        </text>
        <text x="460" y="250">
          S
        </text>
        <text x="357" y="150">
          W
        </text>
        <text x="350" y="28">
          Azimuth{" "}
          {results.azimuthDefined === false ? "undefined" : `${results.azimuthDeg?.toFixed(2)}°`}
        </text>
        <text x="50" y="285">
          Slant range: {(results.slantRangeM / 1000).toFixed(1)} km ·{" "}
          {results.visible ? "Above horizon" : "Below horizon"}
        </text>
      </svg>
      <figcaption>
        Side view uses the actual elevation angle; the compass shows clockwise bearing from north.
        Below-horizon geometry is shown below the dashed line and is not a visible direct link.
      </figcaption>
    </figure>
  );
}

export function AntennaPlot({ values, results }) {
  const beam = results.beamwidthDeg;
  const [probeAngle, setProbeAngle] = useState(0);
  if (!(beam > 0)) return null;
  const pattern = buildAntennaPattern({ beamwidthDeg: beam, spanDeg: Math.max(6, beam * 1.5) });
  const span = pattern.spanDeg;
  const x = (angle) => 55 + ((angle + span) / (2 * span)) * 510;
  const y = (db) => 205 - ((Math.max(-30, db) + 30) / 30) * 155;
  const cartesianPath = pattern.points.map((point, index) => `${index ? "L" : "M"}${svgPoint(x(point.angleDeg), y(point.db))}`).join(" ");
  const polarPath = pattern.points.map((point, index) => {
    const displayAngle = (point.angleDeg / span) * (Math.PI / 3);
    const radius = 112 * Math.max(0, (point.db + 30) / 30);
    return `${index ? "L" : "M"}${svgPoint(150 + radius * Math.sin(displayAngle), 142 - radius * Math.cos(displayAngle))}`;
  }).join(" ");
  const probePower = relativeBeamPower(probeAngle, beam);
  const probeDb = Math.max(-60, 10 * Math.log10(probePower));
  const probeX = x(probeAngle);
  const probeY = y(probeDb);
  const polarProbeAngle = (probeAngle / span) * (Math.PI / 3);
  const polarProbeRadius = 112 * Math.max(0, (probeDb + 30) / 30);
  const polarProbeX = 150 + polarProbeRadius * Math.sin(polarProbeAngle);
  const polarProbeY = 142 - polarProbeRadius * Math.cos(polarProbeAngle);
  const updateFromPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    setProbeAngle(-span + 2 * span * fraction);
  };
  return (
    <figure data-antenna-plot tabIndex={0}>
      <div className="antenna-pattern-header">
        <strong>Approximation / normalized main lobe</strong>
        <span>D {values.diameterM} m · {(Number(values.frequencyHz) / 1e9).toFixed(2)} GHz · η {(Number(values.efficiency) * 100).toFixed(0)}%</span>
      </div>
      <div className="antenna-pattern-grid">
        <svg data-antenna-polar viewBox="0 0 300 280" role="img" aria-label={`Polar antenna approximation, half-power beamwidth ${beam.toFixed(3)} degrees`}>
          <title>Polar main-beam approximation</title>
          {[35, 70, 105].map((radius) => <circle key={radius} cx="150" cy="142" r={radius} fill="none" stroke="currentColor" opacity=".18" />)}
          <path d="M150 24V250M45 210L255 210" stroke="currentColor" strokeDasharray="4 5" opacity=".4" />
          <path data-beam-curve d={polarPath} fill="none" stroke="var(--signal)" strokeWidth="4" />
          <path d="M150 142V28" stroke="#d9a43a" strokeWidth="2" />
          {pattern.halfPowerAnglesDeg.map((angle) => {
            const displayAngle = (angle / span) * (Math.PI / 3);
            return <path key={angle} d={`M150 142L${svgPoint(150 + 56 * Math.sin(displayAngle), 142 - 56 * Math.cos(displayAngle))}`} stroke="#218b87" strokeDasharray="4 4" />;
          })}
          <circle cx={svgCoord(polarProbeX)} cy={svgCoord(polarProbeY)} r="6" fill="#d9a43a"><title>{`${probeAngle.toFixed(3)}°, ${probeDb.toFixed(2)} dB`}</title></circle>
          <text x="150" y="270" textAnchor="middle">Polar view / normalized radius</text>
        </svg>
        <svg data-antenna-cartesian viewBox="0 0 620 280" role="img" aria-label={`Cartesian antenna approximation, half-power beamwidth ${beam.toFixed(3)} degrees`} onPointerMove={updateFromPointer}>
          <title>Relative main-beam power versus off-axis angle</title>
          <path d="M55 50V205H565" fill="none" stroke="currentColor" />
          <path d="M55 65H565M55 81H565M310 50V205" stroke="currentColor" strokeDasharray="4 5" opacity=".35" />
          <path data-beam-curve d={cartesianPath} fill="none" stroke="var(--signal)" strokeWidth="4" />
          {pattern.halfPowerAnglesDeg.map((angle) => <path key={angle} d={`M${svgCoord(x(angle))} 50V205`} stroke="#218b87" strokeDasharray="4 4" />)}
          <path d={`M${svgCoord(probeX)} 50V205`} stroke="#d9a43a" strokeWidth="2" />
          <circle cx={svgCoord(probeX)} cy={svgCoord(probeY)} r="6" fill="#d9a43a" />
          <text x="65" y="35">HPBW {beam.toFixed(3)}° · half-power ±{(beam / 2).toFixed(3)}°</text>
          <text x="65" y="228">−{span.toFixed(2)}°</text><text x="310" y="228" textAnchor="middle">0°</text><text x="560" y="228" textAnchor="end">+{span.toFixed(2)}°</text>
          <text x="310" y="260" textAnchor="middle">Off-axis angle / relative power dB</text>
        </svg>
      </div>
      <label className="antenna-pattern-probe">
        Pattern probe angle
        <input aria-label="Pattern probe angle" type="range" min={-span} max={span} step={span / 200} value={probeAngle} onChange={(event) => setProbeAngle(Number(event.target.value))} />
        <output>{probeAngle.toFixed(3)}° · {(probePower * 100).toFixed(2)}% · {probeDb.toFixed(2)} dB</output>
      </label>
      <figcaption>
        Gaussian aperture approximation, normalized to peak power. Blue shows calculated relative power, amber marks boresight and the selected probe, and teal marks the −3.01 dB half-power boundaries. Diameter and frequency update both views. This is not a measured radiation pattern; sidelobes are not modeled.
      </figcaption>
    </figure>
  );
}

export function TdmaPlot({ values }) {
  const segments = tdmaSegments(values);
  let offset = 50;
  return (
    <figure data-tdma-plot tabIndex={0}>
      <svg
        viewBox="0 0 620 300"
        role="img"
        aria-label="TDMA frame bit allocation, proportional to actual frame bits"
      >
        <title>TDMA frame allocation</title>
        <text x="50" y="30">
          {(values.frameDurationS * 1000).toFixed(2)} ms frame ·{" "}
          {Math.round(values.bitRate * values.frameDurationS).toLocaleString("en")} bits
        </text>
        {segments.map((s, i) => {
          const width = s.fraction * 520;
          const start = offset;
          offset += width;
          return (
            <g key={s.label}>
              <rect
                data-tdma-segment={s.label}
                x={svgCoord(start)}
                y="60"
                width={svgCoord(Math.max(0, width))}
                height="70"
                fill="currentColor"
                fillOpacity={0.2 + i * 0.2}
                stroke="currentColor"
              >
                <title>{`${s.label}: ${s.bits} bits (${(s.fraction * 100).toFixed(2)}%)`}</title>
              </rect>
              <rect
                x="50"
                y={155 + i * 30}
                width="14"
                height="14"
                fill="currentColor"
                fillOpacity={0.2 + i * 0.2}
              />
              <text x="76" y={167 + i * 30}>
                {s.label}: {s.bits.toLocaleString("en")} bits · {(s.fraction * 100).toFixed(2)}%
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        Grouped allocation within one repeating frame, drawn to scale. Reference bursts and traffic
        preambles are separated from guards; actual bursts interleave these groups.{" "}
        {values.convention === "final-2026"
          ? "Reference guards omitted."
          : "Reference and traffic guards included."}
      </figcaption>
    </figure>
  );
}
