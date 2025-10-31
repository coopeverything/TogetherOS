'use client';

import * as React from 'react';
import { Progress, Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

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
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  const getStatusLabel = () => {
    if (percentage >= 80) return 'Complete';
    if (percentage >= 50) return 'Almost There';
    return 'Getting Started';
  };

  const incompleteItems = items.filter((item) => !item.completed);

  if (percentage === 100 && !showDetails) {
    return null; // Hide when complete and details not requested
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">Profile Completion</h3>
          <Badge variant={getStatusColor()}>
            {percentage}% {getStatusLabel()}
          </Badge>
        </div>

        {/* Progress bar */}
        <Progress value={percentage} variant={getStatusColor()} />

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
          <p className="text-xs text-success-600 font-medium">
            Your profile is complete!
          </p>
        )}
      </div>
    </Card>
  );
}
