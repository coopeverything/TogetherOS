/**
 * Prometheus Metrics Endpoint
 *
 * Exposes metrics in Prometheus format for scraping
 * Used by self-hosted Prometheus instance
 */

import { NextResponse } from 'next/server';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a registry
const register = new Registry();

// Collect default metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const errorCount = new Counter({
  name: 'application_errors_total',
  help: 'Total number of application errors',
  labelNames: ['severity', 'code'],
  registers: [register],
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// Export metrics for use in other parts of the app
export const metrics = {
  httpRequestsTotal,
  httpRequestDuration,
  errorCount,
  activeConnections,
};

/**
 * GET /api/metrics
 *
 * Returns metrics in Prometheus text format
 */
export async function GET() {
  try {
    const metricsText = await register.metrics();

    return new NextResponse(metricsText, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Failed to generate metrics:', error);
    return NextResponse.json({ error: 'Failed to generate metrics' }, { status: 500 });
  }
}
