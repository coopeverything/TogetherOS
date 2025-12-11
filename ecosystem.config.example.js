// PM2 Configuration for TogetherOS Production
// Copy this file to ecosystem.config.js and fill in your secrets
//
// IMPORTANT: ecosystem.config.js is gitignored because it contains secrets
// This example file shows the required structure and restart limits

module.exports = {
  apps: [{
    name: 'togetheros',
    cwd: '/var/www/togetheros/apps/web',
    script: 'npm',
    args: 'start',

    // Environment variables (production)
    // Fill in your actual values in ecosystem.config.js
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://USER:PASSWORD@localhost:5432/togetheros',
      JWT_SECRET: '<generate with: openssl rand -hex 32>',
      OPENAI_API_KEY: '<your-openai-api-key>',
      BRIDGE_DOCS_PATH: '/var/www/togetheros/docs',
    },

    // =============================================================
    // RESTART LIMITS - CRITICAL FOR PREVENTING CPU OVERLOAD
    // =============================================================
    // Without these limits, PM2 will restart infinitely on crash,
    // which can trigger VPS CPU throttling (e.g., Hostinger limits)
    //
    // History: On 2025-12-11, missing restart limits caused 441
    // restarts in rapid succession, triggering CPU throttling and
    // taking down production for hours.
    // =============================================================
    max_restarts: 10,              // Stop after 10 restarts in min_uptime window
    min_uptime: '10s',             // Consider "started" after 10 seconds
    restart_delay: 4000,           // Wait 4 seconds between restarts
    exp_backoff_restart_delay: 100, // Exponential backoff starting at 100ms

    // Memory management
    max_memory_restart: '1G',      // Restart if memory exceeds 1GB

    // Logging
    error_file: '/root/.pm2/logs/togetheros-error.log',
    out_file: '/root/.pm2/logs/togetheros-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // Process management
    kill_timeout: 5000,            // Wait 5s for graceful shutdown
    wait_ready: true,              // Wait for process.send('ready')
    listen_timeout: 10000,         // Timeout for ready signal
  }]
};
