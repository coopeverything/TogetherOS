import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, title, children, ...props }, ref) => {
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal content */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          className={cn(
            'relative bg-bg-1 rounded-xl border border-border shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto',
            className
          )}
          {...props}
        >
          {title && (
            <div className="px-4 py-4 border-b border-border">
              <h2 id="modal-title" className="text-sm font-bold text-ink-900">
                {title}
              </h2>
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export { Modal };
