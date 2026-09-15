import { programIdFromName, type BylawVersion } from '../data/curriculum';
import { electiveReplacementOptions, sameCourseImprovementCandidates } from './academicHistory';
import { getRegistrationLimit } from './registrationPolicy';
import {
  failedRetakeCourses,
  getBestAttempts,
  parseHeader,
  remainingCourses,
  transferredCourseAttempts,
  withdrawnCourseAttempts,
  type ParsedCourse,
} from './pdfParser';

/**
 * Local equivalent of Gradify's analyze-transcript endpoint. All transcript
 * data stays in this browser, and every consumer uses the same tested rules.
 */
export function analyzeTranscript(
  header: ReturnType<typeof parseHeader>,
  rawAttempts: ParsedCourse[],
) {
  if (rawAttempts.length === 0) {
    throw new Error('Could not extract any course data. Make sure it is a valid transcript.');
  }

  const bestAttempts = getBestAttempts(rawAttempts);
  const program = header.program ? programIdFromName(header.program) : 'communications';
  const bylawVersion = header.bylawVersion as BylawVersion;
  const limit = getRegistrationLimit({
    gpa: header.cgpa,
    semesterType: 'Fall',
    remainingHours: header.totalDegreeHours - header.passedHours,
  });

  return {
    header,
    rawAttempts,
    bestAttempts,
    program,
    bylawVersion,
    limit,
    remaining: remainingCourses(bestAttempts, program, bylawVersion, limit.isGraduationTerm),
    failed: failedRetakeCourses(rawAttempts, bestAttempts),
    withdrawn: withdrawnCourseAttempts(rawAttempts),
    transferred: transferredCourseAttempts(rawAttempts),
    sameCourseImprovements: sameCourseImprovementCandidates(rawAttempts, program, bylawVersion),
    electiveReplacements: electiveReplacementOptions(bestAttempts, new Set(), program, bylawVersion),
  };
}
