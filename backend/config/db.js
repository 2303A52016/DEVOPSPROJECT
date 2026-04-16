const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'lifeweb',
  password: process.env.PG_PASSWORD || 'zaid@123',
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
});

module.exports = pool;

