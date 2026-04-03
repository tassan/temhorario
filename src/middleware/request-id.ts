import { randomUUID } from 'node:crypto';

import { createMiddleware } from 'hono/factory';

import type { AppVariables } from '../types/hono.js';

const HEADER = 'x-request-id';

export const requestIdMiddleware = createMiddleware<{
  Variables: AppVariables;
}>(async (c, next) => {
  const incoming = c.req.header(HEADER);
  const requestId = incoming && incoming.length > 0 ? incoming : randomUUID();
  c.set('requestId', requestId);
  await next();
  c.header(HEADER, requestId);
});
