/**
 * Canary Deployment Controller
 *
 * Manages gradual rollout of deployments with automatic rollback.
 * Supports percentage-based traffic routing and health monitoring.
 *
 * Features:
 * - Gradual rollout stages (10% → 50% → 100%)
 * - Error rate monitoring during rollout
 * - Automatic rollback on threshold breach
 * - Blue-green deployment support
 * - Deployment state persistence
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { sendAlert } from './alert-manager';
import type { AlertSeverity } from './alert-manager';

const DEPLOY_STATE_FILE = join(process.cwd(), 'config', 'observability', 'deploy-state.json');

// Deployment types
export type DeploymentStrategy = 'canary' | 'blue-green' | 'rolling' | 'instant';
export type DeploymentStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'rolled_back' | 'failed';

// Canary stage configuration
export interface CanaryStage {
  percentage: number;
  duration: number; // Duration in seconds before advancing to next stage
  minRequests: number; // Minimum requests before evaluating health
  maxErrorRate: number; // Maximum error rate (0-1) before rollback
}

// Default canary stages: 10% → 50% → 100%
export const DEFAULT_CANARY_STAGES: CanaryStage[] = [
  { percentage: 10, duration: 300, minRequests: 100, maxErrorRate: 0.05 }, // 5 min at 10%
  { percentage: 50, duration: 600, minRequests: 500, maxErrorRate: 0.03 }, // 10 min at 50%
  { percentage: 100, duration: 0, minRequests: 0, maxErrorRate: 0.02 }, // Full rollout
];

// Deployment configuration
export interface DeploymentConfig {
  strategy: DeploymentStrategy;
  stages: CanaryStage[];
  autoRollback: boolean;
  rollbackTimeoutMs: number;
  healthCheckIntervalMs: number;
}

// Deployment state
export interface DeploymentState {
  id: string;
  version: string;
  previousVersion: string | null;
  status: DeploymentStatus;
  strategy: DeploymentStrategy;
  currentStageIndex: number;
  currentPercentage: number;
  startedAt: string;
  completedAt: string | null;
  stages: CanaryStage[];
  metrics: DeploymentMetrics;
  rollbackReason: string | null;
}

// Metrics collected during deployment
export interface DeploymentMetrics {
  totalRequests: number;
  canaryRequests: number;
  canaryErrors: number;
  canaryLatencyP95: number;
  baselineErrors: number;
  baselineLatencyP95: number;
  lastUpdated: string;
}

interface DeployStateStore {
  current: DeploymentState | null;
  history: DeploymentState[];
  lastUpdated: string;
}

// In-memory state
let stateCache: DeployStateStore | null = null;

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
 * Ensure config directory exists
 */
function ensureConfigDir(): void {
  if (isServerless()) return;

  const configDir = join(process.cwd(), 'config', 'observability');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Generate deployment ID
 */
function generateDeployId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `deploy-${timestamp}-${random}`;
}

/**
 * Load deployment state from storage
 */
export function loadDeployState(): DeployStateStore {
  if (stateCache) {
    return stateCache;
  }

  if (isServerless()) {
    const envState = process.env.DEPLOY_STATE;
    if (envState) {
      try {
        stateCache = JSON.parse(envState);
        return stateCache!;
      } catch {
        // Fall through
      }
    }
    stateCache = { current: null, history: [], lastUpdated: new Date().toISOString() };
    return stateCache;
  }

  ensureConfigDir();

  if (!existsSync(DEPLOY_STATE_FILE)) {
    const defaultStore: DeployStateStore = {
      current: null,
      history: [],
      lastUpdated: new Date().toISOString(),
    };
    stateCache = defaultStore;
    return defaultStore;
  }

  try {
    const content = readFileSync(DEPLOY_STATE_FILE, 'utf8');
    stateCache = JSON.parse(content);
    return stateCache!;
  } catch {
    stateCache = { current: null, history: [], lastUpdated: new Date().toISOString() };
    return stateCache;
  }
}

/**
 * Save deployment state to storage
 */
export function saveDeployState(store: DeployStateStore): void {
  store.lastUpdated = new Date().toISOString();
  stateCache = store;

  if (isServerless()) {
    return;
  }

  ensureConfigDir();

  try {
    writeFileSync(DEPLOY_STATE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save deploy state:', error);
  }
}

/**
 * Start a new canary deployment
 */
export function startCanaryDeployment(
  version: string,
  options: Partial<DeploymentConfig> = {}
): DeploymentState {
  const store = loadDeployState();

  // Archive current deployment if exists
  if (store.current && store.current.status !== 'completed' && store.current.status !== 'rolled_back') {
    store.current.status = 'rolled_back';
    store.current.completedAt = new Date().toISOString();
    store.current.rollbackReason = 'Superseded by new deployment';
    store.history.unshift(store.current);
  }

  const stages = options.stages || DEFAULT_CANARY_STAGES;
  const now = new Date().toISOString();

  const deployment: DeploymentState = {
    id: generateDeployId(),
    version,
    previousVersion: store.current?.version || null,
    status: 'in_progress',
    strategy: options.strategy || 'canary',
    currentStageIndex: 0,
    currentPercentage: stages[0].percentage,
    startedAt: now,
    completedAt: null,
    stages,
    metrics: {
      totalRequests: 0,
      canaryRequests: 0,
      canaryErrors: 0,
      canaryLatencyP95: 0,
      baselineErrors: 0,
      baselineLatencyP95: 0,
      lastUpdated: now,
    },
    rollbackReason: null,
  };

  store.current = deployment;
  saveDeployState(store);

  console.log(`[Canary] Started deployment ${deployment.id} for version ${version} at ${stages[0].percentage}%`);

  void sendAlert({
    severity: 'medium' as AlertSeverity,
    title: 'Canary Deployment Started',
    message: `Version ${version} rolling out at ${stages[0].percentage}%`,
    metadata: {
      source: 'canary-deployment',
      deploymentId: deployment.id,
      version,
      percentage: stages[0].percentage,
    },
  });

  return deployment;
}

/**
 * Check if request should go to canary version
 */
export function shouldRouteToCanary(identifier?: string): boolean {
  const store = loadDeployState();

  if (!store.current || store.current.status !== 'in_progress') {
    return false;
  }

  const percentage = store.current.currentPercentage;

  if (percentage >= 100) return true;
  if (percentage <= 0) return false;

  // Use consistent hashing for sticky routing
  if (identifier) {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 100 < percentage;
  }

  // Random routing for anonymous users
  return Math.random() * 100 < percentage;
}

/**
 * Record a request for canary metrics
 */
export function recordCanaryRequest(
  isCanary: boolean,
  latencyMs: number,
  isError: boolean
): void {
  const store = loadDeployState();

  if (!store.current || store.current.status !== 'in_progress') {
    return;
  }

  store.current.metrics.totalRequests++;

  if (isCanary) {
    store.current.metrics.canaryRequests++;
    if (isError) {
      store.current.metrics.canaryErrors++;
    }
    // Update p95 with exponential moving average
    const alpha = 0.05;
    store.current.metrics.canaryLatencyP95 =
      store.current.metrics.canaryLatencyP95 * (1 - alpha) + latencyMs * alpha;
  } else {
    if (isError) {
      store.current.metrics.baselineErrors++;
    }
    const alpha = 0.05;
    store.current.metrics.baselineLatencyP95 =
      store.current.metrics.baselineLatencyP95 * (1 - alpha) + latencyMs * alpha;
  }

  store.current.metrics.lastUpdated = new Date().toISOString();

  // Check rollback conditions periodically
  if (store.current.metrics.canaryRequests % 10 === 0) {
    checkRollbackConditions(store);
  }

  saveDeployState(store);
}

/**
 * Check if rollback conditions are met
 */
function checkRollbackConditions(store: DeployStateStore): void {
  if (!store.current || store.current.status !== 'in_progress') {
    return;
  }

  const deployment = store.current;
  const stage = deployment.stages[deployment.currentStageIndex];
  const metrics = deployment.metrics;

  // Need minimum requests before evaluation
  if (metrics.canaryRequests < stage.minRequests) {
    return;
  }

  const errorRate = metrics.canaryRequests > 0
    ? metrics.canaryErrors / metrics.canaryRequests
    : 0;

  if (errorRate > stage.maxErrorRate) {
    rollbackDeployment(`Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold ${(stage.maxErrorRate * 100).toFixed(2)}%`);
  }
}

/**
 * Advance to next canary stage
 */
export function advanceCanaryStage(): DeploymentState | null {
  const store = loadDeployState();

  if (!store.current || store.current.status !== 'in_progress') {
    return null;
  }

  const nextIndex = store.current.currentStageIndex + 1;

  if (nextIndex >= store.current.stages.length) {
    // Complete deployment
    store.current.status = 'completed';
    store.current.completedAt = new Date().toISOString();
    store.current.currentPercentage = 100;

    console.log(`[Canary] Deployment ${store.current.id} completed successfully`);

    void sendAlert({
      severity: 'low' as AlertSeverity,
      title: 'Canary Deployment Completed',
      message: `Version ${store.current.version} fully rolled out`,
      metadata: {
        source: 'canary-deployment',
        deploymentId: store.current.id,
        version: store.current.version,
        duration: Date.now() - new Date(store.current.startedAt).getTime(),
      },
    });

    // Move to history
    store.history.unshift(store.current);
    // Keep last 10 deployments
    if (store.history.length > 10) {
      store.history = store.history.slice(0, 10);
    }

    saveDeployState(store);
    return store.current;
  }

  const nextStage = store.current.stages[nextIndex];
  store.current.currentStageIndex = nextIndex;
  store.current.currentPercentage = nextStage.percentage;

  console.log(`[Canary] Advanced to stage ${nextIndex + 1}: ${nextStage.percentage}%`);

  void sendAlert({
    severity: 'low' as AlertSeverity,
    title: 'Canary Stage Advanced',
    message: `Version ${store.current.version} now at ${nextStage.percentage}%`,
    metadata: {
      source: 'canary-deployment',
      deploymentId: store.current.id,
      stage: nextIndex + 1,
      percentage: nextStage.percentage,
    },
  });

  saveDeployState(store);
  return store.current;
}

/**
 * Rollback current deployment
 */
export function rollbackDeployment(reason: string): DeploymentState | null {
  const store = loadDeployState();

  if (!store.current) {
    return null;
  }

  store.current.status = 'rolled_back';
  store.current.completedAt = new Date().toISOString();
  store.current.rollbackReason = reason;
  store.current.currentPercentage = 0;

  console.log(`[Canary] Deployment ${store.current.id} rolled back: ${reason}`);

  void sendAlert({
    severity: 'critical' as AlertSeverity,
    title: 'Canary Deployment Rolled Back',
    message: `Version ${store.current.version} rolled back: ${reason}`,
    metadata: {
      source: 'canary-deployment',
      deploymentId: store.current.id,
      version: store.current.version,
      reason,
      metrics: store.current.metrics,
    },
  });

  // Move to history
  store.history.unshift(store.current);
  const rolledBack = store.current;
  store.current = null;

  saveDeployState(store);
  return rolledBack;
}

/**
 * Pause current deployment
 */
export function pauseDeployment(): DeploymentState | null {
  const store = loadDeployState();

  if (!store.current || store.current.status !== 'in_progress') {
    return null;
  }

  store.current.status = 'paused';
  console.log(`[Canary] Deployment ${store.current.id} paused at ${store.current.currentPercentage}%`);

  saveDeployState(store);
  return store.current;
}

/**
 * Resume paused deployment
 */
export function resumeDeployment(): DeploymentState | null {
  const store = loadDeployState();

  if (!store.current || store.current.status !== 'paused') {
    return null;
  }

  store.current.status = 'in_progress';
  console.log(`[Canary] Deployment ${store.current.id} resumed at ${store.current.currentPercentage}%`);

  saveDeployState(store);
  return store.current;
}

/**
 * Get current deployment state
 */
export function getCurrentDeployment(): DeploymentState | null {
  const store = loadDeployState();
  return store.current;
}

/**
 * Get deployment history
 */
export function getDeploymentHistory(): DeploymentState[] {
  const store = loadDeployState();
  return store.history;
}

/**
 * Export canary metrics for Prometheus
 */
export function exportCanaryMetrics(): string {
  const store = loadDeployState();
  const lines: string[] = [];

  lines.push('# HELP togetheros_canary_active Canary deployment active status');
  lines.push('# TYPE togetheros_canary_active gauge');
  lines.push(`togetheros_canary_active ${store.current?.status === 'in_progress' ? 1 : 0}`);

  if (store.current) {
    lines.push('# HELP togetheros_canary_percentage Current canary percentage');
    lines.push('# TYPE togetheros_canary_percentage gauge');
    lines.push(`togetheros_canary_percentage ${store.current.currentPercentage}`);

    lines.push('# HELP togetheros_canary_requests Total canary requests');
    lines.push('# TYPE togetheros_canary_requests counter');
    lines.push(`togetheros_canary_requests ${store.current.metrics.canaryRequests}`);

    lines.push('# HELP togetheros_canary_errors Total canary errors');
    lines.push('# TYPE togetheros_canary_errors counter');
    lines.push(`togetheros_canary_errors ${store.current.metrics.canaryErrors}`);

    const errorRate = store.current.metrics.canaryRequests > 0
      ? store.current.metrics.canaryErrors / store.current.metrics.canaryRequests
      : 0;
    lines.push('# HELP togetheros_canary_error_rate Canary error rate');
    lines.push('# TYPE togetheros_canary_error_rate gauge');
    lines.push(`togetheros_canary_error_rate ${errorRate}`);

    lines.push('# HELP togetheros_canary_latency_p95 Canary p95 latency in ms');
    lines.push('# TYPE togetheros_canary_latency_p95 gauge');
    lines.push(`togetheros_canary_latency_p95 ${store.current.metrics.canaryLatencyP95}`);
  }

  return lines.join('\n');
}

/**
 * Instantly complete deployment (skip canary)
 */
export function instantDeploy(version: string): DeploymentState {
  const store = loadDeployState();

  // Archive current deployment if exists
  if (store.current) {
    store.current.status = 'rolled_back';
    store.current.completedAt = new Date().toISOString();
    store.current.rollbackReason = 'Superseded by instant deployment';
    store.history.unshift(store.current);
  }

  const now = new Date().toISOString();

  const deployment: DeploymentState = {
    id: generateDeployId(),
    version,
    previousVersion: store.current?.version || null,
    status: 'completed',
    strategy: 'instant',
    currentStageIndex: 0,
    currentPercentage: 100,
    startedAt: now,
    completedAt: now,
    stages: [],
    metrics: {
      totalRequests: 0,
      canaryRequests: 0,
      canaryErrors: 0,
      canaryLatencyP95: 0,
      baselineErrors: 0,
      baselineLatencyP95: 0,
      lastUpdated: now,
    },
    rollbackReason: null,
  };

  store.history.unshift(deployment);
  store.current = null;

  saveDeployState(store);

  console.log(`[Canary] Instant deployment completed for version ${version}`);

  return deployment;
}
