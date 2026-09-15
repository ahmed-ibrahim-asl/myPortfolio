function positive(...values) {
  if (values.some((v) => !Number.isFinite(v) || v <= 0))
    throw new RangeError("Enter finite, positive values.");
}
function nonnegative(value) {
  if (!Number.isFinite(value) || value < 0)
    throw new RangeError("Diode drop and ESR must be finite and nonnegative.");
}
function checked(result) {
  if (Object.values(result).some((v) => typeof v === "number" && !Number.isFinite(v)))
    throw new RangeError("Values exceed the numerical range. Use practical supply values.");
  return result;
}
export function bridgeDesign(vacRms, lineHz, loadA, diodeDrop, rippleV) {
  positive(vacRms, lineHz, loadA, rippleV);
  nonnegative(diodeDrop);
  const peak = vacRms * Math.SQRT2,
    rectifiedPeak = peak - 2 * diodeDrop,
    valley = rectifiedPeak - rippleV;
  if (valley <= 0)
    throw new RangeError(
      "Ripple must be below the rectified peak; the reservoir valley must remain positive."
    );
  return checked({
    peak,
    rectifiedPeak,
    valley,
    rippleHz: 2 * lineHz,
    capF: loadA / (2 * lineHz * rippleV),
    dc: rectifiedPeak - rippleV / 2,
    bridgeLossW: 2 * diodeDrop * loadA,
    warnings: [
      "Constant-current, small-ripple estimate. Diodes conduct in charging pulses near each peak; source impedance and surge current are not modeled."
    ]
  });
}
export function linearRegulatorDesign(vin, vout, loadA, cinUf, coutUf, esrMilliOhm) {
  positive(vin, vout, loadA, cinUf, coutUf);
  nonnegative(esrMilliOhm);
  if (vout >= vin) throw new RangeError("Output must be below input for a linear regulator.");
  return checked({
    dissipation: (vin - vout) * loadA,
    efficiency: vout / vin,
    headroom: vin - vout,
    cinUf,
    coutUf,
    esrOhm: esrMilliOhm / 1000,
    stabilityEvaluated: false,
    warnings: [
      "Stability is not evaluated. Check the exact regulator’s effective capacitance, ESR window, load range and layout requirements.",
      "Headroom is available input-to-output voltage, not a verified dropout margin. Quiescent current and thermal shutdown are excluded."
    ]
  });
}
export function buckDesign(
  vin,
  vout,
  loadA,
  switchHz,
  ripplePercent,
  rippleV,
  efficiencyPercent = 90
) {
  positive(vin, vout, loadA, switchHz, ripplePercent, rippleV, efficiencyPercent);
  if (vout >= vin) throw new RangeError("Output must be below input for a buck converter.");
  if (efficiencyPercent > 100)
    throw new RangeError("Efficiency must be greater than 0 and at most 100%.");
  if (ripplePercent >= 200)
    throw new RangeError(
      "Ripple must be below 200% to keep inductor current positive in this CCM model."
    );
  if (rippleV >= 2 * vout)
    throw new RangeError("Output ripple must keep the voltage valley above zero.");
  const duty = vout / vin,
    deltaI = (loadA * ripplePercent) / 100;
  return checked({
    duty,
    deltaI,
    inductance: ((vin - vout) * duty) / (switchHz * deltaI),
    capF: deltaI / (8 * switchHz * rippleV),
    peakI: loadA + deltaI / 2,
    valleyI: loadA - deltaI / 2,
    lossW: vout * loadA * (100 / efficiencyPercent - 1),
    efficiency: efficiencyPercent / 100,
    warnings: [
      "Ideal continuous-conduction model: zero switch and diode drop. Efficiency only estimates total loss; it does not alter ideal timing.",
      "Output capacitance is a ripple-only minimum with zero ESR. Controller stability, load transients, bias derating and ripple-current ratings require separate checks."
    ]
  });
}
