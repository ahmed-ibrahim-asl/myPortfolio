import test from "node:test";
import assert from "node:assert/strict";
import * as visuals from "../../lib/tools/satellite/visuals.js";
test("antenna approximation has its half-power points at half the full beamwidth", () => {
  assert.equal(visuals.relativeBeamPower(0, 2), 1);
  assert.ok(Math.abs(visuals.relativeBeamPower(1, 2) - 0.5) < 1e-12);
  assert.ok(visuals.relativeBeamPower(1, 1) < visuals.relativeBeamPower(1, 2));
});
test("TDMA visual segments conserve frame bits and distinguish guard conventions", () => {
  const v = {
    bitRate: 1000000,
    frameDurationS: 0.01,
    referenceStations: 2,
    referenceBits: 100,
    trafficTerminals: 3,
    preambleBits: 50,
    guardBits: 10
  };
  const lecture = visuals.tdmaSegments(v);
  assert.deepEqual(
    lecture.map((s) => s.bits),
    [200, 150, 50, 9600]
  );
  assert.equal(
    lecture.reduce((n, s) => n + s.fraction, 0),
    1
  );
  assert.deepEqual(
    visuals.tdmaSegments({ ...v, convention: "final-2026" }).map((s) => s.bits),
    [200, 150, 30, 9620]
  );
});
test("orbit positions obey apsis geometry and equal-time Kepler motion", () => {
  const p = visuals.orbitPosition(0.5, 0);
  const a = visuals.orbitPosition(0.5, 0.5);
  assert.ok(Math.abs(p.radius - 0.5) < 1e-12);
  assert.ok(Math.abs(a.radius - 1.5) < 1e-12);
  assert.ok(visuals.orbitPosition(0.5, 0.05).trueAnomaly > 2 * Math.PI * 0.05);
  assert.ok(Math.abs(visuals.orbitPosition(0, 0.25).y - 1) < 1e-12);
});
test("equal-duration orbit sectors enclose equal areas at perigee and apogee", () => {
  assert.equal(typeof visuals.orbitSweep, "function");
  const near = visuals.orbitSweep(0.5, 0, 0.05),
    far = visuals.orbitSweep(0.5, 0.5, 0.05);
  const area = (points) =>
    Math.abs(points.slice(1).reduce((s, p, i) => s + points[i].x * p.y - p.x * points[i].y, 0) / 2);
  // Ellipse area pi*a*b with a=1, b=sqrt(.75); five percent of its area.
  assert.ok(Math.abs(area(near) - 0.1360349523175663) < 1e-5);
  assert.ok(Math.abs(area(far) - 0.1360349523175663) < 1e-5);
  assert.ok(near.at(-1).trueAnomaly > far.at(-1).trueAnomaly + Math.PI);
});
test("orbit instrument state reports apsides, speed, time and a unit tangent", () => {
  const periodS = 7200;
  const base = {
    eccentricity: 0.5,
    semiMajorAxisM: 7400e3,
    earthRadiusM: 1000e3,
    periodS,
    muKm3S2: 398600.4418
  };
  const perigee = visuals.orbitInstrumentState({ ...base, fraction: 0 });
  const apogee = visuals.orbitInstrumentState({ ...base, fraction: 0.5 });
  assert.equal(perigee.radiusKm, 3700);
  assert.equal(apogee.radiusKm, 11100);
  assert.equal(perigee.elapsedS, 0);
  assert.equal(apogee.elapsedS, periodS / 2);
  assert.ok(perigee.speedKmS > apogee.speedKmS);
  assert.ok(Math.abs(Math.hypot(...perigee.velocityDirection) - 1) < 1e-12);
  assert.equal(perigee.perigeeKm, 3700);
  assert.equal(perigee.apogeeKm, 11100);
});
test("orbit instrument wraps a completed period to the starting state", () => {
  const input = {
    eccentricity: 0,
    semiMajorAxisM: 7171e3,
    earthRadiusM: 6371e3,
    periodS: 6000,
    muKm3S2: 398600.4418
  };
  const start = visuals.orbitInstrumentState({ ...input, fraction: 0 });
  const complete = visuals.orbitInstrumentState({ ...input, fraction: 1 });
  assert.deepEqual(complete.position, start.position);
  assert.equal(start.altitudeKm, 800);
});
test("noise plot contributions use preceding power gains, not their dB values", () => {
  assert.equal(typeof visuals.noiseContributions, "function");
  const rows = visuals.noiseContributions(
    [
      { gainDb: 20, noiseFigureDb: 10 * Math.log10(2) },
      { gainDb: 10, noiseFigureDb: 10 * Math.log10(3) }
    ],
    290
  );
  assert.ok(Math.abs(rows[0].inputK - 290) < 1e-9);
  assert.ok(Math.abs(rows[1].inputK - 5.8) < 1e-9);
});
test("power timeline reaches the computed endpoints and uses compound annual retention", () => {
  assert.equal(typeof visuals.powerAtFraction, "function");
  assert.equal(
    visuals.powerAtFraction(
      { powerMode: "annual", degradationPerYear: 0.1, years: 2 },
      { bolPowerW: 100 },
      1
    ),
    81
  );
  assert.equal(
    visuals.powerAtFraction({ powerMode: "total" }, { bolPowerW: 100, eolPowerW: 75 }, 0.5),
    87.5
  );
});
test("FDMA display includes guard allocation and the unusable residual bandwidth", () => {
  assert.equal(typeof visuals.fdmaAllocation, "function");
  assert.deepEqual(
    visuals.fdmaAllocation({
      transponderBandwidthHz: 100,
      channelSpacingHz: 30,
      guardBandwidthHz: 2
    }),
    { count: 3, slotHz: 32, guardHz: 2, occupiedHz: 96, unusedHz: 4 }
  );
});
test("TDMA burst layout includes exactly the declared frame and actual guard convention", () => {
  assert.equal(typeof visuals.tdmaBurstLayout, "function");
  const v = {
    bitRate: 1000000,
    frameDurationS: 0.01,
    referenceStations: 2,
    referenceBits: 100,
    trafficTerminals: 3,
    preambleBits: 50,
    guardBits: 10
  };
  const rows = visuals.tdmaBurstLayout(v);
  assert.equal(
    rows.reduce((n, r) => n + r.count * r.parts.reduce((a, p) => a + p.bits, 0), 0),
    10000
  );
  assert.deepEqual(
    rows[1].parts.map((p) => p.bits),
    [50, 3200, 10]
  );
});
