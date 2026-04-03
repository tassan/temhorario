/**
 * Dados mínimos para desenvolvimento local.
 * Executar após migrations: `npm run db:seed`
 *
 * O role da `DATABASE_URL` é normalmente owner das tabelas e ignora RLS em PostgreSQL.
 */

import '../config/load-env-files.js';

import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { loadEnv } from '../config/env.js';
import { getDb, getPool } from '../config/database.js';
import { availabilityRules } from './schema/availability-rules.js';
import { clients } from './schema/clients.js';
import { resources } from './schema/resources.js';
import { services } from './schema/services.js';
import { tenants } from './schema/tenants.js';
import { users } from './schema/users.js';

const env = loadEnv();
const db = getDb(env);

const DEV_TENANT_SLUG = 'demo';

async function main(): Promise<void> {
  const existing = await db.query.tenants.findFirst({
    where: eq(tenants.slug, DEV_TENANT_SLUG),
  });

  if (existing) {
    console.info(`Seed: tenant "${DEV_TENANT_SLUG}" já existe (${existing.id}).`);
    return;
  }

  const createdTenants = await db
    .insert(tenants)
    .values({
      slug: DEV_TENANT_SLUG,
      name: 'Demo Studio',
      config: {
        timezone: 'America/Sao_Paulo',
        locale: 'pt-BR',
        slotInterval: 30,
        bufferBetweenBookings: 0,
        minAdvanceBooking: 1,
        maxAdvanceBooking: 60,
        allowClientCancellation: true,
        cancellationDeadlineHours: 24,
      },
      branding: {
        logo_url: null,
        primary_color: '#0ea5e9',
        accent_color: '#6366f1',
      },
    })
    .returning();

  if (createdTenants.length === 0) {
    throw new Error('Seed: falha ao criar tenant');
  }
  const tenant = createdTenants[0];

  await db.insert(users).values({
    tenantId: tenant.id,
    email: 'owner@demo.local',
    passwordHash: bcrypt.hashSync('password', 12),
    name: 'Owner Demo',
    role: 'owner',
  });

  const createdServices = await db
    .insert(services)
    .values({
      tenantId: tenant.id,
      name: 'Consulta',
      duration: 60,
      price: 15000,
      active: true,
      sortOrder: 0,
    })
    .returning();

  const createdResources = await db
    .insert(resources)
    .values({
      tenantId: tenant.id,
      name: 'Profissional 1',
      type: 'staff',
      active: true,
    })
    .returning();

  if (createdServices.length === 0 || createdResources.length === 0) {
    throw new Error('Seed: falha ao criar serviço ou recurso');
  }

  for (let day = 1; day <= 5; day += 1) {
    await db.insert(availabilityRules).values({
      tenantId: tenant.id,
      resourceId: null,
      dayOfWeek: day,
      startTime: '08:00:00',
      endTime: '18:00:00',
      specificDate: null,
      isBlocked: false,
    });
  }

  await db.insert(clients).values({
    tenantId: tenant.id,
    name: 'Cliente Exemplo',
    phone: '+5511999990000',
    email: 'cliente@example.com',
  });

  console.info(`Seed: tenant demo criado — slug "${DEV_TENANT_SLUG}", id ${tenant.id}`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    getPool(env)
      .end()
      .catch(() => undefined);
  });
