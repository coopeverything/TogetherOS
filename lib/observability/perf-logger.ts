/**
 * Self-Hosted Performance Logger
 *
 * Tracks request timing and performance metrics
 * Logs to: logs/perf/requests-YYYY-MM-DD.ndjson
 */

import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ulid } from 'ulid';

const LOG_DIR = join(process.cwd(), 'logs', 'perf');

/**
 * Check if running in serverless environment
 */
function isServerless(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.LAMBDA_TASK_ROOT
  );
}

/**
 * Ensure log directory exists (skip in serverless)
 */
function ensureLogDir(): void {
  if (isServerless()) return;

  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Get log file path for today
 */
function getLogFilePath(): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return join(LOG_DIR, `requests-${date}.ndjson`);
}

export interface PerfLogEntry {
  id: string;
  ts: string;
  path: string;
  method: string;
  latency_ms: number;
  status: number;
  user_agent?: string;
  referer?: string;
}

/**
 * Log performance metrics to NDJSON
 */
export function logPerformance(entry: Omit<PerfLogEntry, 'id' | 'ts'>): void {
  const logEntry: PerfLogEntry = {
    id: ulid(),
    ts: new Date().toISOString(),
    ...entry,
  };

  const logLine = JSON.stringify(logEntry);

  // In serverless environments, log to console (platform captures it)
  if (isServerless()) {
    console.log('[Perf Log]', logLine);
    return;
  }

  // In local/VPS deployment, write to NDJSON file
  ensureLogDir();
  const logPath = getLogFilePath();

  try {
    appendFileSync(logPath, logLine + '\n', 'utf8');
  } catch (error) {
    console.error('Failed to write performance log:', error);
    // Fallback to console
    console.log('[Perf Log]', logLine);
  }
}

/**
 * Create a performance tracker for a request
 */
export function createPerfTracker(request: Request) {
  const start = Date.now();

  return {
    /**
     * End tracking and log performance
     */
    end(status: number): void {
      const latency = Date.now() - start;

      logPerformance({
        path: new URL(request.url).pathname,
        method: request.method,
        latency_ms: latency,
        status,
        user_agent: request.headers.get('user-agent') || undefined,
        referer: request.headers.get('referer') || undefined,
      });
    },

    /**
     * Get current latency without logging
     */
    getLatency(): number {
      return Date.now() - start;
    },
  };
}
