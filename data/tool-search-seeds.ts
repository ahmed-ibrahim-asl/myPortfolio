export type ToolSearchSeed = {
  primaryQuery: string;
  example: string;
  directAnswer?: string;
};

const rawToolSearchSeeds: Record<string, ToolSearchSeed | readonly [string, string]> = {
  "ohms-law-calculator": ["ohms law calculator", "Enter 12 V and 220 ohms to calculate a current of about 54.55 mA."],
  "resistor-color-code-calculator": ["resistor color code calculator", "Choose brown, black, red, and gold to read a 1 kΩ resistor with 5% tolerance."],
  "5-band-resistor-color-code-calculator": ["5 band resistor color code calculator", "Choose brown, black, black, red, and brown to read 10 kΩ with 1% tolerance."],
  "series-resistor-calculator": ["series resistor calculator", "Enter 100 Ω, 220 Ω, and 330 Ω in series to calculate a total resistance of 650 Ω."],
  "parallel-resistor-calculator": ["parallel resistor calculator", "Enter 100 Ω and 200 Ω in parallel to calculate an equivalent resistance of about 66.67 Ω."],
  "voltage-divider-calculator": ["voltage divider calculator", "Use 12 V, a 2 kΩ upper resistor, and a 1 kΩ lower resistor to calculate a 4 V output."],
  "rc-time-constant-calculator": ["rc time constant calculator", "Combine 10 kΩ with 100 µF to calculate a one-second RC time constant."],
  "555-timer-monostable-circuit-calculator": ["555 timer monostable calculator", "Use 100 kΩ and 10 µF to calculate an output pulse close to 1.1 seconds."],
  "capacitive-reactance-calculator": ["capacitive reactance calculator", "Enter 100 nF at 1 kHz to calculate about 1.59 kΩ of capacitive reactance."],
  "led-series-resistor-calculator": ["led resistor calculator", "For a 5 V supply, 2 V LED, and 20 mA target current, calculate a 150 Ω series resistor."],
  "battery-life-calculator": ["battery life calculator", "A 2,000 mAh battery, 100 mA load, and 85% usable capacity gives about 17 hours of runtime."],
  "rms-voltage-calculator": ["rms voltage calculator", "Enter a 325 V sine-wave peak to calculate an RMS voltage of about 229.8 V."],
  "high-pass-filter-calculator": ["high pass filter calculator", "Use 10 kΩ and 100 nF to calculate a high-pass cutoff near 159.15 Hz."],
  "low-pass-filter-calculator": ["low pass filter calculator", "Use 10 kΩ and 100 nF to calculate a low-pass cutoff near 159.15 Hz."],
  "op-amp-gain-calculator": ["op amp gain calculator", "A non-inverting amplifier with 10 kΩ feedback and 1 kΩ to ground has a gain of 11."],
  "capacitor-code-value-converter": ["capacitor code calculator", "Decode capacitor code 104 as 100 nF, which is also 0.1 µF."],
  "capacitance-conversion": ["capacitance conversion calculator", "Convert 0.1 µF into 100 nF or 100,000 pF without moving decimal places by hand."],
  "temperature-conversion": ["temperature converter", "Convert 25 °C into 77 °F and 298.15 K in one calculation."],
  "decimal-binary-octal-hex-converter": ["decimal binary octal hex converter", "Convert decimal 255 into binary 11111111, octal 377, and hexadecimal FF."],
  "binary-bit-shift-calculator": ["binary bit shift calculator", "Shift binary 00101101 left by two positions to get 10110100, or decimal 180."],
  "ones-1s-complement-calculator": ["ones complement calculator", "Flip every bit in 00101101 to get the 8-bit one's complement 11010010."],
  "twos-2s-complement-calculator": ["twos complement calculator", "Invert 00101101 and add one to get the 8-bit two's complement 11010011."],
  "ascii-to-hex-converter": ["ascii to hex converter", "Enter Hi to read its ASCII byte values as hexadecimal 48 69."],
  "hex-to-ascii-converter": ["hex to ascii converter", "Enter hexadecimal bytes 48 69 to decode the ASCII text Hi."],
  "log-base-2-calculator": ["log base 2 calculator", "Enter 1024 to calculate log base 2 as 10 because 2 raised to 10 equals 1024."],
  "binary-calculator": ["binary calculator", "Add binary 1010 and 0011 to get 1101, which equals decimal 13."],
  "hex-calculator": ["hex calculator", "Add hexadecimal 2A and 10 to get 3A, which equals decimal 58."],
  "acceleration-calculator": ["acceleration calculator", "A velocity change from 0 to 20 m/s over 4 seconds gives an acceleration of 5 m/s²."],
  "force-mass-acceleration-calculator": ["force mass acceleration calculator", "A 10 kg mass accelerating at 2 m/s² requires 20 N of force."],
  "speed-distance-time-calculator": ["speed distance time calculator", "Traveling 150 km in 3 hours gives an average speed of 50 km/h."],
  "wavelength-calculator": ["wavelength calculator", "Sound traveling at 343 m/s with a 440 Hz frequency has a wavelength of about 0.78 m."],
  "frequency-to-period-calculator": ["frequency to period calculator", "Convert 1 kHz into a period of 1 ms, or enter 1 ms to recover 1 kHz."],
  "percentage-change-calculator": ["percentage change calculator", "A value that rises from 80 to 100 has increased by 25%."],
  "square-root-calculator": ["square root calculator", "Enter 144 to calculate a square root of 12."],
  "cube-root-calculator": ["cube root calculator", "Enter 125 to calculate a cube root of 5."],
  "rot-explorer": ["ROT cipher encoder and decoder", "Enter HELLO and choose ROT13 to produce URYYB, then apply ROT13 again to recover HELLO."],
  "air-core-coil-designer": ["air core coil inductance calculator", "Enter 20 turns, a 10 mm coil radius, and a 20 mm winding length to estimate the inductance and wire length."],
  "lc-resonance-designer": ["LC resonance frequency calculator", "Enter 10 µH and 100 nF to estimate a resonant frequency near 159 kHz."],
  "band-pass-filter-designer": ["band pass filter calculator", "Set lower and upper cutoff frequencies to inspect the passband, center frequency, bandwidth, and response curve."],
  "bridge-rectifier-designer": ["full wave bridge rectifier calculator", "Enter the transformer secondary, load current, diode drop, capacitance, and mains frequency to estimate DC output and ripple."],
  "linear-regulator-stability-designer": ["linear regulator capacitor and heat calculator", "Enter input voltage, output voltage, load current, and capacitor values to estimate regulator loss, heat, and headroom."],
  "security-command-builder": {
    primaryQuery: "security command builder for authorized labs",
    example: "Choose an authorized network-enumeration objective and a lab target to build a safely quoted command with every flag explained.",
    directAnswer: "Use Security Mission only for systems you own or are explicitly authorized to test. Choose an objective, tool, action, and lab target to build a safely quoted command, inspect every token, and export a repeatable runbook. The workbench teaches command structure; it does not grant authorization or replace scope, logging, and professional review.",
  },
  "gradify": {
    primaryQuery: "university GPA and graduation planner",
    example: "Enter completed courses and grades to calculate GPA, then use the Delta Engineering planner to test prerequisites and a semester-by-semester graduation path.",
    directAnswer: "Use Gradify to calculate semester and cumulative GPA, compare grading scales, and plan a graduation path. Delta Engineering students can also import a transcript, check prerequisites, edit detected student details, and build semester plans. Always confirm program rules, course availability, and official records with the university before registration.",
  },
};

export const toolSearchSeeds = Object.fromEntries(
  Object.entries(rawToolSearchSeeds).map(([slug, value]) => [
    slug,
    Array.isArray(value) ? { primaryQuery: value[0], example: value[1] } : value,
  ]),
) as Record<string, ToolSearchSeed>;
