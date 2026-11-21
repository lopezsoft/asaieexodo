import { Routes } from '@angular/router';
import { roleGuard } from '../guards/role.guard';
import { CommunityRole } from '../services/v3-unified-auth.service';
import { TeacherGradebookComponent } from './gradebook/teacher-gradebook.component';
import { TeacherHubComponent } from './hub/teacher-hub.component';
import { TeacherLevelingsComponent } from './levelings/teacher-levelings.component';
import { TeacherObserverComponent } from './observer/teacher-observer.component';
import { TeacherAchievementsPlanningComponent } from './planning/teacher-achievements-planning.component';
import { TeacherProfileComponent } from './profile/teacher-profile.component';
import { TeacherReportsComponent } from './reports/teacher-reports.component';
import { TeacherTrackingFormatComponent } from './tracking/teacher-tracking-format.component';
import { TeacherVirtualClassroomComponent } from './virtual-classroom/teacher-virtual-classroom.component';

const TEACHER_ROLES: readonly CommunityRole[] = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'RECTOR',
  'COORDINATOR',
  'SECRETARY',
  'TEACHER',
];

export const teacherRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherHubComponent,
  },
  {
    path: 'gradebook',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherGradebookComponent,
  },
  {
    path: 'planning',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherAchievementsPlanningComponent,
  },
  {
    path: 'levelings',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherLevelingsComponent,
  },
  {
    path: 'observer',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherObserverComponent,
  },
  {
    path: 'tracking',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherTrackingFormatComponent,
  },
  {
    path: 'reports',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherReportsComponent,
  },
  {
    path: 'virtual-classroom',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherVirtualClassroomComponent,
  },
  {
    path: 'profile',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherProfileComponent,
  },
];
