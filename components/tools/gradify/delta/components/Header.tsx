import { useRef } from 'react';
import { Upload, RotateCcw } from 'lucide-react';
import { useGpa } from '../context/GpaContext';
import { useToast } from '../context/ToastContext';
import {
  PROGRAM_LABELS,
  PROGRAM_OPTIONS,
  type ProgramId,
  type BylawVersion,
} from '../data/curriculum';
import { extractPdfText, parseHeader, parseCourses } from '../services/pdfParser';
import { emptyPlanningPreferences } from '../services/planningPreferences';
import { analyzeTranscript } from '../services/transcriptAnalysis';

export default function Header() {
  const {
    isParsing,
    studentInfo,
    selectedProgram,
    courses,
    passedHours,
    previousCGPA,
    setStudentInfo,
    setPreviousCGPA,
    setPreviousTotalPoints,
    setSelectedProgram,
    setGpaHours,
    setPassedHours,
    setRawAttempts,
    setBestAttempts,
    setCourses,
    setIsParsing,
    setActiveTab,
    setBackendData,
    setPlanningPreferences,
  } = useGpa();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const text = await extractPdfText(file);
      
      const rawAttempts = parseCourses(text);
      if (rawAttempts.length === 0) {
        addToast('Could not extract any course data. Make sure it is a valid transcript.', 'error');
        setIsParsing(false);
        return;
      }

      const header = parseHeader(text);

      const data = analyzeTranscript(header, rawAttempts);

      setPlanningPreferences(emptyPlanningPreferences());
      setSelectedProgram(data.program);
      setStudentInfo({
        name: data.header.studentName === 'Unknown' ? '' : (data.header.studentName || ''),
        id: data.header.studentId,
        program: data.header.program || PROGRAM_LABELS[data.program as ProgramId],
        totalRegisteredHours: data.header.totalRegisteredHours,
        educationalLevel: data.header.educationalLevel,
        totalSemesters: data.header.totalSemesters,
        suspendedSemesters: data.header.suspendedSemesters,
        totalDegreeHours: data.header.totalDegreeHours,
        bylawVersion: data.bylawVersion as BylawVersion,
      });
      
      setPreviousCGPA(data.header.cgpa.toString());
      setPreviousTotalPoints(data.header.totalPoints > 0 ? data.header.totalPoints.toString() : '');
      setGpaHours(data.header.gpaHours.toString());
      setPassedHours(data.header.passedHours.toString());
      
      setRawAttempts(data.rawAttempts);
      setBestAttempts(data.bestAttempts);
      
      setBackendData({
        limit: data.limit,
        remaining: data.remaining,
        failed: data.failed,
        withdrawn: data.withdrawn,
        transferred: data.transferred,
        sameCourseImprovements: data.sameCourseImprovements,
        electiveReplacements: data.electiveReplacements,
      });

      setCourses([{
        id: Date.now(),
        code: '',
        name: '',
        hours: '',
        grade: '',
        status: 'new',
        oldGrade: '',
        retakeCount: 1,
        semesterLabel: 'Semester 1',
        semesterType: 'Fall',
        replacementOfCode: '',
        replacementOldHours: '',
        electiveGroupId: '',
      }]);

      addToast('Transcript processed successfully!', 'success');
      setActiveTab('planner');
    } catch (error) {
      console.error(error);
      addToast('Could not read this PDF. Use a text-based Delta transcript and try again.', 'error');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProgramChange = (program: ProgramId) => {
    if (program === selectedProgram) return;
    const hadPlannedCourses = courses.some(course => Boolean(course.code));
    setPlanningPreferences(emptyPlanningPreferences());
    setSelectedProgram(program);
    setStudentInfo(current => current
      ? { ...current, program: PROGRAM_LABELS[program] }
      : current
    );
    setCourses([{
      id: Date.now(),
      code: '',
      name: '',
      hours: '',
      grade: '',
      status: 'new',
      oldGrade: '',
      retakeCount: 1,
      semesterLabel: 'Semester 1',
      semesterType: 'Fall',
      replacementOfCode: '',
      replacementOldHours: '',
      electiveGroupId: '',
    }]);
    addToast(
      hadPlannedCourses
        ? `Program changed to ${PROGRAM_LABELS[program]}. The previous registration plan was cleared.`
        : `Program changed to ${PROGRAM_LABELS[program]}.`,
      'success',
    );
  };

  const handleResetTranscript = () => {
    setPlanningPreferences(emptyPlanningPreferences());
    setStudentInfo(null);
    setPreviousCGPA('');
    setPreviousTotalPoints('');
    setGpaHours('0');
    setPassedHours('0');
    setRawAttempts([]);
    setBestAttempts([]);
    setBackendData();
    setCourses([{
      id: Date.now(),
      code: '',
      name: '',
      hours: '',
      grade: '',
      status: 'new',
      oldGrade: '',
      retakeCount: 1,
      semesterLabel: 'Semester 1',
      semesterType: 'Fall',
      replacementOfCode: '',
      replacementOldHours: '',
      electiveGroupId: '',
    }]);
    setActiveTab('calculator');
    if (fileInputRef.current) fileInputRef.current.value = '';
    addToast('Transcript and registration plan cleared.', 'success');
  };

  let computedLevel = studentInfo?.educationalLevel || 'Not detected';
  if (studentInfo?.totalDegreeHours && passedHours) {
    const passed = parseFloat(passedHours) || 0;
    const ratio = passed / studentInfo.totalDegreeHours;
    if (ratio <= 0.20) computedLevel = 'Level 000';
    else if (ratio <= 0.40) computedLevel = 'Level 100';
    else if (ratio <= 0.60) computedLevel = 'Level 200';
    else if (ratio <= 0.80) computedLevel = 'Level 300';
    else computedLevel = 'Level 400';
  }

  return (
    <div className="bg-white p-4 border border-slate-300 rounded-xl sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Your academic record</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a program to plan manually, or import your Delta transcript.</p>
        </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isParsing}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition font-medium disabled:opacity-50"
        >
          <Upload size={18} />
          {isParsing
            ? 'Analyzing...'
            : studentInfo
              ? 'Replace Transcript'
              : 'Upload Transcript (PDF)'}
        </button>
        {studentInfo && (
          <button
            type="button"
            onClick={handleResetTranscript}
            disabled={isParsing}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            aria-label="Reset transcript"
          >
            <RotateCcw size={18} />
            Reset Transcript
          </button>
        )}
      </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">PDFs are processed in your browser. Your transcript is not uploaded.</p>

      {!studentInfo && (
        <section
          aria-label="Academic program selection"
          className="mt-5 max-w-2xl rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-left"
        >
          <label htmlFor="academic-program" className="block text-xs font-bold uppercase tracking-wide text-indigo-700">
            Start by choosing your academic program
          </label>
          <select
            id="academic-program"
            aria-label="Academic program"
            value={selectedProgram}
            onChange={event => handleProgramChange(event.target.value as ProgramId)}
            className="mt-2 h-[42px] w-full rounded-lg border border-indigo-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {PROGRAM_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-slate-600">
            Course groups, electives, prerequisites, and registration choices below are limited to this curriculum.
          </p>
        </section>
      )}

      {studentInfo && (
        <section
          aria-label="Student academic summary"
          className="mt-5 overflow-hidden border-y border-slate-400 bg-white text-left text-xs sm:text-sm"
        >
          <div className="grid sm:grid-cols-2">
            <div className="border-b border-slate-300 px-2 py-1.5">
              Student ID: <span className="font-medium">{studentInfo.id || 'Not detected'}</span>
            </div>
            <label className="delta-student-name flex min-w-0 items-center gap-2 border-b border-slate-300 px-3 py-2">
              <span className="shrink-0">Student Name:</span>
              <input
                type="text"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your name"
                dir="auto"
              />
            </label>
            <div className="border-b border-slate-300 px-2 py-1.5">
              Total Passed Hrs: <span className="font-medium">{passedHours || 0} of {studentInfo?.totalDegreeHours || 160}</span>
            </div>
            <div className="border-b border-slate-300 px-2 py-1.5">
              Total Registered Hrs:{' '}
              <span className="font-medium">{studentInfo.totalRegisteredHours ?? 0}</span>
            </div>
            <div className="border-b border-slate-300 px-2 py-1.5">
              Educational Level:{' '}
              <span className="font-medium">{computedLevel}</span>
            </div>
            <div className="border-b border-slate-300 px-2 py-1.5">
              CGPA: <span className="font-medium">{previousCGPA || 0}</span>
            </div>
            <div className="border-b border-slate-300 px-2 py-1.5">
              Total Semesters: <span className="font-medium">{studentInfo.totalSemesters ?? 0}</span>
            </div>
            <div className="border-b border-slate-300 px-2 py-1.5">
              Suspended Semesters:{' '}
              <span className="font-medium">{studentInfo.suspendedSemesters ?? 0}</span>
            </div>
          </div>
          <div className="px-2 py-1.5">
            Academic Program:{' '}
            <span className="font-medium">{studentInfo.program || 'Not detected'}</span>
          </div>
        </section>
      )}
    </div>
  );
}
