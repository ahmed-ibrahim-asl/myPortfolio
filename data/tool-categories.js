import { calculators } from "./calculators.js";
import { engineeringTools } from "./tools.js";

export const toolCategories = Object.freeze([
  Object.freeze({
    slug: "workbenches",
    title: "Workbenches",
    label: "Guided systems",
    intro: "Larger, guided environments for planning, simulation, code generation, and technical practice."
  }),
  Object.freeze({
    slug: "fundamentals",
    title: "Fundamentals",
    label: "Circuit essentials",
    intro: "Everyday voltage, current, resistance, LED, divider, and battery calculations."
  }),
  Object.freeze({
    slug: "resistors",
    title: "Resistors",
    label: "Values and networks",
    intro: "Decode resistor bands and solve series or parallel resistor networks quickly."
  }),
  Object.freeze({
    slug: "circuit-design",
    title: "Circuit Design",
    label: "Interactive schematics",
    intro: "Choose a circuit, set its values, and explore its behavior. Each designer opens on its own page."
  }),
  Object.freeze({
    slug: "text-encoding",
    title: "Text & Encoding",
    label: "Letters and representations",
    intro: "Explore letter shifts and translate ASCII text to and from hexadecimal."
  }),
  Object.freeze({
    slug: "control-design",
    title: "Control Design",
    label: "Memory and state",
    intro: "Translate a control requirement into flip-flops, registers, counters, and visual state behavior."
  }),
  Object.freeze({
    slug: "power-conversion-supplies",
    title: "Power Conversion & Supplies",
    label: "Low-voltage power design",
    intro: "Estimate rectifier ripple, regulator stability, and switching-converter component values for low-voltage systems."
  }),
  Object.freeze({
    slug: "conversions",
    title: "Conversions",
    label: "Units and markings",
    intro: "Translate capacitor markings, capacitance units, and temperature scales without guesswork."
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
  })
]);

export function getToolCategory(slug) {
  return toolCategories.find((category) => category.slug === (slug === 'timing-filters' ? 'circuit-design' : slug));
}

export function getToolCategoryItems(slug) {
  const category = getToolCategory(slug);
  if (!category) return [];

  if (slug === "workbenches") {
    return engineeringTools.map((tool) => ({
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

  return calculators
    .filter((tool) => tool.category === category.title)
    .map((tool) => ({
      id: tool.slug,
      title: tool.title,
      summary: tool.summary,
      href: `/tools/${tool.slug}/`,
      category: tool.category,
      kind: "Calculator",
      tags: [...(tool.tags ?? [])],
      visualKey: tool.visualKey,
      group: tool.group
    }));
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
  return [...toolCategories.map(({ slug }) => ({ slug })), {slug:'timing-filters'}];
}
