/**
 * Garante role `postgres` com password alinhada ao compose e a base `temhorario_engine`.
 * Usa `docker exec` + `psql` / `createdb` *dentro* do contentor (auth local), sem depender
 * da password no host.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sqlPath = join(root, 'docker/postgres/init/01-ensure-role.sql');
const container = process.env.POSTGRES_CONTAINER ?? 'temhorario-postgres';
const primaryDb = process.env.POSTGRES_DB ?? 'temhorario_engine';
/** Bases extra (ex. Vitest); separadas por vírgula. */
const extraDbs = (process.env.POSTGRES_EXTRA_DBS ?? 'temhorario_test')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const databases = [...new Set([primaryDb, ...extraDbs])];

const sql = readFileSync(sqlPath, 'utf8');

function dockerExec(args: string[], input?: string): void {
  execFileSync('docker', args, {
    input,
    stdio: input !== undefined ? ['pipe', 'inherit', 'inherit'] : 'inherit',
  });
}

function ensureDatabase(name: string): void {
  const r = spawnSync('docker', ['exec', container, 'createdb', '-U', 'postgres', name], {
    encoding: 'utf8',
  });
  if (r.status === 0) {
    return;
  }
  const err = `${r.stderr ?? ''}${r.stdout ?? ''}`;
  if (r.status === 1 && /already exists/i.test(err)) {
    return;
  }
  throw new Error(err || `createdb saiu com código ${String(r.status)}`);
}

try {
  dockerExec(['exec', '-i', container, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1'], sql);

  for (const name of databases) {
    ensureDatabase(name);
  }
} catch {
  console.error(
    [
      'db:ensure falhou. Verifica:',
      `  • Contentor a correr: docker compose up -d (nome por omissão: ${container})`,
      '  • Docker Desktop / daemon activo',
      `  • Ou define POSTGRES_CONTAINER se o nome do serviço for outro`,
    ].join('\n'),
  );
  process.exit(1);
}

console.info(`db:ensure: role postgres e bases [${databases.join(', ')}] verificadas.`);
