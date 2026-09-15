export interface Assessment { id: string; name: string; earned: string; maximum: string }

export function calculateCoursework(rows: Assessment[]) {
  const errors: string[] = [];
  let earned = 0;
  let maximum = 0;
  rows.forEach((row, index) => {
    if (!row.earned.trim() && !row.maximum.trim()) return;
    const score = Number(row.earned);
    const outOf = Number(row.maximum);
    if (!row.earned.trim() || !row.maximum.trim() || !Number.isFinite(score) || !Number.isFinite(outOf) || score < 0 || outOf <= 0 || score > outOf) {
      errors.push(`${row.name.trim() || `Assessment ${index + 1}`}: earned marks must be between 0 and the maximum marks.`);
      return;
    }
    earned += score;
    maximum += outOf;
  });
  return { earned, maximum, percent: !errors.length && maximum > 0 ? earned / maximum * 100 : null, errors };
}
