import type { CourseEntry } from '../context/GpaContext';
import { pointsForGrade } from '../data/grades';
import { calculateGPA } from './gpaCalculation';

export interface RegistrationPlanCourse {
  code: string;
  name: string;
  hours: number;
  registrationType: string;
  previousGrade: string;
  expectedGrade: string;
}

export interface RegistrationPlanTerm {
  id: string;
  title: string;
  semesterType: CourseEntry['semesterType'];
  courses: RegistrationPlanCourse[];
  registeredHours: number;
  projectedSgpa: number | null;
  projectedCgpa: number | null;
  continued?: boolean;
}

export interface RegistrationPlanAcademicRecord {
  gpaHours: number;
  passedHours: number;
  previousCgpa: number;
  previousTotalPoints?: number;
}

export const PLAN_ROWS_PER_PAGE = 14;

function registrationType(course: CourseEntry): string {
  if (course.replacementOfCode) return 'Elective replacement';
  if (course.status === 'retaken') return 'Failed retake';
  if (course.status === 'improvement') return 'Improvement';
  if (course.status === 'withdrawn') return 'Withdrawn retry';
  return 'New course';
}

export function buildRegistrationPlanTerms(
  plannedCourses: CourseEntry[],
  academicRecord: RegistrationPlanAcademicRecord = {
    gpaHours: 0,
    passedHours: 0,
    previousCgpa: 0,
  },
): RegistrationPlanTerm[] {
  const grouped = new Map<string, CourseEntry[]>();
  for (const course of plannedCourses) {
    if (!course.code) continue;
    const label = course.semesterLabel || 'Planned Term';
    const existing = grouped.get(label) ?? [];
    existing.push(course);
    grouped.set(label, existing);
  }

  let runningGpaHours = academicRecord.gpaHours;
  let runningPassedHours = academicRecord.passedHours;
  let runningCgpa = academicRecord.previousCgpa;
  let runningTotalPoints = Number.isFinite(academicRecord.previousTotalPoints)
    ? academicRecord.previousTotalPoints ?? 0
    : runningGpaHours * runningCgpa;

  return Array.from(grouped, ([title, courses], termIndex) => {
    let gradedHours = 0;
    let expectedPoints = 0;
    const reportCourses = courses.map(course => {
      const hours = Number(course.hours) || 0;
      const gradePoints = pointsForGrade(course.grade);
      if (course.grade && course.grade !== 'PASS' && gradePoints >= 0) {
        gradedHours += hours;
        expectedPoints += hours * gradePoints;
      }
      return {
        code: course.code,
        name: course.name,
        hours,
        registrationType: registrationType(course),
        previousGrade: course.oldGrade || '-',
        expectedGrade: course.grade || '-',
      };
    });

    const hasExpectedGrades = courses.some(course => Boolean(course.grade));
    const projection = calculateGPA(
      courses,
      String(runningGpaHours),
      String(runningPassedHours),
      String(runningCgpa),
      String(runningTotalPoints),
    );
    runningGpaHours = projection.totalHours;
    runningPassedHours = projection.totalEarned;
    runningTotalPoints = projection.totalPoints;
    runningCgpa = Number(projection.cgpa) || runningCgpa;

    return {
      id: `plan-${termIndex}-${title}`,
      title,
      semesterType: courses[0]?.semesterType ?? 'normal',
      courses: reportCourses,
      registeredHours: reportCourses.reduce(
        (total, course) => total + course.hours,
        0,
      ),
      projectedSgpa: gradedHours > 0 ? expectedPoints / gradedHours : null,
      projectedCgpa: hasExpectedGrades ? Number(projection.cgpa) : null,
    };
  });
}

export function paginateRegistrationPlan(
  terms: RegistrationPlanTerm[],
  rowsPerPage = PLAN_ROWS_PER_PAGE,
): RegistrationPlanTerm[][] {
  if (terms.length === 0) return [];

  const pages: RegistrationPlanTerm[][] = [];
  let currentPage: RegistrationPlanTerm[] = [];
  let availableRows = rowsPerPage;

  const flushPage = () => {
    if (currentPage.length === 0) return;
    pages.push(currentPage);
    currentPage = [];
    availableRows = rowsPerPage;
  };

  for (const term of terms) {
    let offset = 0;
    while (offset < term.courses.length) {
      if (availableRows === 0) flushPage();
      const take = Math.min(availableRows, term.courses.length - offset);
      const courses = term.courses.slice(offset, offset + take);
      currentPage.push({
        ...term,
        id: `${term.id}-${offset}`,
        title: offset > 0 ? `${term.title} (continued)` : term.title,
        courses,
        continued: offset > 0,
      });
      offset += take;
      availableRows -= take;
      if (offset < term.courses.length) flushPage();
    }
  }
  flushPage();
  return pages;
}
