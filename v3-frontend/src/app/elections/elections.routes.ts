import { Routes } from '@angular/router';
import { moduleGuard, permissionGuard } from '../guards/permission.guard';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../shared/constants/rbac-permissions.constants';
import { ElectionCandidatesComponent } from './candidates/election-candidates.component';
import { ElectionControlStationsComponent } from './control/election-control-stations.component';
import { ElectionsHubComponent } from './hub/elections-hub.component';
import { ElectionResultsComponent } from './results/election-results.component';

export const electionsRoutes: Routes = [
  {
    path: '',
    canActivate: [
      moduleGuard(RBAC_MODULES.SCHOOL_ELECTIONS),
      permissionGuard([RBAC_PERMISSIONS.ELECTIONS_VIEW]),
    ],
    component: ElectionsHubComponent,
  },
  {
    path: 'control',
    canActivate: [
      moduleGuard(RBAC_MODULES.SCHOOL_ELECTIONS),
      permissionGuard([RBAC_PERMISSIONS.ELECTIONS_VIEW]),
    ],
    component: ElectionControlStationsComponent,
  },
  {
    path: 'candidates',
    canActivate: [
      moduleGuard(RBAC_MODULES.SCHOOL_ELECTIONS),
      permissionGuard([RBAC_PERMISSIONS.ELECTIONS_VIEW]),
    ],
    component: ElectionCandidatesComponent,
  },
  {
    path: 'results',
    canActivate: [
      moduleGuard(RBAC_MODULES.SCHOOL_ELECTIONS),
      permissionGuard([RBAC_PERMISSIONS.ELECTIONS_VIEW]),
    ],
    component: ElectionResultsComponent,
  },
];
