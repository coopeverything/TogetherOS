/**
 * Observability Module
 *
 * Self-hosted observability stack for TogetherOS.
 *
 * Features:
 * - Error tracking (NDJSON logs with PII sanitization)
 * - Performance logging (request timing)
 * - Alert management (Discord/Slack webhooks)
 * - APM tracing (distributed traces, spans)
 * - Performance regression detection
 * - Feature flags (percentage-based rollouts, user targeting)
 * - Canary deployment (gradual rollout with auto-rollback)
 *
 * @module observability
 */

// Error tracking
export { logError, hashIp, createErrorContext } from './error-logger';
export type { ErrorLogEntry } from './error-logger';

// Performance logging
export { logPerformance, createPerfTracker } from './perf-logger';
export type { PerfLogEntry } from './perf-logger';

// Alert management
export { sendAlert, alerts } from './alert-manager';
export type { AlertSeverity, Alert } from './alert-manager';

// APM tracing
export {
  // Trace context
  generateTraceId,
  generateSpanId,
  extractTraceContext,
  injectTraceContext,
  // Span management
  startSpan,
  endSpan,
  addSpanLog,
  setSpanStatus,
  setSpanTag,
  // Tracing wrapper
  trace,
  // Request tracing
  createTracedRequest,
  completeTracedRequest,
  // Baseline tracking
  loadBaselines,
  saveBaselines,
  updateBaseline,
  checkRegression,
} from './apm-tracer';
export type {
  TraceContext,
  Span,
  SpanStatus,
  SpanLog,
  TracedRequest,
  PerformanceBaseline,
} from './apm-tracer';

// Regression detection
export {
  recordLatency,
  getRouteStats,
  getAllRouteStats,
  resetBaseline,
  resetAllBaselines,
  exportPrometheusMetrics,
} from './regression-detector';
export type { RegressionConfig } from './regression-detector';

// Feature flags
export {
  evaluateFlag,
  isFeatureEnabled,
  setFlag,
  deleteFlag,
  getAllFlags,
  getFlag,
  updateRolloutPercentage,
  invalidateCache as invalidateFlagCache,
  exportFlagMetrics,
  loadFlags,
} from './feature-flags';
export type {
  FeatureFlag,
  FeatureFlagRule,
  FlagEvaluationContext,
  FlagEvaluationResult,
} from './feature-flags';

// Canary deployment
export {
  startCanaryDeployment,
  shouldRouteToCanary,
  recordCanaryRequest,
  advanceCanaryStage,
  rollbackDeployment,
  pauseDeployment,
  resumeDeployment,
  getCurrentDeployment,
  getDeploymentHistory,
  exportCanaryMetrics,
  instantDeploy,
  DEFAULT_CANARY_STAGES,
} from './canary-deployment';
export type {
  DeploymentStrategy,
  DeploymentStatus,
  DeploymentState,
  DeploymentMetrics,
  DeploymentConfig,
  CanaryStage,
} from './canary-deployment';
