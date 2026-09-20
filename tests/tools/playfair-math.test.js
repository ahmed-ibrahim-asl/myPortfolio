import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGrid, buildDigraphs, playfairTransform } from '../../lib/tools/playfair.js';

test('Grid is built from the keyword then the rest of the alphabet, with J merged into I', () => {
  const grid = buildGrid('PLAYFAIR EXAMPLE');
  assert.deepEqual(grid, [
    ['P', 'L', 'A', 'Y', 'F'],
    ['I', 'R', 'E', 'X', 'M'],
    ['B', 'C', 'D', 'G', 'H'],
    ['K', 'N', 'O', 'Q', 'S'],
    ['T', 'U', 'V', 'W', 'Z']
  ]);
});

test('Digraphs split double letters with a filler X and pad an odd final letter', () => {
  const pairs = buildDigraphs('Hide the gold in the tree stump').map((p) => p.join(''));
  assert.deepEqual(pairs, ['HI', 'DE', 'TH', 'EG', 'OL', 'DI', 'NT', 'HE', 'TR', 'EX', 'ES', 'TU', 'MP']);
  assert.deepEqual(buildDigraphs('BALLOON').map((p) => p.join('')), ['BA', 'LX', 'LO', 'ON']);
  assert.deepEqual(buildDigraphs('HELLO').map((p) => p.join('')), ['HE', 'LX', 'LO']);
});

test('Encrypting the Wikipedia example matches the published ciphertext', () => {
  const ct = playfairTransform('Hide the gold in the tree stump', 'PLAYFAIR EXAMPLE');
  assert.equal(ct, 'BMODZBXDNABEKUDMUIXMMOUVIF');
});

test('Decrypting the ciphertext recovers the digraph-expanded plaintext', () => {
  const ct = playfairTransform('Hide the gold in the tree stump', 'PLAYFAIR EXAMPLE');
  const pt = playfairTransform(ct, 'PLAYFAIR EXAMPLE', true);
  assert.equal(pt, 'HIDETHEGOLDINTHETREXESTUMP');
});

test('Rejects empty keyword or empty text', () => {
  assert.throws(() => buildGrid(''));
  assert.throws(() => buildDigraphs(''));
});

test('Playfair consistently merges J into I', () => {
  assert.deepEqual(buildDigraphs('JIG').map((pair) => pair.join('')), ['IX', 'IG']);
});
