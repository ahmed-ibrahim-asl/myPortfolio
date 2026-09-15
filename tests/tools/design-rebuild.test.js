import test from "node:test";
import assert from "node:assert/strict";
import { stepMemory } from "../../lib/tools/control-design.js";
import { evaluateRules, rulesTruthTable, gateTruthTable } from "../../lib/tools/logic-design.js";
import { cascadedGain } from "../../lib/tools/opamp-design.js";

test("memory changes on deliberate events, holds and wraps correctly", () => {
  assert.equal(stepMemory("d", 0, { d: 1 }, false, 1), 0);
  assert.equal(stepMemory("d", 0, { d: 1 }, true, 1), 1);
  for (let q = 0; q < 2; q++) {
    assert.equal(stepMemory("jk", q, { j: 0, k: 0 }, true, 1), q);
    assert.equal(stepMemory("jk", q, { j: 1, k: 1 }, true, 1), 1 - q);
    assert.equal(stepMemory("jk", q, { j: 0, k: 1 }, true, 1), 0);
    assert.equal(stepMemory("jk", q, { j: 1, k: 0 }, true, 1), 1);
  }
  assert.equal(stepMemory("counter", 7, {}, true, 3), 0);
  assert.equal(stepMemory("shift", 5, { d: 1 }, true, 3), 3);
  assert.equal(stepMemory("sr", 0, { s: 1, r: 0 }, false, 1), 1);
  assert.throws(() => stepMemory("sr", 0, { s: 1, r: 1 }, false, 1), /forbidden/i);
  assert.throws(() => stepMemory("d", 0, {}, true, NaN));
});
test("selector rules generate exact OR of AND conditions, including ignore", () => {
  const rules = [
    [1, 0],
    [0, 1]
  ];
  assert.deepEqual(
    rulesTruthTable(2, rules).map((r) => r.y),
    [0, 1, 1, 0]
  );
  assert.equal(evaluateRules([1, 1, 0], [[1, -1, 0]]), 1);
  assert.equal(evaluateRules([1, 0], []), 0);
  assert.equal(evaluateRules([0, 0], [[-1, -1]]), 1);
  assert.equal(gateTruthTable("NOT").length, 2);
});
test("cascade accepts negative and zero signals without losing total gain", () => {
  const stages = [
    { type: "inverting", rin: 1000, rf: 2000 },
    { type: "inverting", rin: 1000, rf: 3000 }
  ];
  assert.equal(cascadedGain(stages, -0.1).outputVoltage, -0.6000000000000001);
  assert.equal(cascadedGain(stages, 0).totalGain, 6);
  assert.equal(cascadedGain(stages, 0).outputVoltage, 0);
  assert.throws(() => cascadedGain([{ type: "inverting", rin: 1e-300, rf: 1e300 }], 1));
});
