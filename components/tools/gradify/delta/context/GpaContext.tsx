import { createContext, useContext, useState, useCallback, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { type ParsedCourse } from '../services/pdfParser';
import {
  replaceTranscriptBackendData,
  type TranscriptBackendData,
} from '../services/transcriptBackendData';
import type { ElectiveGroupId, ProgramId } from '../data/curriculum';
import type { SemesterType } from '../services/registrationPolicy';
import { emptyPlanningPreferences, type PlanningPreferences } from '../services/planningPreferences';

export interface CourseEntry {
  id: number;
  code: string;
  name: string;
  hours: string;
  grade: string;
  status: 'new' | 'retaken' | 'improvement' | 'withdrawn' | 'transferred';
  oldGrade: string;
  retakeCount: number;
  semesterLabel: string;
  semesterType: SemesterType;
  replacementOfCode: string;
  replacementOldHours: string;
  electiveGroupId: ElectiveGroupId | '';
}

export interface StudentInfo {
  name: string;
  id: string;
  program?: string;
  totalRegisteredHours?: number;
  educationalLevel?: string;
  totalSemesters?: number;
  suspendedSemesters?: number;
  totalDegreeHours?: number;
  bylawVersion?: 'Bylaw_2013' | 'Bylaw_2021';
}

interface GpaState {
  gpaHours: string;
  passedHours: string;
  previousCGPA: string;
  previousTotalPoints: string;
  selectedProgram: ProgramId;
  studentInfo: StudentInfo | null;
  isParsing: boolean;
  activeTab: 'calculator' | 'planner';
  rawAttempts: ParsedCourse[];
  bestAttempts: ParsedCourse[];
  courses: CourseEntry[];
  
  // Backend data
  limit?: any;
  remaining?: any[];
  failed?: any[];
  withdrawn?: any[];
  transferred?: any[];
  sameCourseImprovements?: any[];
  electiveReplacements?: any[];
}

interface GpaContextType extends GpaState {
  planningPreferences: PlanningPreferences;
  setPlanningPreferences: Dispatch<SetStateAction<PlanningPreferences>>;
  setGpaHours: (v: string) => void;
  setPassedHours: (v: string) => void;
  setPreviousCGPA: (v: string) => void;
  setPreviousTotalPoints: (v: string) => void;
  setSelectedProgram: (v: ProgramId) => void;
  setStudentInfo: Dispatch<SetStateAction<StudentInfo | null>>;
  setIsParsing: (v: boolean) => void;
  setActiveTab: (v: 'calculator' | 'planner') => void;
  setRawAttempts: (v: ParsedCourse[]) => void;
  setBestAttempts: (v: ParsedCourse[]) => void;
  setCourses: Dispatch<SetStateAction<CourseEntry[]>>;
  
  setBackendData: (data?: Partial<TranscriptBackendData>) => void;
  addCourse: (semesterLabel?: string, semesterType?: SemesterType) => void;
  removeCourse: (id: number) => void;
  updateCourse: (id: number, field: string, value: string) => void;
}

const GpaContext = createContext<GpaContextType | undefined>(undefined);

let nextId = 7;

export function GpaProvider({ children }: { children: ReactNode }) {
  const [planningPreferences, setPlanningPreferences] = useState(emptyPlanningPreferences);
  const [gpaHours, setGpaHours] = useState('');
  const [passedHours, setPassedHours] = useState('');
  const [previousCGPA, setPreviousCGPA] = useState('');
  const [previousTotalPoints, setPreviousTotalPoints] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<ProgramId>('communications');
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'planner'>('calculator');
  const [rawAttempts, setRawAttempts] = useState<ParsedCourse[]>([]);
  const [bestAttempts, setBestAttempts] = useState<ParsedCourse[]>([]);
  const [courses, setCourses] = useState<CourseEntry[]>([
    { id: 1, code: '', name: '', hours: '', grade: '', status: 'new', oldGrade: '', retakeCount: 1, semesterLabel: 'Semester 1', semesterType: 'Fall', replacementOfCode: '', replacementOldHours: '', electiveGroupId: '' },
    { id: 2, code: '', name: '', hours: '', grade: '', status: 'new', oldGrade: '', retakeCount: 1, semesterLabel: 'Semester 1', semesterType: 'Fall', replacementOfCode: '', replacementOldHours: '', electiveGroupId: '' },
    { id: 3, code: '', name: '', hours: '', grade: '', status: 'new', oldGrade: '', retakeCount: 1, semesterLabel: 'Semester 1', semesterType: 'Fall', replacementOfCode: '', replacementOldHours: '', electiveGroupId: '' },
    { id: 4, code: '', name: '', hours: '', grade: '', status: 'new', oldGrade: '', retakeCount: 1, semesterLabel: 'Semester 1', semesterType: 'Fall', replacementOfCode: '', replacementOldHours: '', electiveGroupId: '' },
    { id: 5, code: '', name: '', hours: '', grade: '', status: 'new', oldGrade: '', retakeCount: 1, semesterLabel: 'Semester 1', semesterType: 'Fall', replacementOfCode: '', replacementOldHours: '', electiveGroupId: '' },
    { id: 6, code: '', name: '', hours: '', grade: '', status: 'new', oldGrade: '', retakeCount: 1, semesterLabel: 'Semester 1', semesterType: 'Fall', replacementOfCode: '', replacementOldHours: '', electiveGroupId: '' },
  ]);

  const [backendData, setBackendDataState] = useState<TranscriptBackendData>(
    replaceTranscriptBackendData(),
  );

  const setBackendData = useCallback((data?: Partial<TranscriptBackendData>) => {
    setBackendDataState(replaceTranscriptBackendData(data));
  }, []);

  const addCourse = useCallback((semesterLabel?: string, semesterType: SemesterType = 'Fall') => {
    setCourses(prev => [...prev, {
      id: nextId++,
      code: '',
      name: '',
      hours: '',
      grade: '',
      status: 'new',
      oldGrade: '',
      retakeCount: 1,
      semesterLabel: semesterLabel || '',
      semesterType,
      replacementOfCode: '',
      replacementOldHours: '',
      electiveGroupId: '',
    }]);
  }, []);

  const removeCourse = useCallback((id: number) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateCourse = useCallback((id: number, field: string, value: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }, []);

  return (
    <GpaContext.Provider value={{
      planningPreferences, setPlanningPreferences,
      gpaHours, passedHours, previousCGPA, previousTotalPoints, selectedProgram, studentInfo, isParsing, activeTab,
      rawAttempts, bestAttempts, courses, ...backendData,
      setGpaHours, setPassedHours, setPreviousCGPA, setPreviousTotalPoints, setSelectedProgram, setStudentInfo, setIsParsing,
      setActiveTab, setRawAttempts, setBestAttempts, setCourses, setBackendData,
      addCourse, removeCourse, updateCourse,
    }}>
      {children}
    </GpaContext.Provider>
  );
}

export function useGpa() {
  const ctx = useContext(GpaContext);
  if (!ctx) throw new Error('useGpa must be used within GpaProvider');
  return ctx;
}
