import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { designTools } from "../../data/design-tools.js";
import { calculatorVisuals } from "../../data/calculator-visuals.js";

const slugs = [
  "vigenere-cipher",
  "affine-cipher",
  "transposition-cipher",
  "playfair-cipher",
  "hill-cipher",
  "hash-generator",
  "aes-hex-calculator"
];

test("every new classical tool has one route, search seed and theme-paired cover", () => {
  const page = readFileSync("components/tools/design/DesignToolPage.tsx", "utf8");
  const seeds = readFileSync("data/tool-search-seeds.ts", "utf8");
  for (const slug of slugs) {
    assert.equal(designTools.filter((tool) => tool.slug === slug).length, 1, `${slug} catalog`);
    assert.equal(designTools.find((tool) => tool.slug === slug).custom, true, `${slug} custom`);
    assert.match(page, new RegExp(`tool\\.slug===['"]${slug}['"]`), `${slug} route`);
    assert.match(seeds, new RegExp(`["']${slug}["']\\s*:`), `${slug} search seed`);
    const visual = calculatorVisuals[slug];
    assert.ok(visual?.ariaLabel, `${slug} visual label`);
    for (const key of ["imageDark", "imageLight"]) {
      const path = `public${visual[key]}`;
      assert.ok(existsSync(path), `${slug} ${key}`);
      const svg = readFileSync(path, "utf8");
      assert.match(svg, /<svg[^>]+viewBox=/, `${slug} ${key} viewBox`);
      assert.doesNotMatch(svg, /<script|javascript:/i, `${slug} ${key} executable content`);
    }
  }
});
