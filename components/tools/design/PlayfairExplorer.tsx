'use client';
import { useState } from 'react';
import { buildGrid, buildDigraphs, playfairTransform } from '@/lib/tools/playfair';
import styles from './DesignLab.module.css';

export default function PlayfairExplorer() {
  const [text, setText] = useState('Hide the gold in the tree stump');
  const [keyword, setKeyword] = useState('PLAYFAIR EXAMPLE');
  const [decode, setDecode] = useState(false);
  const [notice, setNotice] = useState('');

  let output = '';
  let error = '';
  let grid: string[][] = [];
  let digraphs: string[] = [];
  try {
    grid = buildGrid(keyword);
    digraphs = buildDigraphs(text).map((p) => p.join(''));
    output = playfairTransform(text, keyword, decode);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Enter a valid keyword and text.';
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
    el.download = 'playfair-output.txt';
    el.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Output downloaded as a .txt file.');
  }

  return (
    <>
      <div className={styles.toolbar} role="group" aria-label="Operation and keyword">
        <button type="button" aria-pressed={!decode} onClick={() => setDecode(false)}>
          Encode
        </button>
        <button type="button" aria-pressed={decode} onClick={() => setDecode(true)}>
          Decode
        </button>
        <label>
          Keyword <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} spellCheck={false} />
        </label>
      </div>
      <div className={styles.textGrid}>
        <label className={styles.field}>
          Input
          <textarea value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} spellCheck={false} />
          <small>J is merged into I, and non-letters are removed - Playfair only encrypts a 25-letter alphabet.</small>
        </label>
        {error ? (
          <p role="status" className={styles.note}>
            {error}
          </p>
        ) : (
          <label className={styles.field}>
            Output
            <textarea value={output} readOnly spellCheck={false} aria-live="polite" />
            <small>
              {decode
                ? 'Decoding recovers the digraph-expanded letters exactly - any X inserted to split a double letter or pad an odd length stays in the result.'
                : 'Uppercase letters only, in pairs - double letters and an odd final letter are padded with X.'}
            </small>
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
        <section className={styles.panel} aria-labelledby="playfair-grid-title">
          <h2 id="playfair-grid-title">The 5×5 key square</h2>
          <p>Built from the keyword&rsquo;s unique letters, then the rest of the alphabet (J is merged into I).</p>
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(5, 44px)', gap: '4px' }}>
            {grid.flat().map((ch, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  width: '44px',
                  height: '44px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--line-strong)',
                  color: 'var(--text-accent)',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem'
                }}
              >
                {ch}
              </span>
            ))}
          </div>
          <p style={{ marginTop: '0.75rem' }}>
            <strong>Digraphs:</strong> {digraphs.join(' ')}
          </p>
        </section>
      ) : null}
      <section className={styles.explainPanel} aria-labelledby="playfair-title">
        <h2 id="playfair-title">Playfair Cipher</h2>
        <p>
          Same row: shift each letter right, wrapping at the edge. Same column: shift each letter down, wrapping at
          the bottom. Otherwise: swap each letter&rsquo;s column with the other letter&rsquo;s, keeping its own row.
        </p>
      </section>
      <p className={styles.note}>
        A classical digraph substitution cipher for learning, not secure encryption. Do not use it to protect real
        secrets.
      </p>
    </>
  );
}
