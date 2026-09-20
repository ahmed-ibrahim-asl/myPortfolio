'use client';
import { useState } from 'react';
import { aesEcbTransform, bytesToHex } from '@/lib/tools/aes';
import styles from './DesignLab.module.css';

export default function AesExplorer() {
  const [hexData, setHexData] = useState('00112233445566778899aabbccddeeff');
  const [hexKey, setHexKey] = useState('000102030405060708090a0b0c0d0e0f');
  const [decode, setDecode] = useState(false);
  const [notice, setNotice] = useState('');

  let output = '';
  let error = '';
  const trace: { round: number; step: string; state: number[] }[] = [];
  try {
    const bytes = aesEcbTransform(hexData, hexKey, decode, trace);
    output = bytesToHex(bytes);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Enter valid hex data and a valid key.';
  }

  const keyBits = hexKey.replace(/\s+/g, '').length * 4;

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
    el.download = 'aes-output.hex.txt';
    el.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Output downloaded as a .txt file.');
  }

  return (
    <>
      <div className={styles.toolbar} role="group" aria-label="AES operation">
        <button type="button" aria-pressed={!decode} onClick={() => setDecode(false)}>
          Encrypt
        </button>
        <button type="button" aria-pressed={decode} onClick={() => setDecode(true)}>
          Decrypt
        </button>
        <span>{Number.isFinite(keyBits) && [128, 192, 256].includes(keyBits) ? `AES-${keyBits}` : 'Invalid key length'}</span>
      </div>
      <div className={styles.textGrid}>
        <label className={styles.field}>
          {decode ? 'Ciphertext (hex)' : 'Plaintext (hex)'}
          <textarea value={hexData} maxLength={4000} onChange={(e) => setHexData(e.target.value)} spellCheck={false} />
          <small>One or more 16-byte (32 hex character) blocks, ECB mode.</small>
        </label>
        <label className={styles.field}>
          Key (hex)
          <textarea value={hexKey} maxLength={200} onChange={(e) => setHexKey(e.target.value)} spellCheck={false} />
          <small>32 hex characters for AES-128, 48 for AES-192, or 64 for AES-256.</small>
        </label>
      </div>
      {error ? (
        <p role="status" className={styles.note}>
          {error}
        </p>
      ) : (
        <label className={styles.field}>
          {decode ? 'Plaintext (hex)' : 'Ciphertext (hex)'}
          <textarea value={output} readOnly spellCheck={false} aria-live="polite" />
        </label>
      )}
      {!error ? (
        <div className={styles.toolbar}>
          <button type="button" onClick={copy}>
            Copy output
          </button>
          <button type="button" onClick={downloadText}>
            Download output (.txt)
          </button>
        </div>
      ) : null}
      <p role="status">{notice}</p>
      {!error && trace.length ? (
        <section className={styles.panel} aria-labelledby="aes-trace-title">
          <h2 id="aes-trace-title">Round-by-round state (first block)</h2>
          <p>Every SubBytes, ShiftRows, MixColumns, and AddRoundKey transformation applied to the first 16-byte block.</p>
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {trace.map((step, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>
                  Round {step.round}: {step.step}
                </strong>
                <div className="mono" style={{ wordBreak: 'break-all' }}>
                  {bytesToHex(step.state)}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <section className={styles.explainPanel} aria-labelledby="aes-title">
        <h2 id="aes-title">AES (Advanced Encryption Standard)</h2>
        <p>
          AES encrypts 16-byte blocks with a key of 128, 192, or 256 bits, running 10, 12, or 14 rounds of SubBytes
          (a fixed non-linear substitution), ShiftRows (cyclic row shifts), MixColumns (a linear mix within each
          column), and AddRoundKey (XOR with a key derived for that round). Decryption runs the inverse steps in
          reverse order.
        </p>
      </section>
      <p className={styles.note}>
        This is a from-scratch, unaudited AES implementation for learning ECB-mode block mechanics, not a
        cryptographic library. Do not use it to protect real secrets - use a vetted library (Web Crypto, OpenSSL) for
        anything that matters, and never use ECB mode in production (it leaks patterns between identical blocks).
      </p>
    </>
  );
}
