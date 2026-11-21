import { Routes } from '@angular/router';
import { roleGuard } from '../guards/role.guard';
import { CommunityRole } from '../services/v3-unified-auth.service';
import { ElectionCandidatesComponent } from './candidates/election-candidates.component';
import { ElectionControlStationsComponent } from './control/election-control-stations.component';
import { ElectionsHubComponent } from './hub/elections-hub.component';
import { ElectionResultsComponent } from './results/election-results.component';

const ELECTION_ADMIN_ROLES: readonly CommunityRole[] = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'RECTOR',
  'COORDINATOR',
  'SECRETARY',
  'TEACHER',
];

export const electionsRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard(ELECTION_ADMIN_ROLES)],
    component: ElectionsHubComponent,
  },
  {
    path: 'control',
    canActivate: [roleGuard(ELECTION_ADMIN_ROLES)],
    component: ElectionControlStationsComponent,
  },
  {
    path: 'candidates',
    canActivate: [roleGuard(ELECTION_ADMIN_ROLES)],
    component: ElectionCandidatesComponent,
  },
  {
    path: 'results',
    canActivate: [roleGuard(ELECTION_ADMIN_ROLES)],
    component: ElectionResultsComponent,
  },
];
