import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Info,
  Plus,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { useGpa, type CourseEntry } from '../context/GpaContext';
import ResultsPanel, { calculateGPA } from './ResultsPanel';
import ExportButton from './ExportButton';
import ProgramCourseCard, {
  type ProgramCourseCardState,
} from './ProgramCourseCard';
import PlannedCourseEditor from './PlannedCourseEditor';
import {
  electiveGroupForCode,
  electiveQuotaStatus,
  getCourseByCode,
  missingPrereqs,
  normCode,
  PROGRAM_LABELS,
  programRequirementGroupsFor,
  type Course,
  type ElectiveGroupId,
  type ProgramRequirementGroup,
} from '../data/curriculum';
import {
  isPassingGrade,
  isPriorityImprovementGrade,
  pointsForGrade,
} from '../data/grades';
import {
  detectCourseRegistration,
} from '../services/academicHistory';
import { buildPrerequisitePassesBySemester } from '../services/plannedPrerequisites';
import {
  allowsGraduationPrerequisitePair,
  getRegistrationLimit,
  type SemesterType,
} from '../services/registrationPolicy';
import { useToast } from '../context/ToastContext';

import PlanningReview from './PlanningReview';
import { getProgramCourses } from '../services/pdfParser';
import { planningLimit, planningRules } from '../services/planningPreferences';

const blankCourse = (
  id: number,
  semesterLabel: string,
  semesterType: SemesterType,
): CourseEntry => ({
  id,
  code: '',
  name: '',
  hours: '',
  grade: '',
  status: 'new',
  oldGrade: '',
  retakeCount: 1,
  semesterLabel,
  semesterType,
  replacementOfCode: '',
  replacementOldHours: '',
  electiveGroupId: '',
});

export default function CalculatorTab() {
  const {
    courses,
    gpaHours,
    passedHours,
    previousCGPA,
    previousTotalPoints,
    rawAttempts,
    bestAttempts,
    studentInfo,
    selectedProgram,
    planningPreferences,
    setCourses,
    setGpaHours,
    setPassedHours,
    setPreviousCGPA,
    setPreviousTotalPoints,
    addCourse,
  } = useGpa();
  const { addToast } = useToast();
  const TOTAL_DEGREE_HOURS = studentInfo?.totalDegreeHours || 160;
  const rules = planningRules(planningPreferences);
  const [activeSemester, setActiveSemester] = useState('Semester 1');
  const programGroups = useMemo(
    () => programRequirementGroupsFor(selectedProgram, studentInfo?.bylawVersion),
    [selectedProgram, studentInfo?.bylawVersion],
  );

  const semesters = useMemo(() => {
    const labels: string[] = [];
    for (const course of courses) {
      if (!labels.includes(course.semesterLabel)) labels.push(course.semesterLabel);
    }
    return labels.length > 0 ? labels : ['Semester 1'];
  }, [courses]);

  useEffect(() => {
    if (!semesters.includes(activeSemester)) {
      setActiveSemester(semesters[0]);
    }
  }, [activeSemester, semesters]);

  const grouped = useMemo(() => {
    const result = new Map<string, CourseEntry[]>();
    for (const semester of semesters) {
      result.set(
        semester,
        courses.filter(course => course.semesterLabel === semester),
      );
    }
    return result;
  }, [courses, semesters]);

  const termGpa = useMemo(() => {
    const result: Record<string, { hours: number; points: number }> = {};
    for (const [semester, semesterCourses] of grouped) {
      let hours = 0;
      let points = 0;
      for (const course of semesterCourses) {
        const courseHours = Number(course.hours);
        const gradePoints = pointsForGrade(course.grade);
        if (!course.code || !course.grade || courseHours <= 0 || gradePoints < 0) continue;
        hours += courseHours;
        points += courseHours * gradePoints;
      }
      result[semester] = { hours, points };
    }
    return result;
  }, [grouped]);

  const termPolicies = useMemo(() => {
    const result: Record<string, {
      startingGpa: number;
      registeredHours: number;
      remainingHours: number;
      semesterType: SemesterType;
      maxHours: number;
      reason: string;
      isGraduationTerm: boolean;
    }> = {};
    let runningGpaHours = Number(gpaHours) || 0;
    let runningPassedHours = Number(passedHours) || 0;
    let runningCgpa = Number(previousCGPA) || 0;
    let runningTotalPoints = previousTotalPoints.trim() !== ''
      ? Number(previousTotalPoints) || 0
      : runningGpaHours * runningCgpa;

    for (const semester of semesters) {
      const semesterCourses = grouped.get(semester) ?? [];
      const semesterType = semesterCourses[0]?.semesterType
        ?? (/summer/i.test(semester) ? 'summer' : 'Fall');
      const remainingHours = Math.max(0, TOTAL_DEGREE_HOURS - runningPassedHours);
      const limit = planningLimit(runningCgpa, semesterType, remainingHours, planningPreferences);
      const registeredHours = semesterCourses.reduce(
        (total, course) => total + (course.code ? Number(course.hours) || 0 : 0),
        0,
      );

      result[semester] = {
        startingGpa: runningCgpa,
        registeredHours,
        remainingHours,
        semesterType,
        ...limit,
      };

      const projection = calculateGPA(
        semesterCourses,
        String(runningGpaHours),
        String(runningPassedHours),
        String(runningCgpa),
        String(runningTotalPoints),
      );
      runningGpaHours = projection.totalHours;
      runningPassedHours = projection.totalEarned;
      runningTotalPoints = projection.totalPoints;
      runningCgpa = Number(projection.cgpa) || runningCgpa;
    }
    return result;
  }, [gpaHours, grouped, passedHours, previousCGPA, previousTotalPoints, semesters, planningPreferences, TOTAL_DEGREE_HOURS]);

  const activeCourses = grouped.get(activeSemester) ?? [];
  const plannedActiveCourses = activeCourses.filter(course => course.code);
  const fallbackRemainingHours = Math.max(
    0,
    TOTAL_DEGREE_HOURS - (Number(passedHours) || 0),
  );
  const fallbackSemesterType: SemesterType = /summer/i.test(activeSemester)
    ? 'Summer'
    : /spring/i.test(activeSemester) ? 'Spring' : 'Fall';
  const fallbackLimit = planningLimit(Number(previousCGPA) || 0, fallbackSemesterType, fallbackRemainingHours, planningPreferences);
  const activePolicy = termPolicies[activeSemester] ?? {
    startingGpa: Number(previousCGPA) || 0,
    registeredHours: 0,
    remainingHours: fallbackRemainingHours,
    semesterType: fallbackSemesterType,
    ...fallbackLimit,
  };
  const transcriptPassedCodes = useMemo(() => new Set(
    bestAttempts
      .filter(attempt => isPassingGrade(attempt.grade))
      .map(attempt => normCode(attempt.code)),
  ), [bestAttempts]);
  const prerequisitePassesBySemester = useMemo(
    () => buildPrerequisitePassesBySemester(
      transcriptPassedCodes,
      semesters,
      courses,
    ),
    [courses, semesters, transcriptPassedCodes],
  );
  const activePrerequisitePasses = prerequisitePassesBySemester.get(activeSemester)
    ?? transcriptPassedCodes;
  const excludedReplacementCodes = useMemo(() => new Set(
    courses
      .filter(course => course.replacementOfCode)
      .map(course => normCode(course.replacementOfCode)),
  ), [courses]);

  const groupProgress = useMemo(() => {
    const result = new Map<string, { passed: number; remaining: number }>();
    const allocatedElectiveCodes = new Set<string>();
    const passedByCode = new Map(
      bestAttempts
        .filter(attempt => isPassingGrade(attempt.grade))
        .map(attempt => [normCode(attempt.code), attempt]),
    );
    for (const group of programGroups) {
      let detectedPassed = 0;
      const usedCodes: string[] = [];
      for (const code of group.codes) {
        const normalized = normCode(code);
        if (group.electiveGroupId && allocatedElectiveCodes.has(normalized)) continue;
        const attempt = passedByCode.get(normalized);
        if (!attempt) continue;
        detectedPassed += attempt.hours;
        usedCodes.push(normalized);
        if (group.electiveGroupId && detectedPassed >= group.requiredHours) break;
      }
      const passed = group.electiveGroupId
        ? Math.min(group.requiredHours, detectedPassed)
        : detectedPassed;
      if (group.electiveGroupId) {
        usedCodes.forEach(code => allocatedElectiveCodes.add(code));
      }
      result.set(group.id, {
        passed,
        remaining: Math.max(0, group.requiredHours - passed),
      });
    }
    return result;
  }, [bestAttempts, programGroups]);

  const plannedElectiveHours = useMemo(() => {
    const result = new Map<string, number>();
    for (const plannedCourse of courses) {
      if (!plannedCourse.code || plannedCourse.replacementOfCode) continue;
      const groupId = plannedCourse.electiveGroupId
        || electiveGroupForCode(plannedCourse.code, selectedProgram);
      if (!groupId) continue;
      result.set(
        groupId,
        (result.get(groupId) ?? 0) + (Number(plannedCourse.hours) || 0),
      );
    }
    return result;
  }, [courses, selectedProgram]);

  const removePlannedCourse = (courseId: number) => {
    setCourses(current => {
      const target = current.find(course => course.id === courseId);
      if (!target) return current;
      const sameTerm = current.filter(course => course.semesterLabel === target.semesterLabel);
      const hasOtherBlank = sameTerm.some(course => course.id !== courseId && !course.code);
      if (sameTerm.length === 1 && !hasOtherBlank) {
        return current.map(course =>
          course.id === courseId
            ? blankCourse(course.id, course.semesterLabel, course.semesterType)
            : course
        );
      }
      return current.filter(course => course.id !== courseId);
    });
  };

  const addNextSemester = () => {
    let semesterNumber = semesters.length + 1;
    let semesterName = `Semester ${semesterNumber}`;
    while (semesters.includes(semesterName)) {
      semesterNumber += 1;
      semesterName = `Semester ${semesterNumber}`;
    }
    addCourse(semesterName, 'Fall');
    setActiveSemester(semesterName);
  };

  const addDetectedCourse = (
    course: Course,
    groupIdOverride?: ElectiveGroupId,
  ) => {
    const detection = detectCourseRegistration(
      course,
      rawAttempts,
      bestAttempts,
      excludedReplacementCodes,
      selectedProgram,
    );
    if (!detection.selectable || detection.status === 'completed') return;

    const electiveGroupId = groupIdOverride
      ?? electiveGroupForCode(course.code, selectedProgram);
    if (
      rules.enforceElectiveQuotas && electiveGroupId
      && !detection.replacement
    ) {
      const progress = groupProgress.get(electiveGroupId);
      const quota = electiveQuotaStatus(
        electiveGroupId,
        progress?.passed ?? 0,
        plannedElectiveHours.get(electiveGroupId) ?? 0,
        course.hours,
      );
      if (!quota.allowed) {
        addToast(
          `${course.code} cannot be added. This elective list only has ${quota.remainingHours} required hour${quota.remainingHours === 1 ? '' : 's'} remaining.`,
          'warning',
        );
        return;
      }
    }

    const newEntry = {
      code: normCode(course.code),
      name: course.name,
      hours: String(course.hours),
      grade: '',
      status: detection.status,
      oldGrade: detection.oldGrade,
      retakeCount: detection.attemptNumber,
      semesterLabel: activeSemester,
      semesterType: activePolicy.semesterType,
      replacementOfCode: detection.replacement
        ? normCode(detection.replacement.replaces.code)
        : '',
      replacementOldHours: detection.replacement
        ? String(detection.replacement.replaces.hours)
        : '',
      electiveGroupId: detection.replacement?.groupId ?? electiveGroupId ?? '',
    } satisfies Omit<CourseEntry, 'id'>;

    setCourses(current => {
      if (current.some(item => normCode(item.code) === normCode(course.code))) {
        return current;
      }
      const blank = current.find(item =>
        item.semesterLabel === activeSemester && !item.code
      );
      if (blank) {
        return current.map(item =>
          item.id === blank.id ? { id: item.id, ...newEntry } : item
        );
      }
      return [
        ...current,
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          ...newEntry,
        },
      ];
    });
    if (
      detection.status === 'improvement'
      && detection.oldGrade
      && !isPriorityImprovementGrade(detection.oldGrade)
    ) {
      addToast(
        `${course.code} can be improved, but prioritizing D-, D, or D+ courses is a better GPA strategy.`,
        'warning',
      );
    } else {
      addToast(`${course.code} added as ${detection.label}.`, 'success');
    }
  };

  const cardPresentation = (
    course: Course,
    group: ProgramRequirementGroup,
  ): {
    state: ProgramCourseCardState;
    label: string;
    onSelect?: () => void;
  } => {
    const selectedHere = plannedActiveCourses.find(item =>
      normCode(item.code) === normCode(course.code)
    );
    if (selectedHere) {
      const label = selectedHere.replacementOfCode
        ? `Selected · Replaces ${selectedHere.replacementOfCode}`
        : selectedHere.status === 'retaken'
          ? 'Selected · Failed retake'
          : selectedHere.status === 'improvement'
            ? 'Selected · Improvement'
            : selectedHere.status === 'withdrawn'
              ? 'Selected · Withdrawn course'
            : 'Selected · New course';
      return {
        state: 'selected',
        label,
        onSelect: () => removePlannedCourse(selectedHere.id),
      };
    }

    const selectedElsewhere = courses.find(item =>
      item.code
      && item.semesterLabel !== activeSemester
      && normCode(item.code) === normCode(course.code)
    );
    if (selectedElsewhere) {
      return {
        state: 'planned',
        label: `Planned in ${selectedElsewhere.semesterLabel}`,
      };
    }

    const detection = detectCourseRegistration(
      course,
      rawAttempts,
      bestAttempts,
      excludedReplacementCodes,
      selectedProgram,
    );
    if (detection.status === 'completed') {
      return { state: 'completed', label: detection.label };
    }
    if (detection.status === 'transferred') {
      return { state: 'transferred', label: detection.label };
    }

    if (planningPreferences.excluded.includes(course.code)) return { state: 'blocked', label: 'Excluded from plans; edit course availability' };
    // Manual registration remains flexible; an explicitly disabled offering is respected.
    if (planningPreferences.termAvailability[`Calculator: ${activeSemester}`]?.[course.code] === false) return { state: 'blocked', label: 'Not offered this term; edit course availability' };
    const missing = missingPrereqs(course, activePrerequisitePasses);
    const bypassPrerequisites = detection.status === 'retaken'
      || (detection.status === 'improvement' && !detection.replacement);
    const selectedPrerequisite = plannedActiveCourses.length === 1
      ? plannedActiveCourses[0]
      : null;
    const graduationPairAllowed = Boolean(
      selectedPrerequisite
      && allowsGraduationPrerequisitePair({
        isGraduationTerm: activePolicy.isGraduationTerm,
        remainingHours: activePolicy.remainingHours,
        prerequisiteCode: selectedPrerequisite.code,
        prerequisiteHours: Number(selectedPrerequisite.hours) || 0,
        dependentHours: course.hours,
        missingPrerequisites: missing,
      }),
    );

    if (rules.enforcePrerequisites && missing.length > 0 && !bypassPrerequisites && !graduationPairAllowed) {
      return {
        state: 'blocked',
        label: `Requires ${missing.join(', ')}`,
      };
    }

    const progress = groupProgress.get(group.id);
    const electiveQuota = group.electiveGroupId
      ? electiveQuotaStatus(
        group.electiveGroupId,
        progress?.passed ?? 0,
        plannedElectiveHours.get(group.electiveGroupId) ?? 0,
        course.hours,
      )
      : null;
    if (
      rules.enforceElectiveQuotas && electiveQuota
      && !detection.replacement
      && !electiveQuota.allowed
    ) {
      return {
        state: 'blocked',
        label: electiveQuota.remainingHours === 0
          ? 'Elective list quota filled'
          : `Only ${electiveQuota.remainingHours} required hrs remain`,
      };
    }

    if (activePolicy.registeredHours + course.hours > activePolicy.maxHours) {
      return {
        state: 'blocked',
        label: `Exceeds ${activePolicy.maxHours}-hour limit`,
      };
    }

    if (detection.status === 'retaken') {
      return {
        state: 'failed',
        label: detection.label,
        onSelect: () => addDetectedCourse(course, group.electiveGroupId),
      };
    }
    if (detection.status === 'improvement') {
      return {
        state: 'improvement',
        label: detection.label,
        onSelect: () => addDetectedCourse(course, group.electiveGroupId),
      };
    }
    if (detection.status === 'withdrawn') {
      return {
        state: 'withdrawn',
        label: detection.label,
        onSelect: () => addDetectedCourse(course, group.electiveGroupId),
      };
    }
    return {
      state: 'available',
      label: graduationPairAllowed ? 'Final-course exception' : detection.label,
      onSelect: () => addDetectedCourse(course, group.electiveGroupId),
    };
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <details className="delta-calculator-settings">
        <summary>Course availability and planning rules</summary>
        <PlanningReview courses={getProgramCourses(selectedProgram, studentInfo?.bylawVersion)} semesterType={activePolicy.semesterType} termKey={`Calculator: ${activeSemester}`} />
      </details>
      <div className="min-w-0 space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <BookOpen className="text-indigo-600" size={20} aria-hidden="true" />
                Academic Record
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {rawAttempts.length > 0
                  ? `${rawAttempts.length} transcript attempts detected automatically`
                  : 'Upload the student transcript to detect passed, failed, withdrawn, transferred, and improvement courses'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[430px]">
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                GPA Hours
                <input
                  aria-label="GPA Hours"
                  type="number"
                  min="0"
                  value={gpaHours}
                  onChange={event => {
                    setPreviousTotalPoints('');
                    setGpaHours(event.target.value);
                  }}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Passed Hours
                <input
                  aria-label="Passed Hours"
                  type="number"
                  min="0"
                  value={passedHours}
                  onChange={event => setPassedHours(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                CGPA
                <input
                  aria-label="Previous CGPA"
                  inputMode="decimal"
                  value={previousCGPA}
                  onChange={event => {
                    const value = event.target.value;
                    if (/^\d*\.?\d*$/.test(value) || value === '') {
                      setPreviousTotalPoints('');
                      setPreviousCGPA(value);
                    }
                  }}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </section>

        <section id="calculator-content" className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <header className="border-b border-slate-300 bg-slate-100 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <GraduationCap className="text-indigo-600" size={21} aria-hidden="true" />
                  {PROGRAM_LABELS[selectedProgram]} Program Chart
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Course type and previous attempts are detected from the uploaded transcript.
                  No registration-type selection is needed.
                </p>
              </div>
              <ExportButton filename="semester-registration-plan" />
            </div>
          </header>

          <div className="border-b border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {semesters.map(semester => {
                  const policy = termPolicies[semester];
                  const selected = semester === activeSemester;
                  return (
                    <button
                      key={semester}
                      type="button"
                      onClick={() => setActiveSemester(semester)}
                      aria-pressed={selected}
                      className={`delta-semester-button min-h-10 shrink-0 rounded-md border px-3 py-2 text-center text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        selected
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block font-bold">{semester}</span>
                      <span>
                        {policy?.registeredHours ?? 0} / {policy?.maxHours ?? 0} hrs
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={addNextSemester}
                  className="flex min-h-10 shrink-0 items-center gap-1 rounded-md border border-dashed border-slate-400 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-indigo-500 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Plus size={14} aria-hidden="true" />
                  Add term
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="active-semester-type">Semester type</label>
                  <select
                    id="active-semester-type"
                    className="h-8 rounded-md border border-slate-300 bg-white px-2 py-0 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-auto"
                    value={activePolicy.semesterType}
                    onChange={(event) => {
                      const semesterType = event.target.value as SemesterType;
                      setCourses((prev) =>
                        prev.map((course) =>
                          course.semesterLabel === activeSemester
                            ? { ...course, semesterType }
                            : course,
                        ),
                      );
                    }}
                  >
                    <option value="Fall">Fall term</option>
                    <option value="Spring">Spring term</option>
                    <option value="Summer">Summer term</option>
                  </select>
                <div className="delta-registration-status flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  {activePolicy.semesterType === 'Summer'
                    ? <Sun size={15} className="text-amber-500" aria-hidden="true" />
                    : <CalendarDays size={15} className="text-indigo-500" aria-hidden="true" />}
                  <div>
                    <p className="text-[10px] text-slate-500">{activePolicy.reason}</p>
                    <p className="text-xs font-bold text-slate-700">
                      {activePolicy.registeredHours} / {activePolicy.maxHours} registered hours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={14} aria-hidden="true" />
                  Limit enforced
                </div>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-200"
                style={{
                  width: `${Math.min(
                    100,
                    (activePolicy.registeredHours / activePolicy.maxHours) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Planned this term</h3>
                <p className="text-[11px] text-slate-500">
                  Select course cards below. Registration type and attempt number are filled automatically.
                  Passing grades from earlier planned terms unlock their dependent courses here.
                </p>
              </div>
              {termGpa[activeSemester]?.hours > 0 && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  Expected GPA {(termGpa[activeSemester].points / termGpa[activeSemester].hours).toFixed(3)}
                </span>
              )}
            </div>
            {plannedActiveCourses.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-3 py-4 text-xs text-slate-500">
                <Info size={16} className="text-indigo-500" aria-hidden="true" />
                Nothing selected yet. Available, failed-retake, withdrawn, and improvement options are identified in the chart.
              </div>
            ) : (
              <div className="space-y-2">
                {plannedActiveCourses.map(course => (
                  <PlannedCourseEditor
                    key={course.id}
                    course={course}
                    onGradeChange={grade => {
                      setCourses(current => current.map(item =>
                        item.id === course.id ? { ...item, grade } : item
                      ));
                    }}
                    onRemove={() => removePlannedCourse(course.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-slate-200 bg-white px-4 py-3 text-[10px] font-semibold text-slate-600">
            <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-600" /> Completed</span>
            <span className="h-3 w-3 rounded-sm border border-indigo-400 bg-white" /> Available
            <span className="h-3 w-3 rounded-sm border border-red-400 bg-red-50" /> Failed retake
            <span className="h-3 w-3 rounded-sm border border-amber-400 bg-amber-50" /> Improvement
            <span className="h-3 w-3 rounded-sm border border-fuchsia-300 bg-fuchsia-50" /> Withdrawn
            <span className="h-3 w-3 rounded-sm border border-cyan-400 bg-cyan-50" /> Transferred
            <span className="h-3 w-3 rounded-sm border border-slate-300 bg-slate-100" /> Locked
          </div>

          <div className="space-y-3 bg-slate-50 p-3">
            {programGroups.map(group => {
              const progress = groupProgress.get(group.id) ?? {
                passed: 0,
                remaining: group.requiredHours,
              };
              return (
                <section
                  key={group.id}
                  className="overflow-hidden rounded-md border border-slate-300 bg-white"
                >
                  <header className="flex flex-col gap-1 border-b border-slate-300 bg-slate-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-xs font-bold text-slate-800">{group.label}</h3>
                    <div className="flex flex-wrap gap-x-3 text-[10px] font-bold">
                      <span className="text-slate-700">Required Hrs: <b className="text-red-600">{group.requiredHours}</b></span>
                      <span className="text-slate-700">Passed Hrs: <b className="text-emerald-600">{progress.passed}</b></span>
                      <span className="text-slate-700">Remain Hrs: <b className="text-red-600">{progress.remaining}</b></span>
                    </div>
                  </header>
                  <div
                    className="grid gap-2 p-3"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
                  >
                    {group.codes.map(code => {
                      const course = getCourseByCode(code);
                      if (!course) return null;
                      const presentation = cardPresentation(course, group);
                      return (
                        <ProgramCourseCard
                          key={course.code}
                          course={course}
                          state={presentation.state}
                          statusLabel={presentation.label}
                          onSelect={presentation.onSelect}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <p className="px-1 text-[10px] text-slate-400">
          Selected program: {PROGRAM_LABELS[selectedProgram]}.
          {' '}Chart source: {selectedProgram === 'mechatronics'
            ? 'Delta University Engineering Curricula, August 2021 (Part VII)'
            : 'Delta University Program Chart, 20 July 2026'}.
          {studentInfo?.program && ` Transcript program: ${studentInfo.program}.`}
        </p>
      </div>

      <aside className="xl:min-w-0">
        <ResultsPanel />
      </aside>
    </div>
  );
}
