import '../src/config/load-env-files.js';

/**
 * `node --env-file=...` define `MIGRATE_DATABASE_URL` no processo antes deste ficheiro;
 * reforçamos aqui porque o snapshot em `load-env-files` pode correr noutra ordem com tsx.
 */
if (process.env.MIGRATE_DATABASE_URL !== undefined && process.env.MIGRATE_DATABASE_URL !== '') {
  process.env.DATABASE_URL = process.env.MIGRATE_DATABASE_URL;
}

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

try {
  await migrate(db, { migrationsFolder });
} catch (err: unknown) {
  const code = typeof err === 'object' && err !== null && 'code' in err ? err.code : undefined;
  const message = err instanceof Error ? err.message : String(err);
  if (code === '28P01') {
    console.error(
      [
        'PostgreSQL recusou a password (28P01). Causas frequentes:',
        '  • Outro Postgres (não Docker) está à escuta na mesma porta — alinhar `DATABASE_URL` ou parar o serviço local.',
        '  • Credenciais em `.env.local` não coincidem com o servidor que responde em `localhost`.',
        '  • Para migrar o DB do docker-compose: npm run db:migrate:docker',
      ].join('\n'),
    );
  } else if (message.includes('Connection terminated unexpectedly') || code === 'ECONNRESET') {
    console.error(
      [
        'Ligação ao Postgres caiu antes de completar. Causas frequentes:',
        '  • Mapeamento Docker errado: em `docker-compose.yml` deve ser `host:5433` → `contentor:5432` (Postgres escuta na 5432 *dentro* da imagem). `5433:5433` está incorrecto.',
        '  • Contentor a reiniciar ou não saudável — `docker compose ps` e `docker compose logs postgres`.',
        '  • URL com porta/host errados para o teu compose.',
      ].join('\n'),
    );
  }
  throw err;
}
await pool.end();
