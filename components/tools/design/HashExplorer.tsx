'use client';
import { useEffect, useState } from 'react';
import { md5 } from '@/lib/tools/md5';
import styles from './DesignLab.module.css';

const ALGORITHMS = [
  { id: 'MD5', label: 'MD5', native: false },
  { id: 'SHA-1', label: 'SHA-1', native: true },
  { id: 'SHA-256', label: 'SHA-256', native: true },
  { id: 'SHA-384', label: 'SHA-384', native: true },
  { id: 'SHA-512', label: 'SHA-512', native: true }
] as const;

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function HashExplorer() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [results, setResults] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function computeAll() {
      const bytes = new TextEncoder().encode(text);
      const next: Record<string, string> = { MD5: text ? md5(text) : '' };
      for (const algo of ALGORITHMS) {
        if (!algo.native) continue;
        if (!text) {
          next[algo.id] = '';
          continue;
        }
        try {
          const digest = await crypto.subtle.digest(algo.id, bytes);
          next[algo.id] = bufferToHex(digest);
        } catch {
          next[algo.id] = 'Not available in this browser.';
        }
      }
      if (!cancelled) setResults(next);
    }
    computeAll();
    return () => {
      cancelled = true;
    };
  }, [text]);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice('Hash copied.');
    } catch {
      setNotice('Copy is unavailable. Select the hash and copy it manually.');
    }
  }

  return (
    <>
      <div className={styles.textGrid}>
        <label className={styles.field} style={{ gridColumn: '1 / -1' }}>
          Input
          <textarea value={text} maxLength={20000} onChange={(e) => setText(e.target.value)} spellCheck={false} />
          <small>Hashed entirely in your browser - the text never leaves this page.</small>
        </label>
      </div>
      <p role="status">{notice}</p>
      <section className={styles.panel} aria-labelledby="hash-results-title" aria-live="polite">
        <h2 id="hash-results-title">Hash results</h2>
        {ALGORITHMS.map((algo) => (
          <div key={algo.id} style={{ marginBottom: '0.75rem' }}>
            <strong>{algo.label}</strong>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <code className="mono" style={{ wordBreak: 'break-all', flex: 1 }}>
                {results[algo.id] || '—'}
              </code>
              <button type="button" onClick={() => copy(results[algo.id] || '')} disabled={!results[algo.id]}>
                Copy
              </button>
            </div>
          </div>
        ))}
      </section>
      <section className={styles.explainPanel} aria-labelledby="hash-title">
        <h2 id="hash-title">Cryptographic Hash Functions</h2>
        <p>
          A hash function turns any input into a fixed-length fingerprint. The same input always produces the same
          hash, but there is no way to reverse a hash back into the original text, and changing even one character
          produces a completely different result.
        </p>
      </section>
      <p className={styles.note}>
        MD5 and SHA-1 are broken for security use (collisions are practical) and are shown here for learning and
        legacy file-integrity checks only. Use SHA-256 or SHA-512 for anything security-sensitive, and never hash
        passwords without a dedicated password-hashing algorithm (bcrypt, scrypt, or Argon2).
      </p>
    </>
  );
}
