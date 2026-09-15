import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToString } from "react-dom/server";
import { JSDOM } from "jsdom";
import {
  bridgeDesign,
  linearRegulatorDesign,
  buckDesign
} from "../../lib/tools/power-conversion.js";
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} should equal ${b}`);
test("diode accessible titles survive server HTML parsing without hydration text changes", () => {
  const source = readFileSync(
    new URL("../../components/tools/design/PowerSchematic.tsx", import.meta.url),
    "utf8"
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS }
  }).outputText;
  const exports = {};
  const require = createRequire(import.meta.url);
  vm.runInNewContext(compiled, {
    exports,
    require: (id) => (id.endsWith(".css") ? { default: {} } : require(id))
  });
  const html = renderToString(
    React.createElement(exports.default, {
      kind: "buck",
      phase: "on",
      values: [12, 5, 2, 500000, 30, 0.05, 90],
      result: buckDesign(12, 5, 2, 500000, 30, 0.05)
    })
  );
  const document = new JSDOM(html).window.document;
  assert.equal(
    [...document.querySelectorAll("title")].at(-1).textContent,
    "Catch diode: anode to cathode"
  );
});
test("bridge reference gives reservoir, valley and total diode loss", () => {
  const r = bridgeDesign(12, 50, 1, 0.7, 1);
  near(r.capF, 0.01);
  near(r.dc, 15.07056274847714);
  near(r.valley, 14.57056274847714);
  near(r.bridgeLossW, 1.4);
});
test("bridge rejects excessive ripple and permits ideal diodes", () => {
  assert.throws(() => bridgeDesign(1, 50, 1, 0.7, 1), RangeError);
  assert.throws(() => bridgeDesign(12, 50, 1, 0.7, 20), RangeError);
  near(bridgeDesign(12, 50, 1, 0, 1).rectifiedPeak, 16.97056274847714);
});
test("linear reports headroom and heat without generic stability verdict", () => {
  const r = linearRegulatorDesign(12, 5, 0.5, 1, 0.1, 0);
  near(r.dissipation, 3.5);
  near(r.efficiency, 5 / 12);
  near(r.headroom, 7);
  assert.equal(r.stabilityEvaluated, false);
});
test("ideal CCM buck reference separates losses from ideal duty", () => {
  const r = buckDesign(12, 5, 2, 500000, 30, 0.05, 90);
  near(r.duty, 5 / 12);
  near(r.inductance, 9.722222222222223e-6);
  near(r.capF, 3e-6);
  near(r.peakI, 2.3);
  near(r.valleyI, 1.7);
  near(r.lossW, 10 / 9);
  near(buckDesign(12, 5, 2, 500000, 30, 0.05, 100).lossW, 0);
});
test("buck rejects impossible efficiency, CCM boundary and excessive ripple", () => {
  for (const e of [0, -1, 101, Infinity, NaN])
    assert.throws(() => buckDesign(12, 5, 2, 500000, 30, 0.05, e), RangeError);
  assert.throws(() => buckDesign(12, 5, 2, 500000, 200, 0.05), RangeError);
  assert.throws(() => buckDesign(12, 5, 2, 500000, 30, 10), RangeError);
});
test("models reject nonfinite inputs and arithmetic overflow", () => {
  assert.throws(() => bridgeDesign(Infinity, 50, 1, 0.7, 1), RangeError);
  assert.throws(() => bridgeDesign(Number.MAX_VALUE, 50, 1, 0.7, 1), RangeError);
  assert.throws(() => linearRegulatorDesign(12, 5, NaN, 1, 1, 1), RangeError);
  assert.throws(() => linearRegulatorDesign(12, 12, 1, 1, 1, 1), RangeError);
  assert.throws(() => buckDesign(12, 5, 2, Number.MIN_VALUE, 30, 0.05), RangeError);
});
