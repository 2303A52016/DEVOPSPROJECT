const { Pool } = require('pg');

const dbConfig = {
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'lifeweb',
  password: process.env.PG_PASSWORD || 'zaid@123',
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
};

const pool = new Pool(dbConfig);

// Expose config for initialization scripts that need admin-level setup.
pool.dbConfig = dbConfig;

module.exports = pool;

