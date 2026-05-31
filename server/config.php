<?php
// Configuration for Awaken.ai PHP Server
// SQLite is enabled by default for zero-setup local & hosted usage.
// Set DB_TYPE to 'mysql' if deploying to cPanel / MySQL hosting.

define('DB_TYPE', getenv('DB_TYPE') ?: 'sqlite'); // 'sqlite' or 'mysql'

// MySQL Settings (only if DB_TYPE is mysql)
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'awaken_ai');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// JWT / Token secret
define('SECRET_KEY', getenv('SECRET_KEY') ?: 'awaken_ai_secret_token_key_2026');

// Allowed CORS origins
define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: '*');

// Hosted Frontend App URL (e.g. your Netlify URL or Cloudflare URL)
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'https://awakena-ai.netlify.app');
