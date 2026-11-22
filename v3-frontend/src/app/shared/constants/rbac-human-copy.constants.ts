export interface HumanPermissionCopy {
  readonly name: string;
  readonly description: string;
}

/**
 * Textos claros en lenguaje escolar colombiano para el usuario final (sin tecnicismos de sistema).
 */
export const RBAC_HUMAN_PERMISSION_COPY: Readonly<
  Record<string, HumanPermissionCopy>
> = {
  'dashboard.executive.view': {
    name: 'Ver panel principal',
    description:
      'Permite consultar indicadores institucionales y gráficas del colegio.',
  },
  'dashboard.billing.view': {
    name: 'Ver vigencia del servicio',
    description:
      'Permite consultar la fecha de corte y el estado de la suscripción del plantel.',
  },
  'admin.school.view': {
    name: 'Consultar datos del plantel',
    description:
      'Permite consultar la información legal e institucional del establecimiento.',
  },
  'admin.school.write': {
    name: 'Editar datos del plantel',
    description:
      'Permite actualizar nombre, código DANE, resolución y datos legales del establecimiento.',
  },
  'admin.campuses.view': {
    name: 'Consultar sedes educativas',
    description:
      'Permite consultar sedes, jornadas y niveles asociados a cada sede.',
  },
  'admin.campuses.write': {
    name: 'Gestionar sedes educativas',
    description:
      'Permite crear, editar y eliminar sedes, jornadas y niveles por sede.',
  },
  'admin.teachers.view': {
    name: 'Consultar planta docente',
    description:
      'Permite consultar el directorio y hojas de vida del cuerpo docente.',
  },
  'admin.teachers.write': {
    name: 'Gestionar docentes',
    description:
      'Permite registrar y actualizar docentes activos de la institución.',
  },
  'admin.teachers.delete': {
    name: 'Eliminar docentes',
    description:
      'Permite retirar perfiles docentes y revocar su acceso al sistema.',
  },
  'admin.staff.view': {
    name: 'Consultar personal administrativo',
    description:
      'Permite consultar las hojas de vida del personal administrativo.',
  },
  'admin.staff.write': {
    name: 'Gestionar personal administrativo',
    description:
      'Permite crear, editar y retirar personal administrativo y su acceso.',
  },
  'admin.group_managers.view': {
    name: 'Consultar directores de grupo',
    description:
      'Permite consultar grupos académicos y docentes directores de grupo.',
  },
  'admin.group_managers.write': {
    name: 'Gestionar grupos y directores',
    description:
      'Permite crear, editar, activar y eliminar grupos y directores de grupo.',
  },
  'iam.memberships.view': {
    name: 'Consultar usuarios y roles',
    description:
      'Permite consultar las cuentas de acceso y los roles asignados en el colegio.',
  },
  'iam.memberships.manage': {
    name: 'Gestionar roles y accesos',
    description:
      'Permite asignar, suspender, reactivar o retirar roles dentro del colegio.',
  },
  'iam.rbac.manage': {
    name: 'Configurar permisos por rol',
    description:
      'Permite personalizar qué puede hacer cada rol y ajustar permisos puntuales por usuario.',
  },
  'settings.structure.view': {
    name: 'Consultar estructura académica',
    description:
      'Permite consultar años lectivos, jornadas, niveles, conjuntos de grados y grados.',
  },
  'settings.structure.write': {
    name: 'Configurar estructura académica',
    description:
      'Permite crear, editar y eliminar años lectivos, jornadas, niveles y grados.',
  },
  'settings.siee.view': {
    name: 'Consultar reglas SIEE y escalas',
    description:
      'Permite consultar las reglas de evaluación (Decreto 1290) y escalas de desempeño.',
  },
  'settings.siee.write': {
    name: 'Configurar reglas SIEE y escalas',
    description:
      'Permite modificar criterios de promoción, aproximación de notas y escalas SIEE.',
  },
  'settings.periods.view': {
    name: 'Consultar períodos académicos',
    description:
      'Permite consultar fechas, porcentajes y estado de apertura de cada período.',
  },
  'settings.periods.write': {
    name: 'Gestionar y bloquear períodos',
    description:
      'Permite crear, editar, cerrar o reabrir períodos académicos.',
  },
  'settings.periods.delete': {
    name: 'Eliminar períodos académicos',
    description: 'Permite eliminar períodos académicos configurados.',
  },
  'settings.dimensions.view': {
    name: 'Consultar competencias y columnas',
    description:
      'Permite consultar los criterios evaluativos y columnas de calificación.',
  },
  'settings.dimensions.write': {
    name: 'Configurar competencias y columnas',
    description:
      'Permite crear y editar competencias de evaluación y columnas de planilla.',
  },
  'settings.dimensions.delete': {
    name: 'Eliminar competencias',
    description: 'Permite eliminar competencias o criterios evaluativos.',
  },
  'settings.observer.view': {
    name: 'Consultar plantillas del observador',
    description:
      'Permite consultar modelos, secciones y criterios del observador estudiantil.',
  },
  'settings.observer.write': {
    name: 'Configurar plantillas del observador',
    description:
      'Permite crear y editar modelos, secciones y criterios del observador.',
  },
  'settings.observer.delete': {
    name: 'Eliminar plantillas del observador',
    description: 'Permite eliminar plantillas del observador estudiantil.',
  },
  'settings.branding.view': {
    name: 'Consultar firmas y boletines',
    description:
      'Permite consultar la configuración de encabezados, firmas rectorales y formato de boletines.',
  },
  'settings.branding.write': {
    name: 'Configurar firmas y boletines',
    description:
      'Permite actualizar firmas autorizadas, encabezados oficiales y opciones de boletines.',
  },
  'settings.cleanup_zero_grades.execute': {
    name: 'Depurar calificaciones en cero',
    description:
      'Permite limpiar calificaciones registradas en cero dentro de períodos abiertos.',
  },
  'settings.modules.manage': {
    name: 'Administrar módulos habilitados',
    description:
      'Permite activar o suspender módulos institucionales contratados.',
  },
  'academic.curriculum.view': {
    name: 'Consultar plan curricular',
    description:
      'Permite consultar áreas académicas, asignaturas y plan de estudios.',
  },
  'academic.curriculum.write': {
    name: 'Gestionar plan curricular',
    description:
      'Permite crear y editar áreas, asignaturas y plan de estudios por grado.',
  },
  'academic.curriculum.delete': {
    name: 'Eliminar áreas y asignaturas',
    description: 'Permite eliminar áreas académicas y asignaturas del currículo.',
  },
  'academic.course_assignments.view': {
    name: 'Consultar carga académica',
    description:
      'Permite consultar la asignación de docentes por grupo y asignatura.',
  },
  'academic.course_assignments.write': {
    name: 'Gestionar carga académica',
    description:
      'Permite crear, editar y retirar asignaciones académicas docentes.',
  },
  'academic.course_assignments.reassign': {
    name: 'Trasladar carga entre docentes',
    description:
      'Permite reasignar de forma conjunta la carga académica de un docente a otro.',
  },
  'academic.enrollments.view': {
    name: 'Consultar estudiantes y matrículas',
    description:
      'Permite consultar hojas de vida de estudiantes, acudientes, matrículas y novedades.',
  },
  'academic.enrollments.write': {
    name: 'Gestionar inscripciones y matrículas',
    description:
      'Permite inscribir, matricular, vincular acudientes y registrar novedades.',
  },
  'academic.enrollments.delete': {
    name: 'Eliminar estudiantes',
    description: 'Permite retirar fichas estudiantiles del establecimiento.',
  },
  'academic.enrollments.move': {
    name: 'Trasladar estudiantes de grupo',
    description:
      'Permite cambiar estudiantes matriculados entre sedes, jornadas y grupos.',
  },
  'academic.enrollments.renumber_folios': {
    name: 'Renumerar libros y folios',
    description:
      'Permite reorganizar secuencialmente registro, libro y folio de matrículas.',
  },
  'academic.grades.view': {
    name: 'Consultar control de notas',
    description:
      'Permite consultar calificaciones reportadas por curso y registros por matrícula.',
  },
  'academic.grades.rector_override': {
    name: 'Edición rectoral de notas',
    description:
      'Permite ajustar directamente definitivas y recuperaciones dejando registro de respaldo.',
  },
  'academic.grades.transfer': {
    name: 'Transferir notas entre cursos',
    description:
      'Permite trasladar calificaciones cuando un estudiante cambia de grupo o curso.',
  },
  'academic.recoveries.view': {
    name: 'Consultar nivelaciones',
    description:
      'Permite consultar actas de nivelaciones periódicas y recuperaciones finales.',
  },
  'academic.recoveries.write': {
    name: 'Registrar nivelaciones',
    description:
      'Permite registrar y actualizar calificaciones de nivelación según el SIEE.',
  },
  'academic.honor_roll.view': {
    name: 'Consultar Cuadro de Honor',
    description:
      'Permite consultar puestos por grupo o grado y el listado de Cuadro de Honor.',
  },
  'academic.honor_roll.calculate': {
    name: 'Calcular Cuadro de Honor',
    description:
      'Permite calcular y actualizar los puestos por grupo y el Cuadro de Honor.',
  },
  'academic.consolidated.view': {
    name: 'Consultar consolidados SIEE',
    description:
      'Permite visualizar sábanas consolidadas por asignaturas, áreas y docentes.',
  },
  'academic.consolidated.materialize': {
    name: 'Calcular promedios finales de áreas',
    description:
      'Permite calcular y actualizar los resultados ponderados de áreas por período.',
  },
  'academic.achievements.uppercase': {
    name: 'Convertir logros a mayúsculas',
    description:
      'Permite unificar en mayúsculas los textos de logros e indicadores del año.',
  },
  'academic.student_access.manage': {
    name: 'Controlar acceso de estudiantes',
    description:
      'Permite habilitar o restringir la consulta de notas, boletines y aula virtual por estudiante.',
  },
  'promotion.final_book.view': {
    name: 'Consultar Libro Final y Sábana',
    description:
      'Permite consultar actas de promoción, historial académico y sábana final anual.',
  },
  'promotion.final_book.generate': {
    name: 'Calcular Libro Final y Habilitaciones',
    description:
      'Permite calcular la promoción final (Decreto 1290) y generar las habilitaciones.',
  },
  'promotion.records.commission_edit': {
    name: 'Modificar promoción / Comisión',
    description:
      'Permite actualizar el estado final de promoción o marcar Promovido por Comisión.',
  },
  'promotion.records.folios_edit': {
    name: 'Registrar actas, diplomas y folios',
    description:
      'Permite registrar número de acta, diploma, folio de grado y observaciones finales.',
  },
  'promotion.advance.execute': {
    name: 'Aplicar Promoción Anticipada',
    description:
      'Permite promover anticipadamente a un estudiante al grado superior durante el año.',
  },
  'promotion.returning.enroll': {
    name: 'Matricular estudiantes antiguos',
    description:
      'Permite matricular en lote estudiantes promovidos hacia el siguiente año lectivo.',
  },
  'promotion.certificate_headers.write': {
    name: 'Editar encabezados de certificados',
    description:
      'Permite configurar textos y encabezados de constancias, certificados y actas de grado.',
  },
  'promotion.year.close': {
    name: 'Cerrar o reabrir año lectivo',
    description:
      'Permite cerrar el año escolar y preparar automáticamente la configuración del nuevo año.',
  },
  'elections.view': {
    name: 'Consultar elecciones y resultados',
    description:
      'Permite consultar jornadas de votación escolar, mesas, candidatos y escrutinio.',
  },
  'elections.manage': {
    name: 'Administrar elecciones escolares',
    description:
      'Permite crear y editar jornadas electorales, mesas de votación, jurados y candidatos.',
  },
  'elections.delete': {
    name: 'Eliminar jornadas electorales',
    description: 'Permite eliminar jornadas electorales del establecimiento.',
  },
  'reports.academic.generate': {
    name: 'Generar boletines e informes académicos',
    description:
      'Permite generar boletines, preinformes, consolidados, estadísticas y cuadro de honor.',
  },
  'reports.certificates.generate': {
    name: 'Generar constancias y certificados',
    description:
      'Permite emitir constancias de estudio, certificados, actas de grado, libro final y carnés.',
  },
  'reports.directory.generate': {
    name: 'Generar directorio de familias',
    description:
      'Permite exportar listados con teléfonos, direcciones y datos de acudientes.',
  },
  'reports.teacher.generate': {
    name: 'Generar informes docentes',
    description:
      'Permite a los docentes descargar planillas, parceladores, actas de nivelación y boletines de sus grupos.',
  },
  'portal.teacher.own': {
    name: 'Operar Portal Docente propio',
    description:
      'Permite a docentes gestionar planillas, logros, nivelaciones, observador y aula virtual de sus cursos.',
  },
  'portal.teacher.supervise_read': {
    name: 'Supervisar Portal Docente',
    description:
      'Permite a directivos y coordinadores revisar planillas, logros y aulas virtuales en modo consulta.',
  },
  'portal.teacher.observer_write': {
    name: 'Registrar en Observador del Estudiante',
    description:
      'Permite registrar anotaciones, seguimiento convivencial y compromisos en el observador.',
  },
  'portal.student.own': {
    name: 'Consultar Portal Estudiantil / Familiar',
    description:
      'Permite a estudiantes y acudientes ver notas, actividades, evaluaciones y agenda escolar.',
  },
  'storage.institutional_branding.write': {
    name: 'Gestionar logos y firmas institucionales',
    description:
      'Permite subir y eliminar logos, marcas de agua y firmas rectorales.',
  },
  'storage.student_documents.write': {
    name: 'Gestionar expedientes de estudiantes',
    description:
      'Permite subir y eliminar documentos digitales de los estudiantes.',
  },
  'storage.teacher_documents.write': {
    name: 'Gestionar hojas de vida del personal',
    description:
      'Permite subir y eliminar documentos y soportes de docentes y administrativos.',
  },
  'storage.academic_resources.write': {
    name: 'Gestionar recursos educativos',
    description:
      'Permite subir y eliminar guías, talleres y materiales del aula virtual.',
  },
  'crm.communications.use': {
    name: 'Usar mensajería y solicitudes',
    description:
      'Permite enviar mensajes internos, consultar circulares y radicar solicitudes.',
  },
  'crm.announcements.write': {
    name: 'Publicar circulares institucionales',
    description:
      'Permite emitir comunicados y circulares dirigidos a la comunidad educativa.',
  },
  'crm.tickets.manage': {
    name: 'Gestionar atención y solicitudes (PQRSD)',
    description:
      'Permite consultar, asignar y responder solicitudes y quejas de la comunidad.',
  },
  'crm.knowledge.write': {
    name: 'Gestionar documentos de consulta institucional',
    description:
      'Permite cargar PEI, SIEE y manuales para consultas rápidas dentro de la plataforma.',
  },
};

function sanitizeTechnicalCopy(text: string): string {
  return text
    .replace(/\s*\((PII|RBAC|IAM\/RBAC|IAM|SaaS|AWS S3)\)/gi, '')
    .replace(/\b(AWS S3|en S3|S3|RBAC|IAM|SaaS)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function resolveHumanPermissionName(
  code: string,
  fallbackName: string,
): string {
  return (
    RBAC_HUMAN_PERMISSION_COPY[code]?.name ?? sanitizeTechnicalCopy(fallbackName)
  );
}

export function resolveHumanPermissionDescription(
  code: string,
  fallbackDescription: string,
): string {
  return (
    RBAC_HUMAN_PERMISSION_COPY[code]?.description ??
    sanitizeTechnicalCopy(fallbackDescription)
  );
}
