import { describe, it, expect } from 'vitest';
import { COMMUNICATIONS_PROGRAM_GROUPS, COURSES, ELECTIVE_GROUPS, GPA_CATEGORIES, MECHATRONICS_PROGRAM_GROUPS, electiveQuotaStatus, normCode, getCourseByCode, missingPrereqs, coursesUnlockedBy, satisfiedElectiveLists } from '../../components/tools/gradify/delta/data/curriculum';

describe('COURSES data', () => {
  it('has 249 courses', () => {
    expect(COURSES.length).toBe(249);
  });

  it('covers all departments', () => {
    const cats = new Set(COURSES.map(c => c.category));
    expect(cats.has('University')).toBe(true);
    expect(cats.has('Basic Sciences')).toBe(true);
    expect(cats.has('Architectural Engineering')).toBe(true);
    expect(cats.has('Civil Engineering')).toBe(true);
    expect(cats.has('Communications Engineering')).toBe(true);
    expect(cats.has('Mechatronics Engineering')).toBe(true);
  });

  it('has valid levels', () => {
    for (const c of COURSES) {
      expect(['L0', 'L1', 'L2', 'L3', 'L4']).toContain(c.level);
    }
  });

  it('has valid hours (0-6), with zero hours reserved for foundation courses', () => {
    for (const c of COURSES) {
      expect(c.hours).toBeGreaterThanOrEqual(0);
      expect(c.hours).toBeLessThanOrEqual(6);
      if (c.hours === 0) {
        expect(['BAS00E', 'BAS00M', 'BAS00P']).toContain(normCode(c.code));
      }
    }
  });

  it('has no empty names', () => {
    for (const c of COURSES) {
      expect(c.name.length).toBeGreaterThan(2);
    }
  });

  it('has unique course codes', () => {
    const codes = COURSES.map(c => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('gets course by code', () => {
    const c = getCourseByCode('BAS011');
    expect(c).toBeDefined();
    expect(c!.name).toContain('Mathematics');
  });

  it('finds BAS011 in Semester 1', () => {
    const c = getCourseByCode('BAS011');
    expect(c!.semester).toBe('Semester 1');
    expect(c!.level).toBe('L0');
  });

  it('contains the portal-only foundation and university elective courses', () => {
    for (const code of ['BAS00E', 'BAS00M', 'BAS00P', 'GEN005E', 'GEN505']) {
      expect(getCourseByCode(code), code).toBeDefined();
    }
  });

  it('contains corrected ECE hours and prerequisites', () => {
    expect(getCourseByCode('ECE342')?.hours).toBe(4);
    expect(getCourseByCode('ECE361')?.hours).toBe(3);
    expect(getCourseByCode('ECE333')?.hours).toBe(2);
    expect(getCourseByCode('ECE443')?.prereq).toEqual(['ECE113', 'ECE241']);
  });

  it('matches the 160-hour Communications program chart grouping', () => {
    expect(COMMUNICATIONS_PROGRAM_GROUPS).toHaveLength(11);
    expect(
      COMMUNICATIONS_PROGRAM_GROUPS.reduce(
        (total, group) => total + group.requiredHours,
        0,
      ),
    ).toBe(160);

    const groupedCodes = COMMUNICATIONS_PROGRAM_GROUPS.flatMap(group => group.codes);
    expect(groupedCodes).toHaveLength(88);
    expect(new Set(groupedCodes.map(normCode)).size).toBe(88);
    expect(groupedCodes.every(code => Boolean(getCourseByCode(code)))).toBe(true);
  });

  it('preserves the portal order for faculty and program requirements', () => {
    expect(
      COMMUNICATIONS_PROGRAM_GROUPS.find(group => group.id === 'FACULTY')?.codes,
    ).toEqual([
      'BAS011', 'BAS012', 'BAS021', 'BAS022',
      'BAS031', 'BAS111', 'BAS113', 'CIV280',
      'ECE001', 'MEC021', 'MEC022', 'MEC051',
      'MEC052', 'MEC151',
    ]);
    expect(
      COMMUNICATIONS_PROGRAM_GROUPS.find(group => group.id === 'PROGRAM_GENERAL')?.codes.slice(-4),
    ).toEqual(['ECE431', 'ECE441', 'ECE442', 'ECE443']);
  });

  it('matches the 160-hour Mechatronics curriculum grouping', () => {
    expect(MECHATRONICS_PROGRAM_GROUPS).toHaveLength(12);
    expect(
      MECHATRONICS_PROGRAM_GROUPS.reduce(
        (total, group) => total + group.requiredHours,
        0,
      ),
    ).toBe(160);

    const groupedCodes = MECHATRONICS_PROGRAM_GROUPS.flatMap(group => group.codes);
    expect(groupedCodes.every(code => Boolean(getCourseByCode(code)))).toBe(true);
    const duplicates = groupedCodes.filter(
      (code, index) => groupedCodes.findIndex(candidate => normCode(candidate) === normCode(code)) !== index,
    );
    expect(duplicates).toEqual(['MEC466']);
  });

  it('contains corrected Mechatronics course names, hours, and prerequisites', () => {
    expect(getCourseByCode('MEC355')).toMatchObject({
      name: 'Embedded Systems Design',
      hours: 3,
      prereq: ['ECE252'],
    });
    expect(getCourseByCode('MEC375')).toMatchObject({
      name: 'Automotive Embedded Networking',
      hours: 2,
    });
    expect(getCourseByCode('MEC496')).toMatchObject({
      name: 'Mechatronics for Biomedical Engineering',
      hours: 2,
      prereq: ['MEC381'],
    });
    expect(getCourseByCode('MEC400B')?.prereq).toEqual(['MEC400A']);
  });
});

describe('GPA_CATEGORIES', () => {
  it('has all 6 categories', () => {
    expect(Object.keys(GPA_CATEGORIES).length).toBe(6);
  });

  it('University has weight 2', () => {
    expect(GPA_CATEGORIES['University']).toBe(2);
  });

  it('Engineering categories have weight 4', () => {
    expect(GPA_CATEGORIES['Architectural Engineering']).toBe(4);
    expect(GPA_CATEGORIES['Civil Engineering']).toBe(4);
  });
});

describe('normCode', () => {
  it('normalizes with spaces', () => {
    expect(normCode('BAS 011')).toBe('BAS011');
  });

  it('uppercases', () => {
    expect(normCode('bas011')).toBe('BAS011');
  });

  it('handles mixed input', () => {
    expect(normCode(' civ 111 ')).toBe('CIV111');
  });
});

describe('missingPrereqs', () => {
  it('returns empty when all prereqs met', () => {
    const arc122 = getCourseByCode('ARC122')!;
    const passed = new Set(['ARC121']);
    expect(missingPrereqs(arc122, passed)).toEqual([]);
  });

  it('returns missing prerequisites', () => {
    const arc122 = getCourseByCode('ARC122')!;
    const passed = new Set<string>();
    expect(missingPrereqs(arc122, passed)).toEqual(['ARC121']);
  });
});

describe('coursesUnlockedBy', () => {
  it('ARC121 unlocks ARC122', () => {
    const unlocked = coursesUnlockedBy('ARC121');
    expect(unlocked).toContain('ARC122');
  });
});

describe('satisfiedElectiveLists', () => {
  it('marks list as satisfied when a course from it is passed', () => {
    const passed = new Set(['ARC241']);
    const satisfied = satisfiedElectiveLists(passed);
    expect(satisfied.has('ARC_Elective_1_3')).toBe(true);
  });

  it('empty passed set means nothing satisfied', () => {
    const satisfied = satisfiedElectiveLists(new Set());
    expect(satisfied.size).toBe(0);
  });

  it('requires two passed courses for four-hour University List B', () => {
    const oneCourse = satisfiedElectiveLists(new Set(['GEN203']));
    expect(oneCourse.has('UNIVERSITY_B')).toBe(false);

    const twoCourses = satisfiedElectiveLists(new Set(['GEN203', 'GEN403']));
    expect(twoCourses.has('UNIVERSITY_B')).toBe(true);
    expect(ELECTIVE_GROUPS.UNIVERSITY_B.requiredHours).toBe(4);
  });

  it('recognizes every ECE elective list independently', () => {
    const satisfied = satisfiedElectiveLists(new Set([
      'ECE315', 'ECE334', 'ECE445', 'ECE451', 'ECE448',
    ]));
    for (const group of ['ECE_1', 'ECE_2', 'ECE_3', 'ECE_4', 'ECE_5']) {
      expect(satisfied.has(group), group).toBe(true);
    }
  });

  it('allocates an overlapping Mechatronics elective to only one list', () => {
    const satisfied = satisfiedElectiveLists(new Set(['MEC466']), 'mechatronics');
    expect(satisfied.has('MEC_3')).toBe(true);
    expect(satisfied.has('MEC_5')).toBe(false);
  });
});

describe('electiveQuotaStatus', () => {
  it('allows only the remaining required hours in a two-hour elective list', () => {
    expect(electiveQuotaStatus('ECE_1', 0, 0, 2)).toMatchObject({
      remainingHours: 2,
      allowed: true,
    });
    expect(electiveQuotaStatus('ECE_1', 0, 2, 2)).toMatchObject({
      remainingHours: 0,
      allowed: false,
    });
  });

  it('accounts for passed and planned hours in University List B', () => {
    expect(electiveQuotaStatus('UNIVERSITY_B', 2, 0, 2).allowed).toBe(true);
    expect(electiveQuotaStatus('UNIVERSITY_B', 2, 2, 2)).toMatchObject({
      requiredHours: 4,
      remainingHours: 0,
      allowed: false,
    });
  });
});
