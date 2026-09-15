import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Guards three real 44px touch-target regressions found by a full-site sweep: the global header
// nav (shrunk to 40px by a later-loading stylesheet), the "Browse all calculators" catalog link,
// and the "Back to Tools" links in Security Mission / Model Mission. Inline prose citation links
// (e.g. "Last Minute Engineers" inside the tool-credit sentence) are intentionally exempt under
// WCAG 2.5.5/2.5.8's inline-text-link carve-out and must not be forced into button-sized boxes.

const read = (path) => readFileSync(path, "utf8");

test("the global site nav meets the 44px floor (home-grid.css loads last and can silently shrink it)", () => {
  const css = read("app/home-grid.css");
  assert.match(css, /\.site-nav a \{[^}]*min-height:\s*44px/s);
  assert.doesNotMatch(css, /\.site-nav a \{[^}]*min-height:\s*40px/s);
});

test("the calculator finder's 'browse all calculators' link meets the 44px floor", () => {
  const css = read("app/asl-tools.css");
  assert.match(css, /\.calculator-finder-heading > a \{[^}]*min-height:\s*44px/s);
});

test("Security Mission and Model Mission 'back to tools' links meet the 44px floor", () => {
  const securityCss = read("components/tools/security-mission/SecurityMission.module.css");
  const modelCss = read("components/tools/model-mission/ModelMission.module.css");
  assert.match(securityCss, /\.backLink \{[^}]*min-height:\s*44px/s);
  assert.match(modelCss, /\.backLink \{[^}]*min-height:\s*44px/s);
});
