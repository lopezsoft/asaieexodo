import {
  AcademicYearExodoGridQueryDto,
  ExodoGridQueryDto,
} from './exodo-grid-query.dto';

export interface LaravelPaginatorLink {
  readonly url: string | null;
  readonly label: string;
  readonly active: boolean;
}

export interface LaravelDataRecords<TItem> {
  readonly current_page: number;
  readonly data: TItem[];
  readonly first_page_url: string;
  readonly from: number;
  readonly last_page: number;
  readonly last_page_url: string;
  readonly links: LaravelPaginatorLink[];
  readonly next_page_url: string | null;
  readonly path: string;
  readonly per_page: number;
  readonly prev_page_url: string | null;
  readonly to: number;
  readonly total: number;
}

export interface LaravelGridResponse<TItem> {
  readonly success: true;
  readonly message: string;
  readonly dataRecords: LaravelDataRecords<TItem>;
}

export interface GridQueryOptions {
  readonly search?: string;
  readonly filterField?: string;
  readonly filterValue?: string;
  readonly sortField?: string;
  readonly sortDirection?: 'ASC' | 'DESC';
  readonly onlyActive?: boolean;
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  readonly campusId?: number;
  readonly assignmentState?: 'ALL' | 'ASSIGNED' | 'UNASSIGNED';
  readonly limit: number;
  readonly offset: number;
}

export interface NormalizedExodoGridQuery extends GridQueryOptions {
  readonly isLaravelPagination: boolean;
  readonly page: number;
}

/**
 * Normaliza los parámetros de consulta enviados por `<exodo-grid>` (query, search, field,
 * value, sort, dir, page, limit, skip) o por selectores legados (limit, offset, onlyActive).
 */
export function normalizeExodoGridQuery(
  dto: ExodoGridQueryDto | AcademicYearExodoGridQueryDto,
  defaultLimit = 15,
  maxLimit = 500,
): NormalizedExodoGridQuery {
  const isLaravelPagination =
    dto.paginated === '1' ||
    dto.paginated === 'true' ||
    dto.page !== undefined ||
    dto.skip !== undefined;

  const rawSearch =
    dto.query ?? dto.search ?? dto.searchQuery ?? dto.searchParam;
  const search = rawSearch?.trim() || undefined;

  const fallbackLimit = isLaravelPagination ? defaultLimit : 100;
  const limit = Math.min(Math.max(dto.limit ?? fallbackLimit, 1), maxLimit);

  let page = 1;
  let offset = 0;

  if (dto.page !== undefined) {
    page = Math.max(1, dto.page);
    offset = (page - 1) * limit;
  } else if (dto.skip !== undefined) {
    offset = Math.max(0, dto.skip);
    page = Math.floor(offset / limit) + 1;
  } else if (dto.offset !== undefined) {
    offset = Math.max(0, dto.offset);
    page = Math.floor(offset / limit) + 1;
  }

  const academicFilters = dto as AcademicYearExodoGridQueryDto;

  return {
    isLaravelPagination,
    page,
    limit,
    offset,
    search,
    filterField: dto.field?.trim() || undefined,
    filterValue: dto.value?.trim() || undefined,
    sortField: dto.sort?.trim() || undefined,
    sortDirection: dto.dir === 'desc' ? 'DESC' : 'ASC',
    onlyActive: dto.onlyActive === 'true',
    status: academicFilters.status,
    campusId: academicFilters.campusId,
    assignmentState: academicFilters.assignmentState,
  };
}

/**
 * Resuelve de forma segura un identificador de columna SQL contra un diccionario estático
 * permitido, previniendo cualquier inyección SQL en cláusulas WHERE o ORDER BY dinámicas.
 */
export function resolveSafeSqlColumn(
  field: string | undefined,
  allowlist: Readonly<Record<string, string>>,
): string | null {
  if (!field || !Object.prototype.hasOwnProperty.call(allowlist, field)) {
    return null;
  }
  return allowlist[field];
}

function buildPageUrl(
  basePath: string,
  page: number,
  perPage: number,
  extraParams?: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    }
  }
  params.set('page', String(page));
  params.set('limit', String(perPage));
  return `${basePath}?${params.toString()}`;
}

/**
 * Construye una respuesta compatible de forma nativa con `DataRecords` / `JsonResponse` de
 * `exodolibs` siguiendo el contrato estándar del paginador de Laravel.
 */
export function buildLaravelPaginatorResponse<TItem>(params: {
  items: TItem[];
  total: number;
  page: number;
  perPage: number;
  basePath: string;
  queryParams?: Record<string, string | number | undefined>;
  message?: string;
}): LaravelGridResponse<TItem> {
  const safePerPage = Math.max(1, params.perPage);
  const safeTotal = Math.max(0, params.total);
  const lastPage = Math.max(1, Math.ceil(safeTotal / safePerPage));
  const currentPage = Math.min(Math.max(1, params.page), lastPage);
  const from =
    safeTotal === 0 || params.items.length === 0
      ? 0
      : (currentPage - 1) * safePerPage + 1;
  const to =
    safeTotal === 0 || params.items.length === 0
      ? 0
      : from + params.items.length - 1;

  const prevPageUrl =
    currentPage > 1
      ? buildPageUrl(
          params.basePath,
          currentPage - 1,
          safePerPage,
          params.queryParams,
        )
      : null;
  const nextPageUrl =
    currentPage < lastPage
      ? buildPageUrl(
          params.basePath,
          currentPage + 1,
          safePerPage,
          params.queryParams,
        )
      : null;

  const links: LaravelPaginatorLink[] = [
    {
      url: prevPageUrl,
      label: '&laquo; Anterior',
      active: false,
    },
  ];

  const windowStart = Math.max(1, currentPage - 2);
  const windowEnd = Math.min(lastPage, windowStart + 4);
  const adjustedStart = Math.max(1, windowEnd - 4);

  for (let p = adjustedStart; p <= windowEnd; p++) {
    links.push({
      url: buildPageUrl(params.basePath, p, safePerPage, params.queryParams),
      label: String(p),
      active: p === currentPage,
    });
  }

  links.push({
    url: nextPageUrl,
    label: 'Siguiente &raquo;',
    active: false,
  });

  return {
    success: true,
    message: params.message ?? 'OK',
    dataRecords: {
      current_page: currentPage,
      data: params.items,
      first_page_url: buildPageUrl(
        params.basePath,
        1,
        safePerPage,
        params.queryParams,
      ),
      from,
      last_page: lastPage,
      last_page_url: buildPageUrl(
        params.basePath,
        lastPage,
        safePerPage,
        params.queryParams,
      ),
      links,
      next_page_url: nextPageUrl,
      path: params.basePath,
      per_page: safePerPage,
      prev_page_url: prevPageUrl,
      to,
      total: safeTotal,
    },
  };
}
