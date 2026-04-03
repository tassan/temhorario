import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

/** Preservado antes de `.env` / `.env.local` — evita que `MIGRATE_DATABASE_URL=` vazio no ficheiro apague o valor vindo de `node --env-file`. */
const migrateDatabaseUrlFromEnv = process.env.MIGRATE_DATABASE_URL;

config({ path: resolve(root, '.env') });
if (existsSync(resolve(root, '.env.local'))) {
  config({ path: resolve(root, '.env.local'), override: true });
}

function pickMigrateUrl(): string | undefined {
  const a = migrateDatabaseUrlFromEnv;
  const b = process.env.MIGRATE_DATABASE_URL;
  const pick = (v: string | undefined) => (v !== undefined && v !== '' ? v : undefined);
  return pick(a) ?? pick(b);
}

/** Sobrescreve `DATABASE_URL` após `.env.local` (ex.: `npm run db:migrate:docker` ou DB de teste). */
const migrateUrl = pickMigrateUrl();
if (migrateUrl !== undefined) {
  process.env.DATABASE_URL = migrateUrl;
}
