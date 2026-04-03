import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import type { Env } from './env.js';
import * as schema from '../db/schema/index.js';

let pool: pg.Pool | undefined;

export function getPool(env: Env): pg.Pool {
  pool ??= new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_SIZE,
  });
  return pool;
}

export function getDb(env: Env) {
  return drizzle(getPool(env), { schema });
}
