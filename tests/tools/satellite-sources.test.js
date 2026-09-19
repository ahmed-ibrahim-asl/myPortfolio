import test from 'node:test';
import assert from 'node:assert/strict';
import * as sources from '../../lib/tools/satellite/sources.js';

test('source labels retain all supporting pages and comparison references', () => {
  assert.equal(typeof sources.formatSource, 'function');
  assert.equal(sources.formatSource({file:'book.pdf',page:50,pages:[50,51],additional:[{file:'exam.pdf',page:6,pages:[6,7]}]}), 'book.pdf · PDF pages 50, 51; exam.pdf · PDF pages 6, 7');
  assert.equal(sources.formatSource({file:'lab.pdf',page:63}), 'lab.pdf · PDF page 63');
  assert.equal(sources.formatSource({file:'Course derivation',page:null}), 'Course derivation');
});
