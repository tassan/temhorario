import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { resources } from './resources.js';
import { services } from './services.js';

export const resourceServices = pgTable(
  'resource_services',
  {
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.resourceId, t.serviceId] })],
);
