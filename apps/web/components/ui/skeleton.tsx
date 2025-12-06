import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', width, height, lines = 1, ...props }, ref) => {
    const variantStyles = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-md',
    };

    const style = {
      width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
      height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'bg-bg-2 animate-pulse',
                variantStyles.text,
                index === lines - 1 && 'w-3/4' // Last line shorter
              )}
              style={index < lines - 1 ? style : { ...style, width: undefined }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('bg-bg-2 animate-pulse', variantStyles[variant], className)}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hasAvatar?: boolean;
  lines?: number;
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, hasAvatar = false, lines = 3, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 border border-border rounded-lg bg-bg-1', className)}
        {...props}
      >
        {hasAvatar && (
          <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" className="mt-1" />
            </div>
          </div>
        )}
        <Skeleton variant="text" lines={lines} />
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

export { Skeleton, SkeletonCard };
