import test from "node:test";
import assert from "node:assert/strict";

import { calculators } from "../../data/calculators.js";
import { satelliteCalculators } from "../../data/satellite-course.js";
import { rfCalculators } from "../../data/rf-calculators.js";
import { getToolCategoryItems, toolCategories } from "../../data/tool-categories.js";

const expectedCategoryOrder = [
  "workbenches",
  "circuit-design",
  "text-encoding",
  "conversions",
  "number-systems",
  "physics-math",
  "satellite",
  "rf-engineering"
];

test("tool hub uses the approved eight-category order", () => {
  assert.deepEqual(toolCategories.map(({ slug }) => slug), expectedCategoryOrder);
});

test("Satellite and RF own five distinct calculators each", () => {
  assert.deepEqual(
    satelliteCalculators.map(({ slug }) => slug),
    ["orbit", "look-angles", "power-lifetime", "doppler-delay", "link-budget"]
  );
  assert.deepEqual(
    rfCalculators.map(({ slug }) => slug),
    ["frequency-bands", "antenna", "rf-path", "noise-gt", "multiple-access"]
  );

  const satelliteItems = getToolCategoryItems("satellite");
  const rfItems = getToolCategoryItems("rf-engineering");
  assert.equal(satelliteItems.length, 5);
  assert.equal(rfItems.length, 5);
  assert.deepEqual(
    satelliteItems.map(({ href }) => href),
    satelliteCalculators.map(({ slug }) => `/tools/satellite/${slug}/`)
  );
  assert.deepEqual(
    rfItems.map(({ href }) => href),
    rfCalculators.map(({ slug }) => `/tools/rf/${slug}/`)
  );
  assert.equal(new Set([...satelliteItems, ...rfItems].map(({ href }) => href)).size, 10);
});

test("specialist group order follows the approved engineering workflow", () => {
  assert.deepEqual(
    [...new Set(getToolCategoryItems("satellite").map(({ group }) => group))],
    ["Mission geometry", "Spacecraft", "End-to-end design"]
  );
  assert.deepEqual(
    [...new Set(getToolCategoryItems("rf-engineering").map(({ group }) => group))],
    ["Carrier & antenna", "Path & receiver", "Channel capacity"]
  );
});

test("general wavelength remains owned only by Physics & Math", () => {
  const wavelength = calculators.find(({ slug }) => slug === "wavelength-calculator");
  assert.ok(wavelength);
  assert.equal(wavelength.category, "Physics & Math");
  assert.equal(
    toolCategories.flatMap(({ slug }) => getToolCategoryItems(slug)).filter(({ id }) => id === wavelength.slug).length,
    1
  );
  assert.equal(rfCalculators.find(({ slug }) => slug === "frequency-bands")?.title, "RF Band & Carrier Planner");
});
