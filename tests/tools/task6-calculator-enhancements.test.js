import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describeHexToAsciiError, hexToAscii } from "../../lib/numberSystems.js";

const read = (path) => readFileSync(path, "utf8");

test("describeHexToAsciiError names the exact invalid token instead of a generic message", () => {
  assert.equal(hexToAscii("ZZ"), null);
  assert.match(describeHexToAsciiError("ZZ"), /"Z" is not a hex digit/);

  assert.equal(hexToAscii("48 6"), null);
  assert.match(describeHexToAsciiError("48 6"), /"6" is not a two-digit hex byte/);

  assert.equal(hexToAscii("486"), null);
  assert.match(describeHexToAsciiError("486"), /odd count/);

  assert.equal(describeHexToAsciiError(""), "Enter hex byte values, such as 48 65 6C 6C 6F.");

  // A valid string must never produce an error description.
  assert.notEqual(hexToAscii("48 69"), null);
  assert.equal(describeHexToAsciiError("48 69"), null);
});

test("HexToAsciiConverter surfaces the field-specific error instead of a bare dash", () => {
  const source = read("components/tools/calculators/HexToAsciiConverter.js");
  assert.match(source, /describeHexToAsciiError/);
  assert.match(source, /tool-input-notice/);
});

test("Binary Bit Shift Calculator renders a live before/after bit strip", () => {
  const source = read("components/tools/calculators/BinaryBitShiftCalculator.js");
  assert.match(source, /import \{ BitStrip \} from "\.\.\/BitStrip"/);
  assert.match(source, /<BitStrip bits=\{beforeBits\}/);
  assert.match(source, /<BitStrip bits=\{afterBits\}/);
});

test("One's and Two's Complement calculators show position-aligned bit rows", () => {
  for (const file of [
    "components/tools/calculators/OnesComplementCalculator.js",
    "components/tools/calculators/TwosComplementCalculator.js"
  ]) {
    const source = read(file);
    assert.match(source, /import \{ BitStrip \} from "\.\.\/BitStrip"/, `${file} should use BitStrip`);
  }
});

test("Series and Parallel Resistor calculators support an editable list with add/remove and a diagram", () => {
  const series = read("components/tools/calculators/SeriesResistorCalculator.js");
  const parallel = read("components/tools/calculators/ParallelResistorCalculator.js");

  assert.match(series, /SeriesResistorDiagram/);
  assert.match(series, /addResistor/);
  assert.match(series, /removeResistor/);

  assert.match(parallel, /ParallelResistorDiagram/);
  assert.match(parallel, /addResistor/);
  assert.match(parallel, /removeResistor/);
});

test("LED Series Resistor Calculator shows a circuit diagram and names the impossible-voltage warning", () => {
  const source = read("components/tools/calculators/LedSeriesResistorCalculator.js");
  assert.match(source, /LedCircuitDiagram/);
  assert.match(source, /Impossible combination/);
});

test("RMS Voltage Calculator pairs the result with a labeled sine-wave visual", () => {
  const source = read("components/tools/calculators/RmsVoltageCalculator.js");
  assert.match(source, /SineWaveDiagram/);
});

test("Acceleration Calculator lets the visitor choose the unknown like its solve-for siblings", () => {
  const source = read("components/tools/calculators/AccelerationCalculator.js");
  assert.match(source, /Solve for/);
  assert.match(source, /MODE_LABELS/);
  assert.match(source, /finalVelocity/);
  assert.match(source, /initialVelocity/);
});

test("ASCII to HEX Converter accepts multi-line text and keeps whitespace visible", () => {
  const source = read("components/tools/calculators/AsciiToHexConverter.js");
  assert.match(source, /CalculatorTextArea/);
  assert.match(source, /visibleChar/);
});
