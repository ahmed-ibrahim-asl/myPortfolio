import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { getToolCategoryItems } from "../../data/tool-categories.js";

const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));
const manifestSource = readFileSync(
  fileURLToPath(new URL("../../data/public-image-manifest.generated.ts", import.meta.url)),
  "utf8"
);
const responsiveWidths = [320, 640, 960, 1280];

test("every Satellite and RF calculator has one valid responsive tool cover", async () => {
  const items = [
    ...getToolCategoryItems("satellite"),
    ...getToolCategoryItems("rf-engineering")
  ];

  assert.equal(items.length, 10);
  assert.equal(new Set(items.map((item) => item.coverImage)).size, items.length);

  for (const item of items) {
    assert.match(
      item.coverImage ?? "",
      /^\/media\/tools\/tool-(satellite|rf)-[a-z-]+-v1\.png$/,
      `${item.id} needs a versioned specialist cover`
    );
    assert.ok(
      existsSync(`${publicRoot}${item.coverImage}`),
      `${item.id} cover does not exist at ${item.coverImage}`
    );

    const sourcePath = `${publicRoot}${item.coverImage}`;
    const sourceMetadata = await sharp(sourcePath).metadata();
    assert.equal(sourceMetadata.width, 1280, `${item.id} source width changed`);
    assert.equal(sourceMetadata.height, 720, `${item.id} source ratio changed`);
    assert.ok(statSync(sourcePath).size <= 500_000, `${item.id} source exceeds 500 KB`);
    assert.ok(manifestSource.includes(`\"${item.coverImage}\"`), `${item.id} is missing from the image manifest`);

    const responsiveRoot = `${publicRoot}media/generated/responsive${item.coverImage.replace(/\.png$/u, "")}`;
    for (const width of responsiveWidths) {
      for (const extension of ["avif", "webp"]) {
        const variantPath = `${responsiveRoot}/${width}.${extension}`;
        assert.ok(existsSync(variantPath), `${item.id} is missing ${width}.${extension}`);
        const variantMetadata = await sharp(variantPath).metadata();
        assert.equal(variantMetadata.width, width, `${item.id} ${width}.${extension} width changed`);
        assert.equal(variantMetadata.height, Math.round(width * 9 / 16), `${item.id} ${width}.${extension} ratio changed`);
      }
    }
  }
});
