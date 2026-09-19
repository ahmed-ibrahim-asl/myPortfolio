import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("PublicImage serves generated AVIF and WebP variants with an original fallback", async () => {
  const source = await read("components/PublicImage.tsx");

  assert.match(source, /<picture/);
  assert.match(source, /type="image\/avif"/);
  assert.match(source, /type="image\/webp"/);
  assert.match(source, /srcSet=/);
  assert.match(source, /src=\{src\}/);
  assert.match(source, /width=\{asset\?\.width/);
  assert.match(source, /height=\{asset\?\.height/);
});

test("high-impact portfolio imagery uses PublicImage", async () => {
  for (const path of [
    "components/ProfilePortrait.tsx",
    "components/ProjectCard.tsx",
    "components/WorkCollection.tsx",
    "components/CommunityRecord.tsx",
    "components/MobileScreenGallery.tsx",
  ]) {
    const source = await read(path);
    assert.match(source, /PublicImage/, `${path} should use PublicImage`);
  }
});
