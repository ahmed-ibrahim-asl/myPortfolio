import { useEffect, useId, useState } from 'react';
import type { Course } from '../data/curriculum';
import { useGpa } from '../context/GpaContext';
import { courseOffered, defaultPlanningRules, emptyPlanningPreferences, planningRules, type PlanningRules } from '../services/planningPreferences';
import type { SemesterType } from '../services/registrationPolicy';

const ruleLabels: Record<keyof PlanningRules, string> = {
  enforcePrerequisites: 'Require passed prerequisites',
  enforceOfferings: 'Use the listed course offerings',
  enforceElectiveQuotas: 'Respect elective group credit requirements',
  prioritizeUnlocks: 'Prioritize courses that unlock later courses',
  graduationAllowance: 'Apply the graduation-term credit allowance and final prerequisite-pair exception',
};

export default function PlanningReview({ courses, semesterType, termKey, onGenerate, onCancel, message, actionLabel = 'Generate reviewed plan' }: {
  courses: (Course & { missingPrerequisites?: string[] })[];
  semesterType: SemesterType;
  termKey: string;
  onGenerate?: () => void;
  onCancel?: () => void;
  message?: string;
  actionLabel?: string;
}) {
  const { planningPreferences: preferences, setPlanningPreferences, selectedProgram, studentInfo } = useGpa();
  const [query, setQuery] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState('');
  useEffect(() => setChecked(false), [preferences, semesterType, termKey]);
  const id = useId();
  const rules = planningRules(preferences);
  const filtered = courses.filter(c => `${c.code} ${c.name}`.toLowerCase().includes(query.toLowerCase()));
  const offeredCount = courses.filter(c => courseOffered(c, semesterType, termKey, preferences)).length;
  const changed = Object.keys(defaultPlanningRules).some(key => !rules[key as keyof PlanningRules]) || preferences.regularMaxHours || preferences.summerMaxHours;
  const downloadFeedback = () => {
    const report = { program: selectedProgram, bylaw: studentInfo?.bylawVersion, term: termKey,
      defaults: defaultPlanningRules, settings: preferences, feedback };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'gradify-rule-feedback.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section className="delta-planning-review" aria-label={`Review planning settings for ${termKey}`}>
      <h3>Review courses and planning rules</h3>
      <p>Check the actual offerings for <strong>{termKey}</strong> before generating. Your changes are shared by both planners during this session.</p>
      <details>
        <summary>Planning rules {changed ? '(customized)' : '(defaults selected)'}</summary>
        <div className="delta-rule-options">
          {(Object.keys(ruleLabels) as (keyof PlanningRules)[]).map(key => (
            <label key={key}><input type="checkbox" checked={rules[key]} onChange={e => {
              setChecked(false);
              setPlanningPreferences(p => ({ ...p, rules: { ...p.rules, [key]: e.target.checked } }));
            }} /><span>{ruleLabels[key]}</span></label>
          ))}
          {(['regularMaxHours', 'summerMaxHours'] as const).map(key => (
            <label key={key}><span>{key === 'regularMaxHours' ? 'Regular term credit limit' : 'Summer credit limit'}</span>
              <select value={preferences[key] ?? ''} onChange={e => {
                setChecked(false);
                setPlanningPreferences(p => ({ ...p, [key]: e.target.value ? Number(e.target.value) : undefined }));
              }}>
                <option value="">Default CGPA / graduation policy</option>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} hours</option>)}
              </select>
            </label>
          ))}
        </div>
        <p>Repeat-grade caps and transcript GPA arithmetic stay tied to the selected bylaw. Changed planning rules are assumptions, and do not change university requirements.</p>
        <details><summary>Report an inaccurate rule</summary>
          <label htmlFor={`${id}-feedback`}>Describe the rule and the correction</label>
          <textarea id={`${id}-feedback`} value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} />
          <button type="button" disabled={!feedback.trim()} onClick={downloadFeedback}>Download rule feedback</button>
          <p>Share the downloaded file with the tester or maintainer. It includes these settings, without your transcript or student details.</p>
        </details>
      </details>
      <label htmlFor={`${id}-search`}>Find a course</label>
      <input id={`${id}-search`} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Course code or name" />
      <p>{offeredCount} of {courses.length} courses marked as offered. Prerequisites and credit limits are checked separately. Summer offerings are assumptions; confirm them here. Unknown offerings need a selection.</p>
      <div className="delta-availability-list">
        {filtered.length === 0 && <p>No matching courses.</p>}
        {filtered.map(course => {
          const excluded = preferences.excluded.includes(course.code);
          return <div className="delta-availability-row" key={course.code}>
            <div><strong>{course.code}: {course.name}</strong><small>{course.hours} hours{course.missingPrerequisites?.length ? ` · Requires ${course.missingPrerequisites.join(', ')}` : ''}</small></div>
            <label><span>Usual offering</span><select aria-label={`Usual offering for ${course.code}`} value={preferences.offerings[course.code] ?? ''} onChange={e => {
              setChecked(false);
              setPlanningPreferences(p => { const offerings = { ...p.offerings }; if (e.target.value) offerings[course.code] = e.target.value; else delete offerings[course.code]; return { ...p, offerings }; });
            }}>
              <option value="">Catalog: {course.semester}</option>
              <option value="Semester 1">Fall (Semester 1)</option><option value="Semester 2">Spring (Semester 2)</option>
              <option value="Both">All terms</option><option value="Summer">Summer only</option><option value="Unknown">Not confirmed</option>
            </select></label>
            <label><input type="checkbox" disabled={excluded} checked={courseOffered(course, semesterType, termKey, preferences)} onChange={e => {
              setChecked(false);
              setPlanningPreferences(p => ({ ...p, termAvailability: { ...p.termAvailability, [termKey]: { ...p.termAvailability[termKey], [course.code]: e.target.checked } } }));
            }} /><span>Offered this term</span></label>
            <label><input type="checkbox" checked={excluded} onChange={e => {
              setChecked(false);
              setPlanningPreferences(p => ({ ...p, excluded: e.target.checked ? [...p.excluded, course.code] : p.excluded.filter(c => c !== course.code) }));
            }} /><span>Exclude from all plans</span></label>
          </div>;
        })}
      </div>
      <div className="delta-review-actions">
        <button type="button" onClick={() => { setPlanningPreferences(emptyPlanningPreferences()); setChecked(false); }}>Restore default settings</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
      {onGenerate && <>
        {message && <p role="alert">{message}</p>}
        <label className="delta-review-confirm"><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} /><span>I checked the course availability and planning rules.</span></label>
        <button type="button" disabled={!checked} onClick={onGenerate} className="bg-indigo-600 text-white px-4 py-3 rounded-lg">{actionLabel}</button>
      </>}
    </section>
  );
}
