'use client';

import { useState, useEffect, useCallback } from 'react';

interface DashboardMetrics {
  totalLogs: number;
  bySource: Record<string, number>;
  byLevel: Record<string, number>;
  errorRate: number;
  avgDuration: number;
  p95Duration: number;
  topRoutes: Array<{ route: string; count: number; avgDuration: number }>;
  topErrors: Array<{ message: string; count: number }>;
  timeSeriesErrors: Array<{ timestamp: string; count: number }>;
  timeSeriesLatency: Array<{ timestamp: string; p50: number; p95: number }>;
}

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  updatedAt: string;
}

interface CanaryDeployment {
  id: string;
  version: string;
  status: string;
  percentage: number;
  startedAt: string;
  metrics?: {
    canaryRequests: number;
    canaryErrors: number;
  };
}

interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  level: string;
  message: string;
  route?: string;
  duration?: number;
}

interface DashboardData {
  timestamp: string;
  timeWindowMinutes: number;
  metrics: DashboardMetrics;
  bufferStats: { size: number; maxSize: number; totalProcessed: number };
  health: { status: string; errorRate: number; avgLatency: number; p95Latency: number };
  featureFlags?: { total: number; enabled: number; flags: FeatureFlag[] };
  canary?: { current: CanaryDeployment | null; recentDeployments: CanaryDeployment[] };
  recentLogs?: LogEntry[];
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    unhealthy: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    rolled_back: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${colors[status] || 'bg-bg-2 text-ink-900'}`}>
      {status}
    </span>
  );
}

function MetricCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="bg-bg-0 rounded-lg p-4 shadow-sm border border-border">
      <h3 className="text-base font-medium text-ink-500">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-ink-900">{value}</p>
      {subtitle && <p className="text-sm text-ink-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function LogLevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    debug: 'bg-bg-2 text-ink-700',
    info: 'bg-blue-100 text-blue-600',
    warn: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
    critical: 'bg-red-200 text-red-800',
  };

  return (
    <span className={`px-1.5 py-0.5 rounded text-sm font-medium ${colors[level] || 'bg-bg-2'}`}>
      {level}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    error: 'bg-red-50 text-red-700',
    performance: 'bg-purple-50 text-purple-700',
    trace: 'bg-blue-50 text-blue-700',
    canary: 'bg-green-50 text-green-700',
    'feature-flag': 'bg-orange-50 text-orange-700',
    system: 'bg-bg-1 text-ink-700',
  };

  return (
    <span className={`px-1.5 py-0.5 rounded text-sm ${colors[source] || 'bg-bg-1'}`}>
      {source}
    </span>
  );
}

export default function ObservabilityDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState(60);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'flags' | 'canary'>('overview');

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/observability/dashboard?timeWindow=${timeWindow}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [timeWindow]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-bg-1 flex items-center justify-center">
        <div className="text-ink-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Observability Dashboard</h1>
            <p className="text-base text-ink-500">
              Real-time monitoring and system health
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              className="px-3 py-1.5.5 rounded border border-border bg-bg-0 text-base"
            >
              <option value={15}>Last 15 min</option>
              <option value={60}>Last 1 hour</option>
              <option value={360}>Last 6 hours</option>
              <option value={1440}>Last 24 hours</option>
            </select>
            <label className="flex items-center gap-2 text-base">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            <button
              onClick={fetchData}
              className="px-3 py-1.5.5 bg-blue-600 text-white rounded text-base hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Health Status Banner */}
            <div className="mb-6 p-4 bg-bg-0 rounded-lg shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <StatusBadge status={data.health.status} />
                  <span className="text-ink-700">
                    System is {data.health.status}
                  </span>
                </div>
                <div className="text-base text-ink-500">
                  Last updated: {new Date(data.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border">
              {(['overview', 'logs', 'flags', 'canary'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-base font-medium border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-ink-400 hover:text-ink-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Logs"
                    value={data.metrics.totalLogs.toLocaleString()}
                    subtitle={`${data.bufferStats.totalProcessed.toLocaleString()} processed`}
                  />
                  <MetricCard
                    title="Error Rate"
                    value={`${(data.health.errorRate * 100).toFixed(2)}%`}
                    subtitle={data.health.errorRate < 0.05 ? 'Within threshold' : 'Above threshold'}
                  />
                  <MetricCard
                    title="Avg Latency"
                    value={`${data.health.avgLatency.toFixed(0)}ms`}
                  />
                  <MetricCard
                    title="P95 Latency"
                    value={`${data.health.p95Latency.toFixed(0)}ms`}
                  />
                </div>

                {/* By Source / Level */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-bg-0 rounded-lg p-4 shadow-sm border border-border">
                    <h3 className="font-medium text-ink-900 mb-3">Logs by Source</h3>
                    <div className="space-y-2">
                      {Object.entries(data.metrics.bySource).map(([source, count]) => (
                        <div key={source} className="flex justify-between items-center">
                          <SourceBadge source={source} />
                          <span className="text-base text-ink-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-bg-0 rounded-lg p-4 shadow-sm border border-border">
                    <h3 className="font-medium text-ink-900 mb-3">Logs by Level</h3>
                    <div className="space-y-2">
                      {Object.entries(data.metrics.byLevel).map(([level, count]) => (
                        <div key={level} className="flex justify-between items-center">
                          <LogLevelBadge level={level} />
                          <span className="text-base text-ink-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Routes */}
                {data.metrics.topRoutes.length > 0 && (
                  <div className="bg-bg-0 rounded-lg p-4 shadow-sm border border-border">
                    <h3 className="font-medium text-ink-900 mb-3">Top Routes</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-base">
                        <thead>
                          <tr className="text-left text-ink-500 border-b border-border">
                            <th className="pb-2">Route</th>
                            <th className="pb-2 text-right">Count</th>
                            <th className="pb-2 text-right">Avg Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.metrics.topRoutes.map((route, i) => (
                            <tr key={i} className="border-b border-border">
                              <td className="py-2 font-mono text-sm">{route.route}</td>
                              <td className="py-2 text-right">{route.count}</td>
                              <td className="py-2 text-right">{route.avgDuration.toFixed(0)}ms</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Top Errors */}
                {data.metrics.topErrors.length > 0 && (
                  <div className="bg-bg-0 rounded-lg p-4 shadow-sm border border-border">
                    <h3 className="font-medium text-ink-900 mb-3">Top Errors</h3>
                    <div className="space-y-2">
                      {data.metrics.topErrors.map((error, i) => (
                        <div key={i} className="flex justify-between items-start gap-4">
                          <code className="text-sm text-red-600 break-all">{error.message}</code>
                          <span className="text-base text-ink-500 whitespace-nowrap">{error.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && data.recentLogs && (
              <div className="bg-bg-0 rounded-lg shadow-sm border border-border">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-ink-900">Recent Logs</h3>
                </div>
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {data.recentLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-bg-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-ink-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <SourceBadge source={log.source} />
                        <LogLevelBadge level={log.level} />
                        {log.route && <span className="text-sm text-ink-500 font-mono">{log.route}</span>}
                        {log.duration && <span className="text-sm text-ink-400">{log.duration}ms</span>}
                      </div>
                      <p className="text-base text-ink-700 break-all">{log.message}</p>
                    </div>
                  ))}
                  {data.recentLogs.length === 0 && (
                    <div className="p-8 text-center text-ink-500">No logs in the current time window</div>
                  )}
                </div>
              </div>
            )}

            {/* Feature Flags Tab */}
            {activeTab === 'flags' && data.featureFlags && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard title="Total Flags" value={data.featureFlags.total} />
                  <MetricCard title="Enabled Flags" value={data.featureFlags.enabled} />
                </div>
                <div className="bg-bg-0 rounded-lg shadow-sm border border-border">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-medium text-ink-900">Feature Flags</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {data.featureFlags.flags.map((flag) => (
                      <div key={flag.name} className="p-4 flex items-center justify-between">
                        <div>
                          <span className="font-medium text-ink-900">{flag.name}</span>
                          <div className="text-sm text-ink-500 mt-0.5">
                            Updated: {new Date(flag.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-base text-ink-500">{flag.rolloutPercentage}%</span>
                          <StatusBadge status={flag.enabled ? 'healthy' : 'unhealthy'} />
                        </div>
                      </div>
                    ))}
                    {data.featureFlags.flags.length === 0 && (
                      <div className="p-8 text-center text-ink-500">No feature flags configured</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Canary Tab */}
            {activeTab === 'canary' && data.canary && (
              <div className="space-y-6">
                {/* Current Deployment */}
                <div className="bg-bg-0 rounded-lg p-4 shadow-sm border border-border">
                  <h3 className="font-medium text-ink-900 mb-3">Current Canary Deployment</h3>
                  {data.canary.current ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={data.canary.current.status} />
                        <span className="font-mono text-base">{data.canary.current.version}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-base">
                        <div>
                          <span className="text-ink-500">Rollout:</span>
                          <span className="ml-2 font-medium">{data.canary.current.percentage}%</span>
                        </div>
                        <div>
                          <span className="text-ink-500">Started:</span>
                          <span className="ml-2">{new Date(data.canary.current.startedAt).toLocaleString()}</span>
                        </div>
                        {data.canary.current.metrics && (
                          <div>
                            <span className="text-ink-500">Requests:</span>
                            <span className="ml-2">{data.canary.current.metrics.canaryRequests}</span>
                          </div>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-bg-2 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${data.canary.current.percentage}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-ink-500">No active canary deployment</div>
                  )}
                </div>

                {/* Recent Deployments */}
                <div className="bg-bg-0 rounded-lg shadow-sm border border-border">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-medium text-ink-900">Recent Deployments</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {data.canary.recentDeployments.map((deployment) => (
                      <div key={deployment.id} className="p-4 flex items-center justify-between">
                        <div>
                          <span className="font-mono text-base text-ink-900">{deployment.version}</span>
                          <div className="text-sm text-ink-500 mt-0.5">
                            {new Date(deployment.startedAt).toLocaleString()}
                          </div>
                        </div>
                        <StatusBadge status={deployment.status} />
                      </div>
                    ))}
                    {data.canary.recentDeployments.length === 0 && (
                      <div className="p-8 text-center text-ink-500">No deployment history</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
