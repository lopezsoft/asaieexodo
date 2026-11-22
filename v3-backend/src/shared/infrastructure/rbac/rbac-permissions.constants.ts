import { UploadCloudObjectInput } from '../../application/ports/cloud-storage.port';
import {
  REPORT_CATALOG_BY_NAME,
  resolveCanonicalReportTemplate,
} from '../reporting/report-catalog.constants';

/**
 * Catálogo tipado de los 82 códigos atómicos de permiso registrados en `permissions_catalog`.
 * Sincronizado 1:1 con `v3-infra/postgres/init/03-static-catalogs-seeds.sql`.
 */
export const RBAC_PERMISSIONS = {
  // Dashboard
  DASHBOARD_EXECUTIVE_VIEW: 'dashboard.executive.view',
  DASHBOARD_BILLING_VIEW: 'dashboard.billing.view',

  // Administración Institucional
  ADMIN_SCHOOL_VIEW: 'admin.school.view',
  ADMIN_SCHOOL_WRITE: 'admin.school.write',
  ADMIN_CAMPUSES_VIEW: 'admin.campuses.view',
  ADMIN_CAMPUSES_WRITE: 'admin.campuses.write',
  ADMIN_TEACHERS_VIEW: 'admin.teachers.view',
  ADMIN_TEACHERS_WRITE: 'admin.teachers.write',
  ADMIN_TEACHERS_DELETE: 'admin.teachers.delete',
  ADMIN_STAFF_VIEW: 'admin.staff.view',
  ADMIN_STAFF_WRITE: 'admin.staff.write',
  ADMIN_GROUP_MANAGERS_VIEW: 'admin.group_managers.view',
  ADMIN_GROUP_MANAGERS_WRITE: 'admin.group_managers.write',

  // IAM y RBAC
  IAM_MEMBERSHIPS_VIEW: 'iam.memberships.view',
  IAM_MEMBERSHIPS_MANAGE: 'iam.memberships.manage',
  IAM_RBAC_MANAGE: 'iam.rbac.manage',

  // Configuración Institucional y SIEE
  SETTINGS_STRUCTURE_VIEW: 'settings.structure.view',
  SETTINGS_STRUCTURE_WRITE: 'settings.structure.write',
  SETTINGS_SIEE_VIEW: 'settings.siee.view',
  SETTINGS_SIEE_WRITE: 'settings.siee.write',
  SETTINGS_PERIODS_VIEW: 'settings.periods.view',
  SETTINGS_PERIODS_WRITE: 'settings.periods.write',
  SETTINGS_PERIODS_DELETE: 'settings.periods.delete',
  SETTINGS_DIMENSIONS_VIEW: 'settings.dimensions.view',
  SETTINGS_DIMENSIONS_WRITE: 'settings.dimensions.write',
  SETTINGS_DIMENSIONS_DELETE: 'settings.dimensions.delete',
  SETTINGS_OBSERVER_VIEW: 'settings.observer.view',
  SETTINGS_OBSERVER_WRITE: 'settings.observer.write',
  SETTINGS_OBSERVER_DELETE: 'settings.observer.delete',
  SETTINGS_BRANDING_VIEW: 'settings.branding.view',
  SETTINGS_BRANDING_WRITE: 'settings.branding.write',
  SETTINGS_CLEANUP_ZERO_GRADES_EXECUTE: 'settings.cleanup_zero_grades.execute',
  SETTINGS_MODULES_MANAGE: 'settings.modules.manage',

  // Gestión Académica y Matrículas
  ACADEMIC_CURRICULUM_VIEW: 'academic.curriculum.view',
  ACADEMIC_CURRICULUM_WRITE: 'academic.curriculum.write',
  ACADEMIC_CURRICULUM_DELETE: 'academic.curriculum.delete',
  ACADEMIC_COURSE_ASSIGNMENTS_VIEW: 'academic.course_assignments.view',
  ACADEMIC_COURSE_ASSIGNMENTS_WRITE: 'academic.course_assignments.write',
  ACADEMIC_COURSE_ASSIGNMENTS_REASSIGN: 'academic.course_assignments.reassign',
  ACADEMIC_ENROLLMENTS_VIEW: 'academic.enrollments.view',
  ACADEMIC_ENROLLMENTS_WRITE: 'academic.enrollments.write',
  ACADEMIC_ENROLLMENTS_DELETE: 'academic.enrollments.delete',
  ACADEMIC_ENROLLMENTS_MOVE: 'academic.enrollments.move',
  ACADEMIC_ENROLLMENTS_RENUMBER_FOLIOS: 'academic.enrollments.renumber_folios',
  ACADEMIC_GRADES_VIEW: 'academic.grades.view',
  ACADEMIC_GRADES_RECTOR_OVERRIDE: 'academic.grades.rector_override',
  ACADEMIC_GRADES_TRANSFER: 'academic.grades.transfer',
  ACADEMIC_RECOVERIES_VIEW: 'academic.recoveries.view',
  ACADEMIC_RECOVERIES_WRITE: 'academic.recoveries.write',
  ACADEMIC_HONOR_ROLL_VIEW: 'academic.honor_roll.view',
  ACADEMIC_HONOR_ROLL_CALCULATE: 'academic.honor_roll.calculate',
  ACADEMIC_CONSOLIDATED_VIEW: 'academic.consolidated.view',
  ACADEMIC_CONSOLIDATED_MATERIALIZE: 'academic.consolidated.materialize',
  ACADEMIC_ACHIEVEMENTS_UPPERCASE: 'academic.achievements.uppercase',
  ACADEMIC_STUDENT_ACCESS_MANAGE: 'academic.student_access.manage',

  // Promoción y Cierre de Año
  PROMOTION_FINAL_BOOK_VIEW: 'promotion.final_book.view',
  PROMOTION_FINAL_BOOK_GENERATE: 'promotion.final_book.generate',
  PROMOTION_RECORDS_COMMISSION_EDIT: 'promotion.records.commission_edit',
  PROMOTION_RECORDS_FOLIOS_EDIT: 'promotion.records.folios_edit',
  PROMOTION_ADVANCE_EXECUTE: 'promotion.advance.execute',
  PROMOTION_RETURNING_ENROLL: 'promotion.returning.enroll',
  PROMOTION_CERTIFICATE_HEADERS_WRITE: 'promotion.certificate_headers.write',
  PROMOTION_YEAR_CLOSE: 'promotion.year.close',

  // Gobierno Escolar / Elecciones
  ELECTIONS_VIEW: 'elections.view',
  ELECTIONS_MANAGE: 'elections.manage',
  ELECTIONS_DELETE: 'elections.delete',

  // Centro de Reportes
  REPORTS_ACADEMIC_GENERATE: 'reports.academic.generate',
  REPORTS_CERTIFICATES_GENERATE: 'reports.certificates.generate',
  REPORTS_DIRECTORY_GENERATE: 'reports.directory.generate',
  REPORTS_TEACHER_GENERATE: 'reports.teacher.generate',

  // Portales Docente y Estudiante
  PORTAL_TEACHER_OWN: 'portal.teacher.own',
  PORTAL_TEACHER_SUPERVISE_READ: 'portal.teacher.supervise_read',
  PORTAL_TEACHER_OBSERVER_WRITE: 'portal.teacher.observer_write',
  PORTAL_STUDENT_OWN: 'portal.student.own',

  // Archivos en la Nube (AWS S3)
  STORAGE_INSTITUTIONAL_BRANDING_WRITE: 'storage.institutional_branding.write',
  STORAGE_STUDENT_DOCUMENTS_WRITE: 'storage.student_documents.write',
  STORAGE_TEACHER_DOCUMENTS_WRITE: 'storage.teacher_documents.write',
  STORAGE_ACADEMIC_RESOURCES_WRITE: 'storage.academic_resources.write',

  // CRM Escolar y Comunicaciones
  CRM_COMMUNICATIONS_USE: 'crm.communications.use',
  CRM_ANNOUNCEMENTS_WRITE: 'crm.announcements.write',
  CRM_TICKETS_MANAGE: 'crm.tickets.manage',
  CRM_KNOWLEDGE_WRITE: 'crm.knowledge.write',
} as const;

export type RbacPermissionCode =
  (typeof RBAC_PERMISSIONS)[keyof typeof RBAC_PERMISSIONS];

/**
 * Etiquetas exactas de módulos del sistema registradas en `system_modules.tag` (PostgreSQL 17).
 */
export const RBAC_MODULES = {
  ACADEMIC_GRADES: 'ACADEMIC_MANAGEMENT',
  ENROLLMENTS: 'ENROLLMENT_SIMAT',
  TEACHER_REPORTS: 'TEACHER_REPORTS',
  STUDENT_OBSERVER: 'STUDENT_OBSERVER',
  VIRTUAL_CLASSROOM: 'VIRTUAL_CLASSROOM',
  SCHOOL_ELECTIONS: 'SCHOOL_ELECTIONS',
  INSTITUTIONAL_REPORTS: 'CERTIFICATES_REPORTS',
  SCHOOL_CRM_OMNICHANNEL: 'SCHOOL_CRM_OMNICHANNEL',
  ACADEMIC_ACTIVITIES: 'ACADEMIC_ACTIVITIES',
  SIMULACRUM: 'SIMULACRUM',
} as const;

export type RbacModuleTag = (typeof RBAC_MODULES)[keyof typeof RBAC_MODULES];

/**
 * Plantillas de reporte que un docente puede emitir desde sus planillas/cursos.
 */
const TEACHER_ALLOWED_REPORT_TEMPLATES = new Set<string>([
  'listas_asistencia',
  'listas_con_carga',
  'parcelador_clases',
  'asignacion_academica_docente',
  'preinformes_periodo',
  'observador_estudiante',
  'nivelaciones_periodicas',
  'recuperaciones_finales',
]);

/**
 * Resuelve los códigos de permiso válidos (OR) para generar una plantilla del centro de reportes.
 */
export function resolveReportTemplatePermissions(
  rawTemplateName: string,
): RbacPermissionCode[] {
  const canonical = resolveCanonicalReportTemplate(rawTemplateName);
  const catalogItem = REPORT_CATALOG_BY_NAME.get(canonical);
  const permissions: RbacPermissionCode[] = [];

  if (catalogItem) {
    switch (catalogItem.category) {
      case 'boletines':
      case 'consolidados':
        permissions.push(RBAC_PERMISSIONS.REPORTS_ACADEMIC_GENERATE);
        break;
      case 'certificados':
        permissions.push(RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE);
        break;
      case 'matriculas':
      case 'docentes':
        permissions.push(RBAC_PERMISSIONS.REPORTS_DIRECTORY_GENERATE);
        break;
    }
  } else {
    permissions.push(RBAC_PERMISSIONS.REPORTS_ACADEMIC_GENERATE);
  }

  if (TEACHER_ALLOWED_REPORT_TEMPLATES.has(canonical)) {
    permissions.push(RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE);
  }

  return permissions;
}

/**
 * Resuelve los permisos válidos (OR) para subir o eliminar un archivo según su categoría S3
 * o el tipo de entidad propietaria (`ownerEntityType`).
 */
export function resolveStorageCategoryWritePermissions(
  categoryOrEntityType: UploadCloudObjectInput['category'] | string,
): RbacPermissionCode[] {
  switch (categoryOrEntityType) {
    case 'INSTITUTIONAL_LOGOS':
    case 'SCHOOL':
      return [RBAC_PERMISSIONS.STORAGE_INSTITUTIONAL_BRANDING_WRITE];
    case 'STUDENT_DOCUMENTS':
    case 'STUDENT':
    case 'FAMILY_DOCUMENTS':
    case 'FAMILY':
      return [RBAC_PERMISSIONS.STORAGE_STUDENT_DOCUMENTS_WRITE];
    case 'TEACHER_DOCUMENTS':
    case 'TEACHER':
      return [RBAC_PERMISSIONS.STORAGE_TEACHER_DOCUMENTS_WRITE];
    case 'ADMINISTRATIVE_DOCUMENTS':
    case 'ADMINISTRATIVE_STAFF':
      return [
        RBAC_PERMISSIONS.STORAGE_TEACHER_DOCUMENTS_WRITE,
        RBAC_PERMISSIONS.ADMIN_STAFF_WRITE,
      ];
    case 'USER_AVATARS':
    case 'USER':
      return [RBAC_PERMISSIONS.IAM_MEMBERSHIPS_MANAGE];
    case 'VIRTUAL_ACTIVITIES':
    case 'VIRTUAL_ACTIVITY':
    case 'OBSERVER_ATTACHMENTS':
    case 'OBSERVER':
      return [
        RBAC_PERMISSIONS.STORAGE_ACADEMIC_RESOURCES_WRITE,
        RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
      ];
    case 'CRM_ATTACHMENTS':
    case 'CRM':
      return [RBAC_PERMISSIONS.CRM_COMMUNICATIONS_USE];
    case 'JASPER_REPORTS':
      return [
        RBAC_PERMISSIONS.REPORTS_ACADEMIC_GENERATE,
        RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
        RBAC_PERMISSIONS.REPORTS_DIRECTORY_GENERATE,
        RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE,
      ];
    case 'GENERAL':
    default:
      return [
        RBAC_PERMISSIONS.STORAGE_TEACHER_DOCUMENTS_WRITE,
        RBAC_PERMISSIONS.STORAGE_INSTITUTIONAL_BRANDING_WRITE,
        RBAC_PERMISSIONS.STORAGE_STUDENT_DOCUMENTS_WRITE,
        RBAC_PERMISSIONS.STORAGE_ACADEMIC_RESOURCES_WRITE,
      ];
  }
}

/**
 * Resuelve los permisos válidos (OR) de personal institucional para consultar/descargar
 * expedientes digitales según su entidad propietaria o categoría S3.
 */
export function resolveStorageEntityReadPermissions(
  entityTypeOrCategory: string,
): RbacPermissionCode[] {
  switch (entityTypeOrCategory) {
    case 'TEACHER':
    case 'TEACHER_DOCUMENTS':
      return [
        RBAC_PERMISSIONS.ADMIN_TEACHERS_VIEW,
        RBAC_PERMISSIONS.ADMIN_TEACHERS_WRITE,
        RBAC_PERMISSIONS.STORAGE_TEACHER_DOCUMENTS_WRITE,
        RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
      ];
    case 'ADMINISTRATIVE_STAFF':
    case 'ADMINISTRATIVE_DOCUMENTS':
      return [
        RBAC_PERMISSIONS.ADMIN_STAFF_VIEW,
        RBAC_PERMISSIONS.ADMIN_STAFF_WRITE,
        RBAC_PERMISSIONS.STORAGE_TEACHER_DOCUMENTS_WRITE,
        RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
      ];
    case 'STUDENT':
    case 'STUDENT_DOCUMENTS':
      return [
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE,
        RBAC_PERMISSIONS.STORAGE_STUDENT_DOCUMENTS_WRITE,
        RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
        RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
      ];
    case 'FAMILY':
    case 'FAMILY_DOCUMENTS':
      return [
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE,
        RBAC_PERMISSIONS.STORAGE_STUDENT_DOCUMENTS_WRITE,
        RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
      ];
    case 'USER':
    case 'USER_AVATARS':
      return [
        RBAC_PERMISSIONS.IAM_MEMBERSHIPS_VIEW,
        RBAC_PERMISSIONS.IAM_MEMBERSHIPS_MANAGE,
        RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
      ];
    case 'OBSERVER':
    case 'OBSERVER_ATTACHMENTS':
      return [
        RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
        RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
        RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
      ];
    case 'CRM':
    case 'CRM_ATTACHMENTS':
      return [
        RBAC_PERMISSIONS.CRM_COMMUNICATIONS_USE,
        RBAC_PERMISSIONS.CRM_TICKETS_MANAGE,
        RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
      ];
    default:
      return [
        RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
        RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
      ];
  }
}
