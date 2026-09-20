import test from "node:test";
import assert from "node:assert/strict";
import { auditPublicImages } from "../../scripts/public-image-audit.mjs";

test("audit accounts for every referenced raster and direct img usage", async () => {
  const report = await auditPublicImages({ rootDir: process.cwd() });

  assert.ok(report.referenced.length >= 130);
  assert.deepEqual(report.referenced.filter((item) => !item.registered), []);
  assert.deepEqual(
    report.directImgUsages.filter((item) => item.file !== "components/PublicImage.tsx"),
    []
  );
});

test("audit assigns an explicit role and sizes preset to every referenced raster", async () => {
  const report = await auditPublicImages({ rootDir: process.cwd() });

  assert.deepEqual(report.referenced.filter((item) => !item.role || !item.sizesPreset), []);
  assert.ok(report.roleCounts["tool-cover"] >= 50);
  assert.ok(report.roleCounts["gallery-evidence"] >= 20);
  assert.ok(report.roleCounts.portrait >= 1);
});

test("audit reports unreferenced files without treating generated variants as sources", async () => {
  const report = await auditPublicImages({ rootDir: process.cwd() });

  assert.ok(report.unreferenced.length > 0);
  assert.equal(report.unreferenced.some((item) => item.includes("/generated/responsive/")), false);
});
