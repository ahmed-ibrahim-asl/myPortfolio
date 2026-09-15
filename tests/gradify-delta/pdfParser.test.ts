import { describe, it, expect } from 'vitest';
import {
  dGradeCourses,
  failedRetakeCourses,
  getBestAttempts,
  getProgramCourses,
  groupByTerm,
  graduationNumbers,
  parseCourses,
  parseHeader,
  passedCodes,
  transferredCourseAttempts,
  withdrawnCourseAttempts,
} from '../../components/tools/gradify/delta/services/pdfParser';

describe('program-specific course catalogs', () => {
  it('shows only Communications curriculum courses when Communications is selected', () => {
    const codes = new Set(getProgramCourses('communications').map(course => course.code));
    expect(codes.has('ECE443')).toBe(true);
    expect(codes.has('MEC496')).toBe(false);
    expect(codes.has('ARC121')).toBe(false);
  });

  it('shows only Mechatronics curriculum courses when Mechatronics is selected', () => {
    const codes = new Set(getProgramCourses('mechatronics').map(course => course.code));
    expect(codes.has('MEC496')).toBe(true);
    expect(codes.has('MEC355')).toBe(true);
    expect(codes.has('ECE111')).toBe(true);
    expect(codes.has('ECE443')).toBe(false);
    expect(codes.has('CIV111')).toBe(false);
  });
});

describe('parseHeader', () => {
  it('extracts CGPA, passed hours, student info', () => {
    const text = `Student Name: Ahmed Ali
Student ID: 202012345
Academic Program: B.Sc. Communications Engineering
CGPA: 3.45
Total Passed Hrs: 120
Total Registered Hrs: 156
Educational Level: 4 of 5
Total Semseters: 10
Suspended Semesters: 1
T.Points: 414.0`;
    const h = parseHeader(text);
    expect(h.cgpa).toBe(3.45);
    expect(h.passedHours).toBe(120);
    expect(h.studentId).toBe('202012345');
    expect(h.studentName).toContain('Ahmed');
    expect(h.program).toContain('Communications');
    expect(h.gpaHours).toBe(120);
    expect(h.totalPoints).toBe(414);
    expect(h.totalRegisteredHours).toBe(156);
    expect(h.educationalLevel).toBe('4 of 5');
    expect(h.totalSemesters).toBe(10);
    expect(h.suspendedSemesters).toBe(1);
  });

  it('handles missing fields', () => {
    const h = parseHeader('');
    expect(h.cgpa).toBe(0);
    expect(h.passedHours).toBe(0);
    expect(h.studentName).toBe('Unknown');
  });
});

describe('parseCourses', () => {
  it('parses one-line course entries', () => {
    const text = `2024-2025 Fall
GEN001 Introduction to ICT A 2`;
    const courses = parseCourses(text);
    expect(courses.length).toBe(1);
    expect(courses[0].code).toBe('GEN001');
    expect(courses[0].grade).toBe('A');
    expect(courses[0].hours).toBe(2);
    expect(courses[0].term).toBe('2024-2025 Fall');
  });

  it('parses multi-line course entries', () => {
    const text = `2024-2025 Fall
BAS011
Engineering Mathematics (1)
A
3`;
    const courses = parseCourses(text);
    expect(courses.length).toBe(1);
    expect(courses[0].code).toBe('BAS011');
    expect(courses[0].grade).toBe('A');
    expect(courses[0].hours).toBe(3);
  });

  it('parses wrapped course names and preserves attempt metadata', () => {
    const text = `2025-2026 Fall
ECE 443
Communications
electronics
C-
3
1
2025-2026 Spring
ECE 400b
Graduation Project for Electronic and Communications
Eng. (
2
)
A
4
1`;
    const courses = parseCourses(text);
    expect(courses).toHaveLength(2);
    expect(courses[0]).toMatchObject({
      code: 'ECE443',
      name: 'Communications Electronics',
      grade: 'C-',
      hours: 3,
      remark: '1',
      attemptIndex: 1,
    });
    expect(courses[1]).toMatchObject({
      code: 'ECE400B',
      grade: 'A',
      hours: 4,
      remark: '1',
    });
    expect(courses[1].name).toContain('Eng. (2)');
  });

  it('normalizes a spaced alphabetic course suffix', () => {
    const text = `2025-2026 Fall
GEN005 E
Introduction to Law and Human Rights
C
2
1`;
    expect(parseCourses(text)[0].code).toBe('GEN005E');
  });

  it('recognizes Bassant transcript practical training and restores its canonical name', () => {
    const text = `2023-2024 Summer
Code
Course Name
Grade
Hours
Remark
Case
ECE 200
Practical Training for Electronic
and Communications Eng. (1)
B
1
1
ECE 221
Signals and Systems
F
3
3`;
    const courses = parseCourses(text);
    expect(courses).toHaveLength(2);
    expect(courses[0]).toMatchObject({
      term: '2023-2024 Summer',
      code: 'ECE200',
      name: 'Practical Training for Electronic and Communications Eng. (1)',
      grade: 'B',
      hours: 1,
      remark: '1',
    });
  });

  it('recognizes transferred and withdrawn courses as separate transcript cases', () => {
    const text = `Transfered Courses
BAS011
Engineering Mathematics (1)
D+
3
1
TR
2025-2026 Fall
ECE 221
Signals and Systems
W
3
2`;
    const courses = parseCourses(text);
    expect(transferredCourseAttempts(courses)).toMatchObject([
      { code: 'BAS011', grade: 'D+', case: 'TR' },
    ]);
    expect(withdrawnCourseAttempts(courses)).toMatchObject([
      { code: 'ECE221', grade: 'W', term: '2025-2026 Fall' },
    ]);
  });

  it('returns empty for empty text', () => {
    expect(parseCourses('')).toEqual([]);
  });
});

describe('getBestAttempts', () => {
  it('keeps highest grade for duplicate courses', () => {
    const attempts = [
      { term: '2024-1', code: 'GEN001', name: 'ICT', grade: 'C', hours: 2 },
      { term: '2024-2', code: 'GEN001', name: 'ICT', grade: 'A', hours: 2 },
    ];
    const best = getBestAttempts(attempts);
    expect(best.length).toBe(1);
    expect(best[0].grade).toBe('A');
  });

  it('treats PASS as better than an earlier F', () => {
    const best = getBestAttempts([
      { term: '2024-1', code: 'BAS00P', name: 'Basics of Physics', grade: 'F', hours: 0 },
      { term: '2024-2', code: 'BAS00P', name: 'Basics of Physics', grade: 'PASS', hours: 0 },
    ]);
    expect(best[0].grade).toBe('PASS');
  });
});

describe('passedCodes', () => {
  it('identifies passed courses', () => {
    const best = [
      { term: '', code: 'GEN001', name: '', grade: 'A', hours: 2 },
      { term: '', code: 'BAS011', name: '', grade: 'F', hours: 3 },
    ];
    const passed = passedCodes(best);
    expect(passed.has('GEN001')).toBe(true);
    expect(passed.has('BAS011')).toBe(false);
  });
});

describe('failedRetakeCourses', () => {
  it('does not classify withdrawn courses as failed', () => {
    const attempts = [
      { term: '2025 Fall', code: 'ECE113', name: 'Electronics', grade: 'W', hours: 3 },
      { term: '2025 Fall', code: 'ECE222', name: 'DSP', grade: 'F', hours: 3 },
    ];
    expect(failedRetakeCourses(attempts, attempts).map(course => course.code)).toEqual([
      'ECE222',
    ]);
  });

  it.each([
    { grades: ['W', 'C'], withdrawn: [], failed: [] },
    { grades: ['W', 'F'], withdrawn: [], failed: ['ECE222'] },
    { grades: ['F', 'W'], withdrawn: ['ECE222'], failed: [] },
    { grades: ['C', 'W'], withdrawn: [], failed: [] },
  ])('resolves ECE222 history $grades', ({ grades, withdrawn, failed }) => {
    const attempts = grades.map((grade, index) => ({
      term: `${2024 + index} Fall`,
      code: 'ECE222',
      name: 'DSP',
      grade,
      hours: 3,
    }));
    const bestAttempts = getBestAttempts(attempts);
    expect(withdrawnCourseAttempts(attempts).map(course => course.code)).toEqual(withdrawn);
    expect(failedRetakeCourses(attempts, bestAttempts).map(course => course.code)).toEqual(failed);
  });
});

describe('dGradeCourses', () => {
  it('filters D-range courses and excludes transferred grades', () => {
    const best = [
      { term: '', code: 'GEN001', name: '', grade: 'D', hours: 2 },
      { term: '', code: 'BAS011', name: '', grade: 'D+', hours: 3 },
      { term: '', code: 'ECE111', name: '', grade: 'D-', hours: 3 },
      { term: '', code: 'ECE114', name: '', grade: 'D', hours: 3, case: 'TR' },
      { term: '', code: 'BAS011', name: '', grade: 'C', hours: 3 },
    ];
    expect(dGradeCourses(best).map(course => course.code)).toEqual([
      'GEN001', 'BAS011', 'ECE111',
    ]);
  });
});

describe('graduationNumbers', () => {
  it('calculates required GPA', () => {
    const r = graduationNumbers(120, 130, 2.5, 2.0);
    expect(r.remainingHours).toBe(40);
    expect(r.targetCGPA).toBe(2.0);
  });

  it('returns -1 if mathematically impossible', () => {
    const r = graduationNumbers(100, 100, 1.0, 3.5);
    expect(r.reqGpaRemaining).toBe(-1);
  });
});

describe('groupByTerm', () => {
  it('calculates semester and cumulative GPA with retake replacement and withdrawals', () => {
    const terms = groupByTerm([
      { term: '2024-2025 Fall', code: 'ECE221', name: 'Signals', grade: 'F', hours: 3 },
      { term: '2024-2025 Fall', code: 'ECE211', name: 'Logic', grade: 'B', hours: 3 },
      { term: '2024-2025 Spring', code: 'ECE221', name: 'Signals', grade: 'D', hours: 3 },
      { term: '2024-2025 Spring', code: 'ECE251', name: 'Architecture', grade: 'A', hours: 3 },
      { term: '2024-2025 Spring', code: 'ECE331', name: 'Waves', grade: 'W', hours: 4 },
    ]);

    expect(terms).toHaveLength(2);
    expect(terms[0]).toMatchObject({
      term: '2024-2025 Fall',
      hours: 6,
      cumulativeHours: 6,
    });
    expect(terms[0].sgpa).toBeCloseTo(1.5);
    expect(terms[0].cgpa).toBeCloseTo(1.5);
    expect(terms[1]).toMatchObject({
      term: '2024-2025 Spring',
      hours: 6,
      cumulativeHours: 9,
    });
    expect(terms[1].sgpa).toBeCloseTo(2.5);
    expect(terms[1].cgpa).toBeCloseTo(8 / 3);
  });
});
