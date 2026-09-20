import path from "node:path";

export const IMAGE_ROLES = Object.freeze([
  "tool-cover",
  "project-cover",
  "gallery-evidence",
  "portrait",
  "tutorial-cover",
  "social",
  "interface-screenshot",
  "decorative"
]);

export const publicImageRegistry = Object.freeze({
  "/images/hardware_bench_hero.jpg": Object.freeze({ role: "project-cover", sizesPreset: "feature" }),
  "/media/ambient/cc0-cityscape.gif": Object.freeze({ role: "decorative", sizesPreset: "feature", decorative: true }),
  "/opengraph-image.png": Object.freeze({ role: "social", sizesPreset: "social" }),
  "/twitter-image.png": Object.freeze({ role: "social", sizesPreset: "social" }),
  ...Object.fromEntries([
    ["gradify", "gradify"],
    ["smps-designer", "smps-designer"],
    ["rot-explorer", "rot-explorer"],
    ["air-core-coil-designer", "air-core-coil-designer"],
    ["lc-resonance-designer", "lc-resonance-designer"],
    ["band-pass-filter-designer", "band-pass-filter-designer"],
    ["cascaded-opamp-gain-designer", "cascaded-opamp-gain-designer"],
    ["control-design-assistant", "control-design-assistant"],
    ["logic-gate-designer", "logic-gate-designer"],
    ["bridge-rectifier-designer", "bridge-rectifier-designer"],
    ["linear-regulator-stability-designer", "linear-regulator-stability-designer"],
    ["buck-converter-designer", "buck-converter-designer"],
    ["four-band-resistor", "four-band-resistor"],
    ["five-band-precision-resistor", "five-band-precision-resistor"],
    ["series-resistors", "series-resistors"],
    ["parallel-resistors", "parallel-resistors"],
    ["voltage-divider", "voltage-divider"],
    ["led-current-limiter", "led-current-limiter"]
  ].map(([desktopName, mobileName]) => [
    `/media/tools/variations/${desktopName}-desktop-v1.png`,
    Object.freeze({
      role: "tool-cover",
      sizesPreset: "tool-card",
      mobileSrc: `/media/tools/mobile/${mobileName}-mobile-v2.png`
    })
  ]))
});

function mobileToolSource(source) {
  const extension = path.posix.extname(source);
  const name = path.posix.basename(source, extension);
  return `/media/tools/mobile/${name}-mobile-v1.png`;
}

export function getPublicImageConfig(source) {
  if (publicImageRegistry[source]) return { ...publicImageRegistry[source], registered: true };
  const lower = source.toLowerCase();

  if (lower.includes("/profile") || lower.includes("portrait")) {
    return { role: "portrait", sizesPreset: "portrait", registered: true };
  }
  if (lower.includes("/calculators/") || lower.includes("/tools/")) {
    return {
      role: "tool-cover",
      sizesPreset: "tool-card",
      mobileSrc: mobileToolSource(source),
      registered: true
    };
  }
  if (lower.includes("tutorial-")) {
    return { role: "tutorial-cover", sizesPreset: "tool-card", registered: true };
  }
  if (lower.includes("/showcase/") && (lower.includes("/ui-") || lower.includes("dashboard"))) {
    return { role: "interface-screenshot", sizesPreset: "gallery-thumb", registered: true };
  }
  if (lower.includes("/showcase/") && lower.includes("cover")) {
    return { role: "project-cover", sizesPreset: "project-card", registered: true };
  }
  if (lower.includes("project-") || lower.includes("robotics-covers")) {
    return { role: "project-cover", sizesPreset: "project-card", registered: true };
  }
  if (lower.includes("/portfolio/") || lower.includes("/showcase/")) {
    return { role: "gallery-evidence", sizesPreset: "gallery-thumb", registered: true };
  }
  if (lower.includes("opengraph") || lower.includes("twitter-image")) {
    return { role: "social", sizesPreset: "social", registered: true };
  }

  return { role: "gallery-evidence", sizesPreset: "article", registered: true };
}
