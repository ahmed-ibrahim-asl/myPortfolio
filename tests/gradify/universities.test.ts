import { describe, expect, it } from 'vitest';
import { calculateSemester, gradeForPercent, validateProfile } from '../../lib/tools/gradify/calculator';
import { getUniversityProfile, UNIVERSITY_PROFILES } from '../../lib/tools/gradify/universities';

describe('faculty-specific university calculations', () => {
  it('uses biotechnology 3.6 for A- and Cairo media 3.4 for B+ instead of Delta defaults', () => {
    const row = (grade: string) => [{ id:'1', name:'Course', hours:'3', grade }];
    expect(calculateSemester(row('A-'), getUniversityProfile('must-biotechnology'), '', '').gpa).toBeCloseTo(3.6);
    expect(calculateSemester(row('B+'), getUniversityProfile('cairo-mass-communication'), '', '').gpa).toBeCloseTo(3.4);
    expect(calculateSemester(row('B+'), getUniversityProfile('delta'), '', '').gpa).toBeCloseTo(3.3);
  });
  it('only exposes validated percentage conversions', () => {
    expect(gradeForPercent(94, getUniversityProfile('october-six-dentistry'))?.grade).toBe('A');
    expect(gradeForPercent(90, getUniversityProfile('auc'))).toBeNull();
    expect(gradeForPercent(71, getUniversityProfile('miu-engineering'))).toBeNull();
  });
  it('rejects an unknown university rather than silently calculating as Delta', () => {
    const profile = getUniversityProfile('unrecognized-university');
    expect(profile.status).toBe('custom');
    expect(calculateSemester([{id:'1',name:'',hours:'3',grade:'A'}],profile,'','').gpa).toBeNull();
  });
  it('every available preset is usable, identifiable, and gives finite results at each grade', () => {
    for (const profile of UNIVERSITY_PROFILES.filter(profile => profile.status !== 'custom')) {
      expect(validateProfile(profile),profile.name).toEqual([]);
      for (const grade of profile.grades) {
        const result = calculateSemester([{id:'1',name:'',hours:'3',grade:grade.grade}],profile,'','');
        expect(result.errors).toEqual([]);
        expect(Number.isFinite(result.gpa)).toBe(true);
      }
    }
  });
});
