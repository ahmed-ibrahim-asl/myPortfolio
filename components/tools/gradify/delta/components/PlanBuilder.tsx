import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  CheckCircle,
  ClipboardList,
  FileClock,
  GraduationCap,
  Lock,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  type ParsedCourse,
  graduationNumbers,
  remainingCourses,
  groupByTerm,
  failedRetakeCourses,
  withdrawnCourseAttempts,
  transferredCourseAttempts,
  type TermGpa,
} from '../services/pdfParser';
import CircularProgress from './CircularProgress';
import GpaTrendChart from './GpaTrendChart';
import ExportButton from './ExportButton';
import {
  gradeScale,
  isPassingGrade,
  isPriorityImprovementGrade,
} from '../data/grades';
import { type SemesterType } from '../services/registrationPolicy';
import { useToast } from '../context/ToastContext';
import {
  detectCourseRegistration,
  sameCourseImprovementCandidates,
  electiveReplacementOptions,
} from '../services/academicHistory';
import { capExpectedGrade } from '../services/planProjection';
import { 
  electiveGroupForCode, 
  electiveQuotaStatus,
  normCode,
  type Course
} from '../data/curriculum';
import { useGpa, type CourseEntry } from '../context/GpaContext';
import GpaImprovement from './GpaImprovement';
import PlanningReview from './PlanningReview';
import { courseOffered, planningLimit, planningRules } from '../services/planningPreferences';
import { generateFullPlan } from '../services/fullPlanGenerator';

export type RemainingCourse = Course & {
  status: 'available' | 'blocked';
  missingPrerequisites: string[];
  unlocksNext: string[];
};

interface PlanBuilderProps {
  termKey?: string;
  attempts: ParsedCourse[];
  bestAttempts: ParsedCourse[];
  passedHours: number;
  gpaHours: number;
  currentCGPA: number;
  currentTotalPoints?: number;
  studentProgram: string;
  controlledSelectedForSemester?: Record<string, string>;
  onSelectedForSemesterChange?: (newVal: Record<string, string>) => void;
  controlledSemesterType?: SemesterType;
  onSemesterTypeChange?: (newVal: SemesterType) => void;
  customRemaining?: RemainingCourse[];
  customLimit?: { maxHours: number, reason: string, isGraduationTerm: boolean };
}

function CourseIdentity({ 
  code, 
  name, 
  className = '' 
}: { 
  code: string; 
  name: string;
  className?: string;
}) {
  return (
    <p className={`min-w-0 text-sm text-slate-700 ${className}`}>
      <span className="font-mono font-normal">{code}</span>
      <span aria-hidden="true">: </span>
      <span className="font-bold text-slate-900">{name}</span>
    </p>
  );
}

export default function PlanBuilder({
  termKey: suppliedTermKey,
  attempts,
  bestAttempts,
  passedHours,
  gpaHours,
  currentCGPA,
  currentTotalPoints,
  studentProgram,
  controlledSelectedForSemester,
  onSelectedForSemesterChange,
  controlledSemesterType,
  onSemesterTypeChange,
  customRemaining,
  customLimit,
}: PlanBuilderProps) {
  const { 
    studentInfo,
    planningPreferences,
    limit: backendLimit, 
    remaining: backendRemaining
  } = useGpa();
  
  const { addToast } = useToast();
  const [targetCGPAText, setTargetCGPAText] = useState<string>('2.0');
  const [search, setSearch] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  
  // Internal state for standalone mode
  const [internalSelected, setInternalSelected] = useState<Record<string, string>>({});
  const [internalSemesterType, setInternalSemesterType] = useState<SemesterType>('Fall');
  const [advisorOverrides, setAdvisorOverrides] = useState<Record<string, boolean>>({});

  const selectedForSemester = controlledSelectedForSemester ?? internalSelected;
  const setSelectedForSemester = (updater: any) => {
    if (onSelectedForSemesterChange) {
      if (typeof updater === 'function') {
        onSelectedForSemesterChange(updater(selectedForSemester));
      } else {
        onSelectedForSemesterChange(updater);
      }
    } else {
      setInternalSelected(updater);
    }
  };

  const semesterType = controlledSemesterType ?? internalSemesterType;
  const setSemesterType = (updater: any) => {
    if (onSemesterTypeChange) {
      if (typeof updater === 'function') {
        onSemesterTypeChange(updater(semesterType));
      } else {
        onSemesterTypeChange(updater);
      }
    } else {
      setInternalSemesterType(updater);
    }
  };

  const termKey = suppliedTermKey || `Semester plan: ${semesterType}`;
  const rules = planningRules(planningPreferences);

  const targetCGPA = useMemo(() => parseFloat(targetCGPAText) || 0, [targetCGPAText]);


  const totalDegreeHours = studentInfo?.totalDegreeHours || 160;
  
  const registrationLimit = planningLimit(currentCGPA, semesterType, totalDegreeHours - passedHours, planningPreferences);

  const failed = failedRetakeCourses(attempts, bestAttempts);
  const withdrawn = withdrawnCourseAttempts(attempts);
  const transferred = transferredCourseAttempts(attempts);
  const sameCourseImprovements = sameCourseImprovementCandidates(attempts, studentProgram, studentInfo?.bylawVersion);
  const electiveReplacements = electiveReplacementOptions(bestAttempts, new Set(), studentProgram, studentInfo?.bylawVersion);
  const catalogRemaining = remainingCourses(bestAttempts, studentProgram, studentInfo?.bylawVersion, registrationLimit.isGraduationTerm) as RemainingCourse[];
  const remaining = catalogRemaining.map(c => ({ ...c,
    semester: planningPreferences.offerings[c.code] ?? c.semester,
    status: rules.enforcePrerequisites ? c.status : 'available' as const,
  }));

  const available = useMemo(() => {
    let result = remaining.filter(c => c.status === 'available');
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }
    if (filterLevel !== 'all') {
      result = result.filter(c => c.level === filterLevel);
    }
    return result;
  }, [remaining, search, filterLevel]);

  const blocked = remaining.filter(c => c.status === 'blocked');

  const stats = graduationNumbers(passedHours, gpaHours, currentCGPA, targetCGPA, totalDegreeHours, currentTotalPoints);
  const progressPct = Math.min(100, Math.round((passedHours / totalDegreeHours) * 100));
  const termData: TermGpa[] = useMemo(() => groupByTerm(attempts), [attempts]);

  const levels = useMemo(() => {
    const seen = new Set(available.map(c => c.level));
    return ['L0', 'L1', 'L2', 'L3', 'L4'].filter(l => seen.has(l));
  }, [available]);

  const allAvailable = useMemo(() => remaining.filter(c => c.status === 'available'), [remaining]);

  const plannedCourses = useMemo(() => {
    return remaining.filter(c => selectedForSemester[c.code] !== undefined);
  }, [remaining, selectedForSemester]);

  const plannedHours = useMemo(
    () => plannedCourses.reduce((total, course) => total + course.hours, 0),
    [plannedCourses],
  );
  const invalidPlanned = plannedCourses.filter(c => planningPreferences.excluded.includes(c.code)
    || (c.status === 'blocked' && rules.enforcePrerequisites)
    || (!courseOffered(c, semesterType, termKey, planningPreferences) && !advisorOverrides[c.code]));
  const hasPlanIssues = invalidPlanned.length > 0 || plannedHours > registrationLimit.maxHours;

  const passedElectiveHours = useMemo(() => {
    const result = new Map<string, number>();
    for (const attempt of bestAttempts) {
      if (!isPassingGrade(attempt.grade)) continue;
      const groupId = electiveGroupForCode(attempt.code, studentProgram);
      if (!groupId) continue;
      result.set(groupId, (result.get(groupId) ?? 0) + attempt.hours);
    }
    return result;
  }, [bestAttempts, studentProgram]);

  const plannedElectiveHours = useMemo(() => {
    const result = new Map<string, number>();
    for (const course of plannedCourses) {
      const groupId = electiveGroupForCode(course.code, studentProgram);
      if (!groupId) continue;
      result.set(groupId, (result.get(groupId) ?? 0) + course.hours);
    }
    return result;
  }, [plannedCourses, studentProgram]);



  const projectedSGPA = useMemo(() => {
    let totalHours = 0;
    let totalPoints = 0;
    for (const c of plannedCourses) {
      const grade = selectedForSemester[c.code];
      if (!grade || grade === 'PASS') continue;
      const g = gradeScale.find(g => g.grade === grade);
      if (!g) continue;
      totalHours += c.hours;
      totalPoints += c.hours * g.points;
    }
    return totalHours > 0 ? totalPoints / totalHours : 0;
  }, [plannedCourses, selectedForSemester]);

  const toggleSelect = (code: string) => {
    setSelectedForSemester((prev: Record<string, string>) => {
      const next = { ...prev };
      if (next[code] !== undefined) {
        delete next[code];
      } else {
        const selectedCourse = allAvailable.find(course => course.code === code);
        if (planningPreferences.excluded.includes(code)) { addToast('This course is excluded from all plans. Update course availability to include it.', 'warning'); return prev; }
        const isOutOfSeason = selectedCourse && !courseOffered(selectedCourse, semesterType, termKey, planningPreferences);
        if (isOutOfSeason && !advisorOverrides[code]) {
          addToast('Please authorize the advisor override to register this out-of-season course.', 'warning');
          return prev;
        }

        if (selectedCourse && plannedHours + selectedCourse.hours > registrationLimit.maxHours) {
          addToast(
            `${selectedCourse.code} would exceed the ${registrationLimit.maxHours}-hour ${semesterType} limit.`,
            'warning',
          );
          return prev;
        }
        const electiveGroupId = selectedCourse
          ? electiveGroupForCode(selectedCourse.code, studentProgram, studentInfo?.bylawVersion)
          : null;
        if (rules.enforceElectiveQuotas && selectedCourse && electiveGroupId) {
          const quota = electiveQuotaStatus(
            electiveGroupId,
            passedElectiveHours.get(electiveGroupId) ?? 0,
            plannedElectiveHours.get(electiveGroupId) ?? 0,
            selectedCourse.hours,
          );
          if (!quota.allowed) {
            addToast(`Cannot add ${selectedCourse.code}. This elective list only has ${quota.remainingHours} required hour${quota.remainingHours === 1 ? '' : 's'} remaining.`, 'warning');
            return prev;
          }
        }
        next[code] = '';
      }
      return next;
    });
  };

  const autoGeneratePlan = () => {
    if (!Number.isFinite(targetCGPA) || targetCGPA < 0 || targetCGPA > 4) {
      addToast('Enter a target CGPA from 0 to 4.', 'warning'); return;
    }
    const generated = generateFullPlan(bestAttempts, passedHours, currentCGPA, gpaHours, {
      includeSummer: semesterType === 'Summer', targetCGPA, totalDegreeHours,
      startSemester: semesterType, startYear: new Date().getFullYear(),
      studentProgram, bylawVersion: studentInfo?.bylawVersion,
      initialAttempts: attempts, previousTotalPoints: currentTotalPoints,
      preferences: planningPreferences, maxTerms: 1, firstTermKey: termKey,
    });
    const courses = generated[0]?.courses ?? {};
    if (!Object.keys(courses).length) {
      addToast('No eligible courses fit this term. Review availability, prerequisites and credit limits.', 'warning'); return;
    }
    setSelectedForSemester(courses);
    setReviewing(false);
    addToast('Semester plan generated. Review the assumed grades before using the projection.', 'success');
  };

  const setExpectedGrade = (code: string, grade: string) => {
    const course = allAvailable.find(item => item.code === code);
    const allowedGrade = course ? capExpectedGrade(detectCourseRegistration(course, attempts, bestAttempts, new Set(), studentProgram), grade) : grade;
    setSelectedForSemester((prev: Record<string, string>) => ({ ...prev, [code]: allowedGrade }));
  };

  const gradeOptionsFor = (course: Course) => {
    const detection = detectCourseRegistration(course, attempts, bestAttempts, new Set(), studentProgram);
    const isRepeat = ['retaken', 'improvement'].includes(detection.status) && !detection.replacement;
    return gradeScale.filter(option => (!isRepeat || !['PASS', 'FAIL'].includes(option.grade)) && capExpectedGrade(detection, option.grade) === option.grade);
  };

  const plannedExportCourses = useMemo<CourseEntry[]>(() => {
    const semesterLabel = semesterType === 'Summer'
      ? 'Planned Summer Term'
      : semesterType === 'Spring' ? 'Planned Spring Term' : 'Planned Fall Term';
    return plannedCourses.map((course, index) => {
      const detection = detectCourseRegistration(
        course,
        attempts,
        bestAttempts,
        new Set(),
        studentProgram,
      );
      return {
        id: index + 1,
        code: normCode(course.code),
        name: course.name,
        hours: String(course.hours),
        grade: selectedForSemester[course.code] ?? '',
        status: detection.status === 'completed' || detection.status === 'transferred'
          ? 'new'
          : detection.status,
        oldGrade: detection.oldGrade,
        retakeCount: detection.attemptNumber,
        semesterLabel,
        semesterType,
        replacementOfCode: detection.replacement
          ? normCode(detection.replacement.replaces.code)
          : '',
        replacementOldHours: detection.replacement
          ? String(detection.replacement.replaces.hours)
          : '',
        electiveGroupId: detection.replacement?.groupId ?? '',
      };
    });
  }, [attempts, bestAttempts, plannedCourses, selectedForSemester, semesterType, studentProgram]);

  return (
    <div id="plan-content" className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="text-indigo-500" size={22} />
              Graduation Progress
            </h2>
            {hasPlanIssues ? <button type="button" disabled title="Resolve the course availability or credit-limit issues">Export PDF</button> : <ExportButton
              filename="semester-registration-plan"
              plannedCourses={plannedExportCourses}
              academicRecord={{ gpaHours, passedHours, cgpa: currentCGPA, totalPoints: currentTotalPoints ?? currentCGPA * gpaHours }}
            />}
          </div>
          <span className="text-sm font-medium text-slate-500">{passedHours} / {totalDegreeHours} hrs</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{progressPct}% Complete</span>
          <span>{totalDegreeHours - passedHours} hrs remaining</span>
        </div>
      </div>

      {/* Visual Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 self-start">
            <GraduationCap size={18} className="text-indigo-500" />
            Degree Completion
          </h3>
          <CircularProgress
            percentage={progressPct}
            label="Complete"
            sublabel={`${passedHours} of ${totalDegreeHours} hours completed`}
          />
        </div>
        {termData.length > 1 && (
          <GpaTrendChart data={termData} />
        )}
      </div>

      {/* Target CGPA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target className="text-indigo-500" />
          Set Target CGPA
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-full sm:w-1/3">
            <label className="block text-sm text-slate-600 mb-2 font-medium">Target Graduation CGPA</label>
            <input
              type="text"
              inputMode="decimal"
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-semibold text-center"
              value={targetCGPAText}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*\.?\d*$/.test(v) || v === '') setTargetCGPAText(v);
              }}
            />
          </div>
          <div className="flex-1 space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Remaining Hours</p>
                  <p className="text-2xl font-bold text-slate-700">{stats.remainingHours}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estimated GPA across remaining new hours</p>
                  {!stats.goalMet && stats.reqGpaRemaining === -1 ? (
                    <p className="text-xl font-bold text-red-500 mt-1">Impossible</p>
                  ) : !stats.goalMet && stats.reqGpaRemaining > 0 ? (
                    <p className="text-2xl font-bold text-indigo-600">{stats.reqGpaRemaining.toFixed(3)}</p>
                  ) : (
                    <p className="text-xl font-bold text-green-500 mt-1">Goal Achieved</p>
                  )}
                </div>
              </div>
            </div>

            {/* Feasibility status */}
            <div className={`rounded-xl p-4 border text-center ${
              !stats.goalMet && stats.reqGpaRemaining === -1
                ? 'bg-red-50 border-red-200'
                : !stats.goalMet && stats.reqGpaRemaining > 0
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              {!stats.goalMet && stats.reqGpaRemaining === -1 ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="text-red-600" size={22} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-red-700 text-lg">Impossible</p>
                    <p className="text-sm text-red-600">
                      {stats.remainingHours === 0 ? `Current CGPA ${stats.exactCGPA.toFixed(3)} is below ${targetCGPA}. There are no new degree hours left; review eligible improvements in the semester calculator.` : `The target ${targetCGPA} needs more than 4.0 across the remaining hours. Review eligible improvements.`}
                    </p>
                  </div>
                </div>
              ) : !stats.goalMet && stats.reqGpaRemaining > 0 ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-emerald-600" size={22} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-emerald-700 text-lg">Achievable</p>
                    <p className="text-sm text-emerald-600">
                      Estimated GPA needed: {stats.reqGpaRemaining.toFixed(3)} over {stats.remainingHours} remaining new hours to reach {targetCGPA}. Retakes and improvements may change this estimate; use the plan projection for course-specific results.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-blue-600" size={22} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-blue-700 text-lg">Goal Achieved</p>
                    <p className="text-sm text-blue-600">
                      Your current CGPA {stats.exactCGPA.toFixed(3)} meets or exceeds the target {targetCGPA}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-800">{failed.length}</p>
          <p className="text-xs text-red-500 font-medium mt-1">Failed Courses</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-fuchsia-700">{withdrawn.length}</p>
          <p className="text-xs text-fuchsia-600 font-medium mt-1">Withdrawn</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-cyan-700">{transferred.length}</p>
          <p className="text-xs text-cyan-700 font-medium mt-1">Transferred</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-800">{sameCourseImprovements.length}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">D-Range Improvements</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-green-600">{available.length}</p>
          <p className="text-xs text-green-500 font-medium mt-1">Available</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-500">{blocked.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Blocked (Prereq)</p>
        </div>
      </div>

      {/* Planned This Semester */}
      {reviewing && <PlanningReview key={termKey} courses={catalogRemaining} semesterType={semesterType} termKey={termKey} onGenerate={autoGeneratePlan} onCancel={() => setReviewing(false)} actionLabel="Generate this semester" />}
      {hasPlanIssues && <p role="alert" className="delta-plan-notice">Review selected courses before exporting: {invalidPlanned.map(c => c.code).join(', ')}{plannedHours > registrationLimit.maxHours ? `; the plan exceeds ${registrationLimit.maxHours} hours` : ''}. Change availability or remove these courses.</p>}
      <div className="bg-white border border-indigo-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-indigo-500" />
            Planned This Semester
            {plannedCourses.length > 0 && (
              <span className="text-sm font-normal text-slate-400">({plannedCourses.length} courses)</span>
            )}
          </h3>
          <div className="flex items-center gap-3">
            <label className="sr-only" htmlFor="planner-semester-type">Semester type</label>
            <select
              id="planner-semester-type"
              value={semesterType}
              onChange={(event) => setSemesterType(event.target.value as SemesterType)}
              className="h-[38px] rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Fall">Fall (Semester 1)</option>
              <option value="Spring">Spring (Semester 2)</option>
              <option value="Summer">Summer</option>
            </select>
            {plannedCourses.length > 0 && (
              <div className="text-right">
              <p className="text-xs text-slate-500">Projected SGPA</p>
              <p className="text-xl font-bold text-indigo-600">{projectedSGPA.toFixed(3)}</p>
              </div>
            )}
          </div>
        </div>
        {registrationLimit.isGraduationTerm && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <GraduationCap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900">Graduation Term Active</h4>
                <p className="text-sm text-amber-700 mt-1">
                  The student is eligible for graduation this term. Prerequisite bypassing is available for one course.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-bold text-slate-700">Registered hours</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReviewing(true)}
                className="flex items-center gap-1.5 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors shadow-sm"
              >
                <Sparkles size={12} />
                Auto-Generate
              </button>
              <span className="font-bold text-indigo-700">{plannedHours} / {registrationLimit.maxHours}</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500">{registrationLimit.reason}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${Math.min(100, (plannedHours / registrationLimit.maxHours) * 100)}%` }}
            />
          </div>
        </div>
        {plannedCourses.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            Select courses from the list below to plan your semester
          </p>
        ) : (
          <div className="space-y-2">
            {plannedCourses.map(c => (
              <div key={c.code} className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 sm:flex-row sm:items-center">
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleSelect(c.code)}
                  className="w-4 h-4 accent-indigo-600 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <CourseIdentity code={c.code} name={c.name} />
                  <p className="text-xs text-slate-500">{c.hours} hrs · Offering: {c.semester}</p>
                </div>
                <select
                  className="h-[38px] w-full rounded-lg border border-slate-300 bg-white px-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:w-40"
                  value={selectedForSemester[c.code] || ''}
                  onChange={(e) => setExpectedGrade(c.code, e.target.value)}
                >
                  <option value="">Expected grade</option>
                  {gradeOptionsFor(c).map(g => (
                    <option key={g.grade} value={g.grade}>{g.label}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-indigo-100 mt-2">
              <p className="text-xs text-slate-500">
                Total: {plannedCourses.reduce((s, c) => s + c.hours, 0)} hrs
              </p>
              <p className="text-sm font-semibold text-indigo-700">
                SGPA: {projectedSGPA.toFixed(3)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Transferred */}
      {transferred.length > 0 && (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-cyan-800">
            <ArrowLeftRight />
            Transferred Courses
          </h3>
          <p className="mb-4 text-sm text-cyan-800">
            Detected from the transcript Case column as TR. These courses count toward program completion but are kept separate from regular attempts.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {transferred.map((course, index) => (
              <div
                key={`${course.code}-${course.term}-${index}`}
                className="rounded-lg border border-cyan-100 bg-white p-3 shadow-sm"
              >
                <CourseIdentity code={course.code} name={course.name} />
                <div className="mt-2 flex items-center justify-between gap-2 text-xs font-medium">
                  <span className="text-slate-500">{course.hours} hrs</span>
                  <span className="rounded bg-cyan-100 px-2 py-0.5 text-cyan-800">
                    Grade: {course.grade} - TR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawn */}
      {withdrawn.length > 0 && (
        <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-fuchsia-800">
            <FileClock />
            Withdrawn Courses
          </h3>
          <p className="mb-4 text-sm text-fuchsia-800">
            W is a withdrawal result, not a failed grade. A withdrawn course can be registered again when its prerequisites and term-hour limit allow it.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {withdrawn.map((course, index) => (
              <div
                key={`${course.code}-${course.term}-${index}`}
                className="rounded-lg border border-fuchsia-100 bg-white p-3 shadow-sm"
              >
                <CourseIdentity code={course.code} name={course.name} />
                <div className="mt-2 flex items-center justify-between gap-2 text-xs font-medium">
                  <span className="text-slate-500">{course.term || 'Term not detected'}</span>
                  <span className="rounded bg-fuchsia-100 px-2 py-0.5 text-fuchsia-800">
                    Grade: W
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed */}
      {failed.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
            <AlertTriangle />
            Failed Courses (Need Retake)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {failed.map(c => (
              <div key={c.code} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                <CourseIdentity code={c.code} name={c.name} />
                <div className="mt-2 flex justify-between text-xs font-medium">
                  <span className="text-slate-500">{c.hours} hrs</span>
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">Grade: {c.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required-course improvements */}
      {sameCourseImprovements.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-amber-700 flex items-center gap-2 mb-4">
            <TrendingUp />
            D-Range Courses (Recommended Improvement)
          </h3>
          <p className="mb-4 text-sm text-amber-800">
            Improvement recommendations focus on previous D-, D, and D+ grades because they provide the strongest GPA benefit.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sameCourseImprovements.map(c => (
              <div key={c.code} className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                <CourseIdentity code={c.code} name={c.name} />
                <div className="mt-2 text-xs font-medium text-slate-500">{c.hours} hrs</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elective replacements */}
      {electiveReplacements.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-violet-700 flex items-center gap-2 mb-2">
            <TrendingUp />
            Elective Replacement Options
          </h3>
          <p className="mb-4 text-sm text-violet-700">
            Choose a different course from the same completed elective list. The old grade is replaced after the new course is completed.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {electiveReplacements.map(option => (
              <div
                key={`${option.groupId}-${option.replacementCourse.code}`}
                className="bg-white p-3 rounded-lg border border-violet-100 shadow-sm"
              >
                <CourseIdentity
                  code={option.replacementCourse.code}
                  name={option.replacementCourse.name}
                />
                <p className="mt-2 text-xs font-medium text-violet-700">
                  Replaces {option.replaces.code} ({option.replaces.grade}) - {option.replacementCourse.hours} hrs
                </p>
                {!isPriorityImprovementGrade(option.replaces.grade) && (
                  <p className="mt-2 flex items-start gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    Allowed, but improving a D-, D, or D+ course first is usually more beneficial.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses with Search & Filter */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <CheckCircle className="text-green-500" />
          Available Courses
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code or course name..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="L0">Level 0</option>
            <option value="L1">Level 1</option>
            <option value="L2">Level 2</option>
            <option value="L3">Level 3</option>
            <option value="L4">Level 4</option>
          </select>
        </div>

        {available.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            {search || filterLevel !== 'all' ? 'No courses match your search.' : 'No courses available right now.'}
          </p>
        ) : (
          <div className="space-y-6">
            {levels.map(level => {
              const levelCourses = available.filter(c => c.level === level);
              if (levelCourses.length === 0) return null;
              
              levelCourses.sort((a, b) => {
                const aRec = (semesterType === 'Fall' && a.semester === 'Semester 1') || (semesterType === 'Spring' && a.semester === 'Semester 2');
                const bRec = (semesterType === 'Fall' && b.semester === 'Semester 1') || (semesterType === 'Spring' && b.semester === 'Semester 2');
                if (aRec && !bRec) return -1;
                if (!aRec && bRec) return 1;
                return 0;
              });
              return (
                <div key={level}>
                  <h4 className="font-bold text-slate-600 mb-3 border-b pb-2 flex items-center gap-2">
                    <BookOpen size={16} />
                    Level {level.replace('L', '')}
                    <span className="text-xs font-normal text-slate-400">({levelCourses.length} courses)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {levelCourses.map(c => {
                      const isSelected = selectedForSemester[c.code] !== undefined;
                      const electiveGroupId = electiveGroupForCode(c.code, studentProgram, studentInfo?.bylawVersion);
                      const electiveQuota = electiveGroupId
                        ? electiveQuotaStatus(
                          electiveGroupId,
                          passedElectiveHours.get(electiveGroupId) ?? 0,
                          plannedElectiveHours.get(electiveGroupId) ?? 0,
                          c.hours,
                        )
                        : null;
                      const exceedsTermLimit = plannedHours + c.hours > registrationLimit.maxHours;
                      const exceedsElectiveQuota = Boolean(
                        rules.enforceElectiveQuotas && electiveQuota && !electiveQuota.allowed,
                      );
                      const isOutOfSeason = !courseOffered(c, semesterType, termKey, planningPreferences);
                      const requiresOverride = isOutOfSeason && !advisorOverrides[c.code];

                      const doesNotFit = !isSelected && (
                        planningPreferences.excluded.includes(c.code) || exceedsTermLimit || exceedsElectiveQuota || requiresOverride
                      );
                      return (
                        <div key={c.code} className={`p-3 rounded-xl border transition-colors ${doesNotFit ? 'cursor-not-allowed bg-slate-50 border-slate-200 ' : 'cursor-pointer'} ${isSelected ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                          onClick={() => toggleSelect(c.code)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(c.code)}
                              className="w-4 h-4 accent-indigo-600 flex-shrink-0 mt-0.5"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CourseIdentity code={c.code} name={c.name} />
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-400">Semester: {c.semester}</p>
                                    {((semesterType === 'Fall' && c.semester === 'Semester 1') || (semesterType === 'Spring' && c.semester === 'Semester 2')) && (
                                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                        Recommended
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ml-2">
                                  {c.hours} hrs
                                </span>
                              </div>
                              {c.unlocksNext && c.unlocksNext.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <p className="text-xs font-medium text-indigo-600">
                                    Unlocks: {c.unlocksNext.join(', ')}
                                  </p>
                                </div>
                              )}
                              {isOutOfSeason && (
                                <div className="mt-2 pt-2 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-start gap-2 bg-amber-50 p-2 rounded border border-amber-100">
                                    <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs text-amber-800 font-medium" dir="rtl">
                                        هذه المادة لا تفتح في هذا الترم. هل لدى الطالب طلب لفتحها؟
                                      </p>
                                      <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={advisorOverrides[c.code] || false}
                                          onChange={(e) => {
                                            setAdvisorOverrides(prev => ({
                                              ...prev,
                                              [c.code]: e.target.checked
                                            }));
                                            if (!e.target.checked && isSelected) {
                                              toggleSelect(c.code);
                                            }
                                          }}
                                          className="w-3.5 h-3.5 accent-amber-600 rounded"
                                        />
                                        <span className="text-xs text-amber-700 font-bold">Advisor Override</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {doesNotFit && !requiresOverride && (
                                <p className="mt-2 text-xs font-medium text-amber-600">
                                  {exceedsElectiveQuota
                                    ? 'This elective list has reached its required-hour quota'
                                    : `Does not fit within the remaining ${registrationLimit.maxHours - plannedHours} hours`}
                                </p>
                              )}
                              {isSelected && (
                                <div className="mt-2 pt-2 border-t border-indigo-200" onClick={(e) => e.stopPropagation()}>
                                  <label className="text-xs text-slate-500 mb-1 block">Expected Grade</label>
                                  <select
                                    className="w-full h-[38px] px-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={selectedForSemester[c.code] || ''}
                                    onChange={(e) => setExpectedGrade(c.code, e.target.value)}
                                  >
                                    <option value="">Select grade</option>
                                    {gradeOptionsFor(c).map(g => (
                                      <option key={g.grade} value={g.grade}>{g.label}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blocked */}
      {blocked.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-600 flex items-center gap-2 mb-4">
            <Lock size={20} />
            Blocked Courses (Missing Prerequisites)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-70">
            {blocked.map(c => (
              <div key={c.code} className="bg-white p-3 rounded-xl border border-slate-200">
                <CourseIdentity code={c.code} name={c.name} />
                <p className="text-xs font-bold text-red-500 mt-2">
                  Requires: {c.missingPrerequisites?.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <GpaImprovement 
        attempts={attempts} 
        semesterType={semesterType}
      />
    </div>
  );
}
