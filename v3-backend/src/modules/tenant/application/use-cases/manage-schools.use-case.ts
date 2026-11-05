import { Injectable } from '@nestjs/common';
import { School } from '../../domain/entities/school.entity';
import {
  CreateSchoolCommandInput,
  SchoolRepositoryPort,
} from '../../domain/ports/school.repository.port';

@Injectable()
export class ManageSchoolsUseCase {
  constructor(private readonly schoolRepository: SchoolRepositoryPort) {}

  async listActiveSchools(): Promise<School[]> {
    return this.schoolRepository.findAllActive();
  }

  async registerSchool(input: CreateSchoolCommandInput): Promise<School> {
    return this.schoolRepository.create(input);
  }
}
