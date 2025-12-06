import * as React from 'react';

import { cn } from '@/lib/utils';

export interface DropdownItem {
  label: string;
  value: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position = 'bottom-left',
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const positionStyles = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={() => setOpen(!open)} onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}>
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            'absolute z-50 min-w-[160px] bg-bg-1 border border-border rounded-md shadow-lg py-1',
            positionStyles[position],
            className
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick();
                  setOpen(false);
                }
              }}
              disabled={item.disabled}
              className={cn(
                'w-full text-left px-4 py-2 text-sm transition-colors',
                item.disabled
                  ? 'text-ink-400 cursor-not-allowed'
                  : 'text-ink-900 hover:bg-bg-2 cursor-pointer'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';

export { Dropdown };
