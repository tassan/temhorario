import { Redis } from 'ioredis';

import type { Env } from './env.js';

let client: Redis | undefined;

export function getRedis(env: Env): Redis | null {
  if (env.REDIS_URL === undefined || env.REDIS_URL === '') {
    return null;
  }
  client ??= new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
  });
  return client;
}
