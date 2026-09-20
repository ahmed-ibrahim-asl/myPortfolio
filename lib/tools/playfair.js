function normalizeKeyword(keyword) {
  const letters = String(keyword)
    .toUpperCase()
    .replace(/J/g, 'I')
    .replace(/[^A-Z]/g, '');
  if (!letters.length) throw new RangeError('Enter a keyword with at least one letter.');
  return letters;
}

export function buildGrid(keyword) {
  const seen = new Set();
  const order = [];
  for (const ch of normalizeKeyword(keyword)) {
    if (!seen.has(ch)) {
      seen.add(ch);
      order.push(ch);
    }
  }
  for (const ch of 'ABCDEFGHIKLMNOPQRSTUVWXYZ') {
    if (!seen.has(ch)) {
      seen.add(ch);
      order.push(ch);
    }
  }
  const grid = [];
  for (let r = 0; r < 5; r += 1) grid.push(order.slice(r * 5, r * 5 + 5));
  return grid;
}

function locate(grid, ch) {
  for (let r = 0; r < 5; r += 1) {
    const c = grid[r].indexOf(ch);
    if (c !== -1) return { r, c };
  }
  throw new RangeError(`Letter ${ch} is not in the grid.`);
}

export function buildDigraphs(text) {
  const letters = [...String(text).toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '')];
  if (!letters.length) throw new RangeError('Enter text with at least one letter.');
  const pairs = [];
  let i = 0;
  while (i < letters.length) {
    const a = letters[i];
    const b = i + 1 < letters.length ? letters[i + 1] : 'X';
    if (a === b) {
      pairs.push([a, 'X']);
      i += 1;
    } else {
      pairs.push([a, b]);
      i += 2;
    }
  }
  return pairs;
}

export function playfairTransform(text, keyword, decode = false) {
  const grid = buildGrid(keyword);
  const step = decode ? 4 : 1;
  const pairs = buildDigraphs(text);
  let result = '';
  for (const [a, b] of pairs) {
    const pa = locate(grid, a);
    const pb = locate(grid, b);
    if (pa.r === pb.r) {
      result += grid[pa.r][(pa.c + step) % 5];
      result += grid[pb.r][(pb.c + step) % 5];
    } else if (pa.c === pb.c) {
      result += grid[(pa.r + step) % 5][pa.c];
      result += grid[(pb.r + step) % 5][pb.c];
    } else {
      result += grid[pa.r][pb.c];
      result += grid[pb.r][pa.c];
    }
  }
  return result;
}
