import { Routes } from '@angular/router';
import { roleGuard } from '../guards/role.guard';
import { CommunityRole } from '../services/v3-unified-auth.service';
import { CurriculumManagementComponent } from './curriculum/curriculum-management.component';
import { EnrollmentsManagementComponent } from './enrollments/enrollments-management.component';
import { GradesControlComponent } from './grades-control/grades-control.component';
import { AcademicHubComponent } from './hub/academic-hub.component';
import { AcademicReportsCenterComponent } from './reports/academic-reports-center.component';

const ACADEMIC_ROLES: readonly CommunityRole[] = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'RECTOR',
  'COORDINATOR',
  'SECRETARY',
  'TEACHER',
];

export const academicRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard(ACADEMIC_ROLES)],
    component: AcademicHubComponent,
  },
  {
    path: 'curriculum',
    canActivate: [roleGuard(ACADEMIC_ROLES)],
    component: CurriculumManagementComponent,
  },
  {
    path: 'enrollments',
    canActivate: [roleGuard(ACADEMIC_ROLES)],
    component: EnrollmentsManagementComponent,
  },
  {
    path: 'grades-control',
    canActivate: [roleGuard(ACADEMIC_ROLES)],
    component: GradesControlComponent,
  },
  {
    path: 'reports',
    canActivate: [roleGuard(ACADEMIC_ROLES)],
    component: AcademicReportsCenterComponent,
  },
];
