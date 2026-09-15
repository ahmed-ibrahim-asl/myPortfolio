import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Guards the "one surface, one edge" rule from the 2026-09-03 all-tools audit: one bordered
// workspace, learning content shares one entry rule instead of per-section boxes, and structural
// border nesting stays at or below two levels.

const CALCULATOR_DIR = "components/tools/calculators";
const read = (path) => readFileSync(path, "utf8");

test("shared calculator hierarchy hooks exist on the components that anchor them", () => {
  const ui = read("components/tools/CalculatorUI.js");
  const shell = read("components/tools/CalculatorShell.js");
  const finder = read("components/tools/CalculatorFinder.js");

  assert.match(ui, /data-tool-workspace/, "CalculatorPanel must expose data-tool-workspace");
  assert.match(ui, /data-tool-learning/, "CalculatorLearning must expose data-tool-learning");
  assert.match(ui, /export function CalculatorLearning/);
  assert.match(ui, /export function LearningDisclosure/);
  assert.match(finder, /data-tool-support/, "CalculatorFinder must expose data-tool-support");
  assert.match(shell, /tool-support-region/);
});

test("learning content is never individually boxed inside the calculator shell", () => {
  const css = read("app/asl-tools.css");

  assert.match(
    css,
    /\[data-tool-learning\][^{]*:is\([^)]*tool-section[^)]*\)\s*\{[^}]*border:\s*0 !important/s,
    "tool-section must lose its own border when nested inside the learning region"
  );
  assert.match(
    css,
    /\[data-tool-learning\][^{]*:is\([^)]*tool-mnemonic[^)]*\)\s*\{[^}]*border:\s*0 !important/s,
    "tool-mnemonic must lose its own border when nested inside the learning region"
  );
  assert.doesNotMatch(
    css,
    /\.article-body\s*>\s*\.calculator-panel\s*\{\s*order:\s*-1/,
    "the panel-first visual order must not depend on CSS order"
  );
});

test("results render as an unboxed tinted band, not a bordered card", () => {
  const css = read("app/asl-tools.css");

  assert.match(css, /\.calculator-result\s*\{[^}]*border:\s*0 !important/s);
});

test("the calculator finder is visually quiet: one divider, no card borders on results", () => {
  const css = read("app/asl-tools.css");

  assert.match(css, /\.calculator-finder\s*\{[^}]*border:\s*0/s);
  assert.match(css, /\.calculator-finder-results > a\s*\{[^}]*border:\s*0/s);
  assert.match(css, /\.tool-support-region\s*\{[^}]*border-top:\s*1px solid/s);
});

test("every calculator component uses the shared learning wrapper instead of loose sections", () => {
  const files = readdirSync(CALCULATOR_DIR).filter(
    (name) => name.endsWith(".js") && name !== "index.js"
  );
  assert.equal(files.length, 36);

  const failures = [];
  for (const file of files) {
    const source = read(`${CALCULATOR_DIR}/${file}`);
    if (!source.includes("<CalculatorLearning>")) {
      failures.push(`${file}: missing <CalculatorLearning> wrapper`);
    }
    if (!source.includes("data-calculator-experience")) {
      failures.push(`${file}: missing data-calculator-experience on the outer article-body`);
    }
  }
  assert.deepEqual(failures, []);
});
