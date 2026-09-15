"use client";

import { useMemo, useRef, useState } from "react";
import { calculateSemester, calculateTarget, gradeForPercent, type GpaRow } from "@/lib/tools/gradify/calculator";
import type { UniversityProfile } from "@/lib/tools/gradify/universities";
import CourseworkCalculator from "./CourseworkCalculator";
import styles from "./GradifyWorkspace.module.css";

type CustomGrade = { id: string; grade: string; points: string };
type SemesterRecord = { id: string; gpa: number; cgpa: number; hours: number; courseCount: number };
type SavedDraft = { version: 1; universityId: string; rows: GpaRow[]; previousGpa: string; previousHours: string; targetGpa: string; futureHours: string; entryMode: "grade" | "percent"; percentages: Record<string, string>; customMax: string; customGrades: CustomGrade[]; history: SemesterRecord[] };
type Props = { profile: UniversityProfile; onCustomProfile: (profile: UniversityProfile) => void };
let nextRowId = 0;
const makeRow = (): GpaRow => ({ id: `course-${++nextRowId}`, name: "", hours: "", grade: "" });
const format = (value: number | null) => value === null || !Number.isFinite(value) ? "N/A" : value.toFixed(2);
const csvCell = (value: string | number) => {
  const text = String(value);
  const safeText = /^[=+@\-]/.test(text.trimStart()) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
};

function isSavedDraft(value: unknown, universityId: string): value is SavedDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<SavedDraft>;
  const text = (item: unknown) => typeof item === "string" && item.length <= 300;
  return draft.version === 1 && draft.universityId === universityId
    && Array.isArray(draft.rows) && draft.rows.length > 0 && draft.rows.length <= 100
    && draft.rows.every(row => row && [row.id, row.name, row.hours, row.grade].every(text))
    && new Set(draft.rows.map(row => row.id)).size === draft.rows.length
    && [draft.previousGpa, draft.previousHours, draft.targetGpa, draft.futureHours, draft.customMax].every(text)
    && (draft.entryMode === "grade" || draft.entryMode === "percent")
    && !!draft.percentages && typeof draft.percentages === "object" && !Array.isArray(draft.percentages) && Object.values(draft.percentages).every(text)
    && Array.isArray(draft.customGrades) && draft.customGrades.length <= 100
    && draft.customGrades.every(grade => grade && [grade.id, grade.grade, grade.points].every(text))
    && new Set(draft.customGrades.map(grade => grade.id)).size === draft.customGrades.length
    && Array.isArray(draft.history) && draft.history.length <= 100
    && draft.history.every(term => term && text(term.id) && [term.gpa, term.cgpa, term.hours, term.courseCount].every(item => typeof item === "number" && Number.isFinite(item) && item >= 0));
}

export default function UniversityCalculator({ profile, onCustomProfile }: Props) {
  const [rows, setRows] = useState<GpaRow[]>(() => [makeRow(), makeRow(), makeRow()]);
  const [previousGpa, setPreviousGpa] = useState("");
  const [previousHours, setPreviousHours] = useState("");
  const [targetGpa, setTargetGpa] = useState("");
  const [futureHours, setFutureHours] = useState("");
  const [entryMode, setEntryMode] = useState<"grade" | "percent">("grade");
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<SemesterRecord[]>([]);
  const [customMax, setCustomMax] = useState(String(profile.maxGpa));
  const [customGrades, setCustomGrades] = useState<CustomGrade[]>(() => profile.grades.map((item, i) => ({ id: `scale-${i}`, grade: item.grade, points: String(item.points) })));
  const resultRef = useRef<HTMLDivElement>(null);
  const isCustom = profile.status === "custom";
  const effectiveProfile = useMemo(() => isCustom ? {
    ...profile,
    maxGpa: customMax.trim() ? Number(customMax) : NaN,
    grades: customGrades.map(item => ({ grade: item.grade.trim(), points: item.points.trim() ? Number(item.points) : NaN })),
  } : profile, [profile, isCustom, customMax, customGrades]);
  const supportsPercent = !isCustom && profile.grades.length > 0 && profile.grades.every(item => item.minPercent !== undefined) && profile.grades.some(item => item.minPercent === 0);
  const resolvedRows = rows.map(row => entryMode === "percent" ? {
    ...row,
    grade: percentages[row.id]?.trim() ? gradeForPercent(Number(percentages[row.id]), effectiveProfile)?.grade ?? "" : "",
  } : row);
  const percentErrors = entryMode === "percent" ? rows.flatMap((row, index) => {
    const value = percentages[row.id];
    return value?.trim() && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100)
      ? [`Course ${index + 1}: enter a percentage from 0 to 100.`] : [];
  }) : [];
  const result = calculateSemester(resolvedRows, effectiveProfile, previousGpa, previousHours);
  const errors = [...percentErrors, ...result.errors];
  const hasResult = result.gpa !== null && errors.length === 0;
  const cumulativeGpa = errors.length === 0 ? result.cgpa : null;
  const targetBaseGpa = cumulativeGpa ?? (previousGpa.trim() ? Number(previousGpa) : NaN);
  const targetBaseHours = (Number(previousHours) || 0) + (hasResult ? result.hours : 0);
  const target = calculateTarget(targetBaseGpa, targetBaseHours, targetGpa.trim() ? Number(targetGpa) : NaN, futureHours.trim() ? Number(futureHours) : NaN, effectiveProfile.maxGpa);
  const minimumTarget = target.required === null ? null : Math.ceil((target.required - 1e-10) * 100) / 100;
  const targetStarted = targetGpa !== "" || futureHours !== "";

  function updateRow(id: string, field: keyof GpaRow, value: string) {
    setRows(current => current.map(row => row.id === id ? { ...row, [field]: value } : row));
    setNotice("");
  }

  function updateScale(nextMax: string, nextGrades: CustomGrade[]) {
    setCustomMax(nextMax);
    setCustomGrades(nextGrades);
    onCustomProfile({ ...profile, maxGpa: nextMax.trim() ? Number(nextMax) : NaN, grades: nextGrades.map(item => ({ grade: item.grade.trim(), points: item.points.trim() ? Number(item.points) : NaN })) });
  }

  function reset() {
    setRows([makeRow(), makeRow(), makeRow()]);
    setPreviousGpa(""); setPreviousHours(""); setTargetGpa(""); setFutureHours("");
    setPercentages({}); setHistory([]); setAttempted(false); setNotice("Course entries, semester history, and GPA targets cleared for this university. Your saved draft is unchanged.");
  }

  function saveDraft() {
    const draft: SavedDraft = { version: 1, universityId: profile.id, rows, previousGpa, previousHours, targetGpa, futureHours, entryMode, percentages, customMax, customGrades, history };
    try {
      window.localStorage.setItem(`gradify:quick-draft:v1:${profile.id}`, JSON.stringify(draft));
      setNotice("Draft saved in this browser for this university. It includes your course entries, GPA target, and semester history.");
    } catch { setNotice("This browser could not save the draft. You can export a completed calculation as CSV."); }
  }

  function restoreDraft() {
    try {
      const saved = window.localStorage.getItem(`gradify:quick-draft:v1:${profile.id}`);
      if (!saved) { setNotice("No saved draft for this university in this browser yet."); return; }
      const draft: unknown = JSON.parse(saved);
      if (!isSavedDraft(draft, profile.id)) { setNotice("The saved draft has an unsupported format. Your current entries have been kept."); return; }
      const restoredRows = draft.rows.map(row => ({ ...row, id: makeRow().id }));
      const restoredPercentages = Object.fromEntries(draft.rows.map((row, index) => [restoredRows[index].id, draft.percentages[row.id] ?? ""]));
      setRows(restoredRows); setPercentages(restoredPercentages); setPreviousGpa(draft.previousGpa); setPreviousHours(draft.previousHours);
      setTargetGpa(draft.targetGpa); setFutureHours(draft.futureHours); setEntryMode(supportsPercent ? draft.entryMode : "grade");
      setHistory(draft.history); setAttempted(false);
      if (isCustom) updateScale(draft.customMax, draft.customGrades);
      setNotice("Saved draft restored for this university.");
    } catch { setNotice("This browser could not restore the saved draft. Your current entries have been kept."); }
  }

  function nextSemester() {
    if (!hasResult || result.cgpa === null) return;
    setHistory(current => [...current, { id: `semester-${Date.now()}`, gpa: result.gpa!, cgpa: result.cgpa!, hours: result.hours, courseCount: resolvedRows.filter(row => row.hours.trim() && row.grade).length }]);
    setPreviousGpa(String(result.cgpa));
    setPreviousHours(String((Number(previousHours) || 0) + result.hours));
    setRows([makeRow(), makeRow(), makeRow()]); setPercentages({}); setAttempted(false);
    setNotice("Semester added to your previous record. Enter your next semester’s courses below.");
  }

  function printResult() {
    document.body.dataset.gradifyPrint = "true";
    try { window.print(); } finally { delete document.body.dataset.gradifyPrint; }
  }

  function exportCsv() {
    const data: (string | number)[][] = [
      ["Gradify GPA estimate", profile.name], ["Maximum GPA", effectiveProfile.maxGpa],
      ["Scale status", profile.status], ["Course", "Credit hours", "Grade", "Grade points", "Quality points"],
      ...resolvedRows.filter(row => row.hours.trim() && row.grade).map(row => {
        const points = effectiveProfile.grades.find(item => item.grade === row.grade)?.points ?? 0;
        return [row.name || "Untitled course", row.hours, row.grade, points, points * Number(row.hours)];
      }),
      ["Semester GPA", hasResult ? result.gpa! : ""], ["Semester credit hours", result.hours],
      ["Previous CGPA", previousGpa], ["Previous credit hours", previousHours], ["Estimated CGPA", cumulativeGpa ?? ""],
      ["Scale note", profile.note], ["Source", profile.sourceUrl],
      ...(history.length ? [["Completed semesters in this draft", "Semester GPA", "Credits", "CGPA after semester"], ...history.map((term, index) => [`Semester ${index + 1}`, term.gpa, term.hours, term.cgpa])] : []),
    ];
    const blob = new Blob(["\uFEFF", data.map(line => line.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `gradify-${profile.id}-gpa.csv`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Your GPA calculation has been exported as a CSV.");
  }

  return (
    <div className={styles.calculator}>
      <div className={styles.mainColumn}>
        {isCustom && <section className={styles.panel} aria-labelledby="custom-scale-heading">
          <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Your university’s rules</p><h2 id="custom-scale-heading">Set your grade scale</h2></div><span className={styles.scaleTag}>Custom</span></div>
          <p className={styles.muted}>Add the letter grades and points from your faculty’s handbook before entering courses.</p>
          <label className={styles.field}><span>Maximum GPA</span><input type="number" min="0.01" max="100" step="any" value={customMax} onChange={event => updateScale(event.target.value, customGrades)} /></label>
          <div className={styles.customScale}>
            {customGrades.map((item, index) => <div className={styles.customGrade} key={item.id}>
              <label className={styles.field}><span>Grade {index + 1}</span><input value={item.grade} maxLength={12} onChange={event => updateScale(customMax, customGrades.map(grade => grade.id === item.id ? { ...grade, grade: event.target.value } : grade))} /></label>
              <label className={styles.field}><span>Points</span><input type="number" min="0" max={Number(customMax) || 100} step="any" value={item.points} onChange={event => updateScale(customMax, customGrades.map(grade => grade.id === item.id ? { ...grade, points: event.target.value } : grade))} /></label>
              <button type="button" className={styles.iconButton} aria-label={`Remove grade ${item.grade || index + 1}`} onClick={() => updateScale(customMax, customGrades.filter(grade => grade.id !== item.id))}>×</button>
            </div>)}
          </div>
          <button type="button" className={styles.secondaryButton} disabled={customGrades.length >= 100} onClick={() => updateScale(customMax, [...customGrades, { id: `scale-${Date.now()}`, grade: "", points: "" }])}>+ Add grade</button>
        </section>}

        <form className={styles.panel} onSubmit={event => { event.preventDefault(); setAttempted(true); resultRef.current?.focus({ preventScroll: true }); }}>
          <div className={styles.panelHeading}>
            <div><p className={styles.eyebrow}>This semester</p><h2>Enter your courses</h2></div>
            <span className={styles.scaleTag}>{Number.isFinite(effectiveProfile.maxGpa) ? effectiveProfile.maxGpa.toFixed(1) : "N/A"} scale</span>
          </div>
          <p className={styles.muted}>Enter the credit hours and grade for each course.</p>
          {supportsPercent && <fieldset className={styles.entryMode}><legend>Enter results as</legend>
            <label><input type="radio" name={`entry-${profile.id}`} checked={entryMode === "grade"} onChange={() => setEntryMode("grade")} /> Letter grades</label>
            <label><input type="radio" name={`entry-${profile.id}`} checked={entryMode === "percent"} onChange={() => setEntryMode("percent")} /> Percentages</label>
          </fieldset>}
          <div className={styles.courseHeaders} aria-hidden="true"><span>Course <small>(optional)</small></span><span>Credits</span><span>{entryMode === "grade" ? "Grade" : "Percentage"}</span><span /></div>
          <div className={styles.courseList}>
            {rows.map((row, index) => <div className={styles.courseRow} key={row.id}>
              <label className={`${styles.field} ${styles.courseName}`}><span className={styles.mobileLabel}>Course {index + 1} <small>(optional)</small></span><input aria-label={`Course ${index + 1} name`} placeholder={`Course ${index + 1}`} value={row.name} maxLength={100} onChange={event => updateRow(row.id, "name", event.target.value)} /></label>
              <label className={styles.field}><span className={styles.mobileLabel}>Credit hours</span><input aria-label={`Course ${index + 1} credit hours`} type="number" min="0.01" max="100" step="any" placeholder="3" value={row.hours} onChange={event => updateRow(row.id, "hours", event.target.value)} /></label>
              <label className={styles.field}><span className={styles.mobileLabel}>{entryMode === "grade" ? "Grade" : "Percentage"}</span>{entryMode === "grade" ? <select aria-label={`Course ${index + 1} grade`} value={row.grade} onChange={event => updateRow(row.id, "grade", event.target.value)}><option value="">Select grade</option>{effectiveProfile.grades.map((grade, gradeIndex) => <option key={`${grade.grade}-${gradeIndex}`} value={grade.grade}>{grade.grade || "Unnamed"} · {Number.isFinite(grade.points) ? grade.points.toFixed(2) : "N/A"}</option>)}</select> : <div className={styles.percentageInput}><input aria-label={`Course ${index + 1} percentage`} type="number" min="0" max="100" step="any" placeholder="85" value={percentages[row.id] ?? ""} onChange={event => { setPercentages(current => ({ ...current, [row.id]: event.target.value })); setNotice(""); }} /><span>%</span></div>}</label>
              <button className={`${styles.iconButton} ${styles.removeCourse}`} type="button" aria-label={`Remove course ${index + 1}`} disabled={rows.length === 1} onClick={() => setRows(current => current.filter(item => item.id !== row.id))}>×</button>
              {entryMode === "percent" && percentages[row.id]?.trim() && <span className={styles.resolvedGrade}>Course {index + 1}: {resolvedRows[index].grade || "Check percentage"}</span>}
            </div>)}
          </div>
          <button className={styles.addCourse} type="button" disabled={rows.length >= 100} onClick={() => setRows(current => [...current, makeRow()])}>+ Add course</button>
          <details className={styles.priorDetails} open={previousGpa !== "" || previousHours !== "" || undefined}>
            <summary>Include your previous CGPA <span>Optional</span></summary>
            <p className={styles.muted}>Use the GPA hours shown on your transcript, including failed hours if your university counts them.</p>
            <div className={styles.twoFields}>
              <label className={styles.field}><span>Previous CGPA</span><input type="number" min="0" max={effectiveProfile.maxGpa} step="any" placeholder="e.g. 3.20" value={previousGpa} onChange={event => setPreviousGpa(event.target.value)} /></label>
              <label className={styles.field}><span>Previous GPA hours</span><input type="number" min="0" step="any" placeholder="e.g. 60" value={previousHours} onChange={event => setPreviousHours(event.target.value)} /></label>
            </div>
          </details>
          {attempted && errors.length > 0 && <div className={styles.errorBox} role="alert"><strong>Check your entries</strong><ul>{[...new Set(errors)].map(error => <li key={error}>{error}</li>)}</ul></div>}
          {attempted && !hasResult && errors.length === 0 && <p className={styles.helpText} role="status">Enter credit hours and a grade for at least one course.</p>}
          <div className={styles.formActions}><button className={styles.primaryButton} type="submit">Calculate GPA <span aria-hidden="true">↗</span></button><button className={styles.textButton} type="button" onClick={reset}>Reset entries</button></div>
          <div className={styles.draftActions}><button className={styles.textButton} type="button" onClick={saveDraft}>Save draft</button><span aria-hidden="true">·</span><button className={styles.textButton} type="button" onClick={restoreDraft}>Restore draft</button><span>Saved only when you choose.</span></div>
          <p className={styles.notice} aria-live="polite">{notice}</p>
        </form>
        {history.length > 0 && <section className={styles.panel} aria-labelledby={`history-${profile.id}`}><div className={styles.panelHeading}><div><p className={styles.eyebrow}>Your running record</p><h2 id={`history-${profile.id}`}>Completed semesters</h2></div></div><p className={styles.muted}>Recorded semester results. Your current previous GPA record is shown above and can be edited.</p><div className={styles.gradeTableWrap}><table className={styles.gradeTable}><thead><tr><th scope="col">Semester</th><th scope="col">GPA</th><th scope="col">Credits</th><th scope="col">CGPA</th></tr></thead><tbody>{history.map((term, index) => <tr key={term.id}><th scope="row">{index + 1}</th><td>{format(term.gpa)}</td><td>{term.hours}</td><td>{format(term.cgpa)}</td></tr>)}</tbody></table></div></section>}
        <section className={styles.panel} aria-labelledby={`target-heading-${profile.id}`}>
          <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Plan ahead</p><h2 id={`target-heading-${profile.id}`}>What GPA do you need?</h2></div></div>
          <p className={styles.muted}>Find the average you need over your next credits to reach a target CGPA.</p>
          <div className={styles.twoFields}>
            <label className={styles.field}><span>Target CGPA</span><input type="number" min="0" max={effectiveProfile.maxGpa} step="any" placeholder="e.g. 3.50" value={targetGpa} onChange={event => setTargetGpa(event.target.value)} /></label>
            <label className={styles.field}><span>Future credit hours</span><input type="number" min="0.01" step="any" placeholder="e.g. 18" value={futureHours} onChange={event => setFutureHours(event.target.value)} /></label>
          </div>
          <div className={styles.targetResult} aria-live="polite">
            {!targetStarted ? <p>Enter your current results above, then choose a target.</p> : errors.length > 0 || target.status === "invalid" ? <p>Complete a valid current GPA and credit total, then enter your target and future hours.</p> : target.status === "impossible" ? <p>You would need at least a <strong>{format(minimumTarget)}</strong> GPA over {futureHours} credits, above this scale’s {effectiveProfile.maxGpa.toFixed(2)} maximum. Try more future credits or a lower target.</p> : target.status === "achieved" ? <p>Your existing quality points are enough to meet this target after the future credits. The minimum required future GPA is <strong>0.00</strong>.</p> : <p>Aim for at least <strong>{format(minimumTarget)}</strong> over your next <strong>{futureHours} credits</strong> to reach {Number(targetGpa).toFixed(2)} CGPA.</p>}
          </div>
          {targetStarted && Number.isFinite(targetBaseGpa) && targetBaseHours > 0 && <p className={styles.helpText}>Based on {targetBaseGpa.toFixed(2)} CGPA across {targetBaseHours} GPA hours, including the semester above.</p>}
        </section>
        <CourseworkCalculator profile={effectiveProfile} />
      </div>

      <aside className={styles.resultColumn}>
        <div className={styles.resultCard} ref={resultRef} tabIndex={-1}>
          <div className={styles.resultLabel}><span className={styles.eyebrow}>Semester GPA</span><span className={styles.liveIndicator}>Live estimate</span></div>
          <div className={styles.gpaReadout} aria-live="polite"><strong>{hasResult ? format(result.gpa) : "N/A"}</strong><span>/ {Number.isFinite(effectiveProfile.maxGpa) ? effectiveProfile.maxGpa.toFixed(2) : "N/A"}</span></div>
          <div className={styles.gpaTrack} aria-hidden="true"><span style={{ width: hasResult ? `${Math.min(100, Math.max(0, result.gpa! / effectiveProfile.maxGpa * 100))}%` : "0%" }} /></div>
          <p className={styles.resultExplanation}>{hasResult ? "Weighted by each course’s credit hours." : "Your result appears when you add valid credits and grades."}</p>
          <dl className={styles.resultStats}><div><dt>Semester credits</dt><dd>{hasResult ? result.hours : "N/A"}</dd></div><div><dt>Quality points</dt><dd>{hasResult ? format(result.qualityPoints) : "N/A"}</dd></div><div className={styles.cumulativeStat}><dt>Estimated CGPA</dt><dd>{format(cumulativeGpa)}</dd></div></dl>
          <p className={styles.helpText}>{previousGpa.trim() || previousHours.trim() ? "Previous GPA and this semester combined." : "Add your previous CGPA to see the cumulative estimate."}</p>
          <div className={styles.exportButtons}><button className={styles.secondaryButton} type="button" disabled={!hasResult} onClick={exportCsv}>Export CSV</button><button className={styles.secondaryButton} type="button" disabled={!hasResult} onClick={printResult}>Print / PDF</button></div>
          <button className={`${styles.secondaryButton} ${styles.nextSemester}`} type="button" disabled={!hasResult || history.length >= 100} onClick={nextSemester}>Add semester to record <span aria-hidden="true">→</span></button>
          <p className={styles.helpText}>Carry this result forward and start the next semester.</p>
        </div>
        <div className={styles.formulaNote}><span className={styles.eyebrow}>How it adds up</span><p>GPA = total quality points ÷ total credit hours.</p><p className={styles.helpText}>For each course, quality points = grade points × credit hours. Retakes and pass/fail courses may have separate university rules.</p></div>
      </aside>

      <section className={styles.printReport}>
        <h1>Gradify · GPA estimate</h1><h2>{profile.name}</h2><p>{profile.arabicName}</p><p>Scale: {effectiveProfile.maxGpa.toFixed(2)} · {profile.status === "delta-tested" ? "Tested for Delta Engineering" : "Reference estimate; confirm faculty regulations"}</p>
        <table><thead><tr><th>Course</th><th>Credits</th><th>Grade</th><th>Points</th></tr></thead><tbody>{resolvedRows.filter(row => row.hours.trim() && row.grade).map((row, index) => <tr key={row.id}><td>{row.name || `Course ${index + 1}`}</td><td>{row.hours}</td><td>{row.grade}</td><td>{effectiveProfile.grades.find(item => item.grade === row.grade)?.points}</td></tr>)}</tbody></table>
        <p>Semester GPA: <strong>{hasResult ? format(result.gpa) : "N/A"}</strong> · Credits: {result.hours} · Quality points: {format(result.qualityPoints)}</p>
        <p>Previous CGPA: {previousGpa || "N/A"} · Previous GPA hours: {previousHours || "N/A"}</p><p>Estimated CGPA: <strong>{format(cumulativeGpa)}</strong></p><p>{profile.note}</p><p>{profile.sourceUrl}</p>
      </section>
    </div>
  );
}
