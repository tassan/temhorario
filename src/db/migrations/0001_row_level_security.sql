-- Row Level Security (2ª camada de isolamento por tenant).
-- A aplicação deve executar por sessão/transacção:
--   SELECT set_config('app.current_tenant_id', '<uuid>', true);
-- Sem isto, as políticas abaixo não devolvem linhas (excepto superuser / BYPASSRLS).

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_tenant_isolation" ON "users" FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL
    AND "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
  );

ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_tenant_isolation" ON "services" FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL
    AND "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
  );

ALTER TABLE "resources" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resources_tenant_isolation" ON "resources" FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL
    AND "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
  );

ALTER TABLE "resource_services" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resource_services_tenant_isolation" ON "resource_services" FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM "resources" r
      INNER JOIN "services" s ON s."id" = "resource_services"."service_id" AND s."tenant_id" = r."tenant_id"
      WHERE r."id" = "resource_services"."resource_id"
        AND r."tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    )
  );

ALTER TABLE "availability_rules" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_rules_tenant_isolation" ON "availability_rules" FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL
    AND "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
  );

ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_tenant_isolation" ON "clients" FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL
    AND "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
  );

ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_tenant_isolation" ON "bookings" FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL
    AND "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
  );

ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_keys_tenant_isolation" ON "api_keys" FOR ALL
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL
    AND "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
  );
