import test from "node:test";
import assert from "node:assert/strict";
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
