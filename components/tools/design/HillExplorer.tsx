'use client';
import { useState } from 'react';
import { hillTransform, parseMatrix, isInvertible } from '@/lib/tools/hill';
import styles from './DesignLab.module.css';

type Size = 2 | 3;

const DEFAULTS: Record<Size, string> = {
  2: '3,3,2,7',
  3: '17,17,5,21,18,21,2,2,19'
};

export default function HillExplorer() {
  const [size, setSize] = useState<Size>(3);
  const [text, setText] = useState('paymoremoney');
  const [keyText, setKeyText] = useState(DEFAULTS[3]);
  const [decode, setDecode] = useState(false);
  const [notice, setNotice] = useState('');

  let output = '';
  let error = '';
  let matrix: number[][] = [];
  try {
    matrix = parseMatrix(keyText, size);
    if (!isInvertible(matrix)) {
      throw new RangeError('This key matrix has no inverse mod 26 - its determinant shares a factor with 26. Choose different numbers.');
    }
    output = hillTransform(text, matrix, decode);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Enter a valid key matrix and text.';
  }

  function switchSize(next: Size) {
    setSize(next);
    setKeyText(DEFAULTS[next]);
    setText(next === 3 ? 'paymoremoney' : 'HELP');
    setDecode(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setNotice('Output copied.');
    } catch {
      setNotice('Copy is unavailable. Select the output text and copy it manually.');
    }
  }
  function downloadText() {
    const url = URL.createObjectURL(new Blob([output], { type: 'text/plain' }));
    const el = document.createElement('a');
    el.href = url;
    el.download = 'hill-cipher-output.txt';
    el.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Output downloaded as a .txt file.');
  }

  return (
    <>
      <div className={styles.toolbar} role="group" aria-label="Matrix size and operation">
        <button type="button" aria-pressed={size === 2} onClick={() => switchSize(2)}>
          2×2 key
        </button>
        <button type="button" aria-pressed={size === 3} onClick={() => switchSize(3)}>
          3×3 key
        </button>
        <button type="button" aria-pressed={!decode} onClick={() => setDecode(false)}>
          Encode
        </button>
        <button type="button" aria-pressed={decode} onClick={() => setDecode(true)}>
          Decode
        </button>
      </div>
      <div className={styles.toolbar}>
        <label style={{ flex: 1 }}>
          Key matrix (row by row, {size * size} numbers)
          <input type="text" value={keyText} onChange={(e) => setKeyText(e.target.value)} spellCheck={false} style={{ width: '100%' }} />
        </label>
      </div>
      <div className={styles.textGrid}>
        <label className={styles.field}>
          Input
          <textarea value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} spellCheck={false} />
          <small>Non-letters are removed, and the text is padded with X to a multiple of {size}.</small>
        </label>
        {error ? (
          <p role="status" className={styles.note}>
            {error}
          </p>
        ) : (
          <label className={styles.field}>
            Output
            <textarea value={output} readOnly spellCheck={false} aria-live="polite" />
            <small>Uppercase letters only - each block of {size} letters is a column vector multiplied by the key matrix mod 26.</small>
          </label>
        )}
      </div>
      {!error ? (
        <div className={styles.toolbar}>
          <button type="button" onClick={copy}>
            Copy output
          </button>
          <button type="button" onClick={downloadText}>
            Download output (.txt)
          </button>
          <button type="button" onClick={() => setText('')}>
            Clear text
          </button>
        </div>
      ) : null}
      <p role="status">{notice}</p>
      {!error ? (
        <section className={styles.panel} aria-labelledby="hill-matrix-title">
          <h2 id="hill-matrix-title">Key matrix</h2>
          <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${size}, 56px)`, gap: '4px' }}>
            {matrix.flat().map((n, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  width: '56px',
                  height: '48px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--line-strong)',
                  color: 'var(--text-accent)',
                  fontFamily: 'monospace'
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </section>
      ) : null}
      <section className={styles.explainPanel} aria-labelledby="hill-title">
        <h2 id="hill-title">Hill Cipher</h2>
        <p className="mono">C = K × P (mod 26)</p>
        <p>
          Each block of {size} plaintext letters becomes a column vector, multiplied by the key matrix mod 26 to get
          the ciphertext block. Decoding multiplies by the key&rsquo;s modular inverse instead - the key matrix must
          have a determinant that is coprime with 26, or it cannot be inverted.
        </p>
      </section>
      <p className={styles.note}>
        A classical polygraphic substitution cipher for learning linear algebra and modular arithmetic, not secure
        encryption. Do not use it to protect real secrets.
      </p>
    </>
  );
}
