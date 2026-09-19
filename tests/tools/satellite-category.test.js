import test from "node:test";
import assert from "node:assert/strict";

import { satelliteCalculators } from "../../data/satellite-course.js";
import { rfCalculators } from "../../data/rf-calculators.js";
import { getToolCategoryItems } from "../../data/tool-categories.js";
import { engineeringTools } from "../../data/tools.js";
import { readFileSync } from "node:fs";

const satelliteSlugs = [
  "orbit",
  "look-angles",
  "power-lifetime",
  "doppler-delay",
  "link-budget"
];

const rfSlugs = [
  "frequency-bands",
  "antenna",
  "rf-path",
  "noise-gt",
  "multiple-access"
];

test("Satellite and RF are separate five-tool categories", () => {
  assert.deepEqual(
    satelliteCalculators.map(({ slug }) => slug),
    satelliteSlugs
  );
  assert.deepEqual(rfCalculators.map(({ slug }) => slug), rfSlugs);

  const satelliteItems = getToolCategoryItems("satellite");
  assert.deepEqual(
    satelliteItems.map(({ href }) => href),
    satelliteSlugs.map((slug) => `/tools/satellite/${slug}/`)
  );
  const rfItems = getToolCategoryItems("rf-engineering");
  assert.deepEqual(
    rfItems.map(({ href }) => href),
    rfSlugs.map((slug) => `/tools/rf/${slug}/`)
  );
  assert.equal(new Set([...satelliteItems, ...rfItems].map(({ id }) => id)).size, 10);
  assert.ok([...satelliteItems, ...rfItems].every(({ kind }) => kind === "Calculator"));
});

test("Workbenches and the engineering catalog contain no Satellite products", () => {
  const workbenchIds = getToolCategoryItems("workbenches").map(({ id }) => id);
  assert.ok(workbenchIds.every((id) => !id.startsWith("satellite-")));
  assert.ok(engineeringTools.every(({ id }) => !id.startsWith("satellite-")));
});

test("public satellite routes and workspace use calculator-only navigation", () => {
  const route = readFileSync("app/tools/satellite/[slug]/page.jsx", "utf8");
  const workspace = readFileSync("components/tools/satellite/SatelliteWorkspace.jsx", "utf8");
  assert.match(route, /satelliteCalculators/);
  assert.doesNotMatch(workspace, /SatellitePractice|SatelliteLab|Mark as studied|Return to your practice|Exam \/ solve first/);
});
