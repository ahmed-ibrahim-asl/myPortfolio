import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultSecurityMissionProject } from "../../lib/tools/security-mission/project-config.js";

test("default project starts in a certification lab with no target values", () => {
  const project = createDefaultSecurityMissionProject();
  assert.equal(project.schemaVersion, 1);
  assert.equal(project.authorizationContext, "certification-lab");
  // Defaults to "advanced" so every control is visible without picking a level first.
  assert.equal(project.learningLevel, "advanced");
  assert.equal(project.mode, "command");
  assert.deepEqual(project.target, {});
  assert.deepEqual(project.options, {});
});
