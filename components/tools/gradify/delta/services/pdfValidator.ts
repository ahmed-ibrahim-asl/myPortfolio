export function validatePdfText(text: string): { valid: boolean; reason?: string } {
  if (!text || text.trim().length < 50) {
    return { valid: false, reason: 'File appears empty or unreadable.' };
  }

  const hasStudentInfo = /student\s+(name|id|code)/i.test(text);
  const hasCGPA = /\bCGPA\b/i.test(text);
  const hasCourseCode = /(BAS|ECE|MEC|CIV|GEN|ARC)\s*\d{3}[A-Za-z]?/i.test(text);
  const hasGrade = /\b(A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D|F|PASS|FAIL)\b/i.test(text);
  const hasTerm = /\d{4}-\d{4}\s+(Fall|Spring|Summer)/i.test(text);

  const signals = [hasStudentInfo, hasCGPA, hasCourseCode, hasGrade, hasTerm];
  const score = signals.filter(Boolean).length;

  if (score < 2) {
    return {
      valid: false,
      reason: 'This file does not appear to be a valid academic transcript from Delta University.',
    };
  }

  return { valid: true };
}
