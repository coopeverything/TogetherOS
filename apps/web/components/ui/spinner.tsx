import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brand' | 'joy' | 'default';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'brand', ...props }, ref) => {
    const sizeStyles = {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-3',
    };

    const variantStyles = {
      brand: 'border-brand-500 border-t-transparent',
      joy: 'border-joy-500 border-t-transparent',
      default: 'border-ink-400 border-t-transparent',
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn(
          'inline-block rounded-full animate-spin',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner };
