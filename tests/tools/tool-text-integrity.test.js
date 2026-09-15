import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Guards the P1 finding from the 2026-09-03 all-tools audit: 82 rendered mojibake occurrences
// across 25 calculator sources, all of the form "�-" where a "×" had been corrupted. Every
// user-facing tool source must stay free of the UTF-8 replacement character and the common
// double-encoding mojibake sequences (Ã, Â, â followed by a continuation byte).

const MOJIBAKE_PATTERNS = [
  { name: "U+FFFD replacement character", pattern: /�/ },
  { name: "Ã mojibake", pattern: /Ã[-¿]/ },
  { name: "Â mojibake", pattern: /Â[-¿]/ },
  { name: "â mojibake", pattern: /â[-]/ }
];

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...collectFiles(path));
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

const SCAN_ROOTS = ["components/tools", "app/tools", "data", "lib"];

test("no user-facing tool source contains mojibake", () => {
  const failures = [];

  for (const root of SCAN_ROOTS) {
    for (const file of collectFiles(root)) {
      const source = readFileSync(file, "utf8");
      for (const { name, pattern } of MOJIBAKE_PATTERNS) {
        if (pattern.test(source)) {
          failures.push(`${file}: contains ${name}`);
        }
      }
    }
  }

  assert.deepEqual(failures, [], `mojibake found:\n${failures.join("\n")}`);
});

test("multiplication is rendered as × and no calculator uses a corrupted operator key", () => {
  const binary = readFileSync("components/tools/calculators/BinaryCalculator.js", "utf8");
  const hex = readFileSync("components/tools/calculators/HexCalculator.js", "utf8");
  const ohms = readFileSync("components/tools/calculators/OhmsLawCalculator.js", "utf8");

  for (const source of [binary, hex]) {
    assert.match(source, /"×":\s*\(a,\s*b\)\s*=>\s*a \* b/);
    assert.doesNotMatch(source, /"[^"]*-":\s*\(a,\s*b\)\s*=>\s*a \* b/);
  }
  assert.match(ohms, /V = I × R/);
});
