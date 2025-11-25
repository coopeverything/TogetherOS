# Contract Testing Guide

**Purpose:** Ensure API stability through consumer-driven contract testing using Pact.

**Status:** Phase 3 - Initial Setup

---

## Overview

Contract testing verifies that API consumers (frontend, mobile apps, external services) and providers (backend APIs) agree on the contract (request/response format, status codes, headers).

### Why Contract Testing?

1. **Catch breaking changes early** - Before deployment, not after
2. **Decouple consumer/provider testing** - Test independently without mocking
3. **Document API behavior** - Contracts serve as living documentation
4. **Enable parallel development** - Teams can work on consumer/provider separately

---

## Setup

### Installation

```bash
npm install --save-dev @pact-foundation/pact
```

### Project Structure

```
tests/
  contract/
    consumer/
      health-api.consumer.pact.ts    # Consumer tests for /api/health
      governance-api.consumer.pact.ts # Consumer tests for governance endpoints
    provider/
      provider.verification.ts        # Provider verification
    pacts/
      togetheros-web-togetheros-api.json  # Generated pact files
```

---

## Consumer Tests

Consumer tests define what the consumer expects from the provider.

### Example: Health API Consumer Test

```typescript
// tests/contract/consumer/health-api.consumer.pact.ts
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

const { like, eachLike, regex } = MatchersV3;

const provider = new PactV4({
  consumer: 'togetheros-web',
  provider: 'togetheros-api',
  dir: path.resolve(process.cwd(), 'tests/contract/pacts'),
});

describe('Health API Contract', () => {
  it('returns health status', async () => {
    await provider
      .addInteraction()
      .given('the service is healthy')
      .uponReceiving('a request for health status')
      .withRequest('GET', '/api/health')
      .willRespondWith(200, (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json' })
          .jsonBody({
            status: like('ok'),
            timestamp: regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, '2025-01-01T00:00:00.000Z'),
            uptime: like(12345.67),
            checks: {
              database: {
                status: like('ok'),
                latency: like(23),
              },
              memory: {
                used: like(123456789),
                total: like(512000000),
                percentage: like(24.11),
                status: like('ok'),
              },
            },
          });
      })
      .executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/api/health`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBeDefined();
        expect(data.checks.database).toBeDefined();
        expect(data.checks.memory).toBeDefined();
      });
  });

  it('returns unhealthy status when database is down', async () => {
    await provider
      .addInteraction()
      .given('the database is unavailable')
      .uponReceiving('a request for health status with db down')
      .withRequest('GET', '/api/health')
      .willRespondWith(503, (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json' })
          .jsonBody({
            status: like('unhealthy'),
            timestamp: regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, '2025-01-01T00:00:00.000Z'),
            checks: {
              database: {
                status: like('error'),
                error: like('Connection refused'),
              },
            },
          });
      })
      .executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/api/health`);
        expect(response.status).toBe(503);
      });
  });
});
```

### Example: Governance API Consumer Test

```typescript
// tests/contract/consumer/governance-api.consumer.pact.ts
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

const { like, eachLike, uuid, regex } = MatchersV3;

const provider = new PactV4({
  consumer: 'togetheros-web',
  provider: 'togetheros-api',
  dir: path.resolve(process.cwd(), 'tests/contract/pacts'),
});

describe('Governance API Contract', () => {
  describe('GET /api/governance/proposals', () => {
    it('returns list of proposals', async () => {
      await provider
        .addInteraction()
        .given('proposals exist in the system')
        .uponReceiving('a request for all proposals')
        .withRequest('GET', '/api/governance/proposals')
        .willRespondWith(200, (builder) => {
          builder
            .headers({ 'Content-Type': 'application/json' })
            .jsonBody({
              proposals: eachLike({
                id: uuid('550e8400-e29b-41d4-a716-446655440000'),
                title: like('Example Proposal'),
                status: regex(/draft|active|passed|rejected/, 'active'),
                createdAt: regex(/\d{4}-\d{2}-\d{2}/, '2025-01-01'),
                author: {
                  id: uuid('550e8400-e29b-41d4-a716-446655440001'),
                  name: like('Test User'),
                },
              }),
              total: like(10),
              page: like(1),
              pageSize: like(20),
            });
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/api/governance/proposals`);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data.proposals).toBeDefined();
          expect(Array.isArray(data.proposals)).toBe(true);
        });
    });
  });

  describe('POST /api/governance/proposals', () => {
    it('creates a new proposal', async () => {
      await provider
        .addInteraction()
        .given('user is authenticated')
        .uponReceiving('a request to create a proposal')
        .withRequest('POST', '/api/governance/proposals', (builder) => {
          builder
            .headers({ 'Content-Type': 'application/json' })
            .jsonBody({
              title: like('New Proposal'),
              description: like('Proposal description'),
              category: regex(/governance|treasury|community/, 'governance'),
            });
        })
        .willRespondWith(201, (builder) => {
          builder
            .headers({ 'Content-Type': 'application/json' })
            .jsonBody({
              id: uuid('550e8400-e29b-41d4-a716-446655440002'),
              title: like('New Proposal'),
              status: 'draft',
              createdAt: regex(/\d{4}-\d{2}-\d{2}/, '2025-01-01'),
            });
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/api/governance/proposals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'New Proposal',
              description: 'Proposal description',
              category: 'governance',
            }),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.id).toBeDefined();
          expect(data.status).toBe('draft');
        });
    });
  });
});
```

---

## Provider Verification

Provider verification ensures the API implementation matches the contracts.

```typescript
// tests/contract/provider/provider.verification.ts
import { Verifier } from '@pact-foundation/pact';
import path from 'path';

describe('Provider Verification', () => {
  it('validates the provider against consumer contracts', async () => {
    const verifier = new Verifier({
      provider: 'togetheros-api',
      providerBaseUrl: process.env.PROVIDER_URL || 'http://localhost:3000',
      pactUrls: [
        path.resolve(process.cwd(), 'tests/contract/pacts/togetheros-web-togetheros-api.json'),
      ],
      // State handlers for provider states
      stateHandlers: {
        'the service is healthy': async () => {
          // No setup needed - service should be healthy by default
        },
        'the database is unavailable': async () => {
          // This would require mocking database connection
          // In real scenario, use dependency injection
          console.log('Note: Database unavailable state requires mock setup');
        },
        'proposals exist in the system': async () => {
          // Seed test data
          // In real scenario, call seeding function
        },
        'user is authenticated': async () => {
          // Setup authentication context
          // In real scenario, create test user token
        },
      },
      publishVerificationResult: process.env.CI === 'true',
      providerVersion: process.env.GIT_SHA || 'local',
    });

    await verifier.verifyProvider();
  }, 30000);
});
```

---

## Running Contract Tests

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:contract": "vitest run tests/contract/consumer",
    "test:contract:verify": "vitest run tests/contract/provider",
    "test:contract:all": "npm run test:contract && npm run test:contract:verify"
  }
}
```

### CI Integration

```yaml
# .github/workflows/contract-tests.yml
name: Contract Tests

on:
  push:
    branches: [yolo]
  pull_request:
    branches: [yolo]

jobs:
  consumer-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:contract
      - uses: actions/upload-artifact@v4
        with:
          name: pacts
          path: tests/contract/pacts/

  provider-verification:
    needs: consumer-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: actions/download-artifact@v4
        with:
          name: pacts
          path: tests/contract/pacts/
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - run: sleep 5
      - run: npm run test:contract:verify
        env:
          PROVIDER_URL: http://localhost:3000
```

---

## Best Practices

### 1. Consumer-First

Always write consumer tests first. They define what the consumer actually needs.

### 2. Minimal Contracts

Only include fields the consumer actually uses. Don't verify the entire response.

### 3. Flexible Matching

Use matchers (`like`, `regex`, `eachLike`) instead of exact values.

### 4. State Management

Use provider states to set up test scenarios without coupling tests to data.

### 5. Version Contracts

Tag contracts with versions for better traceability.

---

## Target Metrics

| Metric | Target |
|--------|--------|
| Contract coverage | 80% of public APIs |
| Consumer test execution | <30s |
| Provider verification | <60s |
| Breaking change detection | 100% |

---

## Related Documentation

- [Property-Based Testing](./property-based-testing.md)
- [Mutation Testing](./mutation-testing.md)
- [Observability Module](../modules/observability.md)
