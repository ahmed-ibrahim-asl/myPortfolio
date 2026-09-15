import test from 'node:test';
import assert from 'node:assert/strict';
import {flybackDesign} from '../../lib/tools/smps-design.js';
const fixture={mode:'dc',inputMin:24,inputMax:30,output:12,current:1,frequency:100000,duty:.35,transfer:.45,diode:.5,busRipple:20,ripple:.1};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('DCM design conserves energy, volt-seconds and secondary charge',()=>{
 const r=flybackDesign(fixture);
 near(.5*r.inductance*r.primaryPeak**2*fixture.frequency,12.5);
 near(.5*r.secondaryPeak*r.transfer,fixture.current);
 near(r.busMin*r.duty,r.reflected*r.transfer);
 near(r.idle,.2);
 near(r.switchVoltage,30+r.reflected);
 near(r.diodeVoltage,12+30/r.ratio);
});
test('AC mode uses explicit reservoir sag, not RMS as the primary bus',()=>{
 const r=flybackDesign({...fixture,mode:'ac',inputMin:207,inputMax:253});
 near(r.busMin,207*Math.SQRT2-1.4-20);
 near(r.busMax,253*Math.SQRT2-1.4);
});
test('fixed inductance requires less on-time at higher input voltage',()=>{
 const r=flybackDesign(fixture);
 near(r.dutyAtMax,r.duty*24/30);
 assert.ok(r.capacitance>0&&r.primaryRms>0&&r.secondaryRms>0);
});
test('rejects invalid and boundary-mode assumptions without Infinity output',()=>{
 for(const patch of [{mode:'other'},{inputMin:0},{inputMax:20},{current:0},{frequency:NaN},{duty:.7,transfer:.4},{transfer:0},{ripple:12},{mode:'ac',busRipple:500},{output:Infinity},{frequency:Number.MIN_VALUE}])assert.throws(()=>flybackDesign({...fixture,...patch}),RangeError);
});
