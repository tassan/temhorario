import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import type { Env } from '../../config/env.js';
import type { AppVariables } from '../../types/hono.js';

import { loginBodySchema, refreshBodySchema } from './auth.schema.js';
import { createAuthService } from './auth.service.js';

export function createAuthRoutes(env: Env): Hono<{ Variables: AppVariables }> {
  const auth = new Hono<{ Variables: AppVariables }>();
  const service = createAuthService(env);

  auth.post('/login', zValidator('json', loginBodySchema), async (c) => {
    const body = c.req.valid('json');
    const result = await service.login(body);
    return c.json(result);
  });

  auth.post('/refresh', zValidator('json', refreshBodySchema), async (c) => {
    const body = c.req.valid('json');
    const result = await service.refresh(body);
    return c.json(result);
  });

  return auth;
}
