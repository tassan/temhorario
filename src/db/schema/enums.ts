import { pgEnum } from 'drizzle-orm/pg-core';

export const bookingStatusEnum = pgEnum('booking_status', [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);

export const resourceTypeEnum = pgEnum('resource_type', ['staff', 'room', 'equipment']);

export const userRoleEnum = pgEnum('user_role', ['owner', 'staff']);
