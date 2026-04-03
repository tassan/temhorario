import { index, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { bookingStatusEnum } from './enums.js';
import { clients } from './clients.js';
import { resources } from './resources.js';
import { services } from './services.js';
import { tenants } from './tenants.js';

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict' }),
    resourceId: uuid('resource_id').references(() => resources.id, { onDelete: 'set null' }),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'restrict' }),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    status: bookingStatusEnum('status').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_bookings_tenant_date').on(t.tenantId, t.startsAt),
    index('idx_bookings_resource_date')
      .on(t.resourceId, t.startsAt)
      .where(sql`${t.resourceId} IS NOT NULL`),
    index('idx_bookings_status').on(t.tenantId, t.status),
    index('idx_bookings_client').on(t.clientId),
  ],
);
