// packages/ui/src/feed/ProgressionIndicators.tsx
// Visual indicators showing when topics are ready to move through the deliberation pipeline

'use client';

export interface ProgressionStage {
  stage: 'feed' | 'deliberation' | 'proposal' | 'decision';
  label: string;
  description: string;
  active: boolean;
  completed: boolean;
}

export interface ProgressionIndicatorsProps {
  topic: string;
  currentStage: 'feed' | 'deliberation' | 'proposal' | 'decision';
  actionReadiness?: number; // 0-1
  consensusScore?: number; // 0-1
  engagementLevel?: number;
  onStageClick?: (stage: string) => void;
}

export function ProgressionIndicators({
  topic,
  currentStage,
  actionReadiness = 0,
  consensusScore = 0,
  engagementLevel = 0,
  onStageClick,
}: ProgressionIndicatorsProps) {
  const stages: ProgressionStage[] = [
    {
      stage: 'feed',
      label: 'Social Feed',
      description: 'Community discussion and initial reactions',
      active: currentStage === 'feed',
      completed: ['deliberation', 'proposal', 'decision'].includes(currentStage),
    },
    {
      stage: 'deliberation',
      label: 'Deliberation',
      description: 'Structured dialogue and consensus-building',
      active: currentStage === 'deliberation',
      completed: ['proposal', 'decision'].includes(currentStage),
    },
    {
      stage: 'proposal',
      label: 'Proposal',
      description: 'Formal proposal with options and evidence',
      active: currentStage === 'proposal',
      completed: currentStage === 'decision',
    },
    {
      stage: 'decision',
      label: 'Decision',
      description: 'Community vote and implementation',
      active: currentStage === 'decision',
      completed: false,
    },
  ];

  const getStageColor = (stage: ProgressionStage) => {
    if (stage.completed) return 'bg-green-500 text-white border-green-500';
    if (stage.active) return 'bg-blue-600 text-white border-blue-600';
    return 'bg-gray-200 text-gray-600 border-gray-300 dark:border-gray-600';
  };

  const getConnectionColor = (index: number) => {
    if (stages[index].completed || stages[index].active) return 'bg-green-500';
    return 'bg-gray-300';
  };

  const canProgressToDeliberation = actionReadiness > 0.7 && currentStage === 'feed';
  const canProgressToProposal = consensusScore > 0.7 && currentStage === 'deliberation';

  return (
    <div className="space-y-4">
      {/* Stage progression */}
      <div className="relative">
        {/* Connection lines */}
        <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-12">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 ${getConnectionColor(i)}`}
              style={{ marginLeft: i === 0 ? '0' : '1rem', marginRight: '1rem' }}
            />
          ))}
        </div>

        {/* Stage circles */}
        <div className="relative flex items-start justify-between">
          {stages.map((stage, index) => (
            <div
              key={stage.stage}
              className="flex flex-col items-center flex-1"
              style={{ maxWidth: '25%' }}
            >
              <button
                onClick={() => onStageClick?.(stage.stage)}
                disabled={!stage.completed && !stage.active}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all ${getStageColor(stage)} ${
                  stage.completed || stage.active
                    ? 'cursor-pointer hover:scale-110'
                    : 'cursor-not-allowed'
                }`}
              >
                {stage.completed ? '✓' : index + 1}
              </button>
              <div className="text-center mt-2">
                <div
                  className={`font-semibold text-sm ${
                    stage.active ? 'text-blue-900' : stage.completed ? 'text-green-900' : 'text-gray-600'
                  }`}
                >
                  {stage.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{stage.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Readiness indicators */}
      {currentStage === 'feed' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Readiness for Deliberation</h4>

          <div className="space-y-3">
            {/* Action readiness */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">Overall Readiness</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(actionReadiness * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    actionReadiness > 0.7 ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${actionReadiness * 100}%` }}
                />
              </div>
            </div>

            {/* Consensus */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">Consensus</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(consensusScore * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${consensusScore * 100}%` }}
                />
              </div>
            </div>

            {/* Engagement */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">Engagement</span>
                <span className="font-semibold text-gray-900 dark:text-white">{engagementLevel} interactions</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${Math.min((engagementLevel / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Next step callout */}
          {canProgressToDeliberation ? (
            <div className="mt-4 bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center gap-2 text-green-900 font-semibold text-sm mb-1">
                <span>✓</span>
                <span>Ready for Deliberation</span>
              </div>
              <p className="text-green-800 text-xs">
                This topic has high engagement and emerging consensus. Consider moving to structured
                deliberation.
              </p>
              <button
                onClick={() => onStageClick?.('deliberation')}
                className="mt-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-green-700"
              >
                Start Deliberation →
              </button>
            </div>
          ) : (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
              <strong>Next step:</strong> Keep the conversation going. Topics typically need 70%+
              readiness before moving to formal deliberation.
            </div>
          )}
        </div>
      )}

      {currentStage === 'deliberation' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Readiness for Proposal</h4>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">Consensus Level</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(consensusScore * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    consensusScore > 0.7 ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${consensusScore * 100}%` }}
                />
              </div>
            </div>
          </div>

          {canProgressToProposal ? (
            <div className="mt-4 bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center gap-2 text-green-900 font-semibold text-sm mb-1">
                <span>✓</span>
                <span>Ready for Proposal</span>
              </div>
              <p className="text-green-800 text-xs">
                Strong consensus achieved. Consider drafting a formal proposal.
              </p>
              <button
                onClick={() => onStageClick?.('proposal')}
                className="mt-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-green-700"
              >
                Create Proposal →
              </button>
            </div>
          ) : (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded p-3 text-xs text-orange-800">
              <strong>Next step:</strong> Continue deliberation until consensus reaches 70%+.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
