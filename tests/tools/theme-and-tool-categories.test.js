import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

import {
  THEME_STORAGE_KEY,
  normalizeTheme,
  themeInitializerScript
} from "../../lib/theme.js";
import { calculators } from "../../data/calculators.js";
import { engineeringTools } from "../../data/tools.js";
import {
  getToolCategory,
  getToolCategoryItems,
  getToolCategorySummaries,
  getToolCategoryStaticParams,
  toolCategories
} from "../../data/tool-categories.js";
import { filterToolItems } from "../../lib/tool-search.js";

test("invalid or unavailable preferences keep the first visit dark", () => {
  assert.equal(normalizeTheme(undefined), "dark");
  assert.equal(normalizeTheme(null), "dark");
  assert.equal(normalizeTheme("system"), "dark");
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme("dark"), "dark");
});

test("the pre-hydration initializer applies and restores only a valid saved theme", () => {
  const runInitializer = (savedValue, throws = false) => {
    const root = { dataset: {}, style: {} };
    const localStorage = {
      getItem(key) {
        assert.equal(key, THEME_STORAGE_KEY);
        if (throws) throw new Error("storage unavailable");
        return savedValue;
      }
    };

    vm.runInNewContext(themeInitializerScript, {
      document: { documentElement: root },
      localStorage
    });

    return root;
  };

  assert.deepEqual(runInitializer("light"), {
    dataset: { theme: "light" },
    style: { colorScheme: "light" }
  });
  assert.deepEqual(runInitializer("system"), {
    dataset: { theme: "dark" },
    style: { colorScheme: "dark" }
  });
  assert.deepEqual(runInitializer(null, true), {
    dataset: { theme: "dark" },
    style: { colorScheme: "dark" }
  });
});

test("the tools library exposes six destinations and consolidates old circuit URLs", () => {
  assert.deepEqual(
    toolCategories.map(({ slug }) => slug),
    [
      "workbenches",
      "circuit-design",
      "text-encoding",
      "conversions",
      "number-systems",
      "physics-math"
    ]
  );
  assert.equal(new Set(toolCategories.map(({ slug }) => slug)).size, 6);
  for (const slug of [
    "fundamentals",
    "resistors",
    "timing-filters",
    "control-design",
    "power-conversion-supplies"
  ]) {
    assert.equal(getToolCategory(slug)?.slug, "circuit-design", slug);
  }
  assert.equal(getToolCategory("not-a-category"), undefined);
});

test("Circuit Design contains every circuit class once in the approved section order", () => {
  const items = getToolCategoryItems("circuit-design");
  const circuitCategories = [
    "Fundamentals",
    "Resistors",
    "Circuit Design",
    "Control Design",
    "Power Conversion & Supplies"
  ];
  const expectedIds = calculators
    .filter(({ category }) => circuitCategories.includes(category))
    .map(({ slug }) => slug)
    .sort();

  assert.deepEqual(items.map(({ id }) => id).sort(), expectedIds);
  assert.equal(new Set(items.map(({ id }) => id)).size, items.length);
  assert.deepEqual(
    [...new Set(items.map(({ group }) => group))],
    [
      "Fundamentals",
      "Resistors & Networks",
      "Timing, Filters & Analog Design",
      "Control Design",
      "Power Conversion & Supplies"
    ]
  );

  for (const slug of ["fundamentals", "resistors", "timing-filters", "control-design", "power-conversion-supplies"]) {
    assert.deepEqual(getToolCategoryItems(slug), items, slug);
  }
});

test("every current tool belongs to exactly one category", () => {
  const groupedIds = toolCategories.flatMap(({ slug }) =>
    getToolCategoryItems(slug).map(({ id }) => id)
  );
  const expectedIds = [
    ...engineeringTools.map(({ id }) => id),
    ...calculators.map(({ slug }) => slug)
  ].sort();

  assert.equal(groupedIds.length, expectedIds.length);
  assert.equal(new Set(groupedIds).size, groupedIds.length);
  assert.deepEqual([...groupedIds].sort(), expectedIds);
});

test("category summaries provide useful counts and examples for the hub", () => {
  const summaries = getToolCategorySummaries();

  assert.equal(summaries.length, 6);
  assert.deepEqual(
    summaries.map(({ count }) => count),
    toolCategories.map(category => getToolCategoryItems(category.slug).length)
  );
  for (const summary of summaries) {
    assert.ok(summary.examples.length > 0 && summary.examples.length <= 3);
    assert.ok(summary.intro.length > 30);
  }
});

test("static category params cover every destination", () => {
  assert.deepEqual(
    getToolCategoryStaticParams(),
    [
      ...toolCategories.map(({ slug }) => ({ slug })),
      { slug: "fundamentals" },
      { slug: "resistors" },
      { slug: "timing-filters" },
      { slug: "control-design" },
      { slug: "power-conversion-supplies" }
    ]
  );
});

test("category search cannot surface tools from another category", () => {
  const resistorTools = getToolCategoryItems("circuit-design")
    .filter(({ category }) => category === "Resistors");

  assert.deepEqual(
    filterToolItems(resistorTools, "series").map(({ id }) => id),
    ["series-resistor-calculator"]
  );
  assert.deepEqual(filterToolItems(resistorTools, "battery"), []);
  assert.equal(filterToolItems(resistorTools, "").length, 4);
});
