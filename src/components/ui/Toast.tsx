import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const TOAST_COLORS: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
};

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(toast.id), duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md text-sm ${TOAST_COLORS[toast.type]}`}
      role="alert"
    >
      <span className="flex-1">{toast.message}</span>
      <button
        className="ml-2 font-bold leading-none opacity-60 hover:opacity-100"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
