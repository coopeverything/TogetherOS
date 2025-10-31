'use client';

import * as React from 'react';
import { cn } from '../utils';

interface User {
  name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  country?: string;
  paths?: string[];
  skills?: string[];
  can_offer?: string;
  seeking_help?: string;
}

export interface ProfileCompletionIndicatorProps {
  user: User;
  className?: string;
  showDetails?: boolean;
}

interface CompletionItem {
  label: string;
  completed: boolean;
  weight: number;
}

export function ProfileCompletionIndicator({
  user,
  className,
  showDetails = true,
}: ProfileCompletionIndicatorProps) {
  const items: CompletionItem[] = [
    { label: 'Name', completed: !!user.name, weight: 10 },
    { label: 'Username', completed: !!user.username, weight: 10 },
    { label: 'Bio', completed: !!user.bio && user.bio.length > 20, weight: 15 },
    { label: 'Avatar', completed: !!user.avatar_url, weight: 10 },
    { label: 'Location', completed: !!(user.city || user.state || user.country), weight: 10 },
    { label: 'Cooperation Paths', completed: !!user.paths && user.paths.length > 0, weight: 15 },
    { label: 'Skills', completed: !!user.skills && user.skills.length >= 3, weight: 15 },
    { label: 'What I Can Offer', completed: !!user.can_offer && user.can_offer.length > 20, weight: 10 },
    { label: 'What I\'m Seeking', completed: !!user.seeking_help && user.seeking_help.length > 20, weight: 5 },
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = items.reduce(
    (sum, item) => sum + (item.completed ? item.weight : 0),
    0
  );
  const percentage = Math.round((completedWeight / totalWeight) * 100);

  const getStatusColor = () => {
    if (percentage >= 80) return { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', bar: 'bg-[#16A34A]' };
    if (percentage >= 50) return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', bar: 'bg-[#D97706]' };
    return { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', bar: 'bg-[#DC2626]' };
  };

  const getStatusLabel = () => {
    if (percentage >= 80) return 'Complete';
    if (percentage >= 50) return 'Almost There';
    return 'Getting Started';
  };

  const statusColor = getStatusColor();
  const incompleteItems = items.filter((item) => !item.completed);

  if (percentage === 100 && !showDetails) {
    return null;
  }

  return (
    <div className={cn('rounded-lg border border-border bg-white shadow-sm p-4', className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">Profile Completion</h3>
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border',
            statusColor.bg,
            statusColor.text
          )}>
            {percentage}% {getStatusLabel()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="w-full bg-bg-2 rounded-full overflow-hidden h-2">
            <div
              className={cn('h-full transition-all duration-300 ease-out rounded-full', statusColor.bar)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Details */}
        {showDetails && incompleteItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-ink-700">
              Complete these sections to strengthen your profile:
            </p>
            <ul className="space-y-1">
              {incompleteItems.slice(0, 5).map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-xs text-ink-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-400" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {percentage === 100 && (
          <p className="text-xs text-[#16A34A] font-medium">
            Your profile is complete!
          </p>
        )}
      </div>
    </div>
  );
}
