/**
 * Log Aggregator
 *
 * Centralizes logs from all observability sources for unified querying and dashboards.
 * Supports filtering, time-based aggregation, and Prometheus export.
 *
 * Features:
 * - Unified log collection from errors, performance, traces, canary, flags
 * - Time-based aggregation for dashboard metrics
 * - Query interface with filters
 * - In-memory ring buffer for recent logs
 * - Prometheus metrics export
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const LOGS_DIR = join(process.cwd(), 'logs', 'observability');
const AGGREGATED_LOG_FILE = join(LOGS_DIR, 'aggregated.ndjson');
const MAX_MEMORY_LOGS = 1000;

// Log entry types
export type LogSource = 'error' | 'performance' | 'trace' | 'canary' | 'feature-flag' | 'system';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface AggregatedLogEntry {
  id: string;
  timestamp: string;
  source: LogSource;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
  userId?: string;
  sessionId?: string;
  route?: string;
  duration?: number;
  errorCode?: string;
}

export interface LogQuery {
  source?: LogSource | LogSource[];
  level?: LogLevel | LogLevel[];
  startTime?: Date;
  endTime?: Date;
  traceId?: string;
  userId?: string;
  route?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AggregatedMetrics {
  totalLogs: number;
  bySource: Record<LogSource, number>;
  byLevel: Record<LogLevel, number>;
  errorRate: number;
  avgDuration: number;
  p95Duration: number;
  topRoutes: Array<{ route: string; count: number; avgDuration: number }>;
  topErrors: Array<{ message: string; count: number }>;
  timeSeriesErrors: Array<{ timestamp: string; count: number }>;
  timeSeriesLatency: Array<{ timestamp: string; p50: number; p95: number }>;
}

// In-memory ring buffer for recent logs
const memoryLogs: AggregatedLogEntry[] = [];
let totalLogsProcessed = 0;

/**
 * Generate unique log ID
 */
function generateLogId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `log-${timestamp}-${random}`;
}

/**
 * Ensure logs directory exists
 */
function ensureLogsDir(): void {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }
}

/**
 * Add log entry to aggregator
 */
export function addLog(entry: Omit<AggregatedLogEntry, 'id' | 'timestamp'>): AggregatedLogEntry {
  const fullEntry: AggregatedLogEntry = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Add to memory buffer
  memoryLogs.push(fullEntry);
  if (memoryLogs.length > MAX_MEMORY_LOGS) {
    memoryLogs.shift();
  }
  totalLogsProcessed++;

  // Persist to file (async-safe)
  try {
    ensureLogsDir();
    const line = JSON.stringify(fullEntry) + '\n';
    writeFileSync(AGGREGATED_LOG_FILE, line, { flag: 'a' });
  } catch {
    // Silent fail for file persistence - memory buffer is primary
  }

  return fullEntry;
}

/**
 * Log helper functions by source
 */
export function logError(message: string, metadata?: Record<string, unknown>): AggregatedLogEntry {
  return addLog({ source: 'error', level: 'error', message, metadata });
}

export function logPerf(route: string, duration: number, metadata?: Record<string, unknown>): AggregatedLogEntry {
  return addLog({
    source: 'performance',
    level: 'info',
    message: `${route} - ${duration}ms`,
    route,
    duration,
    metadata,
  });
}

export function logTrace(traceId: string, spanId: string, message: string, metadata?: Record<string, unknown>): AggregatedLogEntry {
  return addLog({
    source: 'trace',
    level: 'debug',
    message,
    traceId,
    spanId,
    metadata,
  });
}

export function logCanary(message: string, metadata?: Record<string, unknown>): AggregatedLogEntry {
  return addLog({ source: 'canary', level: 'info', message, metadata });
}

export function logFeatureFlag(flagName: string, enabled: boolean, metadata?: Record<string, unknown>): AggregatedLogEntry {
  return addLog({
    source: 'feature-flag',
    level: 'debug',
    message: `Flag ${flagName}: ${enabled ? 'enabled' : 'disabled'}`,
    metadata: { flagName, enabled, ...metadata },
  });
}

export function logSystem(level: LogLevel, message: string, metadata?: Record<string, unknown>): AggregatedLogEntry {
  return addLog({ source: 'system', level, message, metadata });
}

/**
 * Query logs with filters
 */
export function queryLogs(query: LogQuery = {}): AggregatedLogEntry[] {
  let results = [...memoryLogs];

  // Filter by source
  if (query.source) {
    const sources = Array.isArray(query.source) ? query.source : [query.source];
    results = results.filter(log => sources.includes(log.source));
  }

  // Filter by level
  if (query.level) {
    const levels = Array.isArray(query.level) ? query.level : [query.level];
    results = results.filter(log => levels.includes(log.level));
  }

  // Filter by time range
  if (query.startTime) {
    results = results.filter(log => new Date(log.timestamp) >= query.startTime!);
  }
  if (query.endTime) {
    results = results.filter(log => new Date(log.timestamp) <= query.endTime!);
  }

  // Filter by trace ID
  if (query.traceId) {
    results = results.filter(log => log.traceId === query.traceId);
  }

  // Filter by user ID
  if (query.userId) {
    results = results.filter(log => log.userId === query.userId);
  }

  // Filter by route
  if (query.route) {
    results = results.filter(log => log.route?.includes(query.route!));
  }

  // Search in message
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(log =>
      log.message.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.metadata || {}).toLowerCase().includes(searchLower)
    );
  }

  // Sort by timestamp descending (most recent first)
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply pagination
  const offset = query.offset || 0;
  const limit = query.limit || 100;
  results = results.slice(offset, offset + limit);

  return results;
}

/**
 * Get aggregated metrics for dashboard
 */
export function getAggregatedMetrics(timeWindowMinutes: number = 60): AggregatedMetrics {
  const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
  const recentLogs = memoryLogs.filter(log => new Date(log.timestamp) >= cutoff);

  // Count by source
  const bySource: Record<LogSource, number> = {
    error: 0,
    performance: 0,
    trace: 0,
    canary: 0,
    'feature-flag': 0,
    system: 0,
  };
  recentLogs.forEach(log => {
    bySource[log.source]++;
  });

  // Count by level
  const byLevel: Record<LogLevel, number> = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    critical: 0,
  };
  recentLogs.forEach(log => {
    byLevel[log.level]++;
  });

  // Calculate error rate
  const totalRequests = bySource.performance || 1;
  const errorRate = bySource.error / totalRequests;

  // Calculate duration stats
  const durations = recentLogs
    .filter(log => log.duration !== undefined)
    .map(log => log.duration!);
  durations.sort((a, b) => a - b);

  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;
  const p95Duration = durations.length > 0
    ? durations[Math.floor(durations.length * 0.95)] || durations[durations.length - 1]
    : 0;

  // Top routes by count
  const routeCounts = new Map<string, { count: number; totalDuration: number }>();
  recentLogs
    .filter(log => log.route)
    .forEach(log => {
      const existing = routeCounts.get(log.route!) || { count: 0, totalDuration: 0 };
      routeCounts.set(log.route!, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + (log.duration || 0),
      });
    });
  const topRoutes = Array.from(routeCounts.entries())
    .map(([route, stats]) => ({
      route,
      count: stats.count,
      avgDuration: stats.count > 0 ? stats.totalDuration / stats.count : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top errors by message
  const errorCounts = new Map<string, number>();
  recentLogs
    .filter(log => log.level === 'error' || log.level === 'critical')
    .forEach(log => {
      const msg = log.message.substring(0, 100);
      errorCounts.set(msg, (errorCounts.get(msg) || 0) + 1);
    });
  const topErrors = Array.from(errorCounts.entries())
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Time series data (5-minute buckets)
  const bucketMs = 5 * 60 * 1000;
  const buckets = new Map<number, { errors: number; latencies: number[] }>();

  recentLogs.forEach(log => {
    const bucketTime = Math.floor(new Date(log.timestamp).getTime() / bucketMs) * bucketMs;
    const bucket = buckets.get(bucketTime) || { errors: 0, latencies: [] };

    if (log.level === 'error' || log.level === 'critical') {
      bucket.errors++;
    }
    if (log.duration !== undefined) {
      bucket.latencies.push(log.duration);
    }

    buckets.set(bucketTime, bucket);
  });

  const sortedBuckets = Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]);

  const timeSeriesErrors = sortedBuckets.map(([ts, data]) => ({
    timestamp: new Date(ts).toISOString(),
    count: data.errors,
  }));

  const timeSeriesLatency = sortedBuckets.map(([ts, data]) => {
    const sorted = data.latencies.sort((a, b) => a - b);
    return {
      timestamp: new Date(ts).toISOString(),
      p50: sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.5)] : 0,
      p95: sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1] : 0,
    };
  });

  return {
    totalLogs: recentLogs.length,
    bySource,
    byLevel,
    errorRate,
    avgDuration,
    p95Duration,
    topRoutes,
    topErrors,
    timeSeriesErrors,
    timeSeriesLatency,
  };
}

/**
 * Export metrics in Prometheus format
 */
export function exportPrometheusLogs(): string {
  const metrics = getAggregatedMetrics(60);
  const lines: string[] = [];

  lines.push('# HELP togetheros_logs_total Total logs by source and level');
  lines.push('# TYPE togetheros_logs_total counter');
  for (const [source, count] of Object.entries(metrics.bySource)) {
    lines.push(`togetheros_logs_total{source="${source}"} ${count}`);
  }

  lines.push('# HELP togetheros_logs_by_level Logs by level');
  lines.push('# TYPE togetheros_logs_by_level gauge');
  for (const [level, count] of Object.entries(metrics.byLevel)) {
    lines.push(`togetheros_logs_by_level{level="${level}"} ${count}`);
  }

  lines.push('# HELP togetheros_error_rate Error rate');
  lines.push('# TYPE togetheros_error_rate gauge');
  lines.push(`togetheros_error_rate ${metrics.errorRate}`);

  lines.push('# HELP togetheros_request_duration_avg Average request duration in ms');
  lines.push('# TYPE togetheros_request_duration_avg gauge');
  lines.push(`togetheros_request_duration_avg ${metrics.avgDuration}`);

  lines.push('# HELP togetheros_request_duration_p95 P95 request duration in ms');
  lines.push('# TYPE togetheros_request_duration_p95 gauge');
  lines.push(`togetheros_request_duration_p95 ${metrics.p95Duration}`);

  lines.push('# HELP togetheros_logs_processed_total Total logs processed since startup');
  lines.push('# TYPE togetheros_logs_processed_total counter');
  lines.push(`togetheros_logs_processed_total ${totalLogsProcessed}`);

  return lines.join('\n');
}

/**
 * Get logs from persistent storage (file)
 */
export function getPersistedLogs(limit: number = 1000): AggregatedLogEntry[] {
  if (!existsSync(AGGREGATED_LOG_FILE)) {
    return [];
  }

  try {
    const content = readFileSync(AGGREGATED_LOG_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    const logs: AggregatedLogEntry[] = [];

    // Read last N lines
    const startIndex = Math.max(0, lines.length - limit);
    for (let i = startIndex; i < lines.length; i++) {
      try {
        logs.push(JSON.parse(lines[i]));
      } catch {
        // Skip malformed lines
      }
    }

    return logs;
  } catch {
    return [];
  }
}

/**
 * Clear old logs from persistence (keep last N days)
 */
export function cleanupOldLogs(daysToKeep: number = 7): number {
  if (!existsSync(AGGREGATED_LOG_FILE)) {
    return 0;
  }

  const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  let removedCount = 0;

  try {
    const content = readFileSync(AGGREGATED_LOG_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    const keepLines: string[] = [];

    for (const line of lines) {
      try {
        const log: AggregatedLogEntry = JSON.parse(line);
        if (new Date(log.timestamp) >= cutoff) {
          keepLines.push(line);
        } else {
          removedCount++;
        }
      } catch {
        // Keep malformed lines (might be important)
        keepLines.push(line);
      }
    }

    writeFileSync(AGGREGATED_LOG_FILE, keepLines.join('\n') + '\n', 'utf8');
    return removedCount;
  } catch {
    return 0;
  }
}

/**
 * Get memory buffer stats
 */
export function getBufferStats(): { size: number; maxSize: number; totalProcessed: number } {
  return {
    size: memoryLogs.length,
    maxSize: MAX_MEMORY_LOGS,
    totalProcessed: totalLogsProcessed,
  };
}

/**
 * Clear memory buffer (for testing)
 */
export function clearMemoryBuffer(): void {
  memoryLogs.length = 0;
}
