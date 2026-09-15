import {
  COURSES,
  ELECTIVE_GROUPS,
  electiveGroupForCode,
  electiveGroupIdsForProgram,
  getCourseByCode,
  getElectiveGroup,
  normCode,
  type Course,
  type ElectiveGroupId,
  type ProgramId,
  type BylawVersion,
} from '../data/curriculum';
import {
  electiveImprovementGrades,
  gradeRank,
  isPassingGrade,
  isPriorityImprovementGrade,
} from '../data/grades';
import type { ParsedCourse } from './pdfParser';

export interface CourseHistorySummary {
  code: string;
  attempts: ParsedCourse[];
  latest: ParsedCourse;
  best: ParsedCourse;
  attemptCount: number;
  passed: boolean;
}

export interface ElectiveReplacement {
  replacementCourse: Course;
  replaces: ParsedCourse;
  groupId: ElectiveGroupId;
}

export type DetectedRegistrationStatus =
  | 'new'
  | 'retaken'
  | 'improvement'
  | 'withdrawn'
  | 'transferred'
  | 'completed';

export interface DetectedCourseRegistration {
  status: DetectedRegistrationStatus;
  selectable: boolean;
  label: string;
  oldGrade: string;
  attemptNumber: number;
  replacement?: ElectiveReplacement;
}

export function summarizeAcademicHistory(
  attempts: ParsedCourse[],
): Map<string, CourseHistorySummary> {
  const byCode = new Map<string, ParsedCourse[]>();
  for (const attempt of attempts) {
    const code = normCode(attempt.code);
    const existing = byCode.get(code) ?? [];
    existing.push(attempt);
    byCode.set(code, existing);
  }

  const summaries = new Map<string, CourseHistorySummary>();
  for (const [code, courseAttempts] of byCode) {
    const latest = courseAttempts[courseAttempts.length - 1];
    const best = courseAttempts.reduce((currentBest, candidate) => {
      return gradeRank(candidate.grade) >= gradeRank(currentBest.grade)
        ? candidate
        : currentBest;
    });
    const maxRemark = Math.max(
      ...courseAttempts.map(a => parseInt(a.remark || '0', 10) || 0)
    );
    const attemptCount = Math.max(courseAttempts.length, maxRemark);
    
    summaries.set(code, {
      code,
      attempts: courseAttempts,
      latest,
      best,
      attemptCount,
      passed: isPassingGrade(best.grade),
    });
  }
  return summaries;
}

export function unresolvedFailedCourses(attempts: ParsedCourse[]): Course[] {
  const summaries = summarizeAcademicHistory(attempts);
  return Array.from(summaries.values())
    .filter(summary => !summary.passed && ['F', 'FAIL'].includes(summary.latest.grade))
    .map(summary => getCourseByCode(summary.code))
    .filter((course): course is Course => Boolean(course));
}

export function sameCourseImprovementCandidates(
  attempts: ParsedCourse[],
  program?: ProgramId | string,
  bylawVersion?: BylawVersion
): Course[] {
  return Array.from(summarizeAcademicHistory(attempts).values())
    .filter(summary => 
      summary.passed
      && isPriorityImprovementGrade(summary.best.grade)
      && summary.best.hours > 0
      && !electiveGroupForCode(summary.code, program, bylawVersion)
      && summary.best.case?.toUpperCase() !== 'TR'
    )
    .sort((a, b) => gradeRank(a.best.grade) - gradeRank(b.best.grade))
    .map(summary => getCourseByCode(summary.code, bylawVersion))
    .filter((course): course is Course => Boolean(course));
}

export function electiveReplacementOptions(
  bestAttempts: ParsedCourse[],
  excludedReplacementCodes: Set<string> = new Set(),
  program?: ProgramId | string,
  bylawVersion?: BylawVersion
): ElectiveReplacement[] {
  const passedByCode = new Map(
    bestAttempts
      .filter(attempt => isPassingGrade(attempt.grade))
      .map(attempt => [normCode(attempt.code), attempt]),
  );
  const options: ElectiveReplacement[] = [];

  const groupEntries: { groupId: string, group: { label: string, requiredHours: number, codes: readonly string[] } }[] = program
    ? electiveGroupIdsForProgram(program, bylawVersion)
        .map(groupId => ({ groupId, group: getElectiveGroup(groupId, bylawVersion) }))
        .filter(entry => Boolean(entry.group)) as any
    : Object.entries(ELECTIVE_GROUPS).map(([groupId, group]) => ({ groupId, group }));

  for (const { groupId: rawGroupId, group } of groupEntries) {
    const groupId = rawGroupId as ElectiveGroupId;
    const passedInGroup = group.codes
      .map(code => passedByCode.get(normCode(code)))
      .filter((attempt): attempt is ParsedCourse => Boolean(attempt));
    const passedHours = passedInGroup.reduce((total, attempt) => total + attempt.hours, 0);
    if (passedHours < group.requiredHours) continue;

    const replaceable = passedInGroup
      .filter(attempt => electiveImprovementGrades.has(attempt.grade))
      .filter(attempt => attempt.case?.toUpperCase() !== 'TR')
      .filter(attempt => !excludedReplacementCodes.has(normCode(attempt.code)))
      .sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade));
    if (replaceable.length === 0) continue;

    for (const code of group.codes) {
      const normalized = normCode(code);
      if (passedByCode.has(normalized)) continue;
      const replacementCourse = getCourseByCode(normalized);
      if (!replacementCourse) continue;
      options.push({
        replacementCourse,
        replaces: replaceable[0],
        groupId,
      });
    }
  }
  return options;
}

/**
 * Detects registration intent from transcript history so students never need
 * to choose New / Failed / Improvement themselves.
 */
export function detectCourseRegistration(
  course: Course,
  attempts: ParsedCourse[],
  bestAttempts: ParsedCourse[],
  excludedReplacementCodes: Set<string> = new Set(),
  program?: ProgramId | string,
): DetectedCourseRegistration {
  const code = normCode(course.code);
  const summary = summarizeAcademicHistory(attempts).get(code);
  const replacement = electiveReplacementOptions(
    bestAttempts,
    excludedReplacementCodes,
    program,
  ).find(option => normCode(option.replacementCourse.code) === code);
  const transferredOnly = Boolean(
    summary
    && summary.attempts.every(attempt => attempt.case?.toUpperCase() === 'TR'),
  );

  if (replacement) {
    return {
      status: 'improvement',
      selectable: true,
      label: `Replaces ${normCode(replacement.replaces.code)} (${replacement.replaces.grade})`,
      oldGrade: replacement.replaces.grade,
      attemptNumber: 1,
      replacement,
    };
  }

  if (transferredOnly && summary) {
    return {
      status: 'transferred',
      selectable: false,
      label: `Transferred - ${summary.best.grade}`,
      oldGrade: summary.best.grade,
      attemptNumber: summary.attemptCount,
    };
  }

  if (summary && !summary.passed && ['F', 'FAIL'].includes(summary.latest.grade)) {
    return {
      status: 'retaken',
      selectable: true,
      label: `Failed course - Attempt ${summary.attemptCount + 1}`,
      oldGrade: summary.latest.grade,
      attemptNumber: summary.attemptCount + 1,
    };
  }

  if (summary && !summary.passed && summary.latest.grade === 'W') {
    return {
      status: 'withdrawn',
      selectable: true,
      label: 'Withdrawn - Register again',
      oldGrade: 'W',
      attemptNumber: summary.attemptCount + 1,
    };
  }

  if (
    summary?.passed
    && isPriorityImprovementGrade(summary.best.grade)
    && summary.best.hours > 0
    && !electiveGroupForCode(code, program)
    && summary.best.case?.toUpperCase() !== 'TR'
  ) {
    return {
      status: 'improvement',
      selectable: true,
      label: `Improve previous ${summary.best.grade}`,
      oldGrade: summary.best.grade,
      attemptNumber: summary.attemptCount + 1,
    };
  }

  if (summary?.passed) {
    return {
      status: 'completed',
      selectable: false,
      label: `Completed - ${summary.best.grade}`,
      oldGrade: summary.best.grade,
      attemptNumber: summary.attemptCount,
    };
  }

  return {
    status: 'new',
    selectable: true,
    label: 'New course',
    oldGrade: '',
    attemptNumber: 1,
  };
}

export function historyForCourse(
  attempts: ParsedCourse[],
  code: string,
): CourseHistorySummary | undefined {
  return summarizeAcademicHistory(attempts).get(normCode(code));
}

export function unattemptedCourses(attempts: ParsedCourse[]): Course[] {
  const attempted = new Set(attempts.map(attempt => normCode(attempt.code)));
  return COURSES.filter(course => !attempted.has(normCode(course.code)));
}

export function electiveGroupLabel(code: string): string | null {
  const groupId = electiveGroupForCode(code);
  return groupId ? ELECTIVE_GROUPS[groupId].label : null;
}
