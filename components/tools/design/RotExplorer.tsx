'use client';
import { useState } from 'react';
import { alphabet, rotateText, rotationRows, rotationSvg } from '@/lib/tools/rot';
import styles from './DesignLab.module.css';

export default function RotExplorer() {
  const [text,setText]=useState('HELLO');
  const [shift,setShift]=useState(13);
  const [decode,setDecode]=useState(false);
  const [letter,setLetter]=useState('H');
  const [notice,setNotice]=useState('');
  const output=rotateText(text,shift,decode);
  async function copy() { try {await navigator.clipboard.writeText(output);setNotice('Output copied.');}catch{setNotice('Copy is unavailable. Select the output text and copy it manually.');} }
  function download() {
    const url=URL.createObjectURL(new Blob([rotationSvg(text,shift,decode)],{type:'image/svg+xml'}));
    const a=document.createElement('a');a.href=url;a.download=`rot${shift}-explanation.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    setNotice('Explanation image downloaded. The example uses the first 60 characters.');
  }
  return <>
    <div className={styles.toolbar}>
      <label>Letter shift <select aria-label="Letter shift" value={shift} onChange={e=>setShift(Number(e.target.value))}>{Array.from({length:25},(_,i)=><option key={i} value={i+1}>ROT{i+1}</option>)}</select></label>
      <button type="button" aria-pressed={!decode} onClick={()=>setDecode(false)}>Encode</button>
      <button type="button" aria-pressed={decode} onClick={()=>setDecode(true)}>Decode</button>
      <button type="button" onClick={()=>{setText(output);setDecode(!decode);setNotice('Output moved to input; direction reversed.');}}>Swap input & output</button>
    </div>
    <div className={styles.textGrid}>
      <label className={styles.field}>Input <textarea value={text} maxLength={20000} onChange={e=>setText(e.target.value)} spellCheck={false}/><small>{text.length.toLocaleString()} / 20,000 characters · processed only in your browser</small></label>
      <label className={styles.field}>Output <textarea value={output} readOnly spellCheck={false}/><small>Case, punctuation, digits, emoji and non-Latin text are preserved.</small></label>
    </div>
    <div className={styles.toolbar}><button type="button" onClick={copy}>Copy output</button><button type="button" onClick={()=>{setText('HELLO');setShift(13);setDecode(false);}}>Load HELLO example</button><button type="button" onClick={()=>setText('')}>Clear text</button></div>
    <p role="status">{notice}</p>
    <section className={styles.panel} aria-labelledby="alphabet-title">
      <h2 id="alphabet-title">See how ROT{shift} moves each letter</h2>
      <p>The map makes the substitution visible: the top letter is the original and the bottom letter is the shifted result. Select a pair to trace what changed.</p>
      <div className={styles.alphabet}>{[...alphabet].map(c=><button type="button" key={c} aria-label={`${c} maps to ${rotateText(c,shift,decode)}`} aria-pressed={letter===c} onClick={()=>setLetter(c)}><span>{c}</span><small aria-hidden="true">↓</small><strong>{rotateText(c,shift,decode)}</strong></button>)}</div>
      <div className={styles.trace} aria-live="polite">{letter} → {rotateText(letter,shift,decode)} <small>({decode?'back':'forward'} {shift} places)</small></div>
      <p>{shift===13?'ROT13 is its own inverse: apply it twice to get your original text.':`ROT${shift} is reversed by shifting forward ${26-shift} places, or choosing Decode.`}</p>
    </section>
    <section className={styles.explainPanel} aria-labelledby="rot-explanation-title">
      <h2 id="rot-explanation-title">What ROT13 means</h2>
      <p>ROT13 is a Caesar shift that moves every English letter 13 places forward. When it reaches Z, it wraps around to A. Because the alphabet has 26 letters, applying ROT13 twice returns the original text.</p>
      <p>It is useful for reversible examples, puzzle hints, and hiding a spoiler at a glance. It is not encryption: anyone can decode it immediately, and punctuation, numbers, emoji, and non-Latin text stay unchanged.</p>
      <div className={styles.mappingCallout} aria-label="ROT13 example"><strong>HELLO</strong><span>ROT13 →</span><strong>URYYB</strong></div>
    </section>
    <details className={styles.foot}><summary>Compare all 25 decoding shifts</summary><p>No guessed “correct” answer: inspect every possibility. Choose a row to use that decoding shift.</p><div className={styles.allShifts}>{rotationRows(text.slice(0,300)).map((r:{shift:number;text:string})=><button key={r.shift} type="button" onClick={()=>{setShift(r.shift);setDecode(true);}}><strong>Decode ROT{r.shift}</strong><span>{r.text||'Enter text to compare.'}</span></button>)}</div><p>Comparison previews show the first 300 characters. The output box uses your entire input.</p></details>
    <p className={styles.note}>ROT is a letter-substitution exercise, not secure encryption. Do not use it to protect passwords, private messages or sensitive data.</p>
  </>;
}
