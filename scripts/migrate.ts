import '../src/config/load-env-files.js';

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEnv } from '../src/config/env.js';

const env = loadEnv();
const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 1,
});

const db = drizzle(pool);

const migrationsFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/db/migrations',
);

await migrate(db, { migrationsFolder });
await pool.end();
