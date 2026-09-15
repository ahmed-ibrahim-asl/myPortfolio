import { describe, it, expect } from 'vitest';
import { calculateGPA as calculateAppGPA } from '../../components/tools/gradify/delta/components/ResultsPanel';
import { formatTermLabel } from '../../components/tools/gradify/delta/services/pdfParser';
import { roundGpa } from '../../components/tools/gradify/delta/data/grades';
import type { CourseEntry } from '../../components/tools/gradify/delta/context/GpaContext';

// Inline GPA calc to test independently of React (mirrors ResultsPanel logic)
function calculateGPA(courses: { hours: number; grade: string; status: string; oldGrade: string }[], prevGPAHours: number, prevCGPA: number) {
  let currentTotalPoints = 0;
  let currentTotalHoursForGPA = 0;
  let cumulativeHoursAdjustments = 0;
  let cumulativePointsAdjustments = 0;

  const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0, 'PASS': 0.0, 'FAIL': 0.0,
  };

  for (const course of courses) {
    const hours = course.hours;
    const points = gradePoints[course.grade] || 0;
    const isRepeat = course.status === 'retaken' || course.status === 'improvement';

    if (course.grade !== 'PASS') {
      currentTotalHoursForGPA += hours;
      currentTotalPoints += hours * points;

      if (isRepeat) {
        cumulativeHoursAdjustments += hours;
      }
      if (isRepeat && course.oldGrade) {
        const oldPoints = gradePoints[course.oldGrade] || 0;
        cumulativePointsAdjustments += hours * oldPoints;
      }
    }
  }

  const semesterGPA = currentTotalHoursForGPA > 0 ? currentTotalPoints / currentTotalHoursForGPA : 0;
  const finalTotalPoints = prevGPAHours * prevCGPA + currentTotalPoints - cumulativePointsAdjustments;
  const finalTotalHours = prevGPAHours + currentTotalHoursForGPA - cumulativeHoursAdjustments;
  const cgpa = finalTotalHours > 0 ? finalTotalPoints / finalTotalHours : 0;

  return { semesterGPA: Math.round(semesterGPA * 1000) / 1000, cgpa: Math.round(cgpa * 1000) / 1000 };
}

describe('GPA calculation', () => {
  it('calculates semester GPA correctly', () => {
    const result = calculateGPA(
      [{ hours: 3, grade: 'A', status: 'new', oldGrade: '' }],
      0, 0
    );
    expect(result.semesterGPA).toBe(4.0);
    expect(result.cgpa).toBe(4.0);
  });

  it('handles multiple courses', () => {
    const result = calculateGPA(
      [
        { hours: 3, grade: 'A', status: 'new', oldGrade: '' },
        { hours: 2, grade: 'B+', status: 'new', oldGrade: '' },
      ],
      0, 0
    );
    // (3*4.0 + 2*3.3) / 5 = (12 + 6.6) / 5 = 18.6 / 5 = 3.72
    expect(result.semesterGPA).toBe(3.72);
  });

  it('combines with previous CGPA', () => {
    const result = calculateGPA(
      [{ hours: 3, grade: 'A', status: 'new', oldGrade: '' }],
      100, 2.0
    );
    // prev: 100 * 2.0 = 200 points
    // new: 3 * 4.0 = 12 points
    // total: 212 / 103 = 2.058
    expect(result.cgpa).toBe(2.058);
  });

  it('handles retaken course (hours not double-counted)', () => {
    const result = calculateGPA(
      [{ hours: 3, grade: 'A', status: 'retaken', oldGrade: '' }],
      100, 2.0
    );
    // prev: 100 * 2.0 = 200 points (old F = 0 pts already included)
    // new: 3 * 4.0 = 12 points
    // old points removed: 0 (F, no oldGrade set)
    // hrs: 100 + 3 - 3 = 100
    // pts: 200 + 12 - 0 = 212
    // cgpa: 212 / 100 = 2.12
    expect(result.cgpa).toBe(2.12);
  });

  it('retaken with oldGrade subtracts old points', () => {
    const result = calculateGPA(
      [{ hours: 3, grade: 'A', status: 'retaken', oldGrade: 'D' }],
      100, 2.0
    );
    // prev: 100 * 2.0 = 200 pts (D's 3 pts included)
    // new: 3 * 4.0 = 12 pts
    // old points removed: 3 * 1.0 = 3
    // hrs: 100 + 3 - 3 = 100
    // pts: 200 + 12 - 3 = 209
    // cgpa: 209 / 100 = 2.09
    expect(result.cgpa).toBe(2.09);
  });

  it('handles improvement course (subtract old grade)', () => {
    const result = calculateGPA(
      [{ hours: 3, grade: 'A', status: 'improvement', oldGrade: 'D' }],
      100, 2.0
    );
    // prev: 200 points, 100 hrs
    // new: +12 points (A), add 3 hrs, then subtract 3 hrs (adjustment)
    // old: -3 points (D = 1.0 * 3)
    // total hrs: 100 + 3 - 3 = 100
    // total points: 200 + 12 - 3 = 209
    // cgpa: 209 / 100 = 2.09
    expect(result.cgpa).toBe(2.09);
  });

  it('PASS grade does not affect GPA', () => {
    const result = calculateGPA(
      [{ hours: 2, grade: 'PASS', status: 'new', oldGrade: '' }],
      0, 0
    );
    expect(result.semesterGPA).toBe(0);
    expect(result.cgpa).toBe(0);
  });

  it('F grade adds hours but zero points', () => {
    const result = calculateGPA(
      [{ hours: 3, grade: 'F', status: 'new', oldGrade: '' }],
      0, 0
    );
    expect(result.semesterGPA).toBe(0);
  });

  it('CGPA correct with multiple retakes (ChatGPT scenario)', () => {
    const result = calculateGPA(
      [
        { hours: 3, grade: 'B', status: 'improvement', oldGrade: 'D' },  // old: 3, new: 9
        { hours: 3, grade: 'A', status: 'improvement', oldGrade: 'C' },  // old: 6, new: 12
        { hours: 3, grade: 'B+', status: 'retaken', oldGrade: 'F' },     // old: 0, new: 9.9
        { hours: 3, grade: 'C+', status: 'improvement', oldGrade: 'D' }, // old: 3, new: 6.9
      ],
      160, 1.861875
    );
    // prev: 160 * 1.861875 = 297.9 pts
    // new points: 9 + 12 + 9.9 + 6.9 = 37.8
    // old points removed: 3 + 6 + 0 + 3 = 12
    // final pts: 297.9 + 37.8 - 12 = 323.7
    // hrs: 160 + 12 - 12 = 160
    // cgpa: 323.7 / 160 = 2.023
    expect(result.cgpa).toBe(2.023);
  });

  it('uses exact transcript points instead of rebuilding them from rounded CGPA', () => {
    const courses: CourseEntry[] = [
      {
        id: 1,
        code: 'GEN002',
        name: 'English Language I',
        hours: '2',
        grade: 'C',
        status: 'retaken',
        oldGrade: 'F',
        retakeCount: 2,
        semesterLabel: '2020-2021 Summer',
        semesterType: 'Summer',
        replacementOfCode: '',
        replacementOldHours: '2',
        electiveGroupId: '',
      },
      {
        id: 2,
        code: 'MEC021',
        name: 'Engineering Mechanics (1)',
        hours: '3',
        grade: 'C+',
        status: 'retaken',
        oldGrade: 'F',
        retakeCount: 2,
        semesterLabel: '2020-2021 Summer',
        semesterType: 'Summer',
        replacementOfCode: '',
        replacementOldHours: '3',
        electiveGroupId: '',
      },
    ];

    const result = calculateAppGPA(courses, '22', '11', '0.759', '16.7');
    expect(result.semesterGPA).toBe('2.180');
    expect(result.cgpa).toBe('1.255');
    expect(result.totalPoints).toBeCloseTo(27.6);
    expect(result.totalHours).toBe(22);
  });

  it('formats academic year and season without duplicated labels', () => {
    expect(formatTermLabel('2025-2026 Fall')).toBe('25/26 F');
    expect(formatTermLabel('2025-2026 Spring')).toBe('25/26 Sp');
    expect(formatTermLabel('2025-2026 Summer')).toBe('25/26 Su');
  });

  it('rounds a half-thousandth the same way as the university transcript', () => {
    expect(roundGpa(128.6 / 80)).toBe(1.608);
  });
});
