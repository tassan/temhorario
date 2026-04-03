import { boolean, date, index, integer, pgTable, time, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { resources } from './resources.js';
import { tenants } from './tenants.js';

export const availabilityRules = pgTable(
  'availability_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    resourceId: uuid('resource_id').references(() => resources.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week'),
    startTime: time('start_time'),
    endTime: time('end_time'),
    specificDate: date('specific_date'),
    isBlocked: boolean('is_blocked').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_availability_tenant').on(t.tenantId),
    index('idx_availability_resource')
      .on(t.resourceId)
      .where(sql`${t.resourceId} IS NOT NULL`),
  ],
);
