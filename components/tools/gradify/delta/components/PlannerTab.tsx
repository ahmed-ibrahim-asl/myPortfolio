import { useGpa } from '../context/GpaContext';
import MultiTermPlanner from './MultiTermPlanner';

export default function PlannerTab() {
  const { rawAttempts, isParsing, selectedProgram, studentInfo } = useGpa();

  if (isParsing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">Analyzing transcript and calculating prerequisites...</p>
        <p className="text-sm mt-2 opacity-75">This will just take a moment</p>
      </div>
    );
  }

  if (rawAttempts.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Transcript First</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          We need your academic history to determine your remaining courses and build a personalized graduation plan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MultiTermPlanner key={`${selectedProgram}:${studentInfo?.bylawVersion}:${studentInfo?.id}:${rawAttempts.map(c => `${c.code}:${c.grade}`).join("|")}`} />
    </div>
  );
}
