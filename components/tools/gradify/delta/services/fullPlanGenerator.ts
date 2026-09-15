import { remainingCourses, type ParsedCourse } from './pdfParser';
import { allowsGraduationPrerequisitePair, type SemesterType } from './registrationPolicy';
import { electiveGroupForCode, getElectiveGroup, type BylawVersion } from '../data/curriculum';
import { isPassingGrade } from '../data/grades';
import { capExpectedGrade, projectPlannedTerms } from './planProjection';
import { detectCourseRegistration } from './academicHistory';
import { courseOffered, planningLimit, planningRules, type PlanningPreferences } from './planningPreferences';

export interface PlannedTerm {
  id: string;
  title: string;
  semesterType: SemesterType;
  courses: Record<string, string>; // course.code -> expectedGrade
}

export interface PlanGenerationOptions {
  preferences?: PlanningPreferences;
  maxTerms?: number;
  firstTermKey?: string;
  includeSummer: boolean;
  targetCGPA: number;
  totalDegreeHours: number;
  startSemester: SemesterType;
  startYear: number;
  studentProgram?: string;
  bylawVersion?: BylawVersion;
  currentRegisteredCourses?: string[];
  initialAttempts?: ParsedCourse[];
  previousTotalPoints?: number;
}

function determineGrade(targetCGPA: number): string {
  if (targetCGPA > 3.7) return 'A';
  if (targetCGPA > 3.3) return 'A-';
  if (targetCGPA > 3.0) return 'B+';
  if (targetCGPA > 2.7) return 'B';
  if (targetCGPA > 2.3) return 'B-';
  if (targetCGPA > 2.0) return 'C+';
  return 'C';
}

function nextSemester(currentType: SemesterType, currentYear: number, includeSummer: boolean): { type: SemesterType, year: number } {
  if (currentType === 'Fall') return { type: 'Spring', year: currentYear + 1 };
  if (currentType === 'Spring') {
    if (includeSummer) return { type: 'Summer', year: currentYear };
    return { type: 'Fall', year: currentYear };
  }
  return { type: 'Fall', year: currentYear }; // from Summer
}

export function generateFullPlan(
  bestAttempts: ParsedCourse[],
  passedHours: number,
  currentCGPA: number,
  gpaHours: number,
  options: PlanGenerationOptions
): PlannedTerm[] {
  const terms: PlannedTerm[] = [];
  
  let currentBestAttempts = [...bestAttempts];
  let currentAttempts = [...(options.initialAttempts ?? bestAttempts)];
  let currentPassedHours = passedHours;
  let currentGpaHours = gpaHours;
  let simulatedCGPA = currentCGPA;
  let currentTotalPoints = Number.isFinite(options.previousTotalPoints)
    ? options.previousTotalPoints! : currentCGPA * gpaHours;
  
  let semesterType = options.startSemester;
  let year = options.startYear;
  
  let safetyLoop = 0;
  let isFirstTerm = true;
  const rules = planningRules(options.preferences);

  while (safetyLoop < (options.maxTerms ?? 25)) {
    safetyLoop++;
    
    let currentTermHours = 0;
    const termCourses: Record<string, string> = {};
    const remaining = remainingCourses(currentBestAttempts, options.studentProgram, options.bylawVersion, false);
    if (remaining.length === 0) break;
    const remainingHours = Math.max(0, options.totalDegreeHours - currentPassedHours);
    const limit = planningLimit(simulatedCGPA, semesterType, remainingHours, options.preferences);
    const termKey = isFirstTerm && options.firstTermKey ? options.firstTermKey : `${semesterType} ${year}`;
    const projectedNewHours = Math.max(remainingHours, remaining.reduce((sum, c) => sum + c.hours, 0));
    const requiredAverage = projectedNewHours > 0
      ? (options.targetCGPA * (currentGpaHours + projectedNewHours) - currentTotalPoints) / projectedNewHours : options.targetCGPA;
    const defaultGrade = determineGrade(Math.max(options.targetCGPA, requiredAverage));
    const prerequisiteAllowed = (c: typeof remaining[number]) => {
      if (!rules.enforcePrerequisites || c.status === 'available') return true;
      const prerequisite = remaining.find(p => c.missingPrerequisites.length === 1 && p.code === c.missingPrerequisites[0] && p.code in termCourses);
      return Boolean(prerequisite && allowsGraduationPrerequisitePair({
        isGraduationTerm: limit.isGraduationTerm, remainingHours,
        prerequisiteCode: prerequisite.code, prerequisiteHours: prerequisite.hours,
        dependentHours: c.hours, missingPrerequisites: c.missingPrerequisites,
      }));
    };
    const selectedElectiveHours = new Map<string, number>();
    for (const attempt of currentBestAttempts) {
      const groupId = electiveGroupForCode(attempt.code, options.studentProgram, options.bylawVersion);
      if (groupId && isPassingGrade(attempt.grade)) selectedElectiveHours.set(groupId, (selectedElectiveHours.get(groupId) || 0) + attempt.hours);
    }

    if (isFirstTerm && options.currentRegisteredCourses && options.currentRegisteredCourses.length > 0) {
      const allForLookup = remaining;
      for (const code of options.currentRegisteredCourses) {
        const c = allForLookup.find(x => x.code === code);
        if (!c || !prerequisiteAllowed(c) || !courseOffered(c, semesterType, termKey, options.preferences) || currentTermHours + c.hours > limit.maxHours) continue;
        const detection = detectCourseRegistration(c, currentAttempts, currentBestAttempts, new Set(), options.studentProgram);
        if (!detection.selectable) continue;
        const groupId = electiveGroupForCode(c.code, options.studentProgram, options.bylawVersion);
        const group = groupId ? getElectiveGroup(groupId, options.bylawVersion) : undefined;
        if (rules.enforceElectiveQuotas && group && (selectedElectiveHours.get(groupId!) || 0) + c.hours > group.requiredHours) continue;
        if (groupId) selectedElectiveHours.set(groupId, (selectedElectiveHours.get(groupId) || 0) + c.hours);
        termCourses[code] = capExpectedGrade(detection, defaultGrade);
        currentTermHours += c.hours;
      }
    } else {
      const available = remaining.filter(c => courseOffered(c, semesterType, termKey, options.preferences));
        
      
      const sorted = [...available].sort((a, b) => {
        const aInSeason = (semesterType === 'Fall' && a.semester === 'Semester 1') || 
                          (semesterType === 'Spring' && a.semester === 'Semester 2') || 
                          (a.semester === 'Both');
        const bInSeason = (semesterType === 'Fall' && b.semester === 'Semester 1') || 
                          (semesterType === 'Spring' && b.semester === 'Semester 2') || 
                          (b.semester === 'Both');
        
        if (aInSeason && !bInSeason) return -1;
        if (!aInSeason && bInSeason) return 1;
        
        if (a.level !== b.level) return a.level.localeCompare(b.level);
        
        return rules.prioritizeUnlocks ? (b.unlocksNext?.length || 0) - (a.unlocksNext?.length || 0) : a.code.localeCompare(b.code);
      });

      for (const c of sorted) {
        if (!prerequisiteAllowed(c)) continue;
        if (currentTermHours + c.hours > limit.maxHours) continue;
        const detection = detectCourseRegistration(c, currentAttempts, currentBestAttempts, new Set(), options.studentProgram);
        if (!detection.selectable) continue;
        const groupId = electiveGroupForCode(c.code, options.studentProgram, options.bylawVersion);
        const group = groupId ? getElectiveGroup(groupId, options.bylawVersion) : undefined;
        if (rules.enforceElectiveQuotas && group && (selectedElectiveHours.get(groupId!) || 0) + c.hours > group.requiredHours) continue;
        if (groupId) selectedElectiveHours.set(groupId, (selectedElectiveHours.get(groupId) || 0) + c.hours);
        termCourses[c.code] = capExpectedGrade(detection, defaultGrade);
        currentTermHours += c.hours;
        
        if (currentTermHours >= limit.maxHours) break;
      }
    }
    
    isFirstTerm = false;
    
    if (Object.keys(termCourses).length > 0) {
      terms.push({
        id: `term-${safetyLoop}`,
        title: `${semesterType} ${year}`,
        semesterType,
        courses: termCourses
      });
      
      const projection = projectPlannedTerms(currentAttempts, {
        passedHours: currentPassedHours,
        gpaHours: currentGpaHours,
        cgpa: simulatedCGPA,
        totalPoints: currentTotalPoints,
      }, [terms[terms.length - 1]], options.studentProgram, options.bylawVersion, options.totalDegreeHours, options.preferences);
      currentAttempts = projection.attempts;
      currentBestAttempts = projection.bestAttempts;
      currentPassedHours = projection.record.passedHours;
      currentGpaHours = projection.record.gpaHours;
      currentTotalPoints = projection.record.totalPoints;
      simulatedCGPA = projection.record.cgpa;
    }
    
    const next = nextSemester(semesterType, year, options.includeSummer);
    semesterType = next.type;
    year = next.year;
  }
  
  return terms;
}
