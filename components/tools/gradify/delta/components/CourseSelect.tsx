import { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, ChevronDown } from 'lucide-react';
import { getCourses, type Course } from '../data/curriculum';
import { useGpa } from '../context/GpaContext';

interface Props {
  value: string;
  onChange: (code: string, name: string, hours: number) => void;
  placeholder?: string;
  courses?: Course[];
  disabledReason?: (course: Course) => string | null;
}

const levels = ['L0', 'L1', 'L2', 'L3', 'L4'];

export default function CourseSelect({
  value,
  onChange,
  placeholder,
  courses,
  disabledReason,
}: Props) {
  const { studentInfo } = useGpa();
  const currentCourses = courses || getCourses(studentInfo?.bylawVersion);
  
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = currentCourses.filter(c => {
    if (!query) return true;
    const q = query.toLowerCase().replace(/\s+/g, '');
    const code = c.code.toLowerCase().replace(/\s+/g, '');
    return (
      code.includes(q) || c.name.toLowerCase().includes(query.toLowerCase())
    );
  });

  const grouped = levels
    .map(level => ({
      level,
      label: level.replace('L', 'Level '),
      courses: filtered.filter(c => c.level === level),
    }))
    .filter(g => g.courses.length > 0);

  const selectedName = currentCourses.find(c => c.code === value)?.name;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full p-2.5 h-[42px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-left flex items-center justify-between cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        <span className={`truncate ${selectedName ? '' : 'text-slate-400'}`}>
          {selectedName || (placeholder || 'Select a course')}
        </span>
        <ChevronDown size={16} className="text-slate-400 flex-shrink-0 ml-1" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by code or name..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {grouped.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-sm">No results found</p>
            ) : (
              grouped.map(g => (
                <div key={g.level}>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-500 sticky top-0">
                    <BookOpen size={12} />
                    {g.label}
                  </div>
                  {g.courses.map(c => {
                    const isSelected = c.code === value;
                    const reason = disabledReason?.(c) ?? null;
                    return (
                      <button
                        type="button"
                        key={c.code}
                        disabled={Boolean(reason)}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                          reason
                            ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                            : 'cursor-pointer hover:bg-blue-50'
                        } ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                        onClick={() => {
                          if (reason) return;
                          onChange(c.code, c.name, c.hours);
                          setOpen(false);
                          setQuery('');
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-mono text-slate-400 flex-shrink-0">{c.code}</span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-2 text-right">
                          {c.hours} hrs
                          {reason && <span className="block text-[10px] text-amber-600 max-w-32">{reason}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
