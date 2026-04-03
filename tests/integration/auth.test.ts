import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { getDb } from '../../src/config/database.js';
import { loadEnv } from '../../src/config/env.js';
import { tenants } from '../../src/db/schema/tenants.js';
import { users } from '../../src/db/schema/users.js';
import { hashPassword } from '../../src/lib/password.js';
import { buildTenantInsert } from '../factories/tenant.factory.js';

describe('POST /v1/auth/login e /v1/auth/refresh', () => {
  it('login deve emitir access + refresh; refresh deve rodar tokens', async () => {
    const env = loadEnv();
    const db = getDb(env);
    const insert = buildTenantInsert();
    const [tenant] = await db.insert(tenants).values(insert).returning();
    expect(tenant).toBeDefined();

    const password = 'secret-password-ok';
    const [user] = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: 'auth-test@example.com',
        passwordHash: await hashPassword(password),
        name: 'Auth Test',
        role: 'owner',
      })
      .returning();

    const app = createApp(env);

    const loginRes = await app.request('http://localhost/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password }),
    });
    expect(loginRes.status).toBe(200);
    const loginJson = (await loginRes.json()) as {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: string;
    };
    expect(loginJson.tokenType).toBe('Bearer');
    expect(loginJson.expiresIn).toBe(env.JWT_ACCESS_TTL);
    expect(loginJson.accessToken.length).toBeGreaterThan(10);
    expect(loginJson.refreshToken.length).toBeGreaterThan(10);

    const refreshRes = await app.request('http://localhost/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: loginJson.refreshToken }),
    });
    expect(refreshRes.status).toBe(200);
    const refreshJson = (await refreshRes.json()) as { refreshToken: string };
    expect(refreshJson.refreshToken).not.toBe(loginJson.refreshToken);

    const reuseRes = await app.request('http://localhost/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: loginJson.refreshToken }),
    });
    expect(reuseRes.status).toBe(401);

    await db.delete(tenants).where(eq(tenants.id, tenant.id));
  });

  it('login deve retornar 401 para email inexistente', async () => {
    const env = loadEnv();
    const app = createApp(env);
    const res = await app.request('http://localhost/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@example.com', password: 'wrong' }),
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('login deve retornar 401 para senha incorreta', async () => {
    const env = loadEnv();
    const db = getDb(env);
    const insert = buildTenantInsert();
    const [tenant] = await db.insert(tenants).values(insert).returning();
    expect(tenant).toBeDefined();

    await db.insert(users).values({
      tenantId: tenant.id,
      email: 'wrong-pass@example.com',
      passwordHash: await hashPassword('correct-horse'),
      name: 'User',
      role: 'owner',
    });

    const app = createApp(env);
    const res = await app.request('http://localhost/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong-pass@example.com', password: 'wrong-battery' }),
    });
    expect(res.status).toBe(401);

    await db.delete(tenants).where(eq(tenants.id, tenant.id));
  });

  it('refresh deve retornar 401 para token inválido', async () => {
    const env = loadEnv();
    const app = createApp(env);
    const res = await app.request('http://localhost/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'not-a-jwt' }),
    });
    expect(res.status).toBe(401);
  });
});
