import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { getDb } from '../../src/config/database.js';
import { loadEnv } from '../../src/config/env.js';
import { apiKeys } from '../../src/db/schema/api-keys.js';
import { tenants } from '../../src/db/schema/tenants.js';
import { hashApiKey } from '../../src/lib/api-key-crypto.js';
import { buildTenantInsert } from '../factories/tenant.factory.js';

describe('GET /v1/platform/ping', () => {
  const env = loadEnv();

  it('deve retornar 401 sem Bearer', async () => {
    const app = createApp(env);
    const res = await app.request('http://localhost/v1/platform/ping');
    expect(res.status).toBe(401);
  });

  it('deve retornar 401 com formato de key inválido', async () => {
    const app = createApp(env);
    const res = await app.request('http://localhost/v1/platform/ping', {
      headers: { Authorization: 'Bearer not-a-real-key' },
    });
    expect(res.status).toBe(401);
  });

  it('deve retornar 200 com API key válida', async () => {
    const db = getDb(env);
    const insert = buildTenantInsert();
    const tenantRows = await db.insert(tenants).values(insert).returning();
    expect(tenantRows).toHaveLength(1);
    const tenant = tenantRows[0];

    const rawKey = `ae_live_${'a'.repeat(40)}`;
    const keyHash = hashApiKey(rawKey);
    const keyRows = await db
      .insert(apiKeys)
      .values({
        tenantId: tenant.id,
        keyHash,
        prefix: rawKey.slice(0, 12),
        label: 'test',
      })
      .returning();
    expect(keyRows).toHaveLength(1);
    const keyRow = keyRows[0];

    const app = createApp(env);
    const res = await app.request('http://localhost/v1/platform/ping', {
      headers: { Authorization: `Bearer ${rawKey}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tenantId: string; apiKeyId: string };
    expect(body.tenantId).toBe(tenant.id);
    expect(body.apiKeyId).toBe(keyRow.id);

    await db.delete(apiKeys).where(eq(apiKeys.tenantId, tenant.id));
    await db.delete(tenants).where(eq(tenants.id, tenant.id));
  });
});
