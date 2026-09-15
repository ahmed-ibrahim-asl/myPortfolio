// Synthetic, non-personal transcript for local browser import verification.
import { jsPDF } from 'jspdf';
import { mkdirSync } from 'node:fs';
const pdf = new jsPDF();
pdf.setFontSize(12);
pdf.text([
  'Delta University - Synthetic test transcript',
  'Student Name: Test Student',
  'Student ID: TEST000',
  'Academic Program: Communications Engineering',
  'CGPA: 3.000',
  'T.P.Hrs: 5 of 160',
  'T.Points: 15.000',
  'Total Registered Hrs: 5',
  '2025-2026 Fall',
  'GEN001',
  'Introduction to Information and Communication Technology',
  'B',
  '2',
  '1',
  'BAS021',
  'Engineering Physics (1)',
  'B',
  '3',
  '1',
], 20, 20, { lineHeightFactor:1.3 });
mkdirSync('test-results/gradify', {recursive:true});
pdf.save('test-results/gradify/synthetic-transcript.pdf');
console.log('Created test-results/gradify/synthetic-transcript.pdf');
