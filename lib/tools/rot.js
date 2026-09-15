export const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export function rotateText(text, shift, decode = false) {
  if (!Number.isInteger(shift) || shift < 1 || shift > 25) throw new RangeError('Choose a whole shift from 1 to 25.');
  const n = decode ? 26 - shift : shift;
  return String(text).replace(/[A-Za-z]/g, c => {
    const base = c >= 'a' && c <= 'z' ? 97 : 65;
    return String.fromCharCode((c.charCodeAt(0) - base + n) % 26 + base);
  });
}
export function rotationRows(text) {
  return Array.from({length:25}, (_,i) => ({shift:i+1,text:rotateText(text,i+1,true)}));
}
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function rotationSvg(text, shift, decode = false) {
  const output = rotateText(text,shift,decode);
  const label = decode ? 'Decode' : 'Encode';
  const cells = [...alphabet].map((c,i) => {
    const x=40+i%13*66, y=120+Math.floor(i/13)*125;
    return `<g><rect x="${x}" y="${y}" width="58" height="92" rx="6" fill="#fff" stroke="#a0a8b2"/><text x="${x+29}" y="${y+32}" text-anchor="middle">${c}</text><text x="${x+29}" y="${y+75}" text-anchor="middle" fill="#704b12">${rotateText(c,shift,decode)}</text></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="940" height="530" viewBox="0 0 940 530"><title>ROT${shift} alphabet mapping</title><rect width="940" height="530" fill="#f4f5f7"/><g font-family="Arial,sans-serif" fill="#0b0d11"><text x="40" y="55" font-size="32" font-weight="bold">ROT${shift} · ${label}</text><text x="40" y="88" font-size="16">Top: input letter · Bottom: output letter · Wrap around at Z</text><g font-size="25">${cells}</g><text x="40" y="425" font-size="20">${escape(String(text).slice(0,60))}</text><text x="40" y="462" font-size="20" fill="#704b12">${escape(output.slice(0,60))}</text><text x="40" y="502" font-size="14">ASL · ROT Explorer · ASCII letters only. Educational encoding, not secure encryption. Example limited to 60 characters.</text></g></svg>`;
}
