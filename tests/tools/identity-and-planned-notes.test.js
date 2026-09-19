import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const aliases = [
  "Ahmed Ibrahim Asl", "Ahmed Asl", "Ahmed Ibrahim Assal", "Ahmed Assal",
  "Ahmed Ibrahim Assl", "Ahmed Assl", "أحمد إبراهيم عسل", "أحمد عسل"
];

test("one canonical Person entity carries every reviewed name variant", () => {
  const seo = readFileSync("lib/seo.ts", "utf8");
  assert.match(seo, /export const personAliases/);
  for (const alias of aliases) assert.match(seo, new RegExp(alias));
  assert.match(seo, /alternateName: personAliases/g);
  assert.match(seo, /"@id": personId/g);
});

test("About explains transliteration without repeating an alias list", () => {
  const about = readFileSync("app/about/page.tsx", "utf8");
  assert.match(about, /Assal and Assl/);
  assert.match(about, /Arabic family name/);
});

test("Notes exposes six useful planned topics without empty article links", () => {
  const data = readFileSync("data/planned-notes.ts", "utf8");
  const ui = readFileSync("components/PlannedNotes.tsx", "utf8");
  for (const topic of ["Embedded prototyping", "ESP32 & IoT", "RF & satellite", "Robotics & ROV", "Image processing & ML", "Engineering tools"]) {
    assert.match(data, new RegExp(topic.replace(/[&]/g, "&")));
  }
  assert.doesNotMatch(ui, /<Link|href=/);
  assert.match(ui, /Planned/);
});
