-- =============================================================================
-- ASAIE EXODO V3 - 04-data-dictionary-comments.sql
-- Diccionario de Datos Oficial en PostgreSQL 17 (COMMENT ON TABLE & COLUMN)
-- Cubre el 100% de las 135 tablas/particiones y las 1,127 columnas en 3NF
-- =============================================================================

SET client_encoding = 'UTF8';
BEGIN;

-- Tabla: academic_area_period_results (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_area_period_results IS 'Consolidado de notas definitivas ponderadas por área curricular en cada periodo académico.';
COMMENT ON COLUMN academic_area_period_results.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_area_period_results.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_area_period_results.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_area_period_results.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN academic_area_period_results.academic_area_id IS 'Identificador del área curricular institucional (referencia a academic_areas).';
COMMENT ON COLUMN academic_area_period_results.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN academic_area_period_results.weighted_score IS 'Calificación promedio ponderada obtenida en el área curricular durante el periodo.';
COMMENT ON COLUMN academic_area_period_results.recovery_score IS 'Calificación obtenida en el proceso de nivelación o superación académica.';
COMMENT ON COLUMN academic_area_period_results.national_scale_id IS 'Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior).';
COMMENT ON COLUMN academic_area_period_results.is_failed IS 'Indica si el resultado consolidado del área se encuentra reprobado en el periodo.';

-- Tabla: academic_areas (Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica)
COMMENT ON TABLE academic_areas IS 'Áreas curriculares fundamentales y optativas configuradas por cada institución educativa según la Ley 115.';
COMMENT ON COLUMN academic_areas.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_areas.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_areas.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN academic_areas.abbreviation IS 'Abreviatura o sigla corta para visualización en boletines y planillas.';
COMMENT ON COLUMN academic_areas.fails_school_year IS 'Indica si la pérdida de esta área curricular incide directamente en la reprobación del año escolar.';
COMMENT ON COLUMN academic_areas.display_order IS 'Orden numérico secuencial de presentación en interfaces, certificados y boletines.';
COMMENT ON COLUMN academic_areas.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN academic_areas.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: academic_calendars (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE academic_calendars IS 'Catálogo de calendarios escolares oficiales (Calendario A, Calendario B, Otro).';
COMMENT ON COLUMN academic_calendars.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_calendars.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: academic_characters (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE academic_characters IS 'Catálogo de carácter de educación media (Académico, Técnico, No Aplica).';
COMMENT ON COLUMN academic_characters.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_characters.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: academic_degrees_catalog (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE academic_degrees_catalog IS 'Catálogo de últimos niveles educativos y títulos universitarios alcanzados por el personal docente y administrativo.';
COMMENT ON COLUMN academic_degrees_catalog.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_degrees_catalog.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: academic_grade_achievements (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grade_achievements IS 'Tabla asociativa en 3NF que vincula los logros e indicadores alcanzados por el estudiante en cada calificación periódica.';
COMMENT ON COLUMN academic_grade_achievements.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grade_achievements.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grade_achievements.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grade_achievements.academic_grade_id IS 'Identificador del registro padre de calificación periódica (referencia a academic_grades).';
COMMENT ON COLUMN academic_grade_achievements.achievement_standard_id IS 'Identificador del logro o indicador de desempeño asignado (referencia a achievement_standards).';

-- Tabla: academic_grade_audit_logs (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grade_audit_logs IS 'Trazabilidad de auditoría de modificaciones de notas periódicas (valor anterior, valor nuevo, usuario responsable y motivo).';
COMMENT ON COLUMN academic_grade_audit_logs.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grade_audit_logs.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grade_audit_logs.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grade_audit_logs.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN academic_grade_audit_logs.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN academic_grade_audit_logs.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN academic_grade_audit_logs.previous_score IS 'Calificación anterior antes de aplicar la modificación o nivelación.';
COMMENT ON COLUMN academic_grade_audit_logs.new_score IS 'Nueva calificación registrada tras la modificación en planilla.';
COMMENT ON COLUMN academic_grade_audit_logs.changed_by_user_id IS 'Identificador del usuario que ejecutó el cambio de nota auditado.';
COMMENT ON COLUMN academic_grade_audit_logs.change_reason IS 'Justificación o motivo registrado para la modificación de la calificación.';
COMMENT ON COLUMN academic_grade_audit_logs.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: academic_grade_items (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grade_items IS 'Tabla maestra particionada en 3NF que almacena cada nota parcial individual de una calificación periódica (reemplaza las 30 columnas repetitivas n1..n30).';
COMMENT ON COLUMN academic_grade_items.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grade_items.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grade_items.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grade_items.academic_grade_id IS 'Identificador del registro padre de calificación periódica (referencia a academic_grades).';
COMMENT ON COLUMN academic_grade_items.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN academic_grade_items.gradebook_column_id IS 'Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns).';
COMMENT ON COLUMN academic_grade_items.item_number IS 'Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30).';
COMMENT ON COLUMN academic_grade_items.score IS 'Valor numérico de la calificación obtenida.';
COMMENT ON COLUMN academic_grade_items.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: academic_grade_items_2025 (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grade_items_2025 IS 'Partición física de notas parciales individuales correspondiente al año lectivo 2025.';
COMMENT ON COLUMN academic_grade_items_2025.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grade_items_2025.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grade_items_2025.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grade_items_2025.academic_grade_id IS 'Identificador del registro padre de calificación periódica (referencia a academic_grades).';
COMMENT ON COLUMN academic_grade_items_2025.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN academic_grade_items_2025.gradebook_column_id IS 'Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns).';
COMMENT ON COLUMN academic_grade_items_2025.item_number IS 'Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30).';
COMMENT ON COLUMN academic_grade_items_2025.score IS 'Valor numérico de la calificación obtenida.';
COMMENT ON COLUMN academic_grade_items_2025.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: academic_grade_items_2026 (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grade_items_2026 IS 'Partición física de notas parciales individuales correspondiente al año lectivo 2026.';
COMMENT ON COLUMN academic_grade_items_2026.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grade_items_2026.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grade_items_2026.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grade_items_2026.academic_grade_id IS 'Identificador del registro padre de calificación periódica (referencia a academic_grades).';
COMMENT ON COLUMN academic_grade_items_2026.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN academic_grade_items_2026.gradebook_column_id IS 'Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns).';
COMMENT ON COLUMN academic_grade_items_2026.item_number IS 'Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30).';
COMMENT ON COLUMN academic_grade_items_2026.score IS 'Valor numérico de la calificación obtenida.';
COMMENT ON COLUMN academic_grade_items_2026.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: academic_grade_items_2027 (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grade_items_2027 IS 'Partición física de notas parciales individuales correspondiente al año lectivo 2027.';
COMMENT ON COLUMN academic_grade_items_2027.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grade_items_2027.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grade_items_2027.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grade_items_2027.academic_grade_id IS 'Identificador del registro padre de calificación periódica (referencia a academic_grades).';
COMMENT ON COLUMN academic_grade_items_2027.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN academic_grade_items_2027.gradebook_column_id IS 'Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns).';
COMMENT ON COLUMN academic_grade_items_2027.item_number IS 'Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30).';
COMMENT ON COLUMN academic_grade_items_2027.score IS 'Valor numérico de la calificación obtenida.';
COMMENT ON COLUMN academic_grade_items_2027.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: academic_grade_items_historic (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grade_items_historic IS 'Partición por defecto para notas parciales individuales de años lectivos históricos.';
COMMENT ON COLUMN academic_grade_items_historic.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grade_items_historic.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grade_items_historic.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grade_items_historic.academic_grade_id IS 'Identificador del registro padre de calificación periódica (referencia a academic_grades).';
COMMENT ON COLUMN academic_grade_items_historic.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN academic_grade_items_historic.gradebook_column_id IS 'Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns).';
COMMENT ON COLUMN academic_grade_items_historic.item_number IS 'Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30).';
COMMENT ON COLUMN academic_grade_items_historic.score IS 'Valor numérico de la calificación obtenida.';
COMMENT ON COLUMN academic_grade_items_historic.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: academic_grades (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grades IS 'Tabla maestra particionada por año lectivo que consolida las calificaciones periódicas por matrícula, carga académica y periodo (unifica nscp00..003 eliminando columnas repetitivas).';
COMMENT ON COLUMN academic_grades.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grades.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grades.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grades.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN academic_grades.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN academic_grades.period_id IS 'Identificador del periodo académico institucional (referencia a academic_periods).';
COMMENT ON COLUMN academic_grades.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN academic_grades.conceptual_score IS 'Nota acumulada en la dimensión conceptual o cognitiva del periodo.';
COMMENT ON COLUMN academic_grades.procedural_score IS 'Nota acumulada en la dimensión procedimental o práxica del periodo.';
COMMENT ON COLUMN academic_grades.attitudinal_score IS 'Nota acumulada en la dimensión actitudinal o axiológica del periodo.';
COMMENT ON COLUMN academic_grades.evaluation_exam_score IS 'Nota obtenida en la evaluación periódica o examen acumulativo.';
COMMENT ON COLUMN academic_grades.final_score IS 'Calificación definitiva calculada para la asignatura en el periodo académico.';
COMMENT ON COLUMN academic_grades.recovery_score IS 'Calificación obtenida en el proceso de nivelación o superación académica.';
COMMENT ON COLUMN academic_grades.leveling_score IS 'Calificación obtenida en actividades de nivelación o habilitación extraordinaria.';
COMMENT ON COLUMN academic_grades.national_scale_id IS 'Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior).';
COMMENT ON COLUMN academic_grades.justified_absences IS 'Cantidad de inasistencias con excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades.unjustified_absences IS 'Cantidad de inasistencias sin excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades.late_arrivals IS 'Cantidad de llegadas tarde o retardos registrados en el periodo.';
COMMENT ON COLUMN academic_grades.teacher_observations IS 'Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo.';
COMMENT ON COLUMN academic_grades.is_locked IS 'Indica si la calificación se encuentra bloqueada por cierre de periodo académico.';
COMMENT ON COLUMN academic_grades.updated_by_user_id IS 'Identificador del usuario que realizó la última modificación del registro.';
COMMENT ON COLUMN academic_grades.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN academic_grades.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: academic_grades_2025 (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grades_2025 IS 'Partición física de calificaciones periódicas correspondiente al año lectivo 2025.';
COMMENT ON COLUMN academic_grades_2025.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grades_2025.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grades_2025.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grades_2025.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN academic_grades_2025.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN academic_grades_2025.period_id IS 'Identificador del periodo académico institucional (referencia a academic_periods).';
COMMENT ON COLUMN academic_grades_2025.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN academic_grades_2025.conceptual_score IS 'Nota acumulada en la dimensión conceptual o cognitiva del periodo.';
COMMENT ON COLUMN academic_grades_2025.procedural_score IS 'Nota acumulada en la dimensión procedimental o práxica del periodo.';
COMMENT ON COLUMN academic_grades_2025.attitudinal_score IS 'Nota acumulada en la dimensión actitudinal o axiológica del periodo.';
COMMENT ON COLUMN academic_grades_2025.evaluation_exam_score IS 'Nota obtenida en la evaluación periódica o examen acumulativo.';
COMMENT ON COLUMN academic_grades_2025.final_score IS 'Calificación definitiva calculada para la asignatura en el periodo académico.';
COMMENT ON COLUMN academic_grades_2025.recovery_score IS 'Calificación obtenida en el proceso de nivelación o superación académica.';
COMMENT ON COLUMN academic_grades_2025.leveling_score IS 'Calificación obtenida en actividades de nivelación o habilitación extraordinaria.';
COMMENT ON COLUMN academic_grades_2025.national_scale_id IS 'Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior).';
COMMENT ON COLUMN academic_grades_2025.justified_absences IS 'Cantidad de inasistencias con excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades_2025.unjustified_absences IS 'Cantidad de inasistencias sin excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades_2025.late_arrivals IS 'Cantidad de llegadas tarde o retardos registrados en el periodo.';
COMMENT ON COLUMN academic_grades_2025.teacher_observations IS 'Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo.';
COMMENT ON COLUMN academic_grades_2025.is_locked IS 'Indica si la calificación se encuentra bloqueada por cierre de periodo académico.';
COMMENT ON COLUMN academic_grades_2025.updated_by_user_id IS 'Identificador del usuario que realizó la última modificación del registro.';
COMMENT ON COLUMN academic_grades_2025.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN academic_grades_2025.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: academic_grades_2026 (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grades_2026 IS 'Partición física de calificaciones periódicas correspondiente al año lectivo 2026.';
COMMENT ON COLUMN academic_grades_2026.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grades_2026.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grades_2026.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grades_2026.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN academic_grades_2026.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN academic_grades_2026.period_id IS 'Identificador del periodo académico institucional (referencia a academic_periods).';
COMMENT ON COLUMN academic_grades_2026.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN academic_grades_2026.conceptual_score IS 'Nota acumulada en la dimensión conceptual o cognitiva del periodo.';
COMMENT ON COLUMN academic_grades_2026.procedural_score IS 'Nota acumulada en la dimensión procedimental o práxica del periodo.';
COMMENT ON COLUMN academic_grades_2026.attitudinal_score IS 'Nota acumulada en la dimensión actitudinal o axiológica del periodo.';
COMMENT ON COLUMN academic_grades_2026.evaluation_exam_score IS 'Nota obtenida en la evaluación periódica o examen acumulativo.';
COMMENT ON COLUMN academic_grades_2026.final_score IS 'Calificación definitiva calculada para la asignatura en el periodo académico.';
COMMENT ON COLUMN academic_grades_2026.recovery_score IS 'Calificación obtenida en el proceso de nivelación o superación académica.';
COMMENT ON COLUMN academic_grades_2026.leveling_score IS 'Calificación obtenida en actividades de nivelación o habilitación extraordinaria.';
COMMENT ON COLUMN academic_grades_2026.national_scale_id IS 'Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior).';
COMMENT ON COLUMN academic_grades_2026.justified_absences IS 'Cantidad de inasistencias con excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades_2026.unjustified_absences IS 'Cantidad de inasistencias sin excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades_2026.late_arrivals IS 'Cantidad de llegadas tarde o retardos registrados en el periodo.';
COMMENT ON COLUMN academic_grades_2026.teacher_observations IS 'Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo.';
COMMENT ON COLUMN academic_grades_2026.is_locked IS 'Indica si la calificación se encuentra bloqueada por cierre de periodo académico.';
COMMENT ON COLUMN academic_grades_2026.updated_by_user_id IS 'Identificador del usuario que realizó la última modificación del registro.';
COMMENT ON COLUMN academic_grades_2026.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN academic_grades_2026.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: academic_grades_2027 (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grades_2027 IS 'Partición física de calificaciones periódicas correspondiente al año lectivo 2027.';
COMMENT ON COLUMN academic_grades_2027.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grades_2027.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grades_2027.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grades_2027.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN academic_grades_2027.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN academic_grades_2027.period_id IS 'Identificador del periodo académico institucional (referencia a academic_periods).';
COMMENT ON COLUMN academic_grades_2027.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN academic_grades_2027.conceptual_score IS 'Nota acumulada en la dimensión conceptual o cognitiva del periodo.';
COMMENT ON COLUMN academic_grades_2027.procedural_score IS 'Nota acumulada en la dimensión procedimental o práxica del periodo.';
COMMENT ON COLUMN academic_grades_2027.attitudinal_score IS 'Nota acumulada en la dimensión actitudinal o axiológica del periodo.';
COMMENT ON COLUMN academic_grades_2027.evaluation_exam_score IS 'Nota obtenida en la evaluación periódica o examen acumulativo.';
COMMENT ON COLUMN academic_grades_2027.final_score IS 'Calificación definitiva calculada para la asignatura en el periodo académico.';
COMMENT ON COLUMN academic_grades_2027.recovery_score IS 'Calificación obtenida en el proceso de nivelación o superación académica.';
COMMENT ON COLUMN academic_grades_2027.leveling_score IS 'Calificación obtenida en actividades de nivelación o habilitación extraordinaria.';
COMMENT ON COLUMN academic_grades_2027.national_scale_id IS 'Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior).';
COMMENT ON COLUMN academic_grades_2027.justified_absences IS 'Cantidad de inasistencias con excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades_2027.unjustified_absences IS 'Cantidad de inasistencias sin excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades_2027.late_arrivals IS 'Cantidad de llegadas tarde o retardos registrados en el periodo.';
COMMENT ON COLUMN academic_grades_2027.teacher_observations IS 'Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo.';
COMMENT ON COLUMN academic_grades_2027.is_locked IS 'Indica si la calificación se encuentra bloqueada por cierre de periodo académico.';
COMMENT ON COLUMN academic_grades_2027.updated_by_user_id IS 'Identificador del usuario que realizó la última modificación del registro.';
COMMENT ON COLUMN academic_grades_2027.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN academic_grades_2027.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: academic_grades_historic (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_grades_historic IS 'Partición por defecto para calificaciones periódicas de años lectivos históricos o futuros adicionales.';
COMMENT ON COLUMN academic_grades_historic.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grades_historic.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grades_historic.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grades_historic.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN academic_grades_historic.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN academic_grades_historic.period_id IS 'Identificador del periodo académico institucional (referencia a academic_periods).';
COMMENT ON COLUMN academic_grades_historic.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN academic_grades_historic.conceptual_score IS 'Nota acumulada en la dimensión conceptual o cognitiva del periodo.';
COMMENT ON COLUMN academic_grades_historic.procedural_score IS 'Nota acumulada en la dimensión procedimental o práxica del periodo.';
COMMENT ON COLUMN academic_grades_historic.attitudinal_score IS 'Nota acumulada en la dimensión actitudinal o axiológica del periodo.';
COMMENT ON COLUMN academic_grades_historic.evaluation_exam_score IS 'Nota obtenida en la evaluación periódica o examen acumulativo.';
COMMENT ON COLUMN academic_grades_historic.final_score IS 'Calificación definitiva calculada para la asignatura en el periodo académico.';
COMMENT ON COLUMN academic_grades_historic.recovery_score IS 'Calificación obtenida en el proceso de nivelación o superación académica.';
COMMENT ON COLUMN academic_grades_historic.leveling_score IS 'Calificación obtenida en actividades de nivelación o habilitación extraordinaria.';
COMMENT ON COLUMN academic_grades_historic.national_scale_id IS 'Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior).';
COMMENT ON COLUMN academic_grades_historic.justified_absences IS 'Cantidad de inasistencias con excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades_historic.unjustified_absences IS 'Cantidad de inasistencias sin excusa justificada registradas en el periodo.';
COMMENT ON COLUMN academic_grades_historic.late_arrivals IS 'Cantidad de llegadas tarde o retardos registrados en el periodo.';
COMMENT ON COLUMN academic_grades_historic.teacher_observations IS 'Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo.';
COMMENT ON COLUMN academic_grades_historic.is_locked IS 'Indica si la calificación se encuentra bloqueada por cierre de periodo académico.';
COMMENT ON COLUMN academic_grades_historic.updated_by_user_id IS 'Identificador del usuario que realizó la última modificación del registro.';
COMMENT ON COLUMN academic_grades_historic.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN academic_grades_historic.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: academic_grading_rules (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE academic_grading_rules IS 'Reglas institucionales del Sistema Institucional de Evaluación de Estudiantes (SIEE) por año lectivo y grupo de grados (nota mínima aprobatoria, decimales, áreas perdidas, redondeo).';
COMMENT ON COLUMN academic_grading_rules.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_grading_rules.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_grading_rules.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_grading_rules.grade_group_id IS 'Identificador de la agrupación o ciclo de grados (referencia a grade_groups).';
COMMENT ON COLUMN academic_grading_rules.decimals_count IS 'Cantidad de cifras decimales utilizadas para truncar o redondear las calificaciones (0, 1 o 2).';
COMMENT ON COLUMN academic_grading_rules.min_passing_score IS 'Nota mínima requerida para aprobar una asignatura o área según el SIEE del colegio.';
COMMENT ON COLUMN academic_grading_rules.max_recovery_score IS 'Nota máxima reconocible al aprobar una nivelación académica según el SIEE.';
COMMENT ON COLUMN academic_grading_rules.failed_areas_limit IS 'Número máximo de áreas reprobadas a partir del cual el estudiante reprueba el año lectivo.';
COMMENT ON COLUMN academic_grading_rules.fails_after_recovery IS 'Indica si se mantiene la reprobación tras no superar el proceso de nivelación.';
COMMENT ON COLUMN academic_grading_rules.promotion_mode IS 'Modalidad de cálculo de promoción (por asignaturas, por áreas ponderadas o por promedio general).';
COMMENT ON COLUMN academic_grading_rules.uses_weighted_areas IS 'Indica si el cálculo de áreas utiliza el peso porcentual de cada asignatura.';
COMMENT ON COLUMN academic_grading_rules.absence_fail_percentage IS 'Porcentaje de inasistencias (ej. 25%) a partir del cual se reprueba por fallas.';
COMMENT ON COLUMN academic_grading_rules.rounds_period_score IS 'Indica si el sistema redondea automáticamente la nota definitiva de cada periodo.';
COMMENT ON COLUMN academic_grading_rules.rounds_final_score IS 'Indica si el sistema redondea automáticamente el promedio definitivo anual.';
COMMENT ON COLUMN academic_grading_rules.promotion_date IS 'Fecha oficial de cierre y expedición del acta de promoción anual.';

-- Tabla: academic_groups (Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica)
COMMENT ON TABLE academic_groups IS 'Grupos o cursos escolares por año lectivo, sede, jornada y grado (ej. 6°01, 11°A) con su director de grupo asignado.';
COMMENT ON COLUMN academic_groups.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_groups.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_groups.campus_id IS 'Identificador de la sede física de la institución educativa (referencia a campuses).';
COMMENT ON COLUMN academic_groups.shift_id IS 'Identificador de la jornada escolar de la institución (referencia a school_shifts).';
COMMENT ON COLUMN academic_groups.grade_id IS 'Identificador del grado académico de la institución (referencia a grades).';
COMMENT ON COLUMN academic_groups.homeroom_teacher_id IS 'Identificador del docente director de grupo (referencia a teacher_profiles).';
COMMENT ON COLUMN academic_groups.study_methodology_id IS 'Identificador de la metodología educativa SIMAT aplicada (referencia a study_methodologies).';
COMMENT ON COLUMN academic_groups.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_groups.group_code IS 'Código identificador del grupo dentro del grado (ej. 01, 02, A, B).';
COMMENT ON COLUMN academic_groups.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN academic_groups.max_capacity IS 'Cupo máximo de estudiantes permitidos en el salón o grupo académico.';
COMMENT ON COLUMN academic_groups.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: academic_periods (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE academic_periods IS 'Periodos académicos de evaluación del año lectivo con su porcentaje de ponderación y ventanas de fechas para digitación de notas y nivelaciones.';
COMMENT ON COLUMN academic_periods.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_periods.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_periods.grade_group_id IS 'Identificador de la agrupación o ciclo de grados (referencia a grade_groups).';
COMMENT ON COLUMN academic_periods.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_periods.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN academic_periods.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN academic_periods.weight_percentage IS 'Porcentaje de ponderación (0.00 a 100.00) que aporta el elemento al cálculo definitivo.';
COMMENT ON COLUMN academic_periods.start_date IS 'Fecha de inicio de vigencia del año o periodo académico.';
COMMENT ON COLUMN academic_periods.end_date IS 'Fecha de finalización del año o periodo académico.';
COMMENT ON COLUMN academic_periods.grading_open_date IS 'Fecha de apertura de plataforma para digitación de calificaciones docentes.';
COMMENT ON COLUMN academic_periods.grading_close_date IS 'Fecha límite de cierre de plataforma para digitación de calificaciones ordinarias.';
COMMENT ON COLUMN academic_periods.recovery_open_date IS 'Fecha de apertura para registro de calificaciones de nivelación periódica.';
COMMENT ON COLUMN academic_periods.recovery_close_date IS 'Fecha límite para cierre de digitación de nivelaciones periódicas.';
COMMENT ON COLUMN academic_periods.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN academic_periods.is_closed IS 'Indica si el año lectivo o periodo académico se encuentra cerrado definitivamente.';

-- Tabla: academic_pre_reports (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE academic_pre_reports IS 'Preinformes académicos periódicos de alerta temprana para padres de familia sobre estudiantes con riesgo de pérdida académica.';
COMMENT ON COLUMN academic_pre_reports.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_pre_reports.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_pre_reports.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN academic_pre_reports.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN academic_pre_reports.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN academic_pre_reports.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN academic_pre_reports.partial_score IS 'Nota parcial acumulada al momento del corte de preinforme académico.';
COMMENT ON COLUMN academic_pre_reports.national_scale_id IS 'Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior).';
COMMENT ON COLUMN academic_pre_reports.observations IS 'Observaciones adicionales o notas aclaratorias del registro.';
COMMENT ON COLUMN academic_pre_reports.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: academic_specialties (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE academic_specialties IS 'Catálogo oficial MEN de especialidades académicas y técnicas (Comercial, Industrial, Agropecuaria, Pedagógica, Promoción Social).';
COMMENT ON COLUMN academic_specialties.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_specialties.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN academic_specialties.character_id IS 'Identificador del carácter de educación media (Académico o Técnico).';
COMMENT ON COLUMN academic_specialties.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: academic_years (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE academic_years IS 'Años lectivos por institución educativa con fechas de apertura/cierre y parametrización JSONB de boletines, certificados y actas de grado.';
COMMENT ON COLUMN academic_years.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN academic_years.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN academic_years.year IS 'Año calendario numérico de cuatro dígitos del año lectivo.';
COMMENT ON COLUMN academic_years.start_date IS 'Fecha de inicio de vigencia del año o periodo académico.';
COMMENT ON COLUMN academic_years.end_date IS 'Fecha de finalización del año o periodo académico.';
COMMENT ON COLUMN academic_years.online_enrollment_closed_at IS 'Fecha de cierre del proceso de prematrícula y renovación de matrícula en línea.';
COMMENT ON COLUMN academic_years.is_online_enrollment_open IS 'Indica si el portal de matrículas en línea se encuentra habilitado para padres y estudiantes.';
COMMENT ON COLUMN academic_years.is_closed IS 'Indica si el año lectivo o periodo académico se encuentra cerrado definitivamente.';
COMMENT ON COLUMN academic_years.report_card_settings IS 'Configuración JSONB de diseño, firmas, márgenes y opciones de impresión de boletines periódicos.';
COMMENT ON COLUMN academic_years.certificate_settings IS 'Configuración JSONB de encabezados, textos legales y firmas para certificados de estudio.';
COMMENT ON COLUMN academic_years.graduation_act_settings IS 'Configuración JSONB de parámetros para actas de graduación y diplomas.';

-- Tabla: achievement_standards (Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica)
COMMENT ON TABLE achievement_standards IS 'Banco normalizado de logros, indicadores de desempeño, competencias y estándares básicos por grado, asignatura y periodo (reemplaza las 20 columnas repetitivas l1..l20).';
COMMENT ON COLUMN achievement_standards.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN achievement_standards.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN achievement_standards.grade_id IS 'Identificador del grado académico de la institución (referencia a grades).';
COMMENT ON COLUMN achievement_standards.subject_id IS 'Identificador de la asignatura académica institucional (referencia a subjects).';
COMMENT ON COLUMN achievement_standards.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN achievement_standards.national_scale_id IS 'Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior).';
COMMENT ON COLUMN achievement_standards.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN achievement_standards.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN achievement_standards.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN achievement_standards.indicator_type IS 'Tipo de indicador pedagógico (LOGRO, FORTALEZA, DIFICULTAD, RECOMENDACION, COMPETENCIA).';
COMMENT ON COLUMN achievement_standards.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN achievement_standards.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN achievement_standards.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: administrative_career_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE administrative_career_types IS 'Catálogo de pertenencia a carrera administrativa para funcionarios administrativos.';
COMMENT ON COLUMN administrative_career_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN administrative_career_types.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: administrative_staff (Dominio 4: Comunidad Educativa (Docentes, Administrativos, Estudiantes y Familias))
COMMENT ON TABLE administrative_staff IS 'Ficha laboral de directivos y personal administrativo vinculados a la institución educativa.';
COMMENT ON COLUMN administrative_staff.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN administrative_staff.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN administrative_staff.user_id IS 'Identificador del usuario global de la comunidad educativa en la tabla users.';
COMMENT ON COLUMN administrative_staff.document_type_id IS 'Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types).';
COMMENT ON COLUMN administrative_staff.document_number IS 'Número de documento de identidad de la persona sin puntos ni espacios.';
COMMENT ON COLUMN administrative_staff.first_name IS 'Primer nombre legal de la persona.';
COMMENT ON COLUMN administrative_staff.middle_name IS 'Segundo nombre de la persona (opcional).';
COMMENT ON COLUMN administrative_staff.last_name IS 'Primer apellido legal de la persona.';
COMMENT ON COLUMN administrative_staff.second_last_name IS 'Segundo apellido de la persona (opcional).';
COMMENT ON COLUMN administrative_staff.gender_id IS 'Identificador del género de la persona (referencia a genders).';
COMMENT ON COLUMN administrative_staff.birth_date IS 'Fecha de nacimiento de la persona.';
COMMENT ON COLUMN administrative_staff.phone IS 'Número telefónico fijo o principal de contacto.';
COMMENT ON COLUMN administrative_staff.email IS 'Dirección de correo electrónico de contacto o notificación.';
COMMENT ON COLUMN administrative_staff.hierarchy_level_id IS 'Identificador del nivel jerárquico administrativo (referencia a hierarchy_levels).';
COMMENT ON COLUMN administrative_staff.career_type_id IS 'Identificador del tipo de carrera administrativa (referencia a administrative_career_types).';
COMMENT ON COLUMN administrative_staff.appointment_type_id IS 'Identificador del tipo de nombramiento o vinculación laboral (referencia a staff_appointment_types).';
COMMENT ON COLUMN administrative_staff.workplace_location_id IS 'Identificador de la ubicación laboral del funcionario (referencia a workplace_locations).';
COMMENT ON COLUMN administrative_staff.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN administrative_staff.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: audit_logs (Dominio 2: Multi-Tenancy (Colegios), IAM, Sesiones, Almacenamiento S3 y Auditoría)
COMMENT ON TABLE audit_logs IS 'Bitácora inmutable de auditoría de operaciones críticas (creación, actualización, eliminación) aislada por institución educativa.';
COMMENT ON COLUMN audit_logs.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN audit_logs.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN audit_logs.user_id IS 'Identificador del usuario global de la comunidad educativa en la tabla users.';
COMMENT ON COLUMN audit_logs.entity_name IS 'Nombre de la tabla o entidad de dominio afectada por la operación auditada.';
COMMENT ON COLUMN audit_logs.entity_id IS 'Identificador del registro afectado por la operación auditada.';
COMMENT ON COLUMN audit_logs.action IS 'Acción ejecutada registrada en auditoría (INSERT, UPDATE, DELETE, LOGIN, SWITCH_CONTEXT).';
COMMENT ON COLUMN audit_logs.ip_address IS 'Dirección IPv4 o IPv6 desde la cual el cliente realizó la petición.';
COMMENT ON COLUMN audit_logs.previous_data IS 'Instantánea JSONB del estado de los datos antes de la modificación.';
COMMENT ON COLUMN audit_logs.new_data IS 'Instantánea JSONB del nuevo estado de los datos después de la modificación.';
COMMENT ON COLUMN audit_logs.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: auth_sessions (Dominio 2: Multi-Tenancy (Colegios), IAM, Sesiones, Almacenamiento S3 y Auditoría)
COMMENT ON TABLE auth_sessions IS 'Registro de sesiones de autenticación activas e históricas por institución educativa para control de concurrencia y revocación de tokens.';
COMMENT ON COLUMN auth_sessions.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN auth_sessions.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN auth_sessions.user_id IS 'Identificador del usuario global de la comunidad educativa en la tabla users.';
COMMENT ON COLUMN auth_sessions.ip_address IS 'Dirección IPv4 o IPv6 desde la cual el cliente realizó la petición.';
COMMENT ON COLUMN auth_sessions.user_agent IS 'Cadena User-Agent del navegador o aplicación móvil del usuario.';
COMMENT ON COLUMN auth_sessions.device_info IS 'Resumen del dispositivo y sistema operativo detectado en la sesión.';
COMMENT ON COLUMN auth_sessions.started_at IS 'Fecha y hora de inicio de la sesión o intento de evaluación.';
COMMENT ON COLUMN auth_sessions.ended_at IS 'Fecha y hora de cierre o finalización de la sesión.';
COMMENT ON COLUMN auth_sessions.expires_at IS 'Fecha y hora de expiración del token de sesión o comunicado.';
COMMENT ON COLUMN auth_sessions.is_revoked IS 'Indica si la sesión fue revocada manualmente o por cierre de seguridad.';

-- Tabla: campus_education_levels (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE campus_education_levels IS 'Niveles educativos autorizados y ofertados específicamente en cada sede del colegio.';
COMMENT ON COLUMN campus_education_levels.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN campus_education_levels.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN campus_education_levels.campus_id IS 'Identificador de la sede física de la institución educativa (referencia a campuses).';
COMMENT ON COLUMN campus_education_levels.education_level_id IS 'Identificador del nivel educativo institucional (referencia a education_levels).';
COMMENT ON COLUMN campus_education_levels.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: campus_shifts (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE campus_shifts IS 'Relación muchos-a-muchos que define qué jornadas funcionan en cada sede educativa.';
COMMENT ON COLUMN campus_shifts.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN campus_shifts.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN campus_shifts.campus_id IS 'Identificador de la sede física de la institución educativa (referencia a campuses).';
COMMENT ON COLUMN campus_shifts.shift_id IS 'Identificador de la jornada escolar de la institución (referencia a school_shifts).';
COMMENT ON COLUMN campus_shifts.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: campuses (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE campuses IS 'Sedes físicas o plantas educativas pertenecientes a una institución educativa con su respectivo código DANE consecutivo.';
COMMENT ON COLUMN campuses.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN campuses.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN campuses.city_id IS 'Identificador del municipio o ciudad DANE (referencia a cities).';
COMMENT ON COLUMN campuses.zone_id IS 'Identificador de la zona geográfica DANE (Urbana o Rural, referencia a geographical_zones).';
COMMENT ON COLUMN campuses.dane_code IS 'Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede.';
COMMENT ON COLUMN campuses.consecutive_code IS 'Código consecutivo DANE de 12 dígitos que identifica a la sede educativa.';
COMMENT ON COLUMN campuses.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN campuses.address IS 'Dirección física de residencia o ubicación.';
COMMENT ON COLUMN campuses.phones IS 'Números telefónicos de contacto institucional.';
COMMENT ON COLUMN campuses.email IS 'Dirección de correo electrónico de contacto o notificación.';
COMMENT ON COLUMN campuses.is_main_campus IS 'Indica si corresponde a la sede principal o rectoría de la institución educativa.';
COMMENT ON COLUMN campuses.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN campuses.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: cities (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE cities IS 'Catálogo oficial DANE (DIVIPOLA) de municipios y ciudades de Colombia y el exterior.';
COMMENT ON COLUMN cities.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN cities.department_id IS 'Identificador del departamento territorial DANE (referencia a departments).';
COMMENT ON COLUMN cities.dane_code IS 'Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede.';
COMMENT ON COLUMN cities.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: cloud_files (Dominio 2: Multi-Tenancy (Colegios), IAM, Sesiones, Almacenamiento S3 y Auditoría)
COMMENT ON TABLE cloud_files IS 'Repositorio centralizado de metadatos de archivos almacenados en AWS S3 por colegio (documentos estudiantiles, guías virtuales, adjuntos CRM, escudos y reportes Jasper).';
COMMENT ON COLUMN cloud_files.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN cloud_files.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN cloud_files.file_uuid IS 'Identificador universal único (UUID v4) asignado al archivo en la nube.';
COMMENT ON COLUMN cloud_files.uploaded_by_user_id IS 'Identificador del usuario que subió el archivo a AWS S3.';
COMMENT ON COLUMN cloud_files.owner_entity_type IS 'Categoría o entidad de negocio propietaria del archivo (STUDENT_DOCUMENTS, VIRTUAL_ACTIVITIES, CRM_ATTACHMENTS, etc.).';
COMMENT ON COLUMN cloud_files.owner_entity_id IS 'Identificador del registro propietario del archivo en la entidad correspondiente.';
COMMENT ON COLUMN cloud_files.file_name IS 'Nombre original o descriptivo del archivo subido.';
COMMENT ON COLUMN cloud_files.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN cloud_files.storage_path IS 'Ruta completa (Key) del objeto dentro del bucket de AWS S3 incluyendo el storage_folder del colegio.';
COMMENT ON COLUMN cloud_files.public_url IS 'URL de acceso o referencia base del objeto en el almacenamiento S3.';
COMMENT ON COLUMN cloud_files.extension IS 'Extensión del archivo sin punto (ej. pdf, png, jpg, docx).';
COMMENT ON COLUMN cloud_files.mime_type IS 'Tipo de contenido estándar MIME del archivo (ej. application/pdf, image/png).';
COMMENT ON COLUMN cloud_files.size_bytes IS 'Tamaño físico del archivo expresado en bytes.';
COMMENT ON COLUMN cloud_files.is_watermark IS 'Indica si la imagen se utiliza como marca de agua de fondo en los reportes Jasper.';
COMMENT ON COLUMN cloud_files.metadata IS 'Objeto JSONB con metadatos técnicos adicionales del registro (ETag, bucket, artículos, etc.).';
COMMENT ON COLUMN cloud_files.status IS 'Estado operativo actual del registro dentro de su flujo de ciclo de vida.';
COMMENT ON COLUMN cloud_files.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN cloud_files.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: conflict_victim_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE conflict_victim_types IS 'Catálogo oficial SIMAT de situaciones de víctima del conflicto armado y desplazamiento forzado.';
COMMENT ON COLUMN conflict_victim_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN conflict_victim_types.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN conflict_victim_types.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN conflict_victim_types.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: cost_regimes (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE cost_regimes IS 'Catálogo de regímenes de costos y tarifas educativas (Libertad Regulada, Libertad Vigilada, Régimen Controlado).';
COMMENT ON COLUMN cost_regimes.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN cost_regimes.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: countries (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE countries IS 'Catálogo oficial de países del mundo (ISO 3166-1) utilizado para nacionalidad, lugar de nacimiento y expedición de documentos de identidad.';
COMMENT ON COLUMN countries.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN countries.iso_code IS 'Código ISO 3166-1 alfa-2 de dos letras del país (ej. CO, US, VE).';
COMMENT ON COLUMN countries.iso_alpha3 IS 'Código ISO 3166-1 alfa-3 de tres letras del país (ej. COL, USA, VEN).';
COMMENT ON COLUMN countries.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN countries.continent_code IS 'Código de dos letras del continente geográfico (ej. SA, NA, EU).';
COMMENT ON COLUMN countries.fips_code IS 'Código estándar FIPS de identificación geográfica del país.';
COMMENT ON COLUMN countries.language_code IS 'Código de idioma principal hablado en el país (ej. es-CO).';
COMMENT ON COLUMN countries.phone_prefix IS 'Prefijo telefónico internacional de marcación del país (ej. +57).';
COMMENT ON COLUMN countries.top_level_domain IS 'Dominio de nivel superior geográfico ccTLD de Internet (ej. .co).';
COMMENT ON COLUMN countries.flag_image IS 'Nombre o ruta del archivo de icono de la bandera nacional.';
COMMENT ON COLUMN countries.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: course_assignments (Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica)
COMMENT ON TABLE course_assignments IS 'Carga académica docente que asigna un profesor específico para dictar una asignatura en un grupo, grado, sede y jornada durante el año lectivo.';
COMMENT ON COLUMN course_assignments.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN course_assignments.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN course_assignments.campus_id IS 'Identificador de la sede física de la institución educativa (referencia a campuses).';
COMMENT ON COLUMN course_assignments.shift_id IS 'Identificador de la jornada escolar de la institución (referencia a school_shifts).';
COMMENT ON COLUMN course_assignments.grade_id IS 'Identificador del grado académico de la institución (referencia a grades).';
COMMENT ON COLUMN course_assignments.academic_group_id IS 'Identificador del grupo o salón de clases activo (referencia a academic_groups).';
COMMENT ON COLUMN course_assignments.subject_id IS 'Identificador de la asignatura académica institucional (referencia a subjects).';
COMMENT ON COLUMN course_assignments.teacher_profile_id IS 'Identificador del perfil profesional del docente (referencia a teacher_profiles).';
COMMENT ON COLUMN course_assignments.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN course_assignments.weekly_hours IS 'Intensidad horaria semanal (IHS) en horas de clase asignadas a la asignatura.';
COMMENT ON COLUMN course_assignments.area_weight_percentage IS 'Porcentaje de peso que tiene la asignatura dentro del promedio ponderado de su área curricular.';
COMMENT ON COLUMN course_assignments.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN course_assignments.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: crm_announcement_receipts (Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector))
COMMENT ON TABLE crm_announcement_receipts IS 'Confirmaciones de lectura y acuse de recibo de circulares institucionales por parte de docentes, estudiantes y acudientes.';
COMMENT ON COLUMN crm_announcement_receipts.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN crm_announcement_receipts.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN crm_announcement_receipts.announcement_id IS 'Identificador de la circular o comunicado institucional (referencia a crm_announcements).';
COMMENT ON COLUMN crm_announcement_receipts.user_id IS 'Identificador del usuario global de la comunidad educativa en la tabla users.';
COMMENT ON COLUMN crm_announcement_receipts.read_at IS 'Fecha y hora exacta en que el destinatario abrió y leyó el comunicado.';
COMMENT ON COLUMN crm_announcement_receipts.acknowledged_at IS 'Fecha y hora en que el acudiente o destinatario firmó la confirmación de enterado.';

-- Tabla: crm_announcements (Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector))
COMMENT ON TABLE crm_announcements IS 'Circulares, comunicados y anuncios masivos segmentados por sede, jornada, grado, grupo y roles destinatarios.';
COMMENT ON COLUMN crm_announcements.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN crm_announcements.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN crm_announcements.author_user_id IS 'Identificador del directivo o docente autor del comunicado institucional.';
COMMENT ON COLUMN crm_announcements.campus_id IS 'Identificador de la sede física de la institución educativa (referencia a campuses).';
COMMENT ON COLUMN crm_announcements.shift_id IS 'Identificador de la jornada escolar de la institución (referencia a school_shifts).';
COMMENT ON COLUMN crm_announcements.grade_id IS 'Identificador del grado académico de la institución (referencia a grades).';
COMMENT ON COLUMN crm_announcements.academic_group_id IS 'Identificador del grupo o salón de clases activo (referencia a academic_groups).';
COMMENT ON COLUMN crm_announcements.target_roles IS 'Arreglo de roles de la comunidad educativa destinatarios de la circular (TEACHER, STUDENT, FAMILY, etc.).';
COMMENT ON COLUMN crm_announcements.title IS 'Título principal de la actividad, evaluación, documento o circular.';
COMMENT ON COLUMN crm_announcements.content_body IS 'Contenido completo del comunicado o circular institucional.';
COMMENT ON COLUMN crm_announcements.priority_level IS 'Nivel de prioridad del anuncio (LOW, NORMAL, HIGH, URGENT).';
COMMENT ON COLUMN crm_announcements.requires_acknowledgment IS 'Indica si el comunicado exige confirmación expresa de lectura por parte del acudiente o estudiante.';
COMMENT ON COLUMN crm_announcements.published_at IS 'Fecha y hora de publicación oficial del comunicado.';
COMMENT ON COLUMN crm_announcements.expires_at IS 'Fecha y hora de expiración del token de sesión o comunicado.';

-- Tabla: crm_channels (Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector))
COMMENT ON TABLE crm_channels IS 'Catálogo estático #54 de canales omnicanal soportados por el CRM Escolar (IN_APP, WHATSAPP, EMAIL, SMS, PUSH_NOTIFICATION).';
COMMENT ON COLUMN crm_channels.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN crm_channels.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN crm_channels.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN crm_channels.provider_name IS 'Nombre del proveedor tecnológico del canal omnicanal (ASAIE_REALTIME, META_CLOUD_API, SMTP_SES, AWS_SNS, FCM_WEB_PUSH).';
COMMENT ON COLUMN crm_channels.supports_bidirectional IS 'Indica si el canal permite respuesta bidireccional entre el destinatario y el colegio.';
COMMENT ON COLUMN crm_channels.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: crm_conversation_participants (Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector))
COMMENT ON TABLE crm_conversation_participants IS 'Participantes suscritos a un hilo de conversación del CRM Escolar con contador de mensajes no leídos y marca de última lectura.';
COMMENT ON COLUMN crm_conversation_participants.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN crm_conversation_participants.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN crm_conversation_participants.conversation_id IS 'Identificador del hilo de conversación en el CRM Escolar (referencia a crm_conversations).';
COMMENT ON COLUMN crm_conversation_participants.user_id IS 'Identificador del usuario global de la comunidad educativa en la tabla users.';
COMMENT ON COLUMN crm_conversation_participants.participant_role IS 'Rol institucional con el que actúa el usuario dentro de la conversación (RECTOR, TEACHER, FAMILY, STUDENT).';
COMMENT ON COLUMN crm_conversation_participants.unread_count IS 'Cantidad de mensajes pendientes por leer para este participante en el hilo.';
COMMENT ON COLUMN crm_conversation_participants.last_read_at IS 'Fecha y hora en que el participante leyó por última vez la conversación.';
COMMENT ON COLUMN crm_conversation_participants.is_muted IS 'Indica si el participante silenció las notificaciones de este hilo de conversación.';
COMMENT ON COLUMN crm_conversation_participants.joined_at IS 'Fecha y hora en que el usuario fue vinculado a la conversación o clase en vivo.';

-- Tabla: crm_conversations (Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector))
COMMENT ON TABLE crm_conversations IS 'Hilos de conversación omnicanal entre miembros de la comunidad educativa (Directivos, Docentes, Acudientes y Estudiantes) aislados por colegio mediante RLS.';
COMMENT ON COLUMN crm_conversations.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN crm_conversations.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN crm_conversations.channel_id IS 'Identificador del canal omnicanal utilizado (referencia a crm_channels).';
COMMENT ON COLUMN crm_conversations.created_by_user_id IS 'Identificador del usuario que creó originalmente el registro.';
COMMENT ON COLUMN crm_conversations.student_enrollment_id IS 'Identificador opcional de la matrícula del estudiante asociada al caso o conversación (referencia a student_enrollments).';
COMMENT ON COLUMN crm_conversations.subject IS 'Asunto o tema principal de la conversación o ticket de soporte.';
COMMENT ON COLUMN crm_conversations.conversation_type IS 'Clasificación de la conversación (DIRECT, GROUP_ACADEMIC, FAMILY_TEACHER, ADMINISTRATIVE).';
COMMENT ON COLUMN crm_conversations.status IS 'Estado operativo actual del registro dentro de su flujo de ciclo de vida.';
COMMENT ON COLUMN crm_conversations.last_message_at IS 'Fecha y hora del último mensaje enviado en el hilo de conversación (para ordenamiento de bandeja).';
COMMENT ON COLUMN crm_conversations.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: crm_knowledge_embeddings (Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector))
COMMENT ON TABLE crm_knowledge_embeddings IS 'Base de conocimiento vectorial (pgvector 768 dimensiones + índice HNSW) para búsqueda semántica sobre PEI, SIEE, Manual de Convivencia, Circulares y Mensajes CRM aislada por colegio (RLS).';
COMMENT ON COLUMN crm_knowledge_embeddings.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN crm_knowledge_embeddings.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN crm_knowledge_embeddings.document_source IS 'Fuente documental institucional del fragmento vectorizado (PEI, SIEE, MANUAL_CONVIVENCIA, FAQ_CIRCULAR, CRM_MESSAGE, ACADEMIC_CALENDAR).';
COMMENT ON COLUMN crm_knowledge_embeddings.source_reference_id IS 'Identificador opcional del registro origen del fragmento indexado.';
COMMENT ON COLUMN crm_knowledge_embeddings.title IS 'Título principal de la actividad, evaluación, documento o circular.';
COMMENT ON COLUMN crm_knowledge_embeddings.chunk_text IS 'Texto completo del fragmento institucional indexado para recuperación semántica (RAG).';
COMMENT ON COLUMN crm_knowledge_embeddings.embedding IS 'Vector numérico normalizado de 768 dimensiones (pgvector) para búsqueda de similitud coseno con índice HNSW.';
COMMENT ON COLUMN crm_knowledge_embeddings.metadata IS 'Objeto JSONB con metadatos técnicos adicionales del registro (ETag, bucket, artículos, etc.).';
COMMENT ON COLUMN crm_knowledge_embeddings.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: crm_messages (Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector))
COMMENT ON TABLE crm_messages IS 'Mensajes individuales enviados dentro de una conversación del CRM Escolar con soporte de adjuntos en AWS S3 y estado de entrega.';
COMMENT ON COLUMN crm_messages.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN crm_messages.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN crm_messages.conversation_id IS 'Identificador del hilo de conversación en el CRM Escolar (referencia a crm_conversations).';
COMMENT ON COLUMN crm_messages.sender_user_id IS 'Identificador del usuario remitente que envió el mensaje en el CRM Escolar.';
COMMENT ON COLUMN crm_messages.channel_id IS 'Identificador del canal omnicanal utilizado (referencia a crm_channels).';
COMMENT ON COLUMN crm_messages.body_text IS 'Cuerpo textual del mensaje enviado en la conversación omnicanal.';
COMMENT ON COLUMN crm_messages.attachment_file_id IS 'Identificador del archivo adjunto almacenado en AWS S3 (referencia a cloud_files).';
COMMENT ON COLUMN crm_messages.delivery_status IS 'Estado de entrega del mensaje omnicanal (QUEUED, SENT, DELIVERED, READ, FAILED).';
COMMENT ON COLUMN crm_messages.external_message_id IS 'Identificador externo devuelto por la pasarela de WhatsApp Cloud API, SMTP o SMS.';
COMMENT ON COLUMN crm_messages.sent_at IS 'Fecha y hora exacta de envío del mensaje.';

-- Tabla: crm_support_tickets (Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector))
COMMENT ON TABLE crm_support_tickets IS 'Tickets de atención a padres, solicitudes de certificados y casos PQRSD gestionados con SLA dentro del CRM Escolar.';
COMMENT ON COLUMN crm_support_tickets.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN crm_support_tickets.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN crm_support_tickets.ticket_code IS 'Código radicado único del ticket PQRSD o solicitud dentro de la institución educativa.';
COMMENT ON COLUMN crm_support_tickets.category_id IS 'Identificador de la categoría del ticket o cargo (referencia al catálogo respectivo).';
COMMENT ON COLUMN crm_support_tickets.requester_user_id IS 'Identificador del padre, estudiante o docente que radica la solicitud o PQRSD.';
COMMENT ON COLUMN crm_support_tickets.assigned_user_id IS 'Identificador del funcionario o coordinador asignado para resolver el ticket.';
COMMENT ON COLUMN crm_support_tickets.student_enrollment_id IS 'Identificador opcional de la matrícula del estudiante asociada al caso o conversación (referencia a student_enrollments).';
COMMENT ON COLUMN crm_support_tickets.subject IS 'Asunto o tema principal de la conversación o ticket de soporte.';
COMMENT ON COLUMN crm_support_tickets.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN crm_support_tickets.priority IS 'Prioridad de atención del ticket (LOW, MEDIUM, HIGH, CRITICAL).';
COMMENT ON COLUMN crm_support_tickets.status IS 'Estado operativo actual del registro dentro de su flujo de ciclo de vida.';
COMMENT ON COLUMN crm_support_tickets.due_at IS 'Fecha y hora máxima de vencimiento del acuerdo de nivel de servicio (SLA).';
COMMENT ON COLUMN crm_support_tickets.resolved_at IS 'Fecha y hora en que la solicitud o ticket fue resuelto.';
COMMENT ON COLUMN crm_support_tickets.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: crm_ticket_categories (Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector))
COMMENT ON TABLE crm_ticket_categories IS 'Catálogo estático #55 de categorías de solicitudes, trámites y PQRSD del CRM Escolar con tiempo de respuesta SLA en horas.';
COMMENT ON COLUMN crm_ticket_categories.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN crm_ticket_categories.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN crm_ticket_categories.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN crm_ticket_categories.sla_hours IS 'Tiempo máximo de respuesta y solución expresado en horas hábiles según la categoría.';
COMMENT ON COLUMN crm_ticket_categories.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: curriculum_study_plans (Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica)
COMMENT ON TABLE curriculum_study_plans IS 'Plan de estudios institucional (pensum) que define la intensidad horaria semanal y el peso porcentual de cada asignatura dentro de su área por grado y año lectivo.';
COMMENT ON COLUMN curriculum_study_plans.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN curriculum_study_plans.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN curriculum_study_plans.campus_id IS 'Identificador de la sede física de la institución educativa (referencia a campuses).';
COMMENT ON COLUMN curriculum_study_plans.grade_id IS 'Identificador del grado académico de la institución (referencia a grades).';
COMMENT ON COLUMN curriculum_study_plans.subject_id IS 'Identificador de la asignatura académica institucional (referencia a subjects).';
COMMENT ON COLUMN curriculum_study_plans.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN curriculum_study_plans.weekly_hours IS 'Intensidad horaria semanal (IHS) en horas de clase asignadas a la asignatura.';
COMMENT ON COLUMN curriculum_study_plans.area_weight_percentage IS 'Porcentaje de peso que tiene la asignatura dentro del promedio ponderado de su área curricular.';
COMMENT ON COLUMN curriculum_study_plans.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: departments (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE departments IS 'Catálogo oficial DANE de departamentos o estados territoriales vinculados a un país.';
COMMENT ON COLUMN departments.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN departments.country_id IS 'Identificador del país en el catálogo ISO (referencia a countries).';
COMMENT ON COLUMN departments.dane_code IS 'Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede.';
COMMENT ON COLUMN departments.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN departments.abbreviation IS 'Abreviatura o sigla corta para visualización en boletines y planillas.';

-- Tabla: disability_categories (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE disability_categories IS 'Catálogo de categorías generales de discapacidad para caracterización de educación inclusiva (PIAR).';
COMMENT ON COLUMN disability_categories.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN disability_categories.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: disability_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE disability_types IS 'Catálogo oficial SIMAT de tipos específicos de discapacidad diagnosticada del estudiante.';
COMMENT ON COLUMN disability_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN disability_types.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN disability_types.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN disability_types.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: document_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE document_types IS 'Catálogo oficial SIMAT/ Registraduría de tipos de documento de identidad (CC, TI, RC, CE, PEP, PPT, NES).';
COMMENT ON COLUMN document_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN document_types.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN document_types.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN document_types.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: education_levels (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE education_levels IS 'Niveles educativos ofrecidos por cada institución educativa (Preescolar, Primaria, Secundaria, Media, Ciclos).';
COMMENT ON COLUMN education_levels.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN education_levels.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN education_levels.catalog_level_id IS 'Referencia al nivel educativo estándar en el catálogo nacional (education_levels_catalog).';
COMMENT ON COLUMN education_levels.level_code IS 'Código interno del nivel educativo en la institución.';
COMMENT ON COLUMN education_levels.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN education_levels.abbreviation IS 'Abreviatura o sigla corta para visualización en boletines y planillas.';
COMMENT ON COLUMN education_levels.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: education_levels_catalog (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE education_levels_catalog IS 'Catálogo base MEN de niveles educativos (Preescolar, Básica Primaria, Básica Secundaria, Media).';
COMMENT ON COLUMN education_levels_catalog.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN education_levels_catalog.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN education_levels_catalog.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN education_levels_catalog.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: educational_process_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE educational_process_types IS 'Catálogo de tipos de procesos formativos y dimensiones de evaluación institucional.';
COMMENT ON COLUMN educational_process_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN educational_process_types.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN educational_process_types.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: election_candidacy_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE election_candidacy_types IS 'Catálogo de órganos y dignidades del Gobierno Escolar (Personero Estudiantil, Contralor Escolar, Consejo Estudiantil).';
COMMENT ON COLUMN election_candidacy_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN election_candidacy_types.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN election_candidacy_types.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: election_candidates (Dominio 10: Gobierno Escolar y Votaciones Electrónicas)
COMMENT ON TABLE election_candidates IS 'Candidatos inscritos a Personería, Contraloría o Consejo Estudiantil con número en el tarjetón, foto y propuesta.';
COMMENT ON COLUMN election_candidates.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN election_candidates.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN election_candidates.election_id IS 'Identificador de la jornada electoral escolar (referencia a school_elections).';
COMMENT ON COLUMN election_candidates.candidacy_type_id IS 'Identificador de la dignidad u órgano del Gobierno Escolar al que aspira (referencia a election_candidacy_types).';
COMMENT ON COLUMN election_candidates.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN election_candidates.ballot_number IS 'Número en el tarjetón electoral asignado al candidato (ej. 01, 02, VOTO EN BLANCO).';
COMMENT ON COLUMN election_candidates.candidate_name IS 'Nombre completo del estudiante candidato visible en el tarjetón electrónico.';
COMMENT ON COLUMN election_candidates.proposal_text IS 'Resumen del plan de trabajo o propuestas del candidato estudiantil.';
COMMENT ON COLUMN election_candidates.photo_url IS 'URL de la fotografía del estudiante o candidato almacenada en S3.';
COMMENT ON COLUMN election_candidates.is_blank_vote_option IS 'Indica si el registro representa la opción institucional de Voto en Blanco.';
COMMENT ON COLUMN election_candidates.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: election_juries (Dominio 10: Gobierno Escolar y Votaciones Electrónicas)
COMMENT ON TABLE election_juries IS 'Jurados de votación asignados a cada mesa electoral de la institución.';
COMMENT ON COLUMN election_juries.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN election_juries.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN election_juries.polling_station_id IS 'Identificador de la mesa de votación asignada (referencia a election_polling_stations).';
COMMENT ON COLUMN election_juries.full_name IS 'Nombre completo concatenado de la persona.';
COMMENT ON COLUMN election_juries.role_title IS 'Cargo desempeñado por el jurado dentro de la mesa de votación (Presidente, Vicepresidente, Vocal).';

-- Tabla: election_polling_stations (Dominio 10: Gobierno Escolar y Votaciones Electrónicas)
COMMENT ON TABLE election_polling_stations IS 'Mesas de votación electrónica o presencial habilitadas por sede y grados autorizados.';
COMMENT ON COLUMN election_polling_stations.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN election_polling_stations.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN election_polling_stations.election_id IS 'Identificador de la jornada electoral escolar (referencia a school_elections).';
COMMENT ON COLUMN election_polling_stations.campus_id IS 'Identificador de la sede física de la institución educativa (referencia a campuses).';
COMMENT ON COLUMN election_polling_stations.station_number IS 'Número identificador de la mesa de votación.';
COMMENT ON COLUMN election_polling_stations.station_name IS 'Nombre descriptivo de la mesa de votación escolar.';
COMMENT ON COLUMN election_polling_stations.location_description IS 'Ubicación física de la mesa de votación dentro de la sede educativa.';
COMMENT ON COLUMN election_polling_stations.allowed_grades IS 'Arreglo JSONB con los códigos de grados habilitados para sufragar en esta mesa.';
COMMENT ON COLUMN election_polling_stations.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: election_votes (Dominio 10: Gobierno Escolar y Votaciones Electrónicas)
COMMENT ON TABLE election_votes IS 'Registro único e inmutable de votos emitidos por estudiante y dignidad en las elecciones escolares.';
COMMENT ON COLUMN election_votes.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN election_votes.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN election_votes.election_id IS 'Identificador de la jornada electoral escolar (referencia a school_elections).';
COMMENT ON COLUMN election_votes.polling_station_id IS 'Identificador de la mesa de votación asignada (referencia a election_polling_stations).';
COMMENT ON COLUMN election_votes.candidacy_type_id IS 'Identificador de la dignidad u órgano del Gobierno Escolar al que aspira (referencia a election_candidacy_types).';
COMMENT ON COLUMN election_votes.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN election_votes.candidate_id IS 'Identificador del candidato por el cual se emitió el voto (referencia a election_candidates).';
COMMENT ON COLUMN election_votes.voted_at IS 'Fecha y hora exacta en que se registró el voto electrónico.';

-- Tabla: enrollment_novelties (Dominio 6: Matrículas SIMAT, Novedades y Promoción Escolar)
COMMENT ON TABLE enrollment_novelties IS 'Historial de novedades de matrícula del estudiante (retiros, traslados, deserciones, cambios de estado SIMAT).';
COMMENT ON COLUMN enrollment_novelties.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN enrollment_novelties.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN enrollment_novelties.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN enrollment_novelties.enrollment_status_id IS 'Identificador del estado de matrícula SIMAT (referencia a enrollment_statuses).';
COMMENT ON COLUMN enrollment_novelties.novelty_date IS 'Fecha efectiva en que se produjo la novedad de matrícula (retiro, traslado, deserción).';
COMMENT ON COLUMN enrollment_novelties.reason IS 'Motivo detallado de la novedad de matrícula registrada.';
COMMENT ON COLUMN enrollment_novelties.created_by_user_id IS 'Identificador del usuario que creó originalmente el registro.';
COMMENT ON COLUMN enrollment_novelties.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: enrollment_statuses (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE enrollment_statuses IS 'Catálogo oficial SIMAT de estados de matrícula del estudiante (Matriculado, Retirado, Desertor, Trasladado, Graduado).';
COMMENT ON COLUMN enrollment_statuses.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN enrollment_statuses.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: ethnic_groups (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE ethnic_groups IS 'Catálogo oficial DANE/SIMAT de pueblos y grupos étnicos (Indígenas, Afrocolombianos, Raizales, Palenqueros, Rrom).';
COMMENT ON COLUMN ethnic_groups.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN ethnic_groups.dane_code IS 'Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede.';
COMMENT ON COLUMN ethnic_groups.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: ethno_education_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE ethno_education_types IS 'Catálogo de modalidades de etnoeducación aplicables a instituciones educativas focalizadas.';
COMMENT ON COLUMN ethno_education_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN ethno_education_types.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: evaluation_dimension_columns (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE evaluation_dimension_columns IS 'Subcolumnas estándar parametrizadas dentro de cada dimensión evaluativa institucional.';
COMMENT ON COLUMN evaluation_dimension_columns.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN evaluation_dimension_columns.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN evaluation_dimension_columns.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN evaluation_dimension_columns.column_number IS 'Número secuencial de la columna dentro de la dimensión evaluativa.';
COMMENT ON COLUMN evaluation_dimension_columns.label IS 'Etiqueta o título corto de la columna evaluativa.';
COMMENT ON COLUMN evaluation_dimension_columns.weight_percentage IS 'Porcentaje de ponderación (0.00 a 100.00) que aporta el elemento al cálculo definitivo.';

-- Tabla: evaluation_dimensions (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE evaluation_dimensions IS 'Dimensiones o componentes del proceso evaluativo (ej. Cognitivo/Conceptual, Procedimental, Actitudinal, Evaluación Final) con su peso porcentual.';
COMMENT ON COLUMN evaluation_dimensions.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN evaluation_dimensions.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN evaluation_dimensions.grade_group_id IS 'Identificador de la agrupación o ciclo de grados (referencia a grade_groups).';
COMMENT ON COLUMN evaluation_dimensions.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN evaluation_dimensions.dimension_code IS 'Código numérico interno de la dimensión evaluativa en el SIEE.';
COMMENT ON COLUMN evaluation_dimensions.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN evaluation_dimensions.abbreviation IS 'Abreviatura o sigla corta para visualización en boletines y planillas.';
COMMENT ON COLUMN evaluation_dimensions.weight_percentage IS 'Porcentaje de ponderación (0.00 a 100.00) que aporta el elemento al cálculo definitivo.';
COMMENT ON COLUMN evaluation_dimensions.is_editable IS 'Indica si los docentes pueden modificar las subcolumnas de esta dimensión.';

-- Tabla: evaluation_question_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE evaluation_question_types IS 'Catálogo de tipos de preguntas para evaluaciones en línea del Aula Virtual (Selección Múltiple Única/Múltiple, Falso/Verdadero, Ensayo).';
COMMENT ON COLUMN evaluation_question_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN evaluation_question_types.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN evaluation_question_types.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: exceptional_capabilities (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE exceptional_capabilities IS 'Catálogo oficial SIMAT de capacidades y talentos excepcionales reconocidos en estudiantes.';
COMMENT ON COLUMN exceptional_capabilities.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN exceptional_capabilities.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN exceptional_capabilities.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN exceptional_capabilities.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: family_member_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE family_member_types IS 'Catálogo de clasificación del rol familiar en la ficha socioeconómica del estudiante.';
COMMENT ON COLUMN family_member_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN family_member_types.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: family_profiles (Dominio 4: Comunidad Educativa (Docentes, Administrativos, Estudiantes y Familias))
COMMENT ON TABLE family_profiles IS 'Ficha de padres de familia, madres y acudientes con datos de contacto, ocupación y dirección laboral.';
COMMENT ON COLUMN family_profiles.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN family_profiles.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN family_profiles.user_id IS 'Identificador del usuario global de la comunidad educativa en la tabla users.';
COMMENT ON COLUMN family_profiles.document_type_id IS 'Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types).';
COMMENT ON COLUMN family_profiles.document_number IS 'Número de documento de identidad de la persona sin puntos ni espacios.';
COMMENT ON COLUMN family_profiles.expedition_department_id IS 'Departamento de expedición del documento de identidad (referencia a departments).';
COMMENT ON COLUMN family_profiles.expedition_city_id IS 'Municipio de expedición del documento de identidad (referencia a cities).';
COMMENT ON COLUMN family_profiles.full_name IS 'Nombre completo concatenado de la persona.';
COMMENT ON COLUMN family_profiles.gender_id IS 'Identificador del género de la persona (referencia a genders).';
COMMENT ON COLUMN family_profiles.birth_date IS 'Fecha de nacimiento de la persona.';
COMMENT ON COLUMN family_profiles.address IS 'Dirección física de residencia o ubicación.';
COMMENT ON COLUMN family_profiles.work_address IS 'Dirección física del lugar de trabajo del acudiente.';
COMMENT ON COLUMN family_profiles.phone IS 'Número telefónico fijo o principal de contacto.';
COMMENT ON COLUMN family_profiles.mobile_phone IS 'Número de teléfono celular o móvil personal.';
COMMENT ON COLUMN family_profiles.work_phone IS 'Número telefónico del lugar de trabajo.';
COMMENT ON COLUMN family_profiles.email IS 'Dirección de correo electrónico de contacto o notificación.';
COMMENT ON COLUMN family_profiles.occupation IS 'Ocupación, profesión u oficio del padre o acudiente.';
COMMENT ON COLUMN family_profiles.company_name IS 'Nombre de la empresa o entidad donde labora el acudiente.';
COMMENT ON COLUMN family_profiles.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN family_profiles.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: family_relationship_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE family_relationship_types IS 'Catálogo de tipos de parentesco familiar (Padre, Madre, Abuelo, Tío, Acudiente Legal) respecto al estudiante.';
COMMENT ON COLUMN family_relationship_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN family_relationship_types.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: funding_sources (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE funding_sources IS 'Catálogo de fuentes de financiación de cargos (Sistema General de Participaciones SGP, Recursos Propios).';
COMMENT ON COLUMN funding_sources.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN funding_sources.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: genders (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE genders IS 'Catálogo de géneros biológicos e identitarios para caracterización demográfica SIMAT.';
COMMENT ON COLUMN genders.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN genders.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN genders.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: geographical_zones (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE geographical_zones IS 'Catálogo de zonas geográficas DANE (Urbana, Rural, Urbana-Rural) para ubicación de sedes y residencia estudiantil.';
COMMENT ON COLUMN geographical_zones.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN geographical_zones.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: grade_groups (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE grade_groups IS 'Agrupaciones de grados configuradas por el colegio para parametrizar reglas de evaluación, escalas y periodos diferenciados.';
COMMENT ON COLUMN grade_groups.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN grade_groups.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN grade_groups.catalog_grade_group_id IS 'Referencia al catálogo nacional de grupos de grados (grade_groups_catalog).';
COMMENT ON COLUMN grade_groups.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN grade_groups.is_cycle_end IS 'Indica si el grupo de grados corresponde a cierre de ciclo educativo.';

-- Tabla: grade_groups_catalog (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE grade_groups_catalog IS 'Catálogo base de agrupaciones de grados por ciclo académico para reglas de evaluación y promoción.';
COMMENT ON COLUMN grade_groups_catalog.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN grade_groups_catalog.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN grade_groups_catalog.is_cycle_end IS 'Indica si el grupo de grados corresponde a cierre de ciclo educativo.';

-- Tabla: grades (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE grades IS 'Grados académicos activos de la institución educativa vinculados a su nivel educativo y grado de promoción siguiente.';
COMMENT ON COLUMN grades.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN grades.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN grades.education_level_id IS 'Identificador del nivel educativo institucional (referencia a education_levels).';
COMMENT ON COLUMN grades.grade_group_id IS 'Identificador de la agrupación o ciclo de grados (referencia a grade_groups).';
COMMENT ON COLUMN grades.catalog_grade_id IS 'Referencia al grado equivalente en el catálogo nacional SIMAT (grades_catalog).';
COMMENT ON COLUMN grades.grade_code IS 'Código oficial SIMAT del grado escolar (ej. -2, -1, 0, 1..11, 21..26).';
COMMENT ON COLUMN grades.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN grades.display_order IS 'Orden numérico secuencial de presentación en interfaces, certificados y boletines.';
COMMENT ON COLUMN grades.next_grade_code IS 'Código del grado siguiente al cual se promueve automáticamente el estudiante que aprueba.';
COMMENT ON COLUMN grades.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: grades_catalog (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE grades_catalog IS 'Catálogo oficial SIMAT de los 24 grados escolares estandarizados (Prejardín a Once y Ciclos CLEI de Adultos).';
COMMENT ON COLUMN grades_catalog.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN grades_catalog.education_level_id IS 'Identificador del nivel educativo institucional (referencia a education_levels).';
COMMENT ON COLUMN grades_catalog.grade_code IS 'Código oficial SIMAT del grado escolar (ej. -2, -1, 0, 1..11, 21..26).';
COMMENT ON COLUMN grades_catalog.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN grades_catalog.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: grading_scales (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE grading_scales IS 'Rangos numéricos (nota mínima y máxima) que mapean las calificaciones del colegio a la Escala de Valoración Nacional (Bajo, Básico, Alto, Superior).';
COMMENT ON COLUMN grading_scales.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN grading_scales.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN grading_scales.grade_group_id IS 'Identificador de la agrupación o ciclo de grados (referencia a grade_groups).';
COMMENT ON COLUMN grading_scales.national_scale_id IS 'Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior).';
COMMENT ON COLUMN grading_scales.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN grading_scales.min_score IS 'Valor mínimo del rango numérico en la escala de valoración institucional.';
COMMENT ON COLUMN grading_scales.max_score IS 'Valor máximo del rango numérico en la escala de valoración institucional.';
COMMENT ON COLUMN grading_scales.rank_order IS 'Orden jerárquico del desempeño dentro de la escala de valoración.';

-- Tabla: health_providers (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE health_providers IS 'Catálogo nacional de Entidades Promotoras de Salud (EPS) y aseguradoras médicas.';
COMMENT ON COLUMN health_providers.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN health_providers.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN health_providers.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN health_providers.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: hierarchy_levels (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE hierarchy_levels IS 'Catálogo de niveles jerárquicos de empleos públicos (Directivo, Asesor, Profesional, Técnico, Asistencial).';
COMMENT ON COLUMN hierarchy_levels.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN hierarchy_levels.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: indigenous_reserves (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE indigenous_reserves IS 'Catálogo oficial DANE/SIMAT de resguardos indígenas reconocidos en el territorio nacional.';
COMMENT ON COLUMN indigenous_reserves.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN indigenous_reserves.dane_code IS 'Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede.';
COMMENT ON COLUMN indigenous_reserves.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: institution_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE institution_types IS 'Catálogo de tipos de establecimiento educativo (Institución Educativa, Centro Educativo).';
COMMENT ON COLUMN institution_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN institution_types.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: institutional_novelty_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE institutional_novelty_types IS 'Catálogo de tipos de novedades institucionales reportables ante la Secretaría de Educación.';
COMMENT ON COLUMN institutional_novelty_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN institutional_novelty_types.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: languages (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE languages IS 'Catálogo de idiomas oficiales y lenguas nativas reconocidos por el Ministerio de Educación Nacional.';
COMMENT ON COLUMN languages.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN languages.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: legal_ownership_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE legal_ownership_types IS 'Catálogo de tipos de propiedad jurídica de establecimientos educativos según clasificación DANE.';
COMMENT ON COLUMN legal_ownership_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN legal_ownership_types.sector_id IS 'Identificador del sector educativo Oficial o Privado (referencia a school_sectors).';
COMMENT ON COLUMN legal_ownership_types.code IS 'Código alfanumérico corto estandarizado del registro.';
COMMENT ON COLUMN legal_ownership_types.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: lesson_plan_units (Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica)
COMMENT ON TABLE lesson_plan_units IS 'Unidades temáticas, actividades pedagógicas y estrategias de evaluación detalladas dentro de un planeador docente.';
COMMENT ON COLUMN lesson_plan_units.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN lesson_plan_units.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN lesson_plan_units.lesson_plan_id IS 'Identificador del planeador docente padre (referencia a lesson_plans).';
COMMENT ON COLUMN lesson_plan_units.unit_number IS 'Número secuencial de la unidad temática dentro del planeador.';
COMMENT ON COLUMN lesson_plan_units.topic_title IS 'Título del eje temático o unidad de aprendizaje.';
COMMENT ON COLUMN lesson_plan_units.content_description IS 'Descripción de los contenidos temáticos a desarrollar en la unidad.';
COMMENT ON COLUMN lesson_plan_units.pedagogical_activities IS 'Actividades pedagógicas y didácticas planeadas para el desarrollo de la unidad.';
COMMENT ON COLUMN lesson_plan_units.evaluation_strategy IS 'Estrategias e instrumentos de evaluación formativa y sumativa de la unidad.';
COMMENT ON COLUMN lesson_plan_units.planned_hours IS 'Cantidad de horas de clase estimadas para cubrir la unidad temática.';
COMMENT ON COLUMN lesson_plan_units.execution_date IS 'Fecha programada para la ejecución de la unidad temática.';

-- Tabla: lesson_plans (Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica)
COMMENT ON TABLE lesson_plans IS 'Planeadores de área y asignatura elaborados por los docentes por periodo académico.';
COMMENT ON COLUMN lesson_plans.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN lesson_plans.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN lesson_plans.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN lesson_plans.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN lesson_plans.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN lesson_plans.title IS 'Título principal de la actividad, evaluación, documento o circular.';
COMMENT ON COLUMN lesson_plans.general_objective IS 'Objetivo general de aprendizaje formulado en el planeador del periodo.';
COMMENT ON COLUMN lesson_plans.methodology_notes IS 'Descripción de la metodología didáctica general del planeador.';
COMMENT ON COLUMN lesson_plans.bibliography IS 'Fuentes bibliográficas y recursos digitales de apoyo del planeador.';
COMMENT ON COLUMN lesson_plans.observations IS 'Observaciones adicionales o notas aclaratorias del registro.';
COMMENT ON COLUMN lesson_plans.status IS 'Estado operativo actual del registro dentro de su flujo de ciclo de vida.';
COMMENT ON COLUMN lesson_plans.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: live_class_attendances (Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea)
COMMENT ON TABLE live_class_attendances IS 'Registro automático de asistencia y conexión de estudiantes a las clases virtuales en vivo.';
COMMENT ON COLUMN live_class_attendances.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN live_class_attendances.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN live_class_attendances.live_class_id IS 'Identificador de la sesión de clase en vivo (referencia a live_classes).';
COMMENT ON COLUMN live_class_attendances.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN live_class_attendances.joined_at IS 'Fecha y hora en que el usuario fue vinculado a la conversación o clase en vivo.';

-- Tabla: live_classes (Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea)
COMMENT ON TABLE live_classes IS 'Sesiones de clases sincrónicas en vivo programadas por asignatura con enlace de videoconferencia.';
COMMENT ON COLUMN live_classes.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN live_classes.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN live_classes.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN live_classes.title IS 'Título principal de la actividad, evaluación, documento o circular.';
COMMENT ON COLUMN live_classes.meeting_url IS 'URL de conexión a la sala de videoconferencia de la clase en vivo.';
COMMENT ON COLUMN live_classes.scheduled_start IS 'Fecha y hora programada de inicio de la clase sincrónica en vivo.';
COMMENT ON COLUMN live_classes.scheduled_end IS 'Fecha y hora programada de finalización de la clase en vivo.';
COMMENT ON COLUMN live_classes.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN live_classes.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: national_grading_scales (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE national_grading_scales IS 'Catálogo de la Escala de Valoración Nacional (Decreto 1290: Desempeño Superior, Alto, Básico y Bajo).';
COMMENT ON COLUMN national_grading_scales.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN national_grading_scales.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN national_grading_scales.abbreviation IS 'Abreviatura o sigla corta para visualización en boletines y planillas.';
COMMENT ON COLUMN national_grading_scales.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN national_grading_scales.report_message IS 'Mensaje institucional predeterminado asociado al nivel de desempeño en el boletín.';
COMMENT ON COLUMN national_grading_scales.hex_color IS 'Color hexadecimal (ej. #10B981) para representar visualmente el nivel de desempeño.';
COMMENT ON COLUMN national_grading_scales.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: observer_annotations (Dominio 8: Observador del Estudiante y Convivencia Escolar)
COMMENT ON TABLE observer_annotations IS 'Anotaciones periódicas de seguimiento académico y de convivencia escolar (situaciones Tipo I, II o III, descargos del estudiante y compromisos pedagógicos).';
COMMENT ON COLUMN observer_annotations.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN observer_annotations.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN observer_annotations.student_observer_id IS 'Identificador de la ficha anual del Observador del Estudiante (referencia a student_observers).';
COMMENT ON COLUMN observer_annotations.section_id IS 'Identificador de la sección de la plantilla del observador (referencia a observer_template_sections).';
COMMENT ON COLUMN observer_annotations.created_by_user_id IS 'Identificador del usuario que creó originalmente el registro.';
COMMENT ON COLUMN observer_annotations.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN observer_annotations.annotation_type IS 'Tipo de anotación registrada en el observador (ACADEMICA, CONVIVENCIA, FELICITACION, ORIENTACION).';
COMMENT ON COLUMN observer_annotations.severity_level IS 'Clasificación de la situación según Ley 1620 de Convivencia Escolar (LEVE, TIPO_I, TIPO_II, TIPO_III).';
COMMENT ON COLUMN observer_annotations.situation_description IS 'Descripción objetiva de los hechos o situación académica/convivencial registrada.';
COMMENT ON COLUMN observer_annotations.student_version IS 'Versión libre o descargos presentados por el estudiante frente a la situación.';
COMMENT ON COLUMN observer_annotations.pedagogical_commitment IS 'Compromiso pedagógico o formativo acordado por el estudiante y su acudiente.';
COMMENT ON COLUMN observer_annotations.guardian_notified IS 'Indica si el padre de familia o acudiente fue notificado de la anotación.';
COMMENT ON COLUMN observer_annotations.annotation_date IS 'Fecha en que ocurrió la situación registrada en el observador.';
COMMENT ON COLUMN observer_annotations.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: observer_criteria (Dominio 8: Observador del Estudiante y Convivencia Escolar)
COMMENT ON TABLE observer_criteria IS 'Criterios e ítems de valoración definidos dentro de cada sección del Observador del Estudiante.';
COMMENT ON COLUMN observer_criteria.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN observer_criteria.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN observer_criteria.section_id IS 'Identificador de la sección de la plantilla del observador (referencia a observer_template_sections).';
COMMENT ON COLUMN observer_criteria.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN observer_criteria.display_order IS 'Orden numérico secuencial de presentación en interfaces, certificados y boletines.';
COMMENT ON COLUMN observer_criteria.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: observer_template_sections (Dominio 8: Observador del Estudiante y Convivencia Escolar)
COMMENT ON TABLE observer_template_sections IS 'Secciones o capítulos dentro de una plantilla del Observador del Estudiante (Académico, Convivencia, Orientación).';
COMMENT ON COLUMN observer_template_sections.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN observer_template_sections.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN observer_template_sections.template_id IS 'Identificador de la plantilla del observador utilizada (referencia a observer_templates).';
COMMENT ON COLUMN observer_template_sections.title IS 'Título principal de la actividad, evaluación, documento o circular.';
COMMENT ON COLUMN observer_template_sections.is_coexistence_section IS 'Indica si la sección corresponde a seguimiento de convivencia escolar (Ley 1620).';
COMMENT ON COLUMN observer_template_sections.display_order IS 'Orden numérico secuencial de presentación en interfaces, certificados y boletines.';
COMMENT ON COLUMN observer_template_sections.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: observer_templates (Dominio 8: Observador del Estudiante y Convivencia Escolar)
COMMENT ON TABLE observer_templates IS 'Modelos y formatos parametrizables del Observador del Estudiante por institución educativa.';
COMMENT ON COLUMN observer_templates.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN observer_templates.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN observer_templates.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN observer_templates.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN observer_templates.header_config IS 'Configuración JSONB del encabezado de impresión del formato de observador.';
COMMENT ON COLUMN observer_templates.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: online_evaluation_attempts (Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea)
COMMENT ON TABLE online_evaluation_attempts IS 'Intentos de presentación de evaluaciones en línea por estudiante con respuestas en JSONB y calificación obtenida.';
COMMENT ON COLUMN online_evaluation_attempts.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN online_evaluation_attempts.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN online_evaluation_attempts.online_evaluation_id IS 'Identificador de la evaluación en línea (referencia a online_evaluations).';
COMMENT ON COLUMN online_evaluation_attempts.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN online_evaluation_attempts.attempt_number IS 'Número secuencial del intento realizado por el estudiante (1, 2, ...).';
COMMENT ON COLUMN online_evaluation_attempts.total_score IS 'Puntaje o calificación total obtenida en el intento de evaluación.';
COMMENT ON COLUMN online_evaluation_attempts.answers_payload IS 'Estructura JSONB con las respuestas seleccionadas o redactadas por el estudiante en el intento.';
COMMENT ON COLUMN online_evaluation_attempts.started_at IS 'Fecha y hora de inicio de la sesión o intento de evaluación.';
COMMENT ON COLUMN online_evaluation_attempts.submitted_at IS 'Fecha y hora exacta en que el estudiante entregó la actividad o evaluación.';

-- Tabla: online_evaluation_options (Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea)
COMMENT ON TABLE online_evaluation_options IS 'Opciones de respuesta para preguntas de selección múltiple o falso/verdadero indicando la opción correcta.';
COMMENT ON COLUMN online_evaluation_options.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN online_evaluation_options.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN online_evaluation_options.question_id IS 'Identificador de la pregunta de evaluación en línea (referencia a online_evaluation_questions).';
COMMENT ON COLUMN online_evaluation_options.option_label IS 'Letra o etiqueta de la opción de respuesta (A, B, C, D).';
COMMENT ON COLUMN online_evaluation_options.option_text IS 'Texto completo de la opción de respuesta.';
COMMENT ON COLUMN online_evaluation_options.is_correct IS 'Indica si esta opción constituye una respuesta correcta de la pregunta.';

-- Tabla: online_evaluation_questions (Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea)
COMMENT ON TABLE online_evaluation_questions IS 'Preguntas pertenecientes a una evaluación en línea con su puntaje e imagen opcional.';
COMMENT ON COLUMN online_evaluation_questions.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN online_evaluation_questions.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN online_evaluation_questions.online_evaluation_id IS 'Identificador de la evaluación en línea (referencia a online_evaluations).';
COMMENT ON COLUMN online_evaluation_questions.question_type_id IS 'Identificador del tipo de pregunta (referencia a evaluation_question_types).';
COMMENT ON COLUMN online_evaluation_questions.question_text IS 'Enunciado completo de la pregunta de evaluación.';
COMMENT ON COLUMN online_evaluation_questions.image_url IS 'URL de la imagen o gráfico de apoyo asociado al enunciado de la pregunta.';
COMMENT ON COLUMN online_evaluation_questions.points IS 'Puntaje o valor ponderado que otorga la pregunta al total del examen.';
COMMENT ON COLUMN online_evaluation_questions.display_order IS 'Orden numérico secuencial de presentación en interfaces, certificados y boletines.';

-- Tabla: online_evaluations (Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea)
COMMENT ON TABLE online_evaluations IS 'Exámenes y quices en línea configurados con tiempo límite, número de intentos y ventana de disponibilidad.';
COMMENT ON COLUMN online_evaluations.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN online_evaluations.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN online_evaluations.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN online_evaluations.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN online_evaluations.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN online_evaluations.evaluation_type IS 'Tipo de prueba en línea (EXAM, QUIZ, DIAGNOSTIC, RECOVERY).';
COMMENT ON COLUMN online_evaluations.title IS 'Título principal de la actividad, evaluación, documento o circular.';
COMMENT ON COLUMN online_evaluations.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN online_evaluations.duration_minutes IS 'Tiempo máximo permitido en minutos para resolver la evaluación en línea.';
COMMENT ON COLUMN online_evaluations.max_attempts IS 'Cantidad máxima de intentos permitidos por estudiante para presentar la prueba.';
COMMENT ON COLUMN online_evaluations.available_from IS 'Fecha y hora a partir de la cual se habilita la presentación de la evaluación.';
COMMENT ON COLUMN online_evaluations.available_until IS 'Fecha y hora límite hasta la cual está disponible la evaluación en línea.';
COMMENT ON COLUMN online_evaluations.is_published IS 'Indica si la actividad o evaluación ya está visible para los estudiantes.';
COMMENT ON COLUMN online_evaluations.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: period_recovery_records (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE period_recovery_records IS 'Actas de nivelación, superación y recuperación periódica o final presentadas por los estudiantes.';
COMMENT ON COLUMN period_recovery_records.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN period_recovery_records.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN period_recovery_records.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN period_recovery_records.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN period_recovery_records.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN period_recovery_records.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN period_recovery_records.act_number IS 'Número consecutivo del acta oficial de nivelación o de promoción/graduación.';
COMMENT ON COLUMN period_recovery_records.previous_score IS 'Calificación anterior antes de aplicar la modificación o nivelación.';
COMMENT ON COLUMN period_recovery_records.recovery_score IS 'Calificación obtenida en el proceso de nivelación o superación académica.';
COMMENT ON COLUMN period_recovery_records.recovery_type IS 'Tipo de nivelación realizada (PERIODICA, FINAL_ANUAL, EXTRAORDINARIA).';
COMMENT ON COLUMN period_recovery_records.recovery_date IS 'Fecha en que se llevó a cabo la prueba o sustentación de nivelación.';
COMMENT ON COLUMN period_recovery_records.observations IS 'Observaciones adicionales o notas aclaratorias del registro.';

-- Tabla: private_associations (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE private_associations IS 'Catálogo de asociaciones de colegios privados reconocidas a nivel nacional.';
COMMENT ON COLUMN private_associations.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN private_associations.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: promotion_records (Dominio 6: Matrículas SIMAT, Novedades y Promoción Escolar)
COMMENT ON TABLE promotion_records IS 'Acta consolidada de promoción final y graduación del estudiante al cierre del año lectivo (promedio final, áreas perdidas, puesto, diploma y folio de grado).';
COMMENT ON COLUMN promotion_records.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN promotion_records.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN promotion_records.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN promotion_records.promotion_status_id IS 'Identificador del estado de promoción final (referencia a promotion_statuses_catalog).';
COMMENT ON COLUMN promotion_records.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN promotion_records.act_number IS 'Número consecutivo del acta oficial de nivelación o de promoción/graduación.';
COMMENT ON COLUMN promotion_records.final_average IS 'Promedio numérico general obtenido por el estudiante al finalizar el año lectivo.';
COMMENT ON COLUMN promotion_records.failed_areas_count IS 'Cantidad total de áreas curriculares reprobadas al cierre del año escolar.';
COMMENT ON COLUMN promotion_records.failed_subjects_count IS 'Cantidad total de asignaturas reprobadas en el periodo o año lectivo.';
COMMENT ON COLUMN promotion_records.total_absences IS 'Sumatoria total de inasistencias acumuladas durante el año lectivo.';
COMMENT ON COLUMN promotion_records.group_rank IS 'Puesto ocupado por el estudiante dentro de su grupo académico según su promedio.';
COMMENT ON COLUMN promotion_records.is_graduated IS 'Indica si el estudiante obtuvo título de graduación en cierre de ciclo.';
COMMENT ON COLUMN promotion_records.diploma_number IS 'Número de registro del diploma de bachiller o certificado de grado.';
COMMENT ON COLUMN promotion_records.graduation_folio IS 'Número de folio del libro oficial de actas de grado donde quedó registrado.';
COMMENT ON COLUMN promotion_records.observations IS 'Observaciones adicionales o notas aclaratorias del registro.';
COMMENT ON COLUMN promotion_records.promoted_at IS 'Fecha oficial en que se asentó la decisión de promoción escolar.';

-- Tabla: promotion_statuses_catalog (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE promotion_statuses_catalog IS 'Catálogo oficial de estados finales de promoción académica al cierre del año lectivo (Promovido, No Promovido, Pendiente de Nivelación).';
COMMENT ON COLUMN promotion_statuses_catalog.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN promotion_statuses_catalog.status_code IS 'Código numérico interno del estado de promoción según reglas de negocio.';
COMMENT ON COLUMN promotion_statuses_catalog.grade_group_id IS 'Identificador de la agrupación o ciclo de grados (referencia a grade_groups).';
COMMENT ON COLUMN promotion_statuses_catalog.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN promotion_statuses_catalog.is_manual_promotion IS 'Indica si el estado de promoción puede ser asignado manualmente por comisión de evaluación.';

-- Tabla: school_elections (Dominio 10: Gobierno Escolar y Votaciones Electrónicas)
COMMENT ON TABLE school_elections IS 'Jornadas electorales de Gobierno Escolar por año lectivo (unifica las tablas duplicadas tp_elecciones/tp_elections).';
COMMENT ON COLUMN school_elections.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN school_elections.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN school_elections.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN school_elections.election_name IS 'Nombre oficial de la jornada electoral de Gobierno Escolar.';
COMMENT ON COLUMN school_elections.election_date IS 'Fecha calendario programada para las votaciones estudiantiles.';
COMMENT ON COLUMN school_elections.start_time IS 'Hora de apertura de las urnas electrónicas.';
COMMENT ON COLUMN school_elections.end_time IS 'Hora de cierre de las urnas electrónicas.';
COMMENT ON COLUMN school_elections.allows_blank_vote IS 'Indica si la elección habilita la casilla de Voto en Blanco en los tarjetones.';
COMMENT ON COLUMN school_elections.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: school_modules (Dominio 2: Multi-Tenancy (Colegios), IAM, Sesiones, Almacenamiento S3 y Auditoría)
COMMENT ON TABLE school_modules IS 'Módulos del sistema habilitados por suscripción para cada institución educativa (protegida por RLS).';
COMMENT ON COLUMN school_modules.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN school_modules.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN school_modules.system_module_id IS 'Identificador del módulo funcional del sistema (referencia a system_modules).';
COMMENT ON COLUMN school_modules.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN school_modules.status IS 'Estado operativo actual del registro dentro de su flujo de ciclo de vida.';
COMMENT ON COLUMN school_modules.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN school_modules.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: school_sectors (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE school_sectors IS 'Catálogo de sectores educativos (Oficial / Público, No Oficial / Privado).';
COMMENT ON COLUMN school_sectors.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN school_sectors.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: school_shifts (Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE))
COMMENT ON TABLE school_shifts IS 'Jornadas académicas configuradas y activas dentro de una institución educativa.';
COMMENT ON COLUMN school_shifts.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN school_shifts.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN school_shifts.catalog_shift_id IS 'Referencia a la jornada equivalente en el catálogo nacional (school_shifts_catalog).';
COMMENT ON COLUMN school_shifts.shift_code IS 'Código numérico SIMAT de la jornada escolar (1=Completa, 2=Mañana, 3=Tarde, 4=Nocturna, 5=Fin de Semana, 6=Única).';
COMMENT ON COLUMN school_shifts.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN school_shifts.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: school_shifts_catalog (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE school_shifts_catalog IS 'Catálogo base MEN de jornadas escolares (Completa, Mañana, Tarde, Nocturna, Fin de Semana, Única).';
COMMENT ON COLUMN school_shifts_catalog.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN school_shifts_catalog.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN school_shifts_catalog.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: schools (Dominio 2: Multi-Tenancy (Colegios), IAM, Sesiones, Almacenamiento S3 y Auditoría)
COMMENT ON TABLE schools IS 'Tabla maestra de Instituciones Educativas (Tenants) en la arquitectura Single-DB Multi-Tenant. Define el código DANE, carpeta física en AWS S3 (storage_folder) y configuración general del colegio.';
COMMENT ON COLUMN schools.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN schools.public_uuid IS 'Identificador público UUID v4 de la institución educativa para integraciones externas.';
COMMENT ON COLUMN schools.country_id IS 'Identificador del país en el catálogo ISO (referencia a countries).';
COMMENT ON COLUMN schools.city_id IS 'Identificador del municipio o ciudad DANE (referencia a cities).';
COMMENT ON COLUMN schools.calendar_id IS 'Identificador del calendario académico A o B (referencia a academic_calendars).';
COMMENT ON COLUMN schools.sector_id IS 'Identificador del sector educativo Oficial o Privado (referencia a school_sectors).';
COMMENT ON COLUMN schools.institution_type_id IS 'Identificador del tipo de institución educativa (referencia a institution_types).';
COMMENT ON COLUMN schools.dane_code IS 'Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede.';
COMMENT ON COLUMN schools.tax_id IS 'Número de Identificación Tributaria (NIT) con dígito de verificación de la institución educativa.';
COMMENT ON COLUMN schools.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN schools.short_name IS 'Nombre corto o sigla resumida de la institución educativa.';
COMMENT ON COLUMN schools.resolution_text IS 'Texto legal de la resolución de aprobación de estudios expedida por la Secretaría de Educación.';
COMMENT ON COLUMN schools.header_line_1 IS 'Primera línea de encabezado institucional para boletines, constancias y reportes Jasper.';
COMMENT ON COLUMN schools.header_line_2 IS 'Segunda línea de encabezado institucional (lema, DANE o NIT) para reportes oficiales.';
COMMENT ON COLUMN schools.footer_text IS 'Texto de pie de página institucional para documentos y certificados oficiales.';
COMMENT ON COLUMN schools.director_name IS 'Nombre completo del Rector(a) o Director(a) Rural en ejercicio.';
COMMENT ON COLUMN schools.director_document IS 'Número y lugar de expedición del documento de identidad del Rector(a).';
COMMENT ON COLUMN schools.director_signature_url IS 'Ruta en AWS S3 de la imagen de la firma digitalizada del Rector(a) para reportes.';
COMMENT ON COLUMN schools.secretary_name IS 'Nombre completo del Secretario(a) Académico(a) o Auxiliar Administrativo.';
COMMENT ON COLUMN schools.secretary_document IS 'Documento de identidad del Secretario(a) Académico(a) para firma de certificados.';
COMMENT ON COLUMN schools.secretary_signature_url IS 'Ruta en AWS S3 de la firma digitalizada del Secretario(a) Académico(a).';
COMMENT ON COLUMN schools.address IS 'Dirección física de residencia o ubicación.';
COMMENT ON COLUMN schools.suburb IS 'Barrio, vereda o corregimiento de ubicación.';
COMMENT ON COLUMN schools.phones IS 'Números telefónicos de contacto institucional.';
COMMENT ON COLUMN schools.email IS 'Dirección de correo electrónico de contacto o notificación.';
COMMENT ON COLUMN schools.website IS 'Dirección del sitio web oficial de la institución educativa.';
COMMENT ON COLUMN schools.logo_url IS 'Ruta en AWS S3 del logotipo institucional del colegio.';
COMMENT ON COLUMN schools.shield_url IS 'Ruta en AWS S3 del escudo oficial de la institución educativa para boletines Jasper.';
COMMENT ON COLUMN schools.storage_folder IS 'Nombre único del directorio raíz asignado al colegio dentro del bucket de AWS S3 (ej. pto_beato, asaie_exodo).';
COMMENT ON COLUMN schools.subscription_lock_date IS 'Fecha de vencimiento de la suscripción comercial SaaS del colegio.';
COMMENT ON COLUMN schools.settings IS 'Objeto JSONB con parámetros adicionales de personalización de la institución educativa.';
COMMENT ON COLUMN schools.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN schools.legacy_db_name IS 'Nombre de la base de datos MySQL original del colegio (usado para trazabilidad y futura migración ETL).';
COMMENT ON COLUMN schools.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN schools.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: staff_appointment_types (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE staff_appointment_types IS 'Catálogo de tipos de vinculación laboral (Propiedad, Período de Prueba, Provisional Vacante Definitiva/Temporal, Planta Temporal).';
COMMENT ON COLUMN staff_appointment_types.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN staff_appointment_types.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: staff_categories (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE staff_categories IS 'Catálogo de categorías de planta de personal (Docente / Directivo Docente, Administrativo).';
COMMENT ON COLUMN staff_categories.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN staff_categories.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: staff_positions (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE staff_positions IS 'Catálogo de cargos institucionales (Rector, Coordinador, Docente de Aula, Orientador, Secretario, Bibliotecario).';
COMMENT ON COLUMN staff_positions.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN staff_positions.category_id IS 'Identificador de la categoría del ticket o cargo (referencia al catálogo respectivo).';
COMMENT ON COLUMN staff_positions.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: staff_ranks (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE staff_ranks IS 'Catálogo de rangos laborales del personal vinculado a la institución educativa.';
COMMENT ON COLUMN staff_ranks.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN staff_ranks.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: student_absences (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE student_absences IS 'Registro diario de inasistencias justificadas e injustificadas y retardos del estudiante por asignatura.';
COMMENT ON COLUMN student_absences.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN student_absences.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN student_absences.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN student_absences.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN student_absences.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN student_absences.absence_date IS 'Fecha calendario en que se presentó la inasistencia del estudiante.';
COMMENT ON COLUMN student_absences.hours_missed IS 'Cantidad de horas de clase no asistidas en la fecha registrada.';
COMMENT ON COLUMN student_absences.is_justified IS 'Indica si la inasistencia cuenta con soporte o excusa médica/familiar válida.';
COMMENT ON COLUMN student_absences.justification_notes IS 'Detalle de la excusa o soporte presentado para justificar la inasistencia.';
COMMENT ON COLUMN student_absences.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: student_digital_documents (Dominio 4: Comunidad Educativa (Docentes, Administrativos, Estudiantes y Familias))
COMMENT ON TABLE student_digital_documents IS 'Documentos digitalizados del expediente estudiantil vinculados a objetos en AWS S3 (cloud_files).';
COMMENT ON COLUMN student_digital_documents.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN student_digital_documents.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN student_digital_documents.student_profile_id IS 'Identificador del perfil socio-demográfico del estudiante (referencia a student_profiles).';
COMMENT ON COLUMN student_digital_documents.cloud_file_id IS 'Identificador del archivo almacenado en la tabla cloud_files (AWS S3).';
COMMENT ON COLUMN student_digital_documents.document_name IS 'Nombre descriptivo del documento digitalizado del estudiante (ej. Registro Civil, Carnet EPS).';
COMMENT ON COLUMN student_digital_documents.mime_type IS 'Tipo de contenido estándar MIME del archivo (ej. application/pdf, image/png).';
COMMENT ON COLUMN student_digital_documents.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: student_enrollments (Dominio 6: Matrículas SIMAT, Novedades y Promoción Escolar)
COMMENT ON TABLE student_enrollments IS 'Matrícula académica anual del estudiante en una sede, jornada, grado y grupo, incluyendo número de matrícula, folio, estado SIMAT y condición de repitencia.';
COMMENT ON COLUMN student_enrollments.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN student_enrollments.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN student_enrollments.student_profile_id IS 'Identificador del perfil socio-demográfico del estudiante (referencia a student_profiles).';
COMMENT ON COLUMN student_enrollments.campus_id IS 'Identificador de la sede física de la institución educativa (referencia a campuses).';
COMMENT ON COLUMN student_enrollments.shift_id IS 'Identificador de la jornada escolar de la institución (referencia a school_shifts).';
COMMENT ON COLUMN student_enrollments.grade_id IS 'Identificador del grado académico de la institución (referencia a grades).';
COMMENT ON COLUMN student_enrollments.academic_group_id IS 'Identificador del grupo o salón de clases activo (referencia a academic_groups).';
COMMENT ON COLUMN student_enrollments.study_methodology_id IS 'Identificador de la metodología educativa SIMAT aplicada (referencia a study_methodologies).';
COMMENT ON COLUMN student_enrollments.character_id IS 'Identificador del carácter de educación media (Académico o Técnico).';
COMMENT ON COLUMN student_enrollments.specialty_id IS 'Identificador de la especialidad académica o técnica de la matrícula (referencia a academic_specialties).';
COMMENT ON COLUMN student_enrollments.enrollment_status_id IS 'Identificador del estado de matrícula SIMAT (referencia a enrollment_statuses).';
COMMENT ON COLUMN student_enrollments.promotion_status_id IS 'Identificador del estado de promoción final (referencia a promotion_statuses_catalog).';
COMMENT ON COLUMN student_enrollments.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN student_enrollments.registration_number IS 'Número oficial de matrícula o código de inscripción asignado al estudiante.';
COMMENT ON COLUMN student_enrollments.folio_number IS 'Número de folio del libro oficial de matrículas donde reposa el registro.';
COMMENT ON COLUMN student_enrollments.enrollment_date IS 'Fecha oficial en que se formalizó la matrícula del estudiante para el año lectivo.';
COMMENT ON COLUMN student_enrollments.withdrawal_date IS 'Fecha de retiro o cancelación de matrícula cuando el estudiante deja la institución.';
COMMENT ON COLUMN student_enrollments.is_repeating_grade IS 'Indica si el estudiante se encuentra repitiendo el grado actual.';
COMMENT ON COLUMN student_enrollments.is_new_student IS 'Indica si el estudiante ingresa por primera vez a la institución educativa.';
COMMENT ON COLUMN student_enrollments.is_subsidized IS 'Indica si el cupo escolar del estudiante es financiado o subsidiado por el Estado.';
COMMENT ON COLUMN student_enrollments.previous_school_name IS 'Nombre del establecimiento educativo de procedencia del estudiante.';
COMMENT ON COLUMN student_enrollments.observations IS 'Observaciones adicionales o notas aclaratorias del registro.';
COMMENT ON COLUMN student_enrollments.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN student_enrollments.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: student_family_links (Dominio 4: Comunidad Educativa (Docentes, Administrativos, Estudiantes y Familias))
COMMENT ON TABLE student_family_links IS 'Tabla asociativa normalizada (3NF) que vincula a cada estudiante con sus padres y acudientes indicando quién es el acudiente principal y el responsable financiero.';
COMMENT ON COLUMN student_family_links.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN student_family_links.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN student_family_links.student_profile_id IS 'Identificador del perfil socio-demográfico del estudiante (referencia a student_profiles).';
COMMENT ON COLUMN student_family_links.family_profile_id IS 'Identificador de la ficha del padre, madre o acudiente (referencia a family_profiles).';
COMMENT ON COLUMN student_family_links.relationship_type_id IS 'Identificador del parentesco familiar respecto al estudiante (referencia a family_relationship_types).';
COMMENT ON COLUMN student_family_links.member_type_id IS 'Identificador del tipo de miembro familiar (referencia a family_member_types).';
COMMENT ON COLUMN student_family_links.is_primary_guardian IS 'Indica si este familiar es el acudiente principal autorizado ante la institución.';
COMMENT ON COLUMN student_family_links.is_financial_responsible IS 'Indica si este familiar es el responsable económico y tributario del estudiante.';

-- Tabla: student_observers (Dominio 8: Observador del Estudiante y Convivencia Escolar)
COMMENT ON TABLE student_observers IS 'Ficha anual del Observador del Estudiante vinculada a su matrícula activa (fortalezas, dificultades y compromisos generales).';
COMMENT ON COLUMN student_observers.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN student_observers.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN student_observers.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN student_observers.template_id IS 'Identificador de la plantilla del observador utilizada (referencia a observer_templates).';
COMMENT ON COLUMN student_observers.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN student_observers.strengths IS 'Síntesis de fortalezas y potencialidades generales destacadas en el Observador del Estudiante.';
COMMENT ON COLUMN student_observers.difficulties IS 'Síntesis de aspectos por mejorar o dificultades registradas en el Observador del Estudiante.';
COMMENT ON COLUMN student_observers.commitments IS 'Compromisos generales asumidos por el estudiante y su familia durante el año escolar.';
COMMENT ON COLUMN student_observers.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: student_period_rankings (Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado))
COMMENT ON TABLE student_period_rankings IS 'Promedio académico, puesto en el grupo, puesto en el grado y cuadro de honor del estudiante por periodo.';
COMMENT ON COLUMN student_period_rankings.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN student_period_rankings.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN student_period_rankings.academic_year IS 'Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027).';
COMMENT ON COLUMN student_period_rankings.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN student_period_rankings.academic_group_id IS 'Identificador del grupo o salón de clases activo (referencia a academic_groups).';
COMMENT ON COLUMN student_period_rankings.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN student_period_rankings.average_score IS 'Promedio numérico ponderado de todas las asignaturas cursadas por el estudiante en el periodo.';
COMMENT ON COLUMN student_period_rankings.group_rank IS 'Puesto ocupado por el estudiante dentro de su grupo académico según su promedio.';
COMMENT ON COLUMN student_period_rankings.grade_rank IS 'Puesto ocupado por el estudiante entre todos los grupos de su mismo grado.';
COMMENT ON COLUMN student_period_rankings.failed_subjects_count IS 'Cantidad total de asignaturas reprobadas en el periodo o año lectivo.';
COMMENT ON COLUMN student_period_rankings.is_honor_roll IS 'Indica si el estudiante fue exaltado en el Cuadro de Honor del periodo.';

-- Tabla: student_profiles (Dominio 4: Comunidad Educativa (Docentes, Administrativos, Estudiantes y Familias))
COMMENT ON TABLE student_profiles IS 'Ficha socio-demográfica, médica y de caracterización SIMAT del estudiante (datos personales, EPS, etnia, discapacidad, capacidades excepcionales, víctima del conflicto).';
COMMENT ON COLUMN student_profiles.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN student_profiles.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN student_profiles.user_id IS 'Identificador del usuario global de la comunidad educativa en la tabla users.';
COMMENT ON COLUMN student_profiles.document_type_id IS 'Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types).';
COMMENT ON COLUMN student_profiles.document_number IS 'Número de documento de identidad de la persona sin puntos ni espacios.';
COMMENT ON COLUMN student_profiles.expedition_country_id IS 'País de expedición del documento de identidad (referencia a countries).';
COMMENT ON COLUMN student_profiles.expedition_department_id IS 'Departamento de expedición del documento de identidad (referencia a departments).';
COMMENT ON COLUMN student_profiles.expedition_city_id IS 'Municipio de expedición del documento de identidad (referencia a cities).';
COMMENT ON COLUMN student_profiles.first_name IS 'Primer nombre legal de la persona.';
COMMENT ON COLUMN student_profiles.middle_name IS 'Segundo nombre de la persona (opcional).';
COMMENT ON COLUMN student_profiles.last_name IS 'Primer apellido legal de la persona.';
COMMENT ON COLUMN student_profiles.second_last_name IS 'Segundo apellido de la persona (opcional).';
COMMENT ON COLUMN student_profiles.gender_id IS 'Identificador del género de la persona (referencia a genders).';
COMMENT ON COLUMN student_profiles.birth_date IS 'Fecha de nacimiento de la persona.';
COMMENT ON COLUMN student_profiles.birth_country_id IS 'País de nacimiento del estudiante (referencia a countries).';
COMMENT ON COLUMN student_profiles.birth_department_id IS 'Departamento de nacimiento del estudiante (referencia a departments).';
COMMENT ON COLUMN student_profiles.birth_city_id IS 'Municipio o ciudad de nacimiento del estudiante (referencia a cities).';
COMMENT ON COLUMN student_profiles.blood_type IS 'Grupo sanguíneo y factor RH del estudiante (ej. O+, A+, B-, AB+).';
COMMENT ON COLUMN student_profiles.address IS 'Dirección física de residencia o ubicación.';
COMMENT ON COLUMN student_profiles.suburb IS 'Barrio, vereda o corregimiento de ubicación.';
COMMENT ON COLUMN student_profiles.zone_id IS 'Identificador de la zona geográfica DANE (Urbana o Rural, referencia a geographical_zones).';
COMMENT ON COLUMN student_profiles.locality IS 'Localidad o comuna de residencia del estudiante.';
COMMENT ON COLUMN student_profiles.socioeconomic_stratum IS 'Estrato socioeconómico de la vivienda del estudiante (1 a 6).';
COMMENT ON COLUMN student_profiles.sisben_score IS 'Grupo o puntaje de clasificación en el SISBÉN (ej. A1, B4, C2).';
COMMENT ON COLUMN student_profiles.phone IS 'Número telefónico fijo o principal de contacto.';
COMMENT ON COLUMN student_profiles.email IS 'Dirección de correo electrónico de contacto o notificación.';
COMMENT ON COLUMN student_profiles.health_provider_id IS 'Identificador de la EPS a la que se encuentra afiliado el estudiante (referencia a health_providers).';
COMMENT ON COLUMN student_profiles.ips_name IS 'Nombre de la IPS primaria de atención médica asignada al estudiante.';
COMMENT ON COLUMN student_profiles.ars_name IS 'Nombre de la Administradora de Régimen Subsidiado (ARS) cuando aplica.';
COMMENT ON COLUMN student_profiles.ethnic_group_id IS 'Identificador de pertenencia étnica del estudiante (referencia a ethnic_groups).';
COMMENT ON COLUMN student_profiles.indigenous_reserve_id IS 'Identificador del resguardo indígena al que pertenece el estudiante (referencia a indigenous_reserves).';
COMMENT ON COLUMN student_profiles.disability_category_id IS 'Identificador de la categoría de discapacidad del estudiante (referencia a disability_categories).';
COMMENT ON COLUMN student_profiles.disability_type_id IS 'Identificador del tipo específico de discapacidad según SIMAT (referencia a disability_types).';
COMMENT ON COLUMN student_profiles.exceptional_capability_id IS 'Identificador de capacidad o talento excepcional según SIMAT (referencia a exceptional_capabilities).';
COMMENT ON COLUMN student_profiles.conflict_victim_type_id IS 'Identificador de condición de víctima del conflicto armado según SIMAT (referencia a conflict_victim_types).';
COMMENT ON COLUMN student_profiles.expulsion_department_id IS 'Departamento expulsor en caso de desplazamiento forzado (referencia a departments).';
COMMENT ON COLUMN student_profiles.expulsion_city_id IS 'Municipio expulsor en caso de desplazamiento forzado (referencia a cities).';
COMMENT ON COLUMN student_profiles.is_icbf_beneficiary IS 'Indica si el estudiante ha sido beneficiario de programas del ICBF.';
COMMENT ON COLUMN student_profiles.is_familias_en_accion IS 'Indica si el núcleo familiar es beneficiario del programa Más Familias en Acción / Renta Ciudadana.';
COMMENT ON COLUMN student_profiles.has_live_together_record IS 'Indica si el estudiante cuenta con ficha de caracterización sociofamiliar activa.';
COMMENT ON COLUMN student_profiles.photo_url IS 'URL de la fotografía del estudiante o candidato almacenada en S3.';
COMMENT ON COLUMN student_profiles.additional_info IS 'Objeto JSONB con atributos complementarios de salud, transporte escolar, PAE o inclusión (PIAR).';
COMMENT ON COLUMN student_profiles.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN student_profiles.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN student_profiles.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: study_methodologies (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE study_methodologies IS 'Catálogo oficial MEN de 23 metodologías y modelos educativos flexibles (Educación Tradicional, Escuela Nueva, Postprimaria, CAFAN, Aceleración).';
COMMENT ON COLUMN study_methodologies.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN study_methodologies.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: subjects (Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica)
COMMENT ON TABLE subjects IS 'Asignaturas académicas pertenecientes a un área curricular de la institución educativa.';
COMMENT ON COLUMN subjects.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN subjects.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN subjects.academic_area_id IS 'Identificador del área curricular institucional (referencia a academic_areas).';
COMMENT ON COLUMN subjects.bank_subject_id IS 'Referencia opcional a la asignatura estándar en el banco nacional (subjects_bank).';
COMMENT ON COLUMN subjects.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN subjects.abbreviation IS 'Abreviatura o sigla corta para visualización en boletines y planillas.';
COMMENT ON COLUMN subjects.is_elective IS 'Indica si la asignatura es de carácter optativo o profundización.';
COMMENT ON COLUMN subjects.display_order IS 'Orden numérico secuencial de presentación en interfaces, certificados y boletines.';
COMMENT ON COLUMN subjects.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN subjects.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: subjects_bank (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE subjects_bank IS 'Banco estándar de 52 asignaturas curriculares de referencia para la creación rápida de planes de estudio.';
COMMENT ON COLUMN subjects_bank.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN subjects_bank.name IS 'Nombre descriptivo oficial del registro.';
COMMENT ON COLUMN subjects_bank.abbreviation IS 'Abreviatura o sigla corta para visualización en boletines y planillas.';
COMMENT ON COLUMN subjects_bank.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: system_modules (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE system_modules IS 'Catálogo maestro de módulos funcionales licenciables dentro de la plataforma SaaS ASAIE ÉXODO V3.';
COMMENT ON COLUMN system_modules.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN system_modules.tag IS 'Clave técnica única en mayúsculas que identifica al módulo del sistema.';
COMMENT ON COLUMN system_modules.module_name IS 'Nombre comercial y funcional del módulo dentro de la plataforma.';
COMMENT ON COLUMN system_modules.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN system_modules.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: teacher_gradebook_columns (Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica)
COMMENT ON TABLE teacher_gradebook_columns IS 'Columnas de actividades evaluativas creadas por el docente en su planilla de calificaciones para cada dimensión y periodo.';
COMMENT ON COLUMN teacher_gradebook_columns.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN teacher_gradebook_columns.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN teacher_gradebook_columns.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN teacher_gradebook_columns.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN teacher_gradebook_columns.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN teacher_gradebook_columns.column_number IS 'Número secuencial de la columna dentro de la dimensión evaluativa.';
COMMENT ON COLUMN teacher_gradebook_columns.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN teacher_gradebook_columns.weight_percentage IS 'Porcentaje de ponderación (0.00 a 100.00) que aporta el elemento al cálculo definitivo.';
COMMENT ON COLUMN teacher_gradebook_columns.activity_date IS 'Fecha en que se realizó o evaluó la actividad registrada en la columna de planilla.';

-- Tabla: teacher_pay_scales (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE teacher_pay_scales IS 'Catálogo oficial de los 39 grados del Escalafón Nacional Docente (Decretos 2277 y 1278).';
COMMENT ON COLUMN teacher_pay_scales.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN teacher_pay_scales.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: teacher_profiles (Dominio 4: Comunidad Educativa (Docentes, Administrativos, Estudiantes y Familias))
COMMENT ON TABLE teacher_profiles IS 'Ficha profesional y laboral de los docentes de cada institución educativa (escalafón, título, área de enseñanza, firma digitalizada).';
COMMENT ON COLUMN teacher_profiles.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN teacher_profiles.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN teacher_profiles.user_id IS 'Identificador del usuario global de la comunidad educativa en la tabla users.';
COMMENT ON COLUMN teacher_profiles.document_type_id IS 'Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types).';
COMMENT ON COLUMN teacher_profiles.document_number IS 'Número de documento de identidad de la persona sin puntos ni espacios.';
COMMENT ON COLUMN teacher_profiles.first_name IS 'Primer nombre legal de la persona.';
COMMENT ON COLUMN teacher_profiles.middle_name IS 'Segundo nombre de la persona (opcional).';
COMMENT ON COLUMN teacher_profiles.last_name IS 'Primer apellido legal de la persona.';
COMMENT ON COLUMN teacher_profiles.second_last_name IS 'Segundo apellido de la persona (opcional).';
COMMENT ON COLUMN teacher_profiles.gender_id IS 'Identificador del género de la persona (referencia a genders).';
COMMENT ON COLUMN teacher_profiles.birth_date IS 'Fecha de nacimiento de la persona.';
COMMENT ON COLUMN teacher_profiles.address IS 'Dirección física de residencia o ubicación.';
COMMENT ON COLUMN teacher_profiles.phone IS 'Número telefónico fijo o principal de contacto.';
COMMENT ON COLUMN teacher_profiles.email IS 'Dirección de correo electrónico de contacto o notificación.';
COMMENT ON COLUMN teacher_profiles.academic_degree_id IS 'Identificador del último título académico alcanzado por el docente (referencia a academic_degrees_catalog).';
COMMENT ON COLUMN teacher_profiles.pay_scale_id IS 'Identificador del grado en el Escalafón Nacional Docente (referencia a teacher_pay_scales).';
COMMENT ON COLUMN teacher_profiles.teaching_area_id IS 'Identificador del área de enseñanza de nombramiento del docente (referencia a teaching_areas).';
COMMENT ON COLUMN teacher_profiles.technical_area_id IS 'Identificador del área técnica del docente (referencia a technical_areas).';
COMMENT ON COLUMN teacher_profiles.appointment_type_id IS 'Identificador del tipo de nombramiento o vinculación laboral (referencia a staff_appointment_types).';
COMMENT ON COLUMN teacher_profiles.position_id IS 'Identificador del cargo desempeñado por el funcionario (referencia a staff_positions).';
COMMENT ON COLUMN teacher_profiles.workplace_location_id IS 'Identificador de la ubicación laboral del funcionario (referencia a workplace_locations).';
COMMENT ON COLUMN teacher_profiles.signature_url IS 'Ruta en AWS S3 de la firma digitalizada del docente para boletines y observador.';
COMMENT ON COLUMN teacher_profiles.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN teacher_profiles.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: teaching_areas (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE teaching_areas IS 'Catálogo oficial MEN de 22 áreas de enseñanza y nombramiento docente.';
COMMENT ON COLUMN teaching_areas.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN teaching_areas.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: technical_areas (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE technical_areas IS 'Catálogo de áreas técnicas de formación vocacional y articulación SENA.';
COMMENT ON COLUMN technical_areas.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN technical_areas.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: user_profiles_catalog (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE user_profiles_catalog IS 'Catálogo de perfiles funcionales de seguridad y navegación para toda la comunidad educativa.';
COMMENT ON COLUMN user_profiles_catalog.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN user_profiles_catalog.profile_name IS 'Nombre del perfil de usuario (Administrador, Docente, Estudiante, Acudiente, Coordinador).';
COMMENT ON COLUMN user_profiles_catalog.profile_type IS 'Categoría técnica del perfil de seguridad.';
COMMENT ON COLUMN user_profiles_catalog.description IS 'Descripción detallada del registro o elemento.';
COMMENT ON COLUMN user_profiles_catalog.icon_class IS 'Clase de icono visual asociada al perfil en el selector de contexto.';
COMMENT ON COLUMN user_profiles_catalog.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: user_school_memberships (Dominio 2: Multi-Tenancy (Colegios), IAM, Sesiones, Almacenamiento S3 y Auditoría)
COMMENT ON TABLE user_school_memberships IS 'Membresías multi-colegio y multi-rol que vinculan a un usuario global (users) con uno o varios colegios (schools) y roles específicos (RECTOR, COORDINATOR, TEACHER, STUDENT, FAMILY, STAFF).';
COMMENT ON COLUMN user_school_memberships.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN user_school_memberships.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN user_school_memberships.user_id IS 'Identificador del usuario global de la comunidad educativa en la tabla users.';
COMMENT ON COLUMN user_school_memberships.role IS 'Rol institucional asignado al usuario en el colegio (RECTOR, COORDINATOR, TEACHER, STUDENT, FAMILY, STAFF).';
COMMENT ON COLUMN user_school_memberships.profile_id IS 'Referencia opcional al catálogo de perfiles visuales (user_profiles_catalog).';
COMMENT ON COLUMN user_school_memberships.is_default_school IS 'Indica si esta institución educativa es el colegio predeterminado al iniciar sesión.';
COMMENT ON COLUMN user_school_memberships.status IS 'Estado operativo actual del registro dentro de su flujo de ciclo de vida.';
COMMENT ON COLUMN user_school_memberships.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN user_school_memberships.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';
COMMENT ON COLUMN user_school_memberships.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';

-- Tabla: users (Dominio 2: Multi-Tenancy (Colegios), IAM, Sesiones, Almacenamiento S3 y Auditoría)
COMMENT ON TABLE users IS 'Identidad global única de personas de la comunidad educativa (Directivos, Administrativos, Docentes, Estudiantes y Padres/Acudientes) con credenciales scrypt y verificación de correo.';
COMMENT ON COLUMN users.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN users.document_type_id IS 'Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types).';
COMMENT ON COLUMN users.document_number IS 'Número de documento de identidad de la persona sin puntos ni espacios.';
COMMENT ON COLUMN users.email IS 'Dirección de correo electrónico de contacto o notificación.';
COMMENT ON COLUMN users.username IS 'Nombre de usuario único para autenticación en el portal educativo.';
COMMENT ON COLUMN users.password_hash IS 'Hash criptográfico seguro (scrypt + salt) de la contraseña del usuario.';
COMMENT ON COLUMN users.first_name IS 'Primer nombre legal de la persona.';
COMMENT ON COLUMN users.middle_name IS 'Segundo nombre de la persona (opcional).';
COMMENT ON COLUMN users.last_name IS 'Primer apellido legal de la persona.';
COMMENT ON COLUMN users.second_last_name IS 'Segundo apellido de la persona (opcional).';
COMMENT ON COLUMN users.gender_id IS 'Identificador del género de la persona (referencia a genders).';
COMMENT ON COLUMN users.birth_date IS 'Fecha de nacimiento de la persona.';
COMMENT ON COLUMN users.phone IS 'Número telefónico fijo o principal de contacto.';
COMMENT ON COLUMN users.avatar_url IS 'Ruta en AWS S3 de la fotografía de perfil o avatar del usuario.';
COMMENT ON COLUMN users.security_question IS 'Pregunta de seguridad opcional configurada por el usuario.';
COMMENT ON COLUMN users.security_answer_hash IS 'Hash criptográfico de la respuesta a la pregunta de seguridad.';
COMMENT ON COLUMN users.email_verified_at IS 'Fecha y hora en que el usuario confirmó su correo electrónico mediante token enviado por Nodemailer.';
COMMENT ON COLUMN users.is_active IS 'Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE).';
COMMENT ON COLUMN users.last_login_at IS 'Fecha y hora del último inicio de sesión exitoso del usuario.';
COMMENT ON COLUMN users.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';
COMMENT ON COLUMN users.updated_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro.';

-- Tabla: virtual_activities (Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea)
COMMENT ON TABLE virtual_activities IS 'Actividades pedagógicas, tareas y talleres publicados por el docente en el Aula Virtual.';
COMMENT ON COLUMN virtual_activities.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN virtual_activities.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN virtual_activities.course_assignment_id IS 'Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments).';
COMMENT ON COLUMN virtual_activities.dimension_id IS 'Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions).';
COMMENT ON COLUMN virtual_activities.period_number IS 'Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4).';
COMMENT ON COLUMN virtual_activities.title IS 'Título principal de la actividad, evaluación, documento o circular.';
COMMENT ON COLUMN virtual_activities.instructions IS 'Instrucciones pedagógicas detalladas para realizar la actividad virtual.';
COMMENT ON COLUMN virtual_activities.resource_url IS 'Enlace externo de apoyo (video, lectura o recurso educativo digital) de la actividad.';
COMMENT ON COLUMN virtual_activities.attachment_file_id IS 'Identificador del archivo adjunto almacenado en AWS S3 (referencia a cloud_files).';
COMMENT ON COLUMN virtual_activities.due_date IS 'Fecha y hora límite para la entrega de la actividad virtual por parte del estudiante.';
COMMENT ON COLUMN virtual_activities.is_published IS 'Indica si la actividad o evaluación ya está visible para los estudiantes.';
COMMENT ON COLUMN virtual_activities.created_at IS 'Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos.';

-- Tabla: virtual_activity_submissions (Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea)
COMMENT ON TABLE virtual_activity_submissions IS 'Entregas de actividades virtuales realizadas por los estudiantes con su archivo adjunto, calificación y retroalimentación docente.';
COMMENT ON COLUMN virtual_activity_submissions.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN virtual_activity_submissions.school_id IS 'Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS).';
COMMENT ON COLUMN virtual_activity_submissions.virtual_activity_id IS 'Identificador de la actividad virtual a la cual corresponde la entrega (referencia a virtual_activities).';
COMMENT ON COLUMN virtual_activity_submissions.enrollment_id IS 'Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments).';
COMMENT ON COLUMN virtual_activity_submissions.student_comment IS 'Comentario o mensaje escrito por el estudiante al enviar su tarea virtual.';
COMMENT ON COLUMN virtual_activity_submissions.attachment_file_id IS 'Identificador del archivo adjunto almacenado en AWS S3 (referencia a cloud_files).';
COMMENT ON COLUMN virtual_activity_submissions.score IS 'Valor numérico de la calificación obtenida.';
COMMENT ON COLUMN virtual_activity_submissions.teacher_feedback IS 'Retroalimentación formativa escrita por el docente al calificar la entrega virtual.';
COMMENT ON COLUMN virtual_activity_submissions.submitted_at IS 'Fecha y hora exacta en que el estudiante entregó la actividad o evaluación.';
COMMENT ON COLUMN virtual_activity_submissions.graded_at IS 'Fecha y hora en que el docente calificó la entrega de la actividad virtual.';

-- Tabla: work_time_allocations (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE work_time_allocations IS 'Catálogo de dedicación de tiempo laboral (Tiempo Completo, Medio Tiempo, Por Horas).';
COMMENT ON COLUMN work_time_allocations.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN work_time_allocations.name IS 'Nombre descriptivo oficial del registro.';

-- Tabla: workplace_locations (Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT))
COMMENT ON TABLE workplace_locations IS 'Catálogo de ubicaciones laborales del personal dentro de la estructura escolar.';
COMMENT ON COLUMN workplace_locations.id IS 'Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta).';
COMMENT ON COLUMN workplace_locations.name IS 'Nombre descriptivo oficial del registro.';

COMMIT;