import test from 'node:test';
import assert from 'node:assert/strict';
import { cascadedGain } from '../../lib/tools/opamp-design.js';
import { recommendControl } from '../../lib/tools/control-design.js';
import { evaluateGate, gateTruthTable } from '../../lib/tools/logic-design.js';

test('cascaded op amp stages multiply gain and track polarity',()=>{
  const result=cascadedGain([{type:'non-inverting',rin:10000,rf:10000},{type:'inverting',rin:10000,rf:20000}],0.1);
  assert.equal(result.totalGain,-4); assert.equal(result.outputVoltage,-0.4); assert.equal(result.inverted,true);
});
test('control assistant recommends the circuit family from intent',()=>{
  assert.equal(recommendControl({bits:1,clocked:true}).kind,'D flip-flop');
  assert.equal(recommendControl({bits:1,toggle:true}).kind,'T flip-flop');
  assert.equal(recommendControl({bits:8}).kind,'Register');
  assert.equal(recommendControl({sequence:true}).kind,'Counter');
});
test('logic designer evaluates gates and generates a truth table',()=>{
  assert.equal(evaluateGate('XOR',[1,0]),true); assert.equal(evaluateGate('NAND',[1,1]),false);
  assert.deepEqual(gateTruthTable('AND').map(row=>row.y),[0,0,0,1]);
});
