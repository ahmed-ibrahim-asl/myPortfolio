import test from 'node:test';
import assert from 'node:assert/strict';
import {
  additiveTransform,
  multiplicativeTransform,
  affineTransform,
  modInverse,
  isValidMultiplier,
  VALID_MULTIPLIERS
} from '../../lib/tools/shift-ciphers.js';

test('Additive (Caesar) cipher shifts by a whole-number key and round-trips', () => {
  assert.equal(additiveTransform('ATTACKATDAWN', 3), 'DWWDFNDWGDZQ');
  assert.equal(additiveTransform('DWWDFNDWGDZQ', 3, true), 'ATTACKATDAWN');
  for (const [text, b] of [
    ['Hello, World! 123', 7],
    ['Zz', 25],
    ['a', 0]
  ]) {
    assert.equal(additiveTransform(additiveTransform(text, b), b, true), text);
  }
  assert.throws(() => additiveTransform('a', 1.5));
});

test('Multiplicative cipher requires a multiplier coprime with 26 and round-trips', () => {
  assert.equal(multiplicativeTransform('HELLO', 7), 'XCZZU');
  assert.equal(multiplicativeTransform('XCZZU', 7, true), 'HELLO');
  assert.deepEqual(VALID_MULTIPLIERS, [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);
  assert.equal(isValidMultiplier(4), false);
  assert.equal(isValidMultiplier(13), false);
  assert.throws(() => multiplicativeTransform('a', 4));
  assert.throws(() => multiplicativeTransform('a', 13));
});

test('Affine cipher matches the textbook a=5,b=8 example and round-trips', () => {
  assert.equal(affineTransform('AFFINECIPHER', 5, 8), 'IHHWVCSWFRCP');
  assert.equal(affineTransform('IHHWVCSWFRCP', 5, 8, true), 'AFFINECIPHER');
  for (const a of VALID_MULTIPLIERS) {
    const c = affineTransform('The Quick Brown Fox!', a, 11);
    assert.equal(affineTransform(c, a, 11, true), 'The Quick Brown Fox!');
  }
  assert.throws(() => affineTransform('a', 4, 8));
});

test('modInverse finds the correct modular inverse mod 26', () => {
  assert.equal(modInverse(5, 26), 21);
  assert.equal(modInverse(7, 26), 15);
  assert.equal(modInverse(4, 26), null);
});

test('negative additive keys normalize modulo 26', () => {
  assert.equal(additiveTransform('ABC', -1), 'ZAB');
  assert.equal(affineTransform('ABC', 5, -1), 'ZEJ');
});
