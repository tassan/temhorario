import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';

describe('GET /health', () => {
  it('deve retornar status ok', async () => {
    const app = createApp();
    const res = await app.request('http://localhost/health');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: 'ok' });
  });
});
