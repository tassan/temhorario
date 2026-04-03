import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { loadEnv } from '../../src/config/env.js';

describe('GET /health', () => {
  it('deve retornar status ok', async () => {
    const env = loadEnv({
      DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
      JWT_SECRET: 'x'.repeat(32),
    });
    const app = createApp(env);
    const res = await app.request('http://localhost/health');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: 'ok' });
  });
});
