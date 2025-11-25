# Feature Flags & Canary Deployment Guide

This guide covers the self-hosted feature flags and canary deployment systems in TogetherOS.

## Feature Flags

### Overview

The feature flags system allows controlled rollout of features with:
- Percentage-based gradual rollouts
- User/group targeting rules
- Environment-based overrides
- Real-time flag updates

### Basic Usage

```typescript
import { isFeatureEnabled, evaluateFlag } from '@/lib/observability';

// Simple boolean check
if (isFeatureEnabled('new-dashboard')) {
  // Show new dashboard
}

// With user context
const context = {
  userId: user.id,
  groupId: user.groupId,
  environment: process.env.NODE_ENV,
};

if (isFeatureEnabled('beta-feature', context)) {
  // Show beta feature
}

// Get detailed evaluation result
const result = evaluateFlag('premium-feature', context);
console.log(result.reason); // 'percentage', 'rule', 'disabled', etc.
```

### Creating Feature Flags

```typescript
import { setFlag } from '@/lib/observability';

// Create a feature flag with 10% rollout
setFlag({
  name: 'new-onboarding-flow',
  description: 'Redesigned onboarding experience',
  enabled: true,
  rolloutPercentage: 10,
  rules: [],
});

// Create a flag with user targeting
setFlag({
  name: 'beta-testing',
  description: 'Beta features for selected users',
  enabled: true,
  rolloutPercentage: 0,
  rules: [
    { type: 'user', value: ['user-123', 'user-456'] },
    { type: 'group', value: 'beta-testers' },
  ],
});

// Environment-based flag
setFlag({
  name: 'debug-mode',
  description: 'Enable debug features',
  enabled: true,
  rolloutPercentage: 100,
  rules: [
    { type: 'environment', value: 'development' },
  ],
});
```

### Managing Flags

```typescript
import {
  getAllFlags,
  getFlag,
  updateRolloutPercentage,
  deleteFlag,
} from '@/lib/observability';

// List all flags
const flags = getAllFlags();

// Get specific flag
const flag = getFlag('new-feature');

// Update rollout percentage (gradual rollout)
updateRolloutPercentage('new-feature', 25); // 10% → 25%
updateRolloutPercentage('new-feature', 50); // 25% → 50%
updateRolloutPercentage('new-feature', 100); // Full rollout

// Delete a flag
deleteFlag('deprecated-feature');
```

### Flag Configuration

Flags are stored in `config/observability/feature-flags.json`:

```json
{
  "flags": {
    "new-feature": {
      "name": "new-feature",
      "description": "New feature description",
      "enabled": true,
      "rolloutPercentage": 50,
      "rules": [
        { "type": "user", "value": ["admin-user"] },
        { "type": "environment", "value": ["production"] }
      ],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T12:00:00.000Z"
    }
  },
  "lastUpdated": "2025-01-15T12:00:00.000Z",
  "version": 42
}
```

### Rule Types

| Type | Description | Value Format |
|------|-------------|--------------|
| `percentage` | Random percentage | `number` (0-100) |
| `user` | Specific user IDs | `string` or `string[]` |
| `group` | Specific group IDs | `string` or `string[]` |
| `environment` | Environment match | `string` or `string[]` |

### Prometheus Metrics

Feature flag metrics are available at `/api/metrics`:

```
togetheros_feature_flag_enabled{name="new-feature"} 1
togetheros_feature_flag_rollout{name="new-feature"} 50
```

---

## Canary Deployment

### Overview

Canary deployment enables gradual rollout of new versions:
- Default stages: 10% → 50% → 100%
- Automatic rollback on error threshold breach
- Traffic routing based on user session
- Real-time metrics collection

### Starting a Canary Deployment

```typescript
import { startCanaryDeployment, DEFAULT_CANARY_STAGES } from '@/lib/observability';

// Start canary with default stages (10% → 50% → 100%)
const deployment = startCanaryDeployment('v2.1.0');

// Custom stages
const deployment = startCanaryDeployment('v2.1.0', {
  strategy: 'canary',
  stages: [
    { percentage: 5, duration: 600, minRequests: 50, maxErrorRate: 0.05 },
    { percentage: 25, duration: 900, minRequests: 200, maxErrorRate: 0.03 },
    { percentage: 50, duration: 1200, minRequests: 500, maxErrorRate: 0.02 },
    { percentage: 100, duration: 0, minRequests: 0, maxErrorRate: 0.01 },
  ],
});
```

### Traffic Routing

```typescript
import { shouldRouteToCanary, recordCanaryRequest } from '@/lib/observability';

// In middleware or request handler
const isCanary = shouldRouteToCanary(request.userId);

// Record request metrics
const startTime = Date.now();
try {
  const response = await handleRequest(request, isCanary);
  recordCanaryRequest(isCanary, Date.now() - startTime, false);
  return response;
} catch (error) {
  recordCanaryRequest(isCanary, Date.now() - startTime, true);
  throw error;
}
```

### Deployment Control

```typescript
import {
  advanceCanaryStage,
  rollbackDeployment,
  pauseDeployment,
  resumeDeployment,
  getCurrentDeployment,
} from '@/lib/observability';

// Check current deployment status
const deployment = getCurrentDeployment();
console.log(deployment?.currentPercentage); // 10

// Manually advance to next stage
advanceCanaryStage(); // 10% → 50%

// Pause deployment (stop advancing)
pauseDeployment();

// Resume deployment
resumeDeployment();

// Manual rollback
rollbackDeployment('Performance degradation detected');
```

### Automatic Rollback

The system automatically rolls back when:
- Error rate exceeds stage threshold
- Minimum requests reached for evaluation

Default thresholds:
| Stage | Max Error Rate |
|-------|----------------|
| 10% | 5% |
| 50% | 3% |
| 100% | 2% |

### Deployment History

```typescript
import { getDeploymentHistory } from '@/lib/observability';

const history = getDeploymentHistory();
// Returns last 10 deployments with metrics
```

### Prometheus Metrics

Canary metrics at `/api/metrics`:

```
togetheros_canary_active 1
togetheros_canary_percentage 50
togetheros_canary_requests 1234
togetheros_canary_errors 12
togetheros_canary_error_rate 0.0097
togetheros_canary_latency_p95 145.5
```

---

## Instant Deployment

For urgent fixes that need to skip canary:

```typescript
import { instantDeploy } from '@/lib/observability';

// Skip canary stages, deploy immediately to 100%
instantDeploy('v2.1.1-hotfix');
```

---

## Best Practices

### Feature Flags

1. **Start small**: Begin with 1-5% rollout for new features
2. **Use targeting**: Test with internal users before public rollout
3. **Clean up**: Delete flags after full rollout
4. **Document**: Add clear descriptions to all flags
5. **Monitor**: Watch metrics during rollout increases

### Canary Deployments

1. **Monitor closely**: Watch error rates during first stage
2. **Don't rush**: Allow enough requests at each stage
3. **Have rollback plan**: Know how to rollback manually
4. **Test hotfix path**: Verify `instantDeploy` works before emergencies
5. **Review history**: Learn from previous deployment metrics

---

## Configuration Files

| File | Purpose |
|------|---------|
| `config/observability/feature-flags.json` | Feature flag definitions |
| `config/observability/deploy-state.json` | Current deployment state |

Both files are auto-created on first use.

---

## API Reference

See `lib/observability/feature-flags.ts` and `lib/observability/canary-deployment.ts` for full API documentation.
