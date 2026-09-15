import { describe, expect, it } from 'vitest';
import type { CourseEntry } from '../../components/tools/gradify/delta/context/GpaContext';
import {
  buildRegistrationPlanTerms,
  paginateRegistrationPlan,
} from '../../components/tools/gradify/delta/services/registrationPlanReport';

function planCourse(
  id: number,
  overrides: Partial<CourseEntry> = {},
): CourseEntry {
  return {
    id,
    code: `ECE${200 + id}`,
    name: `Course ${id}`,
    hours: '3',
    grade: '',
    status: 'new',
    oldGrade: '',
    retakeCount: 1,
    semesterLabel: 'Planned Normal Term',
    semesterType: 'Fall',
    replacementOfCode: '',
    replacementOldHours: '',
    electiveGroupId: '',
    ...overrides,
  };
}

describe('registration plan report', () => {
  it('contains only selected plan courses and calculates the projected SGPA', () => {
    const terms = buildRegistrationPlanTerms([
      planCourse(1, {
        code: 'ECE200',
        name: 'Practical Training for Electronic and Communications Eng. (1)',
        hours: '1',
        grade: 'B',
      }),
      planCourse(2, {
        code: 'ECE221',
        name: 'Signals and Systems',
        grade: 'C',
        status: 'retaken',
        oldGrade: 'F',
        retakeCount: 2,
      }),
      planCourse(3, { code: '' }),
    ], {
      gpaHours: 3,
      passedHours: 0,
      previousCgpa: 0,
      previousTotalPoints: 0,
    });

    expect(terms).toHaveLength(1);
    expect(terms[0].courses).toHaveLength(2);
    expect(terms[0].courses[0].name).toContain('Practical Training');
    expect(terms[0].courses[1]).toMatchObject({
      registrationType: 'Failed retake',
      previousGrade: 'F',
    });
    expect(terms[0].registeredHours).toBe(4);
    expect(terms[0].projectedSgpa).toBeCloseTo(2.25);
    expect(terms[0].projectedCgpa).toBeCloseTo(2.25);
  });

  it('reports both SGPA and running CGPA for every planned term', () => {
    const terms = buildRegistrationPlanTerms([
      planCourse(1, {
        code: 'ECE111',
        grade: 'A',
        semesterLabel: 'Term 1',
      }),
      planCourse(2, {
        code: 'ECE114',
        grade: 'B',
        semesterLabel: 'Term 2',
      }),
    ], {
      gpaHours: 100,
      passedHours: 80,
      previousCgpa: 2,
      previousTotalPoints: 200,
    });

    expect(terms).toHaveLength(2);
    expect(terms[0]).toMatchObject({ projectedSgpa: 4, projectedCgpa: 2.058 });
    expect(terms[1]).toMatchObject({ projectedSgpa: 3, projectedCgpa: 2.085 });
  });

  it('paginates a long plan without dropping course rows', () => {
    const terms = buildRegistrationPlanTerms(
      Array.from({ length: 20 }, (_, index) => planCourse(index + 1)),
    );
    const pages = paginateRegistrationPlan(terms, 8);
    expect(pages).toHaveLength(3);
    expect(
      pages.flatMap(page => page).flatMap(term => term.courses),
    ).toHaveLength(20);
  });
});
