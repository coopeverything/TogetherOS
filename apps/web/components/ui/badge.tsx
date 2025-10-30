import * as React from 'react';

import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'brand' | 'joy' | 'success' | 'info' | 'warning' | 'danger';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-bg-2 text-ink-700 border-border',
      brand: 'bg-brand-100 text-brand-600 border-brand-500',
      joy: 'bg-joy-100 text-joy-600 border-joy-500',
      success: 'bg-[#DCFCE7] text-[#16A34A] border-[#16A34A]',
      info: 'bg-[#E0F2FE] text-[#0EA5E9] border-[#0EA5E9]',
      warning: 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]',
      danger: 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
