const SBOX = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9,
  0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f,
  0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07,
  0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3,
  0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58,
  0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3,
  0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec, 0x5f,
  0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88,
  0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac,
  0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a,
  0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70,
  0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
  0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42,
  0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];
const INV_SBOX = new Array(256);
SBOX.forEach((v, i) => {
  INV_SBOX[v] = i;
});

const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

function xtime(a) {
  return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff;
}
function gmul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i += 1) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p;
}

export function hexToBytes(hex) {
  const clean = String(hex).replace(/\s+/g, '');
  if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0) {
    throw new RangeError('Enter an even number of hex characters (0-9, A-F).');
  }
  const bytes = [];
  for (let i = 0; i < clean.length; i += 2) bytes.push(parseInt(clean.slice(i, i + 2), 16));
  return bytes;
}

export function bytesToHex(bytes) {
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function keyExpansion(key) {
  const Nk = key.length / 4;
  const Nr = Nk + 6;
  const w = [];
  for (let i = 0; i < Nk; i += 1) w.push(key.slice(i * 4, i * 4 + 4));
  for (let i = Nk; i < 4 * (Nr + 1); i += 1) {
    let temp = w[i - 1].slice();
    if (i % Nk === 0) {
      temp = [temp[1], temp[2], temp[3], temp[0]].map((b) => SBOX[b]);
      temp[0] ^= RCON[i / Nk - 1];
    } else if (Nk > 6 && i % Nk === 4) {
      temp = temp.map((b) => SBOX[b]);
    }
    w.push(w[i - Nk].map((b, j) => b ^ temp[j]));
  }
  return { w, Nr };
}

function addRoundKey(state, w, round) {
  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) state[r][c] ^= w[round * 4 + c][r];
  }
}
function subBytes(state, box) {
  for (let r = 0; r < 4; r += 1) for (let c = 0; c < 4; c += 1) state[r][c] = box[state[r][c]];
}
function shiftRows(state) {
  for (let r = 1; r < 4; r += 1) {
    const row = state[r];
    state[r] = row.slice(r).concat(row.slice(0, r));
  }
}
function invShiftRows(state) {
  for (let r = 1; r < 4; r += 1) {
    const row = state[r];
    state[r] = row.slice(4 - r).concat(row.slice(0, 4 - r));
  }
}
function mixColumns(state) {
  for (let c = 0; c < 4; c += 1) {
    const col = [state[0][c], state[1][c], state[2][c], state[3][c]];
    state[0][c] = gmul(col[0], 2) ^ gmul(col[1], 3) ^ col[2] ^ col[3];
    state[1][c] = col[0] ^ gmul(col[1], 2) ^ gmul(col[2], 3) ^ col[3];
    state[2][c] = col[0] ^ col[1] ^ gmul(col[2], 2) ^ gmul(col[3], 3);
    state[3][c] = gmul(col[0], 3) ^ col[1] ^ col[2] ^ gmul(col[3], 2);
  }
}
function invMixColumns(state) {
  for (let c = 0; c < 4; c += 1) {
    const col = [state[0][c], state[1][c], state[2][c], state[3][c]];
    state[0][c] = gmul(col[0], 14) ^ gmul(col[1], 11) ^ gmul(col[2], 13) ^ gmul(col[3], 9);
    state[1][c] = gmul(col[0], 9) ^ gmul(col[1], 14) ^ gmul(col[2], 11) ^ gmul(col[3], 13);
    state[2][c] = gmul(col[0], 13) ^ gmul(col[1], 9) ^ gmul(col[2], 14) ^ gmul(col[3], 11);
    state[3][c] = gmul(col[0], 11) ^ gmul(col[1], 13) ^ gmul(col[2], 9) ^ gmul(col[3], 14);
  }
}

function bytesToState(block) {
  const state = Array.from({ length: 4 }, () => new Array(4).fill(0));
  for (let i = 0; i < 16; i += 1) state[i % 4][Math.floor(i / 4)] = block[i];
  return state;
}
function stateToBytes(state) {
  const out = new Array(16);
  for (let i = 0; i < 16; i += 1) out[i] = state[i % 4][Math.floor(i / 4)];
  return out;
}

export function aesEncryptBlock(block, key, trace) {
  const { w, Nr } = keyExpansion(key);
  let state = bytesToState(block);
  addRoundKey(state, w, 0);
  if (trace) trace.push({ round: 0, step: 'AddRoundKey', state: stateToBytes(state) });
  for (let round = 1; round < Nr; round += 1) {
    subBytes(state, SBOX);
    if (trace) trace.push({ round, step: 'SubBytes', state: stateToBytes(state) });
    shiftRows(state);
    if (trace) trace.push({ round, step: 'ShiftRows', state: stateToBytes(state) });
    mixColumns(state);
    if (trace) trace.push({ round, step: 'MixColumns', state: stateToBytes(state) });
    addRoundKey(state, w, round);
    if (trace) trace.push({ round, step: 'AddRoundKey', state: stateToBytes(state) });
  }
  subBytes(state, SBOX);
  if (trace) trace.push({ round: Nr, step: 'SubBytes', state: stateToBytes(state) });
  shiftRows(state);
  if (trace) trace.push({ round: Nr, step: 'ShiftRows', state: stateToBytes(state) });
  addRoundKey(state, w, Nr);
  if (trace) trace.push({ round: Nr, step: 'AddRoundKey', state: stateToBytes(state) });
  return stateToBytes(state);
}

export function aesDecryptBlock(block, key, trace) {
  const { w, Nr } = keyExpansion(key);
  let state = bytesToState(block);
  addRoundKey(state, w, Nr);
  if (trace) trace.push({ round: Nr, step: 'AddRoundKey', state: stateToBytes(state) });
  for (let round = Nr - 1; round > 0; round -= 1) {
    invShiftRows(state);
    if (trace) trace.push({ round, step: 'InvShiftRows', state: stateToBytes(state) });
    subBytes(state, INV_SBOX);
    if (trace) trace.push({ round, step: 'InvSubBytes', state: stateToBytes(state) });
    addRoundKey(state, w, round);
    if (trace) trace.push({ round, step: 'AddRoundKey', state: stateToBytes(state) });
    invMixColumns(state);
    if (trace) trace.push({ round, step: 'InvMixColumns', state: stateToBytes(state) });
  }
  invShiftRows(state);
  if (trace) trace.push({ round: 0, step: 'InvShiftRows', state: stateToBytes(state) });
  subBytes(state, INV_SBOX);
  if (trace) trace.push({ round: 0, step: 'InvSubBytes', state: stateToBytes(state) });
  addRoundKey(state, w, 0);
  if (trace) trace.push({ round: 0, step: 'AddRoundKey', state: stateToBytes(state) });
  return stateToBytes(state);
}

function validKeyLength(key) {
  return key.length === 16 || key.length === 24 || key.length === 32;
}

export function aesEcbTransform(hexText, hexKey, decode = false, trace) {
  const data = hexToBytes(hexText);
  const key = hexToBytes(hexKey);
  if (!validKeyLength(key)) throw new RangeError('Key must be 16, 24, or 32 bytes (32, 48, or 64 hex characters) for AES-128/192/256.');
  if (data.length === 0 || data.length % 16 !== 0) {
    throw new RangeError('Data must be a non-zero multiple of 16 bytes (32 hex characters per block) for ECB mode.');
  }
  const out = [];
  for (let i = 0; i < data.length; i += 16) {
    const block = data.slice(i, i + 16);
    const blockTrace = trace && i === 0 ? trace : undefined;
    out.push(...(decode ? aesDecryptBlock(block, key, blockTrace) : aesEncryptBlock(block, key, blockTrace)));
  }
  return out;
}
