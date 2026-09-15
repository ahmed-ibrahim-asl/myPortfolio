import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Guards the P1 audit finding: calculators relied on CSS `order: -1` to visually move the
// workspace above the lesson while the real React/DOM/screen-reader order put teaching content
// first. Every calculator's true source order must be workspace -> learning, with no CSS reorder.

const CALCULATOR_DIR = "components/tools/calculators";

function calculatorFiles() {
  return readdirSync(CALCULATOR_DIR).filter((name) => name.endsWith(".js") && name !== "index.js");
}

test("all 36 calculators exist and are covered by this contract", () => {
  assert.equal(calculatorFiles().length, 36);
});

test("CalculatorPanel precedes CalculatorLearning in real source order for every calculator", () => {
  const failures = [];

  for (const file of calculatorFiles()) {
    const source = readFileSync(`${CALCULATOR_DIR}/${file}`, "utf8");
    const panelIndex = source.indexOf("<CalculatorPanel");
    const learningIndex = source.indexOf("<CalculatorLearning>");

    if (panelIndex === -1) {
      failures.push(`${file}: no <CalculatorPanel> found`);
      continue;
    }
    if (learningIndex === -1) {
      failures.push(`${file}: no <CalculatorLearning> found`);
      continue;
    }
    if (panelIndex >= learningIndex) {
      failures.push(`${file}: CalculatorLearning appears before CalculatorPanel in source order`);
    }
  }

  assert.deepEqual(failures, []);
});

test("calculation-critical diagrams sit inside the workspace, not the learning region", () => {
  const failures = [];

  for (const file of calculatorFiles()) {
    const source = readFileSync(`${CALCULATOR_DIR}/${file}`, "utf8");
    const diagramImport = source.match(/import \{ (\w+) \} from "\.\.\/diagrams\/[^"]+";/);
    if (!diagramImport) continue;

    const diagramTag = diagramImport[1];
    const panelOpen = source.indexOf("<CalculatorPanel");
    const panelClose = source.indexOf("</CalculatorPanel>");
    const diagramUse = source.indexOf(`<${diagramTag}`, source.indexOf("return ("));

    if (diagramUse < panelOpen || diagramUse > panelClose) {
      failures.push(`${file}: ${diagramTag} is not nested inside <CalculatorPanel>`);
    }
  }

  assert.deepEqual(failures, []);
});

test("What's going on and The formula stay directly visible; derivation/mnemonic/example are disclosed", () => {
  const failures = [];

  for (const file of calculatorFiles()) {
    const source = readFileSync(`${CALCULATOR_DIR}/${file}`, "utf8");
    const learningStart = source.indexOf("<CalculatorLearning>");
    const learningEnd = source.indexOf("</CalculatorLearning>");
    if (learningStart === -1 || learningEnd === -1) {
      failures.push(`${file}: missing CalculatorLearning region`);
      continue;
    }
    const region = source.slice(learningStart, learningEnd);
    const disclosureStart = region.indexOf("<LearningDisclosure>");
    const disclosureEnd = region.indexOf("</LearningDisclosure>");
    if (disclosureStart === -1 || disclosureEnd === -1) {
      failures.push(`${file}: missing LearningDisclosure`);
      continue;
    }

    const before = region.slice(0, disclosureStart);
    const inside = region.slice(disclosureStart, disclosureEnd);

    if (!before.includes('title="What\'s going on"')) {
      failures.push(`${file}: "What's going on" is not directly visible`);
    }
    if (!before.includes('title="The formula"')) {
      failures.push(`${file}: "The formula" is not directly visible`);
    }
    if (!inside.includes('title="Build it up"')) {
      failures.push(`${file}: "Build it up" is not inside the disclosure`);
    }
    if (!inside.includes("<Mnemonic")) {
      failures.push(`${file}: Mnemonic is not inside the disclosure`);
    }
    if (!inside.includes('title="Worked example"')) {
      failures.push(`${file}: "Worked example" is not inside the disclosure`);
    }
  }

  assert.deepEqual(failures, []);
});

test("CalculatorFinder remains last, after the current tool's learning content", () => {
  const shell = readFileSync("components/tools/CalculatorShell.js", "utf8");
  const bodyIndex = shell.indexOf("tool-body");
  const finderIndex = shell.indexOf("<CalculatorFinder");
  assert.ok(bodyIndex !== -1 && finderIndex !== -1 && bodyIndex < finderIndex);
});
