import test from "node:test";
import assert from "node:assert/strict";
import * as engine from "../../lib/tools/satellite/engine.js";
test("overhead circular LEO pass separates orbital speed from signed radial velocity", () => {
  const middle = engine.leoPass({ altitudeM: 800000, frequencyHz: 2e9, passFraction: 0.5 });
  assert.equal(middle.slantRangeM, 800000);
  assert.equal(middle.radialVelocityMps, 0);
  assert.ok(middle.dopplerHz === 0);
  assert.equal(middle.elevationDeg, 90);
  assert.ok(middle.orbitalSpeedMps > 7400 && middle.orbitalSpeedMps < 7500);
  const a = engine.leoPass({ altitudeM: 800000, frequencyHz: 2e9, passFraction: 0 });
  const b = engine.leoPass({ altitudeM: 800000, frequencyHz: 2e9, passFraction: 1 });
  assert.ok(Math.abs(a.elevationDeg) < 1e-10);
  assert.ok(Math.abs(b.elevationDeg) < 1e-10);
  assert.ok(Math.abs(a.slantRangeM - 3291443.45234731) < 1e-6);
  assert.ok(a.dopplerHz > 0 && b.dopplerHz < 0);
  assert.ok(Math.abs(a.dopplerHz + b.dopplerHz) < 1e-8);
  assert.ok(Math.abs(a.radialVelocityMps) < middle.orbitalSpeedMps);
});
test("LEO pass rejects invalid altitude and out-of-pass fractions", () => {
  for (const values of [
    { altitudeM: 0 },
    { altitudeM: -1 },
    { passFraction: 1.1 },
    { passFraction: -0.1 }
  ])
    assert.throws(() =>
      engine.leoPass({ altitudeM: 800000, frequencyHz: 2e9, passFraction: 0.5, ...values })
    );
});
