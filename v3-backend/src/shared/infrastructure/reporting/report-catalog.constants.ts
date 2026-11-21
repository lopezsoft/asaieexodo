import { ReportOutputFormat } from '../../application/ports/report-generator.port';

export type ReportPaperSize = 'LETTER' | 'LEGAL';
export type ReportOrientation = 'portrait' | 'landscape';
export type ReportCategory =
  | 'boletines'
  | 'consolidados'
  | 'matriculas'
  | 'certificados'
  | 'docentes';

export interface InstitutionalReportCatalogItem {
  readonly templateName: string;
  readonly category: ReportCategory;
  readonly title: string;
  readonly description: string;
  readonly defaultFormat: ReportOutputFormat;
  readonly paperSize: ReportPaperSize;
  readonly orientation: ReportOrientation;
}

/**
 * Catálogo unificado de reportes institucionales nativos (HTML->PDF via Gotenberg 8 + ExcelJS).
 * Reemplaza las 192 plantillas .jrxml heredadas bajo arquitectura cloud-native 100% RLS.
 */
export const INSTITUTIONAL_REPORT_CATALOG: readonly InstitutionalReportCatalogItem[] =
  [
    // Boletines y preinformes
    {
      templateName: 'boletin_carta_areas',
      category: 'boletines',
      title: 'Boletín por Áreas (Carta)',
      description: 'Boletín oficial periódico agrupado por áreas y asignaturas con histórico y logros.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'boletin_oficio_asignaturas',
      category: 'boletines',
      title: 'Boletín por Asignaturas (Oficio)',
      description: 'Boletín detallado por asignaturas, desempeño nacional, logros e inasistencias.',
      defaultFormat: 'pdf',
      paperSize: 'LEGAL',
      orientation: 'portrait',
    },
    {
      templateName: 'boletin_preescolar',
      category: 'boletines',
      title: 'Boletín Preescolar / Descriptivo',
      description: 'Informe cualitativo por dimensiones y logros para educación inicial.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'boletin_areas',
      category: 'boletines',
      title: 'Boletín por Áreas',
      description: 'Boletín académico consolidado por áreas fundamentales.',
      defaultFormat: 'pdf',
      paperSize: 'LEGAL',
      orientation: 'portrait',
    },
    {
      templateName: 'boletin_asignaturas',
      category: 'boletines',
      title: 'Boletín por Asignaturas',
      description: 'Boletín académico detallado por asignatura.',
      defaultFormat: 'pdf',
      paperSize: 'LEGAL',
      orientation: 'portrait',
    },
    {
      templateName: 'boletin_competencias',
      category: 'boletines',
      title: 'Boletín por Competencias',
      description: 'Boletín con desglose de desempeños y competencias evaluadas.',
      defaultFormat: 'pdf',
      paperSize: 'LEGAL',
      orientation: 'portrait',
    },
    {
      templateName: 'boletin_areas_mod2',
      category: 'boletines',
      title: 'Boletín Áreas Modelo 2',
      description: 'Boletín por áreas en formato compacto con escala institucional.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'boletin_desempenos',
      category: 'boletines',
      title: 'Boletín por Desempeños',
      description: 'Boletín enfocado en escala nacional de desempeño (Bajo a Superior).',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'preinformes_periodo',
      category: 'boletines',
      title: 'Preinformes Académicos',
      description: 'Alertas preventivas de bajo desempeño registradas antes del cierre de periodo.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },

    // Consolidados, estadísticas y promoción
    {
      templateName: 'consolidado_asignaturas',
      category: 'consolidados',
      title: 'Consolidado por Asignaturas',
      description: 'Sábana matricial de calificaciones por grupo y asignatura.',
      defaultFormat: 'xlsx',
      paperSize: 'LEGAL',
      orientation: 'landscape',
    },
    {
      templateName: 'consolidado_areas',
      category: 'consolidados',
      title: 'Consolidado por Áreas',
      description: 'Sábana consolidada ponderada por áreas fundamentales SIEE.',
      defaultFormat: 'xlsx',
      paperSize: 'LEGAL',
      orientation: 'landscape',
    },
    {
      templateName: 'consolidado_docentes',
      category: 'consolidados',
      title: 'Consolidado por Docente',
      description: 'Sábana de rendimiento por docente y asignaturas a cargo.',
      defaultFormat: 'xlsx',
      paperSize: 'LEGAL',
      orientation: 'landscape',
    },
    {
      templateName: 'estadisticas_desempeno',
      category: 'consolidados',
      title: 'Estadísticas de Desempeño',
      description: 'Distribución cuantitativa por desempeño nacional (Bajo a Superior).',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'landscape',
    },
    {
      templateName: 'reprobados_periodo',
      category: 'consolidados',
      title: 'Estudiantes Reprobados por Periodo',
      description: 'Listado de estudiantes con asignaturas reprobadas para comisión de evaluación.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'landscape',
    },
    {
      templateName: 'cuadro_honor',
      category: 'consolidados',
      title: 'Cuadro de Honor y Puestos',
      description: 'Ranking institucional de mejores promedios por grupo y grado.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'informe_final_grado',
      category: 'consolidados',
      title: 'Informe Final de Grado',
      description: 'Sábana definitiva anual de promoción, recuperaciones finales y puestos.',
      defaultFormat: 'pdf',
      paperSize: 'LEGAL',
      orientation: 'landscape',
    },
    {
      templateName: 'libro_final',
      category: 'consolidados',
      title: 'Libro Final de Calificaciones',
      description: 'Registro oficial de cierre de año y actas de promoción.',
      defaultFormat: 'pdf',
      paperSize: 'LEGAL',
      orientation: 'landscape',
    },

    // Matrículas, listas y estadísticas administrativas
    {
      templateName: 'ficha_matricula',
      category: 'matriculas',
      title: 'Ficha de Matrícula',
      description: 'Formato oficial de matrícula con datos del estudiante, acudientes y folio legal.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'libro_matriculas',
      category: 'matriculas',
      title: 'Libro de Matrículas',
      description: 'Registro institucional foliado de matrículas activas del año lectivo.',
      defaultFormat: 'pdf',
      paperSize: 'LEGAL',
      orientation: 'landscape',
    },
    {
      templateName: 'listas_asistencia',
      category: 'matriculas',
      title: 'Listas de Asistencia sin Carga',
      description: 'Planillas de control de clase ordenadas alfabéticamente por grupo.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'listas_con_carga',
      category: 'matriculas',
      title: 'Listas con Carga Académica',
      description: 'Planillas auxiliares de seguimiento vinculadas a docente y asignatura.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'landscape',
    },
    {
      templateName: 'directorio_estudiantes',
      category: 'matriculas',
      title: 'Directorio de Estudiantes y Familias',
      description: 'Base de contacto con teléfonos, direcciones y acudientes.',
      defaultFormat: 'xlsx',
      paperSize: 'LEGAL',
      orientation: 'landscape',
    },
    {
      templateName: 'estudiantes_jornadas',
      category: 'matriculas',
      title: 'Estudiantes por Jornadas',
      description: 'Resumen de matrícula activa agrupada por sede, jornada y grado.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'estadistica_edades',
      category: 'matriculas',
      title: 'Estadística por Edades y Género',
      description: 'Distribución etaria y por sexo del estudiantado (SIMAT/DANE).',
      defaultFormat: 'xlsx',
      paperSize: 'LEGAL',
      orientation: 'landscape',
    },

    // Certificados, carnés, actas y observador
    {
      templateName: 'carnets_estudiantiles',
      category: 'certificados',
      title: 'Carnés Estudiantiles',
      description: 'Generación masiva de carnés con identificación, grado y tipo de sangre.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'constancia_estudio',
      category: 'certificados',
      title: 'Constancias de Estudio',
      description: 'Constancia oficial de matrícula activa con consecutivo legal y firmas.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'certificado_calificaciones',
      category: 'certificados',
      title: 'Certificados de Calificaciones',
      description: 'Certificado oficial de calificaciones finales anuales y promoción.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'acta_grado',
      category: 'certificados',
      title: 'Acta de Grado / Promoción',
      description: 'Acta oficial de graduación y promoción con diploma y folio.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'observador_estudiante',
      category: 'certificados',
      title: 'Observador del Estudiante',
      description: 'Historial de fortalezas, compromisos y anotaciones convivenciales.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },

    // Docentes
    {
      templateName: 'asignacion_academica_docente',
      category: 'docentes',
      title: 'Asignación Académica Docente',
      description: 'Reporte oficial de intensidad horaria semanal y grupos asignados.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'landscape',
    },
    {
      templateName: 'listado_docentes',
      category: 'docentes',
      title: 'Listado de Docentes',
      description: 'Directorio oficial de la planta docente activa del año lectivo.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'landscape',
    },
    {
      templateName: 'dir_grupo',
      category: 'docentes',
      title: 'Directores de Grupo',
      description: 'Relación oficial de grupos académicos y sus docentes directores de grupo.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'landscape',
    },
    {
      templateName: 'parcelador_clases',
      category: 'docentes',
      title: 'Parcelador de Clases',
      description: 'Planeación pedagógica periódica de clases, objetivos y metodología por curso.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'portrait',
    },
    {
      templateName: 'nivelaciones_periodicas',
      category: 'consolidados',
      title: 'Acta de Nivelaciones Periódicas',
      description: 'Registro oficial de nivelaciones académicas aplicadas durante los periodos.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'landscape',
    },
    {
      templateName: 'recuperaciones_finales',
      category: 'consolidados',
      title: 'Acta de Recuperaciones Finales',
      description: 'Acta oficial de habilitaciones y recuperaciones finales de fin de año.',
      defaultFormat: 'pdf',
      paperSize: 'LETTER',
      orientation: 'landscape',
    },
  ];

export const REPORT_TEMPLATE_ALIASES: Readonly<Record<string, string>> = {
  libro_final_calificaciones: 'libro_final',
  sabanas_finales: 'informe_final_grado',
  acta_promocion: 'acta_grado',
};

export const REPORT_CATALOG_BY_NAME = new Map<
  string,
  InstitutionalReportCatalogItem
>(INSTITUTIONAL_REPORT_CATALOG.map((item) => [item.templateName, item]));

export function resolveCanonicalReportTemplate(templateName: string): string {
  return REPORT_TEMPLATE_ALIASES[templateName] ?? templateName;
}
