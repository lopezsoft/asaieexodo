import { Routes } from '@angular/router';
import {
  anyPermissionGuard,
  moduleGuard,
  permissionGuard,
} from '../guards/permission.guard';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../shared/constants/rbac-permissions.constants';
import { CurriculumManagementComponent } from './curriculum/curriculum-management.component';
import { EnrollmentsManagementComponent } from './enrollments/enrollments-management.component';
import { GradesControlComponent } from './grades-control/grades-control.component';
import { AcademicHubComponent } from './hub/academic-hub.component';
import { AcademicReportsCenterComponent } from './reports/academic-reports-center.component';

export const academicRoutes: Routes = [
  {
    path: '',
    canActivate: [
      anyPermissionGuard([
        RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_VIEW,
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
        RBAC_PERMISSIONS.ACADEMIC_GRADES_VIEW,
        RBAC_PERMISSIONS.REPORTS_ACADEMIC_GENERATE,
        RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
        RBAC_PERMISSIONS.REPORTS_DIRECTORY_GENERATE,
        RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE,
      ]),
    ],
    component: AcademicHubComponent,
  },
  {
    path: 'curriculum',
    canActivate: [
      moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
      anyPermissionGuard([
        RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_VIEW,
        RBAC_PERMISSIONS.ACADEMIC_COURSE_ASSIGNMENTS_VIEW,
      ]),
    ],
    component: CurriculumManagementComponent,
  },
  {
    path: 'enrollments',
    canActivate: [
      moduleGuard(RBAC_MODULES.ENROLLMENTS),
      permissionGuard([RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW]),
    ],
    component: EnrollmentsManagementComponent,
  },
  {
    path: 'grades-control',
    canActivate: [
      moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
      permissionGuard([RBAC_PERMISSIONS.ACADEMIC_GRADES_VIEW]),
    ],
    component: GradesControlComponent,
  },
  {
    path: 'reports',
    canActivate: [
      anyPermissionGuard([
        RBAC_PERMISSIONS.REPORTS_ACADEMIC_GENERATE,
        RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
        RBAC_PERMISSIONS.REPORTS_DIRECTORY_GENERATE,
        RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE,
      ]),
    ],
    component: AcademicReportsCenterComponent,
  },
];
