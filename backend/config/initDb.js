const { Pool } = require('pg');
const pool = require('./db');

function isSafeIdentifier(name) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

function quoteIdentifier(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

async function ensureDatabaseExists() {
  const dbName = pool.dbConfig.database;
  const adminDb = process.env.PG_ADMIN_DATABASE || 'postgres';

  const adminPool = new Pool({
    user: pool.dbConfig.user,
    host: pool.dbConfig.host,
    password: pool.dbConfig.password,
    port: pool.dbConfig.port,
    database: adminDb,
  });

  try {
    const checkResult = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      return;
    }

    if (!isSafeIdentifier(dbName)) {
      throw new Error(`Unsafe database name: ${dbName}`);
    }

    await adminPool.query(`CREATE DATABASE ${quoteIdentifier(dbName)}`);
  } finally {
    await adminPool.end();
  }
}

async function ensureTablesExist() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      task TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS planner (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity TEXT NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS diary (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      mood VARCHAR(40) NOT NULL,
      entry TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, date)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vitality (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      calories_burned INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function initializeDatabase() {
  await ensureDatabaseExists();
  await ensureTablesExist();
}

module.exports = {
  initializeDatabase,
};
