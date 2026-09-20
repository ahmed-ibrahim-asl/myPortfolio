import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getGlobalToolSearchItems } from "../../data/tool-categories.js";
import { filterToolItems } from "../../lib/tool-search.js";

const firstMatch = (query) => filterToolItems(getGlobalToolSearchItems(), query)[0];

test("global tool search understands plain-language intent", () => {
  assert.equal(firstMatch("encrypt a message").id, "vigenere-cipher");
  assert.equal(firstMatch("password fingerprint").id, "hash-generator");
  assert.equal(firstMatch("rearrange letters").id, "transposition-cipher");
  assert.equal(firstMatch("calculate my gpa").id, "gradify");
  assert.equal(firstMatch("satellite orbit").id, "satellite-orbit");
  assert.equal(firstMatch("resistor bands").id, "resistor-color-code-calculator");
});

test("global tool search index is unique and route-ready", () => {
  const items = getGlobalToolSearchItems();
  assert.ok(items.length >= 60);
  assert.equal(new Set(items.map(({ id }) => id)).size, items.length);
  assert.ok(items.every(({ href, searchTerms }) => href.endsWith("/") && searchTerms.length > 0));
});

test("quick search renders before category navigation", async () => {
  const page = await readFile(new URL("../../app/tools/page.tsx", import.meta.url), "utf8");
  const component = await readFile(
    new URL("../../components/tools/ToolsQuickSearch.tsx", import.meta.url),
    "utf8"
  );

  assert.ok(page.indexOf("<ToolsQuickSearch") < page.indexOf("<ToolsCategoryHub"));
  assert.match(component, /type="search"/);
  assert.match(component, /slice\(0, 6\)/);
  assert.match(component, /Search by tool name or describe what you need/i);
});
