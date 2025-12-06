'use client';

import { useEffect, useState } from 'react';

interface Module {
  key: string;
  name: string;
  progress: number;
  category: 'core' | 'path' | 'devex';
}

interface StatusData {
  success: boolean;
  stats: {
    overall: number;
    total: number;
    started: number;
    completed: number;
  };
  modules: {
    core: Module[];
    path: Module[];
    devex: Module[];
  };
  lastUpdated: string;
}

// Get status color based on progress
const getProgressColor = (progress: number): string => {
  if (progress === 0) return 'bg-slate-200 dark:bg-slate-700';
  if (progress < 30) return 'bg-gradient-to-r from-rose-400 to-pink-500';
  if (progress < 70) return 'bg-gradient-to-r from-amber-400 to-orange-500';
  return 'bg-gradient-to-r from-emerald-400 to-green-500';
};

// Get status text based on progress
const getStatusText = (progress: number): string => {
  if (progress === 0) return 'Not Started';
  if (progress < 30) return 'Early Stage';
  if (progress < 70) return 'In Progress';
  if (progress < 100) return 'Nearly Complete';
  return 'Complete';
};

// Get ring color for progress circle
const getRingColor = (progress: number): string => {
  if (progress === 0) return 'ring-slate-200 dark:ring-slate-700';
  if (progress < 30) return 'ring-rose-400';
  if (progress < 70) return 'ring-amber-400';
  return 'ring-emerald-400';
};

interface ModuleCardProps {
  module: Module;
}

function ModuleCard({ module }: ModuleCardProps) {
  const progressColor = getProgressColor(module.progress);
  const statusText = getStatusText(module.progress);
  const ringColor = getRingColor(module.progress);

  return (
    <div className="group relative bg-white dark:bg-gray-800/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-300/50 dark:hover:border-blue-700/50">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {module.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              #{module.key}
            </p>
          </div>
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ring-4 ${ringColor} flex items-center justify-center bg-white dark:bg-gray-800 dark:bg-slate-900 ml-3 shadow-sm`}>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {module.progress}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
          <div
            className={`absolute inset-y-0 left-0 ${progressColor} rounded-full transition-all duration-700 ease-out shadow-lg`}
            style={{ width: `${module.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between mt-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300">
            {statusText}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {module.progress > 0 && module.progress < 100 && '🚧'}
            {module.progress === 0 && '⏳'}
            {module.progress === 100 && '✅'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ModuleSectionProps {
  title: string;
  description: string;
  modules: Module[];
  icon: string;
}

function ModuleSection({ title, description, modules, icon }: ModuleSectionProps) {
  const avgProgress =
    modules.length > 0
      ? Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length)
      : 0;
  const started = modules.filter((m) => m.progress > 0).length;

  return (
    <section className="mb-16 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {avgProgress}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">average</div>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl">
          {description}{' '}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {started}/{modules.length} started
          </span>
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((module, idx) => (
          <div
            key={module.key}
            style={{ animationDelay: `${idx * 50}ms` }}
            className="animate-slide-up"
          >
            <ModuleCard module={module} />
          </div>
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-40 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function StatusClient() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) {
          throw new Error('Failed to fetch status data');
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <header className="bg-white dark:bg-gray-800/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              TogetherOS Progress
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Loading status data...</p>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center p-12 bg-white dark:bg-gray-800/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Failed to Load Status
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Floating orbs background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="relative bg-white dark:bg-gray-800/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                TogetherOS Progress
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live tracking • Auto-updated via GitHub Actions
              </p>
            </div>
            <a
              href="https://github.com/coopeverything/TogetherOS"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Overall Stats */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-1 shadow-2xl mb-12 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-shift" />

          <div className="relative bg-white dark:bg-gray-800/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Overall Progress
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {data.stats.overall}%
                </div>
                <div className="mt-3 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${data.stats.overall}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Total Modules
                </div>
                <div className="text-5xl font-bold text-slate-900 dark:text-white">
                  {data.stats.total}
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Across all categories
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  In Progress
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {data.stats.started}
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Active development
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Completed
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                  {data.stats.completed}
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Ready for production
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module Sections */}
        <ModuleSection
          title="Core Platform"
          description="Essential platform features that power TogetherOS. These modules provide the foundation for all cooperation paths."
          modules={data.modules.core}
          icon="🏗️"
        />

        <ModuleSection
          title="Cooperation Paths"
          description="The 8 Cooperation Paths - specialized features for education, governance, community, culture, wellbeing, economy, technology, and planet."
          modules={data.modules.path}
          icon="🌱"
        />

        <ModuleSection
          title="Developer Experience"
          description="Developer tools, CI/CD pipelines, and deployment infrastructure that keep the platform running smoothly."
          modules={data.modules.devex}
          icon="⚙️"
        />

        {/* Footer */}
        <footer className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Progress data synced from{' '}
              <a
                href="https://github.com/coopeverything/TogetherOS/blob/main/docs/STATUS_v2.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                docs/STATUS_v2.md
              </a>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Automated by{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                auto-progress-update.yml
              </code>{' '}
              GitHub Action
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          </div>
        </footer>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, -30px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-30px, 30px);
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
