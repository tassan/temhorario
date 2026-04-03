import type { InferInsertModel } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { clients } from '../../src/db/schema/clients.js';

export type NewClient = InferInsertModel<typeof clients>;

export function buildClientInsert(tenantId: string, overrides: Partial<NewClient> = {}): NewClient {
  return {
    tenantId,
    name: 'Cliente Teste',
    phone: `+5511${randomUUID().replace(/\D/g, '').slice(0, 9)}`,
    email: `c-${randomUUID().slice(0, 8)}@test.local`,
    metadata: {},
    ...overrides,
  };
}
