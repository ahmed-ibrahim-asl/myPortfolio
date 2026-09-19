import test from 'node:test';
import assert from 'node:assert/strict';
import * as visual from '../../lib/tools/satellite/link-visual.js';
test('FT budget visual reads nested legs rather than unrelated standard-mode defaults',()=>{
  assert.equal(typeof visual.linkVisual,'function');
  const leg={frequencyHz:6e9,distanceM:10000,powerW:10,transmitGainDb:20,receiveGainDb:30,pathLossDb:0,antennaTemperatureK:290,pathTemperatureK:270,noiseFigureDb:0,bandwidthHz:1e6};
  const v={linkMode:'course-ft',uplink:leg,downlink:{...leg,powerW:100},uplinkEirpDbw:999};
  const panels=visual.linkVisual(v,'course');
  assert.equal(panels[0].rows[0].end,10);
  assert.equal(panels[0].rows[1].end,30);
  assert.ok(Math.abs(panels[0].rows.at(-1).end-(-68.0047971937))<1e-8);
  assert.ok(Math.abs(panels[1].rows.at(-1).end-panels[0].rows.at(-1).end-10)<1e-9);
});
