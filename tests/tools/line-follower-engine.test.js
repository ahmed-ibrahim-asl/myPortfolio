import { test } from "node:test";
import assert from "node:assert";
import {
  createLineFollowerEngine,
  calculateLineFollowerMetrics,
  trackLateralOffset
} from "../../lib/tools/line-follower-physics.js";

const TRACK_LENGTH = 800;

test("Line Follower - the track actually curves (not a straight line)", () => {
  const samples = Array.from({ length: 20 }, (_, i) => trackLateralOffset((i / 20) * TRACK_LENGTH, TRACK_LENGTH));
  const distinctValues = new Set(samples.map((v) => v.toFixed(2)));
  assert.ok(distinctValues.size > 5, "expected the track to vary meaningfully across its length");
  assert.ok(Math.max(...samples) - Math.min(...samples) > 20, "expected visible curve amplitude");
});

test("Line Follower - zero gains drive straight ahead and drift from a curving track", () => {
  const engine = createLineFollowerEngine();
  let state;
  for (let i = 0; i < 300; i += 1) {
    state = engine.step({ dt: 1 / 60, speed: 40, kp: 0, ki: 0, kd: 0, trackLength: TRACK_LENGTH });
  }
  assert.strictEqual(state.heading, 0);
  assert.ok(Math.abs(state.error) > 5, "expected meaningful lateral error with no steering correction");
});

test("Line Follower - a well-tuned PID keeps lateral error small while following curves", () => {
  const engine = createLineFollowerEngine();
  let lastState;
  for (let i = 0; i < 900; i += 1) {
    lastState = engine.step({ dt: 1 / 60, speed: 40, kp: 0.08, ki: 0.02, kd: 0.03, trackLength: TRACK_LENGTH });
    engine.pushHistory({ timeSec: lastState.timeSec, error: lastState.error });
  }
  const metrics = calculateLineFollowerMetrics(engine.getState());
  assert.ok(metrics.averageAbsError < 8, `expected tight tracking, got average error ${metrics.averageAbsError}`);
});

test("Line Follower - very high Kp with no damping term oscillates (zig-zags) more than a tuned PID", () => {
  const runAvgAbsHeadingChange = (kp, kd) => {
    const engine = createLineFollowerEngine();
    let previousHeading = 0;
    let totalSwing = 0;
    let samples = 0;
    for (let i = 0; i < 900; i += 1) {
      const state = engine.step({ dt: 1 / 60, speed: 40, kp, ki: 0, kd, trackLength: TRACK_LENGTH });
      if (i > 60) {
        totalSwing += Math.abs(state.heading - previousHeading);
        samples += 1;
      }
      previousHeading = state.heading;
    }
    return totalSwing / samples;
  };

  const aggressive = runAvgAbsHeadingChange(0.35, 0);
  const damped = runAvgAbsHeadingChange(0.08, 0.05);
  assert.ok(aggressive > damped, `expected the undamped high-Kp run (${aggressive}) to swing more than the damped one (${damped})`);
});

test("Line Follower - the car loops back to the start of the track instead of driving off it", () => {
  const engine = createLineFollowerEngine();
  let state;
  for (let i = 0; i < 2000; i += 1) {
    state = engine.step({ dt: 1 / 60, speed: 60, kp: 0.05, ki: 0, kd: 0.02, trackLength: TRACK_LENGTH });
  }
  assert.ok(state.x >= 0 && state.x < TRACK_LENGTH, `expected x to wrap within the track length, got ${state.x}`);
});

test("calculateLineFollowerMetrics - empty history reports zero without dividing by zero", () => {
  const metrics = calculateLineFollowerMetrics({ history: [] });
  assert.strictEqual(metrics.averageAbsError, 0);
  assert.strictEqual(metrics.maxAbsError, 0);
});
