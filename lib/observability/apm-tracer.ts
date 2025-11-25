/**
 * APM Tracer - Distributed Tracing Module
 *
 * Provides trace ID propagation and span tracking for distributed tracing.
 * Self-hosted alternative to commercial APM solutions.
 *
 * Features:
 * - Trace ID generation and propagation
 * - Span tracking for operations (DB queries, external calls)
 * - Context propagation across async boundaries
 * - Performance baseline tracking
 */

import { ulid } from 'ulid';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs', 'traces');
const BASELINE_FILE = join(process.cwd(), 'config', 'observability', 'baselines.json');

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
 * Ensure directories exist
 */
function ensureDirs(): void {
  if (isServerless()) return;

  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }

  const baselineDir = join(process.cwd(), 'config', 'observability');
  if (!existsSync(baselineDir)) {
    mkdirSync(baselineDir, { recursive: true });
  }
}

// Span status
export type SpanStatus = 'ok' | 'error' | 'timeout';

// Span represents a single operation within a trace
export interface Span {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: SpanStatus;
  tags: Record<string, string | number | boolean>;
  logs: SpanLog[];
}

export interface SpanLog {
  timestamp: number;
  event: string;
  payload?: Record<string, unknown>;
}

// Trace context for propagation
export interface TraceContext {
  traceId: string;
  spanId: string;
  sampled: boolean;
}

// Performance baseline
export interface PerformanceBaseline {
  route: string;
  p50: number;
  p95: number;
  p99: number;
  sampleCount: number;
  lastUpdated: string;
}

// Active spans storage (in-memory for current process)
const activeSpans = new Map<string, Span>();

/**
 * Generate a new trace ID
 */
export function generateTraceId(): string {
  return ulid();
}

/**
 * Generate a new span ID
 */
export function generateSpanId(): string {
  return ulid().slice(0, 16);
}

/**
 * Create trace context from incoming request headers
 */
export function extractTraceContext(headers: Headers): TraceContext | null {
  // Support W3C Trace Context format
  const traceparent = headers.get('traceparent');

  if (traceparent) {
    // Format: version-traceid-spanid-flags
    const parts = traceparent.split('-');
    if (parts.length === 4) {
      return {
        traceId: parts[1],
        spanId: parts[2],
        sampled: parts[3] === '01',
      };
    }
  }

  // Support custom header fallback
  const customTraceId = headers.get('x-trace-id');
  if (customTraceId) {
    return {
      traceId: customTraceId,
      spanId: headers.get('x-span-id') || generateSpanId(),
      sampled: true,
    };
  }

  return null;
}

/**
 * Create headers for trace context propagation
 */
export function injectTraceContext(context: TraceContext): Record<string, string> {
  return {
    traceparent: `00-${context.traceId}-${context.spanId}-${context.sampled ? '01' : '00'}`,
    'x-trace-id': context.traceId,
    'x-span-id': context.spanId,
  };
}

/**
 * Start a new span
 */
export function startSpan(
  operationName: string,
  options: {
    traceId?: string;
    parentSpanId?: string;
    serviceName?: string;
    tags?: Record<string, string | number | boolean>;
  } = {}
): Span {
  const span: Span = {
    spanId: generateSpanId(),
    traceId: options.traceId || generateTraceId(),
    parentSpanId: options.parentSpanId,
    operationName,
    serviceName: options.serviceName || 'togetheros-app',
    startTime: Date.now(),
    status: 'ok',
    tags: options.tags || {},
    logs: [],
  };

  activeSpans.set(span.spanId, span);
  return span;
}

/**
 * Add a log to a span
 */
export function addSpanLog(span: Span, event: string, payload?: Record<string, unknown>): void {
  span.logs.push({
    timestamp: Date.now(),
    event,
    payload,
  });
}

/**
 * Set span status
 */
export function setSpanStatus(span: Span, status: SpanStatus): void {
  span.status = status;
}

/**
 * Add tag to span
 */
export function setSpanTag(span: Span, key: string, value: string | number | boolean): void {
  span.tags[key] = value;
}

/**
 * End a span and log it
 */
export function endSpan(span: Span): void {
  span.endTime = Date.now();
  span.duration = span.endTime - span.startTime;
  activeSpans.delete(span.spanId);

  // Log the span
  logSpan(span);
}

/**
 * Get log file path for today's traces
 */
function getTraceLogPath(): string {
  const date = new Date().toISOString().split('T')[0];
  return join(LOG_DIR, `traces-${date}.ndjson`);
}

/**
 * Log span to NDJSON file
 */
function logSpan(span: Span): void {
  const logLine = JSON.stringify({
    type: 'span',
    ...span,
    timestamp: new Date().toISOString(),
  });

  if (isServerless()) {
    console.log('[APM Trace]', logLine);
    return;
  }

  ensureDirs();
  const logPath = getTraceLogPath();

  try {
    appendFileSync(logPath, logLine + '\n', 'utf8');
  } catch (error) {
    console.error('Failed to write trace log:', error);
    console.log('[APM Trace]', logLine);
  }
}

/**
 * Create a traced wrapper for async operations
 */
export function trace<T>(
  operationName: string,
  fn: (span: Span) => Promise<T>,
  options: {
    traceId?: string;
    parentSpanId?: string;
    serviceName?: string;
    tags?: Record<string, string | number | boolean>;
  } = {}
): Promise<T> {
  const span = startSpan(operationName, options);

  return fn(span)
    .then((result) => {
      endSpan(span);
      return result;
    })
    .catch((error) => {
      setSpanStatus(span, 'error');
      setSpanTag(span, 'error.message', error.message);
      setSpanTag(span, 'error.type', error.constructor.name);
      endSpan(span);
      throw error;
    });
}

// ============================================
// Performance Baseline Tracking
// ============================================

interface Baselines {
  routes: Record<string, PerformanceBaseline>;
  lastUpdated: string;
}

/**
 * Load performance baselines from file
 */
export function loadBaselines(): Baselines {
  if (isServerless()) {
    return { routes: {}, lastUpdated: new Date().toISOString() };
  }

  ensureDirs();

  if (!existsSync(BASELINE_FILE)) {
    return { routes: {}, lastUpdated: new Date().toISOString() };
  }

  try {
    const content = readFileSync(BASELINE_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    return { routes: {}, lastUpdated: new Date().toISOString() };
  }
}

/**
 * Save performance baselines to file
 */
export function saveBaselines(baselines: Baselines): void {
  if (isServerless()) return;

  ensureDirs();

  try {
    baselines.lastUpdated = new Date().toISOString();
    writeFileSync(BASELINE_FILE, JSON.stringify(baselines, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save baselines:', error);
  }
}

/**
 * Update baseline for a route with new latency sample
 */
export function updateBaseline(route: string, latencyMs: number): void {
  const baselines = loadBaselines();

  if (!baselines.routes[route]) {
    baselines.routes[route] = {
      route,
      p50: latencyMs,
      p95: latencyMs,
      p99: latencyMs,
      sampleCount: 1,
      lastUpdated: new Date().toISOString(),
    };
  } else {
    const baseline = baselines.routes[route];
    const count = baseline.sampleCount;

    // Exponential moving average for baseline updates
    const alpha = Math.min(0.1, 1 / (count + 1));
    baseline.p50 = baseline.p50 * (1 - alpha) + latencyMs * alpha;
    baseline.p95 = Math.max(baseline.p95, latencyMs * 0.95);
    baseline.p99 = Math.max(baseline.p99, latencyMs * 0.99);
    baseline.sampleCount = count + 1;
    baseline.lastUpdated = new Date().toISOString();
  }

  saveBaselines(baselines);
}

/**
 * Check if latency represents a regression from baseline
 */
export function checkRegression(
  route: string,
  latencyMs: number
): { isRegression: boolean; severity: 'warning' | 'critical' | null; baseline: PerformanceBaseline | null } {
  const baselines = loadBaselines();
  const baseline = baselines.routes[route];

  if (!baseline || baseline.sampleCount < 10) {
    return { isRegression: false, severity: null, baseline: null };
  }

  // Check against p95 for warning, p99 for critical
  if (latencyMs > baseline.p99 * 1.5) {
    return { isRegression: true, severity: 'critical', baseline };
  }

  if (latencyMs > baseline.p95 * 1.3) {
    return { isRegression: true, severity: 'warning', baseline };
  }

  return { isRegression: false, severity: null, baseline };
}

// ============================================
// Request Tracing Middleware Helper
// ============================================

export interface TracedRequest {
  traceContext: TraceContext;
  rootSpan: Span;
}

/**
 * Create a traced request context for a handler
 */
export function createTracedRequest(request: Request): TracedRequest {
  // Extract or create trace context
  const existingContext = extractTraceContext(request.headers);
  const traceId = existingContext?.traceId || generateTraceId();
  const parentSpanId = existingContext?.spanId;

  // Create root span for this request
  const rootSpan = startSpan(`HTTP ${request.method}`, {
    traceId,
    parentSpanId,
    tags: {
      'http.method': request.method,
      'http.url': request.url,
      'http.route': new URL(request.url).pathname,
    },
  });

  const traceContext: TraceContext = {
    traceId,
    spanId: rootSpan.spanId,
    sampled: true,
  };

  return { traceContext, rootSpan };
}

/**
 * Complete a traced request
 */
export function completeTracedRequest(
  tracedRequest: TracedRequest,
  status: number,
  options: { checkBaseline?: boolean } = {}
): void {
  const { rootSpan } = tracedRequest;

  setSpanTag(rootSpan, 'http.status_code', status);

  if (status >= 400) {
    setSpanStatus(rootSpan, 'error');
  }

  endSpan(rootSpan);

  // Check for performance regression if enabled
  if (options.checkBaseline && rootSpan.duration) {
    const route = rootSpan.tags['http.route'] as string;
    const regression = checkRegression(route, rootSpan.duration);

    if (regression.isRegression) {
      console.warn(
        `[APM] Performance regression detected on ${route}: ${rootSpan.duration}ms ` +
          `(baseline p95: ${regression.baseline?.p95}ms, severity: ${regression.severity})`
      );
    }

    // Update baseline with new sample
    updateBaseline(route, rootSpan.duration);
  }
}
