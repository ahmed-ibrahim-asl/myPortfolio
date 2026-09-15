// Ideal fixed-frequency DCM flyback. Diode drop included; all other losses omitted.
export function flybackDesign({
  mode,
  inputMin,
  inputMax,
  output,
  current,
  frequency,
  duty,
  transfer,
  diode,
  busRipple,
  ripple
}) {
  if (!["ac", "dc"].includes(mode)) throw new RangeError("Choose AC mains or DC input.");
  if (
    [inputMin, inputMax, output, current, frequency, duty, transfer, ripple].some(
      (v) => !Number.isFinite(v) || v <= 0
    ) ||
    !Number.isFinite(diode) ||
    diode < 0 ||
    !Number.isFinite(busRipple) ||
    busRipple < 0
  )
    throw new RangeError("Enter finite positive targets; voltage drops may be zero.");
  if (inputMax < inputMin) throw new RangeError("Maximum input must not be below minimum input.");
  if (duty + transfer >= 1)
    throw new RangeError(
      "ON and energy-transfer fractions must leave a positive idle interval for DCM."
    );
  if (ripple >= output) throw new RangeError("Output ripple must be smaller than output voltage.");
  const busMin = mode === "ac" ? inputMin * Math.SQRT2 - 1.4 - busRipple : inputMin;
  const busMax = mode === "ac" ? inputMax * Math.SQRT2 - 1.4 : inputMax;
  if (busMin <= 0) throw new RangeError("Reservoir sag leaves no usable primary DC bus.");
  const power = output * current,
    transferPower = (output + diode) * current;
  const primaryPeak = (2 * transferPower) / (busMin * duty);
  const inductance = (busMin * duty) / (frequency * primaryPeak);
  const reflected = (busMin * duty) / transfer,
    ratio = reflected / (output + diode);
  const secondaryPeak = ratio * primaryPeak;
  // Integrate the output-current deficit over the nonconducting interval and triangular tail.
  const capacitance =
    (current * (1 - transfer + (transfer * current) / (2 * secondaryPeak))) / (frequency * ripple);
  const result = {
    busMin,
    busMax,
    power,
    transferPower,
    primaryPeak,
    inductance,
    reflected,
    ratio,
    secondaryPeak,
    capacitance,
    duty,
    transfer,
    idle: 1 - duty - transfer,
    dutyAtMax: (duty * busMin) / busMax,
    primaryRms: primaryPeak * Math.sqrt(duty / 3),
    secondaryRms: secondaryPeak * Math.sqrt(transfer / 3),
    switchVoltage: busMax + reflected,
    diodeVoltage: output + busMax / ratio
  };
  if (Object.values(result).some((v) => !Number.isFinite(v) || v <= 0))
    throw new RangeError("Targets exceed the supported numerical range.");
  return result;
}
