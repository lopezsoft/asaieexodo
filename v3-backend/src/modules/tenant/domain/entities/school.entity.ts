import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export interface SchoolProps {
  readonly publicUuid: string;
  readonly daneCode: string | null;
  readonly taxId: string | null;
  readonly name: string;
  readonly shortName: string | null;
  readonly directorName: string | null;
  readonly secretaryName: string | null;
  readonly address: string | null;
  readonly phones: string | null;
  readonly email: string | null;
  readonly storageFolder: string;
  readonly subscriptionLockDate: Date;
  readonly isActive: boolean;
  readonly legacyDbName: string | null;
}

/**
 * Agregado Raiz que representa una Institucion Educativa dentro de la base de datos unica.
 * Identificada por `id: bigint` auto-incremental en PostgreSQL (`schools.id`).
 */
export class School extends AggregateRoot<bigint, SchoolProps> {
  private constructor(id: bigint, props: SchoolProps) {
    super(id, props);
  }

  static reconstitute(id: bigint, props: SchoolProps): School {
    if (!props.name || props.name.trim().length < 3) {
      throw new DomainException(
        'INVALID_SCHOOL_NAME',
        'El nombre oficial de la institución educativa es obligatorio.',
      );
    }
    return new School(id, props);
  }

  get name(): string {
    return this.props.name;
  }

  get daneCode(): string | null {
    return this.props.daneCode;
  }

  get storageFolder(): string {
    return this.props.storageFolder;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get legacyDbName(): string | null {
    return this.props.legacyDbName;
  }

  isSubscriptionActive(referenceDate: Date = new Date()): boolean {
    return (
      this.props.isActive &&
      this.props.subscriptionLockDate.getTime() >= referenceDate.getTime()
    );
  }

  toPrimitives(): Record<string, unknown> {
    return {
      id: Number(this.id),
      publicUuid: this.props.publicUuid,
      daneCode: this.props.daneCode,
      taxId: this.props.taxId,
      name: this.props.name,
      shortName: this.props.shortName,
      directorName: this.props.directorName,
      secretaryName: this.props.secretaryName,
      address: this.props.address,
      phones: this.props.phones,
      email: this.props.email,
      storageFolder: this.props.storageFolder,
      subscriptionLockDate: this.props.subscriptionLockDate.toISOString(),
      isActive: this.props.isActive,
      legacyDbName: this.props.legacyDbName,
    };
  }
}
