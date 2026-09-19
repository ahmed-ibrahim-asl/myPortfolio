import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { preparePublicImages } from "../../scripts/public-image-pipeline.mjs";

const pixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);

test("public image preparation discovers references and writes bounded AVIF/WebP variants", async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), "asl-images-"));
  await mkdir(path.join(rootDir, "public/media"), { recursive: true });
  await mkdir(path.join(rootDir, "data"), { recursive: true });
  await writeFile(path.join(rootDir, "public/media/test.png"), pixelPng);
  await writeFile(path.join(rootDir, "public/media/dynamic.png"), pixelPng);
  await writeFile(path.join(rootDir, "data/images.ts"), 'export const image = "/media/test.png";');
  await writeFile(path.join(rootDir, "data/public-image-sources.json"), JSON.stringify(["/media/dynamic.png"]));

  const report = await preparePublicImages({ rootDir, write: true });

  assert.deepEqual(report.missing, []);
  assert.equal(report.assets.length, 2);
  const testAsset = report.assets.find(asset => asset.source === "/media/test.png");
  assert.ok(testAsset.avif.every(item => item.bytes <= 300 * 1024));
  assert.ok(testAsset.webp.some(item => item.width === 1));
  assert.match(
    await readFile(path.join(rootDir, "data/public-image-manifest.generated.ts"), "utf8"),
    /media\/dynamic\.png/
  );

  const generated = path.join(rootDir, "public/media/generated/responsive/media/test/1.webp");
  const firstModified = (await stat(generated)).mtimeMs;
  await new Promise(resolve => setTimeout(resolve, 20));
  await preparePublicImages({ rootDir, write: true });
  assert.equal((await stat(generated)).mtimeMs, firstModified, "unchanged source should reuse generated variants");
});

test("public image preparation reports missing referenced assets", async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), "asl-images-missing-"));
  await mkdir(path.join(rootDir, "app"), { recursive: true });
  await writeFile(path.join(rootDir, "app/page.tsx"), '<img src="/media/missing.jpg" alt="Missing" />; const fixture = "./dataset/images/sample.png";');

  const report = await preparePublicImages({ rootDir, write: false });

  assert.deepEqual(report.missing, ["/media/missing.jpg"]);
});

test("new public raster sources stay below the hard 500 KB source limit", async () => {
  const source = "public/media/portfolio/showcase/wireless-rov/cover-asl-v1.png";
  assert.ok((await stat(source)).size <= 500 * 1024, `${source} exceeds 500 KB`);
});
