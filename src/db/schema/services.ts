import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenants.js';

export const services = pgTable(
  'services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    duration: integer('duration').notNull(),
    price: integer('price').notNull(),
    customFields: jsonb('custom_fields').$type<Record<string, unknown>>().notNull().default({}),
    active: boolean('active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_services_tenant')
      .on(t.tenantId)
      .where(sql`${t.active} = true`),
  ],
);
