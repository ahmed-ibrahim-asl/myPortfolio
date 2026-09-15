import { useMemo } from 'react';
import { Trash2, RotateCcw, TrendingUp, Minus, Sparkles, GraduationCap } from 'lucide-react';
import { type CourseEntry, useGpa } from '../context/GpaContext';
import CourseSelect from './CourseSelect';
import { gradeScale, pointsForGrade } from '../data/grades';
import { getCourseByCode, normCode, type Course } from '../data/curriculum';
import { getProgramCourses, remainingCourses } from '../services/pdfParser';
import {
  electiveReplacementOptions,
  historyForCourse,
  sameCourseImprovementCandidates,
  unresolvedFailedCourses,
} from '../services/academicHistory';
import { allowsGraduationPrerequisitePair } from '../services/registrationPolicy';

export { gradeScale };

interface Props {
  course: CourseEntry;
  registeredHours: number;
  maxHours: number;
  isGraduationTerm: boolean;
  remainingDegreeHours: number;
}

export default function CourseRow({
  course,
  registeredHours,
  maxHours,
  isGraduationTerm,
  remainingDegreeHours,
}: Props) {
  const {
    updateCourse,
    removeCourse,
    courses,
    rawAttempts,
    bestAttempts,
    selectedProgram,
    studentInfo,
  } = useGpa();

  const isRetake = course.status === 'retaken' || course.status === 'improvement';
  const isElectiveReplacement = Boolean(course.replacementOfCode);
  const attemptNum = parseInt(String(course.retakeCount)) || 1;

  const oldGradePoints = pointsForGrade(course.oldGrade);

  // Retake grade cap: 2nd attempt max B+, 3rd+ attempt max C
  const maxRetakeGrade = isRetake && !isElectiveReplacement
    ? (attemptNum <= 2 ? 'B+' : 'C')
    : null;
  const maxRetakePoints = maxRetakeGrade ? (gradeScale.find(g => g.grade === maxRetakeGrade)?.points ?? 4.0) : 4.0;

  const retakeGradeOptions = gradeScale.filter(g => {
    if (g.grade === 'PASS' || g.grade === 'FAIL') return false;
    if (!isRetake || isElectiveReplacement) {
      return true;
    }
    return g.points <= maxRetakePoints;
  });

  const betterGrades = retakeGradeOptions.filter(g =>
    g.grade !== 'F' && pointsForGrade(g.grade) > oldGradePoints
  );
  const allPassGrades = gradeScale.filter(g =>
    g.grade !== 'PASS' && g.grade !== 'FAIL' && g.grade !== 'F'
  );

  const selectedElsewhere = useMemo(() => new Set(
    courses
      .filter(item => item.id !== course.id && item.code)
      .map(item => normCode(item.code)),
  ), [courses, course.id]);

  const selectedInSameTerm = useMemo(
    () => courses.filter(item =>
      item.id !== course.id
      && item.semesterLabel === course.semesterLabel
      && item.code
    ),
    [course.id, course.semesterLabel, courses],
  );

  const excludedReplacementCodes = useMemo(() => new Set(
    courses
      .filter(item => item.id !== course.id && item.replacementOfCode)
      .map(item => normCode(item.replacementOfCode)),
  ), [courses, course.id]);

  const replacementOptions = useMemo(
    () => electiveReplacementOptions(bestAttempts, excludedReplacementCodes, selectedProgram, studentInfo?.bylawVersion),
    [bestAttempts, excludedReplacementCodes, selectedProgram, studentInfo?.bylawVersion],
  );

  const replacementByCode = useMemo(() => new Map(
    replacementOptions.map(option => [normCode(option.replacementCourse.code), option]),
  ), [replacementOptions]);

  const candidateCourses = useMemo((): Course[] => {
    let candidates: Course[];
    if (rawAttempts.length === 0) {
      candidates = getProgramCourses(selectedProgram);
    } else if (course.status === 'retaken') {
      candidates = unresolvedFailedCourses(rawAttempts);
    } else if (course.status === 'improvement') {
      candidates = [
        ...sameCourseImprovementCandidates(rawAttempts, selectedProgram),
        ...replacementOptions.map(option => option.replacementCourse),
      ];
    } else {
      const degreeCourses = remainingCourses(bestAttempts, selectedProgram);
      candidates = degreeCourses
        .filter(item => {
          if (item.status === 'available') return true;
          if (!isGraduationTerm || selectedInSameTerm.length !== 1) return false;
          const selectedPrerequisite = selectedInSameTerm[0];
          const missing = item.missingPrerequisites ?? [];
          return allowsGraduationPrerequisitePair({
            isGraduationTerm,
            remainingHours: remainingDegreeHours,
            prerequisiteCode: selectedPrerequisite.code,
            prerequisiteHours: parseFloat(selectedPrerequisite.hours) || 0,
            dependentHours: item.hours,
            missingPrerequisites: missing,
          });
        })
        .map(item => getCourseByCode(item.code, studentInfo?.bylawVersion))
        .filter((item): item is Course => Boolean(item));
    }

    const unique = new Map<string, Course>();
    for (const candidate of candidates) {
      const normalized = normCode(candidate.code);
      if (selectedElsewhere.has(normalized)) continue;
      unique.set(normalized, candidate);
    }
    return Array.from(unique.values());
  }, [
    bestAttempts,
    course.status,
    rawAttempts,
    replacementOptions,
    selectedElsewhere,
    isGraduationTerm,
    remainingDegreeHours,
    selectedInSameTerm,
    selectedProgram,
  ]);

  const isGraduationChainSelection = useMemo(() => {
    if (!isGraduationTerm || !course.code || selectedInSameTerm.length !== 1) return false;
    const selected = remainingCourses(bestAttempts, selectedProgram)
      .find(item => normCode(item.code) === normCode(course.code));
    const missing = selected?.missingPrerequisites ?? [];
    return missing.length === 1
      && normCode(missing[0]) === normCode(selectedInSameTerm[0].code);
  }, [
    bestAttempts,
    course.code,
    isGraduationTerm,
    selectedInSameTerm,
    selectedProgram,
  ]);

  const resetCourseSelection = (nextStatus = course.status) => {
    updateCourse(course.id, 'code', '');
    updateCourse(course.id, 'name', '');
    updateCourse(course.id, 'hours', '');
    updateCourse(course.id, 'grade', '');
    updateCourse(course.id, 'oldGrade', '');
    updateCourse(course.id, 'retakeCount', nextStatus === 'new' ? '1' : '2');
    updateCourse(course.id, 'replacementOfCode', '');
    updateCourse(course.id, 'replacementOldHours', '');
    updateCourse(course.id, 'electiveGroupId', '');
  };

  const applyCourseSelection = (code: string, name: string, hours: number) => {
    updateCourse(course.id, 'code', code);
    updateCourse(course.id, 'name', name);
    updateCourse(course.id, 'hours', String(hours));
    updateCourse(course.id, 'replacementOfCode', '');
    updateCourse(course.id, 'replacementOldHours', '');
    updateCourse(course.id, 'electiveGroupId', '');

    const history = historyForCourse(rawAttempts, code);
    if (course.status === 'retaken' && history) {
      updateCourse(course.id, 'oldGrade', history.latest.grade);
      updateCourse(course.id, 'retakeCount', String(history.attemptCount + 1));
      return;
    }

    if (course.status === 'improvement') {
      const replacement = replacementByCode.get(normCode(code));
      if (replacement) {
        updateCourse(course.id, 'oldGrade', replacement.replaces.grade);
        updateCourse(course.id, 'retakeCount', '1');
        updateCourse(course.id, 'replacementOfCode', normCode(replacement.replaces.code));
        updateCourse(course.id, 'replacementOldHours', String(replacement.replaces.hours));
        updateCourse(course.id, 'electiveGroupId', replacement.groupId);
      } else if (history) {
        updateCourse(course.id, 'oldGrade', history.best.grade);
        updateCourse(course.id, 'retakeCount', String(history.attemptCount + 1));
      }
    }
  };

  const disabledReason = (candidate: Course) => {
    const currentHours = parseFloat(course.hours) || 0;
    const projectedHours = registeredHours - currentHours + candidate.hours;
    return projectedHours > maxHours
      ? `Would exceed ${maxHours} hrs`
      : null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      {/* Choose the registration type first so the course list can be relevant. */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-slate-500 mb-1">Registration type</label>
          <select
            aria-label="Registration type"
            className="w-full h-[42px] p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            value={course.status}
            onChange={(e) => {
              updateCourse(course.id, 'status', e.target.value);
              resetCourseSelection(e.target.value as CourseEntry['status']);
            }}
          >
            <option value="new">New course</option>
            <option value="retaken">Failed course retake</option>
            <option value="improvement">Improvement</option>
          </select>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Course
            {rawAttempts.length > 0 && (
              <span className="ml-2 font-normal text-indigo-500">{candidateCourses.length} eligible</span>
            )}
          </label>
          <CourseSelect
            value={course.code}
            onChange={applyCourseSelection}
            courses={candidateCourses}
            disabledReason={disabledReason}
            placeholder={
              course.status === 'retaken'
                ? 'Select from failed courses...'
                : course.status === 'improvement'
                  ? 'Select an eligible improvement...'
                  : 'Select an available new course...'
            }
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">Hours</label>
          <input
            aria-label="Course hours"
            type="number"
            min="0"
            max="6"
            placeholder="hrs"
            className="w-full h-[42px] p-2.5 border border-slate-300 rounded-lg outline-none text-sm text-center bg-slate-50"
            value={course.hours}
            readOnly
          />
        </div>

        <div className="sm:col-span-1 flex justify-center sm:pt-5">
          <button
            onClick={() => removeCourse(course.id)}
            className="min-w-[42px] min-h-[42px] p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent"
            title="Remove course"
            aria-label="Remove course"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {isElectiveReplacement && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800">
          <Sparkles size={15} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Elective replacement</p>
            <p>
              {course.code} replaces {course.replacementOfCode} ({course.oldGrade}) in the same elective list.
              Degree hours stay unchanged.
            </p>
          </div>
        </div>
      )}

      {isGraduationChainSelection && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <GraduationCap size={15} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Final-course prerequisite allowance</p>
            <p>
              {course.code} is being taken with its prerequisite {selectedInSameTerm[0].code}.
              This exception is available only because the pair completes the remaining degree hours.
            </p>
          </div>
        </div>
      )}

      {/* Row 2: Retake details */}
      {isRetake && (
        <div className="mt-3 grid grid-cols-1 items-start gap-x-3 gap-y-2 border-t border-slate-100 pt-3 sm:grid-cols-12">
          <div className="sm:col-span-2">
            <label className="mb-1 flex min-h-0 items-center gap-1 text-xs text-slate-500 sm:min-h-5">
              <RotateCcw size={12} />
              {isElectiveReplacement ? 'New attempt' : 'Attempt'}
            </label>
            <select
              aria-label="Attempt number"
              className="h-[42px] w-full rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={course.retakeCount}
              onChange={(e) => updateCourse(course.id, 'retakeCount', e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>
                  {n === 1 ? 'First time' : `Attempt ${n}`}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="mb-1 block min-h-0 text-xs text-slate-500 sm:min-h-5">
              {isElectiveReplacement
                ? `Grade being replaced (${course.replacementOfCode})`
                : `Previous grade · Attempt ${Math.max(1, attemptNum - 1)}`}
            </label>
            <select
              aria-label="Previous grade"
              className="w-full h-[42px] p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              value={course.oldGrade}
              onChange={(e) => updateCourse(course.id, 'oldGrade', e.target.value)}
            >
              <option value="">Select grade</option>
              {allPassGrades.map(g => (
                <option key={`old-${g.grade}`} value={g.grade}>{g.label}</option>
              ))}
              <option value="F">F (0-60) Fail</option>
            </select>
          </div>
          <div className="sm:col-span-4">
            <label className="mb-1 block min-h-0 text-xs text-slate-500 sm:min-h-5">
              {isElectiveReplacement ? 'Expected replacement grade' : `Expected grade · Attempt ${attemptNum}`}
            </label>
            <select
              aria-label="Expected retake grade"
              className="w-full h-[42px] p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              value={course.grade}
              onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
            >
              <option value="" disabled>Select grade</option>
              {retakeGradeOptions.map(g => (
                <option key={g.grade} value={g.grade}>{g.label}</option>
              ))}
            </select>

            {course.oldGrade && (
              <div className="mt-1.5 flex items-center gap-1.5">
                {maxRetakeGrade && <span className="text-xs text-slate-400 font-medium">Max: {maxRetakeGrade}</span>}
                {betterGrades.length > 0 ? (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <TrendingUp size={12} />
                    {betterGrades.length} grades higher than {course.oldGrade}
                  </span>
                ) : (
                  <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                    <Minus size={12} />
                    No grade higher than {course.oldGrade}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <div className="mb-1 hidden min-h-5 sm:block" aria-hidden="true" />
            {(() => {
              const impact = course.oldGrade && course.grade ? getGradeImpact(course.oldGrade, course.grade) : null;
              const impactStyles: Record<string, string> = {
                up: 'bg-green-100 border-green-400 text-green-800',
                down: 'bg-red-100 border-red-400 text-red-800',
                same: 'bg-slate-100 border-slate-300 text-slate-600',
              };
              const impactLabels: Record<string, string> = {
                up: 'Improved ↑',
                down: 'Dropped ↓',
                same: 'No change',
              };
              const cls = impact ? impactStyles[impact] : 'bg-slate-50 border-slate-200 text-slate-400';
              return (
                <div className={`${cls} border rounded-lg min-h-[42px] flex items-center justify-center px-2 py-1`}>
                  {course.oldGrade && course.grade ? (
                    <div className="text-center">
                      <p className="font-bold text-sm">{impactLabels[impact!]}</p>
                      {oldGradePoints >= 0 && pointsForGrade(course.grade) >= 0 && (
                        <p className="text-xs font-semibold mt-0.5">
                          {pointsForGrade(course.grade).toFixed(1)} vs {oldGradePoints.toFixed(1)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs">Choose grades</p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Row 2 (alt): New course */}
      {!isRetake && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Expected Grade</label>
            <select
              aria-label="Expected grade"
              className="w-full h-[42px] p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              value={course.grade}
              onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
            >
              <option value="" disabled>Select grade</option>
              {gradeScale.map(g => (
                <option key={g.grade} value={g.grade}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function getGradeImpact(oldGrade: string, newGrade: string): 'up' | 'down' | 'same' {
  const old = pointsForGrade(oldGrade);
  const now = pointsForGrade(newGrade);
  if (now > old) return 'up';
  if (now < old) return 'down';
  return 'same';
}
