# Registro de Cambios (Changelog) - ASAIE ÉXODO V3 Backend

Todos los cambios notables de **v3-backend** (NestJS 11 + Fastify 5 + PostgreSQL 17 Unificado con RLS) se documentan en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [3.16.0] - 2026-11-21

### Añadido
- **Esquema Unificado PostgreSQL 17 (`01..04`, `155` relaciones, `140` tablas runtime + `15` particiones RLS con `REVOKE ALL`, `0` columnas sin comentario):**
  - Se incorporan **12 tablas operativas legacy P0/P1** faltantes en el núcleo: `campus_study_methodologies` (`cong_metod`), `grade_group_memberships` (`aux_grados_agrupados`), `teacher_academic_years` (`aux_docentes`), `subject_area_assignments` (`aux_asignaturas` por año), `academic_suggestions` (`sugerencias`), `academic_score_suggestions` (`sug_nscp00..003`, particionada con PK natural), `student_enrollment_access_controls` (`student_access`), `advance_promotions` + `advance_promotion_subject_details` (`promoted_header` / `promoted_observation` / `detail_promoted`), `observer_criteria_evaluations` (`obs_items_modelo_3`), `document_number_sequences` (`certificate_numbers`) y `document_templates` (`config_const_cert`, `config_acta_grado`, `carnets`).
  - Se añaden semillas nativas en `03-static-catalogs-seeds.sql` para `document_types (id=20, PPT)` y `system_modules` (`ACADEMIC_ACTIVITIES`, `SIMULACRUM`), eliminando parches en tiempo de ejecución.
  - Se completan reglas SIEE Decreto 1290 (`academic_grading_rules`, `grading_scales.is_failing`/`is_gradable`, `academic_periods.is_gradable`, `evaluation_dimension_columns.column_type`/`is_editable`, `teacher_gradebook_columns` colores y vínculos, `subjects.is_excluded_from_average`) y `curriculum_study_plans.weekly_hours` / `course_assignments.weekly_hours` pasan a `NUMERIC(4,1)` para preservar intensidades decimales reales de `matcurso.ih`.

### Cambiado
- **Rediseño Limpio y Alineado de `academic_scores` (reemplaza `academic_grades`, `-31.5%` más compacta que MariaDB origen):**
  - Renombramiento unificado `academic_grades` → `academic_scores`, `academic_grade_achievements` → `academic_score_achievements` (particionada con PK natural compuesta `(school_id, academic_year, academic_score_id, achievement_standard_id)` sin `id` surrogado) y `academic_grade_audit_logs` → `academic_score_audit_logs`.
  - Ordenamiento físico óptimo de columnas en PostgreSQL (`8B → 4B → 2B → 1B → short-varlena`, `0` bytes de padding interno), eliminando **12 columnas inventadas/no usadas** (`conceptual_score`, `procedural_score`, `attitudinal_score`, `evaluation_exam_score`, `period_id`, `leveling_score`, `effective_score`, `teacher_observations`, `has_pre_report_alert`, `is_locked`, `updated_by_user_id`, `created_at`) y recuperando **3 columnas reales** de `nscp00..003` (`lost_score`, `is_leveled`, `leveled_at`) junto a `recovery_score` nullable y `n1..n30 NUMERIC(5,2) DEFAULT NULL`.
  - Ajuste de `student_enrollments` a `UNIQUE (school_id, student_profile_id, academic_year, grade_id)` para preservar matrículas duales de Promoción Anticipada intra-año, `users.document_number` nullable sin documentos sintéticos y `period_recovery_records` con `period_number` y `recovery_date` nullables (sin corromper `academic_scores`).
  - Refactorización completa de repositorios hexagonales (`grading`, `academic`, `portal`, `promotion`, `settings`, `migration`), corrección de `school_shifts` en `MigrateLegacySchoolsUseCase` y eliminación de `DELETE /teacher/grades/assigned-achievements/:linkId` en favor de clave natural `DELETE /teacher/grades/assigned-achievements/:academicScoreId/:achievementStandardId`.
  - **Validación en vivo tras recreación limpia (`01..04`) + ETL completo `2011–2026` (IE Franjocal Momil, `163.1 s`) + `VACUUM FULL ANALYZE`:**
    - Tamaño total en disco: **`598.82 MB`** (`-84.4%` vs `3,848 MB` en v1 y **`-31.5%` menor que los `874.2 MB` de MariaDB origen**), con `academic_scores_2026` en **`20 MB`** y consultas por curso/periodo en **`0.100 ms`** (`Index Scan`).
    - Reconciliación completa: `32,018` matrículas canónicas (`99.997%`), `1,449,674` calificaciones (`99.9992%` fidelidad de checksum), `12,391,099` celdas `n1..n30`, `851,894` vínculos de logros, `38,110` vínculos de sugerencias, `25,397` controles de acceso, `2,524` planes de estudio (`matcurso`), `462` asignaciones anuales `aux_asignaturas`, `1,632` registros `aux_docentes`, `675` evaluaciones de criterios Modelo 3, `27,919` promociones y `93,580` rankings.
    - Suite completa **11/11 suites (38/38 tests) PASS en vivo** incluyendo verificación RLS `155` relaciones / `140` tablas runtime / `0` columnas sin comentario.

## [3.15.0] - 2026-11-21

### Añadido
- **Pipeline ETL Histórico Completo en Streaming (`MigrationModule` / `MigrateLegacySchoolEtlUseCase` / `npm run migration:etl`):**
  - Lector nativo sin dependencias externas `LegacyMysqlCliReader` con backpressure (`readline` + `mysql --batch --quick`) y sanitizador defensivo `etl-sanitizer.helper.ts` para migrar bases de datos reales desde MariaDB/MySQL legacy (`mig-schools-admin` + `mig-schools-*`) hacia PostgreSQL 17 RLS con inserciones masivas `UNNEST`, preservación de hashes Laravel `$2y$` (compatibles con `pgcrypto` + rehash automático a `scrypt`), mapeo completo de catálogos (incluyendo `PPT id=20`), consolidación de matrículas canónicas y auditoría automática de reconciliación origen vs destino.
  - Validado en vivo con el historial completo `2011–2026` de IE Franjocal Momil (`school_id = 7`): `9,019` usuarios, `9,028` membresías, `6,495` estudiantes, `4,157` familias, `10,472` cursos, `31,607` matrículas canónicas, `184,941` columnas de planilla, `74,779` logros, `1,449,352` calificaciones con `12,388,139` casillas parciales `n1..n30`, `851,854` vínculos de logros, `27,739` promociones y `93,241` rankings en `149.7 segundos`.

### Cambiado
- **Optimización de Almacenamiento en `academic_grades` (`-81.7%` en disco y `5.4×` más rápido):**
  - Se incorporan `n1..n30 NUMERIC(5,2) DEFAULT NULL` inline directamente en la tabla particionada `academic_grades` (ocupando `0 bytes` en heap por columna vacía en PostgreSQL) y se elimina la tabla hija `academic_grade_items` (y sus 5 particiones), reduciendo el tamaño real de la base de datos migrada de `3,848 MB` a **`704 MB`** (un `19.5%` más compacta que los `874.2 MB` de MariaDB origen) y llevando la lectura de planillas 2026 (`25 MB`) a **`0.093 ms`** sin `JOINs`.
  - Refactorizados `listCourseGradeItems` y `saveGradeItemsBatch` en `PostgresTeacherExtendedRepository` con lista blanca estática (`n1..n30`), cálculo ponderado en memoria y actualización atómica sin alterar contratos REST ni frontend.
  - Actualizada la suite `tenant-rls.spec.ts` para verificar las `133` relaciones (`128` tablas accesibles + `5` particiones protegidas con RLS y `0` columnas sin comentario) — **11/11 suites, 38/38 tests aprobados en vivo**.

## [3.14.0] - 2026-11-21

### Añadido
- **Auto-Registro SaaS Multi-Tenant de Nuevas Instituciones Educativas (`IamModule` / `RegisterSchoolUseCase`):**
  - `GET /api/v1/auth/registration-catalogs` (`@Public()`): expone de forma segura los catálogos públicos de tipos de documento, calendarios académicos, sectores educativos y tipos de establecimiento.
  - `POST /api/v1/auth/register-school` (`@Public()`, `@RateLimit(5, 300)`): crea la institución con periodo de prueba configurable (`SCHOOL_TRIAL_DAYS=30`), el usuario administrador con rol `SCHOOL_ADMIN` y contraseña hasheada con `scrypt`, y aprovisiona atómicamente bajo Row-Level Security (`SET LOCAL ROLE asaie_app_runtime` + `app.current_school_id`) la Sede Principal, Año Lectivo actual, Jornadas base, Niveles educativos MEN, Módulos activos, sesión inicial (`auth_sessions`) y registro en `audit_logs` sin PII, enviando el correo de verificación de forma no bloqueante y retornando token JWT listo para operar.
  - Método `withGlobalTransaction` en `PostgresRlsService` para transacciones globales atómicas de onboarding que activan el contexto RLS tras generar `schools.id`.
  - Pruebas unitarias en `register-school.use-case.spec.ts` verificando generación de slug S3, emisión de JWT `SCHOOL_ADMIN`, manejo de conflictos de unicidad y tolerancia a fallos SMTP (**11/11 suites, 38/38 tests aprobados**).

## [3.13.0] - 2026-11-20

### Añadido
- **Paridad 100% Portal Docente `asaie-teachers` (`TeacherExtendedController` en `PortalModule`, +19 endpoints bajo `/api/v1/teacher/*`):**
  - **Calendario y Perfil Docente:** `GET /teacher/periods` (periodos con fechas de inicio/corte de notas y nivelaciones, peso %, estado) y `GET/PATCH /teacher/profile` (autopedición de datos del docente y `signature_url` en AWS S3).
  - **Columnas Dinámicas `n1..n30` e Ítems:** `GET/POST /teacher/courses/:id/columns`, `DELETE /teacher/columns/:columnId` y `GET/PUT /teacher/courses/:id/grade-items` con recálculo automático ponderado de `final_score` y asignación de `national_scale_id` respetando el `grade_group_id` del curso.
  - **Descriptores Multi-Escala y Sincronización:** `POST /teacher/achievements/multi-scale`, `GET /teacher/courses/:id/assigned-achievements`, `POST /teacher/grades/assign-achievements`, `DELETE /teacher/grades/assigned-achievements/:linkId` y `POST /teacher/courses/:id/sync-achievements` respetando `grade_group_id`.
  - **Nivelaciones Periódicas y Finales:** `GET /teacher/levelings/periodic`, `GET /teacher/levelings/final` y `POST /teacher/levelings/save-batch` con validación contra `academic_grading_rules` por grupo de grados (`previousScore <= recoveryScore <= maxRecoveryScore`) y upsert idempotente en `period_recovery_records`.
  - **Observador M3/M5 y Formato de Seguimiento:** `GET/PUT /teacher/observer/:enrollmentId/extended` (Modelo 5 inclusión/salud/familia y matriz Modelo 3 `N/AV/CS/S`) y `GET/PUT /teacher/tracking-format` (conectividad y medios de acceso por grupo) persistidos bajo RLS en `student_profiles.additional_info` JSONB sin alterar el esquema de PostgreSQL 17.
- **Pruebas de integración `portal.spec.ts`:** Ampliadas validaciones 401 y pruebas RLS en vivo sobre los nuevos endpoints docentes (**10/10 suites, 34/34 tests aprobados**).

## [3.12.0] - 2026-11-20

### Añadido
- **Módulo Hexagonal `PortalModule` (`/api/v1/teacher/*` y `/api/v1/student/*` — Sprint 8):**
  - **Portal Docente:** Cursos asignados (`/teacher/courses`), planilla interactiva con guardado masivo y auditoría automática respetando cierre de periodo (`GET/PUT /teacher/courses/:id/gradebook`), preinformes (`/pre-reports`), banco de logros e importación interanual (`/achievements`, `/achievements/import`), registro de inasistencias (`/absences`), observador del estudiante con soporte Modelo 1–5 (`/observer`, `/observer/:id/annotations`), planes de clase y parcelador (`/lesson-plans`, `/units`), actividades virtuales y calificación de entregas (`/activities`, `/submissions`), evaluaciones en línea con preguntas/opciones (`/evaluations`, `/questions`, `/attempts`) y clases en vivo (`/live-classes`).
  - **Portal Estudiante y Familia (100% REST + RLS, cero SQL desde cliente):** Resumen de matrícula y docentes (`/student/overview`), consulta de calificaciones, preinformes y observador (`/student/grades`), actividades virtuales con entrega (`/student/activities`, `POST /:id/submit`), evaluaciones en línea con ocultamiento estricto de `is_correct` y calificación 100% en servidor (`/student/evaluations`, `POST /:id/submit`), y clases en vivo con registro de asistencia (`/student/live-classes`, `POST /:id/join`).
- **Suite de integración en vivo `portal.spec.ts`:** Verificación de seguridad 401 en los 11 endpoints base de ambos portales y operaciones bajo RLS sobre PostgreSQL 17 (**10/10 suites, 34/34 tests aprobados**).

## [3.11.0] - 2026-11-20

### Añadido
- **Módulo Hexagonal `ElectionsModule` (`/api/v1/elections/*` — Sprint 7):** Catálogo de candidaturas (`/candidacy-types`), control de jornadas electorales con apertura/cierre (`GET/POST/PATCH/DELETE /elections`), mesas de votación y jurados (`/stations`, `/juries`), inscripción de candidatos y voto en blanco (`/candidates`), cabina electoral autenticada (`GET /active-ballot`), registro de voto único verificado por matrícula y candidatura (`POST /:electionId/vote`) y escrutinio en tiempo real (`GET /:electionId/results`).
- **Suite de integración en vivo `elections.spec.ts`:** Verificación de seguridad 401, ciclo completo de elecciones/mesas/jurados/candidatos y escrutinio sobre PostgreSQL 17 RLS.

## [3.10.0] - 2026-11-20

### Añadido
- **Módulo Hexagonal `PromotionModule` (`/api/v1/promotion/*` — Sprint 6):** Catálogo de estados de promoción (`/statuses`), libro final de calificaciones y generación masiva con cálculo de áreas/asignaturas reprobadas y puestos por grupo (`/records`, `POST /generate-final-book`, `PATCH /records/:id`), promoción anticipada con traslado atómico (`/advance`), matrícula masiva de estudiantes antiguos con detección automática de repitencia (`/enroll-returning`), historial académico multianual (`/academic-history/:studentProfileId`), encabezados de certificados y actas (`/certificate-headers`) y cierre/reapertura de año lectivo (`/close-year`).
- **Suite de integración en vivo `promotion.spec.ts`:** Verificación de seguridad 401, catálogo oficial, encabezados y libro final sobre PostgreSQL 17 RLS.

## [3.9.0] - 2026-11-20

### Añadido
- **Módulo Hexagonal `AcademicModule` (`/api/v1/academic/*` — Sprints 4 y 5):** Gestión completa bajo RLS de áreas académicas (`/areas`), asignaturas (`/subjects`), plan de estudios (`/study-plans`), carga académica y traslado masivo de carga docente (`/course-assignments` + `/reassign-teacher`), perfiles de estudiantes (`/students`), familias y vínculos (`/families`, `/students/:id/families`), matrículas anuales, novedades y traslado de grupo (`/enrollments`, `/enrollments/move`, `/enrollments/:id/novelties`), seguimiento de notas reportadas (`/grades/reported-summary`), edición rectoral con auditoría automática (`PATCH /grades/:id`), transferencia de notas (`/grades/transfer`), nivelaciones de periodo (`/recoveries`), cálculo/persistencia de Cuadro de Honor (`/honor-roll/calculate`) y normalización de logros a mayúsculas (`/achievements/uppercase`).
- **Suite de integración en vivo `academic.spec.ts`:** Verificación de aislamiento RLS, RBAC 401 y flujo end-to-end contra PostgreSQL 17.

## [3.8.0] - 2026-11-20

### Añadido
- **Módulo Hexagonal `SettingsModule` (`/api/v1/settings/*` — Sprint 3):** Gestión completa bajo RLS de años lectivos (`academic_years`), reglas de evaluación y promoción (`academic_grading_rules`), jornadas (`school_shifts`), niveles educativos (`education_levels`), grupos de grados (`grade_groups`), grados académicos (`grades`), periodos académicos con bloqueo (`academic_periods`), escalas de desempeño (`grading_scales` + `national_grading_scales`), competencias y columnas `#1..#30` (`evaluation_dimensions`/`evaluation_dimension_columns`), plantillas/aspectos/criterios del observador (`observer_*`), firmas/encabezados/carnés (`branding`), módulos extras (`school_modules`) y limpieza segura de notas en cero (`/cleanup-zero-grades`).
- **Suite de integración en vivo `settings.spec.ts`:** Verificación de seguridad 401 y CRUD completo sobre PostgreSQL 17 RLS.

## [3.7.0] - 2026-11-20

### Añadido
- **Módulo Hexagonal `CatalogsModule` (`/api/v1/catalogs/*`):** Paquete consolidado de 19 catálogos oficiales MEN/DANE/SIMAT en una sola consulta SQL `json_build_object`, más endpoints geográficos (`/countries`, `/departments`, `/cities`) y contexto académico del colegio (`/school-context`).
- **Módulo Hexagonal `AdministrationModule` (`/api/v1/admin/*`):** Estadísticas y series históricas para Dashboard Ejecutivo (`/dashboard/statistics`), ficha institucional (`/school`), CRUD de sedes educativas (`/campuses`) con sub-CRUDs de jornadas y niveles, personal docente (`/teachers`), personal administrativo (`/staff`) y directores de grupo por año lectivo (`/group-managers`).
- **Perfil propio en `IamModule`:** `PATCH /api/v1/auth/me` y `PATCH /api/v1/auth/username` con verificación de contraseña actual.

### Corregido y Endurecido
- **Auditoría forense 100% remediada:** Guards globales (`RateLimitGuard` en Redis, `JwtAuthGuard` + `auth_sessions`, `RolesGuard`, `TenantContextInterceptor`), cierre de IDOR/bypass en `switch-context` y contraseñas, verificación dual `scrypt` + `bcrypt` heredado (`pgcrypto`), endurecimiento de `NodemailerSmtpMailAdapter`, `AwsS3StorageAdapter`, `JasperReportAdapter`, manejadores de error BullMQ, alineación total de `GradingModule`/`CrmModule`/`StorageModule`/`ReportingModule`/`MigrationModule`, y cierre de RLS forzado + mínimo privilegio en 139 tablas/particiones y `pgvector/pgvector:0.8.1-pg17` + Redis `--requirepass`.

## [3.6.0] - 2026-11-05

### Añadido
- **Migración y Unificación Geográfica Completa desde `iglesia238/backend` (`03-static-catalogs-seeds.sql`):**
  - **`countries` (264 países):** Normalización de códigos `iso_code` (ISO 3166-1 alfa-2), `iso_alpha3` (ISO 3166-1 alfa-3), nombres en español CLDR e indicativos telefónicos `phone_prefix` preservando los IDs originales (`1..250`, con Colombia en `id = 45`) e incorporando los **14 países faltantes** (`AU`, `CA`, `BQ`, `KM`, `GE`, `GP`, `CX`, `KZ`, `XK`, `MA`, `NO`, `PR`, `RU`, `BL`, `TL`).
  - **`departments` (363 departamentos/estados/provincias):** Conservación de los 34 registros base de Colombia (`id = 1..34`) e incorporación de las **329 subdivisiones administrativas** de los 17 países adicionales (`AR`, `BO`, `CL`, `CR`, `CU`, `DO`, `EC`, `GT`, `HN`, `MX`, `NI`, `PA`, `PE`, `PY`, `SV`, `UY`, `VE`) provenientes de `iglesia238/backend/prisma/seed-data/divisions/*.json`.
  - **`cities` (9,252 municipios/ciudades):** Conservación de los 1,127 municipios originales de Colombia (`id = 1..1127`) con actualización ortográfica de nombres oficiales DANE, adición de los **19 municipios DANE faltantes en Colombia** (incluyendo `Tuchín`, `San José de Uré`, `Coveñas`, `El Roble`, `Norosí`, `Guachené`, `Sucre`, `Carmen del Darién`, `Cértegui`, `Medio San Juan`, `Río Iró`, `Albania`, `Nueva Granada`, `Santa Bárbara de Pinto`, `Zapayán`, `Zona Bananera`, `Nariño`, `Mapiripana` y `Santa Rosalía`) e inserción de los **8,106 municipios** de los 17 países latinoamericanos y del Caribe restantes.

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
