import {
  ArrowLeftRight,
  CalendarCheck2,
  Check,
  CirclePlus,
  FileClock,
  LockKeyhole,
  RefreshCcw,
  TrendingUp,
} from 'lucide-react';
import type { Course } from '../data/curriculum';

export type ProgramCourseCardState =
  | 'available'
  | 'blocked'
  | 'completed'
  | 'failed'
  | 'improvement'
  | 'withdrawn'
  | 'transferred'
  | 'planned'
  | 'selected';

interface Props {
  course: Course;
  state: ProgramCourseCardState;
  statusLabel: string;
  onSelect?: () => void;
}

const stateStyles: Record<ProgramCourseCardState, string> = {
  available: 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/60',
  blocked: 'border-slate-200 bg-slate-50 text-slate-400',
  completed: 'border-emerald-400 bg-emerald-50/40',
  failed: 'border-red-400 bg-red-50/60 hover:border-red-500',
  improvement: 'border-amber-400 bg-amber-50/60 hover:border-amber-500',
  withdrawn: 'border-fuchsia-300 bg-fuchsia-50/60 hover:border-fuchsia-400',
  transferred: 'border-cyan-400 bg-cyan-50/60',
  planned: 'border-sky-400 bg-sky-50/60',
  selected: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100',
};

const statusStyles: Record<ProgramCourseCardState, string> = {
  available: 'text-indigo-600',
  blocked: 'text-slate-400',
  completed: 'text-emerald-700',
  failed: 'text-red-700',
  improvement: 'text-amber-700',
  withdrawn: 'text-fuchsia-700',
  transferred: 'text-cyan-800',
  planned: 'text-sky-700',
  selected: 'text-indigo-700',
};

function StateIcon({ state }: { state: ProgramCourseCardState }) {
  const props = { size: 13, strokeWidth: 2.25, 'aria-hidden': true };
  if (state === 'completed') return <Check {...props} />;
  if (state === 'failed') return <RefreshCcw {...props} />;
  if (state === 'improvement') return <TrendingUp {...props} />;
  if (state === 'withdrawn') return <FileClock {...props} />;
  if (state === 'transferred') return <ArrowLeftRight {...props} />;
  if (state === 'blocked') return <LockKeyhole {...props} />;
  if (state === 'planned' || state === 'selected') return <CalendarCheck2 {...props} />;
  return <CirclePlus {...props} />;
}

export default function ProgramCourseCard({
  course,
  state,
  statusLabel,
  onSelect,
}: Props) {
  const disabled = !onSelect;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-label={`${course.code} ${course.name}. ${statusLabel}`}
      aria-pressed={state === 'selected'}
      className={`relative min-h-[92px] w-full rounded-md border p-3 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-default ${stateStyles[state]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[11px] leading-4 text-slate-700">
          <span className="font-mono font-normal tracking-tight">{course.code}</span>
          <span aria-hidden="true">: </span>
          <span className="font-bold text-slate-800">{course.name}</span>
        </p>
        <span className="shrink-0 rounded-full border border-current/20 bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
          {course.hours} hrs
        </span>
      </div>
      <div className={`mt-2 flex items-center gap-1 text-[10px] font-semibold ${statusStyles[state]}`}>
        <StateIcon state={state} />
        <span className="truncate">{statusLabel}</span>
      </div>
    </button>
  );
}
