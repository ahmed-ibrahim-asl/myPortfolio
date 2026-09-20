const concepts = {
  "555-astable-through-hole-approved-v1": "a 555 timer chip repeatedly charging and discharging one capacitor, shown as a simple looping pulse",
  "555-monostable-trigger-approved-v1": "a push button triggering one clean timed pulse from a 555 timer chip",
  "acceleration-v1": "a small vehicle with three progressively longer speed arrows",
  "ascii-to-hex-v1": "a letter card flowing through a converter into compact hexadecimal blocks",
  "battery-life-runtime-v1": "a battery powering a small device while a clock measures remaining runtime",
  "binary-bit-shift-v1": "a row of binary tiles sliding one position to the right",
  "binary-calculator-v1": "two rows of binary tiles combining inside a calculator",
  "capacitance-units-v1": "one capacitor beside a clear ladder of larger and smaller capacitor sizes",
  "capacitive-reactance-frequency-v1": "a capacitor resisting a slow wave strongly and a fast wave weakly",
  "capacitor-code-104-v1": "a ceramic disc capacitor with three simple code marks being decoded into capacitance",
  "cube-root-v1": "a large cube transforming into one highlighted edge length",
  "five-band-resistor-4k7-v3": "a single five-band resistor with its five colored bands clearly separated",
  "force-mass-acceleration-v1": "a hand pushing a box, with force arrow, box mass, and motion arrow",
  "four-band-resistor-4k7-v1": "a single four-band resistor with its four colored bands clearly separated",
  "frequency-period-v1": "one clean wave with a single cycle bracket and a clock",
  "hex-calculator-v1": "hexadecimal tiles combining inside a compact calculator",
  "hex-to-ascii-v1": "hexadecimal blocks flowing through a converter into one readable letter card",
  "high-pass-filter-response-v1": "a filter gate blocking a slow wave and allowing a fast wave through",
  "led-series-resistor-300ohm-v1": "a battery, resistor, and glowing LED connected in one simple series loop",
  "log-base-two-v1": "a branching binary tree collapsing into a small level count",
  "low-pass-filter-response-v1": "a filter gate allowing a slow wave through and blocking a fast wave",
  "number-bases-v1": "the same quantity represented by grouped binary, decimal, and hexadecimal tiles",
  "ohms-law-physical-measurement-v1": "a battery driving current through one resistor with a voltmeter across it",
  "ones-complement-v1": "a row of binary tiles flipping every dark tile to light and light to dark",
  "op-amp-gain-modes-v1": "an operational amplifier triangle enlarging a small input wave into a larger output wave",
  "parallel-resistors-physical-network-v1": "two resistors on separate branches sharing the same battery terminals",
  "percentage-change-v1": "a small bar growing into a taller bar with an upward change arrow",
  "rc-time-constant-no-scales-v3": "a capacitor charging through one resistor as a curve rises toward full",
  "rms-voltage-sine-v1": "a sine wave visually balancing into an equivalent steady voltage level",
  "series-resistors-no-scales-v2": "three resistors connected end to end in one simple path",
  "speed-distance-time-v1": "a vehicle traveling along a measured road while a clock runs",
  "square-root-v1": "a large square transforming into one highlighted side length",
  "temperature-conversion-v1": "one thermometer bridging a cold Celsius scale and warm Fahrenheit scale",
  "twos-complement-v1": "binary tiles flipping and then receiving one additional unit tile",
  "voltage-divider-no-scales-v2": "two stacked resistors across a battery with the middle output node highlighted",
  "wavelength-v1": "a clean wave with the distance between two peaks highlighted",
  "aes-hex-calculator-instrument-v2": "a data block entering a strong lock and leaving as scrambled blocks",
  "affine-cipher-instrument-v2": "letter tiles passing through two simple transformation gears",
  "hash-generator-instrument-v2": "a document entering a one-way press and leaving as a unique fingerprint",
  "hill-cipher-instrument-v2": "a small grid of letter tiles rotating through a matrix transformation",
  "playfair-cipher-instrument-v2": "pairs of letter tiles moving through a five-by-five key grid",
  "transposition-cipher-instrument-v2": "the same letter tiles being rearranged into a new order without changing",
  "vigenere-cipher-instrument-v2": "message letter tiles and key letter tiles combining through a cipher wheel",
  "tool-ai-script-generator-v4": "a simple instruction card becoming a clean automation script inside a friendly terminal window",
  "tool-battery-estimator-v2": "a solar panel charging a satellite battery across day and night",
  "tool-pid-simulator-v4": "a target line and a moving response curve smoothly settling onto it",
  "tool-rf-antenna-v1": "an antenna radiating clear concentric radio waves",
  "tool-rf-frequency-bands-v1": "a radio spectrum split into a few distinct colored frequency bands",
  "tool-rf-multiple-access-v1": "three users sharing one radio tower through separate clean signal paths",
  "tool-rf-noise-gt-v1": "a faint signal passing through receiver stages while noise is reduced",
  "tool-rf-path-v1": "a transmitter and receiver separated by hills with a clear radio path between them",
  "tool-satellite-doppler-delay-v1": "a moving satellite sending waves toward a ground dish, with compressed waves ahead and stretched waves behind",
  "tool-satellite-link-budget-v1": "a satellite and ground dish connected by a signal beam that weakens across space",
  "tool-satellite-look-angles-v1": "a ground dish pointing toward a satellite with elevation and direction arcs",
  "tool-satellite-orbit-v1": "Earth with one satellite following a clear elliptical orbit",
  "tool-satellite-power-lifetime-v1": "a satellite solar panel charging a battery beside a simple mission timeline",
  "tool-security-mission-v4": "a protected digital mission path passing through checkpoints toward a shield",
  "tool-sensor-code-generator-v4": "a physical sensor connected to a microcontroller, producing a clean code card"
};

function sourceForName(name) {
  if (name.startsWith("tool-")) return `/media/tools/${name}.png`;
  if (name.includes("instrument")) return `/media/tools/design/${name}.png`;
  return `/media/calculators/${name}.png`;
}

export const toolMobileImagePrompts = Object.freeze(Object.fromEntries(
  Object.entries(concepts).map(([name, concept]) => [sourceForName(name), concept])
));

export function buildToolMobileImagePrompt(source) {
  const variation = Object.values(toolImageVariationPrompts).find(item => item.desktopSource === source);
  if (variation) return variation.mobilePrompt;
  const concept = toolMobileImagePrompts[source];
  if (!concept) throw new Error(`No mobile image prompt registered for ${source}`);
  return [
    "Use case: scientific-educational",
    "Asset type: square mobile tool-card cover",
    `Primary request: Create an instantly understandable visual metaphor for this tool: ${concept}.`,
    "Audience: non-technical visitors should understand the purpose at a glance.",
    "Style/medium: polished minimal 3D editorial illustration with crisp geometric forms and subtle depth, matching a premium engineering portfolio.",
    "Composition/framing: one centered hero concept, large touch-friendly shapes, generous breathing room, readable at thumbnail size, square crop.",
    "Color palette: near-black navy background, cool blue and cyan structure, one restrained amber highlight, high contrast.",
    "Constraints: scientifically honest, only the essential objects, no UI chrome, no decorative clutter.",
    "Avoid: all text, letters, numbers, equations, labels, logos, watermarks, tiny details, photoreal people."
  ].join("\n");
}

const variationConcepts = Object.freeze({
  gradify: ["gradify", "a university grade card, a rising progress path, and a graduation cap showing grades becoming a graduation plan"],
  "smps-designer": ["smps-designer", "a power switch repeatedly filling a magnetic transformer and delivering smooth DC power to a load"],
  "rot-explorer": ["rot-explorer", "a ring of alphabet tiles rotating so a readable message becomes shifted letters"],
  "air-core-coil-designer": ["air-core-coil-designer", "copper wire wrapping into a neat air-core coil while its diameter and turn spacing are visibly adjustable"],
  "lc-resonance-designer": ["lc-resonance-designer", "a coil and capacitor exchanging energy while one clean wave grows at their shared resonant frequency"],
  "band-pass-filter-designer": ["band-pass-filter-designer", "a mixed group of slow, middle, and fast waves entering a filter that allows only the middle band through"],
  "cascaded-opamp-gain-designer": ["cascaded-opamp-gain-designer", "a small signal passing through two amplifier triangles and becoming larger at each stage"],
  "control-design-assistant": ["control-design-assistant", "an input decision flowing through a simple memory block to a controlled output lamp"],
  "logic-gate-designer": ["logic-gate-designer", "two physical input switches entering a logic gate and controlling one output lamp"],
  "bridge-rectifier-designer": ["bridge-rectifier-designer", "an alternating wave entering four diodes and leaving as a one-direction pulsing voltage smoothed by a capacitor"],
  "linear-regulator-stability-designer": ["linear-regulator-stability-designer", "a noisy high voltage entering a regulator and leaving as a calm steady lower voltage supported by two capacitors"],
  "buck-converter-designer": ["buck-converter-designer", "a fast power switch feeding an inductor and capacitor to turn a high DC voltage into a lower steady DC voltage"],
  "resistor-color-code-calculator": ["four-band-resistor", "one beige resistor whose four large color bands map to resistance and tolerance"],
  "5-band-resistor-color-code-calculator": ["five-band-precision-resistor", "one blue precision resistor whose five large color bands map to a more precise resistance"],
  "series-resistor-calculator": ["series-resistors", "three resistors connected end to end in one continuous current path, making a larger total resistance"],
  "parallel-resistor-calculator": ["parallel-resistors", "three resistors on separate branches between the same two rails, giving current multiple paths"],
  "voltage-divider-calculator": ["voltage-divider", "two stacked resistors across a battery with a clear midpoint tap producing a smaller voltage"],
  "led-series-resistor-calculator": ["led-current-limiter", "a battery, one resistor, and a safely glowing LED in one simple current loop"]
});

function buildVariationPrompt(concept, mobile) {
  return [
    "Use case: scientific-educational",
    `Asset type: ${mobile ? "square mobile" : "landscape desktop"} tool-card cover`,
    `Primary request: Create an instantly understandable visual metaphor for this tool: ${concept}.`,
    "Audience: non-technical visitors should understand the purpose at a glance.",
    "Style/medium: polished minimal 3D editorial illustration with crisp geometric forms and subtle depth, matching a premium engineering portfolio.",
    mobile
      ? "Composition/framing: one centered hero concept, large touch-friendly shapes, generous breathing room, readable at thumbnail size, square crop."
      : "Composition/framing: wide 16:9 scene with the main object on a clear signal path and one supporting before/after or cause/effect relationship.",
    "Color palette: near-black navy background, cool blue and cyan structure, one restrained amber highlight, high contrast.",
    "Constraints: scientifically honest topology, only essential objects, no UI chrome, no decorative clutter.",
    "Avoid: all text, letters, numbers, equations, labels, logos, watermarks, tiny details, photoreal people."
  ].join("\n");
}

export const toolImageVariationPrompts = Object.freeze(Object.fromEntries(
  Object.entries(variationConcepts).map(([id, [name, concept]]) => [id, Object.freeze({
    desktopSource: `/media/tools/variations/${name}-desktop-v1.png`,
    mobileSource: `/media/tools/mobile/${name}-mobile-v2.png`,
    desktopPrompt: buildVariationPrompt(concept, false),
    mobilePrompt: buildVariationPrompt(concept, true)
  })])
));
