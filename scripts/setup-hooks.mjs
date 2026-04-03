/**
 * Configura core.hooksPath para .githooks (pre-push exige CHANGELOG.md).
 * Executado pelo script "prepare" após npm install.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

if (!existsSync(path.join(root, '.git'))) {
  process.exit(0);
}

try {
  execSync('git config core.hooksPath .githooks', { cwd: root, stdio: 'inherit' });
} catch {
  process.exit(0);
}
