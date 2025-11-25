import { NextRequest, NextResponse } from 'next/server';
import {
  getAggregatedMetrics,
  queryLogs,
  getBufferStats,
  getAllFlags,
  getCurrentDeployment,
  getDeploymentHistory,
  getAllRouteStats,
} from '../../../../../../lib/observability';

export const dynamic = 'force-dynamic';

/**
 * Dashboard API - Aggregates all observability data for the dashboard UI
 *
 * GET /api/observability/dashboard
 * Query params:
 * - timeWindow: minutes (default: 60)
 * - includeFlags: boolean (default: true)
 * - includeCanary: boolean (default: true)
 * - includeLogs: boolean (default: true)
 * - logLimit: number (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const timeWindow = parseInt(searchParams.get('timeWindow') || '60', 10);
    const includeFlags = searchParams.get('includeFlags') !== 'false';
    const includeCanary = searchParams.get('includeCanary') !== 'false';
    const includeLogs = searchParams.get('includeLogs') !== 'false';
    const logLimit = parseInt(searchParams.get('logLimit') || '50', 10);

    // Get aggregated metrics
    const metrics = getAggregatedMetrics(timeWindow);

    // Get buffer stats
    const bufferStats = getBufferStats();

    // Get route stats from regression detector
    const routeStats = getAllRouteStats();

    // Build response
    const response: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      timeWindowMinutes: timeWindow,
      metrics,
      bufferStats,
      routeStats,
    };

    // Include feature flags if requested
    if (includeFlags) {
      const flags = getAllFlags();
      response.featureFlags = {
        total: flags.length,
        enabled: flags.filter(f => f.enabled).length,
        flags: flags.map(f => ({
          name: f.name,
          enabled: f.enabled,
          rolloutPercentage: f.rolloutPercentage,
          updatedAt: f.updatedAt,
        })),
      };
    }

    // Include canary deployment info if requested
    if (includeCanary) {
      const currentDeployment = getCurrentDeployment();
      const history = getDeploymentHistory();
      response.canary = {
        current: currentDeployment
          ? {
              id: currentDeployment.id,
              version: currentDeployment.version,
              status: currentDeployment.status,
              percentage: currentDeployment.currentPercentage,
              startedAt: currentDeployment.startedAt,
              metrics: currentDeployment.metrics,
            }
          : null,
        recentDeployments: history.slice(0, 5).map(d => ({
          id: d.id,
          version: d.version,
          status: d.status,
          startedAt: d.startedAt,
          completedAt: d.completedAt,
        })),
      };
    }

    // Include recent logs if requested
    if (includeLogs) {
      const logs = queryLogs({ limit: logLimit });
      response.recentLogs = logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        source: log.source,
        level: log.level,
        message: log.message.substring(0, 200),
        route: log.route,
        duration: log.duration,
      }));
    }

    // Health summary
    response.health = {
      status: metrics.errorRate < 0.05 ? 'healthy' : metrics.errorRate < 0.1 ? 'degraded' : 'unhealthy',
      errorRate: metrics.errorRate,
      avgLatency: metrics.avgDuration,
      p95Latency: metrics.p95Duration,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

/**
 * Query logs with filters
 *
 * POST /api/observability/dashboard
 * Body: LogQuery object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const query = {
      source: body.source,
      level: body.level,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      traceId: body.traceId,
      userId: body.userId,
      route: body.route,
      search: body.search,
      limit: body.limit || 100,
      offset: body.offset || 0,
    };

    const logs = queryLogs(query);

    return NextResponse.json({
      query,
      total: logs.length,
      logs,
    });
  } catch (error) {
    console.error('Dashboard query error:', error);
    return NextResponse.json(
      { error: 'Failed to query logs' },
      { status: 500 }
    );
  }
}
