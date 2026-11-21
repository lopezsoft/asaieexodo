import { School } from '../entities/school.entity';

export interface CreateSchoolCommandInput {
  readonly daneCode?: string;
  readonly taxId?: string;
  readonly name: string;
  readonly shortName?: string;
  readonly directorName?: string;
  readonly secretaryName?: string;
  readonly address?: string;
  readonly phones?: string;
  readonly email?: string;
  readonly storageFolder: string;
  readonly legacyDbName?: string;
}

export abstract class SchoolRepositoryPort {
  abstract findById(schoolId: bigint): Promise<School | null>;
  abstract findAllActive(): Promise<School[]>;
  abstract create(input: CreateSchoolCommandInput): Promise<School>;
}
