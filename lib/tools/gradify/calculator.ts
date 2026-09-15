import type { UniversityGrade, UniversityProfile } from './universities';

export interface GpaRow { id: string; name: string; hours: string; grade: string }
export interface SemesterResult {
  gpa: number | null;
  cgpa: number | null;
  hours: number;
  qualityPoints: number;
  errors: string[];
}

export function validateProfile(profile: UniversityProfile): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(profile.maxGpa) || profile.maxGpa <= 0 || profile.maxGpa > 100) errors.push('Maximum GPA must be greater than 0 and no more than 100.');
  if (profile.grades.length === 0) errors.push('Add the grade scale from your faculty handbook.');
  const labels = new Set<string>();
  for (const item of profile.grades) {
    const label = item.grade.trim().toUpperCase();
    if (!label || labels.has(label)) errors.push('Each grade needs a unique, non-empty label.');
    labels.add(label);
    if (!Number.isFinite(item.points) || item.points < 0 || item.points > profile.maxGpa) errors.push(`Points for ${item.grade || 'each grade'} must be between 0 and ${profile.maxGpa}.`);
    if (item.minPercent !== undefined && (!Number.isFinite(item.minPercent) || item.minPercent < 0 || item.minPercent > 100)) errors.push(`The percentage threshold for ${item.grade} must be between 0 and 100.`);
  }
  return [...new Set(errors)];
}

export function gradeForPercent(percent: number, profile: UniversityProfile): UniversityGrade | null {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100 || validateProfile(profile).length) return null;
  if (profile.grades.some(item => item.minPercent === undefined)) return null;
  // Absorb arithmetic noise from assessment division without rounding real marks up.
  return [...profile.grades].sort((a, b) => b.minPercent! - a.minPercent!).find(item => percent + 1e-10 >= item.minPercent!) ?? null;
}

/** For new graded courses only; Delta repeat and transcript rules remain in the imported engine. */
export function calculateSemester(
  rows: GpaRow[], profile: UniversityProfile,
  previousGpa: string | number = '', previousHours: string | number = '',
): SemesterResult {
  const errors = validateProfile(profile);
  let hours = 0;
  let qualityPoints = 0;
  rows.forEach((row, index) => {
    if (!row.name.trim() && !row.hours.trim() && !row.grade.trim()) return;
    const credits = Number(row.hours);
    const grade = profile.grades.find(item => item.grade === row.grade);
    if (!row.hours.trim() || !Number.isFinite(credits) || credits <= 0 || credits > 100) errors.push(`Course ${index + 1}: enter credit hours greater than 0 and no more than 100.`);
    if (!grade) errors.push(`Course ${index + 1}: choose a grade from this university's scale.`);
    if (grade && credits > 0 && credits <= 100 && Number.isFinite(credits)) {
      hours += credits;
      qualityPoints += credits * grade.points;
    }
  });
  const hasGpa = String(previousGpa).trim() !== '';
  const hasHours = String(previousHours).trim() !== '';
  const priorGpa = Number(previousGpa);
  const priorHours = Number(previousHours);
  if (hasGpa !== hasHours) errors.push('Enter both previous CGPA and previous GPA hours, or leave both empty.');
  if (hasGpa && (!Number.isFinite(priorGpa) || priorGpa < 0 || priorGpa > profile.maxGpa)) errors.push(`Previous CGPA must be between 0 and ${profile.maxGpa}.`);
  if (hasHours && (!Number.isFinite(priorHours) || priorHours < 0 || priorHours > 10000)) errors.push('Previous GPA hours must be between 0 and 10,000.');
  if (errors.length) return { gpa: null, cgpa: null, hours, qualityPoints, errors };
  const totalHours = hours + priorHours;
  return {
    gpa: hours > 0 ? qualityPoints / hours : null,
    cgpa: totalHours > 0 ? (qualityPoints + priorGpa * priorHours) / totalHours : null,
    hours, qualityPoints, errors,
  };
}

export function calculateTarget(currentGpa: number, currentHours: number, targetGpa: number, futureHours: number, maxGpa: number): {required: number | null; status: 'achieved' | 'achievable' | 'impossible' | 'invalid'} {
  if (![currentGpa, currentHours, targetGpa, futureHours, maxGpa].every(Number.isFinite)
    || maxGpa <= 0 || currentGpa < 0 || currentGpa > maxGpa || targetGpa < 0 || targetGpa > maxGpa || currentHours < 0 || futureHours <= 0) {
    return { required: null, status: 'invalid' };
  }
  const required = (targetGpa * (currentHours + futureHours) - currentGpa * currentHours) / futureHours;
  if (required <= 0) return { required: 0, status: 'achieved' };
  return { required, status: required > maxGpa + 1e-10 ? 'impossible' : 'achievable' };
}
