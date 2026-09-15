import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Guards the PID Simulator's car/drone gamification: a car-following-a-curved-track visualization
// (LineFollowerViz) must never feed calculateLineFollowerMetrics from getState() alone, because
// `error` is a transient value returned by step(), not part of persisted engine state - reading
// it from getState() silently produces NaN metrics (a real regression caught while building this).

test("LineFollowerViz pushes history from step()'s return value, not getState()'s transient fields", () => {
  const source = readFileSync("components/tools/LineFollowerViz.tsx", "utf8");
  assert.match(source, /const stepResult = engineRef\.current\.step\(/);
  assert.match(source, /pushHistory\(\{ timeSec: stepResult\.timeSec, error: stepResult\.error \}\)/);
});

test("the PID Simulator page offers both vehicles and keeps per-vehicle gain state separate", () => {
  const source = readFileSync("app/tools/pid-simulator/page.tsx", "utf8");
  assert.match(source, /DroneAltitudeViz/);
  assert.match(source, /LineFollowerViz/);
  assert.match(source, /droneParams/);
  assert.match(source, /carParams/);
  assert.match(source, /4\. Line follower/);
});

test("the drone plant is used for the drone lessons instead of the abstract mass-spring plant", () => {
  const source = readFileSync("app/tools/pid-simulator/page.tsx", "utf8");
  assert.doesNotMatch(source, /plant=/);
  assert.doesNotMatch(source, /thermalTau/);
});
