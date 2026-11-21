/**
 * Roles unificados para toda la comunidad educativa dentro de la base de datos unica.
 * Sincronizados 100% con el CHECK constraint de user_school_memberships en PostgreSQL 17.
 */
export enum CommunityRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  RECTOR = 'RECTOR',
  COORDINATOR = 'COORDINATOR',
  SECRETARY = 'SECRETARY',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  FAMILY = 'FAMILY',
  MONITOR = 'MONITOR',
}
