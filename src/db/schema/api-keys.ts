import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  keyHash: varchar('key_hash', { length: 64 }).notNull(),
  prefix: varchar('prefix', { length: 12 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});
