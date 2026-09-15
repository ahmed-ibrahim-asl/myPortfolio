import type { CourseEntry, StudentInfo } from '../context/GpaContext';
import {
  buildRegistrationPlanTerms,
  paginateRegistrationPlan,
  type RegistrationPlanTerm,
} from '../services/registrationPlanReport';

interface Props {
  reportId: string;
  plannedCourses: CourseEntry[];
  studentInfo: StudentInfo | null;
  passedHours: number;
  gpaHours: number;
  previousCGPA: number;
  previousTotalPoints?: number;
}

const cellBorder = '1px solid #cbd5e1';

function UniversityHeader() {
  return (
    <header style={{ marginBottom: 16 }}>
      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: 7 }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.2 }}>
          DELTA UNIVERSITY FOR SCIENCE AND TECHNOLOGY
        </div>
        <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 700 }}>
          Faculty of Engineering
        </div>
      </div>
    </header>
  );
}

function StudentPlanSummary({
  studentInfo,
  passedHours,
  previousCGPA,
}: Pick<Props, 'studentInfo' | 'passedHours' | 'previousCGPA'>) {
  return (
    <section style={{ marginBottom: 18 }}>
      <h1 style={{
        margin: '2px 0 12px',
        textAlign: 'center',
        fontSize: 17,
        fontWeight: 800,
      }}>
        Semester Registration Plan
      </h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: '1px solid #64748b',
        borderLeft: '1px solid #64748b',
        fontSize: 10.5,
        lineHeight: 1.35,
      }}>
        <div style={{ borderRight: cellBorder, borderBottom: cellBorder, padding: '5px 7px' }}>
          Student ID: <b>{studentInfo?.id || 'Not detected'}</b>
        </div>
        <div style={{ borderRight: cellBorder, borderBottom: cellBorder, padding: '5px 7px' }}>
          Student Name: <b dir="auto">{studentInfo?.name || 'Not detected'}</b>
        </div>
        <div style={{ borderRight: cellBorder, borderBottom: cellBorder, padding: '5px 7px' }}>
          Passed Hours: <b>{passedHours} of {studentInfo?.totalDegreeHours || 160}</b>
        </div>
        <div style={{ borderRight: cellBorder, borderBottom: cellBorder, padding: '5px 7px' }}>
          Current CGPA: <b>{previousCGPA.toFixed(3)}</b>
        </div>
        <div style={{
          gridColumn: '1 / -1',
          borderRight: cellBorder,
          borderBottom: cellBorder,
          padding: '5px 7px',
        }}>
          Academic Program: <b>{studentInfo?.program || 'Not detected'}</b>
        </div>
      </div>
    </section>
  );
}

function PlanTable({ term }: { term: RegistrationPlanTerm }) {
  return (
    <section style={{ marginBottom: 18, breakInside: 'avoid' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1.5px solid #334155',
        padding: '5px 3px',
        fontSize: 11,
        fontWeight: 700,
      }}>
        <span>{term.title}</span>
        <span>{term.semesterType === 'Summer' ? 'Summer term' : 'Normal term'}</span>
      </div>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        fontSize: 9.5,
      }}>
        <colgroup>
          <col style={{ width: 76 }} />
          <col style={{ width: 292 }} />
          <col style={{ width: 112 }} />
          <col style={{ width: 78 }} />
          <col style={{ width: 78 }} />
          <col style={{ width: 52 }} />
        </colgroup>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            {['Code', 'Course Name', 'Registration Type', 'Previous', 'Expected', 'Hours'].map(label => (
              <th
                key={label}
                style={{
                  border: cellBorder,
                  padding: '6px 4px',
                  textAlign: 'center',
                  fontWeight: 800,
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {term.courses.map((course, index) => (
            <tr key={`${term.id}-${course.code}-${index}`}>
              <td style={{ border: cellBorder, padding: '7px 5px', fontWeight: 400 }}>
                {course.code}
              </td>
              <td style={{
                border: cellBorder,
                padding: '7px 6px',
                fontWeight: 700,
                lineHeight: 1.3,
                overflowWrap: 'anywhere',
                whiteSpace: 'normal',
              }}>
                {course.name}
              </td>
              <td style={{ border: cellBorder, padding: '7px 5px', textAlign: 'center' }}>
                {course.registrationType}
              </td>
              <td style={{ border: cellBorder, padding: '7px 4px', textAlign: 'center' }}>
                {course.previousGrade}
              </td>
              <td style={{ border: cellBorder, padding: '7px 4px', textAlign: 'center' }}>
                {course.expectedGrade}
              </td>
              <td style={{ border: cellBorder, padding: '7px 4px', textAlign: 'center' }}>
                {course.hours}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 18,
        padding: '6px 3px',
        fontSize: 9.5,
      }}>
        <span>Registered Hours: <b>{term.registeredHours}</b></span>
        <span>
          Projected SGPA:{' '}
          <b>{term.projectedSgpa === null ? 'Add expected grades' : term.projectedSgpa.toFixed(3)}</b>
        </span>
        <span>
          Projected CGPA:{' '}
          <b>{term.projectedCgpa === null ? 'Add expected grades' : term.projectedCgpa.toFixed(3)}</b>
        </span>
      </div>
    </section>
  );
}

export default function RegistrationPlanReport(props: Props) {
  const terms = buildRegistrationPlanTerms(props.plannedCourses, {
    gpaHours: props.gpaHours,
    passedHours: props.passedHours,
    previousCgpa: props.previousCGPA,
    previousTotalPoints: props.previousTotalPoints,
  });
  const pages = paginateRegistrationPlan(terms);
  const generatedAt = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());

  return (
    <div
      aria-hidden="true"
      className="registration-plan-report-root"
      style={{
        position: 'fixed',
        left: -10000,
        top: 0,
        width: 794,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {pages.map((pageTerms, pageIndex) => (
        <div
          key={`plan-page-${pageIndex}`}
          data-registration-plan-page={props.reportId}
          style={{
            position: 'relative',
            boxSizing: 'border-box',
            width: 794,
            height: 1123,
            overflow: 'hidden',
            background: '#ffffff',
            color: '#0f172a',
            padding: '26px 30px 42px',
            fontFamily: 'Arial, Tahoma, sans-serif',
          }}
        >
          <UniversityHeader />
          {pageIndex === 0 && (
            <StudentPlanSummary
              studentInfo={props.studentInfo}
              passedHours={props.passedHours}
              previousCGPA={props.previousCGPA}
            />
          )}
          {pageTerms.map(term => <PlanTable key={term.id} term={term} />)}
          <footer style={{
            position: 'absolute',
            right: 30,
            bottom: 16,
            left: 30,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: '1px solid #334155',
            paddingTop: 6,
            fontSize: 8.5,
          }}>
            <span>Page {pageIndex + 1} of {pages.length}</span>
            <span style={{ textAlign: 'center' }}>Semester Registration Plan</span>
            <span style={{ textAlign: 'right' }}>{generatedAt}</span>
          </footer>
        </div>
      ))}
    </div>
  );
}
