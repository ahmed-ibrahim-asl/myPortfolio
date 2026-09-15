import referenceProfiles from './reference-profiles.json';

export interface UniversityGrade {
  grade: string;
  points: number;
  /** Inclusive lower bound, only when the source supplies percentage thresholds. */
  minPercent?: number;
}

export interface UniversityProfile {
  id: string;
  name: string;
  arabicName: string;
  status: 'delta-tested' | 'reference' | 'custom';
  sourceUrl: string;
  note: string;
  grades: UniversityGrade[];
  maxGpa: number;
}

export const UNIVERSITY_PROFILES: UniversityProfile[] = [
  {
    id: 'delta', name: 'Delta University · Engineering', arabicName: 'جامعة الدلتا · الهندسة', status: 'delta-tested', maxGpa: 4,
    sourceUrl: 'https://engineering.deltauniv.edu.eg/Uploads/ca061658-165d-42bb-907b-064c463a52c0_79.pdf',
    note: 'The existing Gradify engineering workflow is tested for Delta. The quick calculator uses the engineering percentage scale. Transcript, repeat, bylaw and prerequisite rules are available in the Delta planner.',
    grades: [
      { grade: 'A+', points: 4, minPercent: 97 }, { grade: 'A', points: 4, minPercent: 93 },
      { grade: 'A-', points: 3.7, minPercent: 89 }, { grade: 'B+', points: 3.3, minPercent: 84 },
      { grade: 'B', points: 3, minPercent: 80 }, { grade: 'B-', points: 2.7, minPercent: 76 },
      { grade: 'C+', points: 2.3, minPercent: 73 }, { grade: 'C', points: 2, minPercent: 70 },
      { grade: 'C-', points: 1.7, minPercent: 67 }, { grade: 'D+', points: 1.3, minPercent: 64 },
      { grade: 'D', points: 1, minPercent: 60 }, { grade: 'F', points: 0, minPercent: 0 },
    ],
  },
  {
    id: 'auc', name: 'American University in Cairo · Undergraduate', arabicName: 'الجامعة الأمريكية بالقاهرة · البكالوريوس', status: 'reference', maxGpa: 4,
    sourceUrl: 'https://www.aucegypt.edu/admissions/international-students/grading-examination',
    note: 'Letter points are corroborated by the AUC grading page. Percentage thresholds depend on the course. This profile has not been validated with student transcripts; repeat and non-GPA policies are not included.',
    grades: [
      { grade: 'A', points: 4 }, { grade: 'A-', points: 3.7 }, { grade: 'B+', points: 3.3 },
      { grade: 'B', points: 3 }, { grade: 'B-', points: 2.7 }, { grade: 'C+', points: 2.3 },
      { grade: 'C', points: 2 }, { grade: 'C-', points: 1.7 }, { grade: 'D+', points: 1.3 },
      { grade: 'D', points: 1 }, { grade: 'F', points: 0 },
    ],
  },
  ...(referenceProfiles as UniversityProfile[]),
  {
    id: 'custom', name: 'Other university · Custom scale', arabicName: 'جامعة أخرى · سلم مخصص', status: 'custom', maxGpa: 4,
    sourceUrl: '', note: 'Enter the grade points from your faculty handbook before calculating. No university rules are assumed.',
    grades: [],
  },
];

export function getUniversityProfile(id: string): UniversityProfile {
  return UNIVERSITY_PROFILES.find(profile => profile.id === id) ?? UNIVERSITY_PROFILES[UNIVERSITY_PROFILES.length - 1];
}
