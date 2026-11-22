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
import { BrandingModulesSettingsComponent } from './branding/branding-modules-settings.component';
import { EvaluationSettingsComponent } from './evaluation/evaluation-settings.component';
import { SettingsHubComponent } from './hub/settings-hub.component';
import { ObserverSettingsComponent } from './observer/observer-settings.component';
import { AcademicStructureSettingsComponent } from './structure/academic-structure-settings.component';

export const settingsRoutes: Routes = [
  {
    path: '',
    canActivate: [
      anyPermissionGuard([
        RBAC_PERMISSIONS.SETTINGS_STRUCTURE_VIEW,
        RBAC_PERMISSIONS.SETTINGS_SIEE_VIEW,
        RBAC_PERMISSIONS.SETTINGS_PERIODS_VIEW,
        RBAC_PERMISSIONS.SETTINGS_DIMENSIONS_VIEW,
        RBAC_PERMISSIONS.SETTINGS_OBSERVER_VIEW,
        RBAC_PERMISSIONS.SETTINGS_BRANDING_VIEW,
      ]),
    ],
    component: SettingsHubComponent,
  },
  {
    path: 'structure',
    canActivate: [permissionGuard([RBAC_PERMISSIONS.SETTINGS_STRUCTURE_VIEW])],
    component: AcademicStructureSettingsComponent,
  },
  {
    path: 'evaluation',
    canActivate: [
      anyPermissionGuard([
        RBAC_PERMISSIONS.SETTINGS_SIEE_VIEW,
        RBAC_PERMISSIONS.SETTINGS_PERIODS_VIEW,
        RBAC_PERMISSIONS.SETTINGS_DIMENSIONS_VIEW,
      ]),
    ],
    component: EvaluationSettingsComponent,
  },
  {
    path: 'observer',
    canActivate: [
      moduleGuard(RBAC_MODULES.STUDENT_OBSERVER),
      permissionGuard([RBAC_PERMISSIONS.SETTINGS_OBSERVER_VIEW]),
    ],
    component: ObserverSettingsComponent,
  },
  {
    path: 'branding',
    canActivate: [permissionGuard([RBAC_PERMISSIONS.SETTINGS_BRANDING_VIEW])],
    component: BrandingModulesSettingsComponent,
  },
];
