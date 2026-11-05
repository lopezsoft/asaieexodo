import { DomainException } from './domain.exception';

export class TenantAccessDeniedException extends DomainException {
  constructor(message = 'El usuario no tiene acceso autorizado a la institución educativa solicitada.') {
    super('TENANT_ACCESS_DENIED', message);
    this.name = 'TenantAccessDeniedException';
  }
}
