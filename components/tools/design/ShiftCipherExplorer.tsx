'use client';
import { useState } from 'react';
import {
  additiveTransform,
  multiplicativeTransform,
  affineTransform,
  VALID_MULTIPLIERS
} from '@/lib/tools/shift-ciphers';
import styles from './DesignLab.module.css';

type Mode = 'additive' | 'multiplicative' | 'affine';

const EXAMPLES: Record<Mode, { text: string; a: number; b: number }> = {
  additive: { text: 'ATTACKATDAWN', a: 1, b: 3 },
  multiplicative: { text: 'HELLO', a: 7, b: 0 },
  affine: { text: 'AFFINECIPHER', a: 5, b: 8 }
};

export default function ShiftCipherExplorer() {
  const [mode, setMode] = useState<Mode>('additive');
  const [text, setText] = useState(EXAMPLES.additive.text);
  const [a, setA] = useState(EXAMPLES.additive.a);
  const [b, setB] = useState(EXAMPLES.additive.b);
  const [decode, setDecode] = useState(false);
  const [notice, setNotice] = useState('');

  let output = '';
  let error = '';
  try {
    output =
      mode === 'additive'
        ? additiveTransform(text, b, decode)
        : mode === 'multiplicative'
          ? multiplicativeTransform(text, a, decode)
          : affineTransform(text, a, b, decode);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Enter a valid key.';
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
    el.download = `${mode}-cipher-output.txt`;
    el.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Output downloaded as a .txt file.');
  }
  function switchMode(next: Mode) {
    setMode(next);
    setText(EXAMPLES[next].text);
    setA(EXAMPLES[next].a);
    setB(EXAMPLES[next].b);
    setDecode(false);
  }

  return (
    <>
      <div className={styles.toolbar} role="group" aria-label="Cipher mode">
        <button type="button" aria-pressed={mode === 'additive'} onClick={() => switchMode('additive')}>
          Additive (Caesar)
        </button>
        <button type="button" aria-pressed={mode === 'multiplicative'} onClick={() => switchMode('multiplicative')}>
          Multiplicative
        </button>
        <button type="button" aria-pressed={mode === 'affine'} onClick={() => switchMode('affine')}>
          Affine
        </button>
      </div>
      <div className={styles.toolbar} role="group" aria-label="Operation and keys">
        <button type="button" aria-pressed={!decode} onClick={() => setDecode(false)}>
          Encode
        </button>
        <button type="button" aria-pressed={decode} onClick={() => setDecode(true)}>
          Decode
        </button>
        {mode !== 'multiplicative' ? (
          <label>
            Key {mode === 'affine' ? 'b' : 'k'}{' '}
            <input
              type="number"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              style={{ width: '5rem' }}
            />
          </label>
        ) : null}
        {mode !== 'additive' ? (
          <label>
            Key a{' '}
            <select value={a} onChange={(e) => setA(Number(e.target.value))}>
              {VALID_MULTIPLIERS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className={styles.textGrid}>
        <label className={styles.field}>
          Input
          <textarea value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} spellCheck={false} />
          <small>{text.length.toLocaleString()} / 2,000 characters · processed only in your browser</small>
        </label>
        {error ? (
          <p role="status" className={styles.note}>
            {error}
          </p>
        ) : (
          <label className={styles.field}>
            Output
            <textarea value={output} readOnly spellCheck={false} aria-live="polite" />
            <small>Case, punctuation, digits, emoji and non-Latin text are preserved.</small>
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
      <section className={styles.explainPanel} aria-labelledby="shift-formula-title">
        <h2 id="shift-formula-title">The formula behind {mode === 'additive' ? 'Additive (Caesar)' : mode === 'multiplicative' ? 'Multiplicative' : 'Affine'}</h2>
        {mode === 'additive' ? (
          <p className="mono">C = (P + k) mod 26 - every letter shifts by the same fixed amount k.</p>
        ) : mode === 'multiplicative' ? (
          <p>
            C = (P × a) mod 26 - a must share no common factor with 26, so only {VALID_MULTIPLIERS.join(', ')} are usable keys.
            Any other value collapses multiple letters onto the same output and cannot be decrypted.
          </p>
        ) : (
          <p>
            C = (P × a + b) mod 26 - the multiplicative step first, then an additive shift. Same coprime rule on a as the
            multiplicative cipher; b can be any whole number 0-25.
          </p>
        )}
      </section>
      <p className={styles.note}>
        This is a classical substitution cipher for learning modular arithmetic, not secure encryption. Do not use it to
        protect real secrets.
      </p>
    </>
  );
}
