/**
 * System Metrics Endpoint
 *
 * Returns current system resource usage in JSON format
 * Used for monitoring dashboards and alerting
 */

import { NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

/**
 * GET /api/metrics/system
 *
 * Returns system metrics: CPU, memory, uptime, load average
 */
export async function GET() {
  try {
    // Process metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // System metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;

    // Process uptime
    const processUptime = process.uptime();

    // Memory status classification
    let memoryStatus: 'ok' | 'warning' | 'critical' = 'ok';
    if (memoryPercentage > 90) {
      memoryStatus = 'critical';
    } else if (memoryPercentage > 80) {
      memoryStatus = 'warning';
    }

    // CPU load status (normalized by CPU count)
    const normalizedLoad = loadAvg[0] / cpuCount;
    let loadStatus: 'ok' | 'warning' | 'critical' = 'ok';
    if (normalizedLoad > 0.9) {
      loadStatus = 'critical';
    } else if (normalizedLoad > 0.7) {
      loadStatus = 'warning';
    }

    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        uptime_seconds: processUptime,
        memory: {
          rss: memoryUsage.rss,
          heap_total: memoryUsage.heapTotal,
          heap_used: memoryUsage.heapUsed,
          external: memoryUsage.external,
          array_buffers: memoryUsage.arrayBuffers,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpu_count: cpuCount,
        load_average: {
          '1min': loadAvg[0],
          '5min': loadAvg[1],
          '15min': loadAvg[2],
          normalized: normalizedLoad,
          status: loadStatus,
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          percentage: Math.round(memoryPercentage * 100) / 100,
          status: memoryStatus,
        },
        uptime_seconds: os.uptime(),
      },
      status: memoryStatus === 'critical' || loadStatus === 'critical' ? 'critical' : memoryStatus === 'warning' || loadStatus === 'warning' ? 'warning' : 'ok',
    };

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error('Failed to collect system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to collect system metrics' },
      { status: 500 }
    );
  }
}
