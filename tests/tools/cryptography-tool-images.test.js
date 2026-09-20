import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { calculatorVisuals } from "../../data/calculator-visuals.js";

const slugs = [
  "vigenere-cipher",
  "affine-cipher",
  "transposition-cipher",
  "playfair-cipher",
  "hill-cipher",
  "hash-generator",
  "aes-hex-calculator",
];

test("new cryptography tools use generated raster covers", async () => {
  const { cryptographyToolImages, getCryptographyToolImage } = await import(
    "../../data/cryptography-tool-images.js"
  );

  assert.deepEqual(Object.keys(cryptographyToolImages), slugs);
  for (const slug of slugs) {
    const image = cryptographyToolImages[slug];
    assert.match(image.path, new RegExp(`${slug}-instrument-v2\\.png$`));
    assert.ok(image.alt.length >= 40);
    assert.equal(getCryptographyToolImage(slug), image);
    assert.equal(calculatorVisuals[slug].image, image.path);
    assert.equal(calculatorVisuals[slug].imageDark, undefined);
    assert.equal(calculatorVisuals[slug].imageLight, undefined);
  }
  assert.equal(getCryptographyToolImage("not-a-tool"), null);
});

test("cryptography cover sources are normalized landscape PNG files", async () => {
  const { cryptographyToolImages } = await import("../../data/cryptography-tool-images.js");

  for (const image of Object.values(cryptographyToolImages)) {
    const file = path.join(process.cwd(), "public", image.path.slice(1));
    await access(file);
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.width, 1600, image.path);
    assert.equal(metadata.height, 900, image.path);
    assert.equal(metadata.format, "png", image.path);
  }
});
