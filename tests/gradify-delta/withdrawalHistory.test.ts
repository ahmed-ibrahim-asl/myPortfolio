import { describe, expect, it } from 'vitest';
import { parseCourses, parseHeader } from '../../components/tools/gradify/delta/services/pdfParser';
import { analyzeTranscript } from '../../components/tools/gradify/delta/services/transcriptAnalysis';
import { detectCourseRegistration, summarizeAcademicHistory, unresolvedFailedCourses } from '../../components/tools/gradify/delta/services/academicHistory';
import { getCourseByCode } from '../../components/tools/gradify/delta/data/curriculum';
import { projectPlannedTerms } from '../../components/tools/gradify/delta/services/planProjection';

// Only the relevant course rows from the reported layout; no student data.
const text = `2024-2025 Spring
MEC 022
Engineering Mechanics (2)
W
3
2
2025-2026 Spring
MEC 022
Engineering Mechanics (2)
F
3
2`;

describe('registration after a historical withdrawal', () => {
  it('keeps Mechanics 2 withdrawn across import and registration without rewriting its F', () => {
    const attempts = parseCourses(text);
    const result = analyzeTranscript(parseHeader(''), attempts);
    expect(attempts.map(row => row.grade)).toEqual(['W', 'F']);
    expect(result.withdrawn).toMatchObject([{ code: 'MEC022', grade: 'W' }]);
    expect(result.failed).toEqual([]);
    expect(unresolvedFailedCourses(attempts)).toEqual([]);
    expect(detectCourseRegistration(getCourseByCode('MEC022')!, attempts, result.bestAttempts))
      .toMatchObject({ status: 'withdrawn', oldGrade: 'W', selectable: true, attemptNumber: 2 });
    expect(summarizeAcademicHistory(attempts).get('MEC022')?.attemptCount).toBe(1);
  });

  it.each([
    { grades: ['W'], remark: '1', count: 0 },
    { grades: ['W', 'F'], remark: '2', count: 1 },
    { grades: ['F', 'W'], remark: '2', count: 1 },
    { grades: ['W', 'W', 'F'], remark: '3', count: 1 },
    { grades: ['F', 'F'], remark: '2', count: 2 },
    { grades: ['F'], remark: '3', count: 3 },
  ])('excludes W from counted attempts for $grades', ({ grades, remark, count }) => {
    const attempts = grades.map(grade => ({ code: 'MEC022', name: 'Mechanics 2', grade, hours: 3, term: '', remark }));
    expect(summarizeAcademicHistory(attempts).get('MEC022')?.attemptCount).toBe(count);
  });

  it.each([
    { grades: ['W'], gpaHours: 0, expectedGrade: 'A', points: 12 },
    { grades: ['W', 'F'], gpaHours: 3, expectedGrade: 'B+', points: 9.9 },
    { grades: ['F', 'W'], gpaHours: 3, expectedGrade: 'B+', points: 9.9 },
    { grades: ['W', 'F', 'F'], gpaHours: 3, expectedGrade: 'C', points: 6 },
  ])('caps the counted attempt and counts GPA hours once after $grades', ({ grades, gpaHours, expectedGrade, points }) => {
    const attempts = grades.map(grade => ({ code: 'MEC022', name: 'Mechanics 2', grade, hours: 3, term: '2025-2026 Spring' }));
    const result = projectPlannedTerms(attempts,
      { passedHours: 0, gpaHours, totalPoints: 0, cgpa: 0 },
      [{ id: 'next', title: 'Next term', semesterType: 'Spring', courses: { MEC022: 'A' } }]);
    expect(result.courses[0]).toMatchObject({ status: 'withdrawn', oldGrade: 'W', grade: expectedGrade });
    expect(result.record).toMatchObject({ gpaHours: 3, passedHours: 3 });
    expect(result.record.totalPoints).toBeCloseTo(points);
    expect(result.record.cgpa).toBeCloseTo(points / 3);
  });

  it('keeps total-registration remarks consistent across projected terms with partial history', () => {
    const attempts = [{ code: 'MEC022', name: 'Mechanics 2', grade: 'W', hours: 3, term: '', remark: '2' }];
    const result = projectPlannedTerms(attempts,
      { passedHours: 0, gpaHours: 3, totalPoints: 0, cgpa: 0 },
      [
        { id: 'one', title: 'First term', semesterType: 'Spring', courses: { MEC022: 'D' } },
        { id: 'two', title: 'Second term', semesterType: 'Spring', courses: { MEC022: 'A' } },
      ]);
    expect(result.courses.map(course => course.retakeCount)).toEqual([2, 3]);
    expect(result.courses[1].grade).toBe('C');
  });

  it('removes historical failed GPA hours when a withdrawn registration earns PASS', () => {
    const result = projectPlannedTerms(parseCourses(text),
      { passedHours: 0, gpaHours: 3, totalPoints: 0, cgpa: 0 },
      [{ id: 'next', title: 'Next term', semesterType: 'Spring', courses: { MEC022: 'PASS' } }]);
    expect(result.record).toMatchObject({ gpaHours: 0, passedHours: 3, totalPoints: 0 });
  });
});
