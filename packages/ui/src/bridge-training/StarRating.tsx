/**
 * Star Rating Component for Bridge Training
 * Allows rating on a 1-5 scale with hover effects
 */

'use client';

import { useState } from 'react';

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRating({ label, value, onChange, disabled = false }: StarRatingProps) {
  const [hovering, setHovering] = useState<number>(0);
  const displayValue = hovering || value;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold" style={{ color: 'var(--ink-700)' }}>
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            onMouseEnter={() => !disabled && setHovering(starValue)}
            onMouseLeave={() => setHovering(0)}
            onClick={() => !disabled && onChange(starValue)}
            disabled={disabled}
            className={`text-sm transition ${
              starValue <= displayValue
                ? 'text-amber-400'
                : 'text-gray-200'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer'}`}
            aria-label={`Rate ${starValue} stars`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm self-center" style={{ color: 'var(--ink-400)' }}>
          {value > 0 ? `${value}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  );
}
