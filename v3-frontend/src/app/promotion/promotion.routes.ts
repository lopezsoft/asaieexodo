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
import { AdvancePromotionComponent } from './advance/advance-promotion.component';
import { FinalBookPromotionComponent } from './final-book/final-book-promotion.component';
import { AcademicHistoryComponent } from './history/academic-history.component';
import { PromotionHubComponent } from './hub/promotion-hub.component';
import { EnrollReturningStudentsComponent } from './returning/enroll-returning-students.component';
import { YearClosingComponent } from './year-closing/year-closing.component';

export const promotionRoutes: Routes = [
  {
    path: '',
    canActivate: [
      anyPermissionGuard([
        RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW,
        RBAC_PERMISSIONS.PROMOTION_ADVANCE_EXECUTE,
        RBAC_PERMISSIONS.PROMOTION_RETURNING_ENROLL,
        RBAC_PERMISSIONS.PROMOTION_YEAR_CLOSE,
      ]),
    ],
    component: PromotionHubComponent,
  },
  {
    path: 'final-book',
    canActivate: [
      moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
      permissionGuard([RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW]),
    ],
    component: FinalBookPromotionComponent,
  },
  {
    path: 'advance',
    canActivate: [
      moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
      permissionGuard([RBAC_PERMISSIONS.PROMOTION_ADVANCE_EXECUTE]),
    ],
    component: AdvancePromotionComponent,
  },
  {
    path: 'enroll-returning',
    canActivate: [
      moduleGuard(RBAC_MODULES.ENROLLMENTS),
      permissionGuard([RBAC_PERMISSIONS.PROMOTION_RETURNING_ENROLL]),
    ],
    component: EnrollReturningStudentsComponent,
  },
  {
    path: 'history',
    canActivate: [
      anyPermissionGuard([
        RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW,
        RBAC_PERMISSIONS.PROMOTION_CERTIFICATE_HEADERS_WRITE,
        RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
      ]),
    ],
    component: AcademicHistoryComponent,
  },
  {
    path: 'year-closing',
    canActivate: [
      moduleGuard(RBAC_MODULES.ACADEMIC_GRADES),
      permissionGuard([RBAC_PERMISSIONS.PROMOTION_YEAR_CLOSE]),
    ],
    component: YearClosingComponent,
  },
];
