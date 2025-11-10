/**
 * PM2 Ecosystem Configuration for TogetherOS Production
 *
 * This file configures how PM2 runs the Next.js application in production.
 *
 * IMPORTANT: Do not commit actual secrets to this file.
 * Copy this to ecosystem.config.js and fill in actual values from your .env file.
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart togetheros --update-env
 *   pm2 save
 */

module.exports = {
  apps: [{
    name: 'togetheros',
    cwd: '/var/www/togetheros/apps/web',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,

      // Database connection (REQUIRED)
      // URL-encode special characters in password: / becomes %2F, = becomes %3D
      DATABASE_URL: 'postgresql://user:password@localhost:5432/database',

      // JWT secret for session tokens (REQUIRED)
      JWT_SECRET: 'your-jwt-secret-here',

      // OpenAI API key (optional, for Bridge AI assistant)
      // OPENAI_API_KEY: 'sk-...',

      // Sentry monitoring (optional)
      // SENTRY_DSN: 'https://...',
      // SENTRY_ORG: 'your-org',
      // SENTRY_PROJECT: 'your-project',
    },
    max_memory_restart: '1G',
    error_file: '/var/www/togetheros/logs/pm2-error.log',
    out_file: '/var/www/togetheros/logs/pm2-out.log',
    time: true, // Prefix logs with timestamp
  }]
};
