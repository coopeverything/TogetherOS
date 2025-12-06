import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className,
}) => {
  const [visible, setVisible] = React.useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-base text-white bg-ink-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none',
            positionStyles[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';

export { Tooltip };
