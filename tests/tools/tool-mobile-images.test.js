import assert from "node:assert/strict";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { auditPublicImages } from "../../scripts/public-image-audit.mjs";
import { buildToolMobileImagePrompt, toolMobileImagePrompts } from "../../data/tool-mobile-image-prompts.js";

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
