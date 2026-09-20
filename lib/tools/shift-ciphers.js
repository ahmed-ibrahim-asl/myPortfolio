export const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const VALID_MULTIPLIERS = Object.freeze([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);

function isLetter(c) {
  return /[A-Za-z]/.test(c);
}
function letterVal(c) {
  return c.toUpperCase().charCodeAt(0) - 65;
}
function applyCase(templateChar, value) {
  const c = alphabet[((value % 26) + 26) % 26];
  return templateChar === templateChar.toLowerCase() ? c.toLowerCase() : c;
}

export function modInverse(a, m = 26) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x += 1) {
    if ((a * x) % m === 1) return x;
  }
  return null;
}

export function isValidMultiplier(a) {
  return modInverse(a, 26) !== null;
}

export function additiveTransform(text, b, decode = false) {
  if (!Number.isInteger(b)) throw new RangeError('Enter a whole-number key.');
  return [...String(text)]
    .map((ch) => (isLetter(ch) ? applyCase(ch, decode ? letterVal(ch) - b : letterVal(ch) + b) : ch))
    .join('');
}

export function multiplicativeTransform(text, a, decode = false) {
  if (!Number.isInteger(a) || !isValidMultiplier(a)) {
    throw new RangeError('Choose a multiplier that shares no common factor with 26 (e.g. 3, 5, 7, 9, 11...).');
  }
  const aInv = modInverse(a, 26);
  return [...String(text)]
    .map((ch) => {
      if (!isLetter(ch)) return ch;
      const p = letterVal(ch);
      return applyCase(ch, decode ? p * aInv : p * a);
    })
    .join('');
}

export function affineTransform(text, a, b, decode = false) {
  if (!Number.isInteger(a) || !isValidMultiplier(a)) {
    throw new RangeError('Choose an "a" that shares no common factor with 26 (e.g. 3, 5, 7, 9, 11...).');
  }
  if (!Number.isInteger(b)) throw new RangeError('Enter a whole-number "b".');
  const aInv = modInverse(a, 26);
  return [...String(text)]
    .map((ch) => {
      if (!isLetter(ch)) return ch;
      const value = decode ? aInv * (letterVal(ch) - b) : letterVal(ch) * a + b;
      return applyCase(ch, value);
    })
    .join('');
}
