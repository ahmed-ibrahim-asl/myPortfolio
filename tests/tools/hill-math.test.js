import test from 'node:test';
import assert from 'node:assert/strict';
import { hillTransform, invertMatrix, parseMatrix, modInverse, isInvertible } from '../../lib/tools/hill.js';

test('3x3 Hill cipher matches the Stallings textbook example and round-trips', () => {
  const key = [
    [17, 17, 5],
    [21, 18, 21],
    [2, 2, 19]
  ];
  const ct = hillTransform('paymoremoney', key);
  assert.equal(ct, 'LNSHDLEWMTRW');
  assert.equal(hillTransform(ct, key, true), 'PAYMOREMONEY');
});

test('2x2 Hill cipher round-trips', () => {
  const key = [
    [3, 3],
    [2, 7]
  ];
  const ct = hillTransform('HELP', key);
  assert.equal(ct, 'HQAX');
  assert.equal(hillTransform(ct, key, true), 'HELP');
});

test('modInverse and isInvertible agree on which determinants are usable mod 26', () => {
  assert.equal(modInverse(5, 26), 21);
  assert.equal(modInverse(2, 26), null);
  assert.equal(isInvertible([[3, 3], [2, 7]]), true);
  assert.equal(isInvertible([[2, 4], [4, 8]]), false);
});

test('invertMatrix throws for a singular (non-invertible) key matrix', () => {
  assert.throws(() => invertMatrix([[2, 4], [4, 8]]));
  assert.throws(() => invertMatrix([[1, 2, 3], [2, 4, 6], [3, 6, 9]]));
});

test('parseMatrix reads whitespace/comma separated numbers into an n x n matrix', () => {
  assert.deepEqual(parseMatrix('17,17,5,21,18,21,2,2,19', 3), [
    [17, 17, 5],
    [21, 18, 21],
    [2, 2, 19]
  ]);
  assert.throws(() => parseMatrix('1 2 3', 2));
});

test('Odd-length plaintext is padded with X to fill the final block', () => {
  const key = [
    [3, 3],
    [2, 7]
  ];
  const ct = hillTransform('CAT', key);
  assert.equal(ct.length, 4);
});
