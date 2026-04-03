import { describe, expect, it } from 'vitest';

import { buildBookingInsert } from '../factories/booking.factory.js';
import { buildClientInsert } from '../factories/client.factory.js';
import { buildTenantInsert } from '../factories/tenant.factory.js';

describe('factories', () => {
  it('deve construir insert de tenant com slug único', () => {
    const a = buildTenantInsert();
    const b = buildTenantInsert();
    expect(a.slug).not.toBe(b.slug);
    expect(a.name).toBe('Test Tenant');
  });

  it('deve construir insert de cliente com tenantId', () => {
    const row = buildClientInsert('550e8400-e29b-41d4-a716-446655440000');
    expect(row.tenantId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(row.phone).toMatch(/^\+5511/);
  });

  it('deve construir insert de booking com status scheduled', () => {
    const start = new Date('2026-04-15T10:00:00.000Z');
    const end = new Date('2026-04-15T11:00:00.000Z');
    const row = buildBookingInsert(
      '550e8400-e29b-41d4-a716-446655440000',
      '660e8400-e29b-41d4-a716-446655440001',
      '770e8400-e29b-41d4-a716-446655440002',
      start,
      end,
    );
    expect(row.status).toBe('scheduled');
    expect(row.startsAt).toEqual(start);
  });
});
