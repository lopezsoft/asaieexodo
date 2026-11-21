import { Routes } from '@angular/router';
import { roleGuard } from '../guards/role.guard';
import { CommunityRole } from '../services/v3-unified-auth.service';
import { AdvancePromotionComponent } from './advance/advance-promotion.component';
import { FinalBookPromotionComponent } from './final-book/final-book-promotion.component';
import { AcademicHistoryComponent } from './history/academic-history.component';
import { PromotionHubComponent } from './hub/promotion-hub.component';
import { EnrollReturningStudentsComponent } from './returning/enroll-returning-students.component';
import { YearClosingComponent } from './year-closing/year-closing.component';

const PROMOTION_ROLES: readonly CommunityRole[] = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'RECTOR',
  'COORDINATOR',
  'SECRETARY',
];

export const promotionRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard(PROMOTION_ROLES)],
    component: PromotionHubComponent,
  },
  {
    path: 'final-book',
    canActivate: [roleGuard(PROMOTION_ROLES)],
    component: FinalBookPromotionComponent,
  },
  {
    path: 'advance',
    canActivate: [roleGuard(PROMOTION_ROLES)],
    component: AdvancePromotionComponent,
  },
  {
    path: 'enroll-returning',
    canActivate: [roleGuard(PROMOTION_ROLES)],
    component: EnrollReturningStudentsComponent,
  },
  {
    path: 'history',
    canActivate: [roleGuard(PROMOTION_ROLES)],
    component: AcademicHistoryComponent,
  },
  {
    path: 'year-closing',
    canActivate: [roleGuard(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'RECTOR'])],
    component: YearClosingComponent,
  },
];
