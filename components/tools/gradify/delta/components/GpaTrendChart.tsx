import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatTermLabel, type TermGpa } from '../services/pdfParser';
import { roundGpa } from '../data/grades';

interface Props {
  data: TermGpa[];
}

export default function GpaTrendChart({ data }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map(d => ({
    term: formatTermLabel(d.term),
    sgpa: roundGpa(d.sgpa),
    cgpa: roundGpa(d.cgpa),
  }));

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200">
      <h4 className="text-sm font-bold text-slate-700">Academic GPA Trend</h4>
      <p className="mb-3 mt-1 text-[11px] text-slate-500">
        Semester GPA compared with cumulative GPA after each term
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="term" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            labelStyle={{ fontWeight: 600, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="sgpa"
            name="Semester GPA"
            stroke="#6366f1"
            strokeWidth={2.25}
            dot={{ fill: '#6366f1', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="cgpa"
            name="Cumulative GPA"
            stroke="#d97706"
            strokeWidth={2.5}
            dot={{ fill: '#d97706', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
