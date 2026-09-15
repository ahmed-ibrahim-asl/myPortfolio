import test from 'node:test';
import assert from 'node:assert/strict';
import { rotateText, rotationRows, rotationSvg } from '../../lib/tools/rot.js';
import { coilEstimate, tankDesign, bandpassDesign, bandpassGain } from '../../lib/tools/circuit-design.js';

test('ROT maps ASCII while preserving punctuation, case and non-Latin text', () => {
  assert.equal(rotateText('Hello, Zz! عسل 123', 13), 'Uryyb, Mm! عسل 123');
  for (let n=1;n<26;n++) assert.equal(rotateText(rotateText('Abc XYZ',n),n,true),'Abc XYZ');
  assert.equal(rotateText('ABC',20),'UVW');
  assert.equal(rotationRows('URYYB')[12].text,'HELLO');
  assert.throws(()=>rotateText('a',NaN));
  assert.throws(()=>rotateText('a',1.5));
  assert.match(rotationSvg('<script>&',13,false),/&lt;script&gt;&amp;/);
  assert.doesNotMatch(rotationSvg('<script>&',13,false),/<script>/);
});
test('Wheeler geometry uses inches and rejects physically overlapping turns', () => {
  // Radius 1 inch, length 1 inch, ten turns: 100/19 microhenries.
  const r=coilEstimate(50.8,25.4,10,1);
  assert.ok(Math.abs(r.inductanceUh-100/19)<1e-10);
  assert.ok(coilEstimate(10,1,10,1).warnings.length);
  assert.throws(()=>coilEstimate(0,10,10,1));
});
test('LC inverse design and series-loss estimate are dimensionally consistent', () => {
  const r=tankDesign(1e6,100e-12,2);
  assert.ok(Math.abs(r.inductanceH-0.0002533029591)<1e-12);
  assert.ok(Math.abs(r.q-795.774715)<.001);
  assert.throws(()=>tankDesign(0,1e-9,1));
});
test('buffered band-pass distinguishes stage corners and combined response', () => {
  const r=bandpassDesign(100,1000,100e-9);
  assert.ok(Math.abs(r.rHighPass-15915.4943)<.01);
  assert.ok(Math.abs(r.center-316.227766)<.001);
  assert.ok(Math.abs(bandpassGain(r.center,100,1000)-10/11)<1e-10);
  assert.ok(Math.abs(bandpassGain(r.low3db,100,1000)-r.peak/Math.sqrt(2))<1e-10);
  assert.ok(Math.abs(bandpassGain(r.high3db,100,1000)-r.peak/Math.sqrt(2))<1e-10);
  assert.throws(()=>bandpassDesign(1000,100,1e-9));
});
