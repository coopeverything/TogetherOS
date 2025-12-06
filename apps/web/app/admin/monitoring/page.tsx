'use client';

import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
      status: 'ok' | 'warning' | 'critical';
    };
  };
}

export default function MonitoringTestPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health');
    } finally {
      setLoading(false);
    }
  };

  const triggerTestError = () => {
    try {
      // Trigger a test error for Sentry
      throw new Error('Test error from monitoring page');
    } catch (err) {
      Sentry.captureException(err);
      alert('Test error sent to Sentry! Check your Sentry dashboard.');
    }
  };

  const triggerUnhandledError = () => {
    // This will be caught by Sentry's global error handler
    throw new Error('Unhandled test error for Sentry');
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600';
      case 'degraded':
      case 'warning':
        return 'text-yellow-600';
      case 'unhealthy':
      case 'critical':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-ink-700';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-100';
      case 'unhealthy':
      case 'critical':
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-bg-2';
    }
  };

  return (
    <div className="min-h-screen bg-bg-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-bg-0 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-2">Monitoring Test Page</h1>
          <p className="text-ink-700 mb-6">
            Test health checks, error tracking, and monitoring systems
          </p>

          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Checking...' : 'Check Health'}
            </button>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-base">Auto-refresh (5s)</span>
            </label>

            <button
              onClick={triggerTestError}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Test Sentry (Caught)
            </button>

            <button
              onClick={triggerUnhandledError}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Test Sentry (Uncaught)
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Health Status */}
          {health && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className={`p-4 rounded-lg ${getStatusBg(health.status)}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">System Status</h2>
                  <span className={`text-3xl font-bold ${getStatusColor(health.status)}`}>
                    {health.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 text-base text-ink-700">
                  <p>Last checked: {new Date(health.timestamp).toLocaleString()}</p>
                  <p>Uptime: {Math.floor(health.uptime)}s</p>
                </div>
              </div>

              {/* Database Check */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2 flex items-center justify-between">
                  Database
                  <span className={`text-base font-medium ${getStatusColor(health.checks.database.status)}`}>
                    {health.checks.database.status.toUpperCase()}
                  </span>
                </h3>
                {health.checks.database.latency !== undefined && (
                  <p className="text-base text-ink-700">
                    Latency: {health.checks.database.latency}ms
                  </p>
                )}
                {health.checks.database.error && (
                  <p className="text-base text-red-600">
                    Error: {health.checks.database.error}
                  </p>
                )}
              </div>

              {/* Memory Check */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2 flex items-center justify-between">
                  Memory
                  <span className={`text-base font-medium ${getStatusColor(health.checks.memory.status)}`}>
                    {health.checks.memory.status.toUpperCase()}
                  </span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-ink-700">Usage:</span>
                    <span className="font-medium">{health.checks.memory.percentage}%</span>
                  </div>
                  <div className="w-full bg-bg-2 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        health.checks.memory.percentage > 90
                          ? 'bg-red-600'
                          : health.checks.memory.percentage > 80
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${health.checks.memory.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-ink-400">
                    <span>Used: {(health.checks.memory.used / 1024 / 1024).toFixed(2)} MB</span>
                    <span>Total: {(health.checks.memory.total / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>

              {/* Raw JSON */}
              <details className="border border-border rounded-lg">
                <summary className="p-4 cursor-pointer font-semibold hover:bg-bg-1">
                  View Raw Response
                </summary>
                <pre className="p-4 bg-bg-2 overflow-x-auto text-sm">
                  {JSON.stringify(health, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Documentation */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Monitoring Documentation</h3>
            <ul className="text-base text-blue-800 space-y-1">
              <li>• Health endpoint: <code className="bg-blue-100 px-1">/api/health</code></li>
              <li>• Auto-rollback: Enabled in deployment workflow</li>
              <li>• Error tracking: Sentry (check dashboard for test errors)</li>
              <li>• Uptime monitoring: Configure UptimeRobot (see docs/ops/MONITORING.md)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
