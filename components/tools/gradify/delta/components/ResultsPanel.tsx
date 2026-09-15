import { BarChart3, CheckCircle2 } from 'lucide-react';
import { useGpa } from '../context/GpaContext';
import { calculateGPA } from '../services/gpaCalculation';

export { calculateGPA } from '../services/gpaCalculation';

export function useGpaResults() {
  const { courses, gpaHours, passedHours, previousCGPA, previousTotalPoints } = useGpa();
  return calculateGPA(courses, gpaHours, passedHours, previousCGPA, previousTotalPoints);
}

export default function ResultsPanel() {
  const results = useGpaResults();
  const hasSemesterResult = Number(results.semesterGPA) > 0;
  const hasCumulativeResult = Number(results.cgpa) > 0;

  return (
    <div className="sticky top-6 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <header className="flex items-center gap-2 border-b border-slate-300 bg-slate-200 px-4 py-3">
        <BarChart3 size={18} className="text-indigo-700" aria-hidden="true" />
        <h2 className="text-sm font-bold text-slate-800">Calculation Results</h2>
      </header>

      <div className="grid grid-cols-2 gap-2 p-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Semester GPA
          </p>
          <p className="mt-1 text-2xl font-bold text-indigo-700">
            {hasSemesterResult ? results.semesterGPA : 'N/A'}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Projected CGPA
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {hasCumulativeResult ? results.cgpa : 'N/A'}
          </p>
        </div>
      </div>

      <dl className="divide-y divide-slate-100 border-y border-slate-200 px-4">
        <div className="flex items-center justify-between py-3 text-xs">
          <dt className="text-slate-500">Semester Hours (GPA)</dt>
          <dd className="font-bold text-slate-800">{results.semesterHours}</dd>
        </div>
        <div className="flex items-center justify-between py-3 text-xs">
          <dt className="text-slate-500">Total Hours (GPA)</dt>
          <dd className="font-bold text-slate-800">{results.totalHours}</dd>
        </div>
        <div className="flex items-center justify-between py-3 text-xs">
          <dt className="text-slate-500">Total Earned Hours</dt>
          <dd className="font-bold text-emerald-700">{results.totalEarned}</dd>
        </div>
      </dl>

      <div className="space-y-2 p-4 text-[10px] leading-4 text-slate-500">
        <p className="flex items-start gap-1.5">
          <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          PASS grades count toward earned hours but not GPA points.
        </p>
        <p>
          Retakes and improvements replace the old grade points; their hours are never double-counted.
        </p>
      </div>
    </div>
  );
}
