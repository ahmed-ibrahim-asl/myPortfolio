const visual = (kind, formula, accent, ariaLabel, image) => Object.freeze({
  kind,
  formula,
  accent,
  ariaLabel,
  ...(typeof image === "object" ? Object.fromEntries(Object.entries(image).map(([key, value]) => [key, `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${value}`])) : image ? { image: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${image}` } : {})
});

export const calculatorVisuals = Object.freeze({
  "smps-designer": visual("tank", "SWITCH / STORE / DELIVER", "gold", "Two isolated windings transfer energy from AC or DC input to a DC output", {imageDark:"/media/tools/design/smps-v3-dark.svg",imageLight:"/media/tools/design/smps-v3-light.svg"}),
  "rot-explorer": visual("rot", "ROT13 · HELLO → URYYB", "gold", "Letters H E L L O shifted thirteen places become U R Y Y B", {imageDark: "/media/tools/design/rot-explorer-v2-dark.svg", imageLight: "/media/tools/design/rot-explorer-v2-light.svg"}),
  "vigenere-cipher": visual("vigenere", "ATTAC + LEMON → LXFOP", "gold", "Letters A T T A C, each added to a keyword letter L E M O N, become L X F O P", {imageDark: "/media/tools/design/vigenere-cipher-v1-dark.svg", imageLight: "/media/tools/design/vigenere-cipher-v1-light.svg"}),
  "affine-cipher": visual("affine", "C = (P × 5 + 8) mod 26", "gold", "Letters A F F I N scaled by 5 and shifted by 8 become I H H W V", {imageDark: "/media/tools/design/affine-cipher-v1-dark.svg", imageLight: "/media/tools/design/affine-cipher-v1-light.svg"}),
  "transposition-cipher": visual("transposition", "WEARE → WEERA (3 rails)", "gold", "Letters W E A R E zigzag across three rails and are read off rail by rail as W E E R A", {imageDark: "/media/tools/design/transposition-cipher-v1-dark.svg", imageLight: "/media/tools/design/transposition-cipher-v1-light.svg"}),
  "playfair-cipher": visual("playfair", "HI DE → BM OD", "gold", "Digraphs H I and D E look up a 5 by 5 key square to become B M and O D", {imageDark: "/media/tools/design/playfair-cipher-v1-dark.svg", imageLight: "/media/tools/design/playfair-cipher-v1-light.svg"}),
  "hill-cipher": visual("hill", "C = K × P (mod 26)", "gold", "A 3 by 3 key matrix multiplies letter block P A Y into ciphertext block L N S", {imageDark: "/media/tools/design/hill-cipher-v1-dark.svg", imageLight: "/media/tools/design/hill-cipher-v1-light.svg"}),
  "hash-generator": visual("hash", "abc → 900150983cd2...", "gold", "The text abc is hashed into a fixed length fingerprint such as 900150983cd2", {imageDark: "/media/tools/design/hash-generator-v1-dark.svg", imageLight: "/media/tools/design/hash-generator-v1-light.svg"}),
  "aes-hex-calculator": visual("aes", "SubBytes → ShiftRows → MixColumns → AddRoundKey", "gold", "A 16 byte hex block moves through SubBytes ShiftRows MixColumns and AddRoundKey each round", {imageDark: "/media/tools/design/aes-hex-calculator-v1-dark.svg", imageLight: "/media/tools/design/aes-hex-calculator-v1-light.svg"}),
  "air-core-coil-designer": visual("coil", "Geometry → inductance", "gold", "Single-layer air-core coil winding", {imageDark: "/media/tools/design/air-core-coil-v2-dark.svg", imageLight: "/media/tools/design/air-core-coil-v2-light.svg"}),
  "lc-resonance-designer": visual("tank", "f₀ = 1 / (2π√LC)", "gold", "Parallel inductor and capacitor tuned circuit", {imageDark: "/media/tools/design/lc-resonance-v2-dark.svg", imageLight: "/media/tools/design/lc-resonance-v2-light.svg"}),
  "band-pass-filter-designer": visual("bandpass", "High-pass → buffer → low-pass", "signal", "Band-pass frequency response", {imageDark: "/media/tools/design/band-pass-filter-v2-dark.svg", imageLight: "/media/tools/design/band-pass-filter-v2-light.svg"}),
  "cascaded-opamp-gain-designer": visual("opamp", "Aᵥ,total = Aᵥ₁ × Aᵥ₂", "signal", "Cascaded inverting and non-inverting op amp stages", {imageDark: "/media/tools/design/cascaded-opamp-v2-dark.svg", imageLight: "/media/tools/design/cascaded-opamp-v2-light.svg"}),
  "control-design-assistant": visual("logic", "STATE → FLIP-FLOP → OUTPUT", "gold", "Logic state controls feeding a flip-flop and output", {imageDark: "/media/tools/design/control-memory-v2-dark.svg", imageLight: "/media/tools/design/control-memory-v2-light.svg"}),
  "logic-gate-designer": visual("logic", "INPUTS → GATE → OUTPUT", "gold", "Configurable logic gate with input switches and output", {imageDark: "/media/tools/design/logic-gates-v2-dark.svg", imageLight: "/media/tools/design/logic-gates-v2-light.svg"}),
  "bridge-rectifier-designer": visual("logic", "AC → DC → C", "gold", "Full-wave bridge rectifier and reservoir capacitor", {imageDark: "/media/tools/design/bridge-rectifier-v3-dark.svg", imageLight: "/media/tools/design/bridge-rectifier-v3-light.svg"}),
  "linear-regulator-stability-designer": visual("opamp", "Vin → REG → Vout", "signal", "Linear regulator with input and output capacitors", {imageDark: "/media/tools/design/linear-regulator-v3-dark.svg", imageLight: "/media/tools/design/linear-regulator-v3-light.svg"}),
  "buck-converter-designer": visual("bandpass", "SW → L → C", "gold", "Buck converter switch, inductor, and capacitor", {imageDark: "/media/tools/design/buck-converter-v3-dark.svg", imageLight: "/media/tools/design/buck-converter-v3-light.svg"}),
  "ohms-law-calculator": visual(
    "ohms",
    "V = I × R",
    "gold",
    "A resistor measured by a red-framed multimeter set to the 20 volt DC range, showing voltage, current, and resistance connected by Ohm's law",
    "/media/calculators/ohms-law-physical-measurement-v1.png"
  ),
  "resistor-color-code-calculator": visual(
    "resistor-bands-4",
    "4 bands",
    "signal",
    "A beige 4.7 kiloohm resistor with four color bands: yellow, violet, red, and gold",
    "/media/calculators/four-band-resistor-4k7-v1.png"
  ),
  "5-band-resistor-color-code-calculator": visual(
    "resistor-bands-5",
    "5 bands",
    "signal",
    "A light-blue 4.70 kiloohm precision resistor with five color bands: yellow, violet, black, brown, and brown",
    "/media/calculators/five-band-resistor-4k7-v3.png"
  ),
  "series-resistor-calculator": visual(
    "resistors-series",
    "Rₜ = ΣR",
    "gold",
    "One 1 kiloohm, one 2.2 kiloohm, and one 4.7 kiloohm resistor connected end to end in one current path for a 7.9 kiloohm total",
    "/media/calculators/series-resistors-no-scales-v2.png"
  ),
  "parallel-resistor-calculator": visual(
    "resistors-parallel",
    "1/Rₜ = Σ1/R",
    "gold",
    "Three parallel branches share the same two copper nodes and combine to approximately 600 ohms",
    "/media/calculators/parallel-resistors-physical-network-v1.png"
  ),
  "voltage-divider-calculator": visual(
    "voltage-divider",
    "Vout = Vin × R₂/(R₁+R₂)",
    "gold",
    "A 9 volt source drives R1, the Vout midpoint, and R2 in one closed series path returning to the negative terminal",
    "/media/calculators/voltage-divider-no-scales-v2.png"
  ),
  "rc-time-constant-calculator": visual(
    "rc-time",
    "τ = R × C",
    "signal",
    "A schematic resistor and polarized capacitor charge from 0 to 63.2 percent at one time constant and 99.3 percent at five time constants",
    "/media/calculators/rc-time-constant-no-scales-v3.png"
  ),
  "555-timer-astable-circuit-calculator": visual(
    "timer-astable",
    "f = 1.44/((R₁+2R₂)C)",
    "signal",
    "Through-hole NE555 timer in astable mode producing repeating output pulses after power-on",
    "/media/calculators/555-astable-through-hole-approved-v1.png"
  ),
  "555-timer-monostable-circuit-calculator": visual(
    "timer-monostable",
    "t = 1.1 × R × C",
    "signal",
    "NE555 timer and trigger button: one trigger produces one timed output pulse, then waits",
    "/media/calculators/555-monostable-trigger-approved-v1.png"
  ),
  "capacitive-reactance-calculator": visual(
    "capacitive-reactance",
    "Xc = 1/(2πfC)",
    "signal",
    "A 100 nF capacitor has 15.9 kiloohms reactance at 100 Hz and 3.18 kiloohms at 500 Hz: higher frequency lowers reactance",
    "/media/calculators/capacitive-reactance-frequency-v1.png"
  ),
  "led-series-resistor-calculator": visual(
    "led-resistor",
    "R = (Vs−Vf)/I",
    "gold",
    "A red LED with a 2 volt forward drop uses a 300 ohm series resistor to limit current to 10 milliamps from a 5 volt supply",
    "/media/calculators/led-series-resistor-300ohm-v1.png"
  ),
  "battery-life-calculator": visual(
    "battery-runtime",
    "time = capacity/load",
    "gold",
    "A 2000 mAh battery with 85 percent efficiency and 120 mA average load gives an estimated 14.2 hours of runtime",
    "/media/calculators/battery-life-runtime-v1.png"
  ),
  "rms-voltage-calculator": visual(
    "rms-wave",
    "Vrms = Vpk/√2",
    "signal",
    "A zero-offset sine wave with 10 volt peaks and a positive RMS reference of 7.07 volts",
    "/media/calculators/rms-voltage-sine-v1.png"
  ),
  "high-pass-filter-calculator": visual(
    "filter-high-pass",
    "fc = 1/(2πRC)",
    "signal",
    "A series capacitor and resistor to ground form a high-pass filter with a 995 Hz cutoff and 0.707 gain at cutoff",
    "/media/calculators/high-pass-filter-response-v1.png"
  ),
  "low-pass-filter-calculator": visual(
    "filter-low-pass",
    "fc = 1/(2πRC)",
    "signal",
    "A series resistor and capacitor to ground form a low-pass filter with a 995 Hz cutoff, passing low frequencies and attenuating high frequencies",
    "/media/calculators/low-pass-filter-response-v1.png"
  ),
  "op-amp-gain-calculator": visual(
    "op-amp",
    "Av = 1 + Rf/Rg",
    "gold",
    "Op-amp symbol with separate inverting and non-inverting gain formulas: minus Rf over Rin, and one plus Rf over Rg",
    "/media/calculators/op-amp-gain-modes-v1.png"
  ),
  "capacitor-code-value-converter": visual(
    "capacitor-code",
    "XY × 10ᶻ pF",
    "warm",
    "Capacitor marking 104 decoded as 10 times 10 to the fourth picofarads, or 100 nanofarads",
    "/media/calculators/capacitor-code-104-v1.png"
  ),
  "capacitance-conversion": visual(
    "capacitance-scale",
    "F ↔ µF ↔ nF ↔ pF",
    "warm",
    "One microfarad equals 0.000001 farads, 1000 nanofarads, or one million picofarads",
    "/media/calculators/capacitance-units-v1.png"
  ),
  "temperature-conversion": visual(
    "temperature-scale",
    "°C ↔ °F ↔ K",
    "warm",
    "25 degrees Celsius equals 77 degrees Fahrenheit and 298.15 kelvin",
    "/media/calculators/temperature-conversion-v1.png"
  ),
  "decimal-binary-octal-hex-converter": visual(
    "number-bases",
    "10 ↔ 2 ↔ 8 ↔ 16",
    "signal",
    "Decimal 26 equals binary 00011010, octal 32, and hexadecimal 1A",
    "/media/calculators/number-bases-v1.png"
  ),
  "binary-bit-shift-calculator": visual(
    "bit-shift",
    "x << n    x >> n",
    "signal",
    "Eight-bit logical shifts: 5 shifted left by two becomes 20, and 20 shifted right by two becomes 5",
    "/media/calculators/binary-bit-shift-v1.png"
  ),
  "ones-1s-complement-calculator": visual(
    "ones-complement",
    "0 ↔ 1",
    "signal",
    "One's complement flips every bit: 00010010 becomes 11101101, without addition",
    "/media/calculators/ones-complement-v1.png"
  ),
  "twos-2s-complement-calculator": visual(
    "twos-complement",
    "invert + 1",
    "signal",
    "Two's complement: invert 00010010 then add one to obtain 11101110, representing minus 18 in signed eight-bit form",
    "/media/calculators/twos-complement-v1.png"
  ),
  "ascii-to-hex-converter": visual(
    "ascii-to-hex",
    "A → 41",
    "signal",
    "ASCII A encodes as hexadecimal 41; Hello encodes as 48 65 6C 6C 6F",
    "/media/calculators/ascii-to-hex-v1.png"
  ),
  "hex-to-ascii-converter": visual(
    "hex-to-ascii",
    "41 → A",
    "signal",
    "Hexadecimal 41 decodes as ASCII A; 48 65 6C 6C 6F decodes as Hello",
    "/media/calculators/hex-to-ascii-v1.png"
  ),
  "log-base-2-calculator": visual(
    "log-two",
    "y = log₂(x)",
    "signal",
    "Log base two of 32 is 5: five doublings take one to 32",
    "/media/calculators/log-base-two-v1.png"
  ),
  "binary-calculator": visual(
    "binary-arithmetic",
    "1010 + 0110",
    "signal",
    "Binary 1010 plus 0110 equals 10000, corresponding to decimal 10 plus 6 equals 16",
    "/media/calculators/binary-calculator-v1.png"
  ),
  "hex-calculator": visual(
    "hex-arithmetic",
    "0xA + 0x6",
    "signal",
    "Hexadecimal 0xA plus 0x6 equals 0x10, corresponding to decimal 16",
    "/media/calculators/hex-calculator-v1.png"
  ),
  "acceleration-calculator": visual(
    "acceleration",
    "a = Δv/Δt",
    "gold",
    "A trolley changes velocity from zero to 20 meters per second in five seconds: acceleration is 4 meters per second squared",
    "/media/calculators/acceleration-v1.png"
  ),
  "force-mass-acceleration-calculator": visual(
    "force-mass",
    "F = m × a",
    "gold",
    "A net force of 10 newtons accelerates a 2 kilogram block at 5 meters per second squared",
    "/media/calculators/force-mass-acceleration-v1.png"
  ),
  "speed-distance-time-calculator": visual(
    "speed-distance",
    "d = v × t",
    "gold",
    "A car moving at a constant 10 meters per second travels 100 meters in 10 seconds",
    "/media/calculators/speed-distance-time-v1.png"
  ),
  "wavelength-calculator": visual(
    "wavelength",
    "λ = v/f",
    "signal",
    "One wavelength measured between two matching wave peaks",
    "/media/calculators/wavelength-v1.png"
  ),
  "frequency-to-period-calculator": visual(
    "frequency-period",
    "T = 1/f",
    "signal",
    "Wave cycles relating frequency to one period",
    "/media/calculators/frequency-period-v1.png"
  ),
  "percentage-change-calculator": visual(
    "percentage-change",
    "Δ% = (new−old)/old × 100",
    "gold",
    "An original value changing to a new value by a measured percentage",
    "/media/calculators/percentage-change-v1.png"
  ),
  "square-root-calculator": visual(
    "square-root",
    "x = y²",
    "warm",
    "A square area resolving to the length of one side",
    "/media/calculators/square-root-v1.png"
  ),
  "cube-root-calculator": visual(
    "cube-root",
    "x = y³",
    "warm",
    "A cube volume resolving to the length of one edge",
    "/media/calculators/cube-root-v1.png"
  )
});
