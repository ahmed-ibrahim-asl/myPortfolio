'use client';

import { useId, useState } from 'react';
import { calculateCoursework, type Assessment } from '@/lib/tools/gradify/coursework';
import { gradeForPercent } from '@/lib/tools/gradify/calculator';
import type { UniversityProfile } from '@/lib/tools/gradify/universities';
import styles from './CourseworkCalculator.module.css';

export default function CourseworkCalculator({ profile }: { profile: UniversityProfile }) {
  const id = useId();
  const [rows, setRows] = useState<Assessment[]>([
    { id:'coursework',name:'Coursework',earned:'',maximum:'' },
    { id:'final',name:'Final exam',earned:'',maximum:'' },
  ]);
  const result = calculateCoursework(rows);
  const grade = result.percent !== null ? gradeForPercent(result.percent,profile) : null;
  const update = (index: number, key: keyof Assessment, value: string) => setRows(current => current.map((row,i) => i === index ? {...row,[key]:value}:row));
  return <details className={styles.helper}>
    <summary>Coursework → course grade</summary>
    <p>Enter the earned marks and maximum for each assessment, including your expected final exam score. Use the marks allocated in your syllabus so their weights are preserved.</p>
    <div className={styles.rows}>{rows.map((row,index) => <div className={styles.row} key={row.id}>
      <label htmlFor={`${id}-${index}-name`}>Assessment<input id={`${id}-${index}-name`} value={row.name} onChange={event=>update(index,'name',event.target.value)}/></label>
      <label htmlFor={`${id}-${index}-earned`}>Earned marks<input type="number" min="0" step="any" placeholder="0" id={`${id}-${index}-earned`} value={row.earned} onChange={event=>update(index,'earned',event.target.value)}/></label>
      <label htmlFor={`${id}-${index}-maximum`}>Maximum marks<input type="number" min="0.01" step="any" placeholder="30" id={`${id}-${index}-maximum`} value={row.maximum} onChange={event=>update(index,'maximum',event.target.value)}/></label>
      <button type="button" aria-label={`Remove ${row.name || `assessment ${index+1}`}`} onClick={()=>setRows(current=>current.filter((_,i)=>i!==index))} disabled={rows.length===1}>×</button>
    </div>)}</div>
    <div className={styles.result}>
      <button type="button" onClick={()=>setRows(current=>[...current,{id:crypto.randomUUID(),name:'',earned:'',maximum:''}])}>+ Add assessment</button>
      <output aria-live="polite">{result.percent === null ? 'Enter your marks to calculate.' : <><strong>{result.percent.toFixed(2)}%</strong> · {result.earned} / {result.maximum} marks{grade ? ` · ${grade.grade} (${grade.points.toFixed(1)} points)` : ' · check your course’s grade thresholds'}</>}</output>
    </div>
    {result.errors.length > 0 && <p className={styles.error} role="alert">{result.errors[0]}</p>}
  </details>;
}
