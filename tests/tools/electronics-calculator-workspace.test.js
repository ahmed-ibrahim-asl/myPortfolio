import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const visualCalculators = [
  "ResistorColorCodeCalculator",
  "FiveBandResistorColorCodeCalculator",
  "SeriesResistorCalculator",
  "ParallelResistorCalculator",
  "VoltageDividerCalculator",
  "RcTimeConstantCalculator",
  "Timer555AstableCalculator",
  "Timer555MonostableCalculator",
  "LedSeriesResistorCalculator",
  "RmsVoltageCalculator",
  "HighPassFilterCalculator",
  "LowPassFilterCalculator",
  "OpAmpGainCalculator"
];

const compactOnlyCalculators = [
  "OhmsLawCalculator",
  "CapacitiveReactanceCalculator",
  "BatteryLifeCalculator"
];

test("CalculatorPanel exposes an opt-in compact workspace with separate visual and controls regions", () => {
  const source = read("components/tools/CalculatorUI.js");
  assert.match(source, /CalculatorPanel\(\{ title = "Try it", compact = false, visual, children \}\)/);
  assert.match(source, /calculator-panel-compact/);
  assert.match(source, /calculator-panel-has-visual/);
  assert.match(source, /calculator-workspace-layout/);
  assert.match(source, /calculator-workspace-visual/);
  assert.match(source, /calculator-workspace-controls/);
  assert.match(source, /!compact/);
});

test("the 13 electronics calculators with diagrams use the explicit compact visual slot", () => {
  for (const calculator of visualCalculators) {
    const source = read(`components/tools/calculators/${calculator}.js`);
    assert.match(
      source,
      /<CalculatorPanel\s+compact\s+visual=\{/,
      `${calculator} should opt into the visual workspace`
    );
  }
});

test("electronics calculators without diagrams opt into compact mode without fake visuals", () => {
  for (const calculator of compactOnlyCalculators) {
    const source = read(`components/tools/calculators/${calculator}.js`);
    assert.match(source, /<CalculatorPanel compact>/, `${calculator} should use the compact no-visual layout`);
    assert.doesNotMatch(
      source,
      /<CalculatorPanel[^>]+visual=/,
      `${calculator} should not reserve a visual column`
    );
  }
});

test("an unscoped calculator retains the legacy panel path", () => {
  const source = read("components/tools/calculators/SquareRootCalculator.js");
  assert.match(source, /<CalculatorPanel>/);
  assert.doesNotMatch(source, /<CalculatorPanel compact/);
});

test("compact workspace CSS is bounded, visual-first, and switches to 44/56 columns at 860px", () => {
  const css = read("app/asl-tools.css");
  assert.match(css, /\.calculator-panel-compact\s*\{[^}]*max-width:\s*1180px/s);
  assert.match(
    css,
    /\.calculator-workspace-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s
  );
  assert.match(css, /@media\s*\(min-width:\s*860px\)/);
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*44fr\)\s+minmax\(0,\s*56fr\)/);
  assert.match(css, /\.calculator-workspace-controls\s*\{[^}]*grid-column:\s*1/s);
  assert.match(css, /\.calculator-workspace-visual\s*\{[^}]*grid-column:\s*2/s);
});

test("compact calculators without a visual use a readable control width", () => {
  const css = read("app/asl-tools.css");
  assert.match(
    css,
    /\.calculator-panel-compact:not\(\.calculator-panel-has-visual\)\s*\{[^}]*max-width:\s*760px/s
  );
});
