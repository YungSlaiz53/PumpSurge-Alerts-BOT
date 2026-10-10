/**
 * PM2 Ecosystem Configuration for 24/7 Production Deployment
 * Run: pm2 start ecosystem.config.js --env production
 */

module.exports = {
  apps: [
    {
      name: 'pumpfun-telegram-bot',
      script: 'node_modules/.bin/tsx',
      args: 'src/index.ts',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
