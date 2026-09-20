"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  orbitInstrumentState,
  svgCoord,
  svgPoint,
  svgPoints
} from "../../../lib/tools/satellite/visuals.js";
import styles from "./SatelliteWorkspace.module.css";

const VISUAL_CYCLE_MS = 12000;
const format = (value, digits = 1) =>
  Number(value).toLocaleString("en", { maximumFractionDigits: digits });

export default function OrbitInstrument({ values, results }) {
  const [fraction, setFraction] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const frameRef = useRef(0);
  const previousRef = useRef(0);
  const eccentricity = Number(results.eccentricity || 0);
  const semiMajorAxisM = Number(
    results.semiMajorAxisM ||
      results.radiusM ||
      Number(values.earthRadiusM) + Number(values.altitudeM)
  );
  const periodS = Number(results.periodS || 0);
  const model = useMemo(
    () =>
      orbitInstrumentState({
        eccentricity,
        semiMajorAxisM,
        earthRadiusM: Number(values.earthRadiusM || 6371e3),
        periodS,
        muKm3S2: Number(values.muKm3S2 || 398600.4418),
        fraction
      }),
    [eccentricity, semiMajorAxisM, values.earthRadiusM, values.muKm3S2, periodS, fraction]
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(query.matches);
      if (query.matches) setPlaying(false);
    };
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    previousRef.current = performance.now();
    const tick = (now) => {
      const delta = now - previousRef.current;
      previousRef.current = now;
      setFraction((current) => (current + delta / VISUAL_CYCLE_MS) % 1);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [playing, reducedMotion]);

  const focusX = 380;
  const centerY = 190;
  const scale = 140;
  const ellipseCenterX = focusX - eccentricity * scale;
  const semiMinor = scale * Math.sqrt(1 - eccentricity * eccentricity);
  const satelliteX = focusX + model.position.x * scale;
  const satelliteY = centerY - model.position.y * scale;
  const physicalEarthSize = (Number(values.earthRadiusM || 6371e3) / semiMajorAxisM) * scale;
  const earthSize = Math.max(10, Math.min(86, physicalEarthSize));
  const earthEnlarged = physicalEarthSize < 10;
  const projectSweep = (points) =>
    svgPoints(points.map((point) => [focusX + point.x * scale, centerY - point.y * scale]));
  const velocityX = satelliteX + model.velocityDirection[0] * 48;
  const velocityY = satelliteY - model.velocityDirection[1] * 48;
  const elapsedMinutes = model.elapsedS / 60;

  return (
    <figure className={styles.orbitInstrument} data-orbit-instrument data-orbit-plot tabIndex={0}>
      <div className={styles.orbitCanvas}>
        <svg
          viewBox="0 0 760 420"
          role="img"
          aria-label={`Orbit at ${(fraction * 100).toFixed(0)} percent of its period`}
        >
          <title>Interactive Kepler orbit instrument</title>
          <desc>
            Earth is at one focus. The satellite is {format(model.radiusKm)} kilometres from Earth
            and moving at {format(model.speedKmS, 3)} kilometres per second.
          </desc>
          <defs>
            <marker id="orbit-velocity-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0 0L8 4L0 8Z" className={styles.orbitVelocityFill} />
            </marker>
          </defs>
          <line x1="80" y1={centerY} x2="680" y2={centerY} className={styles.orbitAxis} />
          <ellipse
            cx={svgCoord(ellipseCenterX)}
            cy={centerY}
            rx={scale}
            ry={svgCoord(semiMinor)}
            className={styles.orbitPath}
          />
          {model.comparisonSweeps.map((sweep, index) => (
            <polygon
              key={index}
              data-equal-area-sector={index + 1}
              points={`${svgPoint(focusX, centerY)} ${projectSweep(sweep)}`}
              className={index === 0 ? styles.orbitSweepNear : styles.orbitSweepFar}
            />
          ))}
          <polygon
            points={`${svgPoint(focusX, centerY)} ${projectSweep(model.activeSweep)}`}
            className={styles.orbitSweepActive}
          />
          <circle cx={svgCoord(focusX - 2 * eccentricity * scale)} cy={centerY} r="4" className={styles.orbitEmptyFocus} />
          <circle cx={focusX} cy={centerY} r={svgCoord(earthSize)} className={styles.orbitEarth} />
          <circle cx={focusX} cy={centerY} r="4" className={styles.orbitFocus} />
          <line x1={focusX} y1={centerY} x2={svgCoord(satelliteX)} y2={svgCoord(satelliteY)} className={styles.orbitRadius} />
          <line
            x1={svgCoord(satelliteX)}
            y1={svgCoord(satelliteY)}
            x2={svgCoord(velocityX)}
            y2={svgCoord(velocityY)}
            className={styles.orbitVelocity}
            markerEnd="url(#orbit-velocity-arrow)"
          />
          <circle data-orbit-satellite cx={svgCoord(satelliteX)} cy={svgCoord(satelliteY)} r="8" className={styles.orbitSatellite} />
          <g className={styles.orbitApsis}>
            <circle cx={svgCoord(focusX + (1 - eccentricity) * scale)} cy={centerY} r="4" />
            <text x={svgCoord(focusX + (1 - eccentricity) * scale)} y="225" textAnchor="middle">Perigee</text>
            <circle cx={svgCoord(focusX - (1 + eccentricity) * scale)} cy={centerY} r="4" />
            <text x={svgCoord(focusX - (1 + eccentricity) * scale)} y="225" textAnchor="middle">Apogee</text>
          </g>
          <text x="28" y="34" className={styles.orbitSvgTitle}>KEPLER ORBIT / e = {eccentricity.toFixed(4)}</text>
          <text x="28" y="392" className={styles.orbitSvgNote}>
            Solid and dashed sectors each span 5% of one period.
          </text>
          {earthEnlarged ? <text x="28" y="370" className={styles.orbitSvgNote}>Earth marker enlarged for readability — not to scale.</text> : null}
        </svg>
      </div>

      <div className={styles.orbitMetrics} data-orbit-metrics aria-live="polite" aria-atomic="true">
        <div><span>Elapsed</span><strong>{format(elapsedMinutes)} min</strong></div>
        <div><span>Orbit</span><strong>{format(fraction * 100)}%</strong></div>
        <div><span>Radius</span><strong>{format(model.radiusKm)} km</strong></div>
        <div><span>Altitude</span><strong>{format(model.altitudeKm)} km</strong></div>
        <div><span>Speed</span><strong>{format(model.speedKmS, 3)} km/s</strong></div>
        <div><span>Perigee / apogee</span><strong>{format(model.perigeeKm)} / {format(model.apogeeKm)} km</strong></div>
      </div>

      <div className={styles.orbitControls}>
        <button
          type="button"
          data-orbit-play
          aria-pressed={playing}
          disabled={reducedMotion}
          onClick={() => setPlaying((current) => !current)}
        >
          {playing ? "Pause orbit" : "Play orbit"}
        </button>
        <button
          type="button"
          data-orbit-reset
          onClick={() => {
            setPlaying(false);
            setFraction(0);
          }}
        >
          Reset
        </button>
        <label className={styles.orbitScrubber}>
          Elapsed fraction of one orbit
          <input
            aria-label="Orbit time fraction"
            type="range"
            min="0"
            max="1"
            step=".001"
            value={fraction}
            onChange={(event) => {
              setPlaying(false);
              setFraction(Number(event.target.value));
            }}
          />
        </label>
      </div>
      <div className={styles.orbitLegend} aria-label="Orbit diagram legend">
        <span><i className={styles.legendLive} />Live position and radius</span>
        <span><i className={styles.legendNear} />Perigee comparison</span>
        <span><i className={styles.legendFar} />Apogee comparison</span>
      </div>
      <figcaption>
        Equal areas are swept in equal times, so the spacecraft moves faster near perigee and
        slower near apogee. Drag the timeline or play one orbit to compare position, speed and
        radius. The model is Keplerian and excludes drag and perturbations.
      </figcaption>
      {reducedMotion ? <p className={styles.orbitStatus}>Animation is disabled by your reduced-motion preference. The timeline remains available.</p> : null}
    </figure>
  );
}
