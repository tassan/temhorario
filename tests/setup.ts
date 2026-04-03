import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const envTestPath = resolve(dir, '../.env.test');

const isCi = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const databaseUrlFromCi = isCi ? process.env.DATABASE_URL : undefined;

delete process.env.DATABASE_URL;
config({ path: envTestPath, override: true });

/** CI (GitHub Actions): Postgres serviço na 5432. Local com docker-compose deste repo: host 5433. */
const defaultTestDatabaseUrl = isCi
  ? 'postgresql://postgres:postgres@127.0.0.1:5432/temhorario_test'
  : 'postgresql://postgres:postgres@127.0.0.1:5433/temhorario_test';

function pickDatabaseUrl(url: string | undefined, fallback: string): string {
  return url !== undefined && url !== '' ? url : fallback;
}

process.env.NODE_ENV ??= 'test';

if (process.env.VITEST_DATABASE_URL !== undefined) {
  process.env.DATABASE_URL = process.env.VITEST_DATABASE_URL;
} else if (isCi) {
  process.env.DATABASE_URL = pickDatabaseUrl(databaseUrlFromCi, defaultTestDatabaseUrl);
} else {
  process.env.DATABASE_URL = pickDatabaseUrl(
    process.env.DATABASE_URL as string | undefined,
    defaultTestDatabaseUrl,
  );
}
process.env.JWT_SECRET ??= 'test-jwt-secret-must-be-32-chars-min!!';
process.env.JWT_ACCESS_TTL ??= '900';
process.env.JWT_REFRESH_TTL ??= '604800';
process.env.RATE_LIMIT_PUBLIC_PER_MINUTE ??= '100000';
process.env.RATE_LIMIT_ADMIN_PER_MINUTE ??= '100000';
