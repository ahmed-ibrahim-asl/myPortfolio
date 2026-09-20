import test from 'node:test';
import assert from 'node:assert/strict';
import { vigenereTransform, autokeyTransform, vigenereKeyStream, autokeyStream } from '../../lib/tools/vigenere.js';

test('Vigenere matches the textbook LEMON/ATTACKATDAWN example and round-trips', () => {
  assert.equal(vigenereTransform('ATTACKATDAWN', 'LEMON'), 'LXFOPVEFRNHR');
  assert.equal(vigenereTransform('LXFOPVEFRNHR', 'LEMON', true), 'ATTACKATDAWN');
  for (const [text, key] of [
    ['Hello, World! 123', 'key'],
    ['ROT13 vs VIGENERE', 'abcXYZ'],
    ['a', 'z']
  ]) {
    assert.equal(vigenereTransform(vigenereTransform(text, key), key, true), text);
  }
});

test('Vigenere preserves case, punctuation, digits and non-letters without consuming key position', () => {
  const msg = 'Attack at Dawn!';
  const enc = vigenereTransform(msg, 'lemon');
  assert.equal(vigenereTransform(enc, 'lemon', true), msg);
  assert.equal(vigenereKeyStream('Attack at Dawn!', 'lemon').join(''), 'LEMONLEMONLE');
});

test('Autokey matches the textbook DECEPTIVE/WEAREDISCOVERED example and round-trips', () => {
  const pt = 'wearediscoveredsaveyourself';
  const key = 'deceptive';
  const ct = autokeyTransform(pt, key);
  assert.equal(ct, 'zicvtwqngkzeiigasxstslvvwla');
  assert.equal(autokeyTransform(ct, key, true), pt);
});

test('Autokey round-trips with mixed case and punctuation, and key stream extends with plaintext', () => {
  for (const [text, key] of [
    ['Hello, World! 123', 'key'],
    ['ROT13 vs VIGENERE', 'abcXYZ']
  ]) {
    const c = autokeyTransform(text, key);
    assert.equal(autokeyTransform(c, key, true), text);
  }
  // key stream = keyword letters, then the plaintext letters themselves
  assert.equal(autokeyStream('HELLOTHERE', 'KEY').join(''), 'KEYHELLOTH');
});

test('Vigenere and Autokey reject a keyword with no letters', () => {
  assert.throws(() => vigenereTransform('abc', ''));
  assert.throws(() => vigenereTransform('abc', '123'));
  assert.throws(() => autokeyTransform('abc', ''));
  assert.throws(() => autokeyTransform('abc', '123'));
});
