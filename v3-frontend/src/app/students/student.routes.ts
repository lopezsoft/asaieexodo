import { anyPermissionGuard, moduleGuard } from '../guards/permission.guard';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../shared/constants/rbac-permissions.constants';
import { AcademicActivitiesComponent } from './academic-activities/academic-activities.component';
import { AcademicNotesComponent } from './academic-notes/academic-notes.component';
import { AcademicReportsComponent } from './academic-reports/academic-reports.component';
import { SchoolElectionsComponent } from './school-elections/school-elections.component';

export const studentRoutes = {
  path: '',
  children: [
    {
      path: 'academic-notes',
      canActivate: [
        moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
        anyPermissionGuard([
          RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
          RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
        ]),
      ],
      component: AcademicNotesComponent,
    },
    {
      path: 'academic-reports',
      canActivate: [
        moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
        anyPermissionGuard([
          RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
          RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
        ]),
      ],
      component: AcademicReportsComponent,
    },
    {
      path: 'academic-activities',
      canActivate: [
        moduleGuard(RBAC_MODULES.VIRTUAL_CLASSROOM),
        anyPermissionGuard([
          RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
          RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
          RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
        ]),
      ],
      component: AcademicActivitiesComponent,
    },
    {
      path: 'school-elections',
      canActivate: [
        moduleGuard(RBAC_MODULES.SCHOOL_ELECTIONS),
        anyPermissionGuard([
          RBAC_PERMISSIONS.ELECTIONS_VIEW,
          RBAC_PERMISSIONS.ELECTIONS_MANAGE,
          RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
        ]),
      ],
      component: SchoolElectionsComponent,
    },
  ],
};
