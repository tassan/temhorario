-- 1.ª carga do volume: garante password do role `postgres` alinhada ao docker-compose.
-- (O entrypoint já criou o role; o ALTER sincroniza se mudares POSTGRES_PASSWORD no futuro.)
SET client_min_messages = WARNING;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
  ELSE
    CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
  END IF;
END
$$;
