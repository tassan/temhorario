import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

config({ path: resolve(root, '.env') });
if (existsSync(resolve(root, '.env.local'))) {
  config({ path: resolve(root, '.env.local'), override: true });
}
