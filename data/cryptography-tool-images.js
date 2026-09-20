export const cryptographyToolImages = Object.freeze({
  "vigenere-cipher": Object.freeze({
    path: "/media/tools/design/vigenere-cipher-instrument-v2.png",
    alt: "Vigenere cipher instrument with paired alphabet rotors and an advancing brass key ribbon",
  }),
  "affine-cipher": Object.freeze({
    path: "/media/tools/design/affine-cipher-instrument-v2.png",
    alt: "Affine cipher instrument with multiply and shift dials feeding a modular output track",
  }),
  "transposition-cipher": Object.freeze({
    path: "/media/tools/design/transposition-cipher-instrument-v2.png",
    alt: "Transposition cipher instrument with tiles moving across zigzag rails and ordered columns",
  }),
  "playfair-cipher": Object.freeze({
    path: "/media/tools/design/playfair-cipher-instrument-v2.png",
    alt: "Playfair cipher instrument with a five by five tile board and paired coordinate markers",
  }),
  "hill-cipher": Object.freeze({
    path: "/media/tools/design/hill-cipher-instrument-v2.png",
    alt: "Hill cipher instrument transforming vector blocks through a precision matrix frame",
  }),
  "hash-generator": Object.freeze({
    path: "/media/tools/design/hash-generator-instrument-v2.png",
    alt: "Hash generator instrument compressing an input stream into a fixed fingerprint pattern",
  }),
  "aes-hex-calculator": Object.freeze({
    path: "/media/tools/design/aes-hex-calculator-instrument-v2.png",
    alt: "AES instrument moving a four by four byte grid through four transformation stages",
  }),
});

export function getCryptographyToolImage(slug) {
  return cryptographyToolImages[slug] ?? null;
}
