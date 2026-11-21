import { Routes } from '@angular/router';
import { roleGuard } from '../guards/role.guard';
import { CommunityRole } from '../services/v3-unified-auth.service';
import { AdminHubComponent } from './hub/admin-hub.component';
import { CampusesManagementComponent } from './campuses/campuses-management.component';
import { GroupManagersComponent } from './group-managers/group-managers.component';
import { SchoolInformationComponent } from './school/school-information.component';
import { AdministrativeStaffComponent } from './staff/administrative-staff.component';
import { TeachersManagementComponent } from './teachers/teachers-management.component';

const ADMIN_ROLES: readonly CommunityRole[] = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'RECTOR',
  'COORDINATOR',
  'SECRETARY',
];

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard(ADMIN_ROLES)],
    component: AdminHubComponent,
  },
  {
    path: 'school',
    canActivate: [roleGuard(ADMIN_ROLES)],
    component: SchoolInformationComponent,
  },
  {
    path: 'campuses',
    canActivate: [roleGuard(ADMIN_ROLES)],
    component: CampusesManagementComponent,
  },
  {
    path: 'teachers',
    canActivate: [roleGuard(ADMIN_ROLES)],
    component: TeachersManagementComponent,
  },
  {
    path: 'staff',
    canActivate: [roleGuard(ADMIN_ROLES)],
    component: AdministrativeStaffComponent,
  },
  {
    path: 'group-managers',
    canActivate: [roleGuard(ADMIN_ROLES)],
    component: GroupManagersComponent,
  },
];
