import { X, CheckCircle2, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const typeIcons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
  warning: TriangleAlert,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="delta-toast-stack fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none" aria-live="polite">
      {toasts.map(toast => {
        const StatusIcon = typeIcons[toast.type];
        return (
        <div
          key={toast.id}
          role="status"
          className="delta-toast pointer-events-auto"
          data-tone={toast.type}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <StatusIcon className="delta-toast-icon" size={18} aria-hidden="true" />
          <p>{toast.message}</p>
          <button type="button" aria-label="Dismiss notification" onClick={() => removeToast(toast.id)}>
            <X size={16} />
          </button>
        </div>
      ); })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
