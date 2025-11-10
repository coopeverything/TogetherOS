/**
 * Evidence Display Component
 * Shows evidence grouped by viewpoint (support/oppose/neutral)
 */

'use client';

interface Evidence {
  id: string;
  url: string;
  viewpoint: 'support' | 'oppose' | 'neutral';
  description?: string;
  verified: boolean;
  added_by: string;
  created_at: string;
}

interface EvidenceDisplayProps {
  evidence: Evidence[];
  postId: string;
}

const viewpointConfig = {
  support: { label: 'Supporting', color: 'green', icon: '✓' },
  oppose: { label: 'Opposing', color: 'red', icon: '✗' },
  neutral: { label: 'Context', color: 'blue', icon: 'i' },
};

export function EvidenceDisplay({ evidence, postId }: EvidenceDisplayProps) {
  if (evidence.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No evidence attached yet. Be the first to add supporting evidence!
      </div>
    );
  }

  const grouped = evidence.reduce((acc, item) => {
    if (!acc[item.viewpoint]) acc[item.viewpoint] = [];
    acc[item.viewpoint].push(item);
    return acc;
  }, {} as Record<string, Evidence[]>);

  return (
    <div className="space-y-6">
      {(['support', 'oppose', 'neutral'] as const).map((viewpoint) => {
        const items = grouped[viewpoint] || [];
        if (items.length === 0) return null;

        const config = viewpointConfig[viewpoint];

        return (
          <div key={viewpoint} className="border-l-4 border-${config.color}-500 pl-4">
            <h3 className="font-semibold text-${config.color}-700 dark:text-${config.color}-400 mb-3">
              {config.icon} {config.label} ({items.length})
            </h3>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {new URL(item.url).hostname}
                      </a>
                      {item.verified && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    Added by {item.added_by}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
