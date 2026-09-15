import type { CourseEntry } from '../context/GpaContext';
import { getCourseByCode, missingPrereqs, normCode, type BylawVersion } from '../data/curriculum';
import { pointsForGrade } from '../data/grades';
import { detectCourseRegistration, type DetectedCourseRegistration } from './academicHistory';
import { calculateGPA } from './gpaCalculation';
import { getBestAttempts, passedCodes, type ParsedCourse } from './pdfParser';
import type { PlannedTerm } from './fullPlanGenerator';
import { allowsGraduationPrerequisitePair } from './registrationPolicy';
import { courseOffered, planningLimit, planningRules, type PlanningPreferences } from './planningPreferences';

export interface ProjectedAcademicRecord {
  passedHours: number;
  gpaHours: number;
  cgpa: number;
  totalPoints: number;
}

export interface PlanProjectionError {
  termId: string;
  code: string;
  missing: string[];
  message: string;
}

export function capExpectedGrade(detection: DetectedCourseRegistration, grade: string): string {
  if (detection.replacement || !['retaken', 'improvement'].includes(detection.status)) return grade;
  const maxGrade = detection.attemptNumber <= 2 ? 'B+' : 'C';
  return pointsForGrade(grade) > pointsForGrade(maxGrade) ? maxGrade : grade;
}

/** Project each term with the exact same arithmetic and course metadata as the manual calculator. */
export function projectPlannedTerms(
  initialAttempts: ParsedCourse[],
  initialRecord: ProjectedAcademicRecord,
  terms: PlannedTerm[],
  program?: string,
  bylawVersion?: BylawVersion,
  totalDegreeHours = bylawVersion === 'Bylaw_2013' ? 173 : 160,
  preferences?: PlanningPreferences,
) {
  let attempts = [...initialAttempts];
  let record = { ...initialRecord };
  const courses: CourseEntry[] = [];
  const errors: PlanProjectionError[] = [];
  const replacedCodes = new Set<string>();

  for (const term of terms) {
    const best = getBestAttempts(attempts);
    const passedBeforeTerm = passedCodes(best);
    const remainingHours = Math.max(0, totalDegreeHours - record.passedHours);
    const limit = planningLimit(record.cgpa, term.semesterType, remainingHours, preferences);
    const termCodes = new Set(Object.keys(term.courses).map(normCode));
    const termCourses: CourseEntry[] = [];
    for (const [rawCode, expectedGrade] of Object.entries(term.courses)) {
      const code = normCode(rawCode);
      const course = getCourseByCode(code, bylawVersion);
      if (!course) {
        errors.push({ termId: term.id, code, missing: [], message: 'Course is not in the selected curriculum.' });
        continue;
      }
      if (preferences && !courseOffered(course, term.semesterType, term.title, preferences)) {
        errors.push({ termId: term.id, code, missing: [], message: 'Excluded or not offered in this term. Review course availability.' });
      }
      const detection = detectCourseRegistration(course, attempts, best, replacedCodes, program);
      if (!detection.selectable) {
        errors.push({ termId: term.id, code, missing: [], message: detection.label });
        continue;
      }
      const missing = missingPrereqs(course, passedBeforeTerm);
      const finalPrerequisite = missing.length === 1 && termCodes.has(normCode(missing[0]))
        ? getCourseByCode(missing[0], bylawVersion) : undefined;
      const finalPairAllowed = finalPrerequisite && allowsGraduationPrerequisitePair({
        isGraduationTerm: limit.isGraduationTerm,
        remainingHours,
        prerequisiteCode: finalPrerequisite.code,
        prerequisiteHours: finalPrerequisite.hours,
        dependentHours: course.hours,
        missingPrerequisites: missing,
      });
      if (planningRules(preferences).enforcePrerequisites && missing.length && !finalPairAllowed) errors.push({ termId: term.id, code, missing, message: `Requires ${missing.join(', ')}` });
      const entry: CourseEntry = {
        id: courses.length + termCourses.length + 1,
        code,
        name: course.name,
        hours: String(course.hours),
        grade: capExpectedGrade(detection, expectedGrade),
        status: detection.status === 'completed' ? 'new' : detection.status,
        oldGrade: detection.oldGrade,
        retakeCount: detection.attemptNumber,
        semesterLabel: term.title,
        semesterType: term.semesterType,
        replacementOfCode: detection.replacement ? normCode(detection.replacement.replaces.code) : '',
        replacementOldHours: detection.replacement ? String(detection.replacement.replaces.hours) : '',
        electiveGroupId: detection.replacement?.groupId ?? '',
      };
      if (entry.replacementOfCode) replacedCodes.add(entry.replacementOfCode);
      termCourses.push(entry);
    }
    if (termCourses.length === 0) continue;
    const registeredHours = termCourses.reduce((sum, course) => sum + Number(course.hours), 0);
    if (registeredHours > limit.maxHours) errors.push({ termId: term.id, code: '', missing: [], message: `Selected courses exceed the ${limit.maxHours}-hour limit.` });
    const projection = calculateGPA(termCourses, String(record.gpaHours), String(record.passedHours), String(record.cgpa), String(record.totalPoints));
    record = {
      passedHours: projection.totalEarned,
      gpaHours: projection.totalHours,
      totalPoints: projection.totalPoints,
      cgpa: projection.totalHours > 0 ? projection.totalPoints / projection.totalHours : 0,
    };
    courses.push(...termCourses);
    attempts = [...attempts, ...termCourses.filter(course => course.grade && pointsForGrade(course.grade) >= 0).map(course => ({
      code: course.code,
      name: course.name,
      term: term.title,
      grade: course.grade,
      hours: Number(course.hours),
      remark: String(course.retakeCount),
    }))];
  }
  return { record, attempts, bestAttempts: getBestAttempts(attempts), courses, errors };
}
