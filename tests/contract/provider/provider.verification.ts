/**
 * Provider Verification
 *
 * Verifies that the TogetherOS API implementation
 * matches the contracts defined by consumers.
 */

import { Verifier } from '@pact-foundation/pact';
import path from 'path';
import { describe, it } from 'vitest';

describe('Provider Verification', () => {
  it('validates the provider against consumer contracts', async () => {
    const pactDir = path.resolve(process.cwd(), 'tests/contract/pacts');

    const verifier = new Verifier({
      provider: 'togetheros-api',
      providerBaseUrl: process.env.PROVIDER_URL || 'http://localhost:3000',
      pactUrls: [`${pactDir}/togetheros-web-togetheros-api.json`],
      // State handlers for provider states
      stateHandlers: {
        'the service is healthy': async () => {
          // Default state - service should be healthy
          console.log('[Pact] Setting up: service is healthy');
        },
        'memory usage is above 80%': async () => {
          // This would require mocking memory stats
          // In production, we'd use dependency injection
          console.log('[Pact] Setting up: high memory state');
        },
        'the database is unavailable': async () => {
          // This would require mocking database connection
          console.log('[Pact] Setting up: database unavailable');
        },
      },
      publishVerificationResult: process.env.CI === 'true',
      providerVersion: process.env.GIT_SHA || 'local',
      logLevel: 'info',
    });

    await verifier.verifyProvider();
  }, 60000); // 60s timeout for verification
});
