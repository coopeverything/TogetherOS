// packages/ui/src/feed/BreadcrumbTrail.tsx
// Navigation breadcrumbs showing the deliberation pipeline path

'use client';

export interface BreadcrumbStep {
  label: string;
  url: string;
  active: boolean;
}

export interface BreadcrumbTrailProps {
  steps: BreadcrumbStep[];
  topic?: string;
}

export function BreadcrumbTrail({ steps, topic }: BreadcrumbTrailProps) {
  if (steps.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      {steps.map((step, index) => (
        <div key={step.url} className="flex items-center">
          {index > 0 && <span className="text-gray-400 mx-2">→</span>}
          {step.active ? (
            <span className="text-blue-600 font-semibold">{step.label}</span>
          ) : (
            <a
              href={step.url}
              className="text-gray-600 hover:text-blue-600 hover:underline transition-colors"
            >
              {step.label}
            </a>
          )}
        </div>
      ))}
      {topic && (
        <>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs">{topic}</span>
        </>
      )}
    </nav>
  );
}

/**
 * Helper function to generate breadcrumb steps for a topic's deliberation pipeline
 */
export function generatePipelineBreadcrumbs(
  topic: string,
  currentStage: 'feed' | 'deliberation' | 'proposal' | 'decision'
): BreadcrumbStep[] {
  const stages: Array<{ stage: string; label: string; path: string }> = [
    { stage: 'feed', label: 'Feed', path: '/feed' },
    { stage: 'deliberation', label: 'Deliberation', path: `/deliberation?topic=${encodeURIComponent(topic)}` },
    { stage: 'proposal', label: 'Proposal', path: `/governance?topic=${encodeURIComponent(topic)}` },
    { stage: 'decision', label: 'Decision', path: `/governance/decisions?topic=${encodeURIComponent(topic)}` },
  ];

  const currentIndex = stages.findIndex((s) => s.stage === currentStage);

  return stages.slice(0, currentIndex + 1).map((stage, index) => ({
    label: stage.label,
    url: stage.path,
    active: index === currentIndex,
  }));
}
