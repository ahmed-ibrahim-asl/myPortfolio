import { describe, expect, it } from 'vitest';
import {
  detectCourseRegistration,
  electiveReplacementOptions,
  sameCourseImprovementCandidates,
  summarizeAcademicHistory,
  unresolvedFailedCourses,
} from '../../components/tools/gradify/delta/services/academicHistory';
import { getCourseByCode } from '../../components/tools/gradify/delta/data/curriculum';
import type { ParsedCourse } from '../../components/tools/gradify/delta/services/pdfParser';


const history: ParsedCourse[] = [
  { term: '2022 Fall', code: 'BAS00M', name: 'Basics of Mathematics', grade: 'D', hours: 0 },
  { term: '2023 Fall', code: 'ECE315', name: 'Filter Design', grade: 'C', hours: 2 },
  { term: '2023 Fall', code: 'ECE445', name: 'Network Security', grade: 'D+', hours: 2 },
  { term: '2023 Fall', code: 'ECE111', name: 'Circuits', grade: 'D', hours: 3 },
  { term: '2024 Fall', code: 'ECE222', name: 'DSP', grade: 'F', hours: 3 },
  { term: '2025 Fall', code: 'ECE222', name: 'DSP', grade: 'F', hours: 3 },
];

describe('academic history inference', () => {
  it('derives attempt counts and latest grades', () => {
    const summary = summarizeAcademicHistory(history).get('ECE222');
    expect(summary).toMatchObject({ attemptCount: 2, passed: false });
    expect(summary?.latest.term).toBe('2025 Fall');
  });

  it('offers only unresolved failures for retake', () => {
    expect(unresolvedFailedCourses(history).map(course => course.code)).toEqual(['ECE222']);
  });

  it('offers D-grade compulsory courses for same-course improvement', () => {
    expect(sameCourseImprovementCandidates(history).map(course => course.code)).toEqual(['ECE111']);
  });

  it('recommends only non-transferred D-range courses for improvement', () => {
    const candidates: ParsedCourse[] = [
      { term: '2025 Fall', code: 'BAS011', name: 'Math 1', grade: 'D+', hours: 3 },
      { term: '2025 Fall', code: 'BAS012', name: 'Math 2', grade: 'D-', hours: 3 },
      { term: '2025 Fall', code: 'BAS021', name: 'Physics 1', grade: 'C-', hours: 3 },
      { term: '', code: 'BAS022', name: 'Physics 2', grade: 'D', hours: 3, case: 'TR' },
    ];
    expect(sameCourseImprovementCandidates(candidates).map(course => course.code)).toEqual([
      'BAS012', 'BAS011',
    ]);
  });

  it('offers a different course from the same completed elective list', () => {
    const options = electiveReplacementOptions(history);
    const listOne = options.filter(option => option.groupId === 'ECE_1');
    expect(listOne.map(option => option.replacementCourse.code)).toEqual([
      'ECE312', 'ECE313', 'ECE314',
    ]);
    expect(listOne.every(option => option.replaces.code === 'ECE315')).toBe(true);
    expect(listOne.some(option => option.replacementCourse.code === 'ECE315')).toBe(false);
  });

  it('does not reuse an elective already targeted for replacement', () => {
    const options = electiveReplacementOptions(history, new Set(['ECE315']));
    expect(options.some(option => option.groupId === 'ECE_1')).toBe(false);
  });

  it('automatically detects failed retakes without a manual status choice', () => {
    expect(
      detectCourseRegistration(
        getCourseByCode('ECE222')!,
        history,
        history,
      ),
    ).toMatchObject({
      status: 'retaken',
      selectable: true,
      oldGrade: 'F',
      attemptNumber: 3,
    });
  });

  it('automatically detects required-course improvement', () => {
    expect(
      detectCourseRegistration(
        getCourseByCode('ECE111')!,
        history,
        history,
      ),
    ).toMatchObject({
      status: 'improvement',
      selectable: true,
      oldGrade: 'D',
      attemptNumber: 2,
    });
  });

  it('automatically detects a different elective replacement', () => {
    expect(
      detectCourseRegistration(
        getCourseByCode('ECE312')!,
        history,
        history,
      ),
    ).toMatchObject({
      status: 'improvement',
      selectable: true,
      oldGrade: 'C',
      replacement: {
        groupId: 'ECE_1',
        replaces: { code: 'ECE315' },
      },
    });
  });

  it('marks an already-passed course as completed', () => {
    expect(
      detectCourseRegistration(
        getCourseByCode('ECE315')!,
        history,
        history,
      ),
    ).toMatchObject({
      status: 'completed',
      selectable: false,
      oldGrade: 'C',
    });
  });

  it('detects a withdrawal as its own selectable registration state', () => {
    const withdrawnHistory: ParsedCourse[] = [
      { term: '2025 Fall', code: 'ECE113', name: 'Advanced Electronics', grade: 'W', hours: 3 },
    ];
    expect(
      detectCourseRegistration(
        getCourseByCode('ECE113')!,
        withdrawnHistory,
        withdrawnHistory,
      ),
    ).toMatchObject({
      status: 'withdrawn',
      selectable: true,
      oldGrade: 'W',
      attemptNumber: 2,
    });
  });

  const unresolvedEce222Cases = [
    {
      name: 'W followed by F',
      attempts: [
        { term: '2024 Fall', code: 'ECE222', name: 'DSP', grade: 'W', hours: 3 },
        { term: '2025 Fall', code: 'ECE222', name: 'DSP', grade: 'F', hours: 3 },
      ],
      expected: { status: 'retaken', oldGrade: 'F', attemptNumber: 3 },
    },
    {
      name: 'F followed by W',
      attempts: [
        { term: '2024 Fall', code: 'ECE222', name: 'DSP', grade: 'F', hours: 3 },
        { term: '2025 Fall', code: 'ECE222', name: 'DSP', grade: 'W', hours: 3 },
      ],
      expected: { status: 'withdrawn', oldGrade: 'W', attemptNumber: 3 },
    },
  ] satisfies Array<{
    name: string;
    attempts: ParsedCourse[];
    expected: { status: string; oldGrade: string; attemptNumber: number };
  }>;

  it.each(unresolvedEce222Cases)(
    'uses the latest unresolved result for $name',
    ({ attempts, expected }) => {
      const course = getCourseByCode('ECE222')!;
      expect(detectCourseRegistration(course, attempts, attempts)).toMatchObject(expected);
    },
  );

  it('treats W followed by a passing grade as completed in browser and API', () => {
    const attempts: ParsedCourse[] = [
      { term: '2024 Fall', code: 'ECE222', name: 'DSP', grade: 'W', hours: 3 },
      { term: '2025 Fall', code: 'ECE222', name: 'DSP', grade: 'C', hours: 3 },
    ];
    const course = getCourseByCode('ECE222')!;
    expect(detectCourseRegistration(course, attempts, attempts)).toMatchObject({ status: 'completed' });
  });

  it('detects a transferred course from Case TR and keeps it nonselectable', () => {
    const transferredHistory: ParsedCourse[] = [
      { term: '', code: 'BAS011', name: 'Math 1', grade: 'D+', hours: 3, case: 'TR' },
    ];
    expect(
      detectCourseRegistration(
        getCourseByCode('BAS011')!,
        transferredHistory,
        transferredHistory,
      ),
    ).toMatchObject({
      status: 'transferred',
      selectable: false,
      oldGrade: 'D+',
    });
  });
});
