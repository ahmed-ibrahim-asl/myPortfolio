import { useEffect, useId, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useGpa, type CourseEntry } from '../context/GpaContext';
import { useToast } from '../context/ToastContext';
import RegistrationPlanReport from './RegistrationPlanReport';

interface Props {
  filename?: string;
  plannedCourses?: CourseEntry[];
  academicRecord?: { gpaHours: number; passedHours: number; cgpa: number; totalPoints: number };
}

export default function ExportButton({
  filename = 'semester-registration-plan',
  plannedCourses,
  academicRecord,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [preparedUrl, setPreparedUrl] = useState('');
  const [preparedName, setPreparedName] = useState('');
  const rawId = useId();
  const reportId = `registration-plan-${rawId.replace(/:/g, '')}`;
  const {
    courses,
    studentInfo,
    gpaHours,
    passedHours,
    previousCGPA,
    previousTotalPoints,
  } = useGpa();
  const exportCourses = plannedCourses ?? courses;
  const { addToast } = useToast();

  useEffect(() => {
    return () => {
      if (preparedUrl) URL.revokeObjectURL(preparedUrl);
    };
  }, [preparedUrl]);

  const handlePDF = async () => {
    if (!exportCourses.some(course => course.code)) {
      addToast('Select at least one course before exporting the plan.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await document.fonts.ready;
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      const pages = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-registration-plan-page="${reportId}"]`,
        ),
      );
      if (pages.length === 0) {
        throw new Error('Registration plan pages were not rendered.');
      }

      const pdf = new jsPDF('p', 'mm', 'a4', true);
      for (let index = 0; index < pages.length; index++) {
        const canvas = await html2canvas(pages[index], {
          scale: 1.8,
          backgroundColor: '#ffffff',
          allowTaint: false,
          useCORS: true,
          logging: false,
        });
        if (index > 0) pdf.addPage('a4', 'p');
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.96),
          'JPEG',
          0,
          0,
          210,
          297,
          undefined,
          'FAST',
        );
      }

      const studentSuffix = studentInfo?.id ? `-${studentInfo.id}` : '';
      const downloadName = `${filename}${studentSuffix}.pdf`;
      const blobUrl = URL.createObjectURL(pdf.output('blob'));
      setPreparedUrl(blobUrl);
      setPreparedName(downloadName);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Semester registration plan exported successfully.', 'success');
    } catch (error) {
      console.error(error);
      addToast('Could not export the semester registration plan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delta-export-actions">
      <button
        type="button"
        onClick={handlePDF}
        disabled={loading}
        className="flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {loading
          ? <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          : <FileText size={18} aria-hidden="true" />}
        {loading ? 'Preparing PDF...' : 'Export PDF'}
      </button>
      {preparedUrl && (
        <a
          href={preparedUrl}
          download={preparedName}
          className="text-[11px] font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
        >
          Download PDF again
        </a>
      )}
      <RegistrationPlanReport
        reportId={reportId}
        plannedCourses={exportCourses}
        studentInfo={studentInfo}
        gpaHours={academicRecord?.gpaHours ?? (Number(gpaHours) || 0)}
        passedHours={academicRecord?.passedHours ?? (Number(passedHours) || 0)}
        previousCGPA={academicRecord?.cgpa ?? (Number(previousCGPA) || 0)}
        previousTotalPoints={academicRecord?.totalPoints ?? (previousTotalPoints.trim() !== ''
          ? Number(previousTotalPoints)
          : undefined)}
      />
    </div>
  );
}
