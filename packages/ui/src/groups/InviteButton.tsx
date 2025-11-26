'use client';

import { useState } from 'react';

export interface InviteButtonProps {
  groupId: string;
  groupName: string;
  onInviteClick?: () => void;
  disabled?: boolean;
  remainingInvites?: number;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InviteButton({
  groupId,
  groupName,
  onInviteClick,
  disabled = false,
  remainingInvites,
  variant = 'primary',
  size = 'md',
  className = '',
}: InviteButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
    secondary: disabled
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200',
    outline: disabled
      ? 'border border-gray-200 text-gray-400 cursor-not-allowed'
      : 'border border-brand-300 text-brand-700 hover:border-brand-500 hover:bg-brand-50',
  };

  const handleClick = () => {
    if (!disabled && onInviteClick) {
      onInviteClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      aria-label={`Invite someone to ${groupName}`}
    >
      <svg
        className={`w-4 h-4 transition-transform ${isHovered && !disabled ? 'scale-110' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span>Invite</span>
      {remainingInvites !== undefined && (
        <span className={`text-xs ${variant === 'primary' ? 'text-white/70' : 'text-gray-500'}`}>
          ({remainingInvites} left)
        </span>
      )}
    </button>
  );
}

export default InviteButton;
