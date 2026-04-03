import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.js';

/** Sessão de refresh token (jti do JWT). Rotação invalida a linha anterior. */
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
