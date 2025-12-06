'use client';

import { useState, useEffect } from 'react';

interface SystemMetrics {
  timestamp: string;
  process: {
    uptime_seconds: number;
    memory: {
      rss: number;
      heap_total: number;
      heap_used: number;
    };
  };
  system: {
    cpu_count: number;
    load_average: {
      '1min': number;
      '5min': number;
      '15min': number;
      normalized: number;
      status: 'ok' | 'warning' | 'critical';
    };
    memory: {
      total: number;
      free: number;
      used: number;
      percentage: number;
      status: 'ok' | 'warning' | 'critical';
    };
  };
  status: 'ok' | 'warning' | 'critical';
}

export default function LogsTestPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/metrics/system');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-ink-700';
    }
  };

  const getStatusBg = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return 'bg-green-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'critical':
        return 'bg-red-100';
      default:
        return 'bg-bg-2';
    }
  };

  return (
    <div className="min-h-screen bg-bg-1 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">
            System Metrics Dashboard
          </h1>
          <p className="text-ink-700">
            Real-time system resource monitoring • Self-hosted observability
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Refresh Metrics'}
          </button>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-ink-700">Auto-refresh (5s)</span>
          </label>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {metrics && (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className={`p-6 rounded-lg ${getStatusBg(metrics.status)}`}>
              <h2 className="text-xl font-semibold mb-2">
                System Status:{' '}
                <span className={`uppercase ${getStatusColor(metrics.status)}`}>
                  {metrics.status}
                </span>
              </h2>
              <p className="text-sm text-ink-700">
                Last updated: {new Date(metrics.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Process Metrics */}
            <div className="bg-bg-0 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Process Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-ink-700">Uptime</p>
                  <p className="text-2xl font-mono">
                    {formatUptime(metrics.process.uptime_seconds)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-700">Heap Used</p>
                  <p className="text-2xl font-mono">
                    {formatBytes(metrics.process.memory.heap_used)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-700">Heap Total</p>
                  <p className="text-2xl font-mono">
                    {formatBytes(metrics.process.memory.heap_total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-700">RSS</p>
                  <p className="text-2xl font-mono">
                    {formatBytes(metrics.process.memory.rss)}
                  </p>
                </div>
              </div>
            </div>

            {/* System Memory */}
            <div className="bg-bg-0 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">System Memory</h2>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-ink-700">
                    {formatBytes(metrics.system.memory.used)} /{' '}
                    {formatBytes(metrics.system.memory.total)}
                  </span>
                  <span
                    className={`text-sm font-medium ${getStatusColor(
                      metrics.system.memory.status
                    )}`}
                  >
                    {metrics.system.memory.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-bg-2 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      metrics.system.memory.status === 'critical'
                        ? 'bg-red-500'
                        : metrics.system.memory.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.system.memory.percentage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-ink-700">Total</p>
                  <p className="text-lg font-mono">
                    {formatBytes(metrics.system.memory.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-700">Used</p>
                  <p className="text-lg font-mono">
                    {formatBytes(metrics.system.memory.used)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-700">Free</p>
                  <p className="text-lg font-mono">
                    {formatBytes(metrics.system.memory.free)}
                  </p>
                </div>
              </div>
            </div>

            {/* CPU Load */}
            <div className="bg-bg-0 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">CPU Load Average</h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-ink-700">1 min</p>
                  <p className="text-2xl font-mono">
                    {metrics.system.load_average['1min'].toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-700">5 min</p>
                  <p className="text-2xl font-mono">
                    {metrics.system.load_average['5min'].toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-700">15 min</p>
                  <p className="text-2xl font-mono">
                    {metrics.system.load_average['15min'].toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-700">Normalized</p>
                  <p
                    className={`text-2xl font-mono ${getStatusColor(
                      metrics.system.load_average.status
                    )}`}
                  >
                    {metrics.system.load_average.normalized.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-ink-700 mt-4">
                CPUs: {metrics.system.cpu_count} cores
              </p>
            </div>

            {/* Raw JSON */}
            <details className="bg-bg-0 p-6 rounded-lg shadow-sm">
              <summary className="text-xl font-semibold cursor-pointer">
                Raw JSON Response
              </summary>
              <pre className="mt-4 p-4 bg-bg-2 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(metrics, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
