import { calculators } from "./calculators.js";
import { engineeringTools } from "./tools.js";
import { satelliteCalculators } from "./satellite-course.js";
import { rfCalculators } from "./rf-calculators.js";

export const toolCategories = Object.freeze([
  Object.freeze({
    slug: "workbenches",
    title: "Workbenches",
    label: "Guided systems",
    intro:
      "Larger, guided environments for planning, simulation, code generation, and technical practice."
  }),
  Object.freeze({
    slug: "circuit-design",
    title: "Circuit Design",
    label: "Interactive schematics",
    intro:
      "Move from electrical fundamentals and resistor networks to timing, control logic, analog circuits, and practical power supplies."
  }),
  Object.freeze({
    slug: "text-encoding",
    title: "Text & Encoding",
    label: "Letters and representations",
    intro: "Explore letter shifts and translate ASCII text to and from hexadecimal."
  }),
  Object.freeze({
    slug: "conversions",
    title: "Conversions",
    label: "Units and markings",
    intro:
      "Translate capacitor markings, capacitance units, and temperature scales without guesswork."
  }),
  Object.freeze({
    slug: "number-systems",
    title: "Number Systems",
    label: "Binary workshop",
    intro: "Convert, calculate, shift, and inspect binary, hexadecimal, ASCII, and complements."
  }),
  Object.freeze({
    slug: "physics-math",
    title: "Physics & Math",
    label: "Motion and quantities",
    intro: "Solve motion, force, wavelength, frequency, percentage, and root relationships."
  }),
  Object.freeze({
    slug: "satellite",
    title: "Satellite",
    label: "Mission engineering",
    intro:
      "Plan orbit geometry, spacecraft power, propagation timing, and end-to-end satellite links with connected engineering calculators."
  }),
  Object.freeze({
    slug: "rf-engineering",
    title: "RF Engineering",
    label: "Carrier to receiver",
    intro:
      "Plan carriers and antennas, trace RF paths, evaluate receiver noise, and estimate multiple-access capacity."
  })
]);

const circuitCategoryAliases = Object.freeze([
  "fundamentals",
  "resistors",
  "timing-filters",
  "control-design",
  "power-conversion-supplies"
]);

const circuitCategoryTitles = Object.freeze([
  "Fundamentals",
  "Resistors",
  "Circuit Design",
  "Control Design",
  "Power Conversion & Supplies"
]);

const circuitGroupOrder = Object.freeze([
  "Fundamentals",
  "Resistors & Networks",
  "Timing, Filters & Analog Design",
  "Control Design",
  "Power Conversion & Supplies"
]);

function getCircuitGroup(category) {
  if (category === "Fundamentals") return "Fundamentals";
  if (category === "Resistors") return "Resistors & Networks";
  if (category === "Control Design") return "Control Design";
  if (category === "Power Conversion & Supplies") return "Power Conversion & Supplies";
  return "Timing, Filters & Analog Design";
}

export function getToolCategory(slug) {
  const canonicalSlug = circuitCategoryAliases.includes(slug) ? "circuit-design" : slug;
  return toolCategories.find((category) => category.slug === canonicalSlug);
}

export function getToolCategoryItems(slug) {
  const category = getToolCategory(slug);
  if (!category) return [];
  if (["satellite", "rf-engineering"].includes(category.slug)) {
    const specialistTools = category.slug === "satellite" ? satelliteCalculators : rfCalculators;
    const routeRoot = category.slug === "satellite" ? "satellite" : "rf";
    return specialistTools.map((tool) => ({
      id: `${routeRoot}-${tool.slug}`,
      title: tool.title,
      summary: tool.summary,
      href: `/tools/${routeRoot}/${tool.slug}/`,
      category: category.title,
      kind: "Calculator",
      group: tool.group,
      tags: [...tool.topics, category.title],
      symbols: tool.lessons.flatMap((lesson) => lesson.symbols ? [lesson.symbols] : []),
      aliases: tool.slug.split("-"),
      icon: "SATELLITE_RF"
    }));
  }

  if (category.slug === "workbenches") {
    return engineeringTools
      .filter((tool) => !tool.id.startsWith("satellite-"))
      .map((tool) => ({
        id: tool.id,
        title: tool.title,
        summary: tool.description,
        href: tool.href.endsWith("/") ? tool.href : `${tool.href}/`,
        category: category.title,
        kind: "Workbench",
        group: "Workbenches",
        tags: [tool.icon, tool.highlight ?? "Interactive"],
        coverImage: tool.coverImage,
        icon: tool.icon
      }));
  }

  const matchingTools =
    category.slug === "circuit-design"
      ? calculators.filter((tool) => circuitCategoryTitles.includes(tool.category))
      : calculators.filter((tool) => tool.category === category.title);

  return matchingTools
    .map((tool) => ({
      id: tool.slug,
      title: tool.title,
      summary: tool.summary,
      href: `/tools/${tool.slug}/`,
      category: tool.category,
      kind: "Calculator",
      tags: [...(tool.tags ?? [])],
      visualKey: tool.visualKey,
      group: category.slug === "circuit-design" ? getCircuitGroup(tool.category) : tool.group
    }))
    .sort((first, second) => {
      if (category.slug !== "circuit-design") return 0;
      return circuitGroupOrder.indexOf(first.group) - circuitGroupOrder.indexOf(second.group);
    });
}

export function getToolCategorySummaries() {
  return toolCategories.map((category) => {
    const items = getToolCategoryItems(category.slug);
    return {
      ...category,
      count: items.length,
      examples: items.slice(0, 3).map(({ title }) => title)
    };
  });
}

export function getToolCategoryStaticParams() {
  return [
    ...toolCategories.map(({ slug }) => ({ slug })),
    ...circuitCategoryAliases.map((slug) => ({ slug }))
  ];
}
