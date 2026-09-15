export function opAmpStage(type, rin, rf, inputVoltage = 1) {
  if (
    !["inverting", "non-inverting"].includes(type) ||
    [rin, rf].some((v) => !Number.isFinite(v) || v <= 0) ||
    !Number.isFinite(inputVoltage)
  )
    throw new RangeError("Use positive finite resistances and a finite input voltage.");
  const gain = type === "inverting" ? -(rf / rin) : 1 + rf / rin;
  if (!Number.isFinite(gain) || !Number.isFinite(gain * inputVoltage))
    throw new RangeError("Values exceed the supported numerical range.");
  return { gain, outputVoltage: gain * inputVoltage, inverted: gain < 0 };
}

export function cascadedGain(stages, inputVoltage = 1) {
  if (!Array.isArray(stages) || stages.length < 1 || stages.length > 8)
    throw new RangeError("Use between one and eight stages.");
  if (!Number.isFinite(inputVoltage)) throw new RangeError("Input voltage must be finite.");
  let signal = inputVoltage;
  const results = stages.map((stage) => {
    const result = opAmpStage(stage.type, Number(stage.rin), Number(stage.rf), signal);
    signal = result.outputVoltage;
    return result;
  });
  const totalGain = results.reduce((gain, stage) => gain * stage.gain, 1);
  if (!Number.isFinite(totalGain))
    throw new RangeError("Total gain exceeds the supported numerical range.");
  return { stages: results, totalGain, outputVoltage: signal, inverted: totalGain < 0 };
}
