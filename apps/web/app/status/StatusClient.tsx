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
  if (progress === 0) return 'bg-gray-300 dark:bg-gray-600';
  if (progress < 30) return 'bg-red-500';
  if (progress < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Get status text based on progress
const getStatusText = (progress: number): string => {
  if (progress === 0) return 'Not Started';
  if (progress < 30) return 'Early Stage';
  if (progress < 70) return 'In Progress';
  if (progress < 100) return 'Nearly Complete';
  return 'Complete';
};

interface ModuleCardProps {
  module: Module;
}

function ModuleCard({ module }: ModuleCardProps) {
  const progressColor = getProgressColor(module.progress);
  const statusText = getStatusText(module.progress);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">{module.name}</h3>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {module.progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full ${progressColor} transition-all duration-300`}
          style={{ width: `${module.progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{statusText}</span>
        <span className="font-mono text-gray-500">#{module.key}</span>
      </div>
    </div>
  );
}

interface ModuleSectionProps {
  title: string;
  description: string;
  modules: Module[];
}

function ModuleSection({ title, description, modules }: ModuleSectionProps) {
  const avgProgress =
    modules.length > 0
      ? Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length)
      : 0;
  const started = modules.filter((m) => m.progress > 0).length;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{avgProgress}%</span>{' '}
            average
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {description}{' '}
          <span className="font-medium">
            {started}/{modules.length}
          </span>{' '}
          modules started
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.key} module={module} />
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TogetherOS Progress</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to Load Status
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                TogetherOS Progress
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Development status across all modules • Updated automatically via GitHub Actions
              </p>
            </div>
            <a
              href="https://github.com/coopeverything/TogetherOS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </header>

      {/* Overall Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm font-medium text-blue-100 mb-1">Overall Progress</div>
              <div className="text-4xl font-bold">{data.stats.overall}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-100 mb-1">Total Modules</div>
              <div className="text-4xl font-bold">{data.stats.total}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-100 mb-1">In Progress</div>
              <div className="text-4xl font-bold">{data.stats.started}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-100 mb-1">Completed</div>
              <div className="text-4xl font-bold">{data.stats.completed}</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${data.stats.overall}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module Sections */}
        <ModuleSection
          title="Core Platform Modules"
          description="Essential platform features for TogetherOS."
          modules={data.modules.core}
        />

        <ModuleSection
          title="Cooperation Path Modules"
          description="The 8 Cooperation Paths - specialized features for each domain."
          modules={data.modules.path}
        />

        <ModuleSection
          title="DevEx & Infrastructure"
          description="Developer experience, CI/CD, and deployment tooling."
          modules={data.modules.devex}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Progress data synced from{' '}
            <a
              href="https://github.com/coopeverything/TogetherOS/blob/main/docs/STATUS_v2.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              docs/STATUS_v2.md
            </a>
          </p>
          <p className="mt-2">
            Updated automatically via{' '}
            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              auto-progress-update.yml
            </code>{' '}
            GitHub Action
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </footer>
      </div>
    </div>
  );
}
