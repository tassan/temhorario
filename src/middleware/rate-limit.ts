import { createMiddleware } from 'hono/factory';

import { getRedis } from '../config/redis.js';
import type { Env } from '../config/env.js';
import type { AppVariables } from '../types/hono.js';

const WINDOW_MS = 60_000;

interface RateOutcome {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const memoryCounters = new Map<string, { count: number; expiresAt: number }>();

function memoryIncr(key: string, limit: number, now: number): RateOutcome {
  const row = memoryCounters.get(key);
  if (row === undefined || now >= row.expiresAt) {
    memoryCounters.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    return { allowed: true, limit, remaining: limit - 1, resetAt: now + WINDOW_MS };
  }
  row.count += 1;
  if (row.count > limit) {
    return { allowed: false, limit, remaining: 0, resetAt: row.expiresAt };
  }
  return { allowed: true, limit, remaining: limit - row.count, resetAt: row.expiresAt };
}

async function redisIncr(
  redis: NonNullable<ReturnType<typeof getRedis>>,
  key: string,
  limit: number,
  now: number,
): Promise<RateOutcome> {
  const n = await redis.incr(key);
  if (n === 1) {
    await redis.pexpire(key, WINDOW_MS);
  }
  const pttl = await redis.pttl(key);
  const resetAt = now + (typeof pttl === 'number' && pttl > 0 ? pttl : WINDOW_MS);
  if (n > limit) {
    return { allowed: false, limit, remaining: 0, resetAt };
  }
  return { allowed: true, limit, remaining: limit - n, resetAt };
}

export function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded !== undefined && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  const realIp = c.req.header('x-real-ip');
  if (realIp !== undefined && realIp.length > 0) {
    return realIp;
  }
  return 'unknown';
}

function rateLimitJsonBody() {
  return {
    error: {
      code: 'RATE_LIMITED' as const,
      message: 'Too many requests',
    },
  };
}

/** Limite por IP — rotas públicas (`/v1/:slug/...`). */
export function createPublicIpRateLimiter(env: Env) {
  const redis = getRedis(env);
  const limit = env.RATE_LIMIT_PUBLIC_PER_MINUTE;

  return createMiddleware<{
    Variables: AppVariables;
  }>(async (c, next) => {
    const ip = getClientIp(c);
    const key = `rl:ip:${ip}`;
    const now = Date.now();

    const outcome = redis ? await redisIncr(redis, key, limit, now) : memoryIncr(key, limit, now);

    c.header('X-RateLimit-Limit', String(outcome.limit));
    c.header('X-RateLimit-Remaining', String(Math.max(0, outcome.remaining)));
    c.header('X-RateLimit-Reset', String(Math.ceil(outcome.resetAt / 1000)));

    if (!outcome.allowed) {
      const retryAfter = Math.max(1, Math.ceil((outcome.resetAt - now) / 1000));
      c.header('Retry-After', String(retryAfter));
      return c.json(rateLimitJsonBody(), 429);
    }

    await next();
  });
}

/** Limite por tenant — rotas admin/platform (requer `tenantId` no contexto). */
export function createTenantRateLimiter(env: Env) {
  const redis = getRedis(env);
  const limit = env.RATE_LIMIT_ADMIN_PER_MINUTE;

  return createMiddleware<{
    Variables: AppVariables;
  }>(async (c, next) => {
    const tenantId = c.get('tenantId');
    if (tenantId === undefined) {
      await next();
      return;
    }

    const key = `rl:tenant:${tenantId}`;
    const now = Date.now();

    const outcome = redis ? await redisIncr(redis, key, limit, now) : memoryIncr(key, limit, now);

    c.header('X-RateLimit-Limit', String(outcome.limit));
    c.header('X-RateLimit-Remaining', String(Math.max(0, outcome.remaining)));
    c.header('X-RateLimit-Reset', String(Math.ceil(outcome.resetAt / 1000)));

    if (!outcome.allowed) {
      const retryAfter = Math.max(1, Math.ceil((outcome.resetAt - now) / 1000));
      c.header('Retry-After', String(retryAfter));
      return c.json(rateLimitJsonBody(), 429);
    }

    await next();
  });
}
