'use client';
import { useState } from 'react';
import {
  railFenceEncrypt,
  railFenceDecrypt,
  railFenceZigzag,
  columnarEncrypt,
  columnarDecrypt,
  keylessColumnarEncrypt,
  keylessColumnarDecrypt
} from '@/lib/tools/transposition';
import styles from './DesignLab.module.css';

type Mode = 'rail' | 'columnar' | 'keyless';

export default function TranspositionExplorer() {
  const [mode, setMode] = useState<Mode>('rail');
  const [text, setText] = useState('WEAREDISCOVEREDFLEEATONCE');
  const [rails, setRails] = useState(3);
  const [keyword, setKeyword] = useState('ZEBRAS');
  const [columns, setColumns] = useState(6);
  const [decode, setDecode] = useState(false);
  const [notice, setNotice] = useState('');

  let output = '';
  let error = '';
  try {
    if (mode === 'rail') {
      output = decode ? railFenceDecrypt(text, rails) : railFenceEncrypt(text, rails);
    } else if (mode === 'columnar') {
      output = decode ? columnarDecrypt(text, keyword) : columnarEncrypt(text, keyword);
    } else {
      output = decode ? keylessColumnarDecrypt(text, columns) : keylessColumnarEncrypt(text, columns);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Enter a valid key.';
  }

  const zigzag = mode === 'rail' && !error ? railFenceZigzag(text, rails) : null;

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
    el.download = `${mode}-transposition-output.txt`;
    el.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Output downloaded as a .txt file.');
  }
  function switchMode(next: Mode) {
    setMode(next);
    setDecode(false);
    if (next === 'rail') setText('WEAREDISCOVEREDFLEEATONCE');
    if (next === 'columnar') {
      setText('WEAREDISCOVEREDFLEEATONCE');
      setKeyword('ZEBRAS');
    }
    if (next === 'keyless') setText('ATTACKATDAWN');
  }

  return (
    <>
      <div className={styles.toolbar} role="group" aria-label="Transposition mode">
        <button type="button" aria-pressed={mode === 'rail'} onClick={() => switchMode('rail')}>
          Rail Fence
        </button>
        <button type="button" aria-pressed={mode === 'columnar'} onClick={() => switchMode('columnar')}>
          Row Transposition (keyed)
        </button>
        <button type="button" aria-pressed={mode === 'keyless'} onClick={() => switchMode('keyless')}>
          Keyless Transposition
        </button>
      </div>
      <div className={styles.toolbar} role="group" aria-label="Operation and key settings">
        <button type="button" aria-pressed={!decode} onClick={() => setDecode(false)}>
          Encode
        </button>
        <button type="button" aria-pressed={decode} onClick={() => setDecode(true)}>
          Decode
        </button>
        {mode === 'rail' ? (
          <label>
            Rails{' '}
            <input type="number" min={2} max={12} value={rails} onChange={(e) => setRails(Number(e.target.value))} style={{ width: '4.5rem' }} />
          </label>
        ) : null}
        {mode === 'columnar' ? (
          <label>
            Keyword <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} spellCheck={false} />
          </label>
        ) : null}
        {mode === 'keyless' ? (
          <label>
            Columns{' '}
            <input type="number" min={2} max={12} value={columns} onChange={(e) => setColumns(Number(e.target.value))} style={{ width: '4.5rem' }} />
          </label>
        ) : null}
      </div>
      <div className={styles.textGrid}>
        <label className={styles.field}>
          Input
          <textarea value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} spellCheck={false} />
          <small>Non-letters are removed - transposition only rearranges letter positions.</small>
        </label>
        {error ? (
          <p role="status" className={styles.note}>
            {error}
          </p>
        ) : (
          <label className={styles.field}>
            Output
            <textarea value={output} readOnly spellCheck={false} aria-live="polite" />
            <small>Uppercase letters only - case and punctuation are not part of a classical transposition.</small>
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
      {zigzag ? (
        <section className={styles.panel} aria-labelledby="zigzag-title">
          <h2 id="zigzag-title">See the zigzag pattern</h2>
          <p>Each letter is written onto the rail it lands on, then every rail is read left to right, top to bottom.</p>
          <div style={{ overflowX: 'auto' }}>
            {zigzag.map((row, r) => (
              <div key={r} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {row.map((ch, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      width: '28px',
                      height: '28px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: ch ? '1px solid var(--line-strong)' : '1px dashed var(--line-hairline)',
                      color: ch ? 'var(--text-accent)' : 'transparent',
                      fontFamily: 'monospace'
                    }}
                  >
                    {ch || '·'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <section className={styles.explainPanel} aria-labelledby="transposition-title">
        <h2 id="transposition-title">
          {mode === 'rail' ? 'Rail Fence' : mode === 'columnar' ? 'Row (columnar) Transposition' : 'Keyless Transposition'}
        </h2>
        {mode === 'rail' ? (
          <p>Write the message in a zigzag across the chosen number of rails, then read each rail left to right.</p>
        ) : mode === 'columnar' ? (
          <p>
            Write the message into a grid, one row per line, as wide as the keyword. Read the columns back in the order
            given by sorting the keyword&rsquo;s letters alphabetically - not left to right.
          </p>
        ) : (
          <p>
            The same grid idea as row transposition, but with no keyword: the columns are read back in their original
            left-to-right order, which is why it is weaker than the keyed version.
          </p>
        )}
      </section>
      <p className={styles.note}>
        Transposition only rearranges letters - it never changes what a letter is, only where it sits. Not secure
        encryption. Do not use it to protect real secrets.
      </p>
    </>
  );
}
