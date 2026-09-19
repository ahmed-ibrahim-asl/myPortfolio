export type PlannedNote = {
  title: string;
  summary: string;
  topic: string;
  audience: string;
  sourceQuery: string;
  intent: "how-to" | "decision" | "diagnosis";
  evidence: string;
  status: "Planned";
};

export const plannedNotes: readonly PlannedNote[] = Object.freeze([
  {
    title: "How do you turn an embedded idea into a testable first prototype?",
    summary: "A practical path from requirements and signal flow to a bench prototype, with checkpoints for interfaces, power, firmware, and evidence.",
    topic: "Embedded prototyping",
    audience: "Engineers planning a first hardware build",
    sourceQuery: "embedded systems prototyping",
    intent: "how-to",
    evidence: "Ahmed's embedded product and teaching projects",
    status: "Planned"
  },
  {
    title: "Which ESP32 architecture fits an IoT product beyond the demo stage?",
    summary: "A decision guide for connectivity, provisioning, storage, updates, and failure recovery before an ESP32 prototype becomes a maintained product.",
    topic: "ESP32 & IoT",
    audience: "IoT developers moving from proof of concept to product",
    sourceQuery: "ESP32 and IoT product development",
    intent: "decision",
    evidence: "Connected-device, OTA, and ESP32 project records",
    status: "Planned"
  },
  {
    title: "What should you check when a satellite link budget has no margin?",
    summary: "A trace through EIRP, path loss, antenna gain, system noise, bandwidth, and required Eb/N0 that shows where a weak link actually loses margin.",
    topic: "RF & satellite",
    audience: "RF students and engineers reviewing a link",
    sourceQuery: "RF and satellite link design",
    intent: "diagnosis",
    evidence: "The site's RF and satellite calculation engines",
    status: "Planned"
  },
  {
    title: "How do you make a wireless ROV control loop fail safely?",
    summary: "A system-level review of command loss, stale telemetry, motor authority, emergency states, and the tests that expose unsafe assumptions on the bench.",
    topic: "Robotics & ROV",
    audience: "Robotics teams building remote vehicles",
    sourceQuery: "robotics and ROV control",
    intent: "how-to",
    evidence: "Wireless ROV prototype, mechanical design, and published research",
    status: "Planned"
  },
  {
    title: "When should an image-processing pipeline use classical vision instead of ML?",
    summary: "A comparison based on data volume, explainability, latency, lighting variation, maintenance cost, and the failure cases each approach handles well.",
    topic: "Image processing & ML",
    audience: "Engineers choosing a vision approach",
    sourceQuery: "image processing and applied machine learning",
    intent: "decision",
    evidence: "Applied vision research and model-generation tools",
    status: "Planned"
  },
  {
    title: "How can an engineering calculator teach the model behind the answer?",
    summary: "A design method for inputs, assumptions, diagrams, sensitivity, units, and interpretation so a calculator improves judgment instead of returning one unexplained number.",
    topic: "Engineering tools",
    audience: "Engineering educators and tool builders",
    sourceQuery: "engineering student calculators and planning tools",
    intent: "how-to",
    evidence: "The portfolio's calculator and workbench design system",
    status: "Planned"
  }
]);
