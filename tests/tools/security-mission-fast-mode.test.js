import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createDefaultSecurityMissionProject } from "../../lib/tools/security-mission/project-config.js";
import { createSecurityMissionState } from "../../lib/tools/security-mission/state.js";

// Guards the "fast mode" redesign: tool search is the default entry point (not an objective
// wizard), every control is visible by default (no learning-level picker required first), and
// "Explain this choice" opens the shared floating window instead of an inline disclosure.

test("the default project shows every control (learningLevel advanced) without picking a level", () => {
  const project = createDefaultSecurityMissionProject();
  assert.equal(project.learningLevel, "advanced");
});

test("the default entry mode is tool search, not the objective wizard", () => {
  const state = createSecurityMissionState();
  assert.equal(state.navigatorTab, "tool");
});

test("the learning-level switch is tucked behind a disclosure, not shown open by default", () => {
  const source = readFileSync("components/tools/security-mission/SecurityMissionShell.tsx", "utf8");
  assert.match(source, /<details className=\{styles\.levelDisclosure\}>/);
});

test("SecurityExplanation opens the shared floating window instead of an inline dl panel", () => {
  const source = readFileSync("components/tools/security-mission/SecurityExplanation.tsx", "utf8");
  assert.match(source, /import \{ FloatingExplainer \} from "\.\.\/FloatingExplainer"/);
  assert.match(source, /<FloatingExplainer/);
  assert.doesNotMatch(source, /aria-expanded/);
});
