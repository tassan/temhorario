import { index, jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';

export const clients = pgTable(
  'clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 32 }).notNull(),
    email: varchar('email', { length: 255 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_clients_tenant').on(t.tenantId),
    index('idx_clients_phone').on(t.tenantId, t.phone),
  ],
);
