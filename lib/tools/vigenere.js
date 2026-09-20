export const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
function keyLettersOf(keyword) {
  const letters = [...String(keyword)].filter(isLetter).map(letterVal);
  if (!letters.length) throw new RangeError('Enter a keyword with at least one letter.');
  return letters;
}

export function vigenereTransform(text, keyword, decode = false) {
  const keyLetters = keyLettersOf(keyword);
  let k = 0;
  return [...String(text)]
    .map((ch) => {
      if (!isLetter(ch)) return ch;
      const shift = keyLetters[k % keyLetters.length];
      k += 1;
      const value = decode ? letterVal(ch) - shift : letterVal(ch) + shift;
      return applyCase(ch, value);
    })
    .join('');
}

export function vigenereKeyStream(text, keyword) {
  const keyLetters = keyLettersOf(keyword);
  let k = 0;
  return [...String(text)]
    .filter(isLetter)
    .map(() => alphabet[keyLetters[k++ % keyLetters.length]]);
}

export function autokeyTransform(text, keyword, decode = false) {
  const keyLetters = keyLettersOf(keyword);
  const plainVals = [];
  return [...String(text)]
    .map((ch) => {
      if (!isLetter(ch)) return ch;
      const idx = plainVals.length;
      const keyVal = idx < keyLetters.length ? keyLetters[idx] : plainVals[idx - keyLetters.length];
      let plainVal;
      let outVal;
      if (decode) {
        plainVal = ((letterVal(ch) - keyVal) % 26 + 26) % 26;
        outVal = plainVal;
      } else {
        plainVal = letterVal(ch);
        outVal = (plainVal + keyVal) % 26;
      }
      plainVals.push(plainVal);
      return applyCase(ch, outVal);
    })
    .join('');
}

export function autokeyStream(text, keyword, decode = false) {
  const keyLetters = keyLettersOf(keyword);
  const plainVals = [];
  const stream = [];
  [...String(text)].forEach((ch) => {
    if (!isLetter(ch)) return;
    const idx = plainVals.length;
    const keyVal = idx < keyLetters.length ? keyLetters[idx] : plainVals[idx - keyLetters.length];
    stream.push(alphabet[keyVal]);
    const plainVal = decode
      ? ((letterVal(ch) - keyVal) % 26 + 26) % 26
      : letterVal(ch);
    plainVals.push(plainVal);
  });
  return stream;
}
