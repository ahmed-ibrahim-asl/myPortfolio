import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import sharp from "sharp";

const assets = [
  "public/media/portfolio/showcase/wireless-rov/cover-asl-v1.png",
  "public/media/generated/responsive/media/portfolio/showcase/wireless-rov/cover-asl-v1/320.avif",
  "public/media/generated/responsive/media/portfolio/showcase/wireless-rov/cover-asl-v1/320.webp"
];

test("the ROV card and its smallest responsive assets keep a dark mobile surface", async () => {
  const css = readFileSync("components/WorkCollection.module.css", "utf8");
  assert.match(css, /\.embedded \.visual\s*\{[^}]*background-color:\s*#08141c/s);

  for (const asset of assets) {
    const { data, info } = await sharp(asset).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let nearWhite = 0;
    for (let offset = 0; offset < data.length; offset += info.channels) {
      if (data[offset] > 245 && data[offset + 1] > 245 && data[offset + 2] > 245) nearWhite += 1;
    }
    const ratio = nearWhite / (info.width * info.height);
    assert.ok(ratio < 0.01, `${asset} has ${(ratio * 100).toFixed(2)}% near-white pixels`);
  }
});
