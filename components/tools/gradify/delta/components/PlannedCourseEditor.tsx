import {
  AlertTriangle,
  ArrowRight,
  CirclePlus,
  FileClock,
  RefreshCcw,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type { CourseEntry } from '../context/GpaContext';
import {
  gradeScale,
  isPriorityImprovementGrade,
  pointsForGrade,
} from '../data/grades';

interface Props {
  course: CourseEntry;
  onGradeChange: (grade: string) => void;
  onRemove: () => void;
}

function statusDetails(course: CourseEntry) {
  if (course.replacementOfCode) {
    return {
      label: 'Elective replacement',
      description: `${course.code} replaces ${course.replacementOfCode} (${course.oldGrade})`,
      className: 'border-violet-200 bg-violet-50 text-violet-800',
      icon: Sparkles,
    };
  }
  if (course.status === 'retaken') {
    return {
      label: 'Failed retake',
      description: `Attempt ${course.retakeCount} - Previous grade ${course.oldGrade}`,
      className: 'border-red-200 bg-red-50 text-red-800',
      icon: RefreshCcw,
    };
  }
  if (course.status === 'improvement') {
    return {
      label: 'Improvement',
      description: `Attempt ${course.retakeCount} - Previous grade ${course.oldGrade}`,
      className: 'border-amber-200 bg-amber-50 text-amber-800',
      icon: TrendingUp,
    };
  }
  if (course.status === 'withdrawn') {
    return {
      label: 'Withdrawn course',
      description: `Attempt ${course.retakeCount} - Previous result W`,
      className: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800',
      icon: FileClock,
    };
  }
  return {
    label: 'New course',
    description: 'No previous attempt found in the transcript',
    className: 'border-sky-200 bg-sky-50 text-sky-800',
    icon: CirclePlus,
  };
}

export default function PlannedCourseEditor({
  course,
  onGradeChange,
  onRemove,
}: Props) {
  const details = statusDetails(course);
  const StatusIcon = details.icon;
  const isRepeat = course.status === 'retaken' || course.status === 'improvement';
  const isElectiveReplacement = Boolean(course.replacementOfCode);
  const attemptNumber = Number(course.retakeCount) || 1;
  const maxGrade = isRepeat && !isElectiveReplacement
    ? (attemptNumber <= 2 ? 'B+' : 'C')
    : null;
  const maxPoints = maxGrade ? pointsForGrade(maxGrade) : 4;
  const showImprovementAdvisory = course.status === 'improvement'
    && Boolean(course.oldGrade)
    && !isPriorityImprovementGrade(course.oldGrade);
  const availableGrades = gradeScale.filter(option => {
    if (!isRepeat || isElectiveReplacement) return true;
    if (option.grade === 'PASS' || option.grade === 'FAIL') return false;
    return option.points <= maxPoints;
  });

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[minmax(0,1fr)_210px_44px] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 text-sm text-slate-700">
            <span className="font-mono font-normal">{course.code}</span>
            <span aria-hidden="true">: </span>
            <span className="font-bold text-slate-900">{course.name}</span>
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {course.hours} hrs
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${details.className}`}>
            <StatusIcon size={12} aria-hidden="true" />
            Auto-detected: {details.label}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
          <ArrowRight size={11} aria-hidden="true" />
          {details.description}
        </p>
        {showImprovementAdvisory && (
          <p className="mt-2 flex items-start gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] font-medium text-amber-800">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            This improvement is allowed, but it is not ideal. Prioritize courses with D-, D, or D+ first.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={`planned-grade-${course.id}`}
          className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500"
        >
          Expected grade
          {maxGrade && <span className="ml-1 normal-case text-amber-600">- Max {maxGrade}</span>}
        </label>
        <select
          id={`planned-grade-${course.id}`}
          value={course.grade}
          onChange={event => onGradeChange(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select grade</option>
          {availableGrades.map(option => (
            <option key={option.grade} value={option.grade}>{option.label}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        aria-label={`Remove ${course.code} from this term`}
      >
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
