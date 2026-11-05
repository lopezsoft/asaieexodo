-- =============================================================================
-- ASAIE EXODO V3 - 03-full-unified-school-schema.sql
-- Migracion 100% Completa de las 2 Bases de Datos Legacy:
--   1. myschoolsadmin_exodo (25 tablas puente/globales)
--   2. asaie_exodo (258 tablas operativas de colegio + 16 vistas academicas)
-- Unificadas en PostgreSQL 17 con school_id (FK -> schools.id) y RLS estricto.
-- =============================================================================

SET client_encoding = 'UTF8';

DROP VIEW IF EXISTS "encabezado_reportes" CASCADE;

-- 1. Ampliacion de tablas base compartidas (schools, countries, departments, cities, users)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS country_id INTEGER DEFAULT 45;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS statecode VARCHAR(50);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS nameschool VARCHAR(250);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS database_name VARCHAR(50);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS folder_name VARCHAR(120);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS lockdate DATE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS state SMALLINT DEFAULT 1;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS active SMALLINT DEFAULT 1;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_country_id_fkey;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_city_id_fkey;

ALTER TABLE countries ADD COLUMN IF NOT EXISTS "ContinentA2" VARCHAR(10);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "abbreviation_A2" VARCHAR(10);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "abbreviation_A3" VARCHAR(10);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "FIPS" VARCHAR(10);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "NUTS" VARCHAR(10);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "HASC" VARCHAR(10);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS country_name VARCHAR(150);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS language VARCHAR(10);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "LanguagePC" VARCHAR(20);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS phone_code VARCHAR(20);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "TLD" VARCHAR(10);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "Latitude" INTEGER;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "Longitude" INTEGER;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "Altitude" INTEGER;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS "TerritoryOf" VARCHAR(10);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS image VARCHAR(150);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS active SMALLINT DEFAULT 1;
ALTER TABLE countries ALTER COLUMN iso_code DROP NOT NULL;
ALTER TABLE countries ALTER COLUMN name DROP NOT NULL;
ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_iso_code_key;

ALTER TABLE departments ADD COLUMN IF NOT EXISTS id_country INTEGER DEFAULT 45;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS code VARCHAR(20);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS name_department VARCHAR(150);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS name_departament VARCHAR(150);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS abbreviation VARCHAR(20);
ALTER TABLE departments ALTER COLUMN country_id DROP NOT NULL;
ALTER TABLE departments ALTER COLUMN dane_code DROP NOT NULL;
ALTER TABLE departments ALTER COLUMN name DROP NOT NULL;
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_country_id_dane_code_key;
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_country_id_fkey;

ALTER TABLE cities ADD COLUMN IF NOT EXISTS id_dept INTEGER;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS city_code VARCHAR(250);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS name_city VARCHAR(150);
ALTER TABLE cities ALTER COLUMN department_id DROP NOT NULL;
ALTER TABLE cities ALTER COLUMN dane_code DROP NOT NULL;
ALTER TABLE cities ALTER COLUMN name DROP NOT NULL;
ALTER TABLE cities DROP CONSTRAINT IF EXISTS cities_department_id_dane_code_key;
ALTER TABLE cities DROP CONSTRAINT IF EXISTS cities_department_id_fkey;

ALTER TABLE users ADD COLUMN IF NOT EXISTS school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS legacy_mysql_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS names VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS question VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS respuest VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS remember_token VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS lectur SMALLINT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS image VARCHAR(250);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS mime VARCHAR(50) DEFAULT 'image/jpeg';
ALTER TABLE users ADD COLUMN IF NOT EXISTS active SMALLINT DEFAULT 1;
ALTER TABLE users ALTER COLUMN document_type_id DROP NOT NULL;
ALTER TABLE users ALTER COLUMN document_number DROP NOT NULL;
ALTER TABLE users ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_document_type_id_document_number_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_document_type_id_fkey;

CREATE TABLE IF NOT EXISTS "failed_jobs" (
  "id" BIGINT NOT NULL,
  "uuid" VARCHAR(255),
  "connection" TEXT,
  "queue" TEXT,
  "payload" TEXT,
  "exception" TEXT,
  "failed_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "failed_jobs" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "bridge_file_managers" (
  "id" BIGINT NOT NULL,
  "uuid" VARCHAR(36),
  "school_id" BIGINT,
  "user_id" BIGINT,
  "file_name" VARCHAR(200),
  "file_description" VARCHAR(200),
  "file_path" VARCHAR(200),
  "url" VARCHAR(200),
  "extension_file" VARCHAR(10),
  "mime_type" VARCHAR(120),
  "size_file" VARCHAR(30),
  "last_modified" TIMESTAMPTZ,
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "bridge_file_managers" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "jobs" (
  "id" BIGINT NOT NULL,
  "queue" VARCHAR(255),
  "payload" TEXT,
  "attempts" SMALLINT,
  "reserved_at" BIGINT,
  "available_at" BIGINT,
  "created_at" BIGINT,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "jobs" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "migrations" (
  "id" BIGINT NOT NULL,
  "migration" VARCHAR(255),
  "batch" INTEGER,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "migrations" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "oauth_access_tokens" (
  "id" VARCHAR(100) NOT NULL,
  "user_id" BIGINT,
  "client_id" BIGINT,
  "name" VARCHAR(255),
  "scopes" TEXT,
  "revoked" SMALLINT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "expires_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "oauth_access_tokens" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "oauth_auth_codes" (
  "id" VARCHAR(100) NOT NULL,
  "user_id" BIGINT,
  "client_id" BIGINT,
  "scopes" TEXT,
  "revoked" SMALLINT,
  "expires_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "oauth_auth_codes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "oauth_clients" (
  "id" BIGINT NOT NULL,
  "user_id" BIGINT,
  "name" VARCHAR(255),
  "secret" VARCHAR(100),
  "provider" VARCHAR(255),
  "redirect" TEXT,
  "personal_access_client" SMALLINT,
  "password_client" SMALLINT,
  "revoked" SMALLINT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "oauth_clients" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "oauth_personal_access_clients" (
  "id" BIGINT NOT NULL,
  "client_id" BIGINT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "oauth_personal_access_clients" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "oauth_refresh_tokens" (
  "id" VARCHAR(100) NOT NULL,
  "access_token_id" VARCHAR(100),
  "revoked" SMALLINT,
  "expires_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "oauth_refresh_tokens" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "password_resets" (
  "email" VARCHAR(255),
  "token" VARCHAR(255),
  "created_at" TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "password_resets" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "school_modules" (
  "id" BIGINT NOT NULL,
  "school_id" BIGINT,
  "system_module_id" BIGINT,
  "is_active" SMALLINT DEFAULT 1,
  "status" SMALLINT DEFAULT 1,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "school_modules" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "school_users" (
  "id" BIGINT NOT NULL,
  "user_id" BIGINT,
  "school_id" BIGINT,
  "state" SMALLINT DEFAULT 1,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "school_users" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" VARCHAR(255) NOT NULL,
  "user_id" BIGINT,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "payload" TEXT,
  "last_activity" INTEGER,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "sessions" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sexo" (
  "id" INTEGER NOT NULL,
  "nombre_sexo" VARCHAR(30),
  "abrev_sexo" VARCHAR(2),
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "sexo" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "study_levels" (
  "id" INTEGER NOT NULL,
  "id_sede" INTEGER,
  "id_nivel" INTEGER,
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "study_levels" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "system_modules" (
  "id" BIGINT NOT NULL,
  "tag" VARCHAR(30),
  "module_name" VARCHAR(50),
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "system_modules" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tb_audit" (
  "id" BIGINT NOT NULL,
  "user_id" BIGINT,
  "ip" VARCHAR(120) DEFAULT '',
  "table" VARCHAR(120) DEFAULT '',
  "what_did" VARCHAR(120) DEFAULT '',
  "data" TEXT DEFAULT '',
  "date" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "tb_audit" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "bridge_users" (
  "id" BIGINT NOT NULL,
  "first_name" VARCHAR(60),
  "last_name" VARCHAR(60),
  "email" VARCHAR(255),
  "avatar" VARCHAR(255),
  "email_verified_at" TIMESTAMPTZ,
  "password" VARCHAR(255),
  "active" SMALLINT DEFAULT 1,
  "remember_token" VARCHAR(100),
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "bridge_users" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" SMALLINT NOT NULL,
  "profile_name" VARCHAR(60),
  "profile_type" TEXT DEFAULT 'Admin',
  "description" VARCHAR(255),
  "font" VARCHAR(60) DEFAULT 'fas fa-school',
  "active" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "user_profiles" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "user_roles" (
  "id" BIGINT NOT NULL,
  "school_id" BIGINT,
  "user_id" BIGINT,
  "profile_id" SMALLINT,
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "user_roles" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "watermark_files" (
  "id" BIGINT NOT NULL,
  "uuid" VARCHAR(36),
  "school_id" BIGINT,
  "file_name" VARCHAR(255),
  "file_description" VARCHAR(255),
  "file_path" VARCHAR(255),
  "url" VARCHAR(255),
  "extension_file" VARCHAR(10),
  "mime_type" VARCHAR(120),
  "size_file" VARCHAR(30),
  "last_modified" TIMESTAMPTZ,
  "state" SMALLINT DEFAULT 1,
  "metadata" TEXT,
  "settings" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);
GRANT SELECT, INSERT, UPDATE, DELETE ON "watermark_files" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "file_managers" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "source_db" VARCHAR(30) NOT NULL DEFAULT 'asaie_exodo',
  "id" BIGINT NOT NULL,
  "uuid" VARCHAR(64),
  "file_manager_uuid" VARCHAR(64),
  "user_id" BIGINT,
  "belong_to_id" BIGINT,
  "profile" VARCHAR(30),
  "data" TEXT,
  "file_name" VARCHAR(255),
  "file_description" VARCHAR(255),
  "file_path" VARCHAR(255),
  "url" VARCHAR(255),
  "extension_file" VARCHAR(20),
  "mime_type" VARCHAR(150),
  "size_file" VARCHAR(50),
  "last_modified" TIMESTAMPTZ,
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("source_db", "school_id", "id")
);
CREATE INDEX IF NOT EXISTS idx_file_managers_school_id ON "file_managers" ("school_id");
ALTER TABLE "file_managers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "file_managers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_file_managers ON "file_managers";
CREATE POLICY tenant_isolation_file_managers ON "file_managers"
  USING (school_id = current_tenant_school_id())
  WITH CHECK (school_id = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "file_managers" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "access_modules" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "Nombre" VARCHAR(40),
  "estado" SMALLINT,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_access_modules_school_id" ON "access_modules" ("school_id");
ALTER TABLE "access_modules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "access_modules" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_access_modules" ON "access_modules";
CREATE POLICY "tenant_isolation_access_modules" ON "access_modules" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "access_modules" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "acta_promocion" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_matric" INTEGER NOT NULL,
  "promedio" NUMERIC(6,2) DEFAULT 0.00,
  "promedio_rec" NUMERIC(6,2) DEFAULT 0.00,
  "areas_g" SMALLINT DEFAULT 0,
  "areas_p" SMALLINT DEFAULT 0,
  "msg" VARCHAR(250) DEFAULT '',
  "msg1" VARCHAR(250) DEFAULT '',
  "msg2" VARCHAR(250) DEFAULT '',
  "msg3" TEXT,
  "estado" SMALLINT DEFAULT 1,
  "prom_comision" SMALLINT DEFAULT 0,
  "libro" SMALLINT DEFAULT 0,
  "folio" SMALLINT DEFAULT 0,
  "tiemestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id_matric")
);
CREATE INDEX IF NOT EXISTS "idx_acta_promocion_school_id" ON "acta_promocion" ("school_id");
ALTER TABLE "acta_promocion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "acta_promocion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_acta_promocion" ON "acta_promocion";
CREATE POLICY "tenant_isolation_acta_promocion" ON "acta_promocion" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "acta_promocion" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "acta_promo_encabezado" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "año" INTEGER,
  "encabezado" TEXT,
  "timestap" TIMESTAMPTZ DEFAULT NOW(),
  "id_inst" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_acta_promo_encabezado_school_id" ON "acta_promo_encabezado" ("school_id");
ALTER TABLE "acta_promo_encabezado" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "acta_promo_encabezado" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_acta_promo_encabezado" ON "acta_promo_encabezado";
CREATE POLICY "tenant_isolation_acta_promo_encabezado" ON "acta_promo_encabezado" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "acta_promo_encabezado" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "administrativos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_country" INTEGER DEFAULT 45,
  "id_documento" INTEGER DEFAULT 99,
  "apellido1" VARCHAR(20),
  "apellido2" VARCHAR(20),
  "nombre1" VARCHAR(20),
  "nombre2" VARCHAR(20),
  "tipo_sangre" VARCHAR(3),
  "sexo" VARCHAR(1),
  "fecha_nacimiento" DATE,
  "edad" INTEGER DEFAULT 1,
  "telefono" VARCHAR(20) DEFAULT '',
  "direccion" VARCHAR(100) DEFAULT '',
  "celular" VARCHAR(20) DEFAULT '',
  "mun_lug_nac" INTEGER,
  "mun_lug_exp" INTEGER,
  "foto" VARCHAR(50) DEFAULT '',
  "asign_bas_mensual" NUMERIC(7,0) DEFAULT 0,
  "numero_documento" VARCHAR(20),
  "cod_denominacio" VARCHAR(3),
  "email" VARCHAR(80) DEFAULT 'correo@correo.com',
  "mime" VARCHAR(100) DEFAULT 'image/jpeg',
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_administrativos_school_id" ON "administrativos" ("school_id");
ALTER TABLE "administrativos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "administrativos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_administrativos" ON "administrativos";
CREATE POLICY "tenant_isolation_administrativos" ON "administrativos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "administrativos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "alcance" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "cod_alca" VARCHAR(2),
  "columna3" VARCHAR(13)
);
CREATE INDEX IF NOT EXISTS "idx_alcance_school_id" ON "alcance" ("school_id");
ALTER TABLE "alcance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alcance" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_alcance" ON "alcance";
CREATE POLICY "tenant_isolation_alcance" ON "alcance" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "alcance" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "anchobanda" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "ancho_band" VARCHAR(6),
  "descrip" VARCHAR(15)
);
CREATE INDEX IF NOT EXISTS "idx_anchobanda_school_id" ON "anchobanda" ("school_id");
ALTER TABLE "anchobanda" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "anchobanda" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_anchobanda" ON "anchobanda";
CREATE POLICY "tenant_isolation_anchobanda" ON "anchobanda" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "anchobanda" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "areas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "area" VARCHAR(200),
  "abrev" VARCHAR(10) DEFAULT '',
  "pierde_año_lectivo" INTEGER DEFAULT 0,
  "ordenar" INTEGER DEFAULT 1,
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_areas_school_id" ON "areas" ("school_id");
ALTER TABLE "areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "areas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_areas" ON "areas";
CREATE POLICY "tenant_isolation_areas" ON "areas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "areas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "areasf" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_curso" INTEGER NOT NULL,
  "id_matric" INTEGER NOT NULL,
  "periodo" VARCHAR(2) NOT NULL DEFAULT '0',
  "p1" NUMERIC(6,2),
  "p2" NUMERIC(6,2),
  "p3" NUMERIC(6,2),
  "p4" NUMERIC(6,2),
  "final" NUMERIC(6,2),
  "recuperacion" NUMERIC(6,2) DEFAULT 0.00,
  "faltas" INTEGER,
  "injustificadas" INTEGER,
  "retraso" INTEGER,
  "estado" INTEGER DEFAULT 1,
  "tiemestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id_curso", "id_matric", "periodo")
);
CREATE INDEX IF NOT EXISTS "idx_areasf_school_id" ON "areasf" ("school_id");
ALTER TABLE "areasf" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "areasf" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_areasf" ON "areasf";
CREATE POLICY "tenant_isolation_areasf" ON "areasf" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "areasf" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "areas_promocion" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "cod_area" INTEGER,
  "año" SMALLINT,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_areas_promocion_school_id" ON "areas_promocion" ("school_id");
ALTER TABLE "areas_promocion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "areas_promocion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_areas_promocion" ON "areas_promocion";
CREATE POLICY "tenant_isolation_areas_promocion" ON "areas_promocion" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "areas_promocion" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "area_enseñanza" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_ar_ens" INTEGER NOT NULL,
  "asignatura" VARCHAR(41),
  PRIMARY KEY ("school_id", "id_ar_ens")
);
CREATE INDEX IF NOT EXISTS "idx_area_ense_anza_school_id" ON "area_enseñanza" ("school_id");
ALTER TABLE "area_enseñanza" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "area_enseñanza" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_area_ense_anza" ON "area_enseñanza";
CREATE POLICY "tenant_isolation_area_ense_anza" ON "area_enseñanza" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "area_enseñanza" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "area_tecnica" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(80),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_area_tecnica_school_id" ON "area_tecnica" ("school_id");
ALTER TABLE "area_tecnica" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "area_tecnica" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_area_tecnica" ON "area_tecnica";
CREATE POLICY "tenant_isolation_area_tecnica" ON "area_tecnica" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "area_tecnica" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "asignaturas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_pk" INTEGER NOT NULL,
  "id" INTEGER DEFAULT 0,
  "asignatura" VARCHAR(250),
  "abrev" VARCHAR(6),
  "ordenar" INTEGER DEFAULT 1,
  "excluir" INTEGER DEFAULT 0,
  "electiva" INTEGER DEFAULT 0,
  "estado" INTEGER DEFAULT 1,
  "type" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id_pk")
);
CREATE INDEX IF NOT EXISTS "idx_asignaturas_school_id" ON "asignaturas" ("school_id");
ALTER TABLE "asignaturas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asignaturas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_asignaturas" ON "asignaturas";
CREATE POLICY "tenant_isolation_asignaturas" ON "asignaturas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "asignaturas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "asignaturas_banco" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "descripcion" VARCHAR(80),
  "abrev" VARCHAR(4),
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_asignaturas_banco_school_id" ON "asignaturas_banco" ("school_id");
ALTER TABLE "asignaturas_banco" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asignaturas_banco" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_asignaturas_banco" ON "asignaturas_banco";
CREATE POLICY "tenant_isolation_asignaturas_banco" ON "asignaturas_banco" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "asignaturas_banco" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "asig_perdidas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "periodo" VARCHAR(1),
  "cod_jorn" INTEGER,
  "año" INTEGER,
  "grupo" VARCHAR(2),
  "cod_grado" VARCHAR(2),
  "cons_sede" VARCHAR(14),
  "id_sede" INTEGER DEFAULT 1,
  "ar1" INTEGER DEFAULT 0,
  "nar1" NUMERIC(6,0) DEFAULT 0,
  "ar2" INTEGER DEFAULT 0,
  "nar2" NUMERIC(6,0) DEFAULT 0,
  "ar3" INTEGER DEFAULT 0,
  "nar3" NUMERIC(6,0) DEFAULT 0,
  "ar4" INTEGER DEFAULT 0,
  "nar4" NUMERIC(6,0) DEFAULT 0,
  "ar5" INTEGER DEFAULT 0,
  "nar5" NUMERIC(6,0) DEFAULT 0,
  "ar6" INTEGER DEFAULT 0,
  "nar6" NUMERIC(6,0) DEFAULT 0,
  "ar7" INTEGER DEFAULT 0,
  "nar7" NUMERIC(6,0) DEFAULT 0,
  "ar8" INTEGER DEFAULT 0,
  "nar8" NUMERIC(6,0) DEFAULT 0,
  "ar9" INTEGER DEFAULT 0,
  "nar9" NUMERIC(6,0) DEFAULT 0,
  "ar10" INTEGER DEFAULT 0,
  "nar10" NUMERIC(6,0) DEFAULT 0,
  "ar11" INTEGER DEFAULT 0,
  "nar11" NUMERIC(6,0) DEFAULT 0,
  "ar12" INTEGER DEFAULT 0,
  "nar12" NUMERIC(6,0) DEFAULT 0,
  "ar13" INTEGER DEFAULT 0,
  "nar13" NUMERIC(6,0) DEFAULT 0,
  "ar14" INTEGER DEFAULT 0,
  "nar14" NUMERIC(6,0) DEFAULT 0,
  "ar15" INTEGER DEFAULT 0,
  "nar15" NUMERIC(6,0) DEFAULT 0,
  "ar16" INTEGER DEFAULT 0,
  "nar16" NUMERIC(6,0) DEFAULT 0,
  "ar17" INTEGER DEFAULT 0,
  "nar17" NUMERIC(6,0) DEFAULT 0,
  "ar18" INTEGER DEFAULT 0,
  "nar18" NUMERIC(6,0) DEFAULT 0,
  "ar19" INTEGER DEFAULT 0,
  "nar19" NUMERIC(6,0) DEFAULT 0,
  "ar20" INTEGER DEFAULT 0,
  "nar20" NUMERIC(6,0) DEFAULT 0,
  "ar21" INTEGER DEFAULT 0,
  "nar21" NUMERIC(6,0) DEFAULT 0,
  "ar22" INTEGER DEFAULT 0,
  "nar22" NUMERIC(6,0) DEFAULT 0,
  "ar23" INTEGER DEFAULT 0,
  "nar23" NUMERIC(6,0) DEFAULT 0,
  "ar24" INTEGER DEFAULT 0,
  "nar24" NUMERIC(6,0) DEFAULT 0,
  "ar25" INTEGER DEFAULT 0,
  "nar25" NUMERIC(6,0) DEFAULT 0,
  "prom" NUMERIC(6,2) DEFAULT 0.00
);
CREATE INDEX IF NOT EXISTS "idx_asig_perdidas_school_id" ON "asig_perdidas" ("school_id");
ALTER TABLE "asig_perdidas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asig_perdidas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_asig_perdidas" ON "asig_perdidas";
CREATE POLICY "tenant_isolation_asig_perdidas" ON "asig_perdidas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "asig_perdidas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "asig_perdidas_est" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "cod_est" INTEGER,
  "periodo" VARCHAR(1),
  "cod_jorn" INTEGER,
  "año" INTEGER,
  "grupo" VARCHAR(2),
  "cod_grado" VARCHAR(2),
  "cons_sede" VARCHAR(14),
  "id_sede" INTEGER DEFAULT 1,
  "ar1" INTEGER DEFAULT 0,
  "nar1" NUMERIC(6,2) DEFAULT 0.00,
  "ar2" INTEGER DEFAULT 0,
  "nar2" NUMERIC(6,2) DEFAULT 0.00,
  "ar3" INTEGER DEFAULT 0,
  "nar3" NUMERIC(6,2) DEFAULT 0.00,
  "ar4" INTEGER DEFAULT 0,
  "nar4" NUMERIC(6,2) DEFAULT 0.00,
  "ar5" INTEGER DEFAULT 0,
  "nar5" NUMERIC(6,2) DEFAULT 0.00,
  "ar6" INTEGER DEFAULT 0,
  "nar6" NUMERIC(6,2) DEFAULT 0.00,
  "ar7" INTEGER DEFAULT 0,
  "nar7" NUMERIC(6,2) DEFAULT 0.00,
  "ar8" INTEGER DEFAULT 0,
  "nar8" NUMERIC(6,2) DEFAULT 0.00,
  "ar9" INTEGER DEFAULT 0,
  "nar9" NUMERIC(6,2) DEFAULT 0.00,
  "ar10" INTEGER DEFAULT 0,
  "nar10" NUMERIC(6,2) DEFAULT 0.00,
  "ar11" INTEGER DEFAULT 0,
  "nar11" NUMERIC(6,2) DEFAULT 0.00,
  "ar12" INTEGER DEFAULT 0,
  "nar12" NUMERIC(6,2) DEFAULT 0.00,
  "ar13" INTEGER DEFAULT 0,
  "nar13" NUMERIC(6,2) DEFAULT 0.00,
  "ar14" INTEGER DEFAULT 0,
  "nar14" NUMERIC(6,2) DEFAULT 0.00,
  "ar15" INTEGER DEFAULT 0,
  "nar15" NUMERIC(6,2) DEFAULT 0.00,
  "ar16" INTEGER DEFAULT 0,
  "nar16" NUMERIC(6,2) DEFAULT 0.00,
  "ar17" INTEGER DEFAULT 0,
  "nar17" NUMERIC(6,2) DEFAULT 0.00,
  "ar18" INTEGER DEFAULT 0,
  "nar18" NUMERIC(6,2) DEFAULT 0.00,
  "ar19" INTEGER DEFAULT 0,
  "nar19" NUMERIC(6,2) DEFAULT 0.00,
  "ar20" INTEGER DEFAULT 0,
  "nar20" NUMERIC(6,2) DEFAULT 0.00,
  "ar21" INTEGER DEFAULT 0,
  "nar21" NUMERIC(6,2) DEFAULT 0.00,
  "ar22" INTEGER DEFAULT 0,
  "nar22" NUMERIC(6,2) DEFAULT 0.00,
  "ar23" INTEGER DEFAULT 0,
  "nar23" NUMERIC(6,2) DEFAULT 0.00,
  "ar24" INTEGER DEFAULT 0,
  "nar24" NUMERIC(6,2) DEFAULT 0.00,
  "ar25" INTEGER DEFAULT 0,
  "nar25" NUMERIC(6,2) DEFAULT 0.00,
  "prom" NUMERIC(6,2) DEFAULT 0.00
);
CREATE INDEX IF NOT EXISTS "idx_asig_perdidas_est_school_id" ON "asig_perdidas_est" ("school_id");
ALTER TABLE "asig_perdidas_est" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asig_perdidas_est" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_asig_perdidas_est" ON "asig_perdidas_est";
CREATE POLICY "tenant_isolation_asig_perdidas_est" ON "asig_perdidas_est" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "asig_perdidas_est" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "asociacion" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_asoc" INTEGER NOT NULL,
  "tipo" VARCHAR(16),
  PRIMARY KEY ("school_id", "id_asoc")
);
CREATE INDEX IF NOT EXISTS "idx_asociacion_school_id" ON "asociacion" ("school_id");
ALTER TABLE "asociacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asociacion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_asociacion" ON "asociacion";
CREATE POLICY "tenant_isolation_asociacion" ON "asociacion" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "asociacion" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "aspectos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_inst" INTEGER NOT NULL DEFAULT 1,
  "NRO" VARCHAR(2) NOT NULL,
  "COD_DIM" VARCHAR(1),
  "DES_ASPEC" VARCHAR(100),
  "PUNTAJE1" NUMERIC(4,0),
  "PUNTAJE2" NUMERIC(4,0),
  "PUNTAJE3" NUMERIC(4,0),
  "PUNTAJE4" NUMERIC(4,0),
  "abrev" VARCHAR(6) DEFAULT 'TALLER',
  "AÑO" INTEGER NOT NULL DEFAULT 2011,
  PRIMARY KEY ("school_id", "id_inst", "NRO", "AÑO")
);
CREATE INDEX IF NOT EXISTS "idx_aspectos_school_id" ON "aspectos" ("school_id");
ALTER TABLE "aspectos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aspectos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_aspectos" ON "aspectos";
CREATE POLICY "tenant_isolation_aspectos" ON "aspectos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "aspectos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "asperdidas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "periodo" VARCHAR(1),
  "cod_jorn" VARCHAR(1),
  "año" VARCHAR(4),
  "grupo" VARCHAR(2),
  "cod_grado" VARCHAR(2),
  "cons_sede" VARCHAR(14),
  "ar1" VARCHAR(3),
  "nar1" NUMERIC(5,0),
  "ar2" VARCHAR(3),
  "nar2" NUMERIC(5,0),
  "ar3" VARCHAR(3),
  "nar3" NUMERIC(5,0),
  "ar4" VARCHAR(3),
  "nar4" NUMERIC(5,0),
  "ar5" VARCHAR(3),
  "nar5" NUMERIC(5,0),
  "ar6" VARCHAR(3),
  "nar6" NUMERIC(5,0),
  "ar7" VARCHAR(3),
  "nar7" NUMERIC(5,0),
  "ar8" VARCHAR(3),
  "nar8" NUMERIC(5,0),
  "ar9" VARCHAR(3),
  "nar9" NUMERIC(5,0),
  "ar10" VARCHAR(3),
  "nar10" NUMERIC(5,0),
  "ar11" VARCHAR(3),
  "nar11" NUMERIC(5,0),
  "ar12" VARCHAR(3),
  "nar12" NUMERIC(5,0),
  "ar13" VARCHAR(3),
  "nar13" NUMERIC(5,0),
  "ar14" VARCHAR(3),
  "nar14" NUMERIC(5,0),
  "ar15" VARCHAR(3),
  "nar15" NUMERIC(5,0),
  "ar16" VARCHAR(3),
  "nar16" NUMERIC(5,0),
  "ar17" VARCHAR(3),
  "nar17" NUMERIC(5,0),
  "ar18" VARCHAR(3),
  "nar18" NUMERIC(5,0),
  "ar19" VARCHAR(3),
  "nar19" NUMERIC(5,0),
  "ar20" VARCHAR(3),
  "nar20" NUMERIC(5,0),
  "ar21" VARCHAR(3),
  "nar21" NUMERIC(5,0),
  "ar22" VARCHAR(3),
  "nar22" NUMERIC(5,0),
  "ar23" VARCHAR(3),
  "nar23" NUMERIC(5,0),
  "ar24" VARCHAR(3),
  "nar24" NUMERIC(5,0),
  "ar25" VARCHAR(3),
  "nar25" NUMERIC(5,0)
);
CREATE INDEX IF NOT EXISTS "idx_asperdidas_school_id" ON "asperdidas" ("school_id");
ALTER TABLE "asperdidas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asperdidas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_asperdidas" ON "asperdidas";
CREATE POLICY "tenant_isolation_asperdidas" ON "asperdidas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "asperdidas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "auditoria" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_user" INTEGER,
  "id_pc" VARCHAR(100),
  "id_tabla" VARCHAR(45),
  "fecha" DATE,
  "hora" TIME,
  "quehiso" VARCHAR(45),
  "datos" TEXT
);
CREATE INDEX IF NOT EXISTS "idx_auditoria_school_id" ON "auditoria" ("school_id");
ALTER TABLE "auditoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auditoria" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_auditoria" ON "auditoria";
CREATE POLICY "tenant_isolation_auditoria" ON "auditoria" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "auditoria" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ausencias" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_docente" INTEGER,
  "id_matric" INTEGER,
  "id_asig" INTEGER,
  "motivo" TEXT,
  "observacion" VARCHAR(250),
  "tipo" INTEGER DEFAULT 1,
  "horas" NUMERIC(6,2),
  "fecha_falta" DATE,
  "fecha_alta" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ausencias_school_id" ON "ausencias" ("school_id");
ALTER TABLE "ausencias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ausencias" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ausencias" ON "ausencias";
CREATE POLICY "tenant_isolation_ausencias" ON "ausencias" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ausencias" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "aux_asignaturas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_asign" INTEGER,
  "id_area" INTEGER,
  "year" SMALLINT DEFAULT 0,
  "activa" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_aux_asignaturas_school_id" ON "aux_asignaturas" ("school_id");
ALTER TABLE "aux_asignaturas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aux_asignaturas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_aux_asignaturas" ON "aux_asignaturas";
CREATE POLICY "tenant_isolation_aux_asignaturas" ON "aux_asignaturas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "aux_asignaturas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "aux_docentes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_docente" INTEGER,
  "year" SMALLINT,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_aux_docentes_school_id" ON "aux_docentes" ("school_id");
ALTER TABLE "aux_docentes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aux_docentes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_aux_docentes" ON "aux_docentes";
CREATE POLICY "tenant_isolation_aux_docentes" ON "aux_docentes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "aux_docentes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "aux_families_students" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_student" INTEGER,
  "id_family" INTEGER,
  "id_type" INTEGER DEFAULT 1,
  "id_relationship" INTEGER DEFAULT 2,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_aux_families_students_school_id" ON "aux_families_students" ("school_id");
ALTER TABLE "aux_families_students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aux_families_students" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_aux_families_students" ON "aux_families_students";
CREATE POLICY "tenant_isolation_aux_families_students" ON "aux_families_students" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "aux_families_students" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "aux_grados_agrupados" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_grado_agrupado" INTEGER,
  "id_grado" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_aux_grados_agrupados_school_id" ON "aux_grados_agrupados" ("school_id");
ALTER TABLE "aux_grados_agrupados" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aux_grados_agrupados" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_aux_grados_agrupados" ON "aux_grados_agrupados";
CREATE POLICY "tenant_isolation_aux_grados_agrupados" ON "aux_grados_agrupados" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "aux_grados_agrupados" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "backup_notes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER DEFAULT 0,
  "id_matric" INTEGER,
  "id_escala" INTEGER DEFAULT 0,
  "periodo" VARCHAR(2),
  "year" SMALLINT DEFAULT 2002,
  "n1" NUMERIC(6,2) DEFAULT 0.00,
  "n2" NUMERIC(6,2) DEFAULT 0.00,
  "n3" NUMERIC(6,2) DEFAULT 0.00,
  "n4" NUMERIC(6,2) DEFAULT 0.00,
  "n5" NUMERIC(6,2) DEFAULT 0.00,
  "n6" NUMERIC(6,2) DEFAULT 0.00,
  "n7" NUMERIC(6,2) DEFAULT 0.00,
  "n8" NUMERIC(6,2) DEFAULT 0.00,
  "n9" NUMERIC(6,2) DEFAULT 0.00,
  "n10" NUMERIC(6,2) DEFAULT 0.00,
  "n11" NUMERIC(6,2) DEFAULT 0.00,
  "n12" NUMERIC(6,2) DEFAULT 0.00,
  "n13" NUMERIC(6,2) DEFAULT 0.00,
  "n14" NUMERIC(6,2) DEFAULT 0.00,
  "n15" NUMERIC(6,2) DEFAULT 0.00,
  "n16" NUMERIC(6,2) DEFAULT 0.00,
  "n17" NUMERIC(6,2) DEFAULT 0.00,
  "n18" NUMERIC(6,2) DEFAULT 0.00,
  "n19" NUMERIC(6,2) DEFAULT 0.00,
  "n20" NUMERIC(6,2) DEFAULT 0.00,
  "n21" NUMERIC(6,2) DEFAULT 0.00,
  "n22" NUMERIC(6,2) DEFAULT 0.00,
  "n23" NUMERIC(6,2) DEFAULT 0.00,
  "n24" NUMERIC(6,2) DEFAULT 0.00,
  "n25" NUMERIC(6,2) DEFAULT 0.00,
  "n26" NUMERIC(6,2) DEFAULT 0.00,
  "n27" NUMERIC(6,2) DEFAULT 0.00,
  "n28" NUMERIC(6,2) DEFAULT 0.00,
  "n29" NUMERIC(6,2) DEFAULT 0.00,
  "n30" NUMERIC(6,2) DEFAULT 0.00,
  "final" NUMERIC(6,2) DEFAULT 0.00,
  "faltas" NUMERIC(3,0) DEFAULT 0,
  "injustificadas" SMALLINT DEFAULT 0,
  "retraso" SMALLINT DEFAULT 0,
  "nota_perdida" NUMERIC(6,2) DEFAULT 0.00,
  "nota_habilitacion" NUMERIC(6,2) DEFAULT 0.00,
  "nivelacion" SMALLINT DEFAULT 0,
  "fecha" DATE,
  "table_name" VARCHAR(60),
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_backup_notes_school_id" ON "backup_notes" ("school_id");
ALTER TABLE "backup_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "backup_notes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_backup_notes" ON "backup_notes";
CREATE POLICY "tenant_isolation_backup_notes" ON "backup_notes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "backup_notes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "banco_cli" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "cons" INTEGER,
  "cod_grado" VARCHAR(2),
  "id_asig" INTEGER,
  "descripcion" TEXT,
  "periodo" VARCHAR(1),
  "tipo" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_banco_cli_school_id" ON "banco_cli" ("school_id");
ALTER TABLE "banco_cli" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "banco_cli" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_banco_cli" ON "banco_cli";
CREATE POLICY "tenant_isolation_banco_cli" ON "banco_cli" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "banco_cli" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "biblioteca" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "cod_mun" VARCHAR(3),
  "columna2" VARCHAR(23)
);
CREATE INDEX IF NOT EXISTS "idx_biblioteca_school_id" ON "biblioteca" ("school_id");
ALTER TABLE "biblioteca" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "biblioteca" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_biblioteca" ON "biblioteca";
CREATE POLICY "tenant_isolation_biblioteca" ON "biblioteca" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "biblioteca" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "calendario" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "COD_CAL" INTEGER NOT NULL,
  "CALENDARIO" VARCHAR(12),
  PRIMARY KEY ("school_id", "COD_CAL")
);
CREATE INDEX IF NOT EXISTS "idx_calendario_school_id" ON "calendario" ("school_id");
ALTER TABLE "calendario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calendario" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_calendario" ON "calendario";
CREATE POLICY "tenant_isolation_calendario" ON "calendario" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "calendario" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "capacidades_excepcionales" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "nombre" VARCHAR(250),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_capacidades_excepcionales_school_id" ON "capacidades_excepcionales" ("school_id");
ALTER TABLE "capacidades_excepcionales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "capacidades_excepcionales" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_capacidades_excepcionales" ON "capacidades_excepcionales";
CREATE POLICY "tenant_isolation_capacidades_excepcionales" ON "capacidades_excepcionales" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "capacidades_excepcionales" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "caracter_est" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_caracter" INTEGER NOT NULL,
  "tipo" VARCHAR(20),
  PRIMARY KEY ("school_id", "id_caracter")
);
CREATE INDEX IF NOT EXISTS "idx_caracter_est_school_id" ON "caracter_est" ("school_id");
ALTER TABLE "caracter_est" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "caracter_est" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_caracter_est" ON "caracter_est";
CREATE POLICY "tenant_isolation_caracter_est" ON "caracter_est" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "caracter_est" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "caracter_mat" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "ID" INTEGER NOT NULL,
  "tipo" VARCHAR(15),
  PRIMARY KEY ("school_id", "ID")
);
CREATE INDEX IF NOT EXISTS "idx_caracter_mat_school_id" ON "caracter_mat" ("school_id");
ALTER TABLE "caracter_mat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "caracter_mat" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_caracter_mat" ON "caracter_mat";
CREATE POLICY "tenant_isolation_caracter_mat" ON "caracter_mat" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "caracter_mat" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cargo" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "cod_car" INTEGER NOT NULL,
  "cargo_nom" VARCHAR(20),
  PRIMARY KEY ("school_id", "cod_car")
);
CREATE INDEX IF NOT EXISTS "idx_cargo_school_id" ON "cargo" ("school_id");
ALTER TABLE "cargo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cargo" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cargo" ON "cargo";
CREATE POLICY "tenant_isolation_cargo" ON "cargo" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cargo" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "carnets" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "url" VARCHAR(200) DEFAULT '0',
  "name" VARCHAR(60) DEFAULT '0',
  "student" VARCHAR(60) DEFAULT 'CARNÉ ESTUDIANTIL',
  "school" VARCHAR(60) DEFAULT 'CARNÉ INSTITUCIONAL',
  "info" TEXT,
  "header" TEXT,
  "qr" SMALLINT DEFAULT 1,
  "active" SMALLINT DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_carnets_school_id" ON "carnets" ("school_id");
ALTER TABLE "carnets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carnets" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_carnets" ON "carnets";
CREATE POLICY "tenant_isolation_carnets" ON "carnets" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "carnets" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "carrera_administrativa" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(45),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_carrera_administrativa_school_id" ON "carrera_administrativa" ("school_id");
ALTER TABLE "carrera_administrativa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carrera_administrativa" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_carrera_administrativa" ON "carrera_administrativa";
CREATE POLICY "tenant_isolation_carrera_administrativa" ON "carrera_administrativa" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "carrera_administrativa" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "carrera_admom" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(45),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_carrera_admom_school_id" ON "carrera_admom" ("school_id");
ALTER TABLE "carrera_admom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carrera_admom" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_carrera_admom" ON "carrera_admom";
CREATE POLICY "tenant_isolation_carrera_admom" ON "carrera_admom" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "carrera_admom" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cdesempeños" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_pk" INTEGER NOT NULL,
  "id" INTEGER,
  "id_inst" INTEGER DEFAULT 1,
  "desempeño" VARCHAR(20),
  "desde" NUMERIC(6,2),
  "hasta" NUMERIC(6,2),
  "abrev" VARCHAR(2),
  "año" INTEGER DEFAULT 9999,
  "reprueba" INTEGER,
  PRIMARY KEY ("school_id", "id_pk")
);
CREATE INDEX IF NOT EXISTS "idx_cdesempe_os_school_id" ON "cdesempeños" ("school_id");
ALTER TABLE "cdesempeños" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cdesempeños" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cdesempe_os" ON "cdesempeños";
CREATE POLICY "tenant_isolation_cdesempe_os" ON "cdesempeños" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cdesempeños" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "certificate_numbers" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_parent" SMALLINT,
  "year" SMALLINT,
  "total" INTEGER,
  "type" SMALLINT,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_certificate_numbers_school_id" ON "certificate_numbers" ("school_id");
ALTER TABLE "certificate_numbers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "certificate_numbers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_certificate_numbers" ON "certificate_numbers";
CREATE POLICY "tenant_isolation_certificate_numbers" ON "certificate_numbers" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "certificate_numbers" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cierre" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "año" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_cierre_school_id" ON "cierre" ("school_id");
ALTER TABLE "cierre" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cierre" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cierre" ON "cierre";
CREATE POLICY "tenant_isolation_cierre" ON "cierre" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cierre" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ciudades" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "dpto" INTEGER,
  "mun" VARCHAR(3),
  "nombre_mun" VARCHAR(45),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ciudades_school_id" ON "ciudades" ("school_id");
ALTER TABLE "ciudades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ciudades" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ciudades" ON "ciudades";
CREATE POLICY "tenant_isolation_ciudades" ON "ciudades" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ciudades" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ciudades1" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "dpto" VARCHAR(2),
  "mun" VARCHAR(3),
  "nombre_mun" VARCHAR(45)
);
CREATE INDEX IF NOT EXISTS "idx_ciudades1_school_id" ON "ciudades1" ("school_id");
ALTER TABLE "ciudades1" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ciudades1" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ciudades1" ON "ciudades1";
CREATE POLICY "tenant_isolation_ciudades1" ON "ciudades1" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ciudades1" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ci_sessions" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" VARCHAR(40) NOT NULL,
  "ip_address" VARCHAR(45) NOT NULL,
  "timestamp" BIGINT DEFAULT 0,
  "data" BYTEA,
  PRIMARY KEY ("school_id", "id", "ip_address")
);
CREATE INDEX IF NOT EXISTS "idx_ci_sessions_school_id" ON "ci_sessions" ("school_id");
ALTER TABLE "ci_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ci_sessions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ci_sessions" ON "ci_sessions";
CREATE POLICY "tenant_isolation_ci_sessions" ON "ci_sessions" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ci_sessions" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "claseinternet" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "cla_inter" VARCHAR(1),
  "columna3" VARCHAR(22)
);
CREATE INDEX IF NOT EXISTS "idx_claseinternet_school_id" ON "claseinternet" ("school_id");
ALTER TABLE "claseinternet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "claseinternet" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_claseinternet" ON "claseinternet";
CREATE POLICY "tenant_isolation_claseinternet" ON "claseinternet" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "claseinternet" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "columnas_notas_competencias" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_competencia" INTEGER,
  "numero_column" INTEGER,
  "porciento" NUMERIC(4,2) DEFAULT 0.00,
  "descripcion" VARCHAR(120) DEFAULT '',
  "abrev" VARCHAR(10) DEFAULT '',
  "tipo" TEXT,
  "modificable" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_columnas_notas_competencias_school_id" ON "columnas_notas_competencias" ("school_id");
ALTER TABLE "columnas_notas_competencias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "columnas_notas_competencias" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_columnas_notas_competencias" ON "columnas_notas_competencias";
CREATE POLICY "tenant_isolation_columnas_notas_competencias" ON "columnas_notas_competencias" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "columnas_notas_competencias" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "competencias" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_pk" INTEGER NOT NULL,
  "id" INTEGER DEFAULT 0,
  "id_grado_agrupado" INTEGER DEFAULT 1,
  "competencia" VARCHAR(120),
  "porcentaje" NUMERIC(6,2) DEFAULT 0.00,
  "year" SMALLINT,
  "calificable" SMALLINT DEFAULT 1,
  "foto" TEXT DEFAULT '',
  "mime" VARCHAR(40) DEFAULT 'image/jpeg',
  PRIMARY KEY ("school_id", "id_pk")
);
CREATE INDEX IF NOT EXISTS "idx_competencias_school_id" ON "competencias" ("school_id");
ALTER TABLE "competencias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "competencias" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_competencias" ON "competencias";
CREATE POLICY "tenant_isolation_competencias" ON "competencias" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "competencias" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "config001" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_grupo_grados" INTEGER DEFAULT 1,
  "year" SMALLINT DEFAULT 2011,
  "t_año_lectivo" INTEGER DEFAULT 0,
  "areas_pierde" INTEGER DEFAULT 0,
  "pierde_luego_rec" INTEGER DEFAULT 0,
  "promocion" INTEGER DEFAULT 1,
  "Ndecimales" INTEGER DEFAULT 0,
  "nota_max_rec" NUMERIC(6,2) DEFAULT 0.00,
  "grupo" INTEGER DEFAULT 1,
  "procesos" INTEGER DEFAULT 2,
  "prom_areas" NUMERIC(6,2) DEFAULT 0.00,
  "porcentaje_areas" INTEGER DEFAULT 0,
  "docente_ficha_obs" INTEGER DEFAULT 0,
  "porciento_ausencia" NUMERIC(6,2) DEFAULT 25.00,
  "pierde_año_lectivo_area" INTEGER DEFAULT 0,
  "a_estra_apoyo_fecha" INTEGER DEFAULT 0,
  "cant_est_x_libro" INTEGER DEFAULT 500,
  "conv_reincidencia" INTEGER DEFAULT 0,
  "ficha_mat_x_año" SMALLINT DEFAULT 1,
  "nota_redondeo" NUMERIC(6,2) DEFAULT 0.00,
  "nota_final_redondeo" NUMERIC(6,2) DEFAULT 0.00,
  "prom_area_puesto" SMALLINT DEFAULT 0,
  "fecha_prom" DATE,
  "aplicar_redondeo_fin_año" SMALLINT DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_config001_school_id" ON "config001" ("school_id");
ALTER TABLE "config001" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "config001" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_config001" ON "config001";
CREATE POLICY "tenant_isolation_config001" ON "config001" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "config001" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "configboletin" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "promedio" INTEGER DEFAULT 0,
  "msglogro" VARCHAR(250) DEFAULT '',
  "firmarector" INTEGER DEFAULT 0,
  "firmasecre" INTEGER DEFAULT 0,
  "firmacoor" INTEGER DEFAULT 1,
  "firmadirgrupo" INTEGER DEFAULT 1,
  "activamsg" INTEGER DEFAULT 0,
  "activeindica" INTEGER DEFAULT 1,
  "bol_desem" SMALLINT DEFAULT 0,
  "permi_ind" INTEGER DEFAULT 5,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_configboletin_school_id" ON "configboletin" ("school_id");
ALTER TABLE "configboletin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "configboletin" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_configboletin" ON "configboletin";
CREATE POLICY "tenant_isolation_configboletin" ON "configboletin" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "configboletin" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "configdiplomas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "año" SMALLINT,
  "encabezado" TEXT,
  "nombre_inst" TEXT,
  "resolucion" TEXT,
  "otorga" VARCHAR(250) DEFAULT 'Otorga el Presente',
  "diploma" VARCHAR(250) DEFAULT 'DIPLOMA',
  "al_alumno" VARCHAR(250) DEFAULT 'A:',
  "cuerpo_preescolar" TEXT,
  "cuerpo_primaria" TEXT,
  "cuerpo_secundaria" TEXT,
  "cuerpo_media" TEXT,
  "firma" TEXT,
  "firma_rector" INTEGER DEFAULT 1,
  "firma_coord" INTEGER,
  "firma_secret" INTEGER,
  "firma_dir_gpo" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_configdiplomas_school_id" ON "configdiplomas" ("school_id");
ALTER TABLE "configdiplomas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "configdiplomas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_configdiplomas" ON "configdiplomas";
CREATE POLICY "tenant_isolation_configdiplomas" ON "configdiplomas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "configdiplomas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "config_acta_grado" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "año" SMALLINT,
  "encabezado" TEXT,
  "nombre_inst" TEXT,
  "resolucion" TEXT,
  "otorga" TEXT,
  "diploma" TEXT,
  "al_alumno" TEXT,
  "copia_folio" TEXT,
  "constancia" TEXT,
  "firma" TEXT,
  "firma_rec" INTEGER DEFAULT 1,
  "firma_sec" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_config_acta_grado_school_id" ON "config_acta_grado" ("school_id");
ALTER TABLE "config_acta_grado" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "config_acta_grado" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_config_acta_grado" ON "config_acta_grado";
CREATE POLICY "tenant_isolation_config_acta_grado" ON "config_acta_grado" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "config_acta_grado" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "config_columns_theacher" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER,
  "id_column" INTEGER,
  "nombre" VARCHAR(20) DEFAULT '',
  "descripcion" VARCHAR(120) DEFAULT '',
  "porcentual" NUMERIC(6,2) DEFAULT 0.00,
  "periodo" VARCHAR(1) DEFAULT '1',
  "evaluacion" SMALLINT DEFAULT 0,
  "foro" SMALLINT DEFAULT 0,
  "color_text" VARCHAR(50) DEFAULT '',
  "color_column" VARCHAR(50) DEFAULT '',
  "activa" SMALLINT DEFAULT 1,
  "modificable" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_config_columns_theacher_school_id" ON "config_columns_theacher" ("school_id");
ALTER TABLE "config_columns_theacher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "config_columns_theacher" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_config_columns_theacher" ON "config_columns_theacher";
CREATE POLICY "tenant_isolation_config_columns_theacher" ON "config_columns_theacher" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "config_columns_theacher" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "config_const_cert" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" SMALLINT NOT NULL,
  "header1" TEXT DEFAULT '',
  "header2" TEXT DEFAULT '',
  "body" TEXT DEFAULT '',
  "expedition" TEXT DEFAULT '',
  "message" TEXT DEFAULT '',
  "resolution" TEXT DEFAULT '',
  "rector_firm" SMALLINT DEFAULT 0,
  "signature_secretary" SMALLINT DEFAULT 0,
  "show_number" SMALLINT DEFAULT 0,
  "show_number_message" VARCHAR(150) DEFAULT 'CONSTANCIA Nº.',
  "type" SMALLINT DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_config_const_cert_school_id" ON "config_const_cert" ("school_id");
ALTER TABLE "config_const_cert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "config_const_cert" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_config_const_cert" ON "config_const_cert";
CREATE POLICY "tenant_isolation_config_const_cert" ON "config_const_cert" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "config_const_cert" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "config_const_cert_end" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" SMALLINT NOT NULL,
  "header1" TEXT DEFAULT '',
  "header2" TEXT DEFAULT '',
  "body" TEXT DEFAULT '',
  "expedition" TEXT DEFAULT '',
  "message" TEXT DEFAULT '',
  "resolution" TEXT DEFAULT '',
  "rector_firm" SMALLINT DEFAULT 0,
  "signature_secretary" SMALLINT DEFAULT 0,
  "show_number" SMALLINT DEFAULT 0,
  "show_number_message" VARCHAR(120) DEFAULT 'CONSTANCIA Nº',
  "year_from" SMALLINT,
  "year_until" SMALLINT,
  "type" SMALLINT DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_config_const_cert_end_school_id" ON "config_const_cert_end" ("school_id");
ALTER TABLE "config_const_cert_end" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "config_const_cert_end" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_config_const_cert_end" ON "config_const_cert_end";
CREATE POLICY "tenant_isolation_config_const_cert_end" ON "config_const_cert_end" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "config_const_cert_end" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "config_matricula_enlinea" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "año" SMALLINT DEFAULT 2018,
  "fecha_ciere" DATE,
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_config_matricula_enlinea_school_id" ON "config_matricula_enlinea" ("school_id");
ALTER TABLE "config_matricula_enlinea" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "config_matricula_enlinea" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_config_matricula_enlinea" ON "config_matricula_enlinea";
CREATE POLICY "tenant_isolation_config_matricula_enlinea" ON "config_matricula_enlinea" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "config_matricula_enlinea" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cong_metod" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "cons_sede" VARCHAR(14),
  "id_metod" INTEGER
);
CREATE INDEX IF NOT EXISTS "idx_cong_metod_school_id" ON "cong_metod" ("school_id");
ALTER TABLE "cong_metod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cong_metod" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cong_metod" ON "cong_metod";
CREATE POLICY "tenant_isolation_cong_metod" ON "cong_metod" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cong_metod" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "consolidado" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "periodo" VARCHAR(1) NOT NULL,
  "id_matric" INTEGER NOT NULL,
  "ar1" INTEGER DEFAULT 0,
  "nar1" NUMERIC(6,2) DEFAULT 0.00,
  "ar2" INTEGER DEFAULT 0,
  "nar2" NUMERIC(6,2) DEFAULT 0.00,
  "ar3" INTEGER DEFAULT 0,
  "nar3" NUMERIC(6,2) DEFAULT 0.00,
  "ar4" INTEGER DEFAULT 0,
  "nar4" NUMERIC(6,2) DEFAULT 0.00,
  "ar5" INTEGER DEFAULT 0,
  "nar5" NUMERIC(6,2) DEFAULT 0.00,
  "ar6" INTEGER DEFAULT 0,
  "nar6" NUMERIC(6,2) DEFAULT 0.00,
  "ar7" INTEGER DEFAULT 0,
  "nar7" NUMERIC(6,2) DEFAULT 0.00,
  "ar8" INTEGER DEFAULT 0,
  "nar8" NUMERIC(6,2) DEFAULT 0.00,
  "ar9" INTEGER DEFAULT 0,
  "nar9" NUMERIC(6,2) DEFAULT 0.00,
  "ar10" INTEGER DEFAULT 0,
  "nar10" NUMERIC(6,2) DEFAULT 0.00,
  "ar11" INTEGER DEFAULT 0,
  "nar11" NUMERIC(6,2) DEFAULT 0.00,
  "ar12" INTEGER DEFAULT 0,
  "nar12" NUMERIC(6,2) DEFAULT 0.00,
  "ar13" INTEGER DEFAULT 0,
  "nar13" NUMERIC(6,2) DEFAULT 0.00,
  "ar14" INTEGER DEFAULT 0,
  "nar14" NUMERIC(6,2) DEFAULT 0.00,
  "ar15" INTEGER DEFAULT 0,
  "nar15" NUMERIC(6,2) DEFAULT 0.00,
  "ar16" INTEGER DEFAULT 0,
  "nar16" NUMERIC(6,2) DEFAULT 0.00,
  "ar17" INTEGER DEFAULT 0,
  "nar17" NUMERIC(6,2) DEFAULT 0.00,
  "ar18" INTEGER DEFAULT 0,
  "nar18" NUMERIC(6,2) DEFAULT 0.00,
  "ar19" INTEGER DEFAULT 0,
  "nar19" NUMERIC(6,2) DEFAULT 0.00,
  "ar20" INTEGER DEFAULT 0,
  "nar20" NUMERIC(6,2) DEFAULT 0.00,
  "ar21" INTEGER DEFAULT 0,
  "nar21" NUMERIC(6,2) DEFAULT 0.00,
  "ar22" INTEGER DEFAULT 0,
  "nar22" NUMERIC(6,2) DEFAULT 0.00,
  "ar23" INTEGER DEFAULT 0,
  "nar23" NUMERIC(6,2) DEFAULT 0.00,
  "ar24" INTEGER DEFAULT 0,
  "nar24" NUMERIC(6,2) DEFAULT 0.00,
  "ar25" INTEGER DEFAULT 0,
  "nar25" NUMERIC(6,2) DEFAULT 0.00,
  "prom" NUMERIC(6,2) DEFAULT 0.00,
  "t" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "periodo", "id_matric")
);
CREATE INDEX IF NOT EXISTS "idx_consolidado_school_id" ON "consolidado" ("school_id");
ALTER TABLE "consolidado" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consolidado" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_consolidado" ON "consolidado";
CREATE POLICY "tenant_isolation_consolidado" ON "consolidado" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "consolidado" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "consolidado_areas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "periodo" VARCHAR(1) NOT NULL,
  "id_matric" INTEGER NOT NULL,
  "ar1" INTEGER DEFAULT 0,
  "nar1" NUMERIC(6,2) DEFAULT 0.00,
  "ar2" INTEGER DEFAULT 0,
  "nar2" NUMERIC(6,2) DEFAULT 0.00,
  "ar3" INTEGER DEFAULT 0,
  "nar3" NUMERIC(6,2) DEFAULT 0.00,
  "ar4" INTEGER DEFAULT 0,
  "nar4" NUMERIC(6,2) DEFAULT 0.00,
  "ar5" INTEGER DEFAULT 0,
  "nar5" NUMERIC(6,2) DEFAULT 0.00,
  "ar6" INTEGER DEFAULT 0,
  "nar6" NUMERIC(6,2) DEFAULT 0.00,
  "ar7" INTEGER DEFAULT 0,
  "nar7" NUMERIC(6,2) DEFAULT 0.00,
  "ar8" INTEGER DEFAULT 0,
  "nar8" NUMERIC(6,2) DEFAULT 0.00,
  "ar9" INTEGER DEFAULT 0,
  "nar9" NUMERIC(6,2) DEFAULT 0.00,
  "ar10" INTEGER DEFAULT 0,
  "nar10" NUMERIC(6,2) DEFAULT 0.00,
  "ar11" INTEGER DEFAULT 0,
  "nar11" NUMERIC(6,2) DEFAULT 0.00,
  "ar12" INTEGER DEFAULT 0,
  "nar12" NUMERIC(6,2) DEFAULT 0.00,
  "ar13" INTEGER DEFAULT 0,
  "nar13" NUMERIC(6,2) DEFAULT 0.00,
  "ar14" INTEGER DEFAULT 0,
  "nar14" NUMERIC(6,2) DEFAULT 0.00,
  "ar15" INTEGER DEFAULT 0,
  "nar15" NUMERIC(6,2) DEFAULT 0.00,
  "ar16" INTEGER DEFAULT 0,
  "nar16" NUMERIC(6,2) DEFAULT 0.00,
  "ar17" INTEGER DEFAULT 0,
  "nar17" NUMERIC(6,2) DEFAULT 0.00,
  "ar18" INTEGER DEFAULT 0,
  "nar18" NUMERIC(6,2) DEFAULT 0.00,
  "ar19" INTEGER DEFAULT 0,
  "nar19" NUMERIC(6,2) DEFAULT 0.00,
  "ar20" INTEGER DEFAULT 0,
  "nar20" NUMERIC(6,2) DEFAULT 0.00,
  "ar21" INTEGER DEFAULT 0,
  "nar21" NUMERIC(6,2) DEFAULT 0.00,
  "ar22" INTEGER DEFAULT 0,
  "nar22" NUMERIC(6,2) DEFAULT 0.00,
  "ar23" INTEGER DEFAULT 0,
  "nar23" NUMERIC(6,2) DEFAULT 0.00,
  "ar24" INTEGER DEFAULT 0,
  "nar24" NUMERIC(6,2) DEFAULT 0.00,
  "ar25" INTEGER DEFAULT 0,
  "nar25" NUMERIC(6,2) DEFAULT 0.00,
  "prom" NUMERIC(6,2) DEFAULT 0.00,
  "t" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "periodo", "id_matric")
);
CREATE INDEX IF NOT EXISTS "idx_consolidado_areas_school_id" ON "consolidado_areas" ("school_id");
ALTER TABLE "consolidado_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consolidado_areas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_consolidado_areas" ON "consolidado_areas";
CREATE POLICY "tenant_isolation_consolidado_areas" ON "consolidado_areas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "consolidado_areas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "consolidado_areas_totales" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_sede" INTEGER NOT NULL,
  "id_jorn" INTEGER NOT NULL,
  "id_grado" INTEGER NOT NULL,
  "grupo" VARCHAR(6) NOT NULL,
  "year" SMALLINT NOT NULL,
  "periodo" VARCHAR(1) NOT NULL,
  "ar1" INTEGER DEFAULT 0,
  "ar2" INTEGER DEFAULT 0,
  "ar3" INTEGER DEFAULT 0,
  "ar4" INTEGER DEFAULT 0,
  "ar5" INTEGER DEFAULT 0,
  "ar6" INTEGER DEFAULT 0,
  "ar7" INTEGER DEFAULT 0,
  "ar8" INTEGER DEFAULT 0,
  "ar9" INTEGER DEFAULT 0,
  "ar10" INTEGER DEFAULT 0,
  "ar11" INTEGER DEFAULT 0,
  "ar12" INTEGER DEFAULT 0,
  "ar13" INTEGER DEFAULT 0,
  "ar14" INTEGER DEFAULT 0,
  "ar15" INTEGER DEFAULT 0,
  "ar16" INTEGER DEFAULT 0,
  "ar17" INTEGER DEFAULT 0,
  "ar18" INTEGER DEFAULT 0,
  "ar19" INTEGER DEFAULT 0,
  "ar20" INTEGER DEFAULT 0,
  "ar21" INTEGER DEFAULT 0,
  "ar22" INTEGER DEFAULT 0,
  "ar23" INTEGER DEFAULT 0,
  "ar24" INTEGER DEFAULT 0,
  "ar25" INTEGER DEFAULT 0,
  "t" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id_sede", "id_jorn", "id_grado", "grupo", "year", "periodo")
);
CREATE INDEX IF NOT EXISTS "idx_consolidado_areas_totales_school_id" ON "consolidado_areas_totales" ("school_id");
ALTER TABLE "consolidado_areas_totales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consolidado_areas_totales" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_consolidado_areas_totales" ON "consolidado_areas_totales";
CREATE POLICY "tenant_isolation_consolidado_areas_totales" ON "consolidado_areas_totales" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "consolidado_areas_totales" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "consolidado_docentes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_docente" INTEGER NOT NULL,
  "periodo" VARCHAR(1) NOT NULL,
  "id_matric" INTEGER NOT NULL,
  "ar1" INTEGER DEFAULT 0,
  "nar1" NUMERIC(6,2) DEFAULT 0.00,
  "ar2" INTEGER DEFAULT 0,
  "nar2" NUMERIC(6,2) DEFAULT 0.00,
  "ar3" INTEGER DEFAULT 0,
  "nar3" NUMERIC(6,2) DEFAULT 0.00,
  "ar4" INTEGER DEFAULT 0,
  "nar4" NUMERIC(6,2) DEFAULT 0.00,
  "ar5" INTEGER DEFAULT 0,
  "nar5" NUMERIC(6,2) DEFAULT 0.00,
  "ar6" INTEGER DEFAULT 0,
  "nar6" NUMERIC(6,2) DEFAULT 0.00,
  "ar7" INTEGER DEFAULT 0,
  "nar7" NUMERIC(6,2) DEFAULT 0.00,
  "ar8" INTEGER DEFAULT 0,
  "nar8" NUMERIC(6,2) DEFAULT 0.00,
  "ar9" INTEGER DEFAULT 0,
  "nar9" NUMERIC(6,2) DEFAULT 0.00,
  "ar10" INTEGER DEFAULT 0,
  "nar10" NUMERIC(6,2) DEFAULT 0.00,
  "ar11" INTEGER DEFAULT 0,
  "nar11" NUMERIC(6,2) DEFAULT 0.00,
  "ar12" INTEGER DEFAULT 0,
  "nar12" NUMERIC(6,2) DEFAULT 0.00,
  "ar13" INTEGER DEFAULT 0,
  "nar13" NUMERIC(6,2) DEFAULT 0.00,
  "ar14" INTEGER DEFAULT 0,
  "nar14" NUMERIC(6,2) DEFAULT 0.00,
  "ar15" INTEGER DEFAULT 0,
  "nar15" NUMERIC(6,2) DEFAULT 0.00,
  "ar16" INTEGER DEFAULT 0,
  "nar16" NUMERIC(6,2) DEFAULT 0.00,
  "ar17" INTEGER DEFAULT 0,
  "nar17" NUMERIC(6,2) DEFAULT 0.00,
  "ar18" INTEGER DEFAULT 0,
  "nar18" NUMERIC(6,2) DEFAULT 0.00,
  "ar19" INTEGER DEFAULT 0,
  "nar19" NUMERIC(6,2) DEFAULT 0.00,
  "ar20" INTEGER DEFAULT 0,
  "nar20" NUMERIC(6,2) DEFAULT 0.00,
  "ar21" INTEGER DEFAULT 0,
  "nar21" NUMERIC(6,2) DEFAULT 0.00,
  "ar22" INTEGER DEFAULT 0,
  "nar22" NUMERIC(6,2) DEFAULT 0.00,
  "ar23" INTEGER DEFAULT 0,
  "nar23" NUMERIC(6,2) DEFAULT 0.00,
  "ar24" INTEGER DEFAULT 0,
  "nar24" NUMERIC(6,2) DEFAULT 0.00,
  "ar25" INTEGER DEFAULT 0,
  "nar25" NUMERIC(6,2) DEFAULT 0.00,
  "prom" NUMERIC(6,2) DEFAULT 0.00,
  "t" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id_docente", "periodo", "id_matric")
);
CREATE INDEX IF NOT EXISTS "idx_consolidado_docentes_school_id" ON "consolidado_docentes" ("school_id");
ALTER TABLE "consolidado_docentes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consolidado_docentes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_consolidado_docentes" ON "consolidado_docentes";
CREATE POLICY "tenant_isolation_consolidado_docentes" ON "consolidado_docentes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "consolidado_docentes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "consolidado_totales" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_sede" INTEGER NOT NULL,
  "id_jorn" INTEGER NOT NULL,
  "id_grado" INTEGER NOT NULL,
  "grupo" VARCHAR(6) NOT NULL,
  "year" SMALLINT NOT NULL,
  "periodo" VARCHAR(1) NOT NULL,
  "ar1" INTEGER DEFAULT 0,
  "ar2" INTEGER DEFAULT 0,
  "ar3" INTEGER DEFAULT 0,
  "ar4" INTEGER DEFAULT 0,
  "ar5" INTEGER DEFAULT 0,
  "ar6" INTEGER DEFAULT 0,
  "ar7" INTEGER DEFAULT 0,
  "ar8" INTEGER DEFAULT 0,
  "ar9" INTEGER DEFAULT 0,
  "ar10" INTEGER DEFAULT 0,
  "ar11" INTEGER DEFAULT 0,
  "ar12" INTEGER DEFAULT 0,
  "ar13" INTEGER DEFAULT 0,
  "ar14" INTEGER DEFAULT 0,
  "ar15" INTEGER DEFAULT 0,
  "ar16" INTEGER DEFAULT 0,
  "ar17" INTEGER DEFAULT 0,
  "ar18" INTEGER DEFAULT 0,
  "ar19" INTEGER DEFAULT 0,
  "ar20" INTEGER DEFAULT 0,
  "ar21" INTEGER DEFAULT 0,
  "ar22" INTEGER DEFAULT 0,
  "ar23" INTEGER DEFAULT 0,
  "ar24" INTEGER DEFAULT 0,
  "ar25" INTEGER DEFAULT 0,
  "t" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id_sede", "id_jorn", "id_grado", "grupo", "year", "periodo")
);
CREATE INDEX IF NOT EXISTS "idx_consolidado_totales_school_id" ON "consolidado_totales" ("school_id");
ALTER TABLE "consolidado_totales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consolidado_totales" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_consolidado_totales" ON "consolidado_totales";
CREATE POLICY "tenant_isolation_consolidado_totales" ON "consolidado_totales" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "consolidado_totales" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cons_area_perd" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "año" INTEGER,
  "id_sede" INTEGER,
  "cod_jorn" INTEGER,
  "cod_grado" VARCHAR(2),
  "grupo" VARCHAR(2),
  "id_asig" INTEGER,
  "periodo1" INTEGER,
  "porcenta1" NUMERIC(5,2),
  "periodo2" INTEGER,
  "porcenta2" NUMERIC(5,2),
  "periodo3" INTEGER,
  "porcenta3" NUMERIC(5,2),
  "periodo4" INTEGER,
  "porcenta4" NUMERIC(5,2)
);
CREATE INDEX IF NOT EXISTS "idx_cons_area_perd_school_id" ON "cons_area_perd" ("school_id");
ALTER TABLE "cons_area_perd" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cons_area_perd" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cons_area_perd" ON "cons_area_perd";
CREATE POLICY "tenant_isolation_cons_area_perd" ON "cons_area_perd" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cons_area_perd" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cons_asig_perd" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "año" INTEGER,
  "id_sede" INTEGER,
  "cod_jorn" INTEGER,
  "cod_grado" VARCHAR(2),
  "grupo" VARCHAR(2),
  "id_asig" INTEGER,
  "periodo1" INTEGER,
  "porcenta1" NUMERIC(5,2),
  "periodo2" INTEGER,
  "porcenta2" NUMERIC(5,2),
  "periodo3" INTEGER,
  "porcenta3" NUMERIC(5,2),
  "periodo4" INTEGER,
  "porcenta4" NUMERIC(5,2)
);
CREATE INDEX IF NOT EXISTS "idx_cons_asig_perd_school_id" ON "cons_asig_perd" ("school_id");
ALTER TABLE "cons_asig_perd" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cons_asig_perd" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cons_asig_perd" ON "cons_asig_perd";
CREATE POLICY "tenant_isolation_cons_asig_perd" ON "cons_asig_perd" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cons_asig_perd" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cons_asig_perd_g" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "año" INTEGER,
  "cons_sede" VARCHAR(14),
  "cod_grado" VARCHAR(2),
  "id_asig" INTEGER,
  "periodo1" INTEGER,
  "porcenta1" NUMERIC(5,2),
  "periodo2" INTEGER,
  "porcenta2" NUMERIC(5,2),
  "periodo3" INTEGER,
  "porcenta3" NUMERIC(5,2),
  "periodo4" INTEGER,
  "porcenta4" NUMERIC(5,2)
);
CREATE INDEX IF NOT EXISTS "idx_cons_asig_perd_g_school_id" ON "cons_asig_perd_g" ("school_id");
ALTER TABLE "cons_asig_perd_g" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cons_asig_perd_g" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cons_asig_perd_g" ON "cons_asig_perd_g";
CREATE POLICY "tenant_isolation_cons_asig_perd_g" ON "cons_asig_perd_g" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cons_asig_perd_g" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cons_asig_perd_s" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "año" INTEGER,
  "cons_sede" VARCHAR(14),
  "id_asig" INTEGER,
  "periodo1" INTEGER,
  "porcenta1" NUMERIC(5,2),
  "periodo2" INTEGER,
  "porcenta2" NUMERIC(5,2),
  "periodo3" INTEGER,
  "porcenta3" NUMERIC(5,2),
  "periodo4" INTEGER,
  "porcenta4" NUMERIC(5,2)
);
CREATE INDEX IF NOT EXISTS "idx_cons_asig_perd_s_school_id" ON "cons_asig_perd_s" ("school_id");
ALTER TABLE "cons_asig_perd_s" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cons_asig_perd_s" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cons_asig_perd_s" ON "cons_asig_perd_s";
CREATE POLICY "tenant_isolation_cons_asig_perd_s" ON "cons_asig_perd_s" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cons_asig_perd_s" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "conv_control_seguimiento" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_reg_sit_est" INTEGER,
  "compromiso_estudiante" TEXT,
  "compromiso_acudiente" TEXT,
  "compromiso_docente" TEXT,
  "fecha" DATE,
  "hora" VARCHAR(30),
  "fecha_acta" DATE,
  "hora_acta" VARCHAR(30),
  "estado" INTEGER DEFAULT 1,
  "tiemestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_conv_control_seguimiento_school_id" ON "conv_control_seguimiento" ("school_id");
ALTER TABLE "conv_control_seguimiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conv_control_seguimiento" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_conv_control_seguimiento" ON "conv_control_seguimiento";
CREATE POLICY "tenant_isolation_conv_control_seguimiento" ON "conv_control_seguimiento" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "conv_control_seguimiento" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cuadro_honor" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_inst" INTEGER DEFAULT 1,
  "id_matric" INTEGER,
  "periodo" VARCHAR(1) DEFAULT '',
  "nivel" INTEGER,
  "suma" NUMERIC(6,2),
  "nmax" NUMERIC(6,2),
  "nro" INTEGER DEFAULT 0,
  "type" INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_cuadro_honor_school_id" ON "cuadro_honor" ("school_id");
ALTER TABLE "cuadro_honor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cuadro_honor" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cuadro_honor" ON "cuadro_honor";
CREATE POLICY "tenant_isolation_cuadro_honor" ON "cuadro_honor" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cuadro_honor" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "cursos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_sede" INTEGER DEFAULT 1,
  "id_grado" INTEGER,
  "id_asig" INTEGER,
  "id_docente" INTEGER,
  "id_jorn" INTEGER,
  "grupo" VARCHAR(4),
  "year" SMALLINT,
  "estado" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_cursos_school_id" ON "cursos" ("school_id");
ALTER TABLE "cursos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cursos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_cursos" ON "cursos";
CREATE POLICY "tenant_isolation_cursos" ON "cursos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "cursos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "desempeños" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_pk" INTEGER NOT NULL,
  "id" SMALLINT,
  "id_grado_agrupado" INTEGER DEFAULT 1,
  "id_escala" INTEGER DEFAULT 1,
  "desde" NUMERIC(6,2) DEFAULT 0.00,
  "hasta" NUMERIC(6,2) DEFAULT 0.00,
  "year" SMALLINT DEFAULT 2002,
  "reprueba" SMALLINT DEFAULT 0,
  "calificable" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id_pk")
);
CREATE INDEX IF NOT EXISTS "idx_desempe_os_school_id" ON "desempeños" ("school_id");
ALTER TABLE "desempeños" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "desempeños" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_desempe_os" ON "desempeños";
CREATE POLICY "tenant_isolation_desempe_os" ON "desempeños" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "desempeños" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "detail_promoted" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "promoted_id" BIGINT DEFAULT 0,
  "subject_id" INTEGER,
  "final" NUMERIC(6,2) DEFAULT 0.00,
  "faults" SMALLINT DEFAULT 0,
  "tiemestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_detail_promoted_school_id" ON "detail_promoted" ("school_id");
ALTER TABLE "detail_promoted" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "detail_promoted" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_detail_promoted" ON "detail_promoted";
CREATE POLICY "tenant_isolation_detail_promoted" ON "detail_promoted" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "detail_promoted" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "dimensiones" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_inst" INTEGER NOT NULL DEFAULT 1,
  "cod_dane" VARCHAR(12),
  "COD_DIM" VARCHAR(1) NOT NULL,
  "DESC_DIM" VARCHAR(40),
  "P1" NUMERIC(6,2),
  "P2" NUMERIC(6,2),
  "P3" NUMERIC(6,2),
  "P4" NUMERIC(6,2),
  "p5" NUMERIC(6,2),
  "AÑO" INTEGER NOT NULL DEFAULT 2011,
  PRIMARY KEY ("school_id", "id_inst", "COD_DIM", "AÑO")
);
CREATE INDEX IF NOT EXISTS "idx_dimensiones_school_id" ON "dimensiones" ("school_id");
ALTER TABLE "dimensiones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dimensiones" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_dimensiones" ON "dimensiones";
CREATE POLICY "tenant_isolation_dimensiones" ON "dimensiones" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "dimensiones" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "dir_grupo" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_sede" INTEGER DEFAULT 1,
  "id_docente" INTEGER,
  "id_grado" INTEGER,
  "grupo" VARCHAR(2),
  "id_jorn" INTEGER,
  "year" SMALLINT,
  "estado" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_dir_grupo_school_id" ON "dir_grupo" ("school_id");
ALTER TABLE "dir_grupo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dir_grupo" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_dir_grupo" ON "dir_grupo";
CREATE POLICY "tenant_isolation_dir_grupo" ON "dir_grupo" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "dir_grupo" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "discapacidades" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "COD_DISC" INTEGER NOT NULL,
  "tipo" VARCHAR(70),
  PRIMARY KEY ("school_id", "COD_DISC")
);
CREATE INDEX IF NOT EXISTS "idx_discapacidades_school_id" ON "discapacidades" ("school_id");
ALTER TABLE "discapacidades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "discapacidades" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_discapacidades" ON "discapacidades";
CREATE POLICY "tenant_isolation_discapacidades" ON "discapacidades" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "discapacidades" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "docdocente" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_doc" INTEGER NOT NULL,
  "documento" VARCHAR(22),
  PRIMARY KEY ("school_id", "id_doc")
);
CREATE INDEX IF NOT EXISTS "idx_docdocente_school_id" ON "docdocente" ("school_id");
ALTER TABLE "docdocente" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "docdocente" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_docdocente" ON "docdocente";
CREATE POLICY "tenant_isolation_docdocente" ON "docdocente" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "docdocente" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "docentes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_docente" INTEGER NOT NULL,
  "id_country" INTEGER DEFAULT 45,
  "id_documento" INTEGER DEFAULT 99,
  "id_escalafon" INTEGER DEFAULT 1,
  "cod_ense" INTEGER,
  "cod_nivel" INTEGER,
  "arean_ens" INTEGER,
  "direccion" VARCHAR(100),
  "tipo_sangre" VARCHAR(5),
  "image" TEXT,
  "mime" VARCHAR(100) DEFAULT 'image/jpeg',
  "documento" VARCHAR(20),
  "fecha_nacimiento" DATE,
  "apellido1" VARCHAR(15),
  "apellido2" VARCHAR(15),
  "nombre1" VARCHAR(15),
  "nombre2" VARCHAR(15),
  "sexo" VARCHAR(1),
  "edad" INTEGER DEFAULT 0,
  "movil" VARCHAR(30),
  "fijo" VARCHAR(30),
  "mun_exp" INTEGER,
  "mun_nac" INTEGER,
  "email" VARCHAR(60) DEFAULT 'correo@correo.com',
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id_docente")
);
CREATE INDEX IF NOT EXISTS "idx_docentes_school_id" ON "docentes" ("school_id");
ALTER TABLE "docentes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "docentes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_docentes" ON "docentes";
CREATE POLICY "tenant_isolation_docentes" ON "docentes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "docentes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "documentos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(250),
  "abrev" VARCHAR(30),
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_documentos_school_id" ON "documentos" ("school_id");
ALTER TABLE "documentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documentos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_documentos" ON "documentos";
CREATE POLICY "tenant_isolation_documentos" ON "documentos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "documentos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "doc_digitales_est" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_estudiante" INTEGER,
  "nombre_doc" VARCHAR(250),
  "documento" BYTEA,
  "mime" VARCHAR(20) DEFAULT 'image/jpeg',
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_doc_digitales_est_school_id" ON "doc_digitales_est" ("school_id");
ALTER TABLE "doc_digitales_est" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "doc_digitales_est" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_doc_digitales_est" ON "doc_digitales_est";
CREATE POLICY "tenant_isolation_doc_digitales_est" ON "doc_digitales_est" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "doc_digitales_est" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "encabezado_reportes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "encabezado" TEXT,
  "dane" VARCHAR(200) DEFAULT '',
  "dni" VARCHAR(200) DEFAULT '',
  "resolucion" TEXT,
  "logo" VARCHAR(120) DEFAULT '',
  "escudo" VARCHAR(120) DEFAULT '',
  "mime" VARCHAR(120) DEFAULT 'image/jpeg',
  "mime_esc" VARCHAR(120) DEFAULT 'image/jpeg',
  "pie" TEXT DEFAULT '',
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_encabezado_reportes_school_id" ON "encabezado_reportes" ("school_id");
ALTER TABLE "encabezado_reportes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "encabezado_reportes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_encabezado_reportes" ON "encabezado_reportes";
CREATE POLICY "tenant_isolation_encabezado_reportes" ON "encabezado_reportes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "encabezado_reportes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "encargadomantemiento" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "encar_mmto" VARCHAR(1),
  "columna31" VARCHAR(25)
);
CREATE INDEX IF NOT EXISTS "idx_encargadomantemiento_school_id" ON "encargadomantemiento" ("school_id");
ALTER TABLE "encargadomantemiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "encargadomantemiento" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_encargadomantemiento" ON "encargadomantemiento";
CREATE POLICY "tenant_isolation_encargadomantemiento" ON "encargadomantemiento" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "encargadomantemiento" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "enseñanza" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "nivel" VARCHAR(35),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ense_anza_school_id" ON "enseñanza" ("school_id");
ALTER TABLE "enseñanza" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enseñanza" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ense_anza" ON "enseñanza";
CREATE POLICY "tenant_isolation_ense_anza" ON "enseñanza" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "enseñanza" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "eps" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "CODIGO" VARCHAR(12),
  "DES_EPS" VARCHAR(250) DEFAULT ' ',
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_eps_school_id" ON "eps" ("school_id");
ALTER TABLE "eps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "eps" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_eps" ON "eps";
CREATE POLICY "tenant_isolation_eps" ON "eps" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "eps" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "escalafon" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(60),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_escalafon_school_id" ON "escalafon" ("school_id");
ALTER TABLE "escalafon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "escalafon" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_escalafon" ON "escalafon";
CREATE POLICY "tenant_isolation_escalafon" ON "escalafon" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "escalafon" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "escala_nacional" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "nombre_escala" VARCHAR(120) DEFAULT 'ESCALA NACIONAL',
  "mensaje" VARCHAR(250) DEFAULT 'MENSAJE DE LA ESCALA',
  "mensaje_boletines" VARCHAR(250) DEFAULT 'MESAJE BOLETINES',
  "abrev" VARCHAR(10) DEFAULT '',
  "color" VARCHAR(50) DEFAULT '',
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_escala_nacional_school_id" ON "escala_nacional" ("school_id");
ALTER TABLE "escala_nacional" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "escala_nacional" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_escala_nacional" ON "escala_nacional";
CREATE POLICY "tenant_isolation_escala_nacional" ON "escala_nacional" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "escala_nacional" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "escudo" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_s" INTEGER NOT NULL,
  "escudo_col" BYTEA,
  PRIMARY KEY ("school_id", "id_s")
);
CREATE INDEX IF NOT EXISTS "idx_escudo_school_id" ON "escudo" ("school_id");
ALTER TABLE "escudo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "escudo" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_escudo" ON "escudo";
CREATE POLICY "tenant_isolation_escudo" ON "escudo" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "escudo" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "especialidad" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "ID" VARCHAR(2) NOT NULL,
  "ID_CARACTER" INTEGER,
  "TIPO" VARCHAR(30),
  PRIMARY KEY ("school_id", "ID")
);
CREATE INDEX IF NOT EXISTS "idx_especialidad_school_id" ON "especialidad" ("school_id");
ALTER TABLE "especialidad" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "especialidad" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_especialidad" ON "especialidad";
CREATE POLICY "tenant_isolation_especialidad" ON "especialidad" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "especialidad" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "estadistica_edades" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_sede" INTEGER,
  "id_grado" INTEGER,
  "grupo" VARCHAR(2),
  "id_jorn" INTEGER,
  "id_sexo" SMALLINT DEFAULT 0,
  "year" SMALLINT DEFAULT 0,
  "e1" INTEGER,
  "e2" INTEGER,
  "e3" INTEGER,
  "e4" INTEGER,
  "e5" INTEGER,
  "e6" INTEGER,
  "e7" INTEGER,
  "e8" INTEGER,
  "e9" INTEGER,
  "e10" INTEGER,
  "e11" INTEGER,
  "e12" INTEGER,
  "e13" INTEGER,
  "e14" INTEGER,
  "e15" INTEGER,
  "e16" INTEGER,
  "e17" INTEGER,
  "e18" INTEGER,
  "e19" INTEGER,
  "sf" INTEGER,
  "ss" INTEGER,
  "total" INTEGER
);
CREATE INDEX IF NOT EXISTS "idx_estadistica_edades_school_id" ON "estadistica_edades" ("school_id");
ALTER TABLE "estadistica_edades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "estadistica_edades" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_estadistica_edades" ON "estadistica_edades";
CREATE POLICY "tenant_isolation_estadistica_edades" ON "estadistica_edades" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "estadistica_edades" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "estadistica_grupo" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_sede" INTEGER,
  "id_matric" INTEGER,
  "cod_grado" INTEGER,
  "grupo" VARCHAR(2),
  "total" INTEGER,
  "id_desempeño" INTEGER,
  "periodo" VARCHAR(1),
  "year" SMALLINT DEFAULT 0,
  "porciento" NUMERIC(6,0) DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_estadistica_grupo_school_id" ON "estadistica_grupo" ("school_id");
ALTER TABLE "estadistica_grupo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "estadistica_grupo" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_estadistica_grupo" ON "estadistica_grupo";
CREATE POLICY "tenant_isolation_estadistica_grupo" ON "estadistica_grupo" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "estadistica_grupo" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "estado" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "EST_COD" INTEGER NOT NULL,
  "EST_JORNAD" VARCHAR(20),
  PRIMARY KEY ("school_id", "EST_COD")
);
CREATE INDEX IF NOT EXISTS "idx_estado_school_id" ON "estado" ("school_id");
ALTER TABLE "estado" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "estado" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_estado" ON "estado";
CREATE POLICY "tenant_isolation_estado" ON "estado" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "estado" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "estado_estudiante" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_pk" INTEGER NOT NULL,
  "id" INTEGER,
  "id_inst" INTEGER DEFAULT 1,
  "id_grupo_grados" INTEGER,
  "descripcion_estado" VARCHAR(250),
  "prom_manual" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id_pk")
);
CREATE INDEX IF NOT EXISTS "idx_estado_estudiante_school_id" ON "estado_estudiante" ("school_id");
ALTER TABLE "estado_estudiante" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "estado_estudiante" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_estado_estudiante" ON "estado_estudiante";
CREATE POLICY "tenant_isolation_estado_estudiante" ON "estado_estudiante" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "estado_estudiante" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "etnias" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "codigo" VARCHAR(6),
  "nombre_etnia" VARCHAR(200),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_etnias_school_id" ON "etnias" ("school_id");
ALTER TABLE "etnias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "etnias" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_etnias" ON "etnias";
CREATE POLICY "tenant_isolation_etnias" ON "etnias" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "etnias" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "etnoeduc" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(20),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_etnoeduc_school_id" ON "etnoeduc" ("school_id");
ALTER TABLE "etnoeduc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "etnoeduc" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_etnoeduc" ON "etnoeduc";
CREATE POLICY "tenant_isolation_etnoeduc" ON "etnoeduc" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "etnoeduc" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "extra_inscripciones" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inscripcion" INTEGER,
  "id_eps" INTEGER DEFAULT 0,
  "id_etnia" INTEGER DEFAULT 1,
  "id_resgua" INTEGER DEFAULT 1,
  "id_discapacidad" INTEGER DEFAULT 99,
  "id_cap_exc" INTEGER DEFAULT 99,
  "id_pob_vic_conf" INTEGER DEFAULT 9,
  "ben_her_nan" INTEGER DEFAULT 0,
  "ben_vet_fp" INTEGER DEFAULT 0,
  "ben_mad_flia" INTEGER DEFAULT 0,
  "cab_familia" INTEGER DEFAULT 0,
  "proviene_otro_mun" VARCHAR(2) DEFAULT 'No',
  "proviene_sector_priv" VARCHAR(2) DEFAULT 'No',
  "sisben" VARCHAR(12) DEFAULT '9 No Aplica',
  "nro_sisben" VARCHAR(20) DEFAULT '0',
  "puntaje_sisben" NUMERIC(6,2) DEFAULT 0.00,
  "cod_flia_accion" VARCHAR(20),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_extra_inscripciones_school_id" ON "extra_inscripciones" ("school_id");
ALTER TABLE "extra_inscripciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "extra_inscripciones" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_extra_inscripciones" ON "extra_inscripciones";
CREATE POLICY "tenant_isolation_extra_inscripciones" ON "extra_inscripciones" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "extra_inscripciones" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "families" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_country" INTEGER DEFAULT 45,
  "id_document" INTEGER,
  "id_sex" INTEGER DEFAULT 0,
  "document" VARCHAR(30),
  "expedition_plane" INTEGER,
  "birth_place" INTEGER,
  "lastname1" VARCHAR(30),
  "lastname2" VARCHAR(30) DEFAULT '',
  "name1" VARCHAR(30),
  "name2" VARCHAR(30) DEFAULT '',
  "blood_type" VARCHAR(4) DEFAULT '',
  "address" VARCHAR(250) DEFAULT 'Desconocida',
  "mobile" VARCHAR(45) DEFAULT '0000000000',
  "occupation" VARCHAR(120) DEFAULT 'Desconocida',
  "work_address" VARCHAR(120) DEFAULT 'Desconocida',
  "company" VARCHAR(120) DEFAULT 'Desconocida',
  "email" VARCHAR(250) DEFAULT 'correo@correo.com',
  "image" VARCHAR(100) DEFAULT '',
  "mime" VARCHAR(50) DEFAULT 'image/jpeg',
  "active" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_families_school_id" ON "families" ("school_id");
ALTER TABLE "families" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "families" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_families" ON "families";
CREATE POLICY "tenant_isolation_families" ON "families" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "families" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "family_and_users_ids" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "family_id" BIGINT,
  "user_id" BIGINT,
  "profile" TEXT DEFAULT 'student',
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_family_and_users_ids_school_id" ON "family_and_users_ids" ("school_id");
ALTER TABLE "family_and_users_ids" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_and_users_ids" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_family_and_users_ids" ON "family_and_users_ids";
CREATE POLICY "tenant_isolation_family_and_users_ids" ON "family_and_users_ids" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "family_and_users_ids" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "family_relationships" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "name_kinship" VARCHAR(120),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_family_relationships_school_id" ON "family_relationships" ("school_id");
ALTER TABLE "family_relationships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_relationships" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_family_relationships" ON "family_relationships";
CREATE POLICY "tenant_isolation_family_relationships" ON "family_relationships" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "family_relationships" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "family_type" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "family_type_name" VARCHAR(60) DEFAULT '',
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_family_type_school_id" ON "family_type" ("school_id");
ALTER TABLE "family_type" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_type" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_family_type" ON "family_type";
CREATE POLICY "tenant_isolation_family_type" ON "family_type" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "family_type" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "firmas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "firma1" TEXT DEFAULT '_____________________________',
  "firma2" TEXT DEFAULT '_____________________________',
  "firma3" TEXT DEFAULT '_____________________________',
  "firma4" TEXT DEFAULT '_____________________________',
  "firmarector" SMALLINT DEFAULT 1,
  "firmasecre" SMALLINT DEFAULT 1,
  "firmacoor" SMALLINT DEFAULT 1,
  "firmadirgrupo" SMALLINT DEFAULT 1,
  "firma_escaneada" TEXT DEFAULT '',
  "usar_firma_escan" SMALLINT DEFAULT 1,
  "mime" VARCHAR(100) DEFAULT 'image/jpeg',
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_firmas_school_id" ON "firmas" ("school_id");
ALTER TABLE "firmas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "firmas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_firmas" ON "firmas";
CREATE POLICY "tenant_isolation_firmas" ON "firmas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "firmas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "fuenterecursos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(45),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_fuenterecursos_school_id" ON "fuenterecursos" ("school_id");
ALTER TABLE "fuenterecursos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fuenterecursos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_fuenterecursos" ON "fuenterecursos";
CREATE POLICY "tenant_isolation_fuenterecursos" ON "fuenterecursos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "fuenterecursos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "grados" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_nivel" INTEGER DEFAULT 1,
  "cod_grado" VARCHAR(2),
  "grado" VARCHAR(120),
  "uso" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_grados_school_id" ON "grados" ("school_id");
ALTER TABLE "grados" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grados" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_grados" ON "grados";
CREATE POLICY "tenant_isolation_grados" ON "grados" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "grados" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "grados_agrupados" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "nombre_grado_agrupado" VARCHAR(200),
  "fin_ciclo_escolar" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_grados_agrupados_school_id" ON "grados_agrupados" ("school_id");
ALTER TABLE "grados_agrupados" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grados_agrupados" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_grados_agrupados" ON "grados_agrupados";
CREATE POLICY "tenant_isolation_grados_agrupados" ON "grados_agrupados" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "grados_agrupados" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "grados_areas_promocion" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_area_promocion" INTEGER,
  "cod_grado" VARCHAR(2),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_grados_areas_promocion_school_id" ON "grados_areas_promocion" ("school_id");
ALTER TABLE "grados_areas_promocion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grados_areas_promocion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_grados_areas_promocion" ON "grados_areas_promocion";
CREATE POLICY "tenant_isolation_grados_areas_promocion" ON "grados_areas_promocion" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "grados_areas_promocion" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "idioma" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "COD_IDIOMA" INTEGER NOT NULL,
  "IDIOMA" VARCHAR(20),
  PRIMARY KEY ("school_id", "COD_IDIOMA")
);
CREATE INDEX IF NOT EXISTS "idx_idioma_school_id" ON "idioma" ("school_id");
ALTER TABLE "idioma" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "idioma" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_idioma" ON "idioma";
CREATE POLICY "tenant_isolation_idioma" ON "idioma" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "idioma" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "infraes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "año_inf" VARCHAR(4),
  "dpto_mun" VARCHAR(5),
  "localidad" VARCHAR(4),
  "cons_sede" VARCHAR(14),
  "dis_cabe" VARCHAR(7),
  "via_tron" VARCHAR(4),
  "via_princ" VARCHAR(4),
  "via_rio" VARCHAR(4),
  "via_carre" VARCHAR(4),
  "via_animal" VARCHAR(4),
  "via_otros" VARCHAR(200),
  "aula_infor" VARCHAR(4),
  "n_equipos" VARCHAR(4),
  "equi_red" VARCHAR(4),
  "equi_admin" VARCHAR(4),
  "equi_educa" VARCHAR(4),
  "equi_me486" VARCHAR(4),
  "equi_486" VARCHAR(4),
  "equi_ma486" VARCHAR(4),
  "energia" VARCHAR(4),
  "cod_ener" VARCHAR(1),
  "red_datos" VARCHAR(4),
  "punto_red" VARCHAR(4),
  "internet" VARCHAR(4),
  "cla_inter" VARCHAR(1),
  "ancho_band" VARCHAR(1),
  "costo_inte" NUMERIC(13,0),
  "pago_inter" VARCHAR(1),
  "dota_men1" VARCHAR(4),
  "dota_men2" VARCHAR(4),
  "dota_cpe" VARCHAR(4),
  "dota_sed" VARCHAR(4),
  "dota_otra" VARCHAR(4),
  "mmto_comp" VARCHAR(1),
  "periodo_mm" VARCHAR(1),
  "encar_mmto" VARCHAR(1),
  "acceso_com" VARCHAR(4),
  "doc_infor" VARCHAR(2),
  "ups" VARCHAR(4),
  "n_ups" VARCHAR(4),
  "videobean" VARCHAR(4),
  "n_video" VARCHAR(4),
  "dvd" VARCHAR(4),
  "n_dvd" VARCHAR(4),
  "videocam" VARCHAR(4),
  "n_videocam" VARCHAR(4),
  "tv" VARCHAR(4),
  "n_tv" VARCHAR(4),
  "vhs" VARCHAR(4),
  "n_vhs" VARCHAR(4),
  "acetato" VARCHAR(4),
  "n_acetato" VARCHAR(4),
  "bibliote" VARCHAR(4),
  "cod_mun" VARCHAR(1),
  "per_estudi" VARCHAR(4),
  "emisora" VARCHAR(4),
  "cod_alca" VARCHAR(1),
  "tipo_man" VARCHAR(1)
);
CREATE INDEX IF NOT EXISTS "idx_infraes_school_id" ON "infraes" ("school_id");
ALTER TABLE "infraes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "infraes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_infraes" ON "infraes";
CREATE POLICY "tenant_isolation_infraes" ON "infraes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "infraes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "inscripciones" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_zona" INTEGER,
  "id_documento" INTEGER DEFAULT 99,
  "id_sexo" INTEGER DEFAULT 0,
  "id_country" INTEGER DEFAULT 45,
  "id_year" VARCHAR(50),
  "nro_documento" VARCHAR(20),
  "lug_nacimiento" INTEGER,
  "lug_residencia" INTEGER,
  "lug_expedicion" INTEGER,
  "apellido1" VARCHAR(30),
  "apellido2" VARCHAR(30),
  "nombre1" VARCHAR(30),
  "nombre2" VARCHAR(30),
  "tipo_sangre" VARCHAR(3),
  "foto" VARCHAR(250),
  "mime" VARCHAR(100) DEFAULT 'image/jpeg',
  "fecha_ingreso" DATE,
  "fecha_nacimiento" DATE,
  "edad" INTEGER DEFAULT 0,
  "estrato" VARCHAR(1) DEFAULT '0',
  "direccion" VARCHAR(250),
  "localidad" VARCHAR(250),
  "telefono" VARCHAR(30),
  "movil" VARCHAR(30),
  "ips" VARCHAR(200),
  "email" VARCHAR(250),
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_inscripciones_school_id" ON "inscripciones" ("school_id");
ALTER TABLE "inscripciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inscripciones" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_inscripciones" ON "inscripciones";
CREATE POLICY "tenant_isolation_inscripciones" ON "inscripciones" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "inscripciones" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "inscripciones_copy" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_zona" INTEGER,
  "id_eps" INTEGER DEFAULT 1,
  "foto" TEXT,
  "mime" VARCHAR(100) DEFAULT 'image/jpeg',
  "cap_exc" INTEGER DEFAULT 99,
  "proviene_otro_mun" VARCHAR(2) DEFAULT 'No',
  "proviene_sector_priv" VARCHAR(2) DEFAULT 'No',
  "pob_vict_conf" VARCHAR(1) DEFAULT '9',
  "cod_etnia" VARCHAR(3) DEFAULT '000',
  "cod_resgua" VARCHAR(3) DEFAULT '000',
  "cod_doc" INTEGER DEFAULT 5,
  "nro_doc_id" VARCHAR(20) DEFAULT '0000000000',
  "mun_lug_pobl" INTEGER,
  "mun_lug_nac" INTEGER,
  "mun_lug_res" INTEGER,
  "mun_lug_exp" INTEGER,
  "apellido1" VARCHAR(30),
  "apellido2" VARCHAR(30),
  "nombre1" VARCHAR(30),
  "nombre2" VARCHAR(30),
  "tipo_sangre" VARCHAR(3),
  "fecha_ingreso" DATE,
  "fecha_nacimiento" DATE,
  "edad" INTEGER DEFAULT 0,
  "sexo" VARCHAR(1) DEFAULT 'x',
  "estrato" VARCHAR(1) DEFAULT '0',
  "sisben" VARCHAR(12) DEFAULT '9 No aplica',
  "nro_sisben" VARCHAR(20) DEFAULT '0',
  "puntaje_sisben" NUMERIC(5,2) DEFAULT 0.00,
  "direccion" VARCHAR(200) DEFAULT 'Desconocida',
  "telefono" VARCHAR(12) DEFAULT '0000000000',
  "IPS" VARCHAR(200) DEFAULT 'Ninguna',
  "tipo_discapacidad" VARCHAR(2) DEFAULT '99',
  "e_mail" VARCHAR(160) DEFAULT 'correo@correo.com',
  "id_year" VARCHAR(20) DEFAULT '0000000-0000',
  "cod_flia_accion" VARCHAR(20) DEFAULT '0',
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_inscripciones_copy_school_id" ON "inscripciones_copy" ("school_id");
ALTER TABLE "inscripciones_copy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inscripciones_copy" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_inscripciones_copy" ON "inscripciones_copy";
CREATE POLICY "tenant_isolation_inscripciones_copy" ON "inscripciones_copy" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "inscripciones_copy" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "jornadas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "cod_jorn" INTEGER NOT NULL,
  "jornada" VARCHAR(120),
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "cod_jorn")
);
CREATE INDEX IF NOT EXISTS "idx_jornadas_school_id" ON "jornadas" ("school_id");
ALTER TABLE "jornadas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "jornadas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_jornadas" ON "jornadas";
CREATE POLICY "tenant_isolation_jornadas" ON "jornadas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "jornadas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "jornadas_sedes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_sede" INTEGER,
  "id_jornada" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_jornadas_sedes_school_id" ON "jornadas_sedes" ("school_id");
ALTER TABLE "jornadas_sedes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "jornadas_sedes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_jornadas_sedes" ON "jornadas_sedes";
CREATE POLICY "tenant_isolation_jornadas_sedes" ON "jornadas_sedes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "jornadas_sedes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "logros_estandares" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_asig" INTEGER,
  "id_docente" INTEGER,
  "id_escala" INTEGER DEFAULT 0,
  "id_grado" INTEGER,
  "id_competencia" INTEGER DEFAULT 0,
  "consecutivo" INTEGER DEFAULT 0,
  "descripcion" TEXT,
  "year" SMALLINT DEFAULT 2000,
  "periodo" VARCHAR(1),
  "estado" INTEGER DEFAULT 1,
  "asignacion" INTEGER DEFAULT 0,
  "tipo" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_logros_estandares_school_id" ON "logros_estandares" ("school_id");
ALTER TABLE "logros_estandares" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "logros_estandares" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_logros_estandares" ON "logros_estandares";
CREATE POLICY "tenant_isolation_logros_estandares" ON "logros_estandares" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "logros_estandares" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "log_nscp00" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nota" INTEGER NOT NULL,
  "id_logro_estandar" INTEGER NOT NULL,
  PRIMARY KEY ("school_id", "id_nota", "id_logro_estandar")
);
CREATE INDEX IF NOT EXISTS "idx_log_nscp00_school_id" ON "log_nscp00" ("school_id");
ALTER TABLE "log_nscp00" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "log_nscp00" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_log_nscp00" ON "log_nscp00";
CREATE POLICY "tenant_isolation_log_nscp00" ON "log_nscp00" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "log_nscp00" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "log_nscp001" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nota" INTEGER NOT NULL,
  "id_logro_estandar" INTEGER NOT NULL,
  PRIMARY KEY ("school_id", "id_nota", "id_logro_estandar")
);
CREATE INDEX IF NOT EXISTS "idx_log_nscp001_school_id" ON "log_nscp001" ("school_id");
ALTER TABLE "log_nscp001" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "log_nscp001" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_log_nscp001" ON "log_nscp001";
CREATE POLICY "tenant_isolation_log_nscp001" ON "log_nscp001" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "log_nscp001" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "log_nscp002" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nota" INTEGER NOT NULL,
  "id_logro_estandar" INTEGER NOT NULL,
  PRIMARY KEY ("school_id", "id_nota", "id_logro_estandar")
);
CREATE INDEX IF NOT EXISTS "idx_log_nscp002_school_id" ON "log_nscp002" ("school_id");
ALTER TABLE "log_nscp002" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "log_nscp002" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_log_nscp002" ON "log_nscp002";
CREATE POLICY "tenant_isolation_log_nscp002" ON "log_nscp002" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "log_nscp002" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "log_nscp003" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nota" INTEGER NOT NULL,
  "id_logro_estandar" INTEGER NOT NULL,
  PRIMARY KEY ("school_id", "id_nota", "id_logro_estandar")
);
CREATE INDEX IF NOT EXISTS "idx_log_nscp003_school_id" ON "log_nscp003" ("school_id");
ALTER TABLE "log_nscp003" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "log_nscp003" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_log_nscp003" ON "log_nscp003";
CREATE POLICY "tenant_isolation_log_nscp003" ON "log_nscp003" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "log_nscp003" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "mantenimiento" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "tipo_man" VARCHAR(1),
  "columna3" VARCHAR(23)
);
CREATE INDEX IF NOT EXISTS "idx_mantenimiento_school_id" ON "mantenimiento" ("school_id");
ALTER TABLE "mantenimiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mantenimiento" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_mantenimiento" ON "mantenimiento";
CREATE POLICY "tenant_isolation_mantenimiento" ON "mantenimiento" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "mantenimiento" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "matcurso" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_grado" INTEGER,
  "id_asig" INTEGER,
  "ih" NUMERIC(4,1) DEFAULT 1.0,
  "year" SMALLINT DEFAULT 2002,
  "porciento" NUMERIC(6,2) DEFAULT 100.00,
  "proc1" NUMERIC(6,2) DEFAULT 0.00,
  "proc2" NUMERIC(6,2) DEFAULT 0.00,
  "proc3" NUMERIC(6,2) DEFAULT 0.00,
  "proc4" NUMERIC(10,0) DEFAULT 0,
  "estado" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_matcurso_school_id" ON "matcurso" ("school_id");
ALTER TABLE "matcurso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "matcurso" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_matcurso" ON "matcurso";
CREATE POLICY "tenant_isolation_matcurso" ON "matcurso" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "matcurso" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "metodologias" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "metodologia" VARCHAR(200),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_metodologias_school_id" ON "metodologias" ("school_id");
ALTER TABLE "metodologias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "metodologias" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_metodologias" ON "metodologias";
CREATE POLICY "tenant_isolation_metodologias" ON "metodologias" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "metodologias" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "mom_formato_esquema" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "enrollment_id" INTEGER,
  "teacher_id" INTEGER,
  "periodo" VARCHAR(2) DEFAULT '',
  "obs" TEXT DEFAULT '',
  "pv" SMALLINT DEFAULT 0,
  "tv" SMALLINT DEFAULT 0,
  "gw" SMALLINT DEFAULT 0,
  "gf" SMALLINT DEFAULT 0,
  "otro" SMALLINT DEFAULT 0,
  "ee" SMALLINT DEFAULT 0,
  "inter" SMALLINT DEFAULT 0,
  "tv2" SMALLINT DEFAULT 0,
  "dc" SMALLINT DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_mom_formato_esquema_school_id" ON "mom_formato_esquema" ("school_id");
ALTER TABLE "mom_formato_esquema" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mom_formato_esquema" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_mom_formato_esquema" ON "mom_formato_esquema";
CREATE POLICY "tenant_isolation_mom_formato_esquema" ON "mom_formato_esquema" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "mom_formato_esquema" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "mom_formato_evaluacion" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "enrollment_id" INTEGER,
  "teacher_id" INTEGER,
  "periodo" VARCHAR(2) DEFAULT '',
  "obs" TEXT DEFAULT '',
  "pv" SMALLINT DEFAULT 0,
  "tv" SMALLINT DEFAULT 0,
  "gw" SMALLINT DEFAULT 0,
  "gf" SMALLINT DEFAULT 0,
  "otro" SMALLINT DEFAULT 0,
  "ee" SMALLINT DEFAULT 0,
  "inter" SMALLINT DEFAULT 0,
  "tv2" SMALLINT DEFAULT 0,
  "dc" SMALLINT DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_mom_formato_evaluacion_school_id" ON "mom_formato_evaluacion" ("school_id");
ALTER TABLE "mom_formato_evaluacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mom_formato_evaluacion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_mom_formato_evaluacion" ON "mom_formato_evaluacion";
CREATE POLICY "tenant_isolation_mom_formato_evaluacion" ON "mom_formato_evaluacion" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "mom_formato_evaluacion" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "mom_formato_planilla" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "enrollment_id" INTEGER,
  "teacher_id" INTEGER,
  "periodo" VARCHAR(2) DEFAULT '',
  "obs" TEXT DEFAULT '',
  "pv" SMALLINT DEFAULT 0,
  "tv" SMALLINT DEFAULT 0,
  "gw" SMALLINT DEFAULT 0,
  "gf" SMALLINT DEFAULT 0,
  "otro" SMALLINT DEFAULT 0,
  "ee" SMALLINT DEFAULT 0,
  "inter" SMALLINT DEFAULT 0,
  "tv2" SMALLINT DEFAULT 0,
  "dc" SMALLINT DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_mom_formato_planilla_school_id" ON "mom_formato_planilla" ("school_id");
ALTER TABLE "mom_formato_planilla" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mom_formato_planilla" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_mom_formato_planilla" ON "mom_formato_planilla";
CREATE POLICY "tenant_isolation_mom_formato_planilla" ON "mom_formato_planilla" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "mom_formato_planilla" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "niveles" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nivel" INTEGER NOT NULL,
  "nivel_nom" VARCHAR(42),
  PRIMARY KEY ("school_id", "id_nivel")
);
CREATE INDEX IF NOT EXISTS "idx_niveles_school_id" ON "niveles" ("school_id");
ALTER TABLE "niveles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "niveles" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_niveles" ON "niveles";
CREATE POLICY "tenant_isolation_niveles" ON "niveles" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "niveles" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "niveles_estudio" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "nombre_nivel" VARCHAR(120),
  "abrev" VARCHAR(12) DEFAULT '',
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_niveles_estudio_school_id" ON "niveles_estudio" ("school_id");
ALTER TABLE "niveles_estudio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "niveles_estudio" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_niveles_estudio" ON "niveles_estudio";
CREATE POLICY "tenant_isolation_niveles_estudio" ON "niveles_estudio" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "niveles_estudio" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "niveles_sedes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_sede" INTEGER,
  "id_nivel" INTEGER,
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_niveles_sedes_school_id" ON "niveles_sedes" ("school_id");
ALTER TABLE "niveles_sedes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "niveles_sedes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_niveles_sedes" ON "niveles_sedes";
CREATE POLICY "tenant_isolation_niveles_sedes" ON "niveles_sedes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "niveles_sedes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nivel_gerarquico" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(45),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nivel_gerarquico_school_id" ON "nivel_gerarquico" ("school_id");
ALTER TABLE "nivel_gerarquico" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nivel_gerarquico" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nivel_gerarquico" ON "nivel_gerarquico";
CREATE POLICY "tenant_isolation_nivel_gerarquico" ON "nivel_gerarquico" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nivel_gerarquico" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nivel_jerarquico" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "nombre_nivel" VARCHAR(60),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nivel_jerarquico_school_id" ON "nivel_jerarquico" ("school_id");
ALTER TABLE "nivel_jerarquico" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nivel_jerarquico" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nivel_jerarquico" ON "nivel_jerarquico";
CREATE POLICY "tenant_isolation_nivel_jerarquico" ON "nivel_jerarquico" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nivel_jerarquico" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nomcargo" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nomb" INTEGER NOT NULL,
  "nom_cargo" VARCHAR(36),
  "cod_car" INTEGER,
  PRIMARY KEY ("school_id", "id_nomb")
);
CREATE INDEX IF NOT EXISTS "idx_nomcargo_school_id" ON "nomcargo" ("school_id");
ALTER TABLE "nomcargo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nomcargo" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nomcargo" ON "nomcargo";
CREATE POLICY "tenant_isolation_nomcargo" ON "nomcargo" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nomcargo" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "novedades" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "COD_NOV" INTEGER,
  "NOV_INST" VARCHAR(80)
);
CREATE INDEX IF NOT EXISTS "idx_novedades_school_id" ON "novedades" ("school_id");
ALTER TABLE "novedades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "novedades" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_novedades" ON "novedades";
CREATE POLICY "tenant_isolation_novedades" ON "novedades" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "novedades" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nov_inst" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "COD_NOV" INTEGER,
  "NOV_INST" VARCHAR(80)
);
CREATE INDEX IF NOT EXISTS "idx_nov_inst_school_id" ON "nov_inst" ("school_id");
ALTER TABLE "nov_inst" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nov_inst" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nov_inst" ON "nov_inst";
CREATE POLICY "tenant_isolation_nov_inst" ON "nov_inst" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nov_inst" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nscp00" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER DEFAULT 0,
  "id_matric" INTEGER,
  "id_escala" INTEGER DEFAULT 0,
  "periodo" VARCHAR(2),
  "year" SMALLINT DEFAULT 2002,
  "n1" NUMERIC(6,2) DEFAULT 0.00,
  "n2" NUMERIC(6,2) DEFAULT 0.00,
  "n3" NUMERIC(6,2) DEFAULT 0.00,
  "n4" NUMERIC(6,2) DEFAULT 0.00,
  "n5" NUMERIC(6,2) DEFAULT 0.00,
  "n6" NUMERIC(6,2) DEFAULT 0.00,
  "n7" NUMERIC(6,2) DEFAULT 0.00,
  "n8" NUMERIC(6,2) DEFAULT 0.00,
  "n9" NUMERIC(6,2) DEFAULT 0.00,
  "n10" NUMERIC(6,2) DEFAULT 0.00,
  "n11" NUMERIC(6,2) DEFAULT 0.00,
  "n12" NUMERIC(6,2) DEFAULT 0.00,
  "n13" NUMERIC(6,2) DEFAULT 0.00,
  "n14" NUMERIC(6,2) DEFAULT 0.00,
  "n15" NUMERIC(6,2) DEFAULT 0.00,
  "n16" NUMERIC(6,2) DEFAULT 0.00,
  "n17" NUMERIC(6,2) DEFAULT 0.00,
  "n18" NUMERIC(6,2) DEFAULT 0.00,
  "n19" NUMERIC(6,2) DEFAULT 0.00,
  "n20" NUMERIC(6,2) DEFAULT 0.00,
  "n21" NUMERIC(6,2) DEFAULT 0.00,
  "n22" NUMERIC(6,2) DEFAULT 0.00,
  "n23" NUMERIC(6,2) DEFAULT 0.00,
  "n24" NUMERIC(6,2) DEFAULT 0.00,
  "n25" NUMERIC(6,2) DEFAULT 0.00,
  "n26" NUMERIC(6,2) DEFAULT 0.00,
  "n27" NUMERIC(6,2) DEFAULT 0.00,
  "n28" NUMERIC(6,2) DEFAULT 0.00,
  "n29" NUMERIC(6,2) DEFAULT 0.00,
  "n30" NUMERIC(6,2) DEFAULT 0.00,
  "final" NUMERIC(6,2) DEFAULT 0.00,
  "faltas" NUMERIC(3,0) DEFAULT 0,
  "injustificadas" SMALLINT DEFAULT 0,
  "retraso" SMALLINT DEFAULT 0,
  "nota_perdida" NUMERIC(6,2) DEFAULT 0.00,
  "nota_habilitacion" NUMERIC(6,2) DEFAULT 0.00,
  "nivelacion" SMALLINT DEFAULT 0,
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nscp00_school_id" ON "nscp00" ("school_id");
ALTER TABLE "nscp00" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nscp00" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nscp00" ON "nscp00";
CREATE POLICY "tenant_isolation_nscp00" ON "nscp00" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nscp00" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nscp001" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER DEFAULT 0,
  "id_matric" INTEGER,
  "id_escala" INTEGER DEFAULT 0,
  "periodo" VARCHAR(2),
  "year" SMALLINT DEFAULT 2002,
  "n1" NUMERIC(6,2) DEFAULT 0.00,
  "n2" NUMERIC(6,2) DEFAULT 0.00,
  "n3" NUMERIC(6,2) DEFAULT 0.00,
  "n4" NUMERIC(6,2) DEFAULT 0.00,
  "n5" NUMERIC(6,2) DEFAULT 0.00,
  "n6" NUMERIC(6,2) DEFAULT 0.00,
  "n7" NUMERIC(6,2) DEFAULT 0.00,
  "n8" NUMERIC(6,2) DEFAULT 0.00,
  "n9" NUMERIC(6,2) DEFAULT 0.00,
  "n10" NUMERIC(6,2) DEFAULT 0.00,
  "n11" NUMERIC(6,2) DEFAULT 0.00,
  "n12" NUMERIC(6,2) DEFAULT 0.00,
  "n13" NUMERIC(6,2) DEFAULT 0.00,
  "n14" NUMERIC(6,2) DEFAULT 0.00,
  "n15" NUMERIC(6,2) DEFAULT 0.00,
  "n16" NUMERIC(6,2) DEFAULT 0.00,
  "n17" NUMERIC(6,2) DEFAULT 0.00,
  "n18" NUMERIC(6,2) DEFAULT 0.00,
  "n19" NUMERIC(6,2) DEFAULT 0.00,
  "n20" NUMERIC(6,2) DEFAULT 0.00,
  "n21" NUMERIC(6,2) DEFAULT 0.00,
  "n22" NUMERIC(6,2) DEFAULT 0.00,
  "n23" NUMERIC(6,2) DEFAULT 0.00,
  "n24" NUMERIC(6,2) DEFAULT 0.00,
  "n25" NUMERIC(6,2) DEFAULT 0.00,
  "n26" NUMERIC(6,2) DEFAULT 0.00,
  "n27" NUMERIC(6,2) DEFAULT 0.00,
  "n28" NUMERIC(6,2) DEFAULT 0.00,
  "n29" NUMERIC(6,2) DEFAULT 0.00,
  "n30" NUMERIC(6,2) DEFAULT 0.00,
  "final" NUMERIC(6,2) DEFAULT 0.00,
  "faltas" NUMERIC(3,0) DEFAULT 0,
  "injustificadas" SMALLINT DEFAULT 0,
  "retraso" SMALLINT DEFAULT 0,
  "nota_perdida" NUMERIC(6,2) DEFAULT 0.00,
  "nota_habilitacion" NUMERIC(6,2) DEFAULT 0.00,
  "nivelacion" SMALLINT DEFAULT 0,
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nscp001_school_id" ON "nscp001" ("school_id");
ALTER TABLE "nscp001" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nscp001" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nscp001" ON "nscp001";
CREATE POLICY "tenant_isolation_nscp001" ON "nscp001" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nscp001" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nscp001_promedio_notas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER,
  "id_matric" INTEGER,
  "prom" NUMERIC(6,2) DEFAULT 0.00,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nscp001_promedio_notas_school_id" ON "nscp001_promedio_notas" ("school_id");
ALTER TABLE "nscp001_promedio_notas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nscp001_promedio_notas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nscp001_promedio_notas" ON "nscp001_promedio_notas";
CREATE POLICY "tenant_isolation_nscp001_promedio_notas" ON "nscp001_promedio_notas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nscp001_promedio_notas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nscp002" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER DEFAULT 0,
  "id_matric" INTEGER,
  "id_escala" INTEGER DEFAULT 0,
  "periodo" VARCHAR(2),
  "year" SMALLINT DEFAULT 2002,
  "n1" NUMERIC(6,2) DEFAULT 0.00,
  "n2" NUMERIC(6,2) DEFAULT 0.00,
  "n3" NUMERIC(6,2) DEFAULT 0.00,
  "n4" NUMERIC(6,2) DEFAULT 0.00,
  "n5" NUMERIC(6,2) DEFAULT 0.00,
  "n6" NUMERIC(6,2) DEFAULT 0.00,
  "n7" NUMERIC(6,2) DEFAULT 0.00,
  "n8" NUMERIC(6,2) DEFAULT 0.00,
  "n9" NUMERIC(6,2) DEFAULT 0.00,
  "n10" NUMERIC(6,2) DEFAULT 0.00,
  "n11" NUMERIC(6,2) DEFAULT 0.00,
  "n12" NUMERIC(6,2) DEFAULT 0.00,
  "n13" NUMERIC(6,2) DEFAULT 0.00,
  "n14" NUMERIC(6,2) DEFAULT 0.00,
  "n15" NUMERIC(6,2) DEFAULT 0.00,
  "n16" NUMERIC(6,2) DEFAULT 0.00,
  "n17" NUMERIC(6,2) DEFAULT 0.00,
  "n18" NUMERIC(6,2) DEFAULT 0.00,
  "n19" NUMERIC(6,2) DEFAULT 0.00,
  "n20" NUMERIC(6,2) DEFAULT 0.00,
  "n21" NUMERIC(6,2) DEFAULT 0.00,
  "n22" NUMERIC(6,2) DEFAULT 0.00,
  "n23" NUMERIC(6,2) DEFAULT 0.00,
  "n24" NUMERIC(6,2) DEFAULT 0.00,
  "n25" NUMERIC(6,2) DEFAULT 0.00,
  "n26" NUMERIC(6,2) DEFAULT 0.00,
  "n27" NUMERIC(6,2) DEFAULT 0.00,
  "n28" NUMERIC(6,2) DEFAULT 0.00,
  "n29" NUMERIC(6,2) DEFAULT 0.00,
  "n30" NUMERIC(6,2) DEFAULT 0.00,
  "final" NUMERIC(6,2) DEFAULT 0.00,
  "faltas" NUMERIC(3,0) DEFAULT 0,
  "injustificadas" SMALLINT DEFAULT 0,
  "retraso" SMALLINT DEFAULT 0,
  "nota_perdida" NUMERIC(6,2) DEFAULT 0.00,
  "nota_habilitacion" NUMERIC(6,2) DEFAULT 0.00,
  "nivelacion" SMALLINT DEFAULT 0,
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nscp002_school_id" ON "nscp002" ("school_id");
ALTER TABLE "nscp002" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nscp002" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nscp002" ON "nscp002";
CREATE POLICY "tenant_isolation_nscp002" ON "nscp002" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nscp002" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nscp002_promedio_notas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER,
  "id_matric" INTEGER,
  "prom" NUMERIC(6,2) DEFAULT 0.00,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nscp002_promedio_notas_school_id" ON "nscp002_promedio_notas" ("school_id");
ALTER TABLE "nscp002_promedio_notas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nscp002_promedio_notas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nscp002_promedio_notas" ON "nscp002_promedio_notas";
CREATE POLICY "tenant_isolation_nscp002_promedio_notas" ON "nscp002_promedio_notas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nscp002_promedio_notas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nscp003" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER DEFAULT 0,
  "id_matric" INTEGER,
  "id_escala" INTEGER DEFAULT 0,
  "periodo" VARCHAR(2),
  "year" SMALLINT DEFAULT 2002,
  "n1" NUMERIC(6,2) DEFAULT 0.00,
  "n2" NUMERIC(6,2) DEFAULT 0.00,
  "n3" NUMERIC(6,2) DEFAULT 0.00,
  "n4" NUMERIC(6,2) DEFAULT 0.00,
  "n5" NUMERIC(6,2) DEFAULT 0.00,
  "n6" NUMERIC(6,2) DEFAULT 0.00,
  "n7" NUMERIC(6,2) DEFAULT 0.00,
  "n8" NUMERIC(6,2) DEFAULT 0.00,
  "n9" NUMERIC(6,2) DEFAULT 0.00,
  "n10" NUMERIC(6,2) DEFAULT 0.00,
  "n11" NUMERIC(6,2) DEFAULT 0.00,
  "n12" NUMERIC(6,2) DEFAULT 0.00,
  "n13" NUMERIC(6,2) DEFAULT 0.00,
  "n14" NUMERIC(6,2) DEFAULT 0.00,
  "n15" NUMERIC(6,2) DEFAULT 0.00,
  "n16" NUMERIC(6,2) DEFAULT 0.00,
  "n17" NUMERIC(6,2) DEFAULT 0.00,
  "n18" NUMERIC(6,2) DEFAULT 0.00,
  "n19" NUMERIC(6,2) DEFAULT 0.00,
  "n20" NUMERIC(6,2) DEFAULT 0.00,
  "n21" NUMERIC(6,2) DEFAULT 0.00,
  "n22" NUMERIC(6,2) DEFAULT 0.00,
  "n23" NUMERIC(6,2) DEFAULT 0.00,
  "n24" NUMERIC(6,2) DEFAULT 0.00,
  "n25" NUMERIC(6,2) DEFAULT 0.00,
  "n26" NUMERIC(6,2) DEFAULT 0.00,
  "n27" NUMERIC(6,2) DEFAULT 0.00,
  "n28" NUMERIC(6,2) DEFAULT 0.00,
  "n29" NUMERIC(6,2) DEFAULT 0.00,
  "n30" NUMERIC(6,2) DEFAULT 0.00,
  "final" NUMERIC(6,2) DEFAULT 0.00,
  "faltas" NUMERIC(3,0) DEFAULT 0,
  "injustificadas" SMALLINT DEFAULT 0,
  "retraso" SMALLINT DEFAULT 0,
  "nota_perdida" NUMERIC(6,2) DEFAULT 0.00,
  "nota_habilitacion" NUMERIC(6,2) DEFAULT 0.00,
  "nivelacion" SMALLINT DEFAULT 0,
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nscp003_school_id" ON "nscp003" ("school_id");
ALTER TABLE "nscp003" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nscp003" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nscp003" ON "nscp003";
CREATE POLICY "tenant_isolation_nscp003" ON "nscp003" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nscp003" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nscp003_promedio_notas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER,
  "id_matric" INTEGER,
  "prom" NUMERIC(6,2) DEFAULT 0.00,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nscp003_promedio_notas_school_id" ON "nscp003_promedio_notas" ("school_id");
ALTER TABLE "nscp003_promedio_notas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nscp003_promedio_notas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nscp003_promedio_notas" ON "nscp003_promedio_notas";
CREATE POLICY "tenant_isolation_nscp003_promedio_notas" ON "nscp003_promedio_notas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nscp003_promedio_notas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nscp00_promedio_notas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER,
  "id_matric" INTEGER,
  "prom" NUMERIC(6,2) DEFAULT 0.00,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_nscp00_promedio_notas_school_id" ON "nscp00_promedio_notas" ("school_id");
ALTER TABLE "nscp00_promedio_notas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nscp00_promedio_notas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nscp00_promedio_notas" ON "nscp00_promedio_notas";
CREATE POLICY "tenant_isolation_nscp00_promedio_notas" ON "nscp00_promedio_notas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nscp00_promedio_notas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "nucleo" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "NUCLEO" VARCHAR(6) NOT NULL,
  "NOMBRE" VARCHAR(100),
  "DIRECCION" VARCHAR(100),
  "TELEFONO" VARCHAR(50),
  "DIR_NUCLEO" VARCHAR(60),
  "CC" VARCHAR(12),
  "TEL_DIRECT" VARCHAR(12),
  "FOTO" BYTEA,
  "dpto" VARCHAR(2),
  "mun" VARCHAR(3),
  PRIMARY KEY ("school_id", "NUCLEO")
);
CREATE INDEX IF NOT EXISTS "idx_nucleo_school_id" ON "nucleo" ("school_id");
ALTER TABLE "nucleo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nucleo" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_nucleo" ON "nucleo";
CREATE POLICY "tenant_isolation_nucleo" ON "nucleo" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "nucleo" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_anotaciones_mod_3" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "id_observador" INTEGER,
  "id_docente" INTEGER,
  "anotacion" TEXT DEFAULT '',
  "compromiso_est" TEXT DEFAULT '',
  "compromiso_acu" TEXT DEFAULT '',
  "compromiso_inst" TEXT DEFAULT '',
  "periodo" VARCHAR(1) DEFAULT '',
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  "estado" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_anotaciones_mod_3_school_id" ON "obs_anotaciones_mod_3" ("school_id");
ALTER TABLE "obs_anotaciones_mod_3" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_anotaciones_mod_3" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_anotaciones_mod_3" ON "obs_anotaciones_mod_3";
CREATE POLICY "tenant_isolation_obs_anotaciones_mod_3" ON "obs_anotaciones_mod_3" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_anotaciones_mod_3" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_criterios" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "id_item_modelo" INTEGER,
  "descripcion" VARCHAR(250),
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_criterios_school_id" ON "obs_criterios" ("school_id");
ALTER TABLE "obs_criterios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_criterios" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_criterios" ON "obs_criterios";
CREATE POLICY "tenant_isolation_obs_criterios" ON "obs_criterios" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_criterios" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_items_modelos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_modelo" INTEGER,
  "descripcion" VARCHAR(200),
  "year" SMALLINT,
  "estado" SMALLINT DEFAULT 1,
  "convivencia" SMALLINT DEFAULT 0,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_items_modelos_school_id" ON "obs_items_modelos" ("school_id");
ALTER TABLE "obs_items_modelos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_items_modelos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_items_modelos" ON "obs_items_modelos";
CREATE POLICY "tenant_isolation_obs_items_modelos" ON "obs_items_modelos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_items_modelos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_items_modelo_1" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_observador" INTEGER,
  "id_docente" INTEGER,
  "tipo" INTEGER,
  "descripcion" TEXT,
  "estado" SMALLINT,
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_items_modelo_1_school_id" ON "obs_items_modelo_1" ("school_id");
ALTER TABLE "obs_items_modelo_1" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_items_modelo_1" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_items_modelo_1" ON "obs_items_modelo_1";
CREATE POLICY "tenant_isolation_obs_items_modelo_1" ON "obs_items_modelo_1" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_items_modelo_1" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_items_modelo_3" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "id_observador" INTEGER,
  "id_docente" INTEGER,
  "id_item_criterio" INTEGER,
  "n1" SMALLINT DEFAULT 0,
  "n2" SMALLINT DEFAULT 0,
  "n3" SMALLINT DEFAULT 0,
  "n4" SMALLINT DEFAULT 0,
  "av1" SMALLINT DEFAULT 0,
  "av2" SMALLINT DEFAULT 0,
  "av3" SMALLINT DEFAULT 0,
  "av4" SMALLINT DEFAULT 0,
  "cs1" SMALLINT DEFAULT 0,
  "cs2" SMALLINT DEFAULT 0,
  "cs3" SMALLINT DEFAULT 0,
  "cs4" SMALLINT DEFAULT 0,
  "s1" SMALLINT DEFAULT 0,
  "s2" SMALLINT DEFAULT 0,
  "s3" SMALLINT DEFAULT 0,
  "s4" SMALLINT DEFAULT 0,
  "estado" SMALLINT DEFAULT 1,
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_items_modelo_3_school_id" ON "obs_items_modelo_3" ("school_id");
ALTER TABLE "obs_items_modelo_3" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_items_modelo_3" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_items_modelo_3" ON "obs_items_modelo_3";
CREATE POLICY "tenant_isolation_obs_items_modelo_3" ON "obs_items_modelo_3" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_items_modelo_3" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_items_modelo_obs2" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "consecutivo" INTEGER,
  "id_observador" INTEGER,
  "id_docente" INTEGER,
  "cod_est" INTEGER,
  "cod_grado" VARCHAR(2),
  "grupo" VARCHAR(2),
  "cod_jorn" INTEGER,
  "id_inst" INTEGER DEFAULT 1,
  "id_sede" INTEGER DEFAULT 1,
  "cod_dane" VARCHAR(12),
  "cons_sede" VARCHAR(14),
  "observaciones" TEXT,
  "compromisos" TEXT,
  "tratamientos" TEXT,
  "resultado" TEXT,
  "fecha" DATE,
  "estado" SMALLINT DEFAULT 1,
  "año" SMALLINT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_items_modelo_obs2_school_id" ON "obs_items_modelo_obs2" ("school_id");
ALTER TABLE "obs_items_modelo_obs2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_items_modelo_obs2" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_items_modelo_obs2" ON "obs_items_modelo_obs2";
CREATE POLICY "tenant_isolation_obs_items_modelo_obs2" ON "obs_items_modelo_obs2" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_items_modelo_obs2" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_modelos_observador" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "descripcion" TEXT,
  "estado" SMALLINT,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_modelos_observador_school_id" ON "obs_modelos_observador" ("school_id");
ALTER TABLE "obs_modelos_observador" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_modelos_observador" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_modelos_observador" ON "obs_modelos_observador";
CREATE POLICY "tenant_isolation_obs_modelos_observador" ON "obs_modelos_observador" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_modelos_observador" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_modelos_observador_cuerpo" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_observador" INTEGER,
  "foto" BYTEA,
  "mime" VARCHAR(30) DEFAULT 'image/jpeg',
  "encabezado" TEXT,
  "cuerpo" TEXT,
  "firma" VARCHAR(250),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_modelos_observador_cuerpo_school_id" ON "obs_modelos_observador_cuerpo" ("school_id");
ALTER TABLE "obs_modelos_observador_cuerpo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_modelos_observador_cuerpo" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_modelos_observador_cuerpo" ON "obs_modelos_observador_cuerpo";
CREATE POLICY "tenant_isolation_obs_modelos_observador_cuerpo" ON "obs_modelos_observador_cuerpo" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_modelos_observador_cuerpo" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_observador_mod2" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "id_sede" INTEGER DEFAULT 1,
  "cod_grado" VARCHAR(2),
  "grupo" VARCHAR(2),
  "cod_jorn" INTEGER,
  "cons_sede" VARCHAR(14),
  "cod_est" INTEGER,
  "año" SMALLINT,
  "peso" VARCHAR(30),
  "talla" VARCHAR(30),
  "grados_cursados" VARCHAR(160),
  "grados_reprobados" VARCHAR(160),
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_observador_mod2_school_id" ON "obs_observador_mod2" ("school_id");
ALTER TABLE "obs_observador_mod2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_observador_mod2" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_observador_mod2" ON "obs_observador_mod2";
CREATE POLICY "tenant_isolation_obs_observador_mod2" ON "obs_observador_mod2" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_observador_mod2" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_observador_mod_1" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "año" SMALLINT,
  "id_matric" INTEGER,
  "vision" VARCHAR(80),
  "audicion" VARCHAR(80),
  "limit_fisicas" VARCHAR(200),
  "enfer_recurentes" VARCHAR(200),
  "comp_academico" TEXT,
  "comp_disciplinario" TEXT,
  "vive_con" VARCHAR(100),
  "numero_hnos" INTEGER,
  "lugar_hnos" INTEGER,
  "hnos_bachilleres" INTEGER,
  "condicion_economica" INTEGER,
  "relacion_madre" VARCHAR(100),
  "relacion_padre" VARCHAR(100),
  "relacion_hnos" VARCHAR(100),
  "n_personas_vive" INTEGER,
  "dis_aprox_col" VARCHAR(200),
  "tiempo_llegada_col" VARCHAR(200),
  "transporte" VARCHAR(200),
  "vivienda" VARCHAR(100),
  "luz" VARCHAR(2),
  "movil" VARCHAR(2),
  "acueducto" VARCHAR(2),
  "alcantarillado" VARCHAR(2),
  "equipo_sonido" VARCHAR(2),
  "television" VARCHAR(2),
  "computadora" VARCHAR(2),
  "pregunta1" VARCHAR(200),
  "pregunta2" VARCHAR(200),
  "cual_positivas" VARCHAR(200),
  "cual_negativas" VARCHAR(200),
  "estado" SMALLINT,
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_observador_mod_1_school_id" ON "obs_observador_mod_1" ("school_id");
ALTER TABLE "obs_observador_mod_1" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_observador_mod_1" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_observador_mod_1" ON "obs_observador_mod_1";
CREATE POLICY "tenant_isolation_obs_observador_mod_1" ON "obs_observador_mod_1" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_observador_mod_1" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "obs_observador_mod_3" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_matric" INTEGER,
  "year" SMALLINT,
  "peso" VARCHAR(30),
  "talla" VARCHAR(30),
  "religion" VARCHAR(120),
  "deporte" VARCHAR(200),
  "musica" VARCHAR(200),
  "arte" VARCHAR(200),
  "comida" VARCHAR(200),
  "prof_oficio" VARCHAR(200),
  "motricidad_fina" VARCHAR(60),
  "motricidad_gruesa" VARCHAR(60),
  "temporo_espacial" VARCHAR(60),
  "actitud_verval" VARCHAR(60),
  "artitud_numerica" VARCHAR(60),
  "liderazgo" VARCHAR(60),
  "comportamiento" VARCHAR(60),
  "dislexia" VARCHAR(60),
  "disortografia" VARCHAR(60),
  "discalculia" VARCHAR(60),
  "fecha" DATE,
  "estado" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_obs_observador_mod_3_school_id" ON "obs_observador_mod_3" ("school_id");
ALTER TABLE "obs_observador_mod_3" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "obs_observador_mod_3" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_obs_observador_mod_3" ON "obs_observador_mod_3";
CREATE POLICY "tenant_isolation_obs_observador_mod_3" ON "obs_observador_mod_3" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "obs_observador_mod_3" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "pagointernet" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "pago_inter" VARCHAR(2),
  "columna32" VARCHAR(25)
);
CREATE INDEX IF NOT EXISTS "idx_pagointernet_school_id" ON "pagointernet" ("school_id");
ALTER TABLE "pagointernet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pagointernet" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_pagointernet" ON "pagointernet";
CREATE POLICY "tenant_isolation_pagointernet" ON "pagointernet" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "pagointernet" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "paises" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "pais" VARCHAR(6) DEFAULT '',
  "nombre" VARCHAR(150),
  "abrev" VARCHAR(4),
  "moneda" VARCHAR(3),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_paises_school_id" ON "paises" ("school_id");
ALTER TABLE "paises" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paises" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_paises" ON "paises";
CREATE POLICY "tenant_isolation_paises" ON "paises" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "paises" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "parcelador" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "id_sede" INTEGER DEFAULT 1,
  "id_docente" INTEGER,
  "id_grado" INTEGER,
  "id_asig" INTEGER,
  "id_metod" INTEGER,
  "periodo" VARCHAR(2),
  "año" INTEGER,
  "fecha_inicio" DATE,
  "fecha_cierre" DATE,
  "tiempo_probable" INTEGER,
  "tiempo_real" INTEGER,
  "clases" INTEGER,
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_parcelador_school_id" ON "parcelador" ("school_id");
ALTER TABLE "parcelador" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parcelador" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parcelador" ON "parcelador";
CREATE POLICY "tenant_isolation_parcelador" ON "parcelador" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "parcelador" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "parcelador_cli" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_parcelador" INTEGER,
  "id_competencia" INTEGER DEFAULT 0,
  "id_escala" INTEGER DEFAULT 0,
  "descripcion" TEXT DEFAULT '',
  "estra_apren" TEXT DEFAULT '',
  "tipo" INTEGER DEFAULT 1,
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_parcelador_cli_school_id" ON "parcelador_cli" ("school_id");
ALTER TABLE "parcelador_cli" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parcelador_cli" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parcelador_cli" ON "parcelador_cli";
CREATE POLICY "tenant_isolation_parcelador_cli" ON "parcelador_cli" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "parcelador_cli" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "parcelador_cli_detalle" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_par_cli" INTEGER,
  "descripcion" TEXT,
  "desempeño" INTEGER,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_parcelador_cli_detalle_school_id" ON "parcelador_cli_detalle" ("school_id");
ALTER TABLE "parcelador_cli_detalle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parcelador_cli_detalle" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parcelador_cli_detalle" ON "parcelador_cli_detalle";
CREATE POLICY "tenant_isolation_parcelador_cli_detalle" ON "parcelador_cli_detalle" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "parcelador_cli_detalle" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "parcelador_con_tem" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_parcelador" INTEGER,
  "descripcion" TEXT,
  "tipo" INTEGER,
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_parcelador_con_tem_school_id" ON "parcelador_con_tem" ("school_id");
ALTER TABLE "parcelador_con_tem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parcelador_con_tem" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parcelador_con_tem" ON "parcelador_con_tem";
CREATE POLICY "tenant_isolation_parcelador_con_tem" ON "parcelador_con_tem" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "parcelador_con_tem" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "parcelador_items_con_tem" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "descripcion" VARCHAR(254),
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_parcelador_items_con_tem_school_id" ON "parcelador_items_con_tem" ("school_id");
ALTER TABLE "parcelador_items_con_tem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parcelador_items_con_tem" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parcelador_items_con_tem" ON "parcelador_items_con_tem";
CREATE POLICY "tenant_isolation_parcelador_items_con_tem" ON "parcelador_items_con_tem" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "parcelador_items_con_tem" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "parcelador_unidades" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_parcelador" INTEGER,
  "ejes_tematicos" TEXT,
  "temas_contenidos" TEXT,
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_parcelador_unidades_school_id" ON "parcelador_unidades" ("school_id");
ALTER TABLE "parcelador_unidades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parcelador_unidades" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parcelador_unidades" ON "parcelador_unidades";
CREATE POLICY "tenant_isolation_parcelador_unidades" ON "parcelador_unidades" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "parcelador_unidades" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "peridomantenimiento" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "periodo_mm" VARCHAR(1),
  "columna3" VARCHAR(17)
);
CREATE INDEX IF NOT EXISTS "idx_peridomantenimiento_school_id" ON "peridomantenimiento" ("school_id");
ALTER TABLE "peridomantenimiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "peridomantenimiento" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_peridomantenimiento" ON "peridomantenimiento";
CREATE POLICY "tenant_isolation_peridomantenimiento" ON "peridomantenimiento" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "peridomantenimiento" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "periodos_academicos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_grado_agrupado" INTEGER DEFAULT 1,
  "periodo" VARCHAR(2) DEFAULT '1',
  "descripcion_periodo" VARCHAR(60) DEFAULT '1',
  "fecha_inical" DATE,
  "fecha_cierre" DATE,
  "fecha_inical_nivelacion" DATE,
  "fecha_cierre_nivelacion" DATE,
  "porciento" NUMERIC(6,2) DEFAULT 100.00,
  "year" SMALLINT DEFAULT 2002,
  "estado" INTEGER DEFAULT 1,
  "bloquear" INTEGER DEFAULT 0,
  "calificable" INTEGER DEFAULT 1,
  "timestamps" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_periodos_academicos_school_id" ON "periodos_academicos" ("school_id");
ALTER TABLE "periodos_academicos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "periodos_academicos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_periodos_academicos" ON "periodos_academicos";
CREATE POLICY "tenant_isolation_periodos_academicos" ON "periodos_academicos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "periodos_academicos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "plan_semanal_clases" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_docente" INTEGER,
  "id_inst" INTEGER DEFAULT 1,
  "id_sede" INTEGER DEFAULT 1,
  "cod_grado" VARCHAR(2),
  "id_asig" INTEGER,
  "periodo" VARCHAR(1),
  "año" SMALLINT,
  "temas" TEXT,
  "indicadores" TEXT,
  "actividades" TEXT,
  "fecha_inicio" DATE,
  "fecha_final" DATE,
  "revisado" SMALLINT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_plan_semanal_clases_school_id" ON "plan_semanal_clases" ("school_id");
ALTER TABLE "plan_semanal_clases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_semanal_clases" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_plan_semanal_clases" ON "plan_semanal_clases";
CREATE POLICY "tenant_isolation_plan_semanal_clases" ON "plan_semanal_clases" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "plan_semanal_clases" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "poblacion_victima_conflicto" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER,
  "nombre" VARCHAR(250)
);
CREATE INDEX IF NOT EXISTS "idx_poblacion_victima_conflicto_school_id" ON "poblacion_victima_conflicto" ("school_id");
ALTER TABLE "poblacion_victima_conflicto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "poblacion_victima_conflicto" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_poblacion_victima_conflicto" ON "poblacion_victima_conflicto";
CREATE POLICY "tenant_isolation_poblacion_victima_conflicto" ON "poblacion_victima_conflicto" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "poblacion_victima_conflicto" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "preinforme_nscp00" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_nota" INTEGER,
  "obs" TEXT DEFAULT '',
  "estado" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_preinforme_nscp00_school_id" ON "preinforme_nscp00" ("school_id");
ALTER TABLE "preinforme_nscp00" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "preinforme_nscp00" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_preinforme_nscp00" ON "preinforme_nscp00";
CREATE POLICY "tenant_isolation_preinforme_nscp00" ON "preinforme_nscp00" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "preinforme_nscp00" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "preinforme_nscp001" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_nota" INTEGER,
  "obs" TEXT DEFAULT '',
  "estado" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_preinforme_nscp001_school_id" ON "preinforme_nscp001" ("school_id");
ALTER TABLE "preinforme_nscp001" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "preinforme_nscp001" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_preinforme_nscp001" ON "preinforme_nscp001";
CREATE POLICY "tenant_isolation_preinforme_nscp001" ON "preinforme_nscp001" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "preinforme_nscp001" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "preinforme_nscp002" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_nota" INTEGER,
  "obs" TEXT DEFAULT '',
  "estado" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_preinforme_nscp002_school_id" ON "preinforme_nscp002" ("school_id");
ALTER TABLE "preinforme_nscp002" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "preinforme_nscp002" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_preinforme_nscp002" ON "preinforme_nscp002";
CREATE POLICY "tenant_isolation_preinforme_nscp002" ON "preinforme_nscp002" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "preinforme_nscp002" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "preinforme_nscp003" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_nota" INTEGER,
  "obs" TEXT DEFAULT '',
  "estado" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_preinforme_nscp003_school_id" ON "preinforme_nscp003" ("school_id");
ALTER TABLE "preinforme_nscp003" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "preinforme_nscp003" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_preinforme_nscp003" ON "preinforme_nscp003";
CREATE POLICY "tenant_isolation_preinforme_nscp003" ON "preinforme_nscp003" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "preinforme_nscp003" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "pre_matricula_nuevos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "id_sede" INTEGER,
  "id_grado" INTEGER,
  "cod_est" INTEGER,
  "estado" VARCHAR(1) DEFAULT '1',
  "ins_proced" VARCHAR(100) DEFAULT 'No aplica',
  "repite" VARCHAR(2),
  "año" SMALLINT,
  "fecha" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_pre_matricula_nuevos_school_id" ON "pre_matricula_nuevos" ("school_id");
ALTER TABLE "pre_matricula_nuevos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pre_matricula_nuevos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_pre_matricula_nuevos" ON "pre_matricula_nuevos";
CREATE POLICY "tenant_isolation_pre_matricula_nuevos" ON "pre_matricula_nuevos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "pre_matricula_nuevos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "pre_matricula_viejos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_matric" INTEGER NOT NULL,
  "old_matric" INTEGER,
  "id_inst" INTEGER DEFAULT 1,
  "id_sede" INTEGER,
  "id_jorn" INTEGER,
  "id_grado" INTEGER,
  "año" INTEGER,
  "fecha" TIMESTAMPTZ DEFAULT NOW(),
  "estado" INTEGER DEFAULT 0,
  PRIMARY KEY ("school_id", "id_matric")
);
CREATE INDEX IF NOT EXISTS "idx_pre_matricula_viejos_school_id" ON "pre_matricula_viejos" ("school_id");
ALTER TABLE "pre_matricula_viejos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pre_matricula_viejos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_pre_matricula_viejos" ON "pre_matricula_viejos";
CREATE POLICY "tenant_isolation_pre_matricula_viejos" ON "pre_matricula_viejos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "pre_matricula_viejos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "promoted_header" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "student_id" INTEGER,
  "headq_id" INTEGER DEFAULT 1,
  "grade_id" INTEGER,
  "studyday_id" INTEGER,
  "group_id" VARCHAR(2),
  "year" SMALLINT,
  "state" SMALLINT DEFAULT 1,
  "tiemestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_promoted_header_school_id" ON "promoted_header" ("school_id");
ALTER TABLE "promoted_header" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "promoted_header" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_promoted_header" ON "promoted_header";
CREATE POLICY "tenant_isolation_promoted_header" ON "promoted_header" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "promoted_header" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "promoted_observation" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "promoted_id" BIGINT,
  "titulo" TEXT DEFAULT '',
  "res" TEXT DEFAULT 'Resolución de aprobación',
  "encabezado" TEXT DEFAULT 'EL SUSCRITO RECTOR DE ESTE PLANTEL DE CARACTER OFICIAL',
  "consta" TEXT DEFAULT 'CERTIFICA',
  "cuerpo" TEXT DEFAULT 'QUE: DATOS DEL ESTUDIANTE',
  "firma" TEXT DEFAULT 'Para mayor constancia se firma en...',
  "notas" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_promoted_observation_school_id" ON "promoted_observation" ("school_id");
ALTER TABLE "promoted_observation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "promoted_observation" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_promoted_observation" ON "promoted_observation";
CREATE POLICY "tenant_isolation_promoted_observation" ON "promoted_observation" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "promoted_observation" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "promotion_areas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "area_id" INTEGER,
  "config_id" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_promotion_areas_school_id" ON "promotion_areas" ("school_id");
ALTER TABLE "promotion_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "promotion_areas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_promotion_areas" ON "promotion_areas";
CREATE POLICY "tenant_isolation_promotion_areas" ON "promotion_areas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "promotion_areas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "propiedad" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "COD_SEC" VARCHAR(1),
  "COD_PROP" VARCHAR(2) NOT NULL DEFAULT '',
  "PROP_SERV" VARCHAR(35),
  PRIMARY KEY ("school_id", "COD_PROP")
);
CREATE INDEX IF NOT EXISTS "idx_propiedad_school_id" ON "propiedad" ("school_id");
ALTER TABLE "propiedad" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "propiedad" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_propiedad" ON "propiedad";
CREATE POLICY "tenant_isolation_propiedad" ON "propiedad" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "propiedad" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "proyeccion_cupos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "id_sede" INTEGER DEFAULT 1,
  "cod_grado" VARCHAR(2) DEFAULT '',
  "año" SMALLINT DEFAULT 2000,
  "total" INTEGER DEFAULT 0,
  "tipo" INTEGER DEFAULT 1,
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_proyeccion_cupos_school_id" ON "proyeccion_cupos" ("school_id");
ALTER TABLE "proyeccion_cupos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "proyeccion_cupos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_proyeccion_cupos" ON "proyeccion_cupos";
CREATE POLICY "tenant_isolation_proyeccion_cupos" ON "proyeccion_cupos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "proyeccion_cupos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "puestos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_matric" INTEGER,
  "total" INTEGER,
  "puesto" INTEGER,
  "prom" NUMERIC(6,2),
  "nota_max" NUMERIC(6,2),
  "nota_min" NUMERIC(6,2),
  "periodo" VARCHAR(1)
);
CREATE INDEX IF NOT EXISTS "idx_puestos_school_id" ON "puestos" ("school_id");
ALTER TABLE "puestos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "puestos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_puestos" ON "puestos";
CREATE POLICY "tenant_isolation_puestos" ON "puestos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "puestos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "rango" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "COD_RANGO" INTEGER NOT NULL,
  "tipo" VARCHAR(25),
  PRIMARY KEY ("school_id", "COD_RANGO")
);
CREATE INDEX IF NOT EXISTS "idx_rango_school_id" ON "rango" ("school_id");
ALTER TABLE "rango" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rango" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_rango" ON "rango";
CREATE POLICY "tenant_isolation_rango" ON "rango" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "rango" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "recuperacionesp" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "nro_acta" VARCHAR(6),
  "cod_est" INTEGER,
  "cod_grado" VARCHAR(2),
  "grupo" VARCHAR(2),
  "id_docente" INTEGER,
  "cons_sede" VARCHAR(14),
  "ID_ASIG" INTEGER,
  "periodo" VARCHAR(1),
  "AÑO" INTEGER DEFAULT 2010,
  "cod_area" INTEGER,
  "nota_perdi" NUMERIC(6,2),
  "nota_rec" NUMERIC(6,2),
  "fecha" DATE,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_recuperacionesp_school_id" ON "recuperacionesp" ("school_id");
ALTER TABLE "recuperacionesp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recuperacionesp" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_recuperacionesp" ON "recuperacionesp";
CREATE POLICY "tenant_isolation_recuperacionesp" ON "recuperacionesp" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "recuperacionesp" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "regimen" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_reg" INTEGER NOT NULL,
  "tipo" VARCHAR(20),
  PRIMARY KEY ("school_id", "id_reg")
);
CREATE INDEX IF NOT EXISTS "idx_regimen_school_id" ON "regimen" ("school_id");
ALTER TABLE "regimen" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "regimen" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_regimen" ON "regimen";
CREATE POLICY "tenant_isolation_regimen" ON "regimen" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "regimen" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "registration_novelties" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_register" INTEGER,
  "id_state" INTEGER,
  "motive" TEXT,
  "date" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_registration_novelties_school_id" ON "registration_novelties" ("school_id");
ALTER TABLE "registration_novelties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "registration_novelties" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_registration_novelties" ON "registration_novelties";
CREATE POLICY "tenant_isolation_registration_novelties" ON "registration_novelties" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "registration_novelties" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "registration_status" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "name_state" VARCHAR(200),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_registration_status_school_id" ON "registration_status" ("school_id");
ALTER TABLE "registration_status" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "registration_status" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_registration_status" ON "registration_status";
CREATE POLICY "tenant_isolation_registration_status" ON "registration_status" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "registration_status" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "reg_actividades" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_curso" INTEGER,
  "actividad" TEXT,
  "fecha" DATE,
  "año" SMALLINT,
  "tiemestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_reg_actividades_school_id" ON "reg_actividades" ("school_id");
ALTER TABLE "reg_actividades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reg_actividades" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_reg_actividades" ON "reg_actividades";
CREATE POLICY "tenant_isolation_reg_actividades" ON "reg_actividades" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "reg_actividades" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "resguardos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "codigo" VARCHAR(6),
  "nombre_resguardo" VARCHAR(200),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_resguardos_school_id" ON "resguardos" ("school_id");
ALTER TABLE "resguardos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resguardos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_resguardos" ON "resguardos";
CREATE POLICY "tenant_isolation_resguardos" ON "resguardos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "resguardos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "respeciales" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "id_matric" INTEGER,
  "id_curso" INTEGER,
  "nro_acta" INTEGER,
  "notafinal" NUMERIC(6,2) DEFAULT 0.00,
  "notarecuperada" NUMERIC(6,2) DEFAULT 0.00,
  "fecha" DATE,
  "notas" VARCHAR(250),
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_respeciales_school_id" ON "respeciales" ("school_id");
ALTER TABLE "respeciales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "respeciales" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_respeciales" ON "respeciales";
CREATE POLICY "tenant_isolation_respeciales" ON "respeciales" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "respeciales" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sabanas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_matric" INTEGER NOT NULL,
  "ar1" INTEGER DEFAULT 0,
  "nar1" VARCHAR(6) DEFAULT '',
  "ar2" INTEGER DEFAULT 0,
  "nar2" VARCHAR(6) DEFAULT '',
  "ar3" INTEGER DEFAULT 0,
  "nar3" VARCHAR(6) DEFAULT '',
  "ar4" INTEGER DEFAULT 0,
  "nar4" VARCHAR(6) DEFAULT '',
  "ar5" INTEGER DEFAULT 0,
  "nar5" VARCHAR(6) DEFAULT '',
  "ar6" INTEGER DEFAULT 0,
  "nar6" VARCHAR(6) DEFAULT '',
  "ar7" INTEGER DEFAULT 0,
  "nar7" VARCHAR(6) DEFAULT '',
  "ar8" INTEGER DEFAULT 0,
  "nar8" VARCHAR(6) DEFAULT '',
  "ar9" INTEGER DEFAULT 0,
  "nar9" VARCHAR(6) DEFAULT '',
  "ar10" INTEGER DEFAULT 0,
  "nar10" VARCHAR(6) DEFAULT '',
  "ar11" INTEGER DEFAULT 0,
  "nar11" VARCHAR(6) DEFAULT '',
  "ar12" INTEGER DEFAULT 0,
  "nar12" VARCHAR(6) DEFAULT '',
  "ar13" INTEGER DEFAULT 0,
  "nar13" VARCHAR(6) DEFAULT '',
  "ar14" INTEGER DEFAULT 0,
  "nar14" VARCHAR(6) DEFAULT '',
  "ar15" INTEGER DEFAULT 0,
  "nar15" VARCHAR(6) DEFAULT '',
  "ar16" INTEGER DEFAULT 0,
  "nar16" VARCHAR(6) DEFAULT '',
  "ar17" INTEGER DEFAULT 0,
  "nar17" VARCHAR(6) DEFAULT '',
  "ar18" INTEGER DEFAULT 0,
  "nar18" VARCHAR(6) DEFAULT '',
  "ar19" INTEGER DEFAULT 0,
  "nar19" VARCHAR(6) DEFAULT '',
  "ar20" INTEGER DEFAULT 0,
  "nar20" VARCHAR(6) DEFAULT '',
  "ar21" INTEGER DEFAULT 0,
  "nar21" VARCHAR(6) DEFAULT '',
  "ar22" INTEGER DEFAULT 0,
  "nar22" VARCHAR(6) DEFAULT '',
  "ar23" INTEGER DEFAULT 0,
  "nar23" VARCHAR(6) DEFAULT '',
  "ar24" INTEGER DEFAULT 0,
  "nar24" VARCHAR(6) DEFAULT '',
  "ar25" INTEGER DEFAULT 0,
  "nar25" VARCHAR(6) DEFAULT '',
  "prom" NUMERIC(6,2) DEFAULT 0.00,
  PRIMARY KEY ("school_id", "id_matric")
);
CREATE INDEX IF NOT EXISTS "idx_sabanas_school_id" ON "sabanas" ("school_id");
ALTER TABLE "sabanas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sabanas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sabanas" ON "sabanas";
CREATE POLICY "tenant_isolation_sabanas" ON "sabanas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sabanas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sabanas_encabezado" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER DEFAULT 1,
  "año" INTEGER,
  "encabezado" TEXT,
  "timestap" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sabanas_encabezado_school_id" ON "sabanas_encabezado" ("school_id");
ALTER TABLE "sabanas_encabezado" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sabanas_encabezado" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sabanas_encabezado" ON "sabanas_encabezado";
CREATE POLICY "tenant_isolation_sabanas_encabezado" ON "sabanas_encabezado" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sabanas_encabezado" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "school" (
  "tenant_school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "country_id" INTEGER DEFAULT 45,
  "city_id" INTEGER,
  "school_id" VARCHAR(20),
  "school_name" VARCHAR(250),
  "dni" VARCHAR(20),
  "director_name" VARCHAR(100),
  "suburb" VARCHAR(50),
  "address" VARCHAR(100),
  "location" VARCHAR(100),
  "phones" VARCHAR(250) DEFAULT '0',
  "web" VARCHAR(50),
  "email" VARCHAR(200),
  "number_locations" SMALLINT DEFAULT 1,
  PRIMARY KEY ("tenant_school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_school_tenant_school_id" ON "school" ("tenant_school_id");
ALTER TABLE "school" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "school" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_school" ON "school";
CREATE POLICY "tenant_isolation_school" ON "school" USING ("tenant_school_id" = current_tenant_school_id()) WITH CHECK ("tenant_school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "school" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "scp006" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_inst" INTEGER DEFAULT 1,
  "id_sede" INTEGER DEFAULT 1,
  "cod_dane" VARCHAR(12) NOT NULL,
  "id_docente" INTEGER NOT NULL,
  "cod_grado" VARCHAR(2) NOT NULL,
  "id_asig" INTEGER NOT NULL,
  "cod_est" INTEGER NOT NULL,
  "ID_Logro" VARCHAR(6),
  "ID_LOGRO1" VARCHAR(6) DEFAULT '000000',
  "ID_LOGRO2" VARCHAR(6) DEFAULT '000000',
  "id_sugerencia" VARCHAR(6),
  "cod_jorn" INTEGER NOT NULL,
  "cons_sede" VARCHAR(14) NOT NULL,
  "grupo" VARCHAR(2) NOT NULL,
  "periodo" VARCHAR(1) NOT NULL,
  "año" INTEGER NOT NULL DEFAULT 1111,
  "n1P" NUMERIC(6,2) DEFAULT 0.00,
  "n2P" NUMERIC(6,2) DEFAULT 0.00,
  "n3P" NUMERIC(6,2) DEFAULT 0.00,
  "n4P" NUMERIC(6,2) DEFAULT 0.00,
  "n5P" NUMERIC(6,2) DEFAULT 0.00,
  "n6P" NUMERIC(6,2) DEFAULT 0.00,
  "NOTAP1" NUMERIC(6,2) DEFAULT 0.00,
  "P1" NUMERIC(6,2) DEFAULT 0.00,
  "n1P2" NUMERIC(6,2) DEFAULT 0.00,
  "n2P2" NUMERIC(6,2) DEFAULT 0.00,
  "n3P2" NUMERIC(6,2) DEFAULT 0.00,
  "n4P2" NUMERIC(6,2) DEFAULT 0.00,
  "n5P2" NUMERIC(6,2) DEFAULT 0.00,
  "n6P2" NUMERIC(6,2) DEFAULT 0.00,
  "n7P2" NUMERIC(6,2) DEFAULT 0.00,
  "n8P2" NUMERIC(6,2) DEFAULT 0.00,
  "NOTAP2" NUMERIC(6,2) DEFAULT 0.00,
  "P2" NUMERIC(6,2) DEFAULT 0.00,
  "n1P3" NUMERIC(6,2) DEFAULT 0.00,
  "n2P3" NUMERIC(6,2) DEFAULT 0.00,
  "n3P3" NUMERIC(6,2) DEFAULT 0.00,
  "n4P3" NUMERIC(6,2) DEFAULT 0.00,
  "n5P3" NUMERIC(6,2) DEFAULT 0.00,
  "n6P3" NUMERIC(6,2) DEFAULT 0.00,
  "n7P3" NUMERIC(6,2) DEFAULT 0.00,
  "n8P3" NUMERIC(6,2) DEFAULT 0.00,
  "NOTAP3" NUMERIC(6,2) DEFAULT 0.00,
  "P3" NUMERIC(6,2) DEFAULT 0.00,
  "n1P4" NUMERIC(6,2) DEFAULT 0.00,
  "n2P4" NUMERIC(6,2) DEFAULT 0.00,
  "n3P4" NUMERIC(6,2) DEFAULT 0.00,
  "n4P4" NUMERIC(6,2) DEFAULT 0.00,
  "n5P4" NUMERIC(6,2) DEFAULT 0.00,
  "n6P4" NUMERIC(6,2) DEFAULT 0.00,
  "NOTAP4" NUMERIC(6,2) DEFAULT 0.00,
  "P4" NUMERIC(6,2) DEFAULT 0.00,
  "final" NUMERIC(6,2) DEFAULT 0.00,
  "prom" NUMERIC(6,2) DEFAULT 0.00,
  "conceptual" VARCHAR(15),
  "faltas" NUMERIC(3,0) DEFAULT 0,
  "ind1" VARCHAR(6),
  "ind2" VARCHAR(6),
  "ind3" VARCHAR(6),
  "ind4" VARCHAR(6),
  "ind5" VARCHAR(6),
  "ind6" VARCHAR(6),
  "ind7" VARCHAR(6),
  "ind8" VARCHAR(6),
  "ind9" VARCHAR(6),
  "ind10" VARCHAR(6),
  "ind11" VARCHAR(6),
  "ind12" VARCHAR(6),
  "tipo_sug" INTEGER DEFAULT 1,
  "id_obser" VARCHAR(6) DEFAULT '',
  "tipo_ind1" INTEGER DEFAULT 1,
  "tipo_ind2" INTEGER DEFAULT 1,
  "tipo_ind3" INTEGER DEFAULT 1,
  "tipo_ind4" INTEGER DEFAULT 1,
  "tipo_ind5" INTEGER DEFAULT 1,
  "tipo_ind6" INTEGER DEFAULT 1,
  "tipo_ind7" INTEGER DEFAULT 1,
  "tipo_ind8" INTEGER DEFAULT 1,
  "tipo_ind9" INTEGER DEFAULT 1,
  "tipo_ind10" INTEGER DEFAULT 1,
  "tipo_ind11" INTEGER DEFAULT 1,
  "tipo_ind12" INTEGER DEFAULT 1,
  "nota_perdida" NUMERIC(6,2),
  "nota_habilitacion" NUMERIC(6,2),
  "fecha" DATE,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "cod_dane", "id_docente", "cod_grado", "id_asig", "cod_est", "cod_jorn", "cons_sede", "grupo", "periodo", "año")
);
CREATE INDEX IF NOT EXISTS "idx_scp006_school_id" ON "scp006" ("school_id");
ALTER TABLE "scp006" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scp006" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_scp006" ON "scp006";
CREATE POLICY "tenant_isolation_scp006" ON "scp006" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "scp006" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sector" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "COD_SEC" VARCHAR(1) NOT NULL,
  "SECTOR" VARCHAR(11),
  PRIMARY KEY ("school_id", "COD_SEC")
);
CREATE INDEX IF NOT EXISTS "idx_sector_school_id" ON "sector" ("school_id");
ALTER TABLE "sector" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sector" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sector" ON "sector";
CREATE POLICY "tenant_isolation_sector" ON "sector" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sector" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sedes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "city_id" INTEGER,
  "zone_id" SMALLINT DEFAULT 1,
  "sex_id" SMALLINT DEFAULT 1,
  "headquarters_name" VARCHAR(100),
  "address" VARCHAR(100),
  "phones" VARCHAR(200),
  "suburd" VARCHAR(50),
  "email" VARCHAR(200),
  "is_main" VARCHAR(10),
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sedes_school_id" ON "sedes" ("school_id");
ALTER TABLE "sedes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sedes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sedes" ON "sedes";
CREATE POLICY "tenant_isolation_sedes" ON "sedes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sedes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sm_areas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "nombre" VARCHAR(250),
  "abrev" VARCHAR(30),
  "año" SMALLINT,
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sm_areas_school_id" ON "sm_areas" ("school_id");
ALTER TABLE "sm_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_areas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sm_areas" ON "sm_areas";
CREATE POLICY "tenant_isolation_sm_areas" ON "sm_areas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sm_areas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sm_preguntas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_prueba" INTEGER,
  "pregunta" TEXT,
  "descripcion" TEXT,
  "valor" NUMERIC(6,2) DEFAULT 1.00,
  "tipo" INTEGER DEFAULT 1,
  "num_respuestas" INTEGER DEFAULT 1,
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sm_preguntas_school_id" ON "sm_preguntas" ("school_id");
ALTER TABLE "sm_preguntas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_preguntas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sm_preguntas" ON "sm_preguntas";
CREATE POLICY "tenant_isolation_sm_preguntas" ON "sm_preguntas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sm_preguntas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sm_pruebas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_sesion_id" INTEGER,
  "id_area" INTEGER,
  "nombre" VARCHAR(250),
  "preguntas_cer" INTEGER,
  "preguntas_ab" INTEGER,
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sm_pruebas_school_id" ON "sm_pruebas" ("school_id");
ALTER TABLE "sm_pruebas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_pruebas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sm_pruebas" ON "sm_pruebas";
CREATE POLICY "tenant_isolation_sm_pruebas" ON "sm_pruebas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sm_pruebas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sm_respuestas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_pregunta" INTEGER,
  "respuesta" VARCHAR(250),
  "valor" NUMERIC(6,2),
  "verdadera" SMALLINT,
  "estado" INTEGER,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sm_respuestas_school_id" ON "sm_respuestas" ("school_id");
ALTER TABLE "sm_respuestas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_respuestas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sm_respuestas" ON "sm_respuestas";
CREATE POLICY "tenant_isolation_sm_respuestas" ON "sm_respuestas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sm_respuestas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sm_sesiones" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "nombre" VARCHAR(250),
  "orden" INTEGER,
  "estado" INTEGER,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sm_sesiones_school_id" ON "sm_sesiones" ("school_id");
ALTER TABLE "sm_sesiones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_sesiones" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sm_sesiones" ON "sm_sesiones";
CREATE POLICY "tenant_isolation_sm_sesiones" ON "sm_sesiones" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sm_sesiones" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sm_sesiones_in" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "id_sesion" INTEGER,
  "cod_grado" VARCHAR(2),
  "horas" INTEGER,
  "minutos" INTEGER,
  "fecha_inicio" DATE,
  "fecha_ciere" DATE,
  "año" SMALLINT,
  "publicada" INTEGER,
  "estado" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sm_sesiones_in_school_id" ON "sm_sesiones_in" ("school_id");
ALTER TABLE "sm_sesiones_in" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_sesiones_in" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sm_sesiones_in" ON "sm_sesiones_in";
CREATE POLICY "tenant_isolation_sm_sesiones_in" ON "sm_sesiones_in" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sm_sesiones_in" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sm_tipo_preguntas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "nombre" VARCHAR(250),
  "estado" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sm_tipo_preguntas_school_id" ON "sm_tipo_preguntas" ("school_id");
ALTER TABLE "sm_tipo_preguntas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_tipo_preguntas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sm_tipo_preguntas" ON "sm_tipo_preguntas";
CREATE POLICY "tenant_isolation_sm_tipo_preguntas" ON "sm_tipo_preguntas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sm_tipo_preguntas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "student_access" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "enrollment_id" INTEGER,
  "notes" SMALLINT DEFAULT 1,
  "newsletters" SMALLINT DEFAULT 1,
  "certificates" SMALLINT DEFAULT 1,
  "evaluations" SMALLINT DEFAULT 1,
  "activities" SMALLINT DEFAULT 1,
  "live_classes" SMALLINT DEFAULT 1,
  "leveling" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_student_access_school_id" ON "student_access" ("school_id");
ALTER TABLE "student_access" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_access" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_student_access" ON "student_access";
CREATE POLICY "tenant_isolation_student_access" ON "student_access" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "student_access" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "student_enrollment" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_headquarters" INTEGER,
  "id_study_day" INTEGER,
  "id_student" INTEGER,
  "id_grade" INTEGER,
  "id_state" INTEGER DEFAULT 2,
  "folio" INTEGER,
  "registration_number" INTEGER,
  "book" INTEGER,
  "id_group" VARCHAR(4),
  "inst_address" VARCHAR(200) DEFAULT 'No aplica',
  "inst_origin" VARCHAR(200) DEFAULT 'No aplica',
  "obs" VARCHAR(254),
  "date" DATE,
  "year" INTEGER DEFAULT 0,
  "promoted" INTEGER DEFAULT 0,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_student_enrollment_school_id" ON "student_enrollment" ("school_id");
ALTER TABLE "student_enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_enrollment" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_student_enrollment" ON "student_enrollment";
CREATE POLICY "tenant_isolation_student_enrollment" ON "student_enrollment" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "student_enrollment" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "subject_certificates" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "subject_parent_id" INTEGER,
  "subject_related_id" INTEGER,
  "ih" NUMERIC(4,2) DEFAULT 1.00,
  "year" SMALLINT DEFAULT 2000,
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_subject_certificates_school_id" ON "subject_certificates" ("school_id");
ALTER TABLE "subject_certificates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subject_certificates" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_subject_certificates" ON "subject_certificates";
CREATE POLICY "tenant_isolation_subject_certificates" ON "subject_certificates" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "subject_certificates" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sugerencias" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "sugerencia" TEXT,
  "id_docente" INTEGER,
  "year" SMALLINT DEFAULT 2010,
  "periodo" VARCHAR(1),
  "tipo" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_sugerencias_school_id" ON "sugerencias" ("school_id");
ALTER TABLE "sugerencias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sugerencias" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sugerencias" ON "sugerencias";
CREATE POLICY "tenant_isolation_sugerencias" ON "sugerencias" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sugerencias" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sug_nscp00" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nota" INTEGER NOT NULL,
  "id_sugerencia" INTEGER NOT NULL,
  PRIMARY KEY ("school_id", "id_nota", "id_sugerencia")
);
CREATE INDEX IF NOT EXISTS "idx_sug_nscp00_school_id" ON "sug_nscp00" ("school_id");
ALTER TABLE "sug_nscp00" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sug_nscp00" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sug_nscp00" ON "sug_nscp00";
CREATE POLICY "tenant_isolation_sug_nscp00" ON "sug_nscp00" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sug_nscp00" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sug_nscp001" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nota" INTEGER NOT NULL,
  "id_sugerencia" INTEGER NOT NULL,
  PRIMARY KEY ("school_id", "id_nota", "id_sugerencia")
);
CREATE INDEX IF NOT EXISTS "idx_sug_nscp001_school_id" ON "sug_nscp001" ("school_id");
ALTER TABLE "sug_nscp001" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sug_nscp001" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sug_nscp001" ON "sug_nscp001";
CREATE POLICY "tenant_isolation_sug_nscp001" ON "sug_nscp001" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sug_nscp001" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sug_nscp002" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nota" INTEGER NOT NULL,
  "id_sugerencia" INTEGER NOT NULL,
  PRIMARY KEY ("school_id", "id_nota", "id_sugerencia")
);
CREATE INDEX IF NOT EXISTS "idx_sug_nscp002_school_id" ON "sug_nscp002" ("school_id");
ALTER TABLE "sug_nscp002" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sug_nscp002" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sug_nscp002" ON "sug_nscp002";
CREATE POLICY "tenant_isolation_sug_nscp002" ON "sug_nscp002" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sug_nscp002" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "sug_nscp003" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_nota" INTEGER NOT NULL,
  "id_sugerencia" INTEGER NOT NULL,
  PRIMARY KEY ("school_id", "id_nota", "id_sugerencia")
);
CREATE INDEX IF NOT EXISTS "idx_sug_nscp003_school_id" ON "sug_nscp003" ("school_id");
ALTER TABLE "sug_nscp003" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sug_nscp003" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sug_nscp003" ON "sug_nscp003";
CREATE POLICY "tenant_isolation_sug_nscp003" ON "sug_nscp003" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "sug_nscp003" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ta_comments_activities" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "shared_activity_id" BIGINT,
  "comment_activity" TEXT,
  "comment_title" VARCHAR(120),
  "url_attached" VARCHAR(200) DEFAULT '',
  "mime" VARCHAR(200) DEFAULT '',
  "hour_comment" TIMESTAMPTZ DEFAULT NOW(),
  "type_comment" SMALLINT DEFAULT 0,
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ta_comments_activities_school_id" ON "ta_comments_activities" ("school_id");
ALTER TABLE "ta_comments_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ta_comments_activities" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ta_comments_activities" ON "ta_comments_activities";
CREATE POLICY "tenant_isolation_ta_comments_activities" ON "ta_comments_activities" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ta_comments_activities" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ta_courses_online_activities" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "activity_id" BIGINT,
  "course_id" INTEGER,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ta_courses_online_activities_school_id" ON "ta_courses_online_activities" ("school_id");
ALTER TABLE "ta_courses_online_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ta_courses_online_activities" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ta_courses_online_activities" ON "ta_courses_online_activities";
CREATE POLICY "tenant_isolation_ta_courses_online_activities" ON "ta_courses_online_activities" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ta_courses_online_activities" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ta_online_activities" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "teacher_id" INTEGER,
  "nombre" VARCHAR(250),
  "descripcion" TEXT,
  "url_video" TEXT,
  "url_archivo" TEXT,
  "mime" VARCHAR(60),
  "url_enlace" TEXT,
  "estado" SMALLINT DEFAULT 1,
  "calificable" SMALLINT DEFAULT 0,
  "fecha" DATE,
  "hora" VARCHAR(10),
  "fecha_cierre" DATE,
  "hora_cierre" VARCHAR(10),
  "year" SMALLINT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ta_online_activities_school_id" ON "ta_online_activities" ("school_id");
ALTER TABLE "ta_online_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ta_online_activities" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ta_online_activities" ON "ta_online_activities";
CREATE POLICY "tenant_isolation_ta_online_activities" ON "ta_online_activities" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ta_online_activities" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ta_online_activities_history" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "shared_activity_id" BIGINT,
  "url_video" TEXT,
  "url_archivo" TEXT,
  "url_enlace" TEXT,
  "hora_apertura" TIMESTAMPTZ,
  "hora_cierre" TIMESTAMPTZ,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ta_online_activities_history_school_id" ON "ta_online_activities_history" ("school_id");
ALTER TABLE "ta_online_activities_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ta_online_activities_history" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ta_online_activities_history" ON "ta_online_activities_history";
CREATE POLICY "tenant_isolation_ta_online_activities_history" ON "ta_online_activities_history" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ta_online_activities_history" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ta_shared_online_activities" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "activity_id" BIGINT,
  "enrollment_id" INTEGER,
  "leido" SMALLINT DEFAULT 0,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ta_shared_online_activities_school_id" ON "ta_shared_online_activities" ("school_id");
ALTER TABLE "ta_shared_online_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ta_shared_online_activities" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ta_shared_online_activities" ON "ta_shared_online_activities";
CREATE POLICY "tenant_isolation_ta_shared_online_activities" ON "ta_shared_online_activities" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ta_shared_online_activities" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tb_promedios" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_matric" INTEGER,
  "prom" NUMERIC(6,2),
  "periodo" VARCHAR(1),
  "nmin" NUMERIC(6,2),
  "nmax" NUMERIC(6,2)
);
CREATE INDEX IF NOT EXISTS "idx_tb_promedios_school_id" ON "tb_promedios" ("school_id");
ALTER TABLE "tb_promedios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tb_promedios" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tb_promedios" ON "tb_promedios";
CREATE POLICY "tenant_isolation_tb_promedios" ON "tb_promedios" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tb_promedios" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tb_promedios_honor" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_matric" INTEGER,
  "suma" NUMERIC(6,2),
  "nmax" NUMERIC(6,2),
  "periodo" VARCHAR(1),
  "id_inst" INTEGER,
  "nivel" INTEGER
);
CREATE INDEX IF NOT EXISTS "idx_tb_promedios_honor_school_id" ON "tb_promedios_honor" ("school_id");
ALTER TABLE "tb_promedios_honor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tb_promedios_honor" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tb_promedios_honor" ON "tb_promedios_honor";
CREATE POLICY "tenant_isolation_tb_promedios_honor" ON "tb_promedios_honor" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tb_promedios_honor" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "teachers_and_users_ids" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "teacher_id" BIGINT,
  "user_id" BIGINT,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_teachers_and_users_ids_school_id" ON "teachers_and_users_ids" ("school_id");
ALTER TABLE "teachers_and_users_ids" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teachers_and_users_ids" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_teachers_and_users_ids" ON "teachers_and_users_ids";
CREATE POLICY "tenant_isolation_teachers_and_users_ids" ON "teachers_and_users_ids" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "teachers_and_users_ids" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "te_evaluations" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "teacher_id" INTEGER,
  "nombre" VARCHAR(250),
  "descripcion" TEXT,
  "num_preguntas" SMALLINT DEFAULT 10,
  "esquema" SMALLINT DEFAULT 1,
  "intentos" SMALLINT DEFAULT 1,
  "tiempo" SMALLINT DEFAULT 0,
  "paginas" SMALLINT DEFAULT 1,
  "hora_apertura" VARCHAR(30),
  "hora_cierre" VARCHAR(30),
  "fecha_cierre" DATE,
  "fecha" DATE,
  "estado" SMALLINT DEFAULT 1,
  "publicada" SMALLINT DEFAULT 0,
  "auto_calificar" SMALLINT DEFAULT 0,
  "periodo" VARCHAR(1) DEFAULT '1',
  "year" SMALLINT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_te_evaluations_school_id" ON "te_evaluations" ("school_id");
ALTER TABLE "te_evaluations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "te_evaluations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_te_evaluations" ON "te_evaluations";
CREATE POLICY "tenant_isolation_te_evaluations" ON "te_evaluations" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "te_evaluations" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "te_evaluation_answers" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "question_id" BIGINT,
  "respuesta" VARCHAR(250),
  "valor" NUMERIC(6,2),
  "verdadera" SMALLINT DEFAULT 0,
  "estado" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_te_evaluation_answers_school_id" ON "te_evaluation_answers" ("school_id");
ALTER TABLE "te_evaluation_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "te_evaluation_answers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_te_evaluation_answers" ON "te_evaluation_answers";
CREATE POLICY "tenant_isolation_te_evaluation_answers" ON "te_evaluation_answers" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "te_evaluation_answers" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "te_evaluation_column" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "evaluation_id" BIGINT,
  "column_id" INTEGER,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_te_evaluation_column_school_id" ON "te_evaluation_column" ("school_id");
ALTER TABLE "te_evaluation_column" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "te_evaluation_column" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_te_evaluation_column" ON "te_evaluation_column";
CREATE POLICY "tenant_isolation_te_evaluation_column" ON "te_evaluation_column" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "te_evaluation_column" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "te_evaluation_courses" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "evaluation_id" BIGINT,
  "course_id" INTEGER,
  "column_note_id" INTEGER,
  "column_note" VARCHAR(20) DEFAULT '',
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_te_evaluation_courses_school_id" ON "te_evaluation_courses" ("school_id");
ALTER TABLE "te_evaluation_courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "te_evaluation_courses" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_te_evaluation_courses" ON "te_evaluation_courses";
CREATE POLICY "tenant_isolation_te_evaluation_courses" ON "te_evaluation_courses" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "te_evaluation_courses" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "te_evaluation_questions" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "evaluation_id" BIGINT,
  "type_id" INTEGER DEFAULT 1,
  "pregunta" TEXT,
  "descripcion" TEXT,
  "valor" NUMERIC(6,2),
  "num_respuestas" INTEGER DEFAULT 1,
  "estado" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_te_evaluation_questions_school_id" ON "te_evaluation_questions" ("school_id");
ALTER TABLE "te_evaluation_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "te_evaluation_questions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_te_evaluation_questions" ON "te_evaluation_questions";
CREATE POLICY "tenant_isolation_te_evaluation_questions" ON "te_evaluation_questions" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "te_evaluation_questions" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "te_evaluation_response_history" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "shared_evaluation_id" BIGINT,
  "question_id" BIGINT,
  "answer_id" BIGINT,
  "intento" INTEGER,
  "respuesta_abierta" TEXT,
  "valor" NUMERIC(6,2),
  "calificada" SMALLINT DEFAULT 0,
  "correcta" SMALLINT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_te_evaluation_response_history_school_id" ON "te_evaluation_response_history" ("school_id");
ALTER TABLE "te_evaluation_response_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "te_evaluation_response_history" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_te_evaluation_response_history" ON "te_evaluation_response_history";
CREATE POLICY "tenant_isolation_te_evaluation_response_history" ON "te_evaluation_response_history" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "te_evaluation_response_history" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "te_evaluation_result" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "shared_evaluation_id" BIGINT,
  "res_verdaderas" SMALLINT DEFAULT 0,
  "res_falsas" SMALLINT DEFAULT 0,
  "res_sin_responder" SMALLINT DEFAULT 0,
  "res_abiertas" SMALLINT DEFAULT 0,
  "hora_inicio" TIMESTAMPTZ,
  "hora_final" TIMESTAMPTZ,
  "tiempo" SMALLINT DEFAULT 0,
  "segundos" SMALLINT DEFAULT 0,
  "punataje" NUMERIC(6,2) DEFAULT 0.00,
  "intento" SMALLINT DEFAULT 0,
  "estado" SMALLINT DEFAULT 0,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_te_evaluation_result_school_id" ON "te_evaluation_result" ("school_id");
ALTER TABLE "te_evaluation_result" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "te_evaluation_result" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_te_evaluation_result" ON "te_evaluation_result";
CREATE POLICY "tenant_isolation_te_evaluation_result" ON "te_evaluation_result" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "te_evaluation_result" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "te_shared_evaluation" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "evaluation_id" BIGINT,
  "enrollment_id" INTEGER,
  "eread" SMALLINT DEFAULT 0,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_te_shared_evaluation_school_id" ON "te_shared_evaluation" ("school_id");
ALTER TABLE "te_shared_evaluation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "te_shared_evaluation" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_te_shared_evaluation" ON "te_shared_evaluation";
CREATE POLICY "tenant_isolation_te_shared_evaluation" ON "te_shared_evaluation" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "te_shared_evaluation" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "te_type_questions_evaluation" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "descripcion" VARCHAR(250),
  "estado" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_te_type_questions_evaluation_school_id" ON "te_type_questions_evaluation" ("school_id");
ALTER TABLE "te_type_questions_evaluation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "te_type_questions_evaluation" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_te_type_questions_evaluation" ON "te_type_questions_evaluation";
CREATE POLICY "tenant_isolation_te_type_questions_evaluation" ON "te_type_questions_evaluation" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "te_type_questions_evaluation" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tiempo_asignado" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(60),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tiempo_asignado_school_id" ON "tiempo_asignado" ("school_id");
ALTER TABLE "tiempo_asignado" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tiempo_asignado" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tiempo_asignado" ON "tiempo_asignado";
CREATE POLICY "tenant_isolation_tiempo_asignado" ON "tiempo_asignado" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tiempo_asignado" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tipoenergia" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "cod_ener" VARCHAR(1),
  "columna3" VARCHAR(31)
);
CREATE INDEX IF NOT EXISTS "idx_tipoenergia_school_id" ON "tipoenergia" ("school_id");
ALTER TABLE "tipoenergia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tipoenergia" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tipoenergia" ON "tipoenergia";
CREATE POLICY "tenant_isolation_tipoenergia" ON "tipoenergia" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tipoenergia" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tipo_discapacidad" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "nombre" VARCHAR(250),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tipo_discapacidad_school_id" ON "tipo_discapacidad" ("school_id");
ALTER TABLE "tipo_discapacidad" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tipo_discapacidad" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tipo_discapacidad" ON "tipo_discapacidad";
CREATE POLICY "tenant_isolation_tipo_discapacidad" ON "tipo_discapacidad" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tipo_discapacidad" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tipo_establecimiento" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_test" INTEGER NOT NULL,
  "tipo" VARCHAR(20),
  PRIMARY KEY ("school_id", "id_test")
);
CREATE INDEX IF NOT EXISTS "idx_tipo_establecimiento_school_id" ON "tipo_establecimiento" ("school_id");
ALTER TABLE "tipo_establecimiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tipo_establecimiento" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tipo_establecimiento" ON "tipo_establecimiento";
CREATE POLICY "tenant_isolation_tipo_establecimiento" ON "tipo_establecimiento" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tipo_establecimiento" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tipo_procesos_educativos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "nombre_proceso" VARCHAR(200),
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tipo_procesos_educativos_school_id" ON "tipo_procesos_educativos" ("school_id");
ALTER TABLE "tipo_procesos_educativos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tipo_procesos_educativos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tipo_procesos_educativos" ON "tipo_procesos_educativos";
CREATE POLICY "tenant_isolation_tipo_procesos_educativos" ON "tipo_procesos_educativos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tipo_procesos_educativos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tl_course_live_classes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "class_id" BIGINT,
  "course_id" INTEGER,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tl_course_live_classes_school_id" ON "tl_course_live_classes" ("school_id");
ALTER TABLE "tl_course_live_classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tl_course_live_classes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tl_course_live_classes" ON "tl_course_live_classes";
CREATE POLICY "tenant_isolation_tl_course_live_classes" ON "tl_course_live_classes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tl_course_live_classes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tl_live_classes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "teacher_id" INTEGER,
  "class_name" VARCHAR(250),
  "class_description" VARCHAR(250),
  "url_file" VARCHAR(250),
  "closing_date" DATE,
  "closing_time" VARCHAR(10),
  "closing_date_at" TIMESTAMPTZ,
  "transmission_start_time" TIMESTAMPTZ,
  "transmission_closing_time" TIMESTAMPTZ,
  "class_time" SMALLINT DEFAULT 0,
  "active" SMALLINT DEFAULT 1,
  "transmitting" SMALLINT DEFAULT 0,
  "year" SMALLINT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tl_live_classes_school_id" ON "tl_live_classes" ("school_id");
ALTER TABLE "tl_live_classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tl_live_classes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tl_live_classes" ON "tl_live_classes";
CREATE POLICY "tenant_isolation_tl_live_classes" ON "tl_live_classes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tl_live_classes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tl_students_live_classes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "class_id" BIGINT,
  "enrollment_id" INTEGER,
  "isit_read" SMALLINT DEFAULT 0,
  "reading_time" TIMESTAMPTZ,
  "transmitting" SMALLINT DEFAULT 0,
  "transmission_start_time" TIMESTAMPTZ,
  "transmission_closing_time" TIMESTAMPTZ,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tl_students_live_classes_school_id" ON "tl_students_live_classes" ("school_id");
ALTER TABLE "tl_students_live_classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tl_students_live_classes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tl_students_live_classes" ON "tl_students_live_classes";
CREATE POLICY "tenant_isolation_tl_students_live_classes" ON "tl_students_live_classes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tl_students_live_classes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tl_student_live_class_history" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "student_live_class_id" BIGINT,
  "entry_time" TIMESTAMPTZ,
  "departur_time" TIMESTAMPTZ,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tl_student_live_class_history_school_id" ON "tl_student_live_class_history" ("school_id");
ALTER TABLE "tl_student_live_class_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tl_student_live_class_history" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tl_student_live_class_history" ON "tl_student_live_class_history";
CREATE POLICY "tenant_isolation_tl_student_live_class_history" ON "tl_student_live_class_history" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tl_student_live_class_history" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_aux_candidate_votes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "candidate_id" BIGINT,
  "enrollment_id" INTEGER,
  "polling_station_id" BIGINT,
  "candidacy_id" INTEGER,
  "year" SMALLINT,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_aux_candidate_votes_school_id" ON "tp_aux_candidate_votes" ("school_id");
ALTER TABLE "tp_aux_candidate_votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_aux_candidate_votes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_aux_candidate_votes" ON "tp_aux_candidate_votes";
CREATE POLICY "tenant_isolation_tp_aux_candidate_votes" ON "tp_aux_candidate_votes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_aux_candidate_votes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_aux_white_vote" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "white_vote_id" BIGINT,
  "enrollment_id" INTEGER,
  "polling_station_id" BIGINT,
  "candidacy_id" INTEGER,
  "year" SMALLINT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_aux_white_vote_school_id" ON "tp_aux_white_vote" ("school_id");
ALTER TABLE "tp_aux_white_vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_aux_white_vote" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_aux_white_vote" ON "tp_aux_white_vote";
CREATE POLICY "tenant_isolation_tp_aux_white_vote" ON "tp_aux_white_vote" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_aux_white_vote" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_candidacies" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "candidacy_name" VARCHAR(250),
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_candidacies_school_id" ON "tp_candidacies" ("school_id");
ALTER TABLE "tp_candidacies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_candidacies" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_candidacies" ON "tp_candidacies";
CREATE POLICY "tenant_isolation_tp_candidacies" ON "tp_candidacies" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_candidacies" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_candidates" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "enrollment_id" INTEGER,
  "candidacy_id" INTEGER DEFAULT 1,
  "year" SMALLINT,
  "number" VARCHAR(12),
  "image" VARCHAR(250) DEFAULT 'assets/img/avatars/empty.png',
  "state" SMALLINT DEFAULT 1,
  "type" SMALLINT DEFAULT 2,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_candidates_school_id" ON "tp_candidates" ("school_id");
ALTER TABLE "tp_candidates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_candidates" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_candidates" ON "tp_candidates";
CREATE POLICY "tenant_isolation_tp_candidates" ON "tp_candidates" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_candidates" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_candidatos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "id_matric" INTEGER,
  "nom_candidato" INTEGER,
  "numero" VARCHAR(4),
  "estado" INTEGER DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_candidatos_school_id" ON "tp_candidatos" ("school_id");
ALTER TABLE "tp_candidatos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_candidatos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_candidatos" ON "tp_candidatos";
CREATE POLICY "tenant_isolation_tp_candidatos" ON "tp_candidatos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_candidatos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_control_panel" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "year" SMALLINT,
  "school_name" VARCHAR(500),
  "voting_table" INTEGER DEFAULT 300,
  "discrimination_based" SMALLINT DEFAULT 1,
  "null_vote_attempts" SMALLINT DEFAULT 1,
  "voting_type" SMALLINT DEFAULT 1,
  "certificate_header" TEXT,
  "start_date" DATE,
  "closing_time" VARCHAR(20),
  "start_time" VARCHAR(20),
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_control_panel_school_id" ON "tp_control_panel" ("school_id");
ALTER TABLE "tp_control_panel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_control_panel" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_control_panel" ON "tp_control_panel";
CREATE POLICY "tenant_isolation_tp_control_panel" ON "tp_control_panel" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_control_panel" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_degrees_per_table" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "polling_station_id" BIGINT,
  "grade_id" INTEGER,
  "group_name" VARCHAR(10),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_degrees_per_table_school_id" ON "tp_degrees_per_table" ("school_id");
ALTER TABLE "tp_degrees_per_table" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_degrees_per_table" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_degrees_per_table" ON "tp_degrees_per_table";
CREATE POLICY "tenant_isolation_tp_degrees_per_table" ON "tp_degrees_per_table" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_degrees_per_table" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_grados_sedes_mesa" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_mesa" INTEGER,
  "cod_grado" VARCHAR(2),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_grados_sedes_mesa_school_id" ON "tp_grados_sedes_mesa" ("school_id");
ALTER TABLE "tp_grados_sedes_mesa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_grados_sedes_mesa" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_grados_sedes_mesa" ON "tp_grados_sedes_mesa";
CREATE POLICY "tenant_isolation_tp_grados_sedes_mesa" ON "tp_grados_sedes_mesa" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_grados_sedes_mesa" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_jurados" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_mesa" INTEGER,
  "nom_jurado" VARCHAR(120),
  "cargo" VARCHAR(120),
  "foto" BYTEA,
  "mime" VARCHAR(6),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_jurados_school_id" ON "tp_jurados" ("school_id");
ALTER TABLE "tp_jurados" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_jurados" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_jurados" ON "tp_jurados";
CREATE POLICY "tenant_isolation_tp_jurados" ON "tp_jurados" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_jurados" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_juries" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "poling_station_id" BIGINT,
  "name_jury" VARCHAR(120),
  "jury_duty" VARCHAR(120) DEFAULT '',
  "photo" TEXT DEFAULT '',
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_juries_school_id" ON "tp_juries" ("school_id");
ALTER TABLE "tp_juries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_juries" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_juries" ON "tp_juries";
CREATE POLICY "tenant_isolation_tp_juries" ON "tp_juries" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_juries" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_mesas_votacion" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "nom_mesa" VARCHAR(250),
  "num_mesa" INTEGER,
  "ubicacion" VARCHAR(250),
  "estado" INTEGER,
  "hora_inicio" TIME,
  "hora_final" TIME,
  "año" SMALLINT,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_mesas_votacion_school_id" ON "tp_mesas_votacion" ("school_id");
ALTER TABLE "tp_mesas_votacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_mesas_votacion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_mesas_votacion" ON "tp_mesas_votacion";
CREATE POLICY "tenant_isolation_tp_mesas_votacion" ON "tp_mesas_votacion" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_mesas_votacion" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_panel_control" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "año" SMALLINT,
  "voto_x_mesa" INTEGER DEFAULT 300,
  "discriminar_x_sede" INTEGER DEFAULT 1,
  "base_de_datos" INTEGER DEFAULT 1,
  "nom_inst" TEXT,
  "logo" BYTEA,
  "nom_certificado" VARCHAR(250),
  "int_voto_nulo" INTEGER DEFAULT 1,
  "inicio_jorn" DATE,
  "hora_inicio" VARCHAR(20),
  "hora_final" VARCHAR(20),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_panel_control_school_id" ON "tp_panel_control" ("school_id");
ALTER TABLE "tp_panel_control" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_panel_control" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_panel_control" ON "tp_panel_control";
CREATE POLICY "tenant_isolation_tp_panel_control" ON "tp_panel_control" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_panel_control" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_polling_stations" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "year" SMALLINT,
  "table_name" VARCHAR(250),
  "table_number" VARCHAR(10),
  "table_location" VARCHAR(250),
  "start_time" TIMESTAMPTZ,
  "closing_time" TIMESTAMPTZ,
  "state" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_polling_stations_school_id" ON "tp_polling_stations" ("school_id");
ALTER TABLE "tp_polling_stations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_polling_stations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_polling_stations" ON "tp_polling_stations";
CREATE POLICY "tenant_isolation_tp_polling_stations" ON "tp_polling_stations" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_polling_stations" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_sedes_mesa" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_mesa" INTEGER,
  "id_sede" INTEGER,
  "grados_votantes" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_sedes_mesa_school_id" ON "tp_sedes_mesa" ("school_id");
ALTER TABLE "tp_sedes_mesa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_sedes_mesa" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_sedes_mesa" ON "tp_sedes_mesa";
CREATE POLICY "tenant_isolation_tp_sedes_mesa" ON "tp_sedes_mesa" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_sedes_mesa" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_table_headquarters" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "polling_station_id" BIGINT,
  "headquarter_id" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_table_headquarters_school_id" ON "tp_table_headquarters" ("school_id");
ALTER TABLE "tp_table_headquarters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_table_headquarters" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_table_headquarters" ON "tp_table_headquarters";
CREATE POLICY "tenant_isolation_tp_table_headquarters" ON "tp_table_headquarters" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_table_headquarters" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_votes" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "year" SMALLINT,
  "enrollment_id" INTEGER,
  "candidacy_id" INTEGER,
  "attempts" SMALLINT DEFAULT 1,
  "state" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_votes_school_id" ON "tp_votes" ("school_id");
ALTER TABLE "tp_votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_votes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_votes" ON "tp_votes";
CREATE POLICY "tenant_isolation_tp_votes" ON "tp_votes" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_votes" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_votos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "id_matric" INTEGER,
  "id_candidato" INTEGER,
  "id_mesa" INTEGER,
  "intentos" INTEGER,
  "estado" INTEGER,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  "año" SMALLINT,
  "tipo" INTEGER,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_votos_school_id" ON "tp_votos" ("school_id");
ALTER TABLE "tp_votos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_votos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_votos" ON "tp_votos";
CREATE POLICY "tenant_isolation_tp_votos" ON "tp_votos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_votos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_voto_blanco" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "id_matric" INTEGER,
  "nom_candidato" TEXT,
  "numero" VARCHAR(4),
  "estado" INTEGER DEFAULT 1,
  "cod_grado" VARCHAR(2),
  "grupo" VARCHAR(2),
  "año" SMALLINT,
  "nombres" VARCHAR(80) DEFAULT 'VOTO EN BLANCO',
  "foto" BYTEA,
  "mime" VARCHAR(80) DEFAULT 'image/jpeg',
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_voto_blanco_school_id" ON "tp_voto_blanco" ("school_id");
ALTER TABLE "tp_voto_blanco" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_voto_blanco" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_voto_blanco" ON "tp_voto_blanco";
CREATE POLICY "tenant_isolation_tp_voto_blanco" ON "tp_voto_blanco" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_voto_blanco" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "tp_white_vote" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" BIGINT NOT NULL,
  "candidacy_id" INTEGER DEFAULT 1,
  "year" SMALLINT,
  "names" VARCHAR(80) DEFAULT 'VOTO EN BLANCO',
  "image" VARCHAR(500) DEFAULT 'assets/img/avatars/empty.png',
  "state" SMALLINT DEFAULT 1,
  "type" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_tp_white_vote_school_id" ON "tp_white_vote" ("school_id");
ALTER TABLE "tp_white_vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tp_white_vote" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_tp_white_vote" ON "tp_white_vote";
CREATE POLICY "tenant_isolation_tp_white_vote" ON "tp_white_vote" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "tp_white_vote" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "transparente" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "transparen" NUMERIC(4,0)
);
CREATE INDEX IF NOT EXISTS "idx_transparente_school_id" ON "transparente" ("school_id");
ALTER TABLE "transparente" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transparente" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_transparente" ON "transparente";
CREATE POLICY "tenant_isolation_transparente" ON "transparente" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "transparente" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ubicacion" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(26),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ubicacion_school_id" ON "ubicacion" ("school_id");
ALTER TABLE "ubicacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ubicacion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ubicacion" ON "ubicacion";
CREATE POLICY "tenant_isolation_ubicacion" ON "ubicacion" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ubicacion" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ubicacionpersonal" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "ubicacion" VARCHAR(26),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ubicacionpersonal_school_id" ON "ubicacionpersonal" ("school_id");
ALTER TABLE "ubicacionpersonal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ubicacionpersonal" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ubicacionpersonal" ON "ubicacionpersonal";
CREATE POLICY "tenant_isolation_ubicacionpersonal" ON "ubicacionpersonal" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ubicacionpersonal" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "ubicacion_advos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo_ubicacion" VARCHAR(60),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_ubicacion_advos_school_id" ON "ubicacion_advos" ("school_id");
ALTER TABLE "ubicacion_advos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ubicacion_advos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ubicacion_advos" ON "ubicacion_advos";
CREATE POLICY "tenant_isolation_ubicacion_advos" ON "ubicacion_advos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "ubicacion_advos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "useraces" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_user" INTEGER,
  "horaingreso" TIMESTAMPTZ,
  "horasalida" TIMESTAMPTZ,
  "infopc" VARCHAR(250)
);
CREATE INDEX IF NOT EXISTS "idx_useraces_school_id" ON "useraces" ("school_id");
ALTER TABLE "useraces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "useraces" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_useraces" ON "useraces";
CREATE POLICY "tenant_isolation_useraces" ON "useraces" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "useraces" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "user_types" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "name" VARCHAR(60),
  "description" VARCHAR(255),
  "active" SMALLINT DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_user_types_school_id" ON "user_types" ("school_id");
ALTER TABLE "user_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_types" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_user_types" ON "user_types";
CREATE POLICY "tenant_isolation_user_types" ON "user_types" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "user_types" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "usuarios_oficina" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "id_inst" INTEGER,
  "nombre" VARCHAR(200),
  "estado" INTEGER DEFAULT 1,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_usuarios_oficina_school_id" ON "usuarios_oficina" ("school_id");
ALTER TABLE "usuarios_oficina" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuarios_oficina" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_usuarios_oficina" ON "usuarios_oficina";
CREATE POLICY "tenant_isolation_usuarios_oficina" ON "usuarios_oficina" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "usuarios_oficina" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "valnotas" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_inst" INTEGER NOT NULL DEFAULT 1,
  "orden" VARCHAR(1) NOT NULL,
  "des_crip" VARCHAR(20),
  "desde" NUMERIC(6,2),
  "hasta" NUMERIC(6,2),
  "abrev" VARCHAR(2),
  "AÑO" INTEGER NOT NULL DEFAULT 2011,
  PRIMARY KEY ("school_id", "id_inst", "orden", "AÑO")
);
CREATE INDEX IF NOT EXISTS "idx_valnotas_school_id" ON "valnotas" ("school_id");
ALTER TABLE "valnotas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "valnotas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_valnotas" ON "valnotas";
CREATE POLICY "tenant_isolation_valnotas" ON "valnotas" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "valnotas" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "vinculacion_advos" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "tipo" VARCHAR(120),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_vinculacion_advos_school_id" ON "vinculacion_advos" ("school_id");
ALTER TABLE "vinculacion_advos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vinculacion_advos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_vinculacion_advos" ON "vinculacion_advos";
CREATE POLICY "tenant_isolation_vinculacion_advos" ON "vinculacion_advos" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "vinculacion_advos" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "vinculapersonal" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "nombre" VARCHAR(100),
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS "idx_vinculapersonal_school_id" ON "vinculapersonal" ("school_id");
ALTER TABLE "vinculapersonal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vinculapersonal" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_vinculapersonal" ON "vinculapersonal";
CREATE POLICY "tenant_isolation_vinculapersonal" ON "vinculapersonal" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "vinculapersonal" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "zona" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id_zona" INTEGER NOT NULL,
  "zone_name" VARCHAR(15),
  PRIMARY KEY ("school_id", "id_zona")
);
CREATE INDEX IF NOT EXISTS "idx_zona_school_id" ON "zona" ("school_id");
ALTER TABLE "zona" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "zona" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_zona" ON "zona";
CREATE POLICY "tenant_isolation_zona" ON "zona" USING ("school_id" = current_tenant_school_id()) WITH CHECK ("school_id" = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "zona" TO asaie_app_runtime;

CREATE TABLE IF NOT EXISTS "school_users_accounts" (
  "school_id" BIGINT NOT NULL DEFAULT 6 REFERENCES schools(id) ON DELETE CASCADE,
  "id" INTEGER NOT NULL,
  "user_id" BIGINT,
  "user_type" INTEGER DEFAULT 3,
  "names" VARCHAR(200),
  "last_name" VARCHAR(200),
  "username" VARCHAR(200),
  "password" VARCHAR(200),
  "question" VARCHAR(200),
  "respuest" VARCHAR(200),
  "email" VARCHAR(200),
  "lectur" SMALLINT DEFAULT 0,
  "message" TEXT,
  "date" DATE,
  "image" VARCHAR(250),
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  "mime" VARCHAR(50) DEFAULT 'image/jpeg',
  "active" SMALLINT DEFAULT 1,
  PRIMARY KEY ("school_id", "id")
);
CREATE INDEX IF NOT EXISTS idx_school_users_accounts_school_id ON "school_users_accounts" ("school_id");
ALTER TABLE "school_users_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "school_users_accounts" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_school_users_accounts ON "school_users_accounts";
CREATE POLICY tenant_isolation_school_users_accounts ON "school_users_accounts" USING (school_id = current_tenant_school_id()) WITH CHECK (school_id = current_tenant_school_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON "school_users_accounts" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp00_view_porcentaje_areas" AS
SELECT
  tn.school_id,
  MAX(tn.periodo) AS periodo,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(tc.id_grado) AS id_grado,
  tn.year,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion * tmc.porciento / 100.0 ELSE tn.final * tmc.porciento / 100.0 END), 2) AS final,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS prom,
  MAX(tmc.porciento) AS porciento
FROM "nscp00" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.year
ORDER BY tn.id_matric, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp00_view_porcentaje_areas" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp00_view_porcentaje_areas_periodos" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(CASE WHEN tn.nota_habilitacion > tn.final THEN ROUND(tn.nota_habilitacion * tmc.porciento / 100.0, 2) ELSE ROUND(tn.final * tmc.porciento / 100.0, 2) END) AS final,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS prom,
  MAX(tmc.porciento) AS porciento,
  tn.periodo,
  MAX(tc.year) AS year,
  MAX(tc.id_grado) AS id_grado
FROM "nscp00" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.periodo
ORDER BY tn.id_matric, tn.periodo, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp00_view_porcentaje_areas_periodos" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp00_view_prom_por_area" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(tc.id_grado) AS id_grado,
  tn.year,
  MAX(tn.periodo) AS periodo,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS final,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS prom,
  MAX(tmc.porciento) AS porciento
FROM "nscp00" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.year
ORDER BY tn.id_matric, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp00_view_prom_por_area" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp00_view_prom_por_area_periodos" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS final,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS prom,
  MAX(tmc.porciento) AS porciento,
  tn.periodo,
  MAX(tc.year) AS year,
  MAX(tc.id_grado) AS id_grado
FROM "nscp00" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.periodo
ORDER BY tn.id_matric, tn.periodo, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp00_view_prom_por_area_periodos" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp001_view_porcentaje_areas" AS
SELECT
  tn.school_id,
  MAX(tn.periodo) AS periodo,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(tc.id_grado) AS id_grado,
  tn.year,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion * tmc.porciento / 100.0 ELSE tn.final * tmc.porciento / 100.0 END), 2) AS final,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS prom,
  MAX(tmc.porciento) AS porciento
FROM "nscp001" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.year
ORDER BY tn.id_matric, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp001_view_porcentaje_areas" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp001_view_porcentaje_areas_periodos" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(CASE WHEN tn.nota_habilitacion > tn.final THEN ROUND(tn.nota_habilitacion * tmc.porciento / 100.0, 2) ELSE ROUND(tn.final * tmc.porciento / 100.0, 2) END) AS final,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS prom,
  MAX(tmc.porciento) AS porciento,
  tn.periodo,
  MAX(tc.year) AS year,
  MAX(tc.id_grado) AS id_grado
FROM "nscp001" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.periodo
ORDER BY tn.id_matric, tn.periodo, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp001_view_porcentaje_areas_periodos" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp001_view_prom_por_area" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(tc.id_grado) AS id_grado,
  tn.year,
  MAX(tn.periodo) AS periodo,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS final,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS prom,
  MAX(tmc.porciento) AS porciento
FROM "nscp001" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.year
ORDER BY tn.id_matric, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp001_view_prom_por_area" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp001_view_prom_por_area_periodos" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS final,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS prom,
  MAX(tmc.porciento) AS porciento,
  tn.periodo,
  MAX(tc.year) AS year,
  MAX(tc.id_grado) AS id_grado
FROM "nscp001" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.periodo
ORDER BY tn.id_matric, tn.periodo, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp001_view_prom_por_area_periodos" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp002_view_porcentaje_areas" AS
SELECT
  tn.school_id,
  MAX(tn.periodo) AS periodo,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(tc.id_grado) AS id_grado,
  tn.year,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion * tmc.porciento / 100.0 ELSE tn.final * tmc.porciento / 100.0 END), 2) AS final,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS prom,
  MAX(tmc.porciento) AS porciento
FROM "nscp002" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.year
ORDER BY tn.id_matric, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp002_view_porcentaje_areas" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp002_view_porcentaje_areas_periodos" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(CASE WHEN tn.nota_habilitacion > tn.final THEN ROUND(tn.nota_habilitacion * tmc.porciento / 100.0, 2) ELSE ROUND(tn.final * tmc.porciento / 100.0, 2) END) AS final,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS prom,
  MAX(tmc.porciento) AS porciento,
  tn.periodo,
  MAX(tc.year) AS year,
  MAX(tc.id_grado) AS id_grado
FROM "nscp002" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.periodo
ORDER BY tn.id_matric, tn.periodo, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp002_view_porcentaje_areas_periodos" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp002_view_prom_por_area" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(tc.id_grado) AS id_grado,
  tn.year,
  MAX(tn.periodo) AS periodo,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS final,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS prom,
  MAX(tmc.porciento) AS porciento
FROM "nscp002" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.year
ORDER BY tn.id_matric, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp002_view_prom_por_area" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp002_view_prom_por_area_periodos" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS final,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS prom,
  MAX(tmc.porciento) AS porciento,
  tn.periodo,
  MAX(tc.year) AS year,
  MAX(tc.id_grado) AS id_grado
FROM "nscp002" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.periodo
ORDER BY tn.id_matric, tn.periodo, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp002_view_prom_por_area_periodos" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp003_view_porcentaje_areas" AS
SELECT
  tn.school_id,
  MAX(tn.periodo) AS periodo,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(tc.id_grado) AS id_grado,
  tn.year,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion * tmc.porciento / 100.0 ELSE tn.final * tmc.porciento / 100.0 END), 2) AS final,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS prom,
  MAX(tmc.porciento) AS porciento
FROM "nscp003" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.year
ORDER BY tn.id_matric, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp003_view_porcentaje_areas" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp003_view_porcentaje_areas_periodos" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(CASE WHEN tn.nota_habilitacion > tn.final THEN ROUND(tn.nota_habilitacion * tmc.porciento / 100.0, 2) ELSE ROUND(tn.final * tmc.porciento / 100.0, 2) END) AS final,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS prom,
  MAX(tmc.porciento) AS porciento,
  tn.periodo,
  MAX(tc.year) AS year,
  MAX(tc.id_grado) AS id_grado
FROM "nscp003" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.periodo
ORDER BY tn.id_matric, tn.periodo, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp003_view_porcentaje_areas_periodos" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp003_view_prom_por_area" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(tc.id_grado) AS id_grado,
  tn.year,
  MAX(tn.periodo) AS periodo,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS final,
  ROUND(AVG(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END), 2) AS prom,
  MAX(tmc.porciento) AS porciento
FROM "nscp003" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.year
ORDER BY tn.id_matric, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp003_view_prom_por_area" TO asaie_app_runtime;

CREATE OR REPLACE VIEW "nscp003_view_prom_por_area_periodos" AS
SELECT
  tn.school_id,
  tn.id_matric,
  tc.id_asig,
  aux.id_area,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS final,
  MAX(ROUND(CASE WHEN tn.nota_habilitacion > tn.final THEN tn.nota_habilitacion ELSE tn.final END, 2)) AS prom,
  MAX(tmc.porciento) AS porciento,
  tn.periodo,
  MAX(tc.year) AS year,
  MAX(tc.id_grado) AS id_grado
FROM "nscp003" tn
LEFT JOIN cursos tc ON tn.school_id = tc.school_id AND tn.id_curso = tc.id AND tn.year = tc.year
LEFT JOIN asignaturas tas ON tc.school_id = tas.school_id AND tc.id_asig = tas.id_pk
LEFT JOIN aux_asignaturas aux ON aux.school_id = tas.school_id AND aux.id_asign = tas.id_pk AND aux.year = tc.year
LEFT JOIN matcurso tmc ON tmc.school_id = tas.school_id AND tmc.id_asig = tas.id_pk AND tmc.year = tc.year AND tmc.id_grado = tc.id_grado
GROUP BY tn.school_id, tn.id_matric, aux.id_area, tc.id_asig, tn.periodo
ORDER BY tn.id_matric, tn.periodo, aux.id_area, tc.id_asig;
GRANT SELECT ON "nscp003_view_prom_por_area_periodos" TO asaie_app_runtime;
