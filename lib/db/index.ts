/**
 * Database connection utility for TogetherOS
 * PostgreSQL connection pooling
 */

import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'togetheros',
  user: process.env.DB_USER || 'togetheros_app',
  password: process.env.DB_PASSWORD || 'togetheros2025_secure_pw',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

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

export default { query, getClient, close };
