import assert from "node:assert/strict";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { auditPublicImages } from "../../scripts/public-image-audit.mjs";
import { buildToolMobileImagePrompt, toolMobileImagePrompts } from "../../data/tool-mobile-image-prompts.js";
import { getToolCategoryItems, toolCategories } from "../../data/tool-categories.js";

const requiredVariationIds = [
  "gradify",
  "smps-designer",
  "rot-explorer",
  "air-core-coil-designer",
  "lc-resonance-designer",
  "band-pass-filter-designer",
  "cascaded-opamp-gain-designer",
  "control-design-assistant",
  "logic-gate-designer",
  "bridge-rectifier-designer",
  "linear-regulator-stability-designer",
  "buck-converter-designer",
  "resistor-color-code-calculator",
  "5-band-resistor-color-code-calculator",
  "series-resistor-calculator",
  "parallel-resistor-calculator",
  "voltage-divider-calculator",
  "led-series-resistor-calculator"
];

test("the public catalog contains 70 unique tools", () => {
  const tools = toolCategories.flatMap(({ slug }) => getToolCategoryItems(slug));
  assert.equal(tools.length, 70);
  assert.equal(new Set(tools.map((tool) => tool.id)).size, 70);
});

test("missing tools and resistor concepts declare paired desktop and mobile variation prompts", async () => {
  const promptModule = await import("../../data/tool-mobile-image-prompts.js");
  const variations = promptModule.toolImageVariationPrompts;

  assert.ok(variations, "toolImageVariationPrompts must be exported");
  assert.deepEqual(Object.keys(variations).sort(), [...requiredVariationIds].sort());
  for (const id of requiredVariationIds) {
    const variation = variations[id];
    assert.match(variation.desktopSource, /^\/media\/tools\/variations\/.+-desktop-v1\.png$/);
    assert.match(variation.mobileSource, /^\/media\/tools\/mobile\/.+-mobile-v2\.png$/);
    assert.match(variation.desktopPrompt, /landscape desktop tool-card cover/i);
    assert.match(variation.mobilePrompt, /square mobile tool-card cover/i);
    assert.match(variation.mobilePrompt, /non-technical/i);
  }
});

test("every tool cover has a dedicated plain-language mobile image prompt", async () => {
  const audit = await auditPublicImages();
  const covers = audit.referenced.filter(item => item.role === "tool-cover");

  assert.equal(covers.length, 58);
  for (const cover of covers) {
    assert.ok(toolMobileImagePrompts[cover.source], `missing prompt for ${cover.source}`);
    assert.match(buildToolMobileImagePrompt(cover.source), /non-technical/i);
  }
});

test("every tool cover has a bounded square mobile composition", async () => {
  const audit = await auditPublicImages();
  const covers = audit.referenced.filter(item => item.role === "tool-cover");

  for (const cover of covers) {
    const filePath = path.join(process.cwd(), "public", cover.mobileSrc.slice(1));
    await access(filePath);
    const metadata = await sharp(filePath).metadata();
    assert.equal(metadata.width, 960, `${cover.mobileSrc} should be 960px wide`);
    assert.equal(metadata.height, 960, `${cover.mobileSrc} should be 960px tall`);
    const fileStat = await stat(filePath);
    assert.ok(fileStat.size <= 500_000, `${cover.mobileSrc} exceeds the 500 KB source budget`);
  }
});
