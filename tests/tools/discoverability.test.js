import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the sitemap includes every calculator and advanced workbench", async () => {
  const source = await readFile(new URL("../../app/sitemap.js", import.meta.url), "utf8");

  assert.match(source, /getAllTools/);
  assert.match(source, /\/tools\/\$\{tool\.slug\}/);
  for (const pathname of [
    "/tools/ai-script-generator",
    "/tools/security-command-builder",
    "/tools/sensor-code-generator"
  ]) {
    assert.match(source, new RegExp(pathname.replaceAll("/", "\\/")));
  }
});

test("llms.txt advertises the live tools on the custom domain", async () => {
  const source = await readFile(new URL("../../public/llms.txt", import.meta.url), "utf8");

  assert.match(source, /^# Ahmed Ibrahim Asl/m);
  assert.match(source, /Embedded Systems & IoT R&D Engineer/);
  assert.doesNotMatch(source, /github\.io\/myPort(?:f|F)lio/);
  assert.match(source, /https:\/\/eng-asl\.com\/tools\//);
  for (const category of [
    "workbenches",
    "circuit-design",
    "text-encoding",
    "conversions",
    "number-systems",
    "physics-math",
  ]) assert.match(source, new RegExp(`/tools/category/${category}/`));
  assert.match(source, /Gradify/i);
  assert.match(source, /Model Mission/i);
  assert.match(source, /Sensor Code Generator/i);
});

