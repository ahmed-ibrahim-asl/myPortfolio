// Data transformations for teaching diagrams; domain validation stays in engine.js.
import { noiseFigure } from "./engine.js";

// Shared SVG coordinate formatting: every plot must serialize computed floats
// through this path so server and client markup match byte-for-byte. Rounding
// to a fixed precision also absorbs the sub-ULP differences that Math.sin/cos/
// atan2 can produce between the Node (SSR) and browser (hydration) V8 builds,
// which is what causes point-attribute hydration mismatches in the first place.
const SVG_PRECISION = 2;
export function svgCoord(value, precision = SVG_PRECISION) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Number(n.toFixed(precision)));
}
export function svgPoint(x, y, precision = SVG_PRECISION) {
  return `${svgCoord(x, precision)},${svgCoord(y, precision)}`;
}
export function svgPoints(pairs, precision = SVG_PRECISION) {
  return pairs.map(([x, y]) => svgPoint(x, y, precision)).join(" ");
}
export function fdmaAllocation(v) {
  const guardHz = Number(v.guardBandwidthHz || 0),
    slotHz = Number(v.channelSpacingHz) + guardHz;
  const count = Math.floor(v.transponderBandwidthHz / slotHz);
  return {
    count,
    slotHz,
    guardHz,
    occupiedHz: count * slotHz,
    unusedHz: v.transponderBandwidthHz - count * slotHz
  };
}
export function tdmaBurstLayout(v) {
  const payload = tdmaSegments(v).find((s) => s.label === "Payload").bits;
  return [
    {
      label: "Reference burst",
      count: v.referenceStations,
      parts: [
        { label: "Reference", bits: v.referenceBits },
        { label: "Guard", bits: v.convention === "final-2026" ? 0 : v.guardBits }
      ]
    },
    {
      label: "Traffic burst",
      count: v.trafficTerminals,
      parts: [
        { label: "Preamble", bits: v.preambleBits },
        { label: "Payload", bits: v.trafficTerminals ? payload / v.trafficTerminals : 0 },
        { label: "Guard", bits: v.guardBits }
      ]
    },
    ...(!v.trafficTerminals
      ? [
          {
            label: "Unallocated payload time",
            count: 1,
            parts: [{ label: "Unallocated", bits: payload }]
          }
        ]
      : [])
  ];
}
export function noiseContributions(stages, referenceTemperatureK = 290) {
  let precedingGain = 1;
  return stages.map((stage, i) => {
    const localK = noiseFigure({ ...stage, referenceTemperatureK }).equivalentTemperatureK;
    const row = { stage: i + 1, localK, inputK: localK / precedingGain, precedingGain };
    precedingGain *= stage.gainDb === undefined ? stage.gainLinear : 10 ** (stage.gainDb / 10);
    return row;
  });
}
export function powerAtFraction(values, results, fraction) {
  return values.powerMode === "annual"
    ? results.bolPowerW * (1 - values.degradationPerYear) ** (values.years * fraction)
    : results.bolPowerW + (results.eolPowerW - results.bolPowerW) * fraction;
}
export function relativeBeamPower(angleDeg, beamwidthDeg) {
  return Math.exp(-4 * Math.log(2) * (angleDeg / beamwidthDeg) ** 2);
}

export function buildAntennaPattern({ beamwidthDeg, spanDeg, sampleCount = 241 }) {
  if (!(beamwidthDeg > 0) || !Number.isFinite(beamwidthDeg)) return null;
  const span = spanDeg > 0 ? spanDeg : Math.max(beamwidthDeg * 3, 1);
  const count = Math.max(3, Math.floor(sampleCount) | 1);
  const sampledAngles = Array.from({ length: count }, (_, index) =>
    -span + (2 * span * index) / (count - 1)
  );
  const angles = [...new Set([...sampledAngles, -beamwidthDeg / 2, 0, beamwidthDeg / 2])]
    .sort((first, second) => first - second);
  const points = angles.map((angleDeg) => {
    const relativePower = relativeBeamPower(angleDeg, beamwidthDeg);
    return {
      angleDeg: Math.abs(angleDeg) < 1e-12 ? 0 : angleDeg,
      relativePower,
      db: Math.max(-60, 10 * Math.log10(relativePower))
    };
  });
  return {
    beamwidthDeg,
    spanDeg: span,
    halfPowerAnglesDeg: [-beamwidthDeg / 2, beamwidthDeg / 2],
    points
  };
}

export function buildRfPathSeries({
  frequencyHz,
  minimumDistanceM,
  maximumDistanceM,
  sampleCount = 61
}) {
  if (!(frequencyHz > 0 && minimumDistanceM > 0 && maximumDistanceM >= minimumDistanceM)) return [];
  const count = Math.max(2, Math.floor(sampleCount));
  const start = Math.log10(minimumDistanceM);
  const end = Math.log10(maximumDistanceM);
  return Array.from({ length: count }, (_, index) => {
    const distanceM = 10 ** (start + ((end - start) * index) / (count - 1));
    const fsplDb = 20 * Math.log10((4 * Math.PI * distanceM * frequencyHz) / 299792458);
    return { distanceM, fsplDb };
  });
}
export function orbitPosition(e, timeFraction) {
  const mean = 2 * Math.PI * timeFraction;
  let eccentric = mean;
  for (let i = 0; i < 30; i++) {
    const step = (eccentric - e * Math.sin(eccentric) - mean) / (1 - e * Math.cos(eccentric));
    eccentric -= step;
    if (Math.abs(step) < 1e-12) break;
  }
  const x = Math.cos(eccentric) - e,
    y = Math.sqrt(1 - e * e) * Math.sin(eccentric);
  return { x, y, radius: Math.hypot(x, y), trueAnomaly: Math.atan2(y, x) };
}
export function orbitSweep(e, start, duration) {
  return Array.from({ length: 201 }, (_, i) => orbitPosition(e, start + (duration * i) / 200));
}
export function orbitInstrumentState({
  eccentricity = 0,
  semiMajorAxisM,
  earthRadiusM,
  periodS,
  muKm3S2 = 398600.4418,
  fraction = 0
}) {
  const wrappedFraction = ((Number(fraction) % 1) + 1) % 1;
  const e = Number(eccentricity) || 0;
  const semiMajorAxisKm = Number(semiMajorAxisM) / 1000;
  const position = orbitPosition(e, wrappedFraction);
  const radiusKm = position.radius * semiMajorAxisKm;
  const eccentricAnomaly = Math.atan2(
    position.y / Math.sqrt(1 - e * e),
    position.x + e
  );
  const tangent = [
    -Math.sin(eccentricAnomaly),
    Math.sqrt(1 - e * e) * Math.cos(eccentricAnomaly)
  ];
  const tangentMagnitude = Math.hypot(...tangent) || 1;
  return {
    position,
    radiusKm,
    altitudeKm: radiusKm - Number(earthRadiusM) / 1000,
    speedKmS: Math.sqrt(Number(muKm3S2) * (2 / radiusKm - 1 / semiMajorAxisKm)),
    elapsedS: wrappedFraction * Number(periodS),
    perigeeKm: semiMajorAxisKm * (1 - e),
    apogeeKm: semiMajorAxisKm * (1 + e),
    velocityDirection: tangent.map((value) => value / tangentMagnitude),
    activeSweep: orbitSweep(e, wrappedFraction, 0.05),
    comparisonSweeps: [orbitSweep(e, 0, 0.05), orbitSweep(e, 0.5, 0.05)]
  };
}
export function tdmaSegments(v) {
  const total = v.bitRate * v.frameDurationS;
  const reference = v.referenceStations * v.referenceBits;
  const preamble = v.trafficTerminals * v.preambleBits;
  const guards =
    (v.trafficTerminals + (v.convention === "final-2026" ? 0 : v.referenceStations)) * v.guardBits;
  return [
    ["Reference", reference],
    ["Preamble", preamble],
    ["Guards", guards],
    ["Payload", total - reference - preamble - guards]
  ].map(([label, bits]) => ({ label, bits, fraction: bits / total }));
}
