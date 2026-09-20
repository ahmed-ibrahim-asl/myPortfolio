import test from 'node:test';
import assert from 'node:assert/strict';
import { aesEncryptBlock, aesDecryptBlock, aesEcbTransform, hexToBytes, bytesToHex } from '../../lib/tools/aes.js';

const PT = '00112233445566778899aabbccddeeff';

test('AES-128 matches the FIPS-197 Appendix B test vector and round-trips', () => {
  const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
  const pt = hexToBytes(PT);
  const ct = aesEncryptBlock(pt, key);
  assert.equal(bytesToHex(ct), '69c4e0d86a7b0430d8cdb78070b4c55a');
  assert.equal(bytesToHex(aesDecryptBlock(ct, key)), PT);
});

test('AES-192 matches the FIPS-197 Appendix C.2 test vector', () => {
  const key = hexToBytes('000102030405060708090a0b0c0d0e0f1011121314151617');
  const pt = hexToBytes(PT);
  const ct = aesEncryptBlock(pt, key);
  assert.equal(bytesToHex(ct), 'dda97ca4864cdfe06eaf70a0ec0d7191');
  assert.equal(bytesToHex(aesDecryptBlock(ct, key)), PT);
});

test('AES-256 matches the FIPS-197 Appendix C.3 test vector', () => {
  const key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
  const pt = hexToBytes(PT);
  const ct = aesEncryptBlock(pt, key);
  assert.equal(bytesToHex(ct), '8ea2b7ca516745bfeafc49904b496089');
  assert.equal(bytesToHex(aesDecryptBlock(ct, key)), PT);
});

test('ECB wrapper encrypts/decrypts multiple 16-byte blocks and round-trips', () => {
  const hexKey = '000102030405060708090a0b0c0d0e0f';
  const hexData = PT + PT;
  const ct = aesEcbTransform(hexData, hexKey);
  assert.equal(bytesToHex(ct).length, 64);
  const pt = aesEcbTransform(bytesToHex(ct), hexKey, true);
  assert.equal(bytesToHex(pt), hexData);
});

test('Rejects invalid hex, odd-length hex, wrong key length, and non-block-aligned data', () => {
  assert.throws(() => hexToBytes('zz'));
  assert.throws(() => hexToBytes('abc'));
  assert.throws(() => aesEcbTransform(PT, '00'));
  assert.throws(() => aesEcbTransform('00112233', '000102030405060708090a0b0c0d0e0f'));
});
