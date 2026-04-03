import type { InferInsertModel } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { tenants } from '../../src/db/schema/tenants.js';

export type NewTenant = InferInsertModel<typeof tenants>;

export function buildTenantInsert(overrides: Partial<NewTenant> = {}): NewTenant {
  return {
    slug: `t-${randomUUID().slice(0, 8)}`,
    name: 'Test Tenant',
    config: {},
    branding: {},
    ...overrides,
  };
}
