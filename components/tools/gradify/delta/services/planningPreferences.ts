import type { Course } from '../data/curriculum';
import { getRegistrationLimit, type SemesterType } from './registrationPolicy';

export const defaultPlanningRules = {
  enforcePrerequisites: true,
  enforceOfferings: true,
  enforceElectiveQuotas: true,
  prioritizeUnlocks: true,
  graduationAllowance: true,
};
export type PlanningRules = typeof defaultPlanningRules;
export interface PlanningPreferences {
  rules: Partial<PlanningRules>;
  excluded: string[];
  offerings: Record<string, string>;
  termAvailability: Record<string, Record<string, boolean>>;
  regularMaxHours?: number;
  summerMaxHours?: number;
}
export const emptyPlanningPreferences = (): PlanningPreferences => ({
  rules: {}, excluded: [], offerings: {}, termAvailability: {},
});
export function planningRules(preferences?: PlanningPreferences): PlanningRules {
  return { ...defaultPlanningRules, ...preferences?.rules };
}
export function courseOffered(course: Course, semester: SemesterType, termKey: string, preferences?: PlanningPreferences): boolean {
  if (preferences?.excluded.includes(course.code)) return false;
  const exception = preferences?.termAvailability[termKey]?.[course.code];
  if (exception !== undefined) return exception;
  if (!planningRules(preferences).enforceOfferings) return true;
  const offering = preferences?.offerings[course.code] ?? course.semester;
  if (offering === 'Both') return true;
  if (offering === 'Summer') return semester === 'Summer';
  // Summer availability varies; the review lists these as assumed and editable.
  if (semester === 'Summer') return offering !== 'Unknown';
  return offering === (semester === 'Fall' ? 'Semester 1' : 'Semester 2');
}
export function planningLimit(gpa: number, semesterType: SemesterType, remainingHours: number, preferences?: PlanningPreferences) {
  const rules = planningRules(preferences);
  const limit = getRegistrationLimit({ gpa, semesterType, remainingHours: rules.graduationAllowance ? remainingHours : 0 });
  const custom = semesterType === 'Summer' ? preferences?.summerMaxHours : preferences?.regularMaxHours;
  return Number.isFinite(custom) && custom! >= 1 && custom! <= 30
    ? { ...limit, maxHours: custom!, reason: `Your selected ${semesterType === 'Summer' ? 'summer' : 'regular term'} credit limit` }
    : limit;
}
