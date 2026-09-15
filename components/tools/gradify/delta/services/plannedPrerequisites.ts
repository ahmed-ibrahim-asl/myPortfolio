import type { CourseEntry } from '../context/GpaContext';
import { normCode } from '../data/curriculum';
import { isPassingGrade } from '../data/grades';

export function buildPrerequisitePassesBySemester(
  transcriptPassedCodes: Iterable<string>,
  semesterOrder: string[],
  plannedCourses: CourseEntry[],
): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();
  const cumulativePasses = new Set(
    Array.from(transcriptPassedCodes, code => normCode(code)),
  );

  for (const semester of semesterOrder) {
    result.set(semester, new Set(cumulativePasses));
    for (const course of plannedCourses) {
      if (
        course.semesterLabel === semester
        && course.code
        && isPassingGrade(course.grade)
      ) {
        cumulativePasses.add(normCode(course.code));
      }
    }
  }

  return result;
}
