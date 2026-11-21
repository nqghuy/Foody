import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('YOUR_DATABASE_PASSWORD')) {
  throw new Error('Set the real database password in the repository root .env file before running db:migrate');
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await pool.query(schema);
  console.log('Database tables are ready.');
} finally {
  await pool.end();
}
