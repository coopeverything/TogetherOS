/**
 * Health API Consumer Contract Test
 *
 * Defines the contract for /api/health endpoint
 * from the consumer (web app) perspective.
 */

import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import { describe, it, expect } from 'vitest';

const { like, regex } = MatchersV3;

const provider = new PactV4({
  consumer: 'togetheros-web',
  provider: 'togetheros-api',
  dir: path.resolve(process.cwd(), 'tests/contract/pacts'),
});

describe('Health API Contract', () => {
  it('returns health status when service is healthy', async () => {
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
            timestamp: regex(
              /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
              '2025-01-01T00:00:00.000Z'
            ),
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
        expect(data.checks).toBeDefined();
        expect(data.checks.database).toBeDefined();
        expect(data.checks.memory).toBeDefined();
      });
  });

  it('returns degraded status when memory is high', async () => {
    await provider
      .addInteraction()
      .given('memory usage is above 80%')
      .uponReceiving('a request for health status with high memory')
      .withRequest('GET', '/api/health')
      .willRespondWith(200, (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json' })
          .jsonBody({
            status: like('degraded'),
            timestamp: regex(
              /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
              '2025-01-01T00:00:00.000Z'
            ),
            checks: {
              database: {
                status: like('ok'),
              },
              memory: {
                percentage: like(85.5),
                status: like('warning'),
              },
            },
          });
      })
      .executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/api/health`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('degraded');
      });
  });

  it('returns unhealthy status when database is down', async () => {
    await provider
      .addInteraction()
      .given('the database is unavailable')
      .uponReceiving('a request for health status with database down')
      .withRequest('GET', '/api/health')
      .willRespondWith(503, (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json' })
          .jsonBody({
            status: like('unhealthy'),
            timestamp: regex(
              /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
              '2025-01-01T00:00:00.000Z'
            ),
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

        const data = await response.json();
        expect(data.status).toBe('unhealthy');
        expect(data.checks.database.status).toBe('error');
      });
  });
});
