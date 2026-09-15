export type ToolSearchQuestion = {
  question: string;
  answer: string;
};

export type ToolSearchHook = {
  slug: string;
  seoTitle: string;
  metaDescription: string;
  primaryQuestion: string;
  directAnswer: string;
  usefulFor: string[];
  outputs: string[];
  limitations: string[];
  scenario: { title: string; description: string };
  questions: ToolSearchQuestion[];
  evidence: { title: string; description: string; href: string };
  cta: { title: string; description: string; href: "/contact/" };
  reviewedOn: "2026-09-15";
};

const reviewedOn = "2026-09-15" as const;

export const toolSearchHooks = {
  "smps-designer": {
    slug: "smps-designer",
    seoTitle: "Flyback SMPS Design Calculator for DCM Supplies",
    metaDescription: "Estimate a first-pass DCM flyback SMPS operating point, transformer ratio, peak current, duty cycle, and switch stress for AC or DC input supplies.",
    primaryQuestion: "How do I estimate a DCM flyback SMPS operating point?",
    directAnswer: "Use this flyback SMPS designer to estimate duty cycle, primary inductance, turns ratio, peak current, and semiconductor stress for a discontinuous-conduction operating point. The result gives you a first design to examine, not a production-ready mains supply. Magnetics, snubbers, feedback stability, isolation, EMI, and safety still need engineering review.",
    usefulFor: ["Comparing an AC-input flyback with a DC-input isolated converter", "Checking whether a target power and switching frequency produce practical first-pass stresses"],
    outputs: ["Duty cycle, turns ratio, primary inductance, and peak current", "Estimated MOSFET, diode, and winding stress for the selected operating point"],
    limitations: ["The model does not design insulation, creepage, clearance, EMI filtering, or a certified transformer", "It does not replace loop-compensation, leakage-inductance, snubber, thermal, and bench validation"],
    scenario: { title: "Start with the energy path", description: "Enter the input range, output target, efficiency estimate, and switching frequency. Compare the calculated stresses with realistic controller, MOSFET, diode, core, and winding limits before selecting parts." },
    questions: [
      { question: "Is this enough to build a mains-powered SMPS?", answer: "No. Mains designs require isolation, protection, transformer construction, creepage, clearance, fusing, EMI, thermal, and regulatory work that a browser calculator cannot approve." },
      { question: "Why does switching frequency change the transformer design?", answer: "A higher frequency transfers energy in shorter cycles and can reduce the inductance and core size, but it also raises switching, magnetic, gate-drive, and EMI losses." },
      { question: "What should I verify in a controller datasheet?", answer: "Check startup behavior, maximum duty cycle, current-sense threshold, gate-drive capability, compensation method, protection modes, and the voltage range used by the controller itself." },
    ],
    evidence: { title: "AgriBot system architecture", description: "See how power, sensing, control, connectivity, and an operator interface fit inside one embedded system. This project is system evidence, not a claim that it uses the flyback values shown here.", href: "/work/embedded-iot/agribot-architecture/" },
    cta: { title: "Need a power stage reviewed as part of a prototype?", description: "Send the input range, output rails, load profile, isolation need, size limit, and parts you have already considered.", href: "/contact/" },
    reviewedOn,
  },
  "buck-converter-designer": {
    slug: "buck-converter-designer",
    seoTitle: "Buck Converter Inductor and Capacitor Calculator",
    metaDescription: "Estimate buck converter duty cycle, inductor, output capacitor, ripple current, peak current, and first-pass power loss from your design targets.",
    primaryQuestion: "How do I choose first-pass buck inductor and capacitor values?",
    directAnswer: "This buck converter calculator turns input voltage, output voltage, load current, switching frequency, and ripple targets into first-pass inductor and capacitor values. It also estimates duty cycle, peak current, and power loss. Use the result to compare parts, then verify controller limits, transient response, saturation, thermal behavior, and layout with the selected datasheets.",
    usefulFor: ["Sizing an initial inductor from an allowed ripple-current target", "Estimating output capacitance from switching frequency and voltage ripple"],
    outputs: ["Ideal duty cycle, inductor value, ripple current, and peak current", "Output capacitance estimate and a first power-loss breakdown"],
    limitations: ["The capacitor calculation does not model the full impedance curve, aging, bias derating, or control-loop response", "The loss estimate cannot approve MOSFET temperature, inductor saturation, compensation, or PCB layout"],
    scenario: { title: "Size from ripple, then check the parts", description: "Choose a ripple-current fraction that the load and inductor can tolerate. Use the calculated inductance and peak current to shortlist parts, then check saturation current, DCR, core loss, capacitor ESR, and the controller's recommended range." },
    questions: [
      { question: "Can I use the nearest standard inductor value?", answer: "Usually, but recalculate ripple and peak current with the actual value. A smaller inductor increases ripple and peak current; a larger one changes transient response and may cost more or occupy more area." },
      { question: "Why is the ceramic capacitor's printed value not enough?", answer: "Ceramic capacitance can fall under DC bias. Package size, dielectric, temperature, tolerance, and voltage rating determine how much capacitance remains in operation." },
      { question: "Does a correct calculation guarantee a stable converter?", answer: "No. Stability depends on the controller topology, compensation, output network, load range, layout, and the component models used by the manufacturer." },
    ],
    evidence: { title: "Aqua Sync 2.0.0", description: "Inspect a connected sensing system where firmware, displays, sensors, and board integration must work together. The project does not claim to use the converter values generated here.", href: "/work/embedded-iot/aqua-sync/" },
    cta: { title: "Building a battery or DC-powered device?", description: "Share the voltage range, rails, current profile, noise limits, board area, and preferred controller so the power stage can be reviewed in context.", href: "/contact/" },
    reviewedOn,
  },
  "control-design-assistant": {
    slug: "control-design-assistant",
    seoTitle: "Flip-Flop, Counter and Register Selection Assistant",
    metaDescription: "Describe the memory or state behavior you need and compare flip-flops, counters, registers, and shift registers with a live state table.",
    primaryQuestion: "Which flip-flop, counter, register, or shift register matches my memory behavior?",
    directAnswer: "Describe the behavior first: how many bits you must store, whether changes happen on a clock edge, whether the state toggles, counts, or shifts, and whether you need explicit set or reset. The assistant maps those choices to a suitable flip-flop, counter, register, or shift-register family and shows the related state behavior.",
    usefulFor: ["Choosing a memory element without starting from a part number", "Teaching the connection between desired state behavior and sequential logic"],
    outputs: ["A recommended memory element with a plain-language reason", "A state table and a common IC family to investigate"],
    limitations: ["The recommendation does not check propagation delay, fan-out, clock quality, package, voltage, or temperature", "It does not design metastability protection, reset sequencing, or a complete synchronous state machine"],
    scenario: { title: "Begin with what the output must remember", description: "If one bit must copy an input only on a clock edge, the behavior points toward a D flip-flop. If one event must toggle the state, a T behavior or configured JK device may fit better." },
    questions: [
      { question: "Do I need a flip-flop or a latch?", answer: "Use an edge-triggered flip-flop when state changes on a clock edge. A latch responds while its enable level is active, which changes timing analysis and can allow the input to pass through during that window." },
      { question: "When should I use a counter instead of several flip-flops?", answer: "Choose a counter when the required next state follows a count sequence. A counter packages the state transitions and often provides carry, reset, and direction controls." },
      { question: "What does a shift register solve?", answer: "A shift register moves stored bits from one position to the next on clock events. It helps with serial-to-parallel conversion, parallel-to-serial conversion, delay lines, and simple bit sequences." },
    ],
    evidence: { title: "ToolGuard", description: "ToolGuard shows how borrowing, availability, and overdue behavior become a hardware and application control system. It is evidence of state-driven system design, not proof of a particular flip-flop IC.", href: "/work/embedded-iot/toolguard/" },
    cta: { title: "Need to turn control behavior into electronics?", description: "Describe the inputs, outputs, timing, retained state, reset behavior, voltage levels, and load current. The next step can be gates, logic ICs, a microcontroller, or a mixed design.", href: "/contact/" },
    reviewedOn,
  },
  "logic-gate-designer": {
    slug: "logic-gate-designer",
    seoTitle: "Logic Gate Circuit and Truth Table Designer",
    metaDescription: "Set digital input conditions and generate a logic-gate network with its complete truth table for learning and early control-circuit design.",
    primaryQuestion: "How can I turn ON and OFF requirements into a logic-gate circuit and truth table?",
    directAnswer: "Choose the input combinations that should switch the output on. The designer converts those conditions into a Boolean expression, a gate network, and a complete truth table. It helps you verify combinational behavior before selecting ICs or transistor stages. Timing, noisy inputs, output current, and safe power switching still require a hardware design step.",
    usefulFor: ["Translating written ON and OFF conditions into combinational logic", "Checking every input combination before building gates or firmware"],
    outputs: ["A Boolean expression and interactive logic-gate diagram", "A truth table covering every configured input combination"],
    limitations: ["The generated network does not model propagation delay, switch bounce, hazards, or asynchronous timing", "Logic outputs cannot drive arbitrary motors, relays, lamps, or mains loads without suitable interface and protection stages"],
    scenario: { title: "Define the output row by row", description: "List each input as a condition the circuit can observe, then mark the combinations that should activate the output. Verify the truth table before deciding whether gates, programmable logic, or firmware gives the cleanest implementation." },
    questions: [
      { question: "Should I build the result with gates or a microcontroller?", answer: "Use gates when the behavior is small, fixed, fast, and easy to verify. A microcontroller fits changing rules, timing, communication, diagnostics, and larger state-based behavior." },
      { question: "Can a logic gate drive a relay directly?", answer: "Usually not. Check the gate's output-current limit and use a transistor or MOSFET driver, flyback protection for an inductive coil, and a power supply sized for the load." },
      { question: "Why might a correct truth table still fail on hardware?", answer: "Real inputs can bounce or change at different times. Propagation delay, floating pins, voltage-level mismatch, noise, and missing pull resistors can create behavior that the ideal truth table does not show." },
    ],
    evidence: { title: "Multi-MCU Security Lock", description: "This access-control project separates interface and electronic control responsibilities. It demonstrates control architecture; it does not claim the generated gate network appears in that implementation.", href: "/work/embedded-iot/multi-mcu-security-lock/" },
    cta: { title: "Have a control requirement but no circuit yet?", description: "Send the input states, timing rules, output loads, supply voltage, and failure behavior. The design can then move from Boolean logic to practical driver electronics.", href: "/contact/" },
    reviewedOn,
  },
  "cascaded-opamp-gain-designer": {
    slug: "cascaded-opamp-gain-designer",
    seoTitle: "Cascaded Op-Amp Gain and Resistor Designer",
    metaDescription: "Split a target gain across inverting or non-inverting op-amp stages, calculate resistor ratios, and inspect the complete cascaded circuit.",
    primaryQuestion: "How do I split a required gain across multiple op-amp stages?",
    directAnswer: "Set the input signal, target gain, and stage configuration to divide amplification across several op-amps. The designer calculates each ideal stage gain, resistor relationship, and final output, then draws the full cascade. Check supply rails, input and output range, bandwidth, noise, bias current, stability, and resistor tolerances before selecting the IC.",
    usefulFor: ["Avoiding one impractically high-gain op-amp stage", "Comparing inverting and non-inverting stage arrangements"],
    outputs: ["Per-stage gain, total ideal gain, and resistor values", "Individual and complete circuit views with common IC options"],
    limitations: ["Ideal gain does not include gain-bandwidth limits, slew rate, noise, offset, bias current, loading, or tolerance", "The drawing omits the final PCB layout, decoupling strategy, input protection, and complete power connections"],
    scenario: { title: "Share gain without losing bandwidth", description: "Start from the required total gain and signal bandwidth. Split the gain into practical stages, then check that each selected op-amp has enough gain-bandwidth product, slew rate, common-mode range, and output swing." },
    questions: [
      { question: "Why use two stages instead of one high-gain stage?", answer: "Multiple stages can make resistor ratios and bandwidth easier to manage. They also let you place filtering or bias control between stages, though every stage adds noise, offset, parts, and stability concerns." },
      { question: "Will the calculated output voltage always be available?", answer: "No. The output clips when the requested voltage or current exceeds the op-amp's output swing, current limit, slew rate, or supply rails." },
      { question: "Can I choose any resistor pair with the correct ratio?", answer: "The ratio sets ideal gain, but absolute values affect noise, bias-current error, loading, power, and interaction with input capacitance. Use the datasheet and circuit impedance requirements to choose the range." },
    ],
    evidence: { title: "Real-Time Muscle Activity Monitoring", description: "See a complete sensing system that captures and displays a changing signal. This is adjacent signal-chain evidence and does not claim the displayed op-amp stages or resistor values were used.", href: "/work/embedded-iot/muscle-activity-monitoring/" },
    cta: { title: "Need a sensor signal chain sized for real hardware?", description: "Share the sensor range, bandwidth, offset, supply rails, ADC range, noise target, and available op-amps so the gain stages can be reviewed together.", href: "/contact/" },
    reviewedOn,
  },
  "555-timer-astable-circuit-calculator": {
    slug: "555-timer-astable-circuit-calculator",
    seoTitle: "555 Astable Frequency and Duty Cycle Calculator",
    metaDescription: "Calculate NE555 astable frequency, high time, low time, and duty cycle from two resistors and one timing capacitor with a live waveform.",
    primaryQuestion: "How do I calculate 555 astable frequency and duty cycle?",
    directAnswer: "Enter the two timing resistors and capacitor to calculate a standard 555 astable oscillator's high time, low time, frequency, and duty cycle. The live behavior view shows how the capacitor charges and discharges. Use datasheet limits and measured component values when frequency accuracy, output loading, temperature, or a near 50 percent duty cycle matters.",
    usefulFor: ["Choosing first-pass timing components for a free-running 555 oscillator", "Seeing how R1, R2, and C affect high time, low time, and duty cycle"],
    outputs: ["Oscillation frequency, period, high time, and low time", "Duty cycle and a live charge-discharge waveform"],
    limitations: ["The equation assumes the standard astable connection and ideal threshold fractions", "Real timing shifts with component tolerance, leakage, supply conditions, temperature, and the specific bipolar or CMOS timer"],
    scenario: { title: "Tune timing with the components you can buy", description: "Calculate a starting combination, then substitute available resistor and capacitor values and recalculate. Check minimum resistance, output loading, capacitor leakage, and frequency limits in the selected 555 datasheet." },
    questions: [
      { question: "Can the standard 555 astable circuit produce exactly 50 percent duty cycle?", answer: "The standard two-resistor connection keeps the charge path longer than the discharge path, so its duty cycle stays above 50 percent. Modified diode paths or other oscillator topologies can separate the timings." },
      { question: "Should I use a bipolar NE555 or a CMOS timer?", answer: "Choose from supply voltage, current consumption, input thresholds, output drive, timing range, and leakage. CMOS versions often suit low-power or long-time-constant designs, but the datasheet decides." },
      { question: "Why does my measured frequency differ from the calculation?", answer: "Resistor and capacitor tolerances, capacitor leakage, breadboard capacitance, supply variation, timer thresholds, and measurement loading all move the real frequency." },
    ],
    evidence: { title: "Smart Mosque Model", description: "This project shows sensor-triggered automation and energy control in a physical model. It is adjacent control-system evidence, not a claim that the project uses a 555 oscillator.", href: "/work/embedded-iot/smart-mosque-model/" },
    cta: { title: "Need timing behavior inside a larger control circuit?", description: "Send the required pulse or frequency range, supply voltage, output load, accuracy, and operating conditions to compare a 555, logic oscillator, or microcontroller timer.", href: "/contact/" },
    reviewedOn,
  },
  "pid-simulator": {
    slug: "pid-simulator",
    seoTitle: "Interactive PID Tuning Simulator for Drones and Cars",
    metaDescription: "Change P, I, and D gains and watch rise time, overshoot, steady-state error, settling, and line-following behavior in a live control simulation.",
    primaryQuestion: "How do P, I, and D gains change rise time, overshoot, and settling?",
    directAnswer: "Use the guided lessons to change proportional, integral, and derivative gains while a simulated drone holds altitude or a car follows a line. The simulator exposes overshoot, settling, and tracking error so you can connect each term to visible behavior. The gains are educational starting points and do not transfer directly to a physical plant.",
    usefulFor: ["Learning the effect of each PID term before tuning hardware", "Comparing the same controller idea on altitude and line-following problems"],
    outputs: ["Live motion plus overshoot, settling, and steady-state error for the drone", "Average and maximum line-tracking error for the car"],
    limitations: ["The simulated plant omits actuator limits, sample time, sensor noise, delays, saturation, and many real dynamics", "Stable gains in this model do not guarantee stable or safe behavior on a real machine"],
    scenario: { title: "Tune one effect at a time", description: "Raise proportional gain until response becomes useful, add integral action only when persistent error matters, then add derivative damping while watching noise sensitivity and overshoot. Recheck every term after the plant or operating point changes." },
    questions: [
      { question: "What does proportional gain change first?", answer: "Proportional gain strengthens correction for the current error. More gain can improve response, but excessive gain can create oscillation, overshoot, actuator saturation, or sensitivity to unmodeled dynamics." },
      { question: "When should I add integral action?", answer: "Add integral action when a persistent disturbance leaves steady-state error. Limit it when actuators saturate, because accumulated error can cause windup and a slow recovery." },
      { question: "Why can derivative action become noisy?", answer: "Derivative action responds to rapid change. Sensor noise contains rapid changes too, so practical controllers filter the derivative term and choose sample timing carefully." },
    ],
    evidence: { title: "Wireless ROV Control System", description: "See an ESP32 and NRF24L01+ architecture built for bidirectional commands and telemetry. It demonstrates control-system integration without claiming the simulator's gains were used on the vehicle.", href: "/work/embedded-iot/wireless-rov-control/" },
    cta: { title: "Need a controller connected to sensors and actuators?", description: "Send the plant behavior, sample rate, sensors, actuator limits, target response, and any test logs. Control design starts with the system, not copied gains.", href: "/contact/" },
    reviewedOn,
  },
  "sensor-code-generator": {
    slug: "sensor-code-generator",
    seoTitle: "ESP32 and Arduino Sensor Code Generator",
    metaDescription: "Generate a runnable starting point for ESP32, Arduino, ESP-IDF, and PlatformIO sensors and communication interfaces with editable configuration.",
    primaryQuestion: "How can I generate a safe starting point for ESP32 or Arduino sensor code?",
    directAnswer: "Choose a sensor or communication target, framework, protocol, and hardware parameters to generate a complete starting example. The output handles the selected configuration and shows the code you must adapt. Check the module voltage, pin mapping, bus addresses, library version, error handling, and electrical connections before running it on hardware.",
    usefulFor: ["Starting sensor bring-up without rebuilding common boilerplate", "Comparing Arduino, ESP-IDF, and PlatformIO configurations for supported targets"],
    outputs: ["A complete editable code example for the selected target and environment", "Pin, protocol, address, and device parameters reflected in the generated code"],
    limitations: ["Generated code cannot detect your exact board revision, wiring, library release, or module voltage", "A starting example does not replace timeouts, recovery, calibration, security, power management, and application-specific error handling"],
    scenario: { title: "Generate, wire, then prove one reading", description: "Select the exact target and environment, verify voltage and pins against both datasheets, compile the generated project, and test one raw reading before adding networking, storage, displays, or application logic." },
    questions: [
      { question: "Can I paste the generated code and connect any module with the same name?", answer: "Check the breakout-board revision, logic voltage, address straps, pin labels, and library compatibility first. Modules sold under one name can use different regulators or pin arrangements." },
      { question: "Why does an I2C sensor fail even when the code compiles?", answer: "Common causes include wrong SDA or SCL pins, missing pull-ups, an unexpected address, voltage mismatch, poor grounding, bus speed, wiring length, or a module that never powers up correctly." },
      { question: "What should I add before using generated code in a product?", answer: "Add bounded retries, timeouts, error reporting, recovery, calibration, watchdog behavior, power-state handling, version control, and tests for unplugged or invalid sensors." },
    ],
    evidence: { title: "AgriBot system architecture", description: "AgriBot combines sensors, edge processing, connectivity, and an operator application. It shows the broader engineering work that follows successful device bring-up.", href: "/work/embedded-iot/agribot-architecture/" },
    cta: { title: "Need the generated driver integrated into a complete device?", description: "Share the board, module, framework, communication path, sampling rate, power mode, and expected failure behavior.", href: "/contact/" },
    reviewedOn,
  },
  "battery-estimator": {
    slug: "battery-estimator",
    seoTitle: "ESP32 Battery Life and Duty Cycle Calculator",
    metaDescription: "Estimate ESP32 battery life, average current, energy per cycle, Wi-Fi cost, and active duty cycle from realistic operating phases.",
    primaryQuestion: "How long will an ESP32 battery last with active and sleep duty cycles?",
    directAnswer: "Enter usable battery capacity plus sleep, active, and optional Wi-Fi current and duration. The estimator calculates average current, energy per cycle, cycles per day, duty cycle, and idealized runtime. Use measured current for your actual board and include regulator loss, battery aging, temperature, self-discharge, cutoff voltage, and radio retries before planning deployment.",
    usefulFor: ["Comparing firmware duty cycles before building a battery prototype", "Seeing whether sleep, sensing, or radio activity dominates each cycle"],
    outputs: ["Estimated runtime, average current, cycles per day, and active-time percentage", "A phase-by-phase energy estimate for sleep, active work, and Wi-Fi"],
    limitations: ["The model assumes the entered phase currents remain constant and repeat predictably", "It does not model battery discharge curves, regulator quiescent current, startup peaks, temperature, aging, retries, or self-discharge automatically"],
    scenario: { title: "Measure the phases that dominate", description: "Begin with datasheet values to compare architectures, then measure the complete board during sleep, startup, sensing, processing, and transmission. Replace estimates with measurements and rerun the same duty cycle." },
    questions: [
      { question: "Why is a development board worse than a bare ESP32 module in sleep?", answer: "USB converters, regulators, LEDs, dividers, pull resistors, and attached modules can keep drawing current while the ESP32 sleeps. Measure the complete board rather than using the chip number alone." },
      { question: "Does battery capacity in mAh stay constant for every load?", answer: "No. Available capacity depends on chemistry, discharge rate, temperature, age, cutoff voltage, and the load profile. Use a conservative usable-capacity percentage and the battery datasheet." },
      { question: "How should I model Wi-Fi reconnection?", answer: "Measure the current and duration across multiple real reconnections, including failed attempts. Use a representative or conservative value rather than the shortest successful trace." },
    ],
    evidence: { title: "Fall Detection System", description: "This portable sensing prototype connects hardware, vision development, and an interface. It provides adjacent system evidence and does not claim a measured runtime equal to this calculator's estimate.", href: "/work/embedded-iot/fall-detection-system/" },
    cta: { title: "Need a battery budget for a portable IoT prototype?", description: "Share the battery, board, sensors, radio schedule, wake triggers, regulator, and target service interval. Measurements can replace assumptions as the prototype develops.", href: "/contact/" },
    reviewedOn,
  },
  "ai-script-generator": {
    slug: "ai-script-generator",
    seoTitle: "Runnable Edge AI and Computer Vision Project Generator",
    metaDescription: "Generate a structured Python project for object detection, segmentation, depth, classification, sensor AI, or classical machine learning.",
    primaryQuestion: "How can I generate a runnable edge-AI project instead of a code snippet?",
    directAnswer: "Choose the task, data source, model direction, execution settings, and deployment target to generate a structured Python project instead of an isolated snippet. Trainable tasks include the relevant data and training workflow; inference-only missions generate prediction code without pretending retraining is required. Every path still needs validation, hardware checks, package review, and measured deployment performance.",
    usefulFor: ["Turning an AI experiment into a reproducible project structure", "Comparing supported detection, segmentation, depth, classification, and sensor-learning paths"],
    outputs: ["A runnable project structure with configuration and task-specific code", "A guided record of data, model, evaluation or inference, and deployment choices"],
    limitations: ["Generated code cannot guarantee dataset quality, model accuracy, fairness, latency, memory use, or compatibility with future package releases", "Trainable paths still need labeling and split review; inference-only paths still need input, output, failure, and target-device validation"],
    scenario: { title: "Prove the data and execution path first", description: "Select the task and create the project. For a trainable mission, inspect labels and dataset splits before tuning. For an inference-only mission, verify inputs and outputs on representative samples. In both cases, establish a simple baseline and measure target-device constraints before adding complexity." },
    questions: [
      { question: "Will every generated project train a model?", answer: "No. Some missions use pretrained models for inference without a training step. Trainable workflows still depend on valid files, labels, splits, package versions, available memory, and task assumptions." },
      { question: "Should I begin with the largest model available?", answer: "Begin with a small baseline that trains and runs on the target. Increase capacity only after error analysis shows that model size, rather than data or labeling, limits the result." },
      { question: "How do I know whether the model is ready for edge deployment?", answer: "Measure accuracy on unseen data, latency, memory, power, startup time, thermal behavior, and failures on the actual device. Desktop inference speed is not enough." },
    ],
    evidence: { title: "Plant Care AI", description: "Plant Care AI combines sensor inputs, leaf-image analysis, and a Flutter application. It demonstrates the system work required around an AI model.", href: "/work/apps-ui/plant-care-ai/" },
    cta: { title: "Need an AI model connected to sensors or an application?", description: "Share the task, available data, target hardware, latency limit, expected outputs, and how users will act on the result.", href: "/contact/" },
    reviewedOn,
  },
} satisfies Record<string, ToolSearchHook>;

export function getToolSearchHook(slug: string): ToolSearchHook | null {
  return toolSearchHooks[slug as keyof typeof toolSearchHooks] ?? null;
}

export function validateToolSearchHooks(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const questions = new Set<string>();

  for (const [key, hook] of Object.entries(toolSearchHooks)) {
    if (hook.slug !== key) issues.push(`${key}: slug does not match registry key`);
    if (hook.questions.length !== 3) issues.push(`${key}: expected exactly three questions`);
    for (const field of ["usefulFor", "outputs", "limitations"] as const) {
      if (hook[field].length < 2) issues.push(`${key}: ${field} needs at least two items`);
    }
    if (!/^\/work\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(hook.evidence.href)) issues.push(`${key}: evidence must use an internal project URL`);
    if (hook.cta.href !== "/contact/") issues.push(`${key}: CTA must lead to /contact/`);
    if (questions.has(hook.primaryQuestion)) issues.push(`${key}: duplicate primary question`);
    questions.add(hook.primaryQuestion);
  }

  return { valid: issues.length === 0, issues };
}
