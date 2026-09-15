import { describe, expect, it } from 'vitest';
import type { CourseEntry } from '../../components/tools/gradify/delta/context/GpaContext';
import { buildPrerequisitePassesBySemester } from '../../components/tools/gradify/delta/services/plannedPrerequisites';

function plannedCourse(
  id: number,
  code: string,
  grade: string,
  semesterLabel: string,
): CourseEntry {
  return {
    id,
    code,
    name: code,
    hours: '3',
    grade,
    status: 'new',
    oldGrade: '',
    retakeCount: 1,
    semesterLabel,
    semesterType: 'Fall',
    replacementOfCode: '',
    replacementOldHours: '',
    electiveGroupId: '',
  };
}

describe('planned prerequisite carry-forward', () => {
  it('unlocks a course chain only in later terms after passing expected grades', () => {
    const passes = buildPrerequisitePassesBySemester(
      ['BAS022'],
      ['Term 1', 'Term 2', 'Term 3'],
      [
        plannedCourse(1, 'ECE111', 'C', 'Term 1'),
        plannedCourse(2, 'ECE114', 'B', 'Term 2'),
      ],
    );

    expect(passes.get('Term 1')).toEqual(new Set(['BAS022']));
    expect(passes.get('Term 2')).toEqual(new Set(['BAS022', 'ECE111']));
    expect(passes.get('Term 3')).toEqual(new Set(['BAS022', 'ECE111', 'ECE114']));
  });

  it('does not unlock later courses after a blank or failing expected grade', () => {
    const passes = buildPrerequisitePassesBySemester(
      [],
      ['Term 1', 'Term 2'],
      [
        plannedCourse(1, 'ECE111', 'F', 'Term 1'),
        plannedCourse(2, 'ECE112', '', 'Term 1'),
      ],
    );

    expect(passes.get('Term 2')).toEqual(new Set());
  });
});
