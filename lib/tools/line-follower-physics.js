const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// The track is a curved line (not a straight one) so a P-only controller visibly zig-zags and a
// well-tuned PID visibly tracks the bends - the same real-world behavior a line-following robot
// shows on an S-curve course. Track position wraps every `trackLength` units so the car keeps
// looping the same course instead of driving off the edge of the visualization.
export function trackLateralOffset(x, trackLength) {
  const cycle = (x / trackLength) * Math.PI * 2;
  return 42 * Math.sin(cycle) + 18 * Math.sin(cycle * 2.5 + 1.1);
}

export function createLineFollowerEngine() {
  let state = {
    timeSec: 0,
    x: 0,
    y: 0,
    heading: 0,
    integralError: 0,
    previousError: 0,
    history: []
  };

  return {
    step({
      dt,
      speed,
      kp,
      ki,
      kd,
      trackLength,
      maxSteerRate = 3.2,
      maxHeading = 1.3
    }) {
      const targetY = trackLateralOffset(state.x, trackLength);
      const error = targetY - state.y;

      const integralLimit = 40;
      state.integralError = clamp(state.integralError + error * dt, -integralLimit, integralLimit);
      const derivative = (error - state.previousError) / dt;
      state.previousError = error;

      let steerRate = (kp * error) + (ki * state.integralError) + (kd * derivative);
      steerRate = clamp(steerRate, -maxSteerRate, maxSteerRate);

      state.heading = clamp(state.heading + steerRate * dt, -maxHeading, maxHeading);
      state.x += speed * Math.cos(state.heading) * dt;
      state.y += speed * Math.sin(state.heading) * dt;

      if (state.x >= trackLength) {
        state.x -= trackLength;
      }

      state.timeSec += dt;

      return { ...state, error, targetY };
    },
    pushHistory(sample) {
      state.history.push(sample);
      if (state.history.length > 300) {
        state.history.shift();
      }
    },
    reset() {
      state = {
        timeSec: 0,
        x: 0,
        y: 0,
        heading: 0,
        integralError: 0,
        previousError: 0,
        history: []
      };
    },
    getState() {
      return { ...state };
    }
  };
}

export function calculateLineFollowerMetrics({ history }) {
  if (!history.length) {
    return { averageAbsError: 0, maxAbsError: 0 };
  }
  const recent = history.slice(-60);
  const sumAbs = recent.reduce((sum, sample) => sum + Math.abs(sample.error), 0);
  const maxAbsError = recent.reduce((max, sample) => Math.max(max, Math.abs(sample.error)), 0);
  return {
    averageAbsError: sumAbs / recent.length,
    maxAbsError
  };
}
