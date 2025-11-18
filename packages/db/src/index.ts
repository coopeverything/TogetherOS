/**
 * Database connection utility for TogetherOS
 * PostgreSQL connection pooling
 */

import { Pool, QueryResult, QueryResultRow } from 'pg';

// Support both DATABASE_URL (production) and individual env vars (development)
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'togetheros',
      user: process.env.DB_USER || 'togetheros_app',
      password: process.env.DB_PASSWORD || 'togetheros2025_secure_pw',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

/**
 * Execute a query
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries
    if (duration > 100) {
      console.warn('Slow query:', { text, duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Database query error:', { text, params, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Close all connections (for graceful shutdown)
 */
export async function close() {
  await pool.end();
}

// Export database modules
export * from './budgets'
export * from './proposal-evidence'
export * from './proposal-options'
export * from './proposal-ratings'
export * from './proposal-votes'
export * from './proposals'
export * from './reward-points'
export * from './social-horizon'
export * from './support-points'
export * from './system-settings'
export * from './timebank'
export * from './users'

// Explicitly re-export commonly used user functions for Turbopack
export type { User } from './users'
export { findUserById, findUserByEmail, findUserByUsername, createUser, verifyPassword, updateUser, logActivity, findUsersByIds } from './users'

// Export pool for health checks
export default { query, getClient, close, pool };
export { pool };
