import { describe, expect, it } from 'vitest';
import { calculateSemester, calculateTarget, gradeForPercent, validateProfile } from '../../lib/tools/gradify/calculator';
import type { UniversityProfile } from '../../lib/tools/gradify/universities';

const profile: UniversityProfile = {
  id: 'fixture', name: 'Test scale', arabicName: '', status: 'custom', sourceUrl: '', note: '', maxGpa: 4,
  grades: [{ grade: 'A', points: 4, minPercent: 90 }, { grade: 'B', points: 3, minPercent: 80 }, { grade: 'F', points: 0, minPercent: 0 }],
};
const row = (hours: string, grade: string) => ({ id: `${hours}-${grade}`, name: '', hours, grade });

describe('weighted semester and cumulative GPA', () => {
  it('weights by credits and includes failed credits in the denominator', () => {
    const result = calculateSemester([row('3', 'A'), row('2', 'B'), row('1', 'F')], profile, '2.5', '30');
    expect(result.errors).toEqual([]);
    expect(result.hours).toBe(6);
    expect(result.qualityPoints).toBe(18);
    expect(result.gpa).toBe(3);
    expect(result.cgpa).toBeCloseTo(2.5833333333);
  });
  it('does not show a fabricated zero for empty rows', () => {
    expect(calculateSemester([row('', '')], profile, '', '').gpa).toBeNull();
  });
  it.each([row('-1', 'A'), row('NaN', 'A'), row('3', 'UNKNOWN'), row('Infinity', 'A'), row('0', 'A'), row('3', '')])('rejects incomplete or invalid course input %j', (course) => {
    const result = calculateSemester([course], profile, '', '');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.gpa).toBeNull();
  });
  it('does not partially calculate a record containing invalid rows', () => {
    expect(calculateSemester([row('3', 'A'), row('-2', 'B')], profile, '', '').cgpa).toBeNull();
  });
  it.each([['4.1', '30'], ['2', '-1'], ['', '30'], ['2', ''], ['Infinity', '2']])('rejects invalid or missing previous record (%s, %s)', (gpa, credits) => {
    expect(calculateSemester([row('3', 'A')], profile, gpa, credits).errors.length).toBeGreaterThan(0);
  });
  it('accepts numeric prior values as well as form strings', () => {
    expect(calculateSemester([row('3', 'A')], profile, 3, 3).cgpa).toBe(3.5);
  });
});

describe('percentage thresholds and profile integrity', () => {
  it('uses the actual inclusive lower threshold, without linear conversion', () => {
    expect(gradeForPercent(90, profile)?.grade).toBe('A');
    expect(gradeForPercent(89.99, profile)?.grade).toBe('B');
    expect(gradeForPercent(79.99, profile)?.grade).toBe('F');
    expect(gradeForPercent(101, profile)).toBeNull();
  });
  it('rejects a custom scale without grades or with duplicate/invalid points', () => {
    expect(validateProfile({ ...profile, grades: [] }).length).toBeGreaterThan(0);
    expect(validateProfile({ ...profile, grades: [{ grade: 'A', points: 5 }] }).length).toBeGreaterThan(0);
    expect(validateProfile({ ...profile, grades: [{ grade: 'A', points: 4 }, { grade: 'A', points: 2 }] }).length).toBeGreaterThan(0);
  });
  it('does not infer a percentage scale from a points-only profile', () => {
    expect(gradeForPercent(90, { ...profile, grades: [{ grade: 'A', points: 4 }] })).toBeNull();
  });
  it('does not drop an exact threshold due to floating-point assessment division', () => {
    expect(gradeForPercent(64.8 / 72 * 100, profile)?.grade).toBe('A');
    expect(gradeForPercent(89.99999, profile)?.grade).toBe('B');
  });
});

describe('target GPA feasibility', () => {
  it('finds the required future GPA from quality points', () => {
    expect(calculateTarget(2.5, 60, 3, 30, 4)).toEqual({ required: 4, status: 'achievable' });
  });
  it('reports impossible targets without clipping the required GPA', () => {
    expect(calculateTarget(2, 90, 3.5, 30, 4)).toEqual({ required: 8, status: 'impossible' });
  });
  it('reports a goal already secured even with zero future points', () => {
    expect(calculateTarget(4, 90, 2, 30, 4)).toEqual({ required: 0, status: 'achieved' });
  });
  it.each([[3, 90, 3.5, 0, 4], [5, 30, 3, 20, 4], [3, -1, 3, 10, 4], [3, 30, NaN, 10, 4]])('rejects invalid targets %j', (...args) => {
    expect(calculateTarget(...args as [number, number, number, number, number]).status).toBe('invalid');
  });
});
