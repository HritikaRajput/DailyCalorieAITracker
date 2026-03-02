const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const logger = require('../middleware/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Pool size driven by env for easy tuning per deployment tier
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  // Required for Railway/Render hosted Postgres (SSL in production)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  logger.error('Unexpected DB pool error', { error: err.message });
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug('DB query', { text, duration, rows: res.rowCount });
  return res;
}

async function runMigrations() {
  const schemaPath = path.join(__dirname, '../db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  logger.info('DB migrations applied');
}

module.exports = { query, pool, runMigrations };
