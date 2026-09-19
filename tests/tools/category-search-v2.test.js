import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { filterToolItems, groupToolItems } from "../../lib/tool-search.js";

const items = [
  {
    id: "rf-antenna",
    title: "Antenna Gain & Aperture Calculator",
    summary: "Size a parabolic dish.",
    category: "RF Engineering",
    kind: "Calculator",
    group: "Carrier & antenna",
    tags: ["dish"],
    symbols: ["G, Ae, λ"],
    aliases: ["HPBW", "beamwidth"]
  },
  {
    id: "rf-noise",
    title: "Noise, Noise Figure & G/T Calculator",
    summary: "Refer receiver stages to the input.",
    category: "RF Engineering",
    kind: "Calculator",
    group: "Path & receiver",
    tags: ["cascade"],
    symbols: ["Te, F"],
    aliases: ["LNA"]
  }
];

test("category search matches engineering vocabulary and group names", () => {
  assert.deepEqual(filterToolItems(items, "HPBW").map(({ id }) => id), ["rf-antenna"]);
  assert.deepEqual(filterToolItems(items, "λ").map(({ id }) => id), ["rf-antenna"]);
  assert.deepEqual(filterToolItems(items, "receiver").map(({ id }) => id), ["rf-noise"]);
  assert.deepEqual(filterToolItems(items, "LNA").map(({ id }) => id), ["rf-noise"]);
});

test("grouping hides empty groups and preserves declared order", () => {
  assert.deepEqual(
    groupToolItems(items, "beamwidth", ["Carrier & antenna", "Path & receiver"]),
    [{ name: "Carrier & antenna", items: [items[0]] }]
  );
});

test("every category page uses the shared grouped search", () => {
  const route = readFileSync("app/tools/category/[slug]/page.tsx", "utf8");
  assert.match(route, /GroupedToolsIndex/);
  assert.doesNotMatch(route, /category\.slug === "satellite-communication"/);
});
