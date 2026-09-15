export type SemesterType = 'Fall' | 'Spring' | 'Summer';

export interface RegistrationLimit {
  maxHours: number;
  reason: string;
  isGraduationTerm: boolean;
}

interface RegistrationLimitInput {
  gpa: number;
  semesterType: SemesterType;
  remainingHours: number;
}

export function getRegistrationLimit({
  gpa,
  semesterType,
  remainingHours,
}: RegistrationLimitInput): RegistrationLimit {
  const safeGpa = Number.isFinite(gpa) ? Math.max(0, Math.min(4, gpa)) : 0;
  const safeRemaining = Number.isFinite(remainingHours) ? Math.max(0, remainingHours) : 160;
  const graduationLimit = semesterType === 'Summer' ? 12 : 21;
  const isGraduationTerm = safeGpa > 1.8
    && safeRemaining > 0
    && safeRemaining <= graduationLimit;

  if (isGraduationTerm) {
    return {
      maxHours: graduationLimit,
      reason: `Graduation-term allowance: ${safeRemaining} degree hours remaining`,
      isGraduationTerm: true,
    };
  }

  if (semesterType === 'Summer') {
    return {
      maxHours: 9,
      reason: 'Summer-semester maximum',
      isGraduationTerm: false,
    };
  }

  if (safeGpa < 1) {
    return { maxHours: 12, reason: 'CGPA below 1.00', isGraduationTerm: false };
  }
  if (safeGpa < 1.5) {
    return { maxHours: 15, reason: 'CGPA from 1.00 to below 1.50', isGraduationTerm: false };
  }
  if (safeGpa <= 3) {
    return { maxHours: 18, reason: 'CGPA from 1.50 through 3.00', isGraduationTerm: false };
  }
  return { maxHours: 21, reason: 'CGPA above 3.00', isGraduationTerm: false };
}

export function wouldExceedRegistrationLimit(
  registeredHours: number,
  courseHours: number,
  maxHours: number,
): boolean {
  return registeredHours + courseHours > maxHours;
}

interface GraduationPairInput {
  isGraduationTerm: boolean;
  remainingHours: number;
  prerequisiteCode: string;
  prerequisiteHours: number;
  dependentHours: number;
  missingPrerequisites: string[];
}

export function allowsGraduationPrerequisitePair({
  isGraduationTerm,
  remainingHours,
  prerequisiteCode,
  prerequisiteHours,
  dependentHours,
  missingPrerequisites,
}: GraduationPairInput): boolean {
  if (!isGraduationTerm || missingPrerequisites.length !== 1) return false;
  const normalize = (code: string) => code.trim().replace(/\s+/g, '').toUpperCase();
  return normalize(missingPrerequisites[0]) === normalize(prerequisiteCode)
    && prerequisiteHours + dependentHours === remainingHours;
}
