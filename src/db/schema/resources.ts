import { boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { resourceTypeEnum } from './enums.js';
import { tenants } from './tenants.js';

export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: resourceTypeEnum('type').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
