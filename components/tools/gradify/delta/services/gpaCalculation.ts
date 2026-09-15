import type { CourseEntry } from '../context/GpaContext';
import { gradeScale, isPassingGrade, roundGpa } from '../data/grades';

export interface GpaResults {
  semesterGPA: string;
  cgpa: string;
  semesterHours: number;
  totalHours: number;
  totalEarned: number;
  totalPoints: number;
}

export function calculateGPA(
  courses: CourseEntry[],
  gpaHours: string,
  passedHours: string,
  previousCGPA: string,
  previousTotalPoints: string = '',
): GpaResults {
  let currentTotalPoints = 0;
  let currentTotalHoursForGPA = 0;
  let currentTotalEarnedHours = 0;
  let cumulativeHoursAdjustments = 0;
  let cumulativePointsAdjustments = 0;
  let earnedHoursAdjustments = 0;

  for (const course of courses) {
    const hours = parseFloat(course.hours);
    if (isNaN(hours) || !course.grade) continue;

    const gradeInfo = gradeScale.find(grade => grade.grade === course.grade);
    if (!gradeInfo) continue;

    const isRepeat = course.status === 'retaken' || course.status === 'improvement';
    const isElectiveReplacement = Boolean(course.replacementOfCode);
    const replacedHours = parseFloat(course.replacementOldHours) || hours;

    if (!isRepeat && isPassingGrade(course.grade)) {
      currentTotalEarnedHours += hours;
    }
    if (isElectiveReplacement && !isPassingGrade(course.grade)) {
      earnedHoursAdjustments -= replacedHours;
    }

    if (course.grade !== 'PASS') {
      currentTotalHoursForGPA += hours;
      currentTotalPoints += hours * gradeInfo.points;

      if (isRepeat) {
        cumulativeHoursAdjustments += replacedHours;
      }
      if (isRepeat && course.oldGrade) {
        const oldGradeInfo = gradeScale.find(grade => grade.grade === course.oldGrade);
        if (oldGradeInfo) {
          cumulativePointsAdjustments += replacedHours * oldGradeInfo.points;
        }
      }
    }
  }

  const semesterGPA = currentTotalHoursForGPA > 0
    ? currentTotalPoints / currentTotalHoursForGPA
    : 0;
  const previousGpaHours = parseFloat(gpaHours) || 0;
  const previousCgpa = parseFloat(previousCGPA) || 0;
  const exactPreviousPoints = parseFloat(previousTotalPoints);
  const startingTotalPoints = previousTotalPoints.trim() !== ''
    && Number.isFinite(exactPreviousPoints)
    ? exactPreviousPoints
    : previousGpaHours * previousCgpa;
  const finalTotalPoints = startingTotalPoints
    + currentTotalPoints
    - cumulativePointsAdjustments;
  const finalTotalHours = previousGpaHours
    + currentTotalHoursForGPA
    - cumulativeHoursAdjustments;
  const cgpa = finalTotalHours > 0 ? finalTotalPoints / finalTotalHours : 0;
  const totalEarned = Math.max(
    0,
    (parseFloat(passedHours) || 0)
      + currentTotalEarnedHours
      + earnedHoursAdjustments,
  );

  return {
    semesterGPA: roundGpa(semesterGPA).toFixed(3),
    cgpa: roundGpa(cgpa).toFixed(3),
    semesterHours: currentTotalHoursForGPA,
    totalHours: finalTotalHours,
    totalEarned,
    totalPoints: finalTotalPoints,
  };
}
