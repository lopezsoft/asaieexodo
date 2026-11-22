import * as XLSX from 'xlsx';

export interface ExodoExportColumn<TItem> {
  readonly header: string;
  readonly value: (row: TItem) => string | number | boolean | null | undefined;
}

/**
 * Exporta filas visibles o cargadas en un `<exodo-grid>` a un archivo Excel (.xlsx).
 */
export function exportGridRowsToExcel<TItem>(
  rows: readonly TItem[],
  columns: readonly ExodoExportColumn<TItem>[],
  fileName: string,
): void {
  const payload = rows.map((row) => {
    const entry: Record<string, string | number | boolean> = {};
    for (const col of columns) {
      const resolved = col.value(row);
      entry[col.header] =
        resolved === null || resolved === undefined ? '' : resolved;
    }
    return entry;
  });

  const worksheet = XLSX.utils.json_to_sheet(payload);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
