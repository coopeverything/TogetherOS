import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface HealthCheck {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
      status: 'ok' | 'warning' | 'critical';
    };
  };
}

async function checkDatabase(): Promise<HealthCheck['checks']['database']> {
  const start = Date.now();

  try {
    // Simple query to verify database connectivity
    await pool.query('SELECT 1');
    const latency = Date.now() - start;

    return {
      status: 'ok',
      latency,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

function checkMemory(): HealthCheck['checks']['memory'] {
  const usage = process.memoryUsage();
  const totalMemory = usage.heapTotal;
  const usedMemory = usage.heapUsed;
  const percentage = (usedMemory / totalMemory) * 100;

  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (percentage > 90) {
    status = 'critical';
  } else if (percentage > 80) {
    status = 'warning';
  }

  return {
    used: usedMemory,
    total: totalMemory,
    percentage: Math.round(percentage * 100) / 100,
    status,
  };
}

export async function GET() {
  try {
    const [dbHealth, memHealth] = await Promise.all([
      checkDatabase(),
      Promise.resolve(checkMemory()),
    ]);

    // Determine overall health status
    let overallStatus: HealthCheck['status'] = 'ok';

    if (dbHealth.status === 'error') {
      overallStatus = 'unhealthy';
    } else if (memHealth.status === 'critical') {
      overallStatus = 'unhealthy';
    } else if (memHealth.status === 'warning') {
      overallStatus = 'degraded';
    }

    const health: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbHealth,
        memory: memHealth,
      },
    };

    // Return appropriate HTTP status code
    const httpStatus = overallStatus === 'ok' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(health, { status: httpStatus });
  } catch (error) {
    // Critical error in health check itself
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}
