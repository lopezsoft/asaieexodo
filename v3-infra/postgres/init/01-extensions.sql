-- =============================================================================
-- ASAIE EXODO V3 - Inicializacion de Extensiones y Contexto RLS en PostgreSQL 17
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Rol de ejecucion de aplicacion sin privilegios SUPERUSER ni BYPASSRLS
-- Garantiza que PostgreSQL aplique Row-Level Security (RLS) sin excepcion
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'asaie_app_runtime') THEN
        CREATE ROLE asaie_app_runtime NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS NOLOGIN;
    END IF;
END$$;

GRANT USAGE ON SCHEMA public TO asaie_app_runtime;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO asaie_app_runtime;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO asaie_app_runtime;

-- Funcion auxiliar inmutable en transaccion para leer el school_id activo (RLS)
CREATE OR REPLACE FUNCTION current_tenant_school_id()
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('app.current_school_id', true), '')::BIGINT;
$$;

-- Funcion auxiliar para verificar si el contexto actual es de administracion global o migracion ETL
CREATE OR REPLACE FUNCTION is_tenant_bypass_enabled()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(current_setting('app.bypass_rls', true) = 'on', false);
$$;

GRANT EXECUTE ON FUNCTION current_tenant_school_id() TO asaie_app_runtime;
GRANT EXECUTE ON FUNCTION is_tenant_bypass_enabled() TO asaie_app_runtime;
