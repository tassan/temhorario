import { describe, expect, it } from 'vitest';

import { loadEnv } from '../../src/config/env.js';

describe('loadEnv', () => {
  it('deve aceitar variáveis mínimas válidas', () => {
    const env = loadEnv({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
      JWT_SECRET: 'x'.repeat(32),
    });
    expect(env.PORT).toBe(3000);
    expect(env.DATABASE_POOL_SIZE).toBe(20);
  });

  it('deve falhar quando JWT_SECRET é curto demais', () => {
    expect(() =>
      loadEnv({
        DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
        JWT_SECRET: 'short',
      }),
    ).toThrow();
  });
});
