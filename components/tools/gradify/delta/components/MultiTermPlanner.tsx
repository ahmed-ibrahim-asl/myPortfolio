import { useState, useMemo } from 'react';
import { remainingCourses } from '../services/pdfParser';
import { type SemesterType } from '../services/registrationPolicy';
import { generateFullPlan, type PlannedTerm } from '../services/fullPlanGenerator';
import PlanBuilder from './PlanBuilder';
import { useGpa } from '../context/GpaContext';
import { Sparkles, Trash2, CalendarDays, AlertTriangle } from 'lucide-react';
import { projectPlannedTerms } from '../services/planProjection';
import ExportButton from './ExportButton';
import PlanningReview from './PlanningReview';
import { courseOffered, planningLimit, planningRules } from '../services/planningPreferences';


export default function MultiTermPlanner() {
  const { 
    rawAttempts, 
    bestAttempts, 
    passedHours, 
    gpaHours, 
    previousCGPA,
    previousTotalPoints,
    studentInfo, 
    selectedProgram,
    planningPreferences,
  } = useGpa();

  const parsedPassedHours = parseFloat(String(passedHours)) || 0;
  const parsedGpaHours = parseFloat(String(gpaHours)) || 0;
  const parsedCGPA = parseFloat(String(previousCGPA)) || 0;

  const [terms, setTerms] = useState<PlannedTerm[]>([]);
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  
  const [includeSummer, setIncludeSummer] = useState(false);
  const [targetCGPA, setTargetCGPA] = useState<number>(2.0);
  const [timing, setTiming] = useState<'beginning' | 'middle'>('beginning');
  const [currentRegisteredCourses, setCurrentRegisteredCourses] = useState<string[]>([]);
  
  const [reviewing, setReviewing] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');
  const [startSemester, setStartSemester] = useState<SemesterType>(new Date().getMonth() > 5 ? 'Fall' : 'Spring');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const startKey = `${startSemester} ${startYear}`;

  const initialAvailable = useMemo(() => {
    return remainingCourses(bestAttempts, selectedProgram, studentInfo?.bylawVersion, false);
  }, [bestAttempts, selectedProgram, studentInfo]);
  
  const activeTermIndex = useMemo(() => {
    if (!activeTermId) return 0;
    const idx = terms.findIndex(t => t.id === activeTermId);
    return idx >= 0 ? idx : 0;
  }, [terms, activeTermId]);
  
  const handleGenerate = () => {
    setGenerationMessage('');
    if (!Number.isFinite(targetCGPA) || targetCGPA < 0 || targetCGPA > 4 || !Number.isInteger(startYear) || startYear < 2000 || startYear > 2200) {
      setGenerationMessage('Enter a target from 0 to 4 and a valid start year (2000 to 2200).'); return;
    }
    if (timing === 'middle' && currentRegisteredCourses.length === 0) {
      setGenerationMessage('Select your current courses before generating a middle-of-semester plan.'); return;
    }
    if (timing === 'middle') {
      const unavailable = initialAvailable.filter(c => currentRegisteredCourses.includes(c.code) &&
        (!courseOffered(c, startSemester, startKey, planningPreferences) || (planningRules(planningPreferences).enforcePrerequisites && c.status !== 'available')));
      if (unavailable.length) {
        setGenerationMessage(`Review ${unavailable.map(c => c.code).join(', ')}: confirm its offering or adjust the prerequisite rule for your exception.`); return;
      }
    }
    const totalDegreeHours = studentInfo?.totalDegreeHours || 160;

    
    const newTerms = generateFullPlan(
      bestAttempts,
      parsedPassedHours,
      parsedCGPA,
      parsedGpaHours,
      {
        includeSummer,
        preferences: planningPreferences,
        targetCGPA,
        totalDegreeHours,
        startSemester,
        startYear,
        studentProgram: selectedProgram,
        bylawVersion: studentInfo?.bylawVersion,
        currentRegisteredCourses: timing === 'middle' ? currentRegisteredCourses : [],
        initialAttempts: rawAttempts,
        previousTotalPoints: previousTotalPoints.trim() ? Number(previousTotalPoints) : undefined
      }
    );
    
    if (timing === 'middle' && currentRegisteredCourses.some(code => !(code in (newTerms[0]?.courses ?? {})))) {
      setGenerationMessage('The selected current courses conflict with the credit limit or elective rules. Adjust those rules or your selection before generating.'); return;
    }
    if (!newTerms.length) {
      setGenerationMessage(initialAvailable.length
        ? 'No plan could be generated. Check excluded courses, offerings, prerequisites and credit limits in the review below.'
        : 'No remaining courses were found in this curriculum. If your target is still unmet, use the improvement options in the semester calculator.');
      return;
    }
    setTerms(newTerms);
    setReviewing(false);
    if (newTerms.length > 0) {
      setActiveTermId(newTerms[0].id);
    }
  };

  const handleUpdateTerm = (courses: Record<string, string>) => {
    if (terms.length === 0) return;
    setTerms(prev => {
      const next = [...prev];
      next[activeTermIndex] = {
        ...next[activeTermIndex],
        courses
      };
      return next;
    });
  };

  const handleChangeSemesterType = (type: SemesterType) => {
    if (terms.length === 0) return;
    setTerms(prev => {
      const next = [...prev];
      next[activeTermIndex] = {
        ...next[activeTermIndex],
        semesterType: type,
        title: next[activeTermIndex].title.replace(/^(Fall|Spring|Summer)/, type),
      };
      return next;
    });
  };
  
  const initialRecord = useMemo(() => ({
    passedHours: parsedPassedHours,
    gpaHours: parsedGpaHours,
    cgpa: parsedCGPA,
    totalPoints: previousTotalPoints.trim() ? Number(previousTotalPoints) : parsedCGPA * parsedGpaHours,
  }), [parsedPassedHours, parsedGpaHours, parsedCGPA, previousTotalPoints]);
  const activeProjection = useMemo(() => projectPlannedTerms(
    rawAttempts, initialRecord, terms.slice(0, activeTermIndex), selectedProgram, studentInfo?.bylawVersion, studentInfo?.totalDegreeHours, planningPreferences,
  ), [rawAttempts, initialRecord, terms, activeTermIndex, selectedProgram, studentInfo, planningPreferences]);
  const fullProjection = useMemo(() => projectPlannedTerms(
    rawAttempts, initialRecord, terms, selectedProgram, studentInfo?.bylawVersion, studentInfo?.totalDegreeHours, planningPreferences,
  ), [rawAttempts, initialRecord, terms, selectedProgram, studentInfo, planningPreferences]);
  const augmentedBestAttempts = activeProjection.bestAttempts;
  const augmentedPassedHours = activeProjection.record.passedHours;
  const augmentedGpaHours = activeProjection.record.gpaHours;
  const augmentedCGPA = activeProjection.record.cgpa;
  const customLimit = useMemo(() => {
    return planningLimit(augmentedCGPA, terms[activeTermIndex]?.semesterType || 'Fall',
      (studentInfo?.totalDegreeHours || 160) - augmentedPassedHours, planningPreferences);
  }, [augmentedCGPA, terms, activeTermIndex, augmentedPassedHours, studentInfo, planningPreferences]);
  
  const customRemaining = useMemo(() => {
    return remainingCourses(augmentedBestAttempts, selectedProgram, studentInfo?.bylawVersion, customLimit.isGraduationTerm);
  }, [augmentedBestAttempts, selectedProgram, studentInfo, customLimit]);



  const validationErrors = fullProjection.errors;
  const hasErrors = validationErrors.length > 0;
  const stillRemaining = remainingCourses(fullProjection.bestAttempts, selectedProgram, studentInfo?.bylawVersion);
  const targetMet = fullProjection.record.cgpa >= targetCGPA;



  if (terms.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,480px)] lg:items-center lg:gap-12">
            <div className="text-center lg:text-left">
              <Sparkles className="mx-auto mb-4 h-16 w-16 text-indigo-200 lg:mx-0" />
              <h2 className="mb-2 text-2xl font-bold text-slate-800">Multi-Semester Auto-Planner</h2>
              <p className="mx-auto max-w-xl text-slate-600 lg:mx-0">
                Build a suggested course sequence from your remaining requirements. Review expected grades, prerequisites, and each term before registering.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 text-left">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target CGPA</label>
              <input 
                type="number" 
                step="0.1"
                value={Number.isFinite(targetCGPA) ? targetCGPA : ''}
                min="0" max="4" aria-label="Full plan target CGPA"
                onChange={e => setTargetCGPA(e.target.value === '' ? NaN : Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">When are you planning?</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button 
                  onClick={() => setTiming('beginning')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${timing === 'beginning' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Before Registration
                </button>
                <button 
                  onClick={() => setTiming('middle')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${timing === 'middle' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Middle of Semester
                </button>
              </div>
            </div>

            <label className="block text-sm font-semibold text-slate-700">First term
              <select aria-label="First plan term" className="w-full" value={startSemester} onChange={e => { setStartSemester(e.target.value as SemesterType); setReviewing(false); }}>
                <option value="Fall">Fall (Semester 1)</option><option value="Spring">Spring (Semester 2)</option><option value="Summer">Summer</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Start year
              <input aria-label="Plan start year" type="number" min="2000" max="2200" value={startYear} onChange={e => { setStartYear(Number(e.target.value)); setReviewing(false); }} />
            </label>
            {timing === 'middle' && (
              <fieldset className="delta-current-courses">
                <legend>Select your current courses</legend>
                <p>Choose each registered course. Missing prerequisites are shown so you can review an exception.</p>
                {initialAvailable.length === 0 && <p>No remaining courses found. Check your curriculum and transcript.</p>}
                {initialAvailable.map(c => <label key={c.code}>
                  <input type="checkbox" checked={currentRegisteredCourses.includes(c.code)} onChange={e => setCurrentRegisteredCourses(prev => e.target.checked ? [...prev, c.code] : prev.filter(code => code !== c.code))} />
                  <span><strong>{c.code}: {c.name}</strong>{c.missingPrerequisites.length > 0 && <small>Requires {c.missingPrerequisites.join(', ')}</small>}</span>
                </label>)}
              </fieldset>
            )}

              <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input 
                type="checkbox" 
                checked={includeSummer} 
                onChange={e => setIncludeSummer(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 accent-indigo-600 focus:ring-indigo-500 focus:ring-2"
              />
              <span className="font-medium text-slate-700">Include Summer terms</span>
              </label>

              <button
                onClick={() => { setReviewing(true); setGenerationMessage(''); }}
                className="w-full rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:w-auto sm:self-start"
              >
                Generate Full Plan
              </button>
            </div>
          </div>
        </div>
        
        {reviewing && <PlanningReview key={startKey} courses={initialAvailable} semesterType={startSemester} termKey={startKey} message={generationMessage} onGenerate={handleGenerate} onCancel={() => setReviewing(false)} actionLabel="Generate Full Plan with reviewed settings" />}
                {/* Render standard single-term PlanBuilder beneath as fallback or until they generate */}
        <div className="mt-8 border-t border-slate-200 pt-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-4 text-sm font-semibold text-slate-400">
            OR BUILD MANUALLY
          </div>
          <PlanBuilder 
            attempts={rawAttempts}
            bestAttempts={bestAttempts}
            passedHours={parsedPassedHours}
            gpaHours={parsedGpaHours}
            currentCGPA={parsedCGPA}
            currentTotalPoints={initialRecord.totalPoints}
            studentProgram={selectedProgram}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="delta-plan-notice" role="status">
        <strong>{stillRemaining.length || !targetMet || hasErrors ? 'Suggested plan: review remaining requirements' : 'Suggested graduation plan'}</strong>
        <p>Projected CGPA: {fullProjection.record.cgpa.toFixed(3)}. Target: {targetCGPA}. {targetMet ? 'Target met with the expected grades shown.' : 'Target not met. Change expected grades or consider eligible improvements.'}</p>
        {stillRemaining.length > 0 && <p>{stillRemaining.length} curriculum options remain, including blocked, unconfirmed or excluded courses. This is a partial plan; generation checks up to 25 terms.</p>}
        {stillRemaining.length > 0 && <details><summary>View remaining courses</summary><ul>{stillRemaining.map(c => <li key={c.code}>{c.code}: {c.name}{planningPreferences.excluded.includes(c.code) ? ' (excluded)' : c.missingPrerequisites.length ? ` (requires ${c.missingPrerequisites.join(', ')})` : ' (review offering or credit limit)'}</li>)}</ul></details>}
        <p>Course exclusions do not remove degree requirements. Use Reset to review settings and regenerate.</p>
      </div>
      {/* Timeline / Terms Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-10">
        <div className="delta-timeline-heading">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            Graduation Timeline
          </h2>
          <div className="delta-timeline-actions">
            <button 
              onClick={() => setTerms([])}
              className="text-sm font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Reset
            </button>
            {hasErrors ? (
              <button type="button" disabled className="opacity-50 cursor-not-allowed" title="Resolve plan errors to export">Export PDF</button>
            ) : (
              <ExportButton 
                filename="multi-term-plan"
                plannedCourses={fullProjection.courses} 
              />
            )}
          </div>
        </div>
        
        {hasErrors && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Registration issues detected</p>
              <p>Review prerequisites and completed or transferred courses before exporting this plan.</p>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          {terms.map((t) => {
            const isActive = t.id === activeTermId;
            const termErrors = validationErrors.filter(e => e.termId === t.id);
            return (
              <button
                key={t.id}
                onClick={() => setActiveTermId(t.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                  isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : termErrors.length > 0 
                      ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t.title}
                {termErrors.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs">
                    {termErrors.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <PlanBuilder 
        attempts={activeProjection.attempts}
        bestAttempts={augmentedBestAttempts}
        passedHours={augmentedPassedHours}
        gpaHours={augmentedGpaHours}
        currentCGPA={augmentedCGPA}
        currentTotalPoints={activeProjection.record.totalPoints}
        studentProgram={selectedProgram}
        controlledSelectedForSemester={terms[activeTermIndex]?.courses || {}}
        onSelectedForSemesterChange={handleUpdateTerm}
        termKey={terms[activeTermIndex]?.title}
        controlledSemesterType={terms[activeTermIndex]?.semesterType || 'Fall'}
        onSemesterTypeChange={handleChangeSemesterType}
        customRemaining={customRemaining as any}
        customLimit={customLimit}
      />
    </div>
  );
}
