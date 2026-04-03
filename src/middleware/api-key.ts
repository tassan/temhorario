import { and, eq, isNull } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';

import { getDb } from '../config/database.js';
import type { Env } from '../config/env.js';
import { apiKeys } from '../db/schema/api-keys.js';
import { UnauthorizedError } from '../lib/errors.js';
import { hashApiKey, isApiKeyFormat } from '../lib/api-key-crypto.js';
import type { AppVariables } from '../types/hono.js';

function getBearerToken(header: string | undefined): string | undefined {
  if (header === undefined) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  return m?.[1];
}

/** Rotas platform — `Authorization: Bearer ae_live_...`; chave armazenada como SHA-256. */
export function createApiKeyAuthMiddleware(env: Env) {
  const db = getDb(env);

  return createMiddleware<{
    Variables: AppVariables;
  }>(async (c, next) => {
    const raw = getBearerToken(c.req.header('authorization'));
    if (raw === undefined) {
      throw new UnauthorizedError('Missing bearer token');
    }
    if (!isApiKeyFormat(raw)) {
      throw new UnauthorizedError('Invalid API key format');
    }

    const keyHash = hashApiKey(raw);
    const row = await db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)),
    });

    if (row === undefined) {
      throw new UnauthorizedError('Invalid API key');
    }

    c.set('tenantId', row.tenantId);
    c.set('apiKeyId', row.id);

    void db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, row.id))
      .catch(() => undefined);

    await next();
  });
}
