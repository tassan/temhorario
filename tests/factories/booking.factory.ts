import type { InferInsertModel } from 'drizzle-orm';

import { bookings } from '../../src/db/schema/bookings.js';

export type NewBooking = InferInsertModel<typeof bookings>;

export function buildBookingInsert(
  tenantId: string,
  serviceId: string,
  clientId: string,
  startsAt: Date,
  endsAt: Date,
  overrides: Partial<NewBooking> = {},
): NewBooking {
  return {
    tenantId,
    serviceId,
    clientId,
    startsAt,
    endsAt,
    status: 'scheduled',
    metadata: {},
    ...overrides,
  };
}
