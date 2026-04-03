import { Hono } from 'hono';

import type { Env } from './config/env.js';
import { createApiKeyAuthMiddleware } from './middleware/api-key.js';
import { createErrorHandler } from './middleware/error-handler.js';
import { createJwtAuthMiddleware } from './middleware/auth.js';
import { createPublicIpRateLimiter, createTenantRateLimiter } from './middleware/rate-limit.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { createTenantFromSlugMiddleware } from './middleware/tenant.js';
import { createAuthRoutes } from './modules/auth/auth.routes.js';
import type { AppVariables } from './types/hono.js';

export function createApp(env: Env): Hono<{ Variables: AppVariables }> {
  const app = new Hono<{ Variables: AppVariables }>();
  app.onError(createErrorHandler(env));

  app.use('*', requestIdMiddleware);

  app.get('/health', (c) => c.json({ status: 'ok' }));

  const v1 = new Hono<{ Variables: AppVariables }>();

  const admin = new Hono<{ Variables: AppVariables }>();
  admin.use('*', createJwtAuthMiddleware(env));
  admin.use('*', createTenantRateLimiter(env));
  admin.get('/ping', (c) =>
    c.json({
      tenantId: c.get('tenantId'),
      userId: c.get('userId'),
      role: c.get('userRole'),
    }),
  );

  const platform = new Hono<{ Variables: AppVariables }>();
  platform.use('*', createApiKeyAuthMiddleware(env));
  platform.use('*', createTenantRateLimiter(env));
  platform.get('/ping', (c) =>
    c.json({
      tenantId: c.get('tenantId'),
      apiKeyId: c.get('apiKeyId'),
    }),
  );

  const publicBySlug = new Hono<{ Variables: AppVariables }>();
  publicBySlug.use('*', createPublicIpRateLimiter(env));
  publicBySlug.use('*', createTenantFromSlugMiddleware(env));
  publicBySlug.get('/ping', (c) =>
    c.json({
      tenantId: c.get('tenantId'),
      slug: c.get('tenantSlug'),
    }),
  );

  const authPublic = new Hono<{ Variables: AppVariables }>();
  authPublic.use('*', createPublicIpRateLimiter(env));
  authPublic.route('/', createAuthRoutes(env));

  v1.route('/admin', admin);
  v1.route('/platform', platform);
  v1.route('/auth', authPublic);
  v1.route('/:slug', publicBySlug);

  app.route('/v1', v1);

  return app;
}
