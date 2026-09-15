import { describe, expect, it } from 'vitest';
import { allowsGraduationPrerequisitePair, getRegistrationLimit, wouldExceedRegistrationLimit } from '../../components/tools/gradify/delta/services/registrationPolicy';

describe('registration limits', () => {
  it.each([
    [0.999, 12],
    [1.0, 15],
    [1.499, 15],
    [1.5, 18],
    [3.0, 18],
    [3.001, 21],
    [4.0, 21],
  ])('maps normal-term CGPA %s to %s hours', (gpa, expected) => {
    expect(getRegistrationLimit({
      gpa,
      semesterType: 'Fall',
      remainingHours: 80,
    }).maxHours).toBe(expected);
  });

  it('caps a regular summer semester at 9 hours', () => {
    expect(getRegistrationLimit({
      gpa: 3.5,
      semesterType: 'Summer',
      remainingHours: 40,
    }).maxHours).toBe(9);
  });

  it('applies the graduation allowance only above 1.8', () => {
    expect(getRegistrationLimit({
      gpa: 1.8,
      semesterType: 'Fall',
      remainingHours: 21,
    }).isGraduationTerm).toBe(false);
    expect(getRegistrationLimit({
      gpa: 1.801,
      semesterType: 'Fall',
      remainingHours: 21,
    })).toMatchObject({ isGraduationTerm: true, maxHours: 21 });
  });

  it('allows 12 summer hours in an eligible graduation term', () => {
    expect(getRegistrationLimit({
      gpa: 2.1,
      semesterType: 'Summer',
      remainingHours: 12,
    })).toMatchObject({ isGraduationTerm: true, maxHours: 12 });
  });

  it('does not label an already-completed degree as a graduation term', () => {
    expect(getRegistrationLimit({
      gpa: 2.1,
      semesterType: 'Fall',
      remainingHours: 0,
    })).toMatchObject({ isGraduationTerm: false, maxHours: 18 });
  });

  it('detects additions that exceed the term limit', () => {
    expect(wouldExceedRegistrationLimit(12, 3, 15)).toBe(false);
    expect(wouldExceedRegistrationLimit(13, 3, 15)).toBe(true);
  });

  it('allows exactly one final prerequisite pair that completes the degree', () => {
    expect(allowsGraduationPrerequisitePair({
      isGraduationTerm: true,
      remainingHours: 6,
      prerequisiteCode: 'ECE 221',
      prerequisiteHours: 3,
      dependentHours: 3,
      missingPrerequisites: ['ECE221'],
    })).toBe(true);
  });

  it('rejects prerequisite exceptions outside the exact final pair', () => {
    expect(allowsGraduationPrerequisitePair({
      isGraduationTerm: false,
      remainingHours: 6,
      prerequisiteCode: 'ECE221',
      prerequisiteHours: 3,
      dependentHours: 3,
      missingPrerequisites: ['ECE221'],
    })).toBe(false);
    expect(allowsGraduationPrerequisitePair({
      isGraduationTerm: true,
      remainingHours: 9,
      prerequisiteCode: 'ECE221',
      prerequisiteHours: 3,
      dependentHours: 3,
      missingPrerequisites: ['ECE221'],
    })).toBe(false);
  });
});
