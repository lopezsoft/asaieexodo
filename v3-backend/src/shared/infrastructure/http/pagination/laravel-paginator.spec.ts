import { ExodoGridQueryDto } from './exodo-grid-query.dto';
import {
  buildLaravelPaginatorResponse,
  normalizeExodoGridQuery,
  resolveSafeSqlColumn,
} from './laravel-paginator';

describe('Laravel Paginator & ExodoGrid Query Normalization', () => {
  it('detecta modo legado cuando no llegan page, skip ni paginated', () => {
    const dto = Object.assign(new ExodoGridQueryDto(), {
      onlyActive: 'true',
      limit: 500,
    });

    const normalized = normalizeExodoGridQuery(dto);
    expect(normalized.isLaravelPagination).toBe(false);
    expect(normalized.onlyActive).toBe(true);
    expect(normalized.limit).toBe(500);
    expect(normalized.offset).toBe(0);
    expect(normalized.page).toBe(1);
  });

  it('normaliza parámetros de exodo-grid en modo Laravel (query, page, limit, field, sort, dir)', () => {
    const dto = Object.assign(new ExodoGridQueryDto(), {
      page: 3,
      limit: 25,
      query: '  Ana  ',
      search: 'ignorado',
      field: 'fullName',
      value: '  Docente ',
      sort: 'documentNumber',
      dir: 'desc' as const,
    });

    const normalized = normalizeExodoGridQuery(dto);
    expect(normalized.isLaravelPagination).toBe(true);
    expect(normalized.page).toBe(3);
    expect(normalized.limit).toBe(25);
    expect(normalized.offset).toBe(50);
    expect(normalized.search).toBe('Ana');
    expect(normalized.filterField).toBe('fullName');
    expect(normalized.filterValue).toBe('Docente');
    expect(normalized.sortField).toBe('documentNumber');
    expect(normalized.sortDirection).toBe('DESC');
  });

  it('calcula página desde skip cuando page no viene especificado y limita el tope de limit', () => {
    const dto = Object.assign(new ExodoGridQueryDto(), {
      skip: 30,
      limit: 9999,
    });

    const normalized = normalizeExodoGridQuery(dto, 15, 500);
    expect(normalized.isLaravelPagination).toBe(true);
    expect(normalized.limit).toBe(500);
    expect(normalized.offset).toBe(30);
    expect(normalized.page).toBe(1);
  });

  it('construye la estructura exacta de Laravel Paginator para página inicial, intermedia, final y vacía', () => {
    const page1 = buildLaravelPaginatorResponse({
      items: [{ id: 1 }, { id: 2 }],
      total: 42,
      page: 1,
      perPage: 15,
      basePath: '/api/v1/admin/teachers',
    });
    expect(page1.success).toBe(true);
    expect(page1.dataRecords.current_page).toBe(1);
    expect(page1.dataRecords.last_page).toBe(3);
    expect(page1.dataRecords.from).toBe(1);
    expect(page1.dataRecords.to).toBe(2);
    expect(page1.dataRecords.prev_page_url).toBeNull();
    expect(page1.dataRecords.next_page_url).toBe(
      '/api/v1/admin/teachers?page=2&limit=15',
    );
    expect(page1.dataRecords.links.length).toBe(5);

    const middle = buildLaravelPaginatorResponse({
      items: Array.from({ length: 15 }, (_, idx) => ({ id: idx + 16 })),
      total: 42,
      page: 2,
      perPage: 15,
      basePath: '/api/v1/admin/teachers',
      queryParams: { academicYear: 2026 },
    });
    expect(middle.dataRecords.from).toBe(16);
    expect(middle.dataRecords.to).toBe(30);
    expect(middle.dataRecords.prev_page_url).toContain('academicYear=2026');
    expect(middle.dataRecords.prev_page_url).toContain('page=1');
    expect(middle.dataRecords.next_page_url).toContain('page=3');

    const last = buildLaravelPaginatorResponse({
      items: Array.from({ length: 12 }, (_, idx) => ({ id: idx + 31 })),
      total: 42,
      page: 3,
      perPage: 15,
      basePath: '/api/v1/admin/teachers',
    });
    expect(last.dataRecords.from).toBe(31);
    expect(last.dataRecords.to).toBe(42);
    expect(last.dataRecords.next_page_url).toBeNull();

    const empty = buildLaravelPaginatorResponse({
      items: [],
      total: 0,
      page: 1,
      perPage: 15,
      basePath: '/api/v1/admin/teachers',
    });
    expect(empty.dataRecords.current_page).toBe(1);
    expect(empty.dataRecords.last_page).toBe(1);
    expect(empty.dataRecords.from).toBe(0);
    expect(empty.dataRecords.to).toBe(0);
    expect(empty.dataRecords.total).toBe(0);
  });

  it('valida columnas SQL exclusivamente contra lista blanca estática y bloquea prototipos o inyecciones', () => {
    const allowlist = {
      name: 'cp.name',
      cityName: "COALESCE(c.name, '')",
    } as const;

    expect(resolveSafeSqlColumn('cityName', allowlist)).toBe(
      "COALESCE(c.name, '')",
    );
    expect(resolveSafeSqlColumn('cp.name; DROP TABLE schools', allowlist)).toBeNull();
    expect(resolveSafeSqlColumn('toString', allowlist)).toBeNull();
    expect(resolveSafeSqlColumn(undefined, allowlist)).toBeNull();
  });
});
