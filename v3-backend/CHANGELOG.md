# Registro de Cambios (Changelog) - ASAIE ÉXODO V3 Backend

Todos los cambios notables de **v3-backend** (NestJS 11 + Fastify 5 + PostgreSQL 17 Unificado con RLS) se documentan en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [3.5.0] - 2026-11-05

### Añadido
- **Diccionario de Datos Oficial Nativo en PostgreSQL 17 (`04-data-dictionary-comments.sql`) y Documentación Markdown (`docs/2026-11-05_17-30_database-data-dictionary.md`):**
  - Registro del `100%` de metadatos descriptivos directamente en el catálogo del motor PostgreSQL 17 (`pg_description` mediante `COMMENT ON TABLE` y `COMMENT ON COLUMN`) para las **135 relaciones (127 tablas base + 8 particiones)** y las **1,127 columnas** del esquema 3NF.
  - Generación del documento maestro [`docs/2026-11-05_17-30_database-data-dictionary.md`](../docs/2026-11-05_17-30_database-data-dictionary.md) estructurado por los 11 dominios funcionales, detallando el propósito de cada tabla, su política RLS y cada columna (nombre en inglés, tipo de dato, nulabilidad y descripción funcional en español).
  - Integración automática de `04-data-dictionary-comments.sql` en [`StaticCatalogsSeedCli`](src/modules/migration/infrastructure/cli/static-catalogs-seed.cli.ts) (`npm run db:seed`) y verificación automatizada en Jest (`tables_without_comment = 0` y `columns_without_comment = 0`).

## [3.4.0] - 2026-11-05

### Añadido
- **Motor de Almacenamiento en la Nube con AWS S3 SDK v3 (`src/shared/infrastructure/storage/aws-s3-storage.adapter.ts`):**
  - Instalación e integración de `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` y `@fastify/multipart` bajo arquitectura hexagonal mediante el puerto [`CloudStoragePort`](src/shared/application/ports/cloud-storage.port.ts) y el adaptador [`AwsS3StorageAdapter`](src/shared/infrastructure/storage/aws-s3-storage.adapter.ts).
  - Resolución automática de la carpeta física del colegio (`schools.storage_folder`, ej. `pto_beato/student-documents/2026/<uuid>-archivo.pdf`) y generación de URLs prefirmadas temporales (`GET` y `PUT`) firmadas con SigV4.
- **Módulo Hexagonal `StorageModule` y Gestión Multi-Tenant de `cloud_files` (`src/modules/storage/`):**
  - Implementación de [`ManageCloudFilesUseCase`](src/modules/storage/application/use-cases/manage-cloud-files.use-case.ts), [`PostgresCloudFileRepository`](src/modules/storage/infrastructure/persistence/postgres-cloud-file.repository.ts) y [`StorageController`](src/modules/storage/infrastructure/http/storage.controller.ts) documentados en Swagger:
    - `POST /api/v1/storage/files/upload` (carga a AWS S3 + registro en `cloud_files` bajo RLS).
    - `POST /api/v1/storage/files/presigned-upload` (genera URL prefirmada `PUT` para carga directa al bucket).
    - `GET /api/v1/storage/files/:schoolId` (lista archivos del colegio aplicando RLS).
    - `GET /api/v1/storage/files/:schoolId/:fileId/presigned-url` (genera URL prefirmada `GET` de descarga).
    - `DELETE /api/v1/storage/files/:schoolId/:fileId` (elimina el objeto de S3 y de `cloud_files` bajo RLS).

## [3.3.0] - 2026-11-05

### Añadido
- **Motor de Correos Transaccionales con Nodemailer (`src/shared/infrastructure/mail/nodemailer-smtp.adapter.ts`):**
  - Instalación e integración de `nodemailer` y `@types/nodemailer` bajo arquitectura hexagonal mediante el puerto [`MailSenderPort`](src/shared/application/ports/mail-sender.port.ts) y el adaptador [`NodemailerSmtpMailAdapter`](src/shared/infrastructure/mail/nodemailer-smtp.adapter.ts).
  - Plantillas institucionales HTML responsivas en español para:
    - Confirmación de correo electrónico (`sendEmailConfirmation`).
    - Recuperación de contraseña con enlace temporal (`sendPasswordResetEmail`).
    - Alerta de seguridad por cambio o restablecimiento de contraseña (`sendPasswordChangedAlert`).
    - Notificaciones por correo del CRM Escolar Omnicanal (`sendCrmOmnichannelNotification`).
- **Flujos de Confirmación de Cuenta, Recuperación y Cambio de Contraseña en IAM (`src/modules/iam/`):**
  - Nuevos casos de uso en [`AuthenticateCommunityUserUseCase`](src/modules/iam/application/use-cases/authenticate-community-user.use-case.ts) y endpoints documentados en Swagger en [`IamController`](src/modules/iam/infrastructure/http/iam.controller.ts):
    - `POST /api/v1/auth/request-email-confirmation` y `POST /api/v1/auth/confirm-email` (`email_verified_at`).
    - `POST /api/v1/auth/forgot-password` y `POST /api/v1/auth/reset-password` (token JWT de 30 minutos + actualización `scrypt`).
    - `POST /api/v1/auth/change-password` (verificación de contraseña actual + actualización `scrypt` + alerta de seguridad por correo).

## [3.2.0] - 2026-11-05

### Añadido
- **Extensión Vectorial `pgvector 0.8.1` en PostgreSQL 17 (`01-extensions.sql` y `02-core-schema-rls.sql`):**
  - Activación de `CREATE EXTENSION IF NOT EXISTS "vector"` con soporte de vectores de **768 dimensiones (`vector(768)`)** e índice aproximado de vecino más cercano **HNSW (`USING hnsw (embedding vector_cosine_ops)`)**.
- **Dominio 11 — CRM Escolar Omnicanal y Búsqueda Semántica (`02-core-schema-rls.sql` y `03-static-catalogs-seeds.sql`):**
  - Nuevas tablas 100% normalizadas en 3NF y en inglés para conectar a toda la comunidad educativa (Directivos, Administrativos, Docentes, Estudiantes y Padres/Acudientes): `crm_channels` (catálogo estático #54), `crm_ticket_categories` (catálogo estático #55), `crm_conversations`, `crm_conversation_participants`, `crm_messages`, `crm_announcements`, `crm_announcement_receipts`, `crm_support_tickets` y `crm_knowledge_embeddings`.
  - Políticas **Row-Level Security (`RLS`)** aplicadas a las 7 tablas operativas del CRM Escolar para garantizar aislamiento estricto por `school_id`.
- **Módulo Hexagonal `CrmModule` (`src/modules/crm/`):**
  - Implementación de `ManageSchoolCrmUseCase`, `PostgresSchoolCrmRepository` y `CrmController` para gestionar hilos de conversación omnicanal (`POST /api/v1/crm/conversations`, `GET /api/v1/crm/conversations/:schoolId`), indexación documental (`POST /api/v1/crm/knowledge/embeddings`) y búsqueda semántica por distancia coseno `<=>` (`POST /api/v1/crm/knowledge/semantic-search`) sobre PEI, SIEE, Manual de Convivencia y mensajes del CRM.
- **Documentación Interactiva OpenAPI 3.0 / Swagger (`src/shared/infrastructure/http/swagger/openapi-swagger.config.ts`):**
  - Exposición de interfaz interactiva Swagger UI en `GET /api/docs`, especificación JSON en `GET /api/docs-json` y YAML en `GET /api/docs-yaml` sobre Fastify 5.
  - Decoración completa (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`, `@ApiHeader`, `@ApiResponse`, `@ApiProperty`) en todos los controladores (`TenantController`, `IamController`, `GradingController`, `CrmController`, `ReportingController`).

## [3.1.0] - 2026-11-05

### Añadido
- **Esquema Relacional 100% Normalizado (1NF, 2NF, 3NF/BCNF) en Inglés (`02-core-schema-rls.sql`):**
  - Consolidación de las 283 tablas dispersas del sistema anterior en **126 relaciones normalizadas** (118 tablas base y 8 particiones anuales) agrupadas en 10 dominios funcionales (`countries`, `schools`, `users`, `user_school_memberships`, `campuses`, `grades`, `academic_groups`, `academic_areas`, `subjects`, `course_assignments`, `student_profiles`, `teacher_profiles`, `family_profiles`, `student_enrollments`, `academic_grades`, `academic_grade_items`, `academic_grade_achievements`, `observer_annotations`, `virtual_activities`, `online_evaluations`, `school_elections`, `election_votes`, etc.).
  - Eliminación total de grupos repetitivos (`n1..n30`, `l1..l20`) y tablas fragmentadas por jornada (`nscp00..003`).
  - Nomenclatura 100% en inglés (`snake_case`) verificada con `0` identificadores en español o con caracteres especiales (`ñ`).
  - Políticas **Row-Level Security (`RLS`)** forzadas en las 64 tablas operativas por colegio (`school_id = current_tenant_school_id()`).
- **Seeds Oficiales de 53 Catálogos Estáticos y de Configuración (`03-static-catalogs-seeds.sql` y `npm run db:seed`):**
  - Sembrado automático de más de **2,600 registros oficiales MEN / DANE / SIMAT**: 250 países (`countries`), 34 departamentos (`departments`), 1,127 municipios (`cities`), 646 resguardos indígenas (`indigenous_reserves`), 99 etnias (`ethnic_groups`), 68 EPS (`health_providers`), 52 asignaturas del banco MEN (`subjects_bank`), 39 grados del escalafón docente (`teacher_pay_scales`), 24 grados SIMAT (`grades_catalog`), 23 metodologías (`study_methodologies`), 22 áreas de enseñanza (`teaching_areas`), 18 estados de promoción (`promotion_statuses_catalog`), entre otros.
  - Servicio CLI [`StaticCatalogsSeedCli`](src/modules/migration/infrastructure/cli/static-catalogs-seed.cli.ts) ejecutable mediante `npm run db:seed`.

### Eliminado
- Eliminado el volcado crudo de tablas legacy sin normalizar (`03-full-unified-school-schema.sql` y `full-database-migration.cli.ts`) para garantizar que la base de datos nueva nazca libre de deuda técnica antes del proceso futuro de migración de datos.

## [3.0.0] - 2026-11-05

### Añadido
- Inicialización de `v3-backend` con **NestJS 11**, **Fastify 5** y **Arquitectura Hexagonal (Puertos y Adaptadores)**.
- Implementación de `SmartLoggerService` (JSON estructurado con enmascaramiento de datos sensibles) y `PostgresRlsService` (transacciones aisladas por `school_id` con rol `asaie_app_runtime` `NOBYPASSRLS`).
- Módulos de dominio iniciales: `TenantModule`, `IamModule` (acceso unificado para toda la comunidad educativa y cambio de colegio/rol firmado en servidor), `GradingModule` y `ReportingModule` (continuidad de los 192 reportes `.jrxml` de JasperReports).
