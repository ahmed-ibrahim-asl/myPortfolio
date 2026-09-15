import { describe, expect, it } from 'vitest';
import { analyzeTranscript } from '../../components/tools/gradify/delta/services/transcriptAnalysis';
import { parseHeader, type ParsedCourse } from '../../components/tools/gradify/delta/services/pdfParser';

const header = parseHeader('CGPA: 2.100\nT.P.Hrs: 130 of 160\nAcademic Program: Communications Engineering');

function attempt(code: string, grade: string, term = '2025-2026 Fall'): ParsedCourse {
  return { code, grade, term, name: code, hours: 3 };
}

describe('local transcript analysis', () => {
  it('returns all planner collections and applies the detected program policy', () => {
    const rawAttempts = [attempt('ECE222', 'F'), attempt('ECE113', 'W')];
    const result = analyzeTranscript(header, rawAttempts);
    expect(result.program).toBe('communications');
    expect(result.bylawVersion).toBe('Bylaw_2021');
    expect(result.limit.maxHours).toBe(18);
    expect(result.failed.map(course => course.code)).toEqual(['ECE222']);
    expect(result.withdrawn.map(course => course.code)).toEqual(['ECE113']);
    expect(result.transferred).toEqual([]);
    expect(result.sameCourseImprovements).toEqual([]);
    expect(result.electiveReplacements).toEqual([]);
    expect(result.remaining.length).toBeGreaterThan(0);
  });

  it.each(['PASS', 'C-', 'D-'])('uses the tested best-attempt rule for %s after a failure', grade => {
    const rawAttempts = [attempt('ECE111', 'F'), attempt('ECE111', grade, '2025-2026 Spring')];
    const result = analyzeTranscript(header, rawAttempts);
    expect(result.bestAttempts[0].grade).toBe(grade);
    expect(result.failed).toEqual([]);
    expect(rawAttempts[0].grade).toBe('F');
  });

  it('preserves the 173-hour bylaw and transferred course metadata', () => {
    const oldHeader = parseHeader('CGPA: 2.100\nT.P.Hrs: 160 of 173\nAcademic Program: Communications Engineering');
    const result = analyzeTranscript(oldHeader, [{ ...attempt('ECE111', 'D'), case: 'TR' }]);
    expect(result.bylawVersion).toBe('Bylaw_2013');
    expect(result.limit.isGraduationTerm).toBe(true);
    expect(result.transferred).toHaveLength(1);
    expect(result.sameCourseImprovements).toEqual([]);
  });

  it('rejects a transcript without course rows', () => {
    expect(() => analyzeTranscript(header, [])).toThrow('Could not extract any course data');
  });
});
