import { DomainException } from './domain.exception';

export class ResourceNotFoundException extends DomainException {
  constructor(resourceName: string, identifier: string | number | bigint) {
    super(
      'RESOURCE_NOT_FOUND',
      `El recurso '${resourceName}' con identificador '${String(identifier)}' no existe en la institución activa.`,
    );
    this.name = 'ResourceNotFoundException';
  }
}
