import * as React from 'react';

import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center py-12 px-4',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-ink-400">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold text-ink-900 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-base text-ink-700 max-w-md mb-6">
            {description}
          </p>
        )}
        {action && (
          <div>{action}</div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

// Common empty state icons
export const EmptyStateIcons = {
  NoData: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="8" y="16" width="48" height="40" rx="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 28h48M24 16v-8M40 16v-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  NoResults: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="28" cy="28" r="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 40l12 12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 28h8M28 24v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  NoContent: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="12" y="16" width="40" height="32" rx="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 28h40M20 36h24M20 42h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Error: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="32" cy="32" r="20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 24v12M32 42v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export { EmptyState };
