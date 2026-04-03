import { createMiddleware } from 'hono/factory';

import type { Env } from '../config/env.js';
import { UnauthorizedError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/jwt.js';
import type { AppVariables } from '../types/hono.js';

function getBearerToken(header: string | undefined): string | undefined {
  if (header === undefined) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  return m?.[1];
}

/** Rotas admin — JWT access token (HS256) com claims tenantId, sub (user), role. */
export function createJwtAuthMiddleware(env: Env) {
  return createMiddleware<{
    Variables: AppVariables;
  }>(async (c, next) => {
    const token = getBearerToken(c.req.header('authorization'));
    if (token === undefined) {
      throw new UnauthorizedError('Missing bearer token');
    }

    try {
      const payload = await verifyAccessToken(env, token);
      c.set('tenantId', payload.tenantId);
      c.set('userId', payload.sub);
      c.set('userRole', payload.role);
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }

    await next();
  });
}
