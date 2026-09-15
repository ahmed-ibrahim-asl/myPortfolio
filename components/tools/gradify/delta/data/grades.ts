export const gradeScale = [
  { grade: 'A+', points: 4.0, label: 'A+ (97-100)' },
  { grade: 'A', points: 4.0, label: 'A (93-97)' },
  { grade: 'A-', points: 3.7, label: 'A- (89-93)' },
  { grade: 'B+', points: 3.3, label: 'B+ (84-89)' },
  { grade: 'B', points: 3.0, label: 'B (80-84)' },
  { grade: 'B-', points: 2.7, label: 'B- (76-80)' },
  { grade: 'C+', points: 2.3, label: 'C+ (73-76)' },
  { grade: 'C', points: 2.0, label: 'C (70-73)' },
  { grade: 'C-', points: 1.7, label: 'C- (67-70)' },
  { grade: 'D+', points: 1.3, label: 'D+ (64-67)' },
  { grade: 'D', points: 1.0, label: 'D (60-64)' },
  { grade: 'D-', points: 0.7, label: 'D-' },
  { grade: 'F', points: 0.0, label: 'F (0-60)' },
  { grade: 'PASS', points: 0.0, label: 'PASS' },
  { grade: 'FAIL', points: 0.0, label: 'FAIL' },
] as const;

export const passingGrades = new Set([
  'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'PASS',
]);

export const priorityImprovementGrades = new Set(['D+', 'D', 'D-']);

// Elective replacement follows the broader university rule (C and below),
// while the primary improvement recommendations only feature D-range grades.
export const electiveImprovementGrades = new Set(['C', 'C-', 'D+', 'D', 'D-']);

export function pointsForGrade(grade: string): number {
  return gradeScale.find(item => item.grade === grade)?.points ?? -1;
}

export function gradeRank(grade: string): number {
  if (grade === 'PASS') return 1.01;
  if (grade === 'W') return -2;
  if (grade === 'FAIL') return -1;
  return pointsForGrade(grade);
}

export function isPassingGrade(grade: string): boolean {
  return passingGrades.has(grade);
}

export function isPriorityImprovementGrade(grade: string): boolean {
  return priorityImprovementGrades.has(grade);
}

export function roundGpa(value: number, decimals: number = 3): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
