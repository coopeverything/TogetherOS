import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'brand' | 'joy' | 'success' | 'info' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, variant = 'brand', size = 'md', showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeStyles = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    const variantStyles = {
      brand: 'bg-brand-500',
      joy: 'bg-joy-500',
      success: 'bg-[#16A34A]',
      info: 'bg-[#0EA5E9]',
      warning: 'bg-[#D97706]',
      danger: 'bg-[#DC2626]',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-ink-700">Progress</span>
            <span className="text-sm font-medium text-ink-700">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn('w-full bg-bg-2 rounded-full overflow-hidden', sizeStyles[size])}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              variantStyles[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
