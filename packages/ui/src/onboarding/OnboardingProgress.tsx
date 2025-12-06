/**
 * Onboarding Progress Components
 * Displays user's onboarding progress with next steps
 */

import * as React from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  url?: string;
  priority: 'required' | 'recommended' | 'optional';
}

export interface OnboardingProgressData {
  completionPercentage: number;
  isComplete: boolean;
  progress: {
    questionnairesCompleted: number;
    questionnairesTotal: number;
    profileComplete: boolean;
    groupsJoined: number;
    firstPost: boolean;
  };
  nextSteps: OnboardingStep[];
}

export interface OnboardingProgressProps {
  progress: OnboardingProgressData;
  onStepClick?: (step: OnboardingStep) => void;
  compact?: boolean;
}

/**
 * Progress bar component
 */
function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="bg-blue-600 h-full transition-all duration-500 ease-out rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
}

/**
 * Step card component
 */
function StepCard({
  step,
  onClick,
}: {
  step: OnboardingStep;
  onClick?: (step: OnboardingStep) => void;
}) {
  const priorityColors = {
    required: 'border-red-200 bg-red-50',
    recommended: 'border-yellow-200 bg-yellow-50',
    optional: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900',
  };

  const priorityBadges = {
    required: 'bg-red-100 text-red-800',
    recommended: 'bg-yellow-100 text-yellow-800',
    optional: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${priorityColors[step.priority]}`}
      onClick={() => onClick?.(step)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${priorityBadges[step.priority]}`}
        >
          {step.priority}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-3">{step.description}</p>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>⏱️ {step.estimatedMinutes} min</span>
      </div>
    </div>
  );
}

/**
 * Main onboarding progress widget
 */
export function OnboardingProgress({
  progress,
  onStepClick,
  compact = false,
}: OnboardingProgressProps) {
  const { completionPercentage, isComplete, nextSteps } = progress;

  if (isComplete) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
        <div className="text-sm mb-3">🎉</div>
        <h2 className="text-sm font-bold text-green-900 mb-2">
          Onboarding Complete!
        </h2>
        <p className="text-green-700">
          You're all set to start collaborating with your community.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Your Progress</h3>
          <span className="text-sm font-bold text-blue-600">
            {completionPercentage}%
          </span>
        </div>
        <ProgressBar percentage={completionPercentage} />
        <div className="mt-3 text-sm text-gray-600">
          {nextSteps.length > 0 ? (
            <>
              <span className="font-medium">Next:</span> {nextSteps[0].title}
            </>
          ) : (
            'Complete all steps to finish onboarding'
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Welcome to TogetherOS
          </h2>
          <span className="text-sm font-bold text-blue-600">
            {completionPercentage}%
          </span>
        </div>
        <ProgressBar percentage={completionPercentage} />
        <p className="text-gray-600 mt-3">
          Complete these steps to get the most out of TogetherOS
        </p>
      </div>

      {/* Progress summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Questionnaires</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {progress.progress.questionnairesCompleted}/{progress.progress.questionnairesTotal}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Profile</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {progress.progress.profileComplete ? '✓' : '○'}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Groups Joined</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {progress.progress.groupsJoined}
          </div>
        </div>
      </div>

      {/* Next steps */}
      {nextSteps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Next Steps
          </h3>
          <div className="space-y-3">
            {nextSteps.map((step) => (
              <StepCard key={step.id} step={step} onClick={onStepClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact widget for dashboard sidebar
 */
export function OnboardingWidget({
  progress,
  onViewDetails,
}: {
  progress: OnboardingProgressData;
  onViewDetails?: () => void;
}) {
  if (progress.isComplete) {
    return null; // Don't show widget if onboarding is complete
  }

  const nextStep = progress.nextSteps[0];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">🚀</span>
        <h3 className="font-semibold text-gray-900 dark:text-white">Get Started</h3>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-blue-600">
            {progress.completionPercentage}%
          </span>
        </div>
        <ProgressBar percentage={progress.completionPercentage} />
      </div>

      {nextStep && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-1">Next step:</div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {nextStep.title}
          </div>
        </div>
      )}

      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      )}
    </div>
  );
}
