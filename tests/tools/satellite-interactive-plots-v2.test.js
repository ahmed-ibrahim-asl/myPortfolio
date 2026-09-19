import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildAntennaPattern, buildRfPathSeries } from "../../lib/tools/satellite/visuals.js";

test("antenna pattern normalizes boresight and marks full half-power beamwidth", () => {
  const pattern = buildAntennaPattern({ beamwidthDeg: 2, sampleCount: 201 });
  const center = pattern.points.find(({ angleDeg }) => angleDeg === 0);
  assert.equal(center.relativePower, 1);
  assert.equal(center.db, 0);
  assert.deepEqual(pattern.halfPowerAnglesDeg, [-1, 1]);
  assert.ok(Math.abs(pattern.points.find(({ angleDeg }) => angleDeg === 1).db + 3.0103) < 0.001);
});

test("narrower beam produces lower off-axis power on the same angular scale", () => {
  const wide = buildAntennaPattern({ beamwidthDeg: 4, spanDeg: 6 });
  const narrow = buildAntennaPattern({ beamwidthDeg: 2, spanDeg: 6 });
  const atTwoDegrees = (pattern) => pattern.points.reduce((best, point) =>
    Math.abs(point.angleDeg - 2) < Math.abs(best.angleDeg - 2) ? point : best
  );
  assert.ok(atTwoDegrees(narrow).db < atTwoDegrees(wide).db);
});

test("RF path series is logarithmic in distance and monotonic in loss", () => {
  const series = buildRfPathSeries({ frequencyHz: 12e9, minimumDistanceM: 1e3, maximumDistanceM: 1e6, sampleCount: 4 });
  assert.deepEqual(series.map(({ distanceM }) => Math.round(distanceM)), [1000, 10000, 100000, 1000000]);
  assert.ok(series.every((point, index) => index === 0 || point.fsplDb > series[index - 1].fsplDb));
});

test("antenna UI exposes synchronized polar and cartesian probes", () => {
  const source = readFileSync("components/tools/satellite/SatelliteLivePlots.jsx", "utf8");
  assert.match(source, /data-antenna-polar/);
  assert.match(source, /data-antenna-cartesian/);
  assert.match(source, /aria-label="Pattern probe angle"/);
  assert.match(source, /Approximation/);
});
