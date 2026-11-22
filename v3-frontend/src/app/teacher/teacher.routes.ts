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
import { TeacherGradebookComponent } from './gradebook/teacher-gradebook.component';
import { TeacherHubComponent } from './hub/teacher-hub.component';
import { TeacherLevelingsComponent } from './levelings/teacher-levelings.component';
import { TeacherObserverComponent } from './observer/teacher-observer.component';
import { TeacherAchievementsPlanningComponent } from './planning/teacher-achievements-planning.component';
import { TeacherProfileComponent } from './profile/teacher-profile.component';
import { TeacherReportsComponent } from './reports/teacher-reports.component';
import { TeacherTrackingFormatComponent } from './tracking/teacher-tracking-format.component';
import { TeacherVirtualClassroomComponent } from './virtual-classroom/teacher-virtual-classroom.component';

const TEACHER_VIEW_PERMS = [
  RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
  RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
] as const;

export const teacherRoutes: Routes = [
  {
    path: '',
    canActivate: [anyPermissionGuard(TEACHER_VIEW_PERMS)],
    component: TeacherHubComponent,
  },
  {
    path: 'gradebook',
    canActivate: [
      moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
      anyPermissionGuard(TEACHER_VIEW_PERMS),
    ],
    component: TeacherGradebookComponent,
  },
  {
    path: 'planning',
    canActivate: [
      moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
      anyPermissionGuard(TEACHER_VIEW_PERMS),
    ],
    component: TeacherAchievementsPlanningComponent,
  },
  {
    path: 'levelings',
    canActivate: [
      moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
      anyPermissionGuard(TEACHER_VIEW_PERMS),
    ],
    component: TeacherLevelingsComponent,
  },
  {
    path: 'observer',
    canActivate: [
      moduleGuard(RBAC_MODULES.STUDENT_OBSERVER),
      anyPermissionGuard([
        ...TEACHER_VIEW_PERMS,
        RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
      ]),
    ],
    component: TeacherObserverComponent,
  },
  {
    path: 'tracking',
    canActivate: [
      moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
      anyPermissionGuard(TEACHER_VIEW_PERMS),
    ],
    component: TeacherTrackingFormatComponent,
  },
  {
    path: 'reports',
    canActivate: [
      moduleGuard(RBAC_MODULES.TEACHER_REPORTS),
      anyPermissionGuard([
        RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE,
        RBAC_PERMISSIONS.REPORTS_ACADEMIC_GENERATE,
      ]),
    ],
    component: TeacherReportsComponent,
  },
  {
    path: 'virtual-classroom',
    canActivate: [
      moduleGuard(RBAC_MODULES.VIRTUAL_CLASSROOM),
      anyPermissionGuard(TEACHER_VIEW_PERMS),
    ],
    component: TeacherVirtualClassroomComponent,
  },
  {
    path: 'profile',
    canActivate: [permissionGuard([RBAC_PERMISSIONS.PORTAL_TEACHER_OWN])],
    component: TeacherProfileComponent,
  },
];
