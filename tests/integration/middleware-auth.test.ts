import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { loadEnv } from '../../src/config/env.js';
import { signAccessToken } from '../../src/lib/jwt.js';

describe('GET /v1/admin/ping', () => {
  const env = loadEnv({
    DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
    JWT_SECRET: 'x'.repeat(32),
  });

  it('deve retornar 401 sem Authorization', async () => {
    const app = createApp(env);
    const res = await app.request('http://localhost/v1/admin/ping');
    expect(res.status).toBe(401);
  });

  it('deve retornar 200 com JWT válido', async () => {
    const app = createApp(env);
    const tenantId = '00000000-0000-4000-8000-000000000001';
    const userId = '00000000-0000-4000-8000-000000000002';
    const token = await signAccessToken(env, { tenantId, sub: userId, role: 'staff' });
    const res = await app.request('http://localhost/v1/admin/ping', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      tenantId,
      userId,
      role: 'staff',
    });
  });
});
