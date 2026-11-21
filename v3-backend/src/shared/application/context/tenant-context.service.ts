import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CommunityRole } from '../../../modules/iam/domain/enums/community-role.enum';
import { TenantAccessDeniedException } from '../../domain/exceptions/tenant-access-denied.exception';

export interface ActiveTenantContext {
  readonly schoolId: bigint;
  readonly userId: bigint;
  readonly username: string;
  readonly fullName: string;
  readonly activeRole: CommunityRole;
  readonly academicYear: number;
  readonly sessionId: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<ActiveTenantContext>();

  runWithContext<T>(context: ActiveTenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  getContext(): ActiveTenantContext | undefined {
    return this.storage.getStore();
  }

  getRequiredContext(): ActiveTenantContext {
    const context = this.storage.getStore();
    if (!context?.schoolId || !context?.userId) {
      throw new TenantAccessDeniedException(
        'Intento de acceso a recursos Multi-Tenant sin contexto institucional autenticado.',
      );
    }
    return context;
  }

  getRequiredSchoolId(): bigint {
    return this.getRequiredContext().schoolId;
  }

  getRequiredUserId(): bigint {
    return this.getRequiredContext().userId;
  }

  getRequiredRole(): CommunityRole {
    return this.getRequiredContext().activeRole;
  }
}
