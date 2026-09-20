function stripNonLetters(text) {
  return String(text)
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

export function railFenceEncrypt(text, rails) {
  const clean = stripNonLetters(text);
  if (!Number.isInteger(rails) || rails < 2) throw new RangeError('Choose a whole number of rails, 2 or more.');
  if (rails >= clean.length) return clean;
  const fence = Array.from({ length: rails }, () => []);
  let rail = 0;
  let dir = 1;
  for (const ch of clean) {
    fence[rail].push(ch);
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  return fence.flat().join('');
}

export function railFenceDecrypt(text, rails) {
  const clean = stripNonLetters(text);
  if (!Number.isInteger(rails) || rails < 2) throw new RangeError('Choose a whole number of rails, 2 or more.');
  const len = clean.length;
  if (rails >= len) return clean;
  const pattern = [];
  let rail = 0;
  let dir = 1;
  for (let i = 0; i < len; i += 1) {
    pattern.push(rail);
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  const counts = Array(rails).fill(0);
  pattern.forEach((r) => {
    counts[r] += 1;
  });
  const rowsChars = [];
  let idx = 0;
  for (let r = 0; r < rails; r += 1) {
    rowsChars.push([...clean.slice(idx, idx + counts[r])]);
    idx += counts[r];
  }
  const rowPointers = Array(rails).fill(0);
  let result = '';
  for (const r of pattern) {
    result += rowsChars[r][rowPointers[r]];
    rowPointers[r] += 1;
  }
  return result;
}

export function railFenceZigzag(text, rails) {
  const clean = stripNonLetters(text);
  const grid = Array.from({ length: rails }, () => Array(clean.length).fill(''));
  let rail = 0;
  let dir = 1;
  for (let i = 0; i < clean.length; i += 1) {
    grid[rail][i] = clean[i];
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  return grid;
}

export function columnOrder(keyword) {
  const letters = [...String(keyword).toUpperCase()];
  if (!letters.length) throw new RangeError('Enter a keyword with at least one letter.');
  return letters
    .map((ch, i) => ({ ch, i }))
    .sort((a, b) => (a.ch === b.ch ? a.i - b.i : a.ch < b.ch ? -1 : 1))
    .map((x) => x.i);
}

export function columnarEncrypt(text, keyword) {
  const clean = stripNonLetters(text);
  const cols = String(keyword).replace(/[^A-Za-z]/g, '').length;
  if (!cols) throw new RangeError('Enter a keyword with at least one letter.');
  const order = columnOrder(keyword);
  const rows = Math.ceil(clean.length / cols);
  let result = '';
  for (const colIdx of order) {
    for (let r = 0; r < rows; r += 1) {
      const pos = r * cols + colIdx;
      if (pos < clean.length) result += clean[pos];
    }
  }
  return result;
}

export function columnarDecrypt(text, keyword) {
  const clean = stripNonLetters(text);
  const cols = String(keyword).replace(/[^A-Za-z]/g, '').length;
  if (!cols) throw new RangeError('Enter a keyword with at least one letter.');
  const order = columnOrder(keyword);
  const rows = Math.ceil(clean.length / cols);
  const fullCols = clean.length % cols === 0 ? cols : clean.length % cols;
  const colLengthByOriginalIndex = Array.from({ length: cols }, (_, originalIdx) =>
    originalIdx < fullCols ? rows : rows - 1
  );
  const columns = Array(cols).fill(null);
  let idx = 0;
  order.forEach((colIdx) => {
    const len = colLengthByOriginalIndex[colIdx];
    columns[colIdx] = [...clean.slice(idx, idx + len)];
    idx += len;
  });
  let result = '';
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (columns[c][r] !== undefined) result += columns[c][r];
    }
  }
  return result;
}

export function keylessColumnarEncrypt(text, columns) {
  if (!Number.isInteger(columns) || columns < 2) throw new RangeError('Choose a whole number of columns, 2 or more.');
  const clean = stripNonLetters(text);
  const rows = Math.ceil(clean.length / columns);
  let result = '';
  for (let c = 0; c < columns; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      const pos = r * columns + c;
      if (pos < clean.length) result += clean[pos];
    }
  }
  return result;
}

export function keylessColumnarDecrypt(text, columns) {
  if (!Number.isInteger(columns) || columns < 2) throw new RangeError('Choose a whole number of columns, 2 or more.');
  const clean = stripNonLetters(text);
  const rows = Math.ceil(clean.length / columns);
  const fullCols = clean.length % columns === 0 ? columns : clean.length % columns;
  const colLengths = Array.from({ length: columns }, (_, c) => (c < fullCols ? rows : rows - 1));
  const cols = [];
  let idx = 0;
  for (let c = 0; c < columns; c += 1) {
    cols.push([...clean.slice(idx, idx + colLengths[c])]);
    idx += colLengths[c];
  }
  let result = '';
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      if (cols[c][r] !== undefined) result += cols[c][r];
    }
  }
  return result;
}
