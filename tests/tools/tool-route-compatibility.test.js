import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { rfCalculatorSlugs, legacyRfToolRedirects } from "../../data/rf-calculators.js";

test("RF calculators have a dedicated canonical route", () => {
  const route = readFileSync("app/tools/rf/[slug]/page.jsx", "utf8");
  assert.match(route, /rfCalculators/);
  assert.match(route, /pathname:`\/tools\/rf\/\$\{slug\}\//);
  assert.match(route, /ToolSearchSchema/);
  assert.match(route, /slug=\{`rf-\$\{slug\}`\}/);
});

test("Satellite calculators emit route-aware tool schema", () => {
  const route = readFileSync("app/tools/satellite/[slug]/page.jsx", "utf8");
  assert.match(route, /ToolSearchSchema/);
  assert.match(route, /slug=\{`satellite-\$\{slug\}`\}/);
});

test("legacy satellite RF paths map to RF paths", () => {
  assert.deepEqual(
    legacyRfToolRedirects,
    Object.fromEntries(rfCalculatorSlugs.map((slug) => [slug, `/tools/rf/${slug}/`]))
  );
  const route = readFileSync("app/tools/satellite/[slug]/page.jsx", "utf8");
  assert.match(route, /LegacyToolRedirect/);
});

test("legacy redirects explicitly retain the query string", () => {
  const redirect = readFileSync("components/tools/LegacyToolRedirect.tsx", "utf8");
  assert.match(redirect, /window\.location\.search/);
  assert.match(redirect, /window\.location\.replace/);
  const oldCombined = readFileSync("app/tools/satellite-communication/page.jsx", "utf8");
  assert.match(oldCombined, /\/tools\/category\/satellite\//);
  assert.match(oldCombined, /robots:\s*\{\s*index:\s*false/);
  assert.match(oldCombined, /canonical:\s*["']\/tools\/category\/satellite\//);
  const legacyRoute = readFileSync("app/tools/satellite/[slug]/page.jsx", "utf8");
  assert.match(legacyRoute, /robots:\s*\{\s*index:\s*false/);
  assert.match(legacyRoute, /canonical:\s*legacyDestination/);
});
