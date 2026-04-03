import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { loadEnv } from '../../src/config/env.js';

describe('GET /v1/:slug/ping — tenant inexistente', () => {
  it('deve retornar 404', async () => {
    const env = loadEnv();
    const app = createApp(env);
    const res = await app.request('http://localhost/v1/slug-que-nao-existe-xyz/ping');
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
