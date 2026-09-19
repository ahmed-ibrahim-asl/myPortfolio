import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getToolCategoryItems } from "../../data/tool-categories.js";

const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));

test("every Satellite and RF calculator has one unique tool cover", () => {
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
  }
});
