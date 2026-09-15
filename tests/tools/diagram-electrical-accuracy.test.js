import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
function load(file) {
  const source = readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, allowJs: true
  }, fileName: file }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)((id) => id.startsWith(".")
    ? load(resolve(dirname(file), `${id}.js`)) : require(id), module, module.exports);
  return module.exports;
}
const base = resolve("components/tools/diagrams");

test("percentage bars preserve relative magnitudes", () => {
  const {PercentageChangeDiagram}=load(base+"/PercentageChangeDiagram.js");
  const html=renderToStaticMarkup(React.createElement(PercentageChangeDiagram,{oldValue:80,newValue:100}));
  const heights=[...html.matchAll(/<rect[^>]*height="([\d.]+)"/g)].map(m=>Number(m[1]));
  assert.equal(heights[0]/heights[1],0.8);
});

test("root geometry responds to numeric input, not just labels", () => {
  for (const [name, small, large, tag] of [
    ["SquareAreaDiagram", {area:4,side:2}, {area:144,side:12}, /<rect[^>]+>/],
    ["CubeVolumeDiagram", {volume:8,edge:2}, {volume:125,edge:5}, /<path[^>]+>/]
  ]) {
    const Component=load(`${base}/${name}.js`)[name];
    const render=(props)=>renderToStaticMarkup(React.createElement(Component,props));
    assert.notEqual(render(small).match(tag)[0],render(large).match(tag)[0]);
    assert.doesNotMatch(render({area:0,side:0,volume:0,edge:0}), /NaN|Infinity/);
  }
});

test("wave geometry responds to period and wavelength", () => {
  for (const [name,key] of [["WavelengthDiagram","wavelength"],["CycleTimelineDiagram","period"]]) {
    const Component=load(`${base}/${name}.js`)[name];
    const render=(n)=>renderToStaticMarkup(React.createElement(Component,{[key]:n}));
    assert.notEqual(render(1).match(/<polyline[^>]+>/)[0],render(2).match(/<polyline[^>]+>/)[0]);
  }
});

test("math diagram labels stay inside their SVG viewport", () => {
  for (const name of ["WavelengthDiagram", "CycleTimelineDiagram", "SquareAreaDiagram", "CubeVolumeDiagram"]) {
    const Component = load(`${base}/${name}.js`)[name];
    const html = renderToStaticMarkup(React.createElement(Component, { area: 144, side: 12, volume: 27, edge: 3 }));
    const height = Number(html.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/)[1]);
    for (const match of html.matchAll(/<text[^>]* y="([\d.-]+)"/g)) {
      assert.ok(Number(match[1]) >= 12 && Number(match[1]) <= height - 6, `${name}: label clipped at ${match[1]}`);
    }
  }
});

test("math calculators use the themed compact visual workspace", async () => {
  for (const slug of ["wavelength", "frequency-to-period", "square-root", "cube-root"]) {
    const html = await (await fetch(`http://localhost:3000/tools/${slug}-calculator/`)).text();
    assert.match(html, /calculator-workspace-visual/, `${slug} still uses the legacy pale diagram layout`);
  }
});

test("high-pass capacitor output lead meets the wire to the output node", () => {
  const { SeriesRCDiagram } = load(`${base}/SeriesRCDiagram.js`);
  const html = renderToStaticMarkup(React.createElement(SeriesRCDiagram, {
    first: "capacitor", second: "resistor", firstLabel: "C", secondLabel: "R"
  }));
  const lines = [...html.matchAll(/<line\b([^>]+)>/g)].map((m) => Object.fromEntries(
    [...m[1].matchAll(/(x1|x2|y1|y2)="([^"]+)"/g)].map((a) => [a[1], Number(a[2])])
  ));
  const outputLead = lines.find((l) => l.x1 === 80 && l.y1 === 55 && l.y2 === 55);
  assert.ok(outputLead);
  assert.ok(lines.some((l) => l.x1 === outputLead.x2 && l.y1 === 55 && l.x2 > l.x1),
    "capacitor lead must join the next wire without a gap");
});

test("RMS diagram labels both peaks and follows the supplied peak voltage", () => {
  const { SineWaveDiagram } = load(`${base}/SineWaveDiagram.js`);
  const html = renderToStaticMarkup(React.createElement(SineWaveDiagram, { peak: 10 }));
  assert.match(html, /10 V/);
  assert.match(html, /7\.07 V/);
  assert.match(html, /−10 V/);
  assert.match(html, /0 V/);
});

test("op-amp topology changes with configuration and input pins stay outside feedback junction", () => {
  const { OpAmpGainDiagram } = load(`${base}/OpAmpGainDiagram.js`);
  const invert = renderToStaticMarkup(React.createElement(OpAmpGainDiagram, { config: "inverting" }));
  const noninvert = renderToStaticMarkup(React.createElement(OpAmpGainDiagram, { config: "non-inverting" }));
  assert.notEqual(invert, noninvert, "configuration must change the actual circuit");
  // External summing node connects horizontally to the negative input in BOTH modes.
  for (const html of [invert, noninvert]) {
    assert.match(html, /x1="170" y1="100" x2="220" y2="100"/);
    assert.match(html, /x1="170" y1="100" x2="170" y2="35"/);
  }
  // Non-inverting signal goes directly into +; inverting + is grounded.
  assert.match(noninvert, /x1="30" y1="160" x2="220" y2="160"/);
  assert.doesNotMatch(invert, /x1="30" y1="160" x2="220" y2="160"/);
});
