import * as React from 'react';

import { cn } from '@/lib/utils';

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id={radioId}
          className={cn(
            'h-4 w-4 border-border bg-bg-1 text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className="text-base font-medium text-ink-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Radio.displayName = 'Radio';

export { Radio };
