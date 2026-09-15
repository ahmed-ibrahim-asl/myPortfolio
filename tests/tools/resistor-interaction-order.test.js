import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Guards Task 5 of the 2026-09-03 design spec: the 4-band and 5-band resistor calculators must
// open with the live resistor body and its band controls, not thousands of pixels of teaching
// content first (the audit measured 3051/3993px and 3234/4175px for these two routes).

const ROUTES = [
  { file: "components/tools/calculators/ResistorColorCodeCalculator.js", bands: 4 },
  { file: "components/tools/calculators/FiveBandResistorColorCodeCalculator.js", bands: 5 }
];

for (const { file, bands } of ROUTES) {
  test(`${file}: resistor diagram, band controls, and result precede all explanatory headings`, () => {
    const source = readFileSync(file, "utf8");

    const diagramIndex = source.indexOf("<ResistorBandsDiagram");
    const panelOpen = source.indexOf("<CalculatorPanel");
    const panelClose = source.indexOf("</CalculatorPanel>");
    const firstSwatchIndex = source.indexOf("<ColorSwatchPicker");
    const resultsIndex = source.indexOf("<CalculatorResults>");
    const learningIndex = source.indexOf("<CalculatorLearning>");

    assert.ok(diagramIndex > -1, "ResistorBandsDiagram must be present");
    assert.ok(diagramIndex > panelOpen && diagramIndex < panelClose, "diagram must be inside CalculatorPanel");
    assert.ok(diagramIndex < firstSwatchIndex, "diagram must precede the band selectors");
    assert.ok(firstSwatchIndex < resultsIndex, "band selectors must precede the result");
    assert.ok(resultsIndex < panelClose, "result must be inside CalculatorPanel");
    assert.ok(panelClose < learningIndex, "the whole workspace must precede the learning region");

    const swatchPickerCount = (source.match(/<ColorSwatchPicker/g) || []).length;
    assert.equal(swatchPickerCount, bands, `expected ${bands} band pickers`);
  });
}

test("ColorSwatchPicker preserves named labels, aria-pressed state, and relies on the shared focus-visible style rather than stacked borders", () => {
  const ui = readFileSync("components/tools/CalculatorUI.js", "utf8");

  assert.match(ui, /aria-label=\{color\.name\}/);
  assert.match(ui, /aria-pressed=\{selected\?\.name === color\.name\}/);
  assert.match(ui, /<span className="sr-only">\{color\.name\}<\/span>/);

  const css = readFileSync("app/asl-tools.css", "utf8");
  const activeSwatchRule = css.match(/\.asl-calculator-shell \.swatch\.active\s*\{([^}]*)\}/s);
  assert.ok(activeSwatchRule, "the active swatch state must be styled");
  const declarationCount = activeSwatchRule[1]
    .split(";")
    .map((line) => line.trim())
    .filter(Boolean).length;
  assert.ok(
    declarationCount <= 2,
    "the active swatch should use at most a border tint and one shadow, not several stacked decorations"
  );
});

test("live resistor preview stays bound to the currently selected bands", () => {
  for (const { file } of ROUTES) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /bandHexes/, `${file} should compute band colors from the selected state`);
    assert.match(source, /<ResistorBandsDiagram bands=\{bandHexes\}/, `${file} must bind the diagram to live state`);
  }
});
