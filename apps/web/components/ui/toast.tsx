'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: 'default' | 'success' | 'info' | 'warning' | 'danger';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration !== undefined ? toast.duration : 5000;
    const newToast: Toast = { ...toast, id, duration };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const variantStyles = {
    default: 'bg-bg-1 border-border text-ink-900',
    success: 'bg-[#DCFCE7] border-[#16A34A] text-[#16A34A]',
    info: 'bg-[#E0F2FE] border-[#0EA5E9] text-[#0EA5E9]',
    warning: 'bg-[#FEF3C7] border-[#D97706] text-[#D97706]',
    danger: 'bg-[#FEE2E2] border-[#DC2626] text-[#DC2626]',
  };

  const variant = toast.variant || 'default';

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right',
        variantStyles[variant]
      )}
    >
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-semibold mb-1">{toast.title}</div>
        )}
        <div className={cn('text-base', toast.title ? '' : 'font-medium')}>
          {toast.description}
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 4L4 12M4 4l8 8" />
        </svg>
      </button>
    </div>
  );
}

export { ToastProvider, useToast };
