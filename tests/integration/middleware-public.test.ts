import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { getDb } from '../../src/config/database.js';
import { loadEnv } from '../../src/config/env.js';
import { tenants } from '../../src/db/schema/tenants.js';
import { buildTenantInsert } from '../factories/tenant.factory.js';

describe('GET /v1/:slug/ping (público)', () => {
  it('deve resolver tenant pelo slug', async () => {
    const env = loadEnv();
    const db = getDb(env);
    const insert = buildTenantInsert();
    const rows = await db.insert(tenants).values(insert).returning();
    expect(rows).toHaveLength(1);
    const tenant = rows[0];

    const app = createApp(env);
    const res = await app.request(`http://localhost/v1/${insert.slug}/ping`);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      tenantId: tenant.id,
      slug: insert.slug,
    });

    await db.delete(tenants).where(eq(tenants.id, tenant.id));
  });
});
