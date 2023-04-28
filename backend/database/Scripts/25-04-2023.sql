CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_electoral_certificate`(
	IN `p_year` YEAR,
	IN `p_grade_id` INT,
	IN `p_headquarter_id` INT
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
SELECT tm.*, CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',
RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS nombres,
RTRIM(tg.grado) AS grado, RTRIM(ts.headquarters_name) AS sede, ti.foto, ti.mime
FROM student_enrollment AS tm
LEFT JOIN inscripciones AS ti ON tm.id_student = ti.id
LEFT JOIN grados AS tg ON tm.id_grade = tg.id
LEFT JOIN sedes AS ts ON tm.id_headquarters = ts.id
WHERE tm.year = p_year AND tm.id_grade = p_grade_id AND tm.id_headquarters = p_headquarter_id
ORDER BY tm.id_grade, tm.id_group, nombres;
END
