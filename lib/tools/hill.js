const MOD = 26;

function mod(n, m = MOD) {
  return ((n % m) + m) % m;
}

export function parseMatrix(input, n) {
  const nums = String(input)
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  if (nums.length !== n * n || nums.some((x) => !Number.isFinite(x))) {
    throw new RangeError(`Enter ${n * n} whole numbers for a ${n}x${n} key matrix.`);
  }
  const matrix = [];
  for (let r = 0; r < n; r += 1) matrix.push(nums.slice(r * n, r * n + n).map((x) => mod(x)));
  return matrix;
}

function determinant(matrix) {
  const n = matrix.length;
  if (n === 2) {
    return mod(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
  }
  if (n === 3) {
    const [a, b, c] = matrix[0];
    const [d, e, f] = matrix[1];
    const [g, h, i] = matrix[2];
    return mod(a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
  }
  throw new RangeError('Only 2x2 and 3x3 key matrices are supported.');
}

export function modInverse(a, m = MOD) {
  const av = mod(a, m);
  for (let x = 1; x < m; x += 1) {
    if (mod(av * x, m) === 1) return x;
  }
  return null;
}

function adjugate(matrix) {
  const n = matrix.length;
  if (n === 2) {
    const [[a, b], [c, d]] = matrix;
    return [
      [mod(d), mod(-b)],
      [mod(-c), mod(a)]
    ];
  }
  const cof = (r, c) => {
    const minor = matrix.filter((_, ri) => ri !== r).map((row) => row.filter((_, ci) => ci !== c));
    const m2 = minor[0][0] * minor[1][1] - minor[0][1] * minor[1][0];
    return (r + c) % 2 === 0 ? m2 : -m2;
  };
  const cofactors = [];
  for (let r = 0; r < 3; r += 1) {
    cofactors.push([0, 1, 2].map((c) => mod(cof(r, c))));
  }
  const adj = [];
  for (let r = 0; r < 3; r += 1) adj.push([0, 1, 2].map((c) => cofactors[c][r]));
  return adj;
}

export function isInvertible(matrix) {
  const det = determinant(matrix);
  return modInverse(det) !== null;
}

export function invertMatrix(matrix) {
  const det = determinant(matrix);
  const detInv = modInverse(det);
  if (detInv === null) {
    throw new RangeError(`Determinant ${det} has no inverse mod 26 - choose a different key matrix.`);
  }
  const adj = adjugate(matrix);
  return adj.map((row) => row.map((x) => mod(x * detInv)));
}

function letterVal(c) {
  return c.toUpperCase().charCodeAt(0) - 65;
}
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function hillTransform(text, matrix, decode = false) {
  const n = matrix.length;
  const workingMatrix = decode ? invertMatrix(matrix) : matrix;
  const letters = String(text)
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .map(letterVal);
  if (!letters.length) throw new RangeError('Enter text with at least one letter.');
  while (letters.length % n !== 0) letters.push(letterVal('X'));
  let result = '';
  for (let i = 0; i < letters.length; i += n) {
    const block = letters.slice(i, i + n);
    for (let r = 0; r < n; r += 1) {
      let sum = 0;
      for (let c = 0; c < n; c += 1) sum += workingMatrix[r][c] * block[c];
      result += ALPHA[mod(sum)];
    }
  }
  return result;
}
