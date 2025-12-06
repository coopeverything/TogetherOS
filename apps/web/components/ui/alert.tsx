import * as React from 'react';

import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'info' | 'warning' | 'danger';
  title?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-bg-1 border-border text-ink-900',
      success: 'bg-[#DCFCE7] border-[#16A34A] text-[#16A34A]',
      info: 'bg-[#E0F2FE] border-[#0EA5E9] text-[#0EA5E9]',
      warning: 'bg-[#FEF3C7] border-[#D97706] text-[#D97706]',
      danger: 'bg-[#FEE2E2] border-[#DC2626] text-[#DC2626]',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn('p-4 rounded-lg border', variantStyles[variant], className)}
        {...props}
      >
        {title && (
          <div className="font-semibold mb-1">{title}</div>
        )}
        <div className={title ? 'text-base' : ''}>{children}</div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };
