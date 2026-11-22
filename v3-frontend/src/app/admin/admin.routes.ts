import { Routes } from '@angular/router';
import {
  anyPermissionGuard,
  permissionGuard,
} from '../guards/permission.guard';
import { RBAC_PERMISSIONS } from '../shared/constants/rbac-permissions.constants';
import { CampusesManagementComponent } from './campuses/campuses-management.component';
import { GroupManagersComponent } from './group-managers/group-managers.component';
import { AdminHubComponent } from './hub/admin-hub.component';
import { RolesPermissionsManagementComponent } from './roles-permissions/roles-permissions-management.component';
import { SchoolInformationComponent } from './school/school-information.component';
import { AdministrativeStaffComponent } from './staff/administrative-staff.component';
import { TeachersManagementComponent } from './teachers/teachers-management.component';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [
      anyPermissionGuard([
        RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
        RBAC_PERMISSIONS.ADMIN_CAMPUSES_VIEW,
        RBAC_PERMISSIONS.ADMIN_TEACHERS_VIEW,
        RBAC_PERMISSIONS.ADMIN_STAFF_VIEW,
        RBAC_PERMISSIONS.ADMIN_GROUP_MANAGERS_VIEW,
        RBAC_PERMISSIONS.IAM_MEMBERSHIPS_VIEW,
        RBAC_PERMISSIONS.IAM_RBAC_MANAGE,
      ]),
    ],
    component: AdminHubComponent,
  },
  {
    path: 'school',
    canActivate: [permissionGuard([RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW])],
    component: SchoolInformationComponent,
  },
  {
    path: 'campuses',
    canActivate: [permissionGuard([RBAC_PERMISSIONS.ADMIN_CAMPUSES_VIEW])],
    component: CampusesManagementComponent,
  },
  {
    path: 'teachers',
    canActivate: [permissionGuard([RBAC_PERMISSIONS.ADMIN_TEACHERS_VIEW])],
    component: TeachersManagementComponent,
  },
  {
    path: 'staff',
    canActivate: [permissionGuard([RBAC_PERMISSIONS.ADMIN_STAFF_VIEW])],
    component: AdministrativeStaffComponent,
  },
  {
    path: 'group-managers',
    canActivate: [permissionGuard([RBAC_PERMISSIONS.ADMIN_GROUP_MANAGERS_VIEW])],
    component: GroupManagersComponent,
  },
  {
    path: 'roles-permissions',
    canActivate: [
      anyPermissionGuard([
        RBAC_PERMISSIONS.IAM_MEMBERSHIPS_VIEW,
        RBAC_PERMISSIONS.IAM_RBAC_MANAGE,
      ]),
    ],
    component: RolesPermissionsManagementComponent,
  },
];
