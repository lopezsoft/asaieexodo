import { Routes } from '@angular/router';
import { roleGuard } from '../guards/role.guard';
import { CommunityRole } from '../services/v3-unified-auth.service';
import { BrandingModulesSettingsComponent } from './branding/branding-modules-settings.component';
import { EvaluationSettingsComponent } from './evaluation/evaluation-settings.component';
import { SettingsHubComponent } from './hub/settings-hub.component';
import { ObserverSettingsComponent } from './observer/observer-settings.component';
import { AcademicStructureSettingsComponent } from './structure/academic-structure-settings.component';

const SETTINGS_ROLES: readonly CommunityRole[] = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'RECTOR',
  'COORDINATOR',
  'SECRETARY',
];

export const settingsRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard(SETTINGS_ROLES)],
    component: SettingsHubComponent,
  },
  {
    path: 'structure',
    canActivate: [roleGuard(SETTINGS_ROLES)],
    component: AcademicStructureSettingsComponent,
  },
  {
    path: 'evaluation',
    canActivate: [roleGuard(SETTINGS_ROLES)],
    component: EvaluationSettingsComponent,
  },
  {
    path: 'observer',
    canActivate: [roleGuard(SETTINGS_ROLES)],
    component: ObserverSettingsComponent,
  },
  {
    path: 'branding',
    canActivate: [roleGuard(SETTINGS_ROLES)],
    component: BrandingModulesSettingsComponent,
  },
];
