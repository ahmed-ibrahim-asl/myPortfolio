import {
  getCourses,
  type BylawVersion,
  ELECTIVE_PLACEHOLDERS,
  electiveGroupForCode,
  electiveListForCode,
  missingPrereqs,
  normCode,
  programRequirementGroupsFor,
  satisfiedElectiveLists,
  coursesUnlockedBy,
  getCourseByCode
} from '../data/curriculum';
import { gradeRank, isPassingGrade } from '../data/grades';

export interface ParsedCourse {
  term: string;
  code: string;
  name: string;
  grade: string;
  hours: number;
  remark?: string;
  case?: string;
  sourcePage?: number;
  attemptIndex?: number;
  confidence?: number;
}

export const extractPdfText = async (file: File): Promise<string> => {
  // Load browser-only PDF.js after the user chooses a file. The worker is copied
  // from the same installed PDF.js version by prepare:gradify for offline use.
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/vendor/gradify/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  try {
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is typeof item & { str: string } => 'str' in item)
        .map(item => item.str)
        .join('\n');
      fullText += pageText + '\n';
    }
    return fullText;
  } finally {
    await loadingTask.destroy();
  }
};

export const parseHeader = (text: string) => {
  const get = (pattern: RegExp, defaultVal = '') => {
    const m = text.match(pattern);
    return m ? m[1].trim() : defaultVal;
  };

  const cgpa = parseFloat(get(/CGPA\s*:\s*([0-9.]+)/i, '0') || '0');
  
  const passedMatch = text.match(/T\.?P\.?Hrs\s*:\s*([0-9]+)\s*(?:of\s*([0-9]+))?/i) 
                   || text.match(/Total\s+Passed\s+Hrs\s*:\s*([0-9]+)\s*(?:of\s*([0-9]+))?/i);
  
  const passedHours = passedMatch ? parseFloat(passedMatch[1]) : 0;
  const totalDegreeHours = passedMatch && passedMatch[2] ? parseFloat(passedMatch[2]) : 160;
  const bylawVersion = totalDegreeHours === 173 ? 'Bylaw_2013' : 'Bylaw_2021';

  const totalRegisteredHours = parseFloat(
    get(/Total\s+Registered\s+Hrs\s*:\s*([0-9.]+)/i, '0') || '0',
  );
  const educationalLevel = get(/Educational\s+Level\s*:\s*([^\n]+)/i, '');
  const totalSemesters = parseInt(
    get(/Total\s+Sem(?:esters|seters)\s*:\s*([0-9]+)/i, '0') || '0',
    10,
  );
  const suspendedSemesters = parseInt(
    get(/Suspended\s+Semesters\s*:\s*([0-9]+)/i, '0') || '0',
    10,
  );
  const studentId = get(/Student\s+ID\s*:\s*([0-9]+)/i, '');
  let studentName = get(/Student\s+Name\s*:\s*([^\n]+)/i, '');
  
  // Clean up weird artifacts like squares or non-letters. Allow English and Arabic letters.
  studentName = studentName.replace(/[^\p{L}\s]/gu, '').trim();
  if (!studentName) studentName = 'Unknown';

  const program = get(/(?:Academic|Acamedic)\s+Program\s*:\s*([^\n]+)/i, '');
  
  // Calculate true GPA Hours using T.Points / CGPA
  const tpointsMatch = [...text.matchAll(/T\.Points\s*:\s*([0-9.]+)/ig)];
  const totalPoints = tpointsMatch.length > 0
    ? parseFloat(tpointsMatch[tpointsMatch.length - 1][1])
    : 0;
  let gpaHours = passedHours;
  if (totalPoints > 0 && cgpa > 0) {
      gpaHours = Math.round(totalPoints / cgpa);
  }
  
  return {
    studentId,
    studentName,
    passedHours,
    totalDegreeHours,
    bylawVersion,
    gpaHours,
    totalPoints,
    cgpa,
    program,
    totalRegisteredHours,
    educationalLevel,
    totalSemesters,
    suspendedSemesters,
  };
};

export const parseCourses = (text: string): ParsedCourse[] => {
  const rows: ParsedCourse[] = [];
  let currentTerm = "";
  
  // Clean empty lines and trim
  const lines = text.split('\n').map(x => x.trim().replace(/\s+/g, ' ')).filter(x => x);
  
  const codeRe = /^([A-Z]{3,4}\s*\d{1,4}\s*(?:[A-Z](?![a-z]))?)$/i;
  const gradeRe = /^(A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D-|D|F|PASS|FAIL|IN|W)$/i;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const tm = line.match(/(\d{4}-\d{4})\s+(Fall|Spring|Summer)/i);
    if (tm) {
      currentTerm = `${tm[1]} ${tm[2]}`;
      i++;
      continue;
    }

    // One-line rows
    const m = line.match(
      /^([A-Z]{3,4}\s*\d{1,4}\s*(?:[A-Z](?![a-z]))?)\s+(.+?)\s+(A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D-|D|F|PASS|FAIL|IN|W)\s+(\d+)(?:\s+(\d+))?(?:\s+(TR))?$/i
    );
    
    if (m) {
      rows.push({
        term: currentTerm,
        code: normCode(m[1]),
        name: m[2].trim(),
        grade: m[3].toUpperCase(),
        hours: parseInt(m[4], 10),
        remark: m[5],
        case: m[6],
        confidence: 1,
      });
      i++;
      continue;
    }

    // Multi-line rows. Course names may wrap over multiple PDF text items.
    if (codeRe.test(line) && i + 3 < lines.length) {
      const code = normCode(line);
      let gradeIndex = -1;
      // Reporting Services sometimes splits long course names into several
      // separate text items. Keep scanning far enough to reach the grade, but
      // stop if a second course code begins before a valid grade/hour pair.
      const scanEnd = Math.min(lines.length - 2, i + 12);
      for (let candidate = i + 2; candidate <= scanEnd; candidate++) {
        if (codeRe.test(lines[candidate])) break;
        const possibleGrade = lines[candidate].toUpperCase();
        const possibleHours = lines[candidate + 1];
        if (gradeRe.test(possibleGrade) && /^\d+$/.test(possibleHours)) {
          gradeIndex = candidate;
          break;
        }
      }

      if (gradeIndex !== -1) {
        const name = lines.slice(i + 1, gradeIndex).join(' ')
          .replace(/\(\s+(\d+)\s+\)/g, '($1)')
          .trim();
        const grade = lines[gradeIndex].toUpperCase();
        const hoursLine = lines[gradeIndex + 1];
        const remark = /^\d+$/.test(lines[gradeIndex + 2] ?? '') ? lines[gradeIndex + 2] : undefined;
        const courseCase = /^(TR)$/i.test(lines[gradeIndex + 3] ?? '') ? lines[gradeIndex + 3].toUpperCase() : undefined;
        rows.push({
          term: currentTerm,
          code,
          name,
          grade,
          hours: parseInt(hoursLine, 10),
          remark,
          case: courseCase,
          confidence: 0.95,
        });
        i = gradeIndex + 2;
        continue;
      }
    }

    i++;
  }

  // Fallback map names from curriculum if parsed name is garbage
  const attemptCounts = new Map<string, number>();
  return rows.map(r => {
    const known = getCourseByCode(r.code);
    const ncode = normCode(r.code);
    const attemptIndex = (attemptCounts.get(ncode) ?? 0) + 1;
    attemptCounts.set(ncode, attemptIndex);
    if (known) {
      // The course code is the stable transcript identifier. Once a row has
      // been recognized, use the authoritative curriculum name so PDF text
      // fragmentation cannot leave a clipped or partially-read course name.
      return {
        ...r,
        code: normCode(known.code),
        name: known.name,
        attemptIndex,
      };
    }
    return { ...r, attemptIndex };
  });
};

export const getBestAttempts = (courses: ParsedCourse[]): ParsedCourse[] => {
  const bestByCode: Record<string, ParsedCourse> = {};

  courses.forEach(c => {
    const ncode = normCode(c.code);
    const existing = bestByCode[ncode];
    if (!existing || gradeRank(c.grade) >= gradeRank(existing.grade)) {
      bestByCode[ncode] = c;
    }
  });
  return Object.values(bestByCode);
};

export const passedCodes = (bestAttempts: ParsedCourse[]): Set<string> => {
  return new Set(bestAttempts.filter(c => isPassingGrade(c.grade)).map(c => normCode(c.code)));
};

export const failedRetakeCourses = (attempts: ParsedCourse[], bestAttempts: ParsedCourse[]): ParsedCourse[] => {
  const passed = passedCodes(bestAttempts);
  const bestMap = new Map(bestAttempts.map(c => [normCode(c.code), c]));
  
  // A course is a failed retake if the BEST attempt is not passed
  return attempts.filter(c => {
    const ncode = normCode(c.code);
    const best = bestMap.get(ncode);
    if (!best) return false;
    
    // Ignore if passed
    if (passed.has(ncode)) return false;
    
    // Only return the latest attempt to show as failed
    const latestAttempt = attempts.filter(x => normCode(x.code) === ncode).pop();
    return latestAttempt === c && ['F', 'FAIL'].includes(c.grade);
  });
};

export const dGradeCourses = (bestAttempts: ParsedCourse[]): ParsedCourse[] => {
  return bestAttempts.filter(
    c => ['D-', 'D', 'D+'].includes(c.grade) && c.hours > 0 && c.case !== 'TR',
  );
};

export const withdrawnCourseAttempts = (attempts: ParsedCourse[]): ParsedCourse[] => {
  const histories = new Map<string, ParsedCourse[]>();
  for (const attempt of attempts) {
    const code = normCode(attempt.code);
    histories.set(code, [...(histories.get(code) ?? []), attempt]);
  }

  return Array.from(histories.values())
    .filter(history => !history.some(attempt => isPassingGrade(attempt.grade)))
    .map(history => history[history.length - 1])
    .filter(attempt => attempt.grade === 'W');
};

export const transferredCourseAttempts = (attempts: ParsedCourse[]): ParsedCourse[] => {
  return attempts.filter(attempt => attempt.case?.toUpperCase() === 'TR');
};

export const graduationNumbers = (passedHours: number, gpaHours: number, currentCGPA: number, targetCGPA: number = 2.0, totalDegreeHours: number = 160, exactTotalPoints?: number) => {
  const currentTotalPoints = Number.isFinite(exactTotalPoints) ? exactTotalPoints! : gpaHours * currentCGPA;
  const exactCGPA = gpaHours > 0 ? currentTotalPoints / gpaHours : currentCGPA;
  const goalMet = Number.isFinite(exactCGPA) && exactCGPA >= targetCGPA;
  const remainingHoursToPass = Math.max(0, totalDegreeHours - passedHours); // e.g. 160 - 130 = 30 hours to pass
  
  // Estimate for NEW graded credits. Repeat/replacement policy needs the
  // course-specific projection and must never determine whether the current
  // CGPA already meets the target.
  const targetPoints = (gpaHours + remainingHoursToPass) * targetCGPA;
  const gap = targetPoints - currentTotalPoints;
  const reqGpaRemaining = remainingHoursToPass > 0 ? Math.max(0, gap / remainingHoursToPass) : goalMet ? 0 : Infinity;
  
  return {
    passedHours,
    remainingHours: remainingHoursToPass,
    targetCGPA,
    goalMet,
    exactCGPA,
    reqGpaRemaining: reqGpaRemaining > 4.0 ? -1 : reqGpaRemaining, // -1 if mathematically impossible
  };
};

export const getProgramCourses = (program?: string, bylawVersion?: BylawVersion) => {
  const allCourses = getCourses(bylawVersion);
  if (!program) return allCourses;

  const allowedCodes = new Set(
    programRequirementGroupsFor(program, bylawVersion)
      .flatMap(group => group.codes)
      .map(normCode),
  );
  return allCourses.filter(course => allowedCodes.has(normCode(course.code)));
};

export const remainingCourses = (bestAttempts: ParsedCourse[], program?: string, bylawVersion?: BylawVersion, isGraduationTerm?: boolean) => {
  const passed = passedCodes(bestAttempts);
  const satisfiedLists = satisfiedElectiveLists(passed, program, bylawVersion);
  
  const programCourses = getProgramCourses(program, bylawVersion);
  
  const remaining = programCourses.filter(c => {
    const ncode = normCode(c.code);
    if (passed.has(ncode)) return false;
    
    // Check if it's an elective placeholder and the list is satisfied
    const listName = electiveListForCode(c.code);
    if (listName && ELECTIVE_PLACEHOLDERS[ncode] && satisfiedLists.has(listName)) {
      return false; // List requirement satisfied
    }

    const electiveGroup = electiveGroupForCode(c.code, program, bylawVersion);
    if (electiveGroup && satisfiedLists.has(electiveGroup)) {
      return false;
    }
    
    return true;
  });

  return remaining.map(c => {
    const missing = missingPrereqs(c, passed);
    // Allow bypassing up to 1 prerequisite in graduation term
    const canBypass = isGraduationTerm && missing.length <= 1;
    return {
      ...c,
      status: (missing.length === 0 || canBypass) ? 'available' : 'blocked',
      missingPrerequisites: missing,
      unlocksNext: coursesUnlockedBy(c.code, bylawVersion),
    };
  });
};

export interface TermGpa {
  term: string;
  sgpa: number;
  cgpa: number;
  /** @deprecated Use sgpa. Kept for compatibility with older chart consumers. */
  gpa: number;
  hours: number;
  points: number;
  cumulativeHours: number;
  cumulativePoints: number;
}

export function formatTermLabel(term: string): string {
  const match = term.match(/^(\d{4})-(\d{4})\s+(Fall|Spring|Summer)$/i);
  if (!match) return term;

  const season = match[3].toLowerCase() === 'fall'
    ? 'F'
    : match[3].toLowerCase() === 'spring'
      ? 'Sp'
      : 'Su';
  return `${match[1].slice(2)}/${match[2].slice(2)} ${season}`;
}

export function groupByTerm(attempts: ParsedCourse[]): TermGpa[] {
  const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0, 'PASS': 0.0, 'FAIL': 0.0, 'W': 0.0,
  };

  const termMap = new Map<string, ParsedCourse[]>();

  for (const c of attempts) {
    if (!c.term) continue;
    const entry = termMap.get(c.term) ?? [];
    entry.push(c);
    termMap.set(c.term, entry);
  }

  const includedByCode = new Map<string, { hours: number; points: number }>();
  let cumulativeHours = 0;
  let cumulativePoints = 0;
  const result: TermGpa[] = [];
  for (const [term, termAttempts] of termMap) {
    let hours = 0;
    let points = 0;

    for (const attempt of termAttempts) {
      // Withdrawals and PASS-only results never enter either GPA denominator.
      if (attempt.grade === 'W' || attempt.grade === 'PASS') continue;

      const attemptPoints = attempt.hours * (gradePoints[attempt.grade] ?? 0);
      hours += attempt.hours;
      points += attemptPoints;

      // Delta University replaces a previous attempt for the same course.
      // Remove that attempt before inserting the new grade so cumulative hours
      // and points match the transcript's CGPA calculation.
      const code = normCode(attempt.code);
      const previous = includedByCode.get(code);
      if (previous) {
        cumulativeHours -= previous.hours;
        cumulativePoints -= previous.points;
      }

      cumulativeHours += attempt.hours;
      cumulativePoints += attemptPoints;
      includedByCode.set(code, { hours: attempt.hours, points: attemptPoints });
    }

    const sgpa = hours > 0 ? points / hours : 0;
    const cgpa = cumulativeHours > 0 ? cumulativePoints / cumulativeHours : 0;
    result.push({
      term,
      sgpa,
      cgpa,
      gpa: sgpa,
      hours,
      points,
      cumulativeHours,
      cumulativePoints,
    });
  }

  return result;
}
