import { describe, expect, it } from 'vitest';
import { projectPlannedTerms } from '../../components/tools/gradify/delta/services/planProjection';
import { generateFullPlan, type PlannedTerm } from '../../components/tools/gradify/delta/services/fullPlanGenerator';
import { getProgramCourses, type ParsedCourse } from '../../components/tools/gradify/delta/services/pdfParser';

const record = { passedHours: 8, gpaHours: 10, cgpa: 2.012, totalPoints: 20.123 };
const term = (courses: Record<string, string>, id = 'one'): PlannedTerm => ({ id, title: id, semesterType: 'Fall', courses });
const attempt = (code: string, grade: string, extra = {}): ParsedCourse => ({ code, grade, name: code, hours: 3, term: '2025-2026 Fall', ...extra });

describe('multi-term academic projections', () => {
  it('uses actual credits and exact points; failure adds GPA hours and PASS earns credits only', () => {
    const result = projectPlannedTerms([], record, [term({ BAS011: 'F', GEN002: 'PASS', GEN001: 'A' })], 'communications');
    expect(result.record).toMatchObject({ gpaHours: 15, passedHours: 12 });
    expect(result.record.totalPoints).toBeCloseTo(28.123);
    expect(result.courses.map(course => [course.code, course.hours])).toEqual([['BAS011', '3'], ['GEN002', '2'], ['GEN001', '2']]);
  });

  it('replaces old repeat hours/points, preserves earned-hour policy and caps the third attempt', () => {
    const history = [attempt('BAS011', 'F', { remark: '2' })];
    const result = projectPlannedTerms(history, record, [term({ BAS011: 'A' })], 'communications');
    expect(result.courses[0]).toMatchObject({ status: 'retaken', oldGrade: 'F', grade: 'C', retakeCount: 3 });
    expect(result.record.gpaHours).toBe(10);
    expect(result.record.passedHours).toBe(8);
    expect(result.record.totalPoints).toBeCloseTo(26.123);
  });

  it('does not register or count transferred courses again', () => {
    const result = projectPlannedTerms([attempt('BAS011', 'D', { case: 'TR' })], record, [term({ BAS011: 'A' })], 'communications');
    expect(result.courses).toEqual([]);
    expect(result.record).toEqual(record);
    expect(result.errors[0].code).toBe('BAS011');
  });

  it.each(['F', ''])('does not unlock a later prerequisite after %s', grade => {
    const result = projectPlannedTerms([], record, [term({ BAS021: grade }), term({ BAS022: 'A' }, 'two')], 'communications');
    expect(result.errors).toContainEqual(expect.objectContaining({ termId: 'two', code: 'BAS022', missing: ['BAS021'] }));
  });

  it('unlocks prerequisites after a passing earlier term, never earlier rows in the same term', () => {
    expect(projectPlannedTerms([], record, [term({ BAS021: 'PASS' }), term({ BAS022: 'A' }, 'two')], 'communications').errors).toEqual([]);
    expect(projectPlannedTerms([], record, [term({ BAS021: 'PASS', BAS022: 'A' })], 'communications').errors).toContainEqual(expect.objectContaining({ code: 'BAS022', missing: ['BAS021'] }));
  });

  it('preserves previous credit values for elective replacement with different credits', () => {
    const history = [attempt('ECE315', 'C', { hours: 3 }), attempt('ECE113', 'A')];
    const result = projectPlannedTerms(history, record, [term({ ECE312: 'A' })], 'communications');
    expect(result.courses[0]).toMatchObject({ hours: '2', replacementOfCode: 'ECE315', replacementOldHours: '3', status: 'improvement' });
    expect(result.record.gpaHours).toBe(9);
    expect(result.record.totalPoints).toBeCloseTo(22.123);
  });

  it('does not invent three credits for an unknown course', () => {
    const result = projectPlannedTerms([], record, [term({ UNKNOWN123: 'A' })], 'communications');
    expect(result.courses).toEqual([]);
    expect(result.record).toEqual(record);
    expect(result.errors[0].code).toBe('UNKNOWN123');
  });

  it('permits only the exact final prerequisite pair under the graduation allowance', () => {
    const finalRecord = { passedHours: 154, gpaHours: 154, cgpa: 2.1, totalPoints: 323.4 };
    expect(projectPlannedTerms([], finalRecord, [term({ BAS021: 'A', BAS022: 'A' })], 'communications').errors).toEqual([]);
    expect(projectPlannedTerms([], { ...finalRecord, passedHours: 153 }, [term({ BAS021: 'A', BAS022: 'A' })], 'communications').errors).toContainEqual(expect.objectContaining({ code: 'BAS022', missing: ['BAS021'] }));
  });

  it('flags a plan above its allowed credit load', () => {
    const summer = { ...term({ BAS011: 'A', BAS012: 'A', BAS021: 'A', GEN001: 'A' }), semesterType: 'Summer' as const };
    expect(projectPlannedTerms([], record, [summer], 'communications').errors).toContainEqual(expect.objectContaining({ message: expect.stringContaining('9-hour limit') }));
  });

  it('caps generated retakes and uses the catalog credit limit for registered courses', () => {
    const history = getProgramCourses('communications').map(course => attempt(course.code, 'A', { hours: course.hours }));
    const failed = history.find(course => course.code === 'BAS011')!;
    failed.grade = 'F'; failed.remark = '2';
    const terms = generateFullPlan(history, 157, 3.4, 160, { includeSummer: false, targetCGPA: 4, totalDegreeHours: 160, startSemester: 'Fall', startYear: 2026, studentProgram: 'communications', currentRegisteredCourses: ['BAS011'] });
    expect(terms[0].courses.BAS011).toBe('C');
  });
});
