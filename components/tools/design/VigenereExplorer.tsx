'use client';
import { useState } from 'react';
import { vigenereTransform, autokeyTransform, vigenereKeyStream, autokeyStream } from '@/lib/tools/vigenere';
import styles from './DesignLab.module.css';

export default function VigenereExplorer() {
  const [mode, setMode] = useState<'vigenere' | 'autokey'>('vigenere');
  const [text, setText] = useState('ATTACKATDAWN');
  const [keyword, setKeyword] = useState('LEMON');
  const [decode, setDecode] = useState(false);
  const [notice, setNotice] = useState('');

  const transform = mode === 'vigenere' ? vigenereTransform : autokeyTransform;
  const stream = mode === 'vigenere' ? vigenereKeyStream : autokeyStream;

  let output = '';
  let keyStream: string[] = [];
  let error = '';
  try {
    output = transform(text, keyword, decode);
    keyStream = mode === 'vigenere' ? vigenereKeyStream(text, keyword) : autokeyStream(text, keyword, decode);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Enter a keyword with at least one letter.';
  }

  const letters = [...text].filter((c) => /[A-Za-z]/.test(c));

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
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}-output.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Output downloaded as a .txt file.');
  }
  function loadExample() {
    if (mode === 'vigenere') {
      setText('ATTACKATDAWN');
      setKeyword('LEMON');
    } else {
      setText('wearediscoveredsaveyourself');
      setKeyword('deceptive');
    }
    setDecode(false);
  }

  return (
    <>
      <div className={styles.toolbar} role="group" aria-label="Cipher and operation">
        <button type="button" aria-pressed={mode === 'vigenere'} onClick={() => setMode('vigenere')}>
          Vigenère
        </button>
        <button type="button" aria-pressed={mode === 'autokey'} onClick={() => setMode('autokey')}>
          Autokey
        </button>
        <button type="button" aria-pressed={!decode} onClick={() => setDecode(false)}>
          Encode
        </button>
        <button type="button" aria-pressed={decode} onClick={() => setDecode(true)}>
          Decode
        </button>
      </div>
      <div className={styles.textGrid}>
        <label className={styles.field}>
          Keyword
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            spellCheck={false}
          />
          <small>
            {mode === 'vigenere'
              ? 'Repeats for the whole message. Non-letters in the keyword are ignored.'
              : 'Used only for the first letters; the key stream then continues with the message itself.'}
          </small>
        </label>
        <label className={styles.field}>
          {mode === 'vigenere' ? 'Input' : decode ? 'Ciphertext' : 'Plaintext'}
          <textarea value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} spellCheck={false} />
          <small>{text.length.toLocaleString()} / 2,000 characters · processed only in your browser</small>
        </label>
      </div>
      {error ? (
        <p role="status" className={styles.note}>
          {error}
        </p>
      ) : (
        <>
          <div className={styles.field}>
            <span>Output</span>
            <textarea value={output} readOnly spellCheck={false} aria-live="polite" />
            <small>Case, punctuation, digits, emoji and non-Latin text are preserved.</small>
          </div>
          <div className={styles.toolbar}>
            <button type="button" onClick={copy}>
              Copy output
            </button>
            <button type="button" onClick={downloadText}>
              Download output (.txt)
            </button>
            <button type="button" onClick={loadExample}>
              Load {mode === 'vigenere' ? 'ATTACKATDAWN' : 'WEAREDISCOVERED'} example
            </button>
            <button type="button" onClick={() => setText('')}>
              Clear text
            </button>
          </div>
          <p role="status">{notice}</p>
          <section className={styles.panel} aria-labelledby="keystream-title">
            <h2 id="keystream-title">See the key stream {mode === 'autokey' ? 'extend itself' : 'repeat'}</h2>
            <p>
              {mode === 'vigenere'
                ? 'Each letter of the message lines up with the keyword letter that shifts it, wrapping the keyword as many times as needed.'
                : decode
                  ? 'The first letters use the keyword; every letter after that is shifted by the plaintext letter this tool just recovered - reconstructed one step at a time, left to right.'
                  : 'The first letters use the keyword; every letter after that is shifted by the plaintext letter that came before it in the message itself.'}
            </p>
            <div className={styles.alphabet}>
              {letters.slice(0, 40).map((c, i) => (
                <button type="button" key={i} disabled>
                  <span>{c.toUpperCase()}</span>
                  <small aria-hidden="true">+</small>
                  <strong>{keyStream[i] ?? '?'}</strong>
                </button>
              ))}
            </div>
            {letters.length > 40 ? <p className="muted">Showing the first 40 letters of the key stream.</p> : null}
          </section>
        </>
      )}
      <p className={styles.note}>
        {mode === 'vigenere'
          ? 'A repeating keyword is a weakness: once an attacker guesses the keyword length, each position becomes a plain shift cipher. Not secure encryption - do not use it to protect real secrets.'
          : 'Autokey removes the repeating-key weakness by folding the plaintext into the key stream itself, but it is still a classical substitution cipher, not secure encryption for real secrets.'}
      </p>
    </>
  );
}
