// ============================================================
//  PM2 Ecosystem – Discord Bot Dashboard
//  Startet Bot + Web-Server in Production
// ============================================================

module.exports = {
  apps: [
    // ── Discord Bot ─────────────────────────────────────────
    {
      name: 'discord-bot',
      script: 'src/index.js',
      cwd: './bot',
      interpreter: 'node',
      interpreter_args: '--require dotenv/config',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 5000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
        DOTENV_CONFIG_PATH: './.env'
      },
      env_production: {
        NODE_ENV: 'production',
        DOTENV_CONFIG_PATH: './.env'
      },
      error_file: './logs/bot-error.log',
      out_file: './logs/bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    },

    // ── Web-Server (Express API + Static Frontend) ──────────
    {
      name: 'web-server',
      script: 'server/app.js',
      cwd: './web',
      interpreter: 'node',
      interpreter_args: '--require dotenv/config',
      node_args: '--no-experimental-vm-modules',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
        WEB_PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        WEB_PORT: 3001
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    }
  ]
};

