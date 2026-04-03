import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'drizzle-kit';

const root = process.cwd();
config({ path: resolve(root, '.env') });
if (existsSync(resolve(root, '.env.local'))) {
  config({ path: resolve(root, '.env.local'), override: true });
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
