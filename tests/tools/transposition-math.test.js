import test from 'node:test';
import assert from 'node:assert/strict';
import {
  railFenceEncrypt,
  railFenceDecrypt,
  columnOrder,
  columnarEncrypt,
  columnarDecrypt,
  keylessColumnarEncrypt,
  keylessColumnarDecrypt
} from '../../lib/tools/transposition.js';

test('Rail fence matches the textbook 3-rail WEAREDISCOVERED example and round-trips', () => {
  const ct = railFenceEncrypt('WEAREDISCOVEREDFLEEATONCE', 3);
  assert.equal(ct, 'WECRLTEERDSOEEFEAOCAIVDEN');
  assert.equal(railFenceDecrypt(ct, 3), 'WEAREDISCOVEREDFLEEATONCE');
});

test('Rail fence round-trips across rail counts, including ragged lengths', () => {
  for (const [text, rails] of [
    ['HELLOWORLD', 2],
    ['HELLOWORLD', 3],
    ['HELLOWORLD', 4],
    ['A', 2],
    ['AB', 2],
    ['ABCDEFGHIJK', 5]
  ]) {
    const c = railFenceEncrypt(text, rails);
    assert.equal(railFenceDecrypt(c, rails), text.toUpperCase());
  }
  assert.throws(() => railFenceEncrypt('a', 1));
});

test('Columnar transposition sorts the keyword alphabetically, keeping ties in original order', () => {
  assert.deepEqual(columnOrder('ZEBRAS'), [4, 2, 1, 3, 5, 0]);
});

test('Keyed columnar transposition round-trips including ragged (non-divisible) lengths', () => {
  for (const [text, key] of [
    ['WEAREDISCOVEREDFLEEATONCE', 'ZEBRAS'],
    ['ATTACKPOSTPONEDUNTILTWOAM', 'KEY'],
    ['A', 'AB'],
    ['HELLOWORLD', 'CIPHER'],
    ['THEQUICKBROWNFOXJUMPS', 'ZEBRAS'],
    ['X', 'ABCDEFGH']
  ]) {
    const c = columnarEncrypt(text, key);
    assert.equal(columnarDecrypt(c, key), text.toUpperCase().replace(/[^A-Z]/g, ''));
  }
  assert.throws(() => columnarEncrypt('a', ''));
});

test('Keyed columnar transposition round-trips every ragged length through 32', () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEF';
  for (let length = 1; length <= 32; length++) {
    const text = alphabet.slice(0, length);
    assert.equal(columnarDecrypt(columnarEncrypt(text, 'ZEBRAS'), 'ZEBRAS'), text);
  }
});

test('Keyless columnar transposition round-trips including ragged lengths', () => {
  for (const [text, cols] of [
    ['HELLOWORLD', 3],
    ['ATTACKATDAWN', 4],
    ['A', 2],
    ['ABCDEFGHIJK', 5]
  ]) {
    const c = keylessColumnarEncrypt(text, cols);
    assert.equal(keylessColumnarDecrypt(c, cols), text.toUpperCase());
  }
  assert.throws(() => keylessColumnarEncrypt('a', 1));
});
