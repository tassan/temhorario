import { eq } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';

import { getDb } from '../config/database.js';
import type { Env } from '../config/env.js';
import { tenants } from '../db/schema/tenants.js';
import { NotFoundError } from '../lib/errors.js';
import type { AppVariables } from '../types/hono.js';

/** Rotas públicas com `:slug` na URL — resolve tenant na base de dados. */
export function createTenantFromSlugMiddleware(env: Env) {
  const db = getDb(env);

  return createMiddleware<{
    Variables: AppVariables;
  }>(async (c, next) => {
    const slug = c.req.param('slug');
    if (slug === undefined || slug.length === 0) {
      throw new NotFoundError('Tenant');
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });

    if (tenant === undefined) {
      throw new NotFoundError('Tenant');
    }

    c.set('tenantId', tenant.id);
    c.set('tenantSlug', tenant.slug);
    await next();
  });
}
