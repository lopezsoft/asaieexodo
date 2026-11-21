import { Injectable } from '@nestjs/common';
import {
  CatalogsRepositoryPort,
  CityCatalogItem,
  CountryCatalogItem,
  DepartmentCatalogItem,
  GlobalCatalogsBundle,
  SchoolAcademicContextCatalogs,
} from '../../domain/ports/catalogs.repository.port';

/**
 * Caso de uso para consulta consolidada de catalogos oficiales MEN/DANE/SIMAT,
 * division politica geografica (246 paises, 364 departamentos, 9.253 ciudades)
 * y catalogos propios del colegio activo bajo RLS.
 */
@Injectable()
export class GetCatalogsUseCase {
  constructor(private readonly catalogsRepository: CatalogsRepositoryPort) {}

  getGlobalBundle(schoolId: bigint): Promise<GlobalCatalogsBundle> {
    return this.catalogsRepository.getGlobalBundle(schoolId);
  }

  listCountries(
    schoolId: bigint,
    search?: string,
  ): Promise<CountryCatalogItem[]> {
    return this.catalogsRepository.listCountries(schoolId, search?.trim());
  }

  listDepartments(
    schoolId: bigint,
    countryId?: number,
    search?: string,
  ): Promise<DepartmentCatalogItem[]> {
    return this.catalogsRepository.listDepartments(
      schoolId,
      countryId,
      search?.trim(),
    );
  }

  listCities(
    schoolId: bigint,
    departmentId?: number,
    search?: string,
    limit?: number,
  ): Promise<CityCatalogItem[]> {
    const safeLimit = Math.min(Math.max(limit ?? 200, 1), 500);
    return this.catalogsRepository.listCities(
      schoolId,
      departmentId,
      search?.trim(),
      safeLimit,
    );
  }

  getSchoolAcademicContext(
    schoolId: bigint,
  ): Promise<SchoolAcademicContextCatalogs> {
    return this.catalogsRepository.getSchoolAcademicContext(schoolId);
  }
}
