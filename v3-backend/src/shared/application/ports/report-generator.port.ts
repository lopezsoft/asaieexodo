export type ReportOutputFormat = 'pdf' | 'xlsx' | 'docx' | 'csv' | 'html';

export interface GenerateJasperReportInput {
  readonly schoolId: bigint;
  readonly requestedByUserId: bigint;
  readonly requestedByFullName: string;
  readonly templateName: string;
  readonly outputFormat: ReportOutputFormat;
  readonly parameters: Record<string, string | number | boolean>;
}

export interface GeneratedReportResult {
  readonly fileName: string;
  readonly mimeType: string;
  readonly buffer: Buffer;
}

export abstract class ReportGeneratorPort {
  abstract generateFromTemplate(
    input: GenerateJasperReportInput,
  ): Promise<GeneratedReportResult>;
}
