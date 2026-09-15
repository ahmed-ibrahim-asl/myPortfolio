import { describe, expect, it } from 'vitest';
import { graduationNumbers, getProgramCourses } from '../../components/tools/gradify/delta/services/pdfParser';
import { generateFullPlan } from '../../components/tools/gradify/delta/services/fullPlanGenerator';
import { courseOffered, emptyPlanningPreferences, planningLimit } from '../../components/tools/gradify/delta/services/planningPreferences';
import { projectPlannedTerms } from '../../components/tools/gradify/delta/services/planProjection';

describe('planning regressions', () => {
  it('never marks 1.96 as meeting 2, including when no degree hours remain', () => {
    expect(graduationNumbers(160, 164, 1.96, 2).goalMet).toBe(false);
    expect(graduationNumbers(160, 164, 1.96, 2).reqGpaRemaining).toBe(-1);
    expect(graduationNumbers(156, 164, 1.96, 2).goalMet).toBe(false);
    expect(graduationNumbers(160, 160, 2, 2).goalMet).toBe(true);
    expect(graduationNumbers(160, 160, 1.99999, 2).goalMet).toBe(false);
    expect(graduationNumbers(160, 160, 2, 2, 160, 319.99).goalMet).toBe(false);
  });

  const options = { includeSummer: true, targetCGPA: 2, totalDegreeHours: 160,
    startSemester: 'Fall' as const, startYear: 2026, studentProgram: 'communications' };
  it('does not silently schedule Spring-only courses in Fall', () => {
    const terms = generateFullPlan([], 0, 2, 0, options);
    const catalog = getProgramCourses('communications');
    for (const term of terms) for (const code of Object.keys(term.courses)) {
      const course = catalog.find(c => c.code === code)!;
      if (term.semesterType === 'Fall') expect(course.semester).not.toBe('Semester 2');
      if (term.semesterType === 'Spring') expect(course.semester).not.toBe('Semester 1');
    }
  });
  it('honors exclusions across the whole plan', () => {
    const terms = generateFullPlan([], 0, 2, 0, { ...options,
      preferences: { excluded: ['BAS011'], offerings: {}, termAvailability: {}, rules: {} } });
    expect(terms.length).toBeGreaterThan(0);
    expect(terms.every(t => !('BAS011' in t.courses))).toBe(true);
  });
  it('honors a term exception without changing later offerings', () => {
    const history = getProgramCourses('communications').filter(c => !['BAS011', 'BAS012'].includes(c.code)).map(c => ({ ...c, grade: 'A', term: 'Previous' }));
    const terms = generateFullPlan(history, 154, 2, 154, { ...options,
      preferences: { excluded: [], offerings: {}, termAvailability: { 'Fall 2026': { BAS011: false, BAS012: true } }, rules: {} } });
    expect(terms[0].courses).not.toHaveProperty('BAS011');
    expect(terms[0].courses).toHaveProperty('BAS012');
    expect(terms.slice(1).some(t => 'BAS011' in t.courses)).toBe(true);
  });
  it('can generate remaining requirements even when reported passed hours meet the degree total', () => {
    const history = getProgramCourses('communications').filter(c => c.code !== 'ECE431')
      .map(c => ({ ...c, term: 'Previous', grade: 'A' }));
    const terms = generateFullPlan(history, 160, 1.96, 164, { ...options, startSemester: 'Spring' });
    expect(terms.some(t => 'ECE431' in t.courses)).toBe(true);
  });
  it('uses a custom credit limit in generation and projection', () => {
    const preferences = { ...emptyPlanningPreferences(), regularMaxHours: 3 };
    const terms = generateFullPlan([], 0, 2, 0, { ...options, preferences, maxTerms: 1 });
    const result = projectPlannedTerms([], { passedHours: 0, gpaHours: 0, totalPoints: 0, cgpa: 2 }, terms, 'communications', undefined, 160, preferences);
    expect(result.courses.reduce((sum, c) => sum + Number(c.hours), 0)).toBeLessThanOrEqual(3);
    expect(result.errors).toEqual([]);
  });
  it('allows an explicit prerequisite exception without hiding it from the projection', () => {
    const preferences = { ...emptyPlanningPreferences(), rules: { enforcePrerequisites: false } };
    const terms = generateFullPlan([], 0, 2, 0, { ...options, preferences, startSemester: 'Spring', maxTerms: 1, currentRegisteredCourses: ['BAS022'] });
    expect(terms[0].courses).toHaveProperty('BAS022');
    const record = { passedHours: 0, gpaHours: 0, totalPoints: 0, cgpa: 2 };
    expect(projectPlannedTerms([], record, terms, 'communications', undefined, 160, preferences).errors).toEqual([]);
    expect(projectPlannedTerms([], record, terms, 'communications').errors.some(e => e.code === 'BAS022')).toBe(true);
  });
  it('keeps a disabled course excluded even with an explicit term offering', () => {
    const course = getProgramCourses('communications').find(c => c.code === 'BAS011')!;
    const preferences = { ...emptyPlanningPreferences(), excluded: [course.code], termAvailability: { 'Spring 2026': { BAS011: true } } };
    expect(courseOffered(course, 'Spring', 'Spring 2026', preferences)).toBe(false);
  });
  it('supports recurring offering changes and a one-term exception', () => {
    const course = getProgramCourses('communications').find(c => c.code === 'BAS011')!;
    const preferences = { ...emptyPlanningPreferences(), offerings: { BAS011: 'Semester 2' }, termAvailability: { 'Spring 2026': { BAS011: false } } };
    expect(courseOffered(course, 'Fall', 'Fall 2026', preferences)).toBe(false);
    expect(courseOffered(course, 'Spring', 'Spring 2026', preferences)).toBe(false);
    expect(courseOffered(course, 'Spring', 'Spring 2027', preferences)).toBe(true);
  });
  it('applies summer-only offerings and configurable graduation allowance', () => {
    const course = { ...getProgramCourses('communications')[0], semester: 'Summer' };
    expect(courseOffered(course, 'Fall', 'Fall 2026')).toBe(false);
    expect(courseOffered(course, 'Summer', 'Summer 2026')).toBe(true);
    expect(planningLimit(2, 'Fall', 6).maxHours).toBe(21);
    expect(planningLimit(2, 'Fall', 6, { ...emptyPlanningPreferences(), rules: { graduationAllowance: false } }).maxHours).toBe(18);
  });
  it('returns no courses when every option is excluded', () => {
    const preferences = { ...emptyPlanningPreferences(), excluded: getProgramCourses('communications').map(c => c.code) };
    expect(generateFullPlan([], 0, 2, 0, { ...options, preferences })).toEqual([]);
  });
});
