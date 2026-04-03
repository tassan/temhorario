import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(dir, '../.env.test') });

process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/temhorario_test';
process.env.JWT_SECRET ??= 'test-jwt-secret-must-be-32-chars-min!!';
process.env.JWT_ACCESS_TTL ??= '900';
process.env.JWT_REFRESH_TTL ??= '604800';
