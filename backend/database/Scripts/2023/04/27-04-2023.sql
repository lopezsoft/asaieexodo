CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_select_cursos_notas`(
	IN `_id_headquarters` INT(20),
	IN `_study_day` INT(11),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_year` YEAR
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
	SELECT tc.*,CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',
	RTRIM(td.nombre2)) AS docente, RTRIM(ta.asignatura) asignatura,ts.headquarters_name AS sede, tj.jornada, tg.grado
	FROM cursos AS tc
	LEFT JOIN docentes AS td ON td.id_docente=tc.id_docente
	LEFT JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
	LEFT JOIN aux_asignaturas AS au ON (au.id_asign = ta.id_pk AND au.year = _year)
	LEFT JOIN sedes AS ts ON ts.id=tc.id_sede
	LEFT JOIN jornadas AS tj ON tc.id_jorn = tj.cod_jorn
	LEFT JOIN grados As tg ON tc.id_grado=tg.id
	WHERE tc.id_grado =  _grade and tc.year =  _year AND
	tc.id_sede = _id_headquarters AND tc.grupo = _group AND
	tc.id_jorn = _study_day AND tc.estado = 1 AND au.year = _year
	ORDER BY tc.id_sede,tc.id_grado,tc.grupo,tc.id_jorn,docente,au.id_area,tc.id_asig;
END
