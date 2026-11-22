-- =============================================================================
-- Migracion incremental idempotente: Motor RBAC Granular Multi-Tenant (4 tablas)
-- Aplica sin afectar datos migrados en asaie_v3_unified (preserva 100% de tablas y filas)
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS permissions_catalog (
  id SMALLINT PRIMARY KEY,
  system_module_id SMALLINT REFERENCES system_modules(id) ON DELETE SET NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  is_super_admin_only BOOLEAN NOT NULL DEFAULT FALSE,
  code VARCHAR(80) NOT NULL UNIQUE,
  module_group VARCHAR(30) NOT NULL,
  name VARCHAR(140) NOT NULL,
  description VARCHAR(300) NOT NULL
);

CREATE TABLE IF NOT EXISTS role_default_permissions (
  permission_id SMALLINT NOT NULL REFERENCES permissions_catalog(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL CHECK (role IN ('SUPER_ADMIN','SCHOOL_ADMIN','RECTOR','COORDINATOR','SECRETARY','TEACHER','STUDENT','FAMILY','MONITOR')),
  PRIMARY KEY (role, permission_id)
);

CREATE TABLE IF NOT EXISTS school_role_permissions (
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  updated_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  permission_id SMALLINT NOT NULL REFERENCES permissions_catalog(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL CHECK (role IN ('SCHOOL_ADMIN','RECTOR','COORDINATOR','SECRETARY','TEACHER','STUDENT','FAMILY','MONITOR')),
  effect VARCHAR(10) NOT NULL CHECK (effect IN ('ALLOW','DENY')),
  PRIMARY KEY (school_id, role, permission_id)
);

CREATE TABLE IF NOT EXISTS user_permission_overrides (
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  updated_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  permission_id SMALLINT NOT NULL REFERENCES permissions_catalog(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL CHECK (role IN ('SCHOOL_ADMIN','RECTOR','COORDINATOR','SECRETARY','TEACHER','STUDENT','FAMILY','MONITOR')),
  effect VARCHAR(10) NOT NULL CHECK (effect IN ('ALLOW','DENY')),
  PRIMARY KEY (school_id, user_id, role, permission_id)
);

-- RLS forzado en tablas por colegio + permisos minimos para asaie_app_runtime
ALTER TABLE school_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_role_permissions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_school_role_permissions ON school_role_permissions;
CREATE POLICY tenant_isolation_school_role_permissions ON school_role_permissions
  USING (school_id = current_tenant_school_id())
  WITH CHECK (school_id = current_tenant_school_id());

ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_user_permission_overrides ON user_permission_overrides;
CREATE POLICY tenant_isolation_user_permission_overrides ON user_permission_overrides
  USING (school_id = current_tenant_school_id())
  WITH CHECK (school_id = current_tenant_school_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE school_role_permissions, user_permission_overrides TO asaie_app_runtime;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE permissions_catalog, role_default_permissions FROM asaie_app_runtime;
GRANT SELECT ON TABLE permissions_catalog, role_default_permissions TO asaie_app_runtime;

-- Semillas de school_modules base (sin sobrescribir filas migradas existentes)
INSERT INTO school_modules (school_id, system_module_id, is_active, status)
SELECT s.id, m.id, TRUE, 1
FROM schools s
CROSS JOIN system_modules m
WHERE m.id BETWEEN 1 AND 8
ON CONFLICT (school_id, system_module_id) DO NOTHING;

-- Asegurar perfil SUPER_ADMIN en admin.comunidad (bootstrap local)
INSERT INTO user_school_memberships (school_id, user_id, role, is_default_school, status)
SELECT s.id, u.id, 'SUPER_ADMIN', FALSE, 'ACTIVE'
FROM schools s
JOIN users u ON u.username = 'admin.comunidad'
WHERE s.legacy_db_name = 'pto_beato'
ON CONFLICT (school_id, user_id, role) DO NOTHING;

-- Corregir cualquier membresia legacy con profile_id=8 degradada a STUDENT
UPDATE user_school_memberships
   SET role = 'SCHOOL_ADMIN', updated_at = NOW()
 WHERE profile_id = 8
   AND role = 'STUDENT'
   AND NOT EXISTS (
     SELECT 1 FROM user_school_memberships m2
      WHERE m2.school_id = user_school_memberships.school_id
        AND m2.user_id = user_school_memberships.user_id
        AND m2.role = 'SCHOOL_ADMIN'
   );

-- Catalogo global de permisos atomicos (82 permisos)
INSERT INTO permissions_catalog (id, system_module_id, is_sensitive, is_super_admin_only, code, module_group, name, description) VALUES
  (1,  NULL, FALSE, FALSE, 'dashboard.executive.view', 'DASHBOARD', 'Ver panel ejecutivo', 'Permite consultar KPIs institucionales y graficas historicas del colegio.'),
  (2,  NULL, TRUE,  FALSE, 'dashboard.billing.view', 'DASHBOARD', 'Ver vigencia de suscripcion', 'Permite visualizar fecha de corte y estado de suscripcion SaaS del plantel.'),
  (3,  NULL, FALSE, FALSE, 'admin.school.view', 'ADMIN', 'Consultar datos del plantel', 'Permite consultar la informacion legal e institucional del establecimiento.'),
  (4,  NULL, TRUE,  FALSE, 'admin.school.write', 'ADMIN', 'Editar datos del plantel', 'Permite actualizar nombre, DANE, resolucion y datos legales del establecimiento.'),
  (5,  NULL, FALSE, FALSE, 'admin.campuses.view', 'ADMIN', 'Consultar sedes educativas', 'Permite consultar sedes, jornadas y niveles asociados a cada sede.'),
  (6,  NULL, TRUE,  FALSE, 'admin.campuses.write', 'ADMIN', 'Gestionar sedes educativas', 'Permite crear, editar y eliminar sedes, jornadas y niveles por sede.'),
  (7,  NULL, FALSE, FALSE, 'admin.teachers.view', 'ADMIN', 'Consultar planta docente', 'Permite consultar el directorio y hojas de vida del cuerpo docente.'),
  (8,  NULL, FALSE, FALSE, 'admin.teachers.write', 'ADMIN', 'Gestionar docentes', 'Permite registrar y actualizar docentes activos de la institucion.'),
  (9,  NULL, TRUE,  FALSE, 'admin.teachers.delete', 'ADMIN', 'Eliminar docentes', 'Permite retirar o eliminar perfiles docentes y revocar su acceso.'),
  (10, NULL, FALSE, FALSE, 'admin.staff.view', 'ADMIN', 'Consultar personal administrativo', 'Permite consultar hojas de vida del personal administrativo.'),
  (11, NULL, TRUE,  FALSE, 'admin.staff.write', 'ADMIN', 'Gestionar personal administrativo', 'Permite crear, editar y eliminar personal administrativo y su acceso.'),
  (12, NULL, FALSE, FALSE, 'admin.group_managers.view', 'ADMIN', 'Consultar directores de grupo', 'Permite consultar grupos academicos y docentes directores de grupo.'),
  (13, NULL, FALSE, FALSE, 'admin.group_managers.write', 'ADMIN', 'Gestionar grupos y directores', 'Permite crear, editar, activar y eliminar grupos y directores de grupo.'),
  (14, NULL, FALSE, FALSE, 'iam.memberships.view', 'IAM', 'Consultar usuarios y roles', 'Permite consultar las cuentas de acceso y roles asignados en el colegio.'),
  (15, NULL, TRUE,  FALSE, 'iam.memberships.manage', 'IAM', 'Gestionar roles y accesos', 'Permite asignar, activar o revocar roles institucionales y sesiones.'),
  (16, NULL, TRUE,  FALSE, 'iam.rbac.manage', 'IAM', 'Configurar matriz de permisos RBAC', 'Permite personalizar permisos por rol y excepciones por usuario en el colegio.'),
  (17, NULL, FALSE, FALSE, 'settings.structure.view', 'SETTINGS', 'Consultar estructura academica', 'Permite consultar anos lectivos, jornadas, niveles, grupos de grados y grados.'),
  (18, NULL, TRUE,  FALSE, 'settings.structure.write', 'SETTINGS', 'Configurar estructura academica', 'Permite crear, editar y eliminar anos, jornadas, niveles y grados.'),
  (19, NULL, FALSE, FALSE, 'settings.siee.view', 'SETTINGS', 'Consultar reglas SIEE y escalas', 'Permite consultar las reglas de evaluacion Decreto 1290 y escalas de desempeno.'),
  (20, NULL, TRUE,  FALSE, 'settings.siee.write', 'SETTINGS', 'Configurar reglas SIEE y escalas', 'Permite modificar reglas de promocion, redondeo de gracia y escalas SIEE.'),
  (21, NULL, FALSE, FALSE, 'settings.periods.view', 'SETTINGS', 'Consultar periodos academicos', 'Permite consultar fechas, pesos y estado de apertura de periodos.'),
  (22, NULL, FALSE, FALSE, 'settings.periods.write', 'SETTINGS', 'Gestionar y bloquear periodos', 'Permite crear, editar y bloquear o reabrir periodos academicos.'),
  (23, NULL, TRUE,  FALSE, 'settings.periods.delete', 'SETTINGS', 'Eliminar periodos academicos', 'Permite eliminar periodos academicos configurados.'),
  (24, NULL, FALSE, FALSE, 'settings.dimensions.view', 'SETTINGS', 'Consultar competencias y columnas', 'Permite consultar dimensiones evaluativas y sus columnas de planilla.'),
  (25, NULL, FALSE, FALSE, 'settings.dimensions.write', 'SETTINGS', 'Configurar competencias y columnas', 'Permite crear y editar dimensiones de evaluacion y columnas.'),
  (26, NULL, TRUE,  FALSE, 'settings.dimensions.delete', 'SETTINGS', 'Eliminar competencias', 'Permite eliminar dimensiones o competencias evaluativas.'),
  (27, 4,    FALSE, FALSE, 'settings.observer.view', 'SETTINGS', 'Consultar plantillas del observador', 'Permite consultar modelos, secciones y criterios del observador estudiantil.'),
  (28, 4,    FALSE, FALSE, 'settings.observer.write', 'SETTINGS', 'Configurar plantillas del observador', 'Permite crear y editar plantillas, secciones y criterios del observador.'),
  (29, 4,    TRUE,  FALSE, 'settings.observer.delete', 'SETTINGS', 'Eliminar plantillas del observador', 'Permite eliminar plantillas del observador estudiantil.'),
  (30, NULL, FALSE, FALSE, 'settings.branding.view', 'SETTINGS', 'Consultar firmas y boletines', 'Permite consultar configuracion de encabezados, firmas, boletines y modulos.'),
  (31, NULL, TRUE,  FALSE, 'settings.branding.write', 'SETTINGS', 'Configurar firmas y boletines', 'Permite actualizar datos de firmas rectorales, encabezados y boletines.'),
  (32, NULL, TRUE,  FALSE, 'settings.cleanup_zero_grades.execute', 'SETTINGS', 'Eliminar notas en cero', 'Permite ejecutar la depuracion masiva de calificaciones en cero de periodos abiertos.'),
  (33, NULL, TRUE,  TRUE,  'settings.modules.manage', 'SETTINGS', 'Administrar modulos licenciados SaaS', 'Exclusivo SUPER_ADMIN: activa o suspende modulos contratados en school_modules.'),
  (34, 1,    FALSE, FALSE, 'academic.curriculum.view', 'ACADEMIC', 'Consultar plan curricular', 'Permite consultar areas academicas, asignaturas y plan de estudios.'),
  (35, 1,    FALSE, FALSE, 'academic.curriculum.write', 'ACADEMIC', 'Gestionar plan curricular', 'Permite crear y editar areas, asignaturas y plan de estudios por grado.'),
  (36, 1,    TRUE,  FALSE, 'academic.curriculum.delete', 'ACADEMIC', 'Eliminar areas y asignaturas', 'Permite eliminar areas academicas y asignaturas del curriculo.'),
  (37, 1,    FALSE, FALSE, 'academic.course_assignments.view', 'ACADEMIC', 'Consultar carga academica', 'Permite consultar la asignacion academica docente por grupo y asignatura.'),
  (38, 1,    FALSE, FALSE, 'academic.course_assignments.write', 'ACADEMIC', 'Gestionar carga academica', 'Permite crear, editar y eliminar asignaciones academicas docentes.'),
  (39, 1,    TRUE,  FALSE, 'academic.course_assignments.reassign', 'ACADEMIC', 'Trasladar carga entre docentes', 'Permite reasignar masivamente toda la carga academica de un docente a otro.'),
  (40, 2,    FALSE, FALSE, 'academic.enrollments.view', 'ACADEMIC', 'Consultar estudiantes y matriculas', 'Permite consultar estudiantes, acudientes, matriculas y novedades.'),
  (41, 2,    FALSE, FALSE, 'academic.enrollments.write', 'ACADEMIC', 'Gestionar inscripciones y matriculas', 'Permite inscribir, matricular, vincular familias y registrar novedades.'),
  (42, 2,    TRUE,  FALSE, 'academic.enrollments.delete', 'ACADEMIC', 'Eliminar estudiantes', 'Permite eliminar perfiles estudiantiles del establecimiento.'),
  (43, 2,    FALSE, FALSE, 'academic.enrollments.move', 'ACADEMIC', 'Mover estudiantes de grupo', 'Permite trasladar estudiantes matriculados entre sedes, jornadas y grupos.'),
  (44, 2,    FALSE, FALSE, 'academic.enrollments.renumber_folios', 'ACADEMIC', 'Renumerar libros y folios', 'Permite recalcular secuencialmente registro, libro y folio de matriculas.'),
  (45, 1,    FALSE, FALSE, 'academic.grades.view', 'ACADEMIC', 'Consultar control de notas', 'Permite consultar notas reportadas por curso y calificaciones por matricula.'),
  (46, 1,    TRUE,  FALSE, 'academic.grades.rector_override', 'ACADEMIC', 'Edicion directa rectoral de notas', 'Permite modificar directamente definitivas y recuperaciones con auditoria antifraude.'),
  (47, 1,    FALSE, FALSE, 'academic.grades.transfer', 'ACADEMIC', 'Transferir notas entre cursos', 'Permite trasladar calificaciones cuando un estudiante cambia de grupo o curso.'),
  (48, 1,    FALSE, FALSE, 'academic.recoveries.view', 'ACADEMIC', 'Consultar nivelaciones', 'Permite consultar actas de nivelaciones periodicas y recuperaciones finales.'),
  (49, 1,    FALSE, FALSE, 'academic.recoveries.write', 'ACADEMIC', 'Registrar nivelaciones', 'Permite registrar y actualizar calificaciones de nivelacion SIEE.'),
  (50, 1,    FALSE, FALSE, 'academic.honor_roll.view', 'ACADEMIC', 'Consultar Cuadro de Honor', 'Permite consultar puestos por grupo/grado y listado de Cuadro de Honor.'),
  (51, 1,    FALSE, FALSE, 'academic.honor_roll.calculate', 'ACADEMIC', 'Recalcular Cuadro de Honor', 'Permite ejecutar el calculo y persistencia de puestos y Cuadro de Honor.'),
  (52, 1,    FALSE, FALSE, 'academic.consolidated.view', 'ACADEMIC', 'Consultar consolidados SIEE', 'Permite visualizar sabanas consolidadas por asignaturas, areas y docente.'),
  (53, 1,    FALSE, FALSE, 'academic.consolidated.materialize', 'ACADEMIC', 'Materializar promedios de areas', 'Permite materializar resultados ponderados de areas por periodo.'),
  (54, 1,    FALSE, FALSE, 'academic.achievements.uppercase', 'ACADEMIC', 'Convertir logros a mayusculas', 'Permite normalizar masivamente a mayusculas los descriptores de logros del ano.'),
  (55, 2,    FALSE, FALSE, 'academic.student_access.manage', 'ACADEMIC', 'Controlar acceso estudiantil', 'Permite habilitar o restringir visualizacion de notas, boletines y aula por matricula.'),
  (56, 1,    FALSE, FALSE, 'promotion.final_book.view', 'PROMOTION', 'Consultar Libro Final y Sabana', 'Permite consultar actas de promocion, historial academico y sabana final anual.'),
  (57, 1,    TRUE,  FALSE, 'promotion.final_book.generate', 'PROMOTION', 'Calcular Libro Final y Habilitaciones', 'Permite ejecutar el motor de promocion Decreto 1290 y generar habilitaciones finales.'),
  (58, 1,    TRUE,  FALSE, 'promotion.records.commission_edit', 'PROMOTION', 'Modificar estado de promocion / Comision', 'Permite alterar el estado final de promocion y marcar Promovido por Comision.'),
  (59, 1,    FALSE, FALSE, 'promotion.records.folios_edit', 'PROMOTION', 'Registrar actas, diplomas y folios', 'Permite actualizar numero de acta, diploma, folio de grado y observaciones finales.'),
  (60, 1,    TRUE,  FALSE, 'promotion.advance.execute', 'PROMOTION', 'Aplicar Promocion Anticipada', 'Permite promover anticipadamente a un estudiante al grado superior intra-ano.'),
  (61, 2,    FALSE, FALSE, 'promotion.returning.enroll', 'PROMOTION', 'Matricular estudiantes antiguos', 'Permite matricular masivamente estudiantes promovidos al siguiente ano lectivo.'),
  (62, 7,    FALSE, FALSE, 'promotion.certificate_headers.write', 'PROMOTION', 'Editar encabezados de certificados', 'Permite configurar textos y encabezados de certificados y actas de grado.'),
  (63, 1,    TRUE,  FALSE, 'promotion.year.close', 'PROMOTION', 'Cerrar / reabrir ano lectivo', 'Permite cerrar definitivamente el ano lectivo y clonar las 7 tablas maestras.'),
  (64, 6,    FALSE, FALSE, 'elections.view', 'ELECTIONS', 'Consultar elecciones y escrutinio', 'Permite consultar jornadas electorales, mesas, candidatos y resultados.'),
  (65, 6,    FALSE, FALSE, 'elections.manage', 'ELECTIONS', 'Administrar elecciones escolares', 'Permite crear y editar jornadas, mesas de votacion, jurados y candidatos.'),
  (66, 6,    TRUE,  FALSE, 'elections.delete', 'ELECTIONS', 'Eliminar jornadas electorales', 'Permite eliminar jornadas electorales del establecimiento.'),
  (67, 7,    FALSE, FALSE, 'reports.academic.generate', 'REPORTS', 'Generar informes academicos y boletines', 'Permite generar boletines, preinformes, consolidados, estadisticas, reprobados y cuadro de honor.'),
  (68, 7,    FALSE, FALSE, 'reports.certificates.generate', 'REPORTS', 'Generar constancias, certificados y libros', 'Permite emitir constancias de estudio, certificados, actas de grado, libro final, fichas, libros de matricula y carnes.'),
  (69, 7,    TRUE,  FALSE, 'reports.directory.generate', 'REPORTS', 'Generar directorio de familias (PII)', 'Permite exportar listados con telefonos, direcciones y acudientes de estudiantes.'),
  (70, 3,    FALSE, FALSE, 'reports.teacher.generate', 'REPORTS', 'Generar informes del portal docente', 'Permite a los docentes generar planillas, parceladores, actas de nivelacion y boletines de sus grupos.'),
  (71, 1,    FALSE, FALSE, 'portal.teacher.own', 'PORTAL', 'Operar Portal Docente propio', 'Permite a docentes gestionar planillas, logros, nivelaciones, observador y aula virtual de sus cursos asignados.'),
  (72, 1,    FALSE, FALSE, 'portal.teacher.supervise_read', 'PORTAL', 'Supervisar Portal Docente (lectura)', 'Permite a directivos y coordinadores auditar planillas, logros, seguimiento y aulas virtuales en modo lectura.'),
  (73, 4,    FALSE, FALSE, 'portal.teacher.observer_write', 'PORTAL', 'Registrar en Observador del Estudiante', 'Permite registrar anotaciones, seguimiento convivencial y criterios del observador.'),
  (74, 1,    FALSE, FALSE, 'portal.student.own', 'PORTAL', 'Consultar Portal Estudiantil / Familiar', 'Permite a estudiantes y acudientes ver notas, actividades, evaluaciones y clases en vivo.'),
  (75, NULL, TRUE,  FALSE, 'storage.institutional_branding.write', 'STORAGE', 'Gestionar logos y firmas S3', 'Permite subir y eliminar logos institucionales, marcas de agua y firmas rectorales en S3.'),
  (76, 2,    FALSE, FALSE, 'storage.student_documents.write', 'STORAGE', 'Gestionar documentos de estudiantes S3', 'Permite subir y eliminar expedientes digitales estudiantiles en S3.'),
  (77, NULL, FALSE, FALSE, 'storage.teacher_documents.write', 'STORAGE', 'Gestionar documentos docentes/admin S3', 'Permite subir y eliminar hojas de vida y soportes docentes o administrativos en S3.'),
  (78, 5,    FALSE, FALSE, 'storage.academic_resources.write', 'STORAGE', 'Gestionar recursos educativos S3', 'Permite subir y eliminar guias, tareas y materiales del aula virtual en S3.'),
  (79, 8,    FALSE, FALSE, 'crm.communications.use', 'CRM', 'Usar mensajeria y PQRSD', 'Permite usar conversaciones internas, ver circulares dirigidas y radicar tickets.'),
  (80, 8,    FALSE, FALSE, 'crm.announcements.write', 'CRM', 'Publicar circulares institucionales', 'Permite emitir anuncios y circulares a la comunidad educativa.'),
  (81, 8,    FALSE, FALSE, 'crm.tickets.manage', 'CRM', 'Gestionar tickets PQRSD', 'Permite ver, asignar y responder todos los tickets de soporte del colegio.'),
  (82, 8,    TRUE,  FALSE, 'crm.knowledge.write', 'CRM', 'Gestionar base vectorial IA', 'Permite indexar documentos institucionales (PEI, SIEE, Manual) para busqueda semantica IA.')
ON CONFLICT (id) DO NOTHING;

-- Matriz base de permisos por defecto por rol
INSERT INTO role_default_permissions (role, permission_id)
SELECT 'SUPER_ADMIN', id FROM permissions_catalog
UNION ALL
SELECT r.role, p.id
FROM (VALUES ('SCHOOL_ADMIN'), ('RECTOR')) AS r(role)
CROSS JOIN permissions_catalog p
WHERE p.id NOT IN (33, 71, 74)
UNION ALL
SELECT 'COORDINATOR', v.pid
FROM (VALUES
  (1),
  (3),(5),(7),(8),(12),(13),
  (17),(19),(21),(22),(24),(25),(27),(28),
  (34),(35),(37),(38),(39),(40),(45),(47),(48),(49),(50),(51),(52),(53),(54),(55),
  (56),(57),(58),(60),
  (64),(65),
  (67),(69),
  (72),(73),
  (77),(78),
  (79),(80),(81)
) AS v(pid)
UNION ALL
SELECT 'SECRETARY', v.pid
FROM (VALUES
  (1),
  (3),(5),(7),(12),
  (17),(21),(30),
  (34),(37),(40),(41),(43),(44),(45),(47),(48),(50),(52),(55),
  (56),(59),(61),(62),
  (64),
  (67),(68),(69),
  (76),
  (79),(80),(81)
) AS v(pid)
UNION ALL
SELECT 'TEACHER', v.pid
FROM (VALUES
  (34),(37),(40),(45),(48),(49),(50),(52),
  (64),
  (70),
  (71),(73),
  (78),
  (79),(80)
) AS v(pid)
UNION ALL
SELECT 'STUDENT', v.pid
FROM (VALUES (64),(74),(78),(79)) AS v(pid)
UNION ALL
SELECT 'FAMILY', v.pid
FROM (VALUES (74),(79)) AS v(pid)
UNION ALL
SELECT 'MONITOR', v.pid
FROM (VALUES (1),(3),(5),(7),(12),(17),(19),(21),(34),(37),(40),(45),(50),(52),(56),(64),(67)) AS v(pid)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Diccionario de datos (100% comentarios en tablas y columnas nuevas)
COMMENT ON TABLE permissions_catalog IS 'Catálogo global de permisos atómicos RBAC (module.resource.action) asociados opcionalmente a módulos licenciados SaaS.';
COMMENT ON COLUMN permissions_catalog.id IS 'Identificador numérico estable del permiso atómico.';
COMMENT ON COLUMN permissions_catalog.system_module_id IS 'Módulo del sistema requerido en school_modules para habilitar este permiso (NULL si pertenece al núcleo base).';
COMMENT ON COLUMN permissions_catalog.is_sensitive IS 'Marca permisos sensibles o destructivos (cierre de año, edición rectoral de notas, firmas institucionales).';
COMMENT ON COLUMN permissions_catalog.is_super_admin_only IS 'Indica si el permiso es exclusivo de SUPER_ADMIN SaaS y no puede otorgarse vía override de colegio.';
COMMENT ON COLUMN permissions_catalog.code IS 'Código único técnico en inglés con notación punto (ej. academic.enrollments.write).';
COMMENT ON COLUMN permissions_catalog.module_group IS 'Agrupación funcional para la matriz visual RBAC (DASHBOARD, ADMIN, IAM, SETTINGS, ACADEMIC, PROMOTION, ELECTIONS, REPORTS, PORTAL, STORAGE, CRM).';
COMMENT ON COLUMN permissions_catalog.name IS 'Nombre legible en español del permiso para la interfaz administrativa.';
COMMENT ON COLUMN permissions_catalog.description IS 'Descripción operativa clara del alcance del permiso en la institución educativa.';

COMMENT ON TABLE role_default_permissions IS 'Matriz base de permisos por defecto asignados a cada rol institucional según operación MEN / Decreto 1290.';
COMMENT ON COLUMN role_default_permissions.permission_id IS 'Identificador del permiso atómico (referencia a permissions_catalog).';
COMMENT ON COLUMN role_default_permissions.role IS 'Rol base de la comunidad educativa al que aplica el permiso por defecto.';

COMMENT ON TABLE school_role_permissions IS 'Sobrescrituras RBAC por institución educativa que permiten activar (ALLOW) o revocar (DENY) permisos sobre un rol base (aislamiento RLS).';
COMMENT ON COLUMN school_role_permissions.school_id IS 'Identificador de la Institución Educativa propietaria (aislamiento RLS).';
COMMENT ON COLUMN school_role_permissions.updated_by_user_id IS 'Usuario directivo que registró o modificó la sobrescritura.';
COMMENT ON COLUMN school_role_permissions.updated_at IS 'Fecha y hora de la última actualización de la regla.';
COMMENT ON COLUMN school_role_permissions.permission_id IS 'Identificador del permiso atómico sobrescrito.';
COMMENT ON COLUMN school_role_permissions.role IS 'Rol institucional afectado dentro del colegio.';
COMMENT ON COLUMN school_role_permissions.effect IS 'Efecto de la sobrescritura sobre la matriz base (ALLOW agrega permiso, DENY lo revoca).';

COMMENT ON TABLE user_permission_overrides IS 'Excepciones RBAC puntuales por usuario y rol dentro de un colegio (ej. diferenciar Coordinador Académico vs de Convivencia, aislamiento RLS).';
COMMENT ON COLUMN user_permission_overrides.school_id IS 'Identificador de la Institución Educativa propietaria (aislamiento RLS).';
COMMENT ON COLUMN user_permission_overrides.user_id IS 'Identificador del usuario al que aplica la excepción puntual.';
COMMENT ON COLUMN user_permission_overrides.updated_by_user_id IS 'Usuario directivo que configuró la excepción.';
COMMENT ON COLUMN user_permission_overrides.updated_at IS 'Fecha y hora de la última actualización de la excepción.';
COMMENT ON COLUMN user_permission_overrides.permission_id IS 'Identificador del permiso atómico afectado.';
COMMENT ON COLUMN user_permission_overrides.role IS 'Rol activo en el que aplica la excepción para dicho usuario.';
COMMENT ON COLUMN user_permission_overrides.effect IS 'Efecto de la excepción puntual (ALLOW agrega permiso, DENY lo revoca).';

COMMIT;
