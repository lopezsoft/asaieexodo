import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface ActiveTenantContext {
  readonly schoolId: bigint;
  readonly userId: bigint;
  readonly activeRole: string;
  readonly academicYear?: number;
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

  getRequiredSchoolId(): bigint {
    const context = this.storage.getStore();
    if (!context?.schoolId) {
      throw new Error(
        'Intento de acceso a recursos Multi-Tenant sin schoolId activo en el contexto.',
      );
    }
    return context.schoolId;
  }
}
