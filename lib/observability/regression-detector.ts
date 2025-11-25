/**
 * Performance Regression Detector
 *
 * Monitors performance metrics and detects regressions against baselines.
 * Integrates with alert manager for notifications.
 *
 * Features:
 * - Rolling window statistics
 * - Baseline comparison
 * - Alert threshold configuration
 * - Historical trend analysis
 */

import { sendAlert } from './alert-manager';
import type { AlertSeverity } from './alert-manager';

// Configuration
export interface RegressionConfig {
  // Window size for calculating rolling statistics (in samples)
  windowSize: number;
  // Threshold multiplier for warning alerts (e.g., 1.3 = 30% above baseline)
  warningThreshold: number;
  // Threshold multiplier for critical alerts (e.g., 1.5 = 50% above baseline)
  criticalThreshold: number;
  // Minimum samples before alerting
  minimumSamples: number;
  // Cooldown period between alerts (ms)
  alertCooldownMs: number;
}

const DEFAULT_CONFIG: RegressionConfig = {
  windowSize: 100,
  warningThreshold: 1.3,
  criticalThreshold: 1.5,
  minimumSamples: 10,
  alertCooldownMs: 300000, // 5 minutes
};

// Rolling window for latency samples
interface LatencyWindow {
  samples: number[];
  timestamps: number[];
  sum: number;
  sumSquares: number;
}

// Per-route statistics
interface RouteStats {
  window: LatencyWindow;
  baseline: {
    p50: number;
    p95: number;
    p99: number;
  } | null;
  lastAlertTime: number;
  totalRequests: number;
  errorCount: number;
}

// In-memory storage for route statistics
const routeStats = new Map<string, RouteStats>();

/**
 * Create a new latency window
 */
function createWindow(): LatencyWindow {
  return {
    samples: [],
    timestamps: [],
    sum: 0,
    sumSquares: 0,
  };
}

/**
 * Create new route stats
 */
function createRouteStats(): RouteStats {
  return {
    window: createWindow(),
    baseline: null,
    lastAlertTime: 0,
    totalRequests: 0,
    errorCount: 0,
  };
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Add a latency sample to the window
 */
function addSample(window: LatencyWindow, latency: number, config: RegressionConfig): void {
  window.samples.push(latency);
  window.timestamps.push(Date.now());
  window.sum += latency;
  window.sumSquares += latency * latency;

  // Maintain window size
  if (window.samples.length > config.windowSize) {
    const removed = window.samples.shift()!;
    window.timestamps.shift();
    window.sum -= removed;
    window.sumSquares -= removed * removed;
  }
}

/**
 * Calculate statistics from window
 */
function calculateStats(window: LatencyWindow): {
  mean: number;
  stdDev: number;
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
} | null {
  if (window.samples.length === 0) return null;

  const n = window.samples.length;
  const mean = window.sum / n;
  const variance = window.sumSquares / n - mean * mean;
  const stdDev = Math.sqrt(Math.max(0, variance));

  const sorted = [...window.samples].sort((a, b) => a - b);

  return {
    mean,
    stdDev,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

/**
 * Record a latency sample for a route
 */
export function recordLatency(
  route: string,
  latencyMs: number,
  options: {
    isError?: boolean;
    config?: Partial<RegressionConfig>;
  } = {}
): void {
  const config = { ...DEFAULT_CONFIG, ...options.config };

  if (!routeStats.has(route)) {
    routeStats.set(route, createRouteStats());
  }

  const stats = routeStats.get(route)!;
  stats.totalRequests++;

  if (options.isError) {
    stats.errorCount++;
  }

  addSample(stats.window, latencyMs, config);

  // Update baseline if we have enough samples and no baseline exists
  if (!stats.baseline && stats.window.samples.length >= config.minimumSamples) {
    const windowStats = calculateStats(stats.window);
    if (windowStats) {
      stats.baseline = {
        p50: windowStats.p50,
        p95: windowStats.p95,
        p99: windowStats.p99,
      };
    }
  }

  // Check for regression
  checkAndAlert(route, latencyMs, stats, config);
}

/**
 * Check for regression and send alert if needed
 */
function checkAndAlert(
  route: string,
  latencyMs: number,
  stats: RouteStats,
  config: RegressionConfig
): void {
  if (!stats.baseline) return;
  if (stats.window.samples.length < config.minimumSamples) return;

  const now = Date.now();
  if (now - stats.lastAlertTime < config.alertCooldownMs) return;

  const windowStats = calculateStats(stats.window);
  if (!windowStats) return;

  // Check p95 against baseline
  const p95Ratio = windowStats.p95 / stats.baseline.p95;

  if (p95Ratio >= config.criticalThreshold) {
    stats.lastAlertTime = now;
    sendRegressionAlert(route, 'critical', windowStats, stats.baseline, p95Ratio);
  } else if (p95Ratio >= config.warningThreshold) {
    stats.lastAlertTime = now;
    sendRegressionAlert(route, 'warning', windowStats, stats.baseline, p95Ratio);
  }
}

/**
 * Send regression alert
 */
function sendRegressionAlert(
  route: string,
  severity: 'warning' | 'critical',
  current: { p50: number; p95: number; p99: number },
  baseline: { p50: number; p95: number; p99: number },
  ratio: number
): void {
  const alertSeverity: AlertSeverity = severity === 'critical' ? 'critical' : 'high';
  const percentIncrease = Math.round((ratio - 1) * 100);

  void sendAlert({
    severity: alertSeverity,
    title: `Performance Regression: ${route}`,
    message:
      `p95 latency increased by ${percentIncrease}%\n` +
      `Current: ${Math.round(current.p95)}ms | Baseline: ${Math.round(baseline.p95)}ms\n` +
      `p99: ${Math.round(current.p99)}ms | p50: ${Math.round(current.p50)}ms`,
    metadata: {
      source: 'regression-detector',
      route,
      currentP95: current.p95,
      baselineP95: baseline.p95,
      ratio,
      percentIncrease,
    },
  });
}

/**
 * Get current statistics for a route
 */
export function getRouteStats(route: string): {
  current: ReturnType<typeof calculateStats>;
  baseline: RouteStats['baseline'];
  totalRequests: number;
  errorCount: number;
  errorRate: number;
} | null {
  const stats = routeStats.get(route);
  if (!stats) return null;

  const current = calculateStats(stats.window);
  const errorRate = stats.totalRequests > 0 ? stats.errorCount / stats.totalRequests : 0;

  return {
    current,
    baseline: stats.baseline,
    totalRequests: stats.totalRequests,
    errorCount: stats.errorCount,
    errorRate,
  };
}

/**
 * Get all route statistics
 */
export function getAllRouteStats(): Map<string, ReturnType<typeof getRouteStats>> {
  const result = new Map<string, ReturnType<typeof getRouteStats>>();

  for (const [route] of routeStats) {
    result.set(route, getRouteStats(route));
  }

  return result;
}

/**
 * Reset baseline for a route (useful after deployments)
 */
export function resetBaseline(route: string): void {
  const stats = routeStats.get(route);
  if (stats) {
    stats.baseline = null;
    stats.window = createWindow();
  }
}

/**
 * Reset all baselines (useful after major deployments)
 */
export function resetAllBaselines(): void {
  for (const [, stats] of routeStats) {
    stats.baseline = null;
    stats.window = createWindow();
  }
}

/**
 * Export metrics in Prometheus format
 */
export function exportPrometheusMetrics(): string {
  const lines: string[] = [];

  lines.push('# HELP togetheros_route_latency_p95 Route p95 latency in milliseconds');
  lines.push('# TYPE togetheros_route_latency_p95 gauge');

  lines.push('# HELP togetheros_route_latency_baseline_p95 Route baseline p95 latency in milliseconds');
  lines.push('# TYPE togetheros_route_latency_baseline_p95 gauge');

  lines.push('# HELP togetheros_route_error_rate Route error rate');
  lines.push('# TYPE togetheros_route_error_rate gauge');

  for (const [route, stats] of routeStats) {
    const current = calculateStats(stats.window);
    if (current) {
      const safeRoute = route.replace(/"/g, '\\"');
      lines.push(`togetheros_route_latency_p95{route="${safeRoute}"} ${current.p95}`);

      if (stats.baseline) {
        lines.push(`togetheros_route_latency_baseline_p95{route="${safeRoute}"} ${stats.baseline.p95}`);
      }

      const errorRate = stats.totalRequests > 0 ? stats.errorCount / stats.totalRequests : 0;
      lines.push(`togetheros_route_error_rate{route="${safeRoute}"} ${errorRate}`);
    }
  }

  return lines.join('\n');
}
