import { describe, expect, it } from 'vitest';

import { loadEnv } from '../../src/config/env.js';
import { signAccessToken, verifyAccessToken } from '../../src/lib/jwt.js';

describe('JWT access token', () => {
  it('deve assinar e verificar claims', async () => {
    const env = loadEnv({
      DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
      JWT_SECRET: 'x'.repeat(32),
    });
    const tenantId = '00000000-0000-4000-8000-000000000001';
    const sub = '00000000-0000-4000-8000-000000000002';
    const token = await signAccessToken(env, { tenantId, sub, role: 'owner' });
    const payload = await verifyAccessToken(env, token);
    expect(payload.tenantId).toBe(tenantId);
    expect(payload.sub).toBe(sub);
    expect(payload.role).toBe('owner');
  });
});
