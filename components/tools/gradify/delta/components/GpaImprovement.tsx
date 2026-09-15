import { AlertCircle, ArrowUpRight } from 'lucide-react';
import type { ParsedCourse } from '../services/pdfParser';
import { useGpa } from '../context/GpaContext';
import { getCourseByCode } from '../data/curriculum';
import { pointsForGrade } from '../data/grades';

interface GpaImprovementProps {
  attempts: ParsedCourse[];
  semesterType: 'Fall' | 'Spring' | 'Summer';
}

export default function GpaImprovement({ attempts, semesterType }: GpaImprovementProps) {
  const { studentInfo } = useGpa();

  const bestAttempts = new Map<string, ParsedCourse>();
  for (const a of attempts) {
    if (!a.grade || a.grade === 'W') continue;
    const existing = bestAttempts.get(a.code);
    const aPoints = pointsForGrade(a.grade);
    const existingPoints = existing ? pointsForGrade(existing.grade) : -1;
    if (!existing || aPoints > existingPoints) {
      bestAttempts.set(a.code, a);
    }
  }

  const candidates = Array.from(bestAttempts.values())
    .filter(a => pointsForGrade(a.grade) <= 2.0)
    .map(a => {
      const course = getCourseByCode(a.code, studentInfo?.bylawVersion);
      return {
        attempt: a,
        course,
        inSeason: course ? (
          (semesterType === 'Fall' && course.semester === 'Semester 1') ||
          (semesterType === 'Spring' && course.semester === 'Semester 2') ||
          (course.semester === 'Both')
        ) : false
      };
    })
    .filter(c => c.course !== undefined)
    .sort((a, b) => b.inSeason === a.inSeason ? 0 : a.inSeason ? -1 : 1);

  if (candidates.length === 0) return null;

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-2xl mt-6">
      <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-4">
        <ArrowUpRight size={20} className="text-indigo-600" />
        GPA Improvement Opportunities
      </h3>
      <p className="text-sm text-indigo-700 mb-4">
        These are courses you have previously taken with a grade of C, D, or F. Retaking them can significantly improve your CGPA.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {candidates.map(c => (
          <div key={c.attempt.code} className="bg-white p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">{c.attempt.code}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  Current: {c.attempt.grade}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]" title={c.course!.name}>
                {c.course!.name}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              {c.inSeason ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">In Season</span>
              ) : (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1">
                  <AlertCircle size={12} /> Out of Season
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
