import { Routes } from '@angular/router';
import { roleGuard } from '../guards/role.guard';
import { CommunityRole } from '../services/v3-unified-auth.service';
import { TeacherGradebookComponent } from './gradebook/teacher-gradebook.component';
import { TeacherHubComponent } from './hub/teacher-hub.component';
import { TeacherObserverComponent } from './observer/teacher-observer.component';
import { TeacherAchievementsPlanningComponent } from './planning/teacher-achievements-planning.component';
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
    path: 'observer',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherObserverComponent,
  },
  {
    path: 'virtual-classroom',
    canActivate: [roleGuard(TEACHER_ROLES)],
    component: TeacherVirtualClassroomComponent,
  },
];
