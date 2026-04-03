export * from './enums.js';
export * from './tenants.js';
export * from './users.js';
export * from './services.js';
export * from './resources.js';
export * from './resource-services.js';
export * from './availability-rules.js';
export * from './clients.js';
export * from './bookings.js';
export * from './api-keys.js';
export * from './refresh-tokens.js';

import { relations } from 'drizzle-orm';

import { apiKeys } from './api-keys.js';
import { availabilityRules } from './availability-rules.js';
import { bookings } from './bookings.js';
import { clients } from './clients.js';
import { resourceServices } from './resource-services.js';
import { resources } from './resources.js';
import { services } from './services.js';
import { tenants } from './tenants.js';
import { refreshTokens } from './refresh-tokens.js';
import { users } from './users.js';

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  services: many(services),
  resources: many(resources),
  availabilityRules: many(availabilityRules),
  clients: many(clients),
  bookings: many(bookings),
  apiKeys: many(apiKeys),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  refreshTokens: many(refreshTokens),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  tenant: one(tenants, { fields: [services.tenantId], references: [tenants.id] }),
  resourceLinks: many(resourceServices),
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  tenant: one(tenants, { fields: [resources.tenantId], references: [tenants.id] }),
  resourceServices: many(resourceServices),
  availabilityRules: many(availabilityRules),
}));

export const resourceServicesRelations = relations(resourceServices, ({ one }) => ({
  resource: one(resources, { fields: [resourceServices.resourceId], references: [resources.id] }),
  service: one(services, { fields: [resourceServices.serviceId], references: [services.id] }),
}));

export const availabilityRulesRelations = relations(availabilityRules, ({ one }) => ({
  tenant: one(tenants, { fields: [availabilityRules.tenantId], references: [tenants.id] }),
  resource: one(resources, { fields: [availabilityRules.resourceId], references: [resources.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  tenant: one(tenants, { fields: [clients.tenantId], references: [tenants.id] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  tenant: one(tenants, { fields: [bookings.tenantId], references: [tenants.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  resource: one(resources, { fields: [bookings.resourceId], references: [resources.id] }),
  client: one(clients, { fields: [bookings.clientId], references: [clients.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  tenant: one(tenants, { fields: [apiKeys.tenantId], references: [tenants.id] }),
}));
