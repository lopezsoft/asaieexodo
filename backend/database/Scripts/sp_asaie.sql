-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         10.3.23-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.4.0.6670
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Volcando estructura para procedimiento asaie_exodo.sp_abre_areas__asig
DROP PROCEDURE IF EXISTS `sp_abre_areas__asig`;
DELIMITER //
CREATE PROCEDURE `sp_abre_areas__asig`(
	IN `_year` YEAR,
	IN `_id_asig` INT(11),
	IN `_grade` INT(11),
	IN `_type` INT(1)
)
BEGIN
	CASE
		WHEN _type 	= 1 OR _type = 0 THEN /*Asignaturas Abrev*/
			SELECT RTRIM(ta.abrev) AS abrev FROM asignaturas AS ta WHERE ta.id_pk = _id_asig;
		WHEN _type	= 2 THEN	/*Asignaturas Porcentaje*/
			SELECT tm.porciento FROM matcurso AS tm
			JOIN asignaturas AS ta ON tm.id_asig = ta.id_pk
			WHERE ta.id_pk = _id_asig AND tm.id_asig = _id_asig AND tm.year = _year
			AND tm.id_grado = _grade;
		ELSE
			SELECT RTRIM(ta.abrev) AS abrev FROM areas AS ta WHERE ta.id = _id_asig;
	END CASE;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_acta_promo_estadistica
DROP PROCEDURE IF EXISTS `sp_acta_promo_estadistica`;
DELIMITER //
CREATE PROCEDURE `sp_acta_promo_estadistica`(
	IN `PYear` YEAR,
	IN `PType` INT
)
BEGIN
	IF PType = 1 THEN /*Por grado*/
		SELECT SQL_SMALL_RESULT COUNT(ta.msg) total, ta.msg,tg.cod_grado,tx.abrev_sexo sexo,
			RTRIM(tg.grado) grado, RTRIM(ts.headquarters_name) sede
			FROM acta_promocion AS ta
			JOIN student_enrollment AS tm ON ta.id_matric = tm.id
			JOIN inscripciones AS te ON tm.id_student = te.id
			JOIN sexo AS tx ON te.id_sexo = tx.id
			JOIN grados tg ON tm.id_grade = tg.id
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			WHERE tm.id_state = 2  AND tm.year = PYear
			GROUP BY ta.msg,tm.id_grade,tm.id_headquarters, te.id_sexo
			ORDER BY tm.id_headquarters,ta.estado,tm.id_grade,sexo;
	ELSE /*Por grado, grupo y jornada*/
		SELECT SQL_SMALL_RESULT COUNT(ta.msg) total, ta.msg,tg.cod_grado,tm.id_group grupo,
			tx.abrev_sexo sexo, RTRIM(tg.grado) grado, RTRIM(tj.jornada) jornada, RTRIM(ts.headquarters_name) sede
			FROM acta_promocion AS ta
			JOIN student_enrollment AS tm ON ta.id_matric = tm.id
			JOIN inscripciones AS te ON tm.id_student = te.id
			JOIN sexo AS tx ON te.id_sexo = tx.id
			JOIN grados tg ON tm.id_grade = tg.id
			JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			WHERE tm.id_state = 2  AND tm.year = PYear
			GROUP BY ta.msg, tm.id_grade, tm.id_group, tm.id_headquarters, tm.id_study_day,te.id_sexo
			ORDER BY tm.id_headquarters, ta.estado,tm.id_grade,sexo, tm.id_group;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_activity_courses_students
DROP PROCEDURE IF EXISTS `sp_activity_courses_students`;
DELIMITER //
CREATE PROCEDURE `sp_activity_courses_students`(
	IN `PCourse` INT,
	IN `PActivity` BIGINT
)
    COMMENT 'Lista de estudiantes por curso asignado a una evalucion'
BEGIN
	SELECT i.id, h.course_id, a.id_sede, a.id_grado, a.id_asig, a.id_docente, a.id_jorn, a.grupo,
	b.asignatura, c.cod_grado, c.grado, trim(d.jornada) AS jornada, TRIM(e.headquarters_name) sede,
	CONCAT(TRIM(g.apellido1),' ',TRIM(g.apellido2),' ',TRIM(g.nombre1),' ',TRIM(g.nombre2)) estudiante,
	h.activity_id, a.year
	FROM ta_courses_online_activities AS h
	JOIN cursos AS a ON h.course_id = a.id
	JOIN asignaturas AS b ON a.id_asig = b.id_pk
	JOIN grados AS c ON a.id_grado = c.id
	JOIN jornadas AS d ON a.id_jorn = d.cod_jorn
	JOIN sedes AS e ON a.id_sede = e.ID
	JOIN student_enrollment AS f  ON (f.id_headquarters = a.id_sede AND f.id_study_day = a.id_jorn AND
	f.id_grade = a.id_grado AND f.id_group = a.grupo AND f.year = a.year)
	JOIN inscripciones AS g ON f.id_student = g.id
	JOIN ta_shared_online_activities AS i ON (i.activity_id = h.id AND i.enrollment_id = f.id)
	WHERE h.activity_id = PActivity AND h.course_id = PCourse AND h.course_id = a.id
	AND a.estado = 1 AND f.id_state = 2
	ORDER BY estudiante;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_boletines_reportes
DROP PROCEDURE IF EXISTS `sp_boletines_reportes`;
DELIMITER //
CREATE PROCEDURE `sp_boletines_reportes`(
	IN `_id_head` INT(20),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_id_study_day` INT(1),
	IN `_year` YEAR,
	IN `_per` VARCHAR(2),
	IN `_enroll` INT(30)
)
BEGIN
	DECLARE cTable VARCHAR(30) DEFAULT '';
	CALL sp_puestos_generate(_grade, _group, _id_study_day, _id_head, _year, _per);
	SELECT fn_return_table_notas(_grade) INTO cTable;
	IF _enroll > 0 THEN
		SET  @sqlSelect = CONCAT("SELECT tn.id,tn.periodo, tn.id_curso ,  tn.id_matric,tn.id_escala,
				tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas,tn.retraso,tn.injustificadas,
				tpr.descripcion_periodo AS periodo_des,
				tcr.id_grado, tcr.grupo, tcr.year, tcr.id_jorn id_jorn, tcr.id_sede,
				tcr.id_asig, tcr.id_docente,
				CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
				RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante , te.nro_documento, RTRIM(tar.area) AS area, tar.abrev AS abre_area,
				tar.ordenar AS order_ar, RTRIM(tas.asignatura) AS asignatura, tas.abrev AS abrev_asig, tas.electiva,
				au.id_area, tas.ordenar AS order_as, CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',
				RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,RTRIM(ts.headquarters_name) AS sede, tj.jornada, tg.grado,
				RIGHT(CONCAT('0000',tm.folio),4) id_folio, RIGHT(CONCAT('000000',tm.registration_number),6) registration_number,
				tp.total, tp.puesto, tp.prom, tp.nota_max, tp.nota_min, RIGHT(CONCAT('0000',tm.book),4) book,
				tes.name_state, tm.id_state, tc.ih, ABS(tc.porciento) AS porciento,
				round(if(tn.nota_habilitacion > 0, (tn.nota_habilitacion*tc.porciento)/100, (tn.final*tc.porciento)/100),2) AS
				nota_p, tn.nivelacion, TRIM(es.nombre_escala) conceptual, tv.nombre_nivel
				FROM ",cTable," AS tn
				JOIN cursos AS tcr ON (tn.id_curso=tcr.id AND tn.year=tcr.`year`)
				JOIN grados As tg ON tcr.id_grado = tg.id
				JOIN periodos_academicos AS tpr ON (tn.periodo = tpr.periodo AND tn.year=tpr.`year`)
				JOIN grados_agrupados AS t1 ON tpr.id_grado_agrupado = t1.id
				JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
				JOIN asignaturas AS tas ON tcr.id_asig = tas.id_pk
				JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = tcr.year)
			   JOIN areas AS tar ON au.id_area=tar.id
				JOIN docentes AS td ON  tcr.id_docente = td.id_docente
				JOIN sedes AS ts ON tcr.id_sede = ts.id
			   JOIN jornadas AS tj ON tcr.id_jorn = tj.cod_jorn
				JOIN matcurso AS tc ON (tc.id_grado = tg.id AND tc.id_asig = tas.id_pk)
			   JOIN puestos AS tp ON tp.id_matric = tn.id_matric
			   JOIN student_enrollment AS tm on tn.id_matric = tm.id
				JOIN inscripciones AS te ON tm.id_student = te.id
			   JOIN registration_status AS tes ON tm.id_state = tes.id
			   JOIN escala_nacional AS es ON tn.id_escala=es.id
			   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
				WHERE tm.id_state= 2  AND tcr.id_jorn=",_id_study_day,"  AND tcr.grupo = '",_group,"'  AND tcr.id_grado = '",_grade,
				"' AND tcr.id_sede =", _id_head," AND tcr.year= ",`_year`," AND au.year=",_year,
				" AND tc.year = ",`_year`," AND  tn.final>=0 AND tn.periodo = '",_per,"' AND tn.id_matric=",_enroll,
				" AND tp.periodo = '",_per,"' AND tpr.`year` =",`_year`," AND t2.id_grado = ",_grade,"
				ORDER BY estudiante,tar.ordenar, au.id_area,tas.id_pk;");
	ELSE
		SET  @sqlSelect = CONCAT("SELECT tn.id,tn.periodo, tn.id_curso,  tn.id_matric,tn.id_escala,
				tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas,tn.retraso,tn.injustificadas,
				tpr.descripcion_periodo AS periodo_des,
				tcr.id_grado, tcr.grupo, tcr.year, tcr.id_jorn id_jorn, tcr.id_sede,
				tcr.id_asig, tcr.id_docente,
				CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
				RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante , te.nro_documento, RTRIM(tar.area) AS area, tar.abrev AS abre_area,
				tar.ordenar AS order_ar, RTRIM(tas.asignatura) AS asignatura, tas.abrev AS abrev_asig, tas.electiva,
				au.id_area, tas.ordenar AS order_as, CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',
				RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,RTRIM(ts.headquarters_name) AS sede, tj.jornada, tg.grado,
				RIGHT(CONCAT('0000',tm.folio),4) id_folio, RIGHT(CONCAT('000000',tm.registration_number),6) registration_number,
				tp.total, tp.puesto, tp.prom, tp.nota_max, tp.nota_min, RIGHT(CONCAT('0000',tm.book),4) book,
				tes.name_state, tm.id_state, tc.ih, ABS(tc.porciento) AS porciento,
				round(if(tn.nota_habilitacion > 0, (tn.nota_habilitacion*tc.porciento)/100, (tn.final*tc.porciento)/100),2) AS
				nota_p, tn.nivelacion, TRIM(es.nombre_escala) conceptual, tv.nombre_nivel
				FROM ",cTable," AS tn
				JOIN cursos AS tcr ON (tn.id_curso=tcr.id AND tn.year=tcr.`year`)
				JOIN grados As tg ON tcr.id_grado = tg.id
				JOIN periodos_academicos AS tpr ON (tn.periodo = tpr.periodo AND tn.year=tpr.`year`)
				JOIN grados_agrupados AS t1 ON tpr.id_grado_agrupado = t1.id
				JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
				JOIN asignaturas AS tas ON tcr.id_asig = tas.id_pk
				JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = tcr.year)
			   JOIN areas AS tar ON au.id_area=tar.id
				JOIN docentes AS td ON  tcr.id_docente = td.id_docente
				JOIN sedes AS ts ON tcr.id_sede = ts.id
			   JOIN jornadas AS tj ON tcr.id_jorn = tj.cod_jorn
				JOIN matcurso AS tc ON (tc.id_grado = tg.id AND tc.id_asig = tas.id_pk)
			   JOIN puestos AS tp ON tp.id_matric = tn.id_matric
			   JOIN student_enrollment AS tm on tn.id_matric = tm.id
				JOIN inscripciones AS te ON tm.id_student = te.id
			   JOIN registration_status AS tes ON tm.id_state = tes.id
			   JOIN escala_nacional AS es ON tn.id_escala=es.id
			   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
				WHERE tm.id_state= 2  AND tcr.id_jorn=",_id_study_day,"  AND tcr.grupo = '",_group,"'  AND
				tcr.id_grado = '",_grade,"' AND tcr.id_sede =", _id_head," AND tcr.year= ",`_year`,
				" AND tc.year = ",`_year`," AND  tn.final>=0 AND tn.periodo = '",_per,"' AND au.year=",_year,
				" AND tp.periodo = '",_per,"' AND tpr.`year` =",`_year`," AND t2.id_grado = ",_grade,"
				ORDER BY estudiante,tar.ordenar, au.id_area,tas.id_pk;");
	END IF;
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_cargar_roles
DROP PROCEDURE IF EXISTS `sp_cargar_roles`;
DELIMITER //
CREATE PROCEDURE `sp_cargar_roles`(
	IN `_id_user` INT
)
BEGIN
	DECLARE _id INT DEFAULT 0;
	SELECT t.id INTO _id FROM roles t WHERE t.id_user = _id_user LIMIT 1;
	IF _id = 0 THEN
		INSERT INTO roles(id_user,id_item)  SELECT _id_user,t.id FROM menus_items t WHERE t.estado = 1;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_carga_activities
DROP PROCEDURE IF EXISTS `sp_carga_activities`;
DELIMITER //
CREATE PROCEDURE `sp_carga_activities`(
	IN `PTeacher` BIGINT,
	IN `PYear` YEAR,
	IN `PId` BIGINT,
	IN `PType` INT
)
BEGIN
	IF PType = 1 THEN
		SELECT tm.id,tm.id_grado, UPPER(tg.grado) AS grado, tm.grupo, tm.id_asig ,
		TRIM(ta.asignatura) AS asignatura, tm.id_sede, TRIM(ts.headquarters_name) AS sede , tm.id_jorn,
		TRIM(tj.jornada) AS jornada, tm.id_docente, tm.year, tmc.proc1, tmc.proc2, tmc.proc3,
		tmc.proc4, tg.id_nivel
		FROM cursos AS tm
		JOIN grados AS  tg ON tm.id_grado = tg.id
		JOIN asignaturas AS  ta ON tm.id_asig = ta.id_pk
		JOIN sedes AS ts ON tm.id_sede = ts.ID
		JOIN jornadas as tj ON tm.id_jorn = tj.cod_jorn
		JOIN matcurso AS tmc ON (tmc.id_asig = tm.id_asig AND tmc.id_grado = tm.id_grado
		AND tmc.year = tm.year)
		WHERE tm.id_docente = PTeacher AND tm.year = PYear  AND tm.estado = 1 AND NOT
		EXISTS(
			SELECT * FROM ta_courses_online_activities a WHERE a.course_id = tm.id AND
			a.activity_id	= PId
		)
	   ORDER BY tm.id_grado, tm.id_asig, tm.grupo;
	ELSE
		SELECT a.id, a.course_id, a.activity_id,tm.id_grado, UPPER(tg.grado) AS grado, tm.grupo, tm.id_asig ,
		TRIM(ta.asignatura) AS asignatura, tm.id_sede, TRIM(ts.headquarters_name) AS sede , tm.id_jorn,
		TRIM(tj.jornada) AS jornada, tm.id_docente, tm.year, tmc.proc1, tmc.proc2, tmc.proc3,
		tmc.proc4, tg.id_nivel
		FROM ta_courses_online_activities AS a
		JOIN cursos AS tm ON a.course_id = tm.id
		JOIN grados AS  tg ON tm.id_grado = tg.id
		JOIN asignaturas AS  ta ON tm.id_asig = ta.id_pk
		JOIN sedes AS ts ON tm.id_sede = ts.ID
		JOIN jornadas as tj ON tm.id_jorn = tj.cod_jorn
		JOIN matcurso AS tmc ON (tmc.id_asig = tm.id_asig AND tmc.id_grado = tm.id_grado
		AND tmc.year = tm.year)
		WHERE tm.id_docente = PTeacher AND a.activity_id = PId AND tm.year = PYear  AND tm.estado = 1 AND
		EXISTS(
			SELECT * FROM ta_courses_online_activities a WHERE a.course_id = tm.id AND
			a.activity_id	= PId
		)
	   ORDER BY tm.id_grado, tm.id_asig, tm.grupo;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_carga_curso
DROP PROCEDURE IF EXISTS `sp_carga_curso`;
DELIMITER //
CREATE PROCEDURE `sp_carga_curso`(
	IN `PCourse` INT(30),
	IN `PYear` YEAR
)
BEGIN
		SELECT tc.id,tc.id_grado, UPPER(tg.grado) grado, tc.grupo, tc.id_asig , tg.cod_grado,
		TRIM(ta.asignatura) asignatura, tc.id_sede,tc.id_docente,
		TRIM(ts.headquarters_name) AS sede , tc.id_jorn, TRIM(tj.jornada) AS jornada,
		tc.year, tmc.proc1, tmc.proc2, tmc.proc3, tmc.proc4, te.NOMBRE_IE, RTRIM(tar.area) area,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) docente
		FROM cursos as tc
		JOIN grados AS tg ON tc.id_grado = tg.id
		JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		JOIN aux_asignaturas AS aux ON (aux.id_asign = ta.id_pk AND aux.year = tc.year)
		JOIN sedes AS ts ON tc.id_sede = ts.ID
		JOIN jornadas AS tj ON tc.id_jorn = tj.cod_jorn
		JOIN matcurso AS tmc ON (tmc.id_asig = ta.id_pk AND tmc.id_grado = tg.id AND tmc.year = tc.year)
		JOIN docentes AS td ON tc.id_docente = td.id_docente
		JOIN establecimiento AS te ON te.ID > 0
		JOIN areas AS tar ON aux.id_area = tar.id
		WHERE tc.estado = 1 AND tc.id = PCourse;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_carga_docente
DROP PROCEDURE IF EXISTS `sp_carga_docente`;
DELIMITER //
CREATE PROCEDURE `sp_carga_docente`(
	IN `PTeacher` INT(30),
	IN `PYear` YEAR,
	IN `query` VARCHAR(50)
)
BEGIN
	SET @sqlWhere	= "";
	IF LENGTH(`query`) > 0 THEN
		SET @sqlWhere	= CONCAT(" AND RTRIM(UPPER(ta.asignatura)) REGEXP UPPER(",`query`,") ");
	END IF;
	SET @sqlSelect = CONCAT("SELECT tm.id,tm.id_grado, UPPER(tg.grado) AS grado, tm.grupo, tm.id_asig ,
	TRIM(ta.asignatura) AS asignatura, tm.id_sede, TRIM(ts.headquarters_name) AS sede , tm.id_jorn,
	TRIM(tj.jornada) AS jornada, tm.id_docente, tm.year, tmc.proc1, tmc.proc2, tmc.proc3,
	tmc.proc4, tg.id_nivel
	FROM cursos AS tm
	JOIN grados AS  tg ON tm.id_grado = tg.id
	JOIN asignaturas AS  ta ON tm.id_asig = ta.id_pk
	JOIN sedes AS ts ON tm.id_sede = ts.ID
	JOIN jornadas as tj ON tm.id_jorn = tj.cod_jorn
	JOIN matcurso AS tmc ON (tmc.id_asig = tm.id_asig AND tmc.id_grado = tm.id_grado
	AND tmc.year = tm.year)
	WHERE tm.id_docente =", PTeacher," AND tm.year = ",PYear,"  AND tm.estado=1
   ORDER BY tm.id_grado, tm.id_asig, tm.grupo");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_carga_docente_agrupada
DROP PROCEDURE IF EXISTS `sp_carga_docente_agrupada`;
DELIMITER //
CREATE PROCEDURE `sp_carga_docente_agrupada`(
	IN `PTeacher` INT(30),
	IN `PYear` YEAR,
	IN `PType` INT(1)
)
BEGIN
	IF PType > 0 THEN
		SELECT tm.id_grado,tm.grupo, tm.id_docente, tm.year,tm.id_jorn, UPPER(tg.grado) AS grado,
		tm.id_sede, TRIM(ts.headquarters_name) AS sede, RTRIM(tj.jornada) jornada
		FROM cursos as tm
		JOIN grados AS tg ON tm.id_grado = tg.id
		JOIN sedes AS ts ON tm.id_sede = ts.ID
		JOIN jornadas AS tj ON tm.id_jorn = tj.cod_jorn
		WHERE tm.estado=1 AND tm.id_docente = PTeacher  AND tm.year = PYear
      GROUP BY tm.id_grado, tm.grupo, tm.id_jorn, tm.id_sede, tm.id_docente, tm.year
      ORDER BY tm.id_grado, tm.grupo, tm.id_jorn;
	ELSE
		SELECT tm.id_grado, tm.id_docente, tm.year, UPPER(tg.grado) AS grado,
		tm.id_asig , ta.asignatura, tm.id_sede, TRIM(ts.headquarters_name) AS sede
		FROM cursos as tm
		JOIN grados AS tg ON tm.id_grado = tg.id
		JOIN asignaturas AS ta ON tm.id_asig = ta.id_pk
		JOIN sedes AS ts ON tm.id_sede = ts.ID
		WHERE tm.estado=1 AND tm.id_docente= PTeacher AND tm.year = PYear
		GROUP BY tm.id_grado, tm.id_asig, tm.id_sede, tm.id_docente, tm.year
      ORDER BY tm.id_grado, tm.id_asig;
   END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_carga_docente_grupo
DROP PROCEDURE IF EXISTS `sp_carga_docente_grupo`;
DELIMITER //
CREATE PROCEDURE `sp_carga_docente_grupo`(IN `_id_inst` INT(20), IN `_id_docente` INT(20), IN `_año` YEAR, IN `_limit` TINYINT, IN `_min` INT(6), IN `_max` INT(6))
BEGIN
	if _limit = 1 then
		SELECT tm.cod_grado, UPPER(tg.grado) AS grado, tm.id_asig , ta.asignatura,
		tm.id_sede, TRIM(ts.nom_sede) AS sede , tm.id_docente, tm.año FROM cursos as tm,
		grados as tg, asignaturas as ta, sedes as ts where tm.cod_grado=tg.cod_grado AND
        tm.id_asig=ta.id AND tm.id_sede=ts.id AND tm.estado=1 AND tm.id_docente=_id_docente
        AND ta.año=_año AND tm.año=_año AND tm.id_inst=_id_inst AND ta.id_inst=_id_inst
		AND ts.id_inst=_id_inst
        GROUP BY tm.cod_grado, tm.id_asig, tm.id_sede, tm.id_docente, tm.año
        ORDER BY tm.cod_grado, tm.id_asig limit _min, _max;
    else
		SELECT tm.cod_grado, UPPER(tg.grado) AS grado, tm.id_asig , ta.asignatura,
		tm.id_sede, TRIM(ts.nom_sede) AS sede , tm.id_docente, tm.año FROM cursos as tm,
		grados as tg, asignaturas as ta, sedes as ts where tm.cod_grado=tg.cod_grado AND
        tm.id_asig=ta.id AND tm.id_sede=ts.id AND tm.estado=1 AND tm.id_docente=_id_docente
        AND ta.año=_año AND tm.año=_año AND tm.id_inst=_id_inst AND ta.id_inst=_id_inst
		AND ts.id_inst=_id_inst
        GROUP BY tm.cod_grado, tm.id_asig, tm.id_sede, tm.id_docente, tm.año
        ORDER BY tm.cod_grado, tm.id_asig;
    end if;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_carga_evaluations
DROP PROCEDURE IF EXISTS `sp_carga_evaluations`;
DELIMITER //
CREATE PROCEDURE `sp_carga_evaluations`(
	IN `PTeacher` BIGINT,
	IN `PYear` YEAR,
	IN `PId` BIGINT,
	IN `PType` INT
)
BEGIN
	IF PType = 1 THEN
		SELECT tm.id,tm.id_grado, UPPER(tg.grado) AS grado, tm.grupo, tm.id_asig ,
		TRIM(ta.asignatura) AS asignatura, tm.id_sede, TRIM(ts.headquarters_name) AS sede , tm.id_jorn,
		TRIM(tj.jornada) AS jornada, tm.id_docente, tm.year, tmc.proc1, tmc.proc2, tmc.proc3,
		tmc.proc4, tg.id_nivel
		FROM cursos AS tm
		JOIN grados AS  tg ON tm.id_grado = tg.id
		JOIN asignaturas AS  ta ON tm.id_asig = ta.id_pk
		JOIN sedes AS ts ON tm.id_sede = ts.ID
		JOIN jornadas as tj ON tm.id_jorn = tj.cod_jorn
		JOIN matcurso AS tmc ON (tmc.id_asig = tm.id_asig AND tmc.id_grado = tm.id_grado
		AND tmc.year = tm.year)
		WHERE tm.id_docente = PTeacher AND tm.year = PYear  AND tm.estado = 1 AND NOT
		EXISTS(
			SELECT * FROM te_evaluation_courses a WHERE a.course_id = tm.id AND
			a.evaluation_id = PId
		)
	   ORDER BY tm.id_grado, tm.id_asig, tm.grupo;
	ELSE
		SELECT a.id, a.evaluation_id, a.course_id,tm.id_grado, UPPER(tg.grado) AS grado, tm.grupo, tm.id_asig ,
		TRIM(ta.asignatura) AS asignatura, tm.id_sede, TRIM(ts.headquarters_name) AS sede , tm.id_jorn,
		TRIM(tj.jornada) AS jornada, tm.id_docente, tm.year, tmc.proc1, tmc.proc2, tmc.proc3,
		tmc.proc4, tg.id_nivel
		FROM te_evaluation_courses a
		JOIN cursos AS tm ON a.course_id = tm.id
		JOIN grados AS  tg ON tm.id_grado = tg.id
		JOIN asignaturas AS  ta ON tm.id_asig = ta.id_pk
		JOIN sedes AS ts ON tm.id_sede = ts.ID
		JOIN jornadas as tj ON tm.id_jorn = tj.cod_jorn
		JOIN matcurso AS tmc ON (tmc.id_asig = tm.id_asig AND tmc.id_grado = tm.id_grado
		AND tmc.year = tm.year)
		WHERE a.evaluation_id = PId AND tm.id_docente = PTeacher AND tm.year = PYear  AND tm.estado = 1 AND
		EXISTS(
			SELECT * FROM te_evaluation_courses a WHERE a.course_id = tm.id AND
			a.evaluation_id = PId
		)
	   ORDER BY tm.id_grado, tm.id_asig, tm.grupo;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_cert_final
DROP PROCEDURE IF EXISTS `sp_cert_final`;
DELIMITER //
CREATE PROCEDURE `sp_cert_final`(
	IN `PYear` YEAR,
	IN `PEnrollment` INT(30),
	IN `PType` INT
)
BEGIN
	SELECT fn_cert_final_estudio(PYear, PEnrollment, PType) AS certificado;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_consolidado_areas
DROP PROCEDURE IF EXISTS `sp_consolidado_areas`;
DELIMITER //
CREATE PROCEDURE `sp_consolidado_areas`(
	IN `_id_matric` INT(30),
	IN `_periodo` VARCHAR(2)
)
BEGIN
	DECLARE 	done,
				_year,
				_id_area,
				x_count,
				x_count_2,
				_id_area_n,
				x_id_matric,
				_ndecim,
				x_cant_asig_perdidas,
				_grade INT(30) DEFAULT 0;
	DECLARE aa1,aa2,aa3,aa4,aa5,aa6,aa7,aa8,aa9,aa10,aa11,
							aa12,aa13,aa14,aa15,aa16,aa17,aa18,aa19,aa20,
							aa21,aa22,aa23,aa24,aa25,x_count_matcurso INT DEFAULT 0;
	DECLARE	_final,
				_suma,
				_desde DECIMAL(6,2) DEFAULT 0;
	DECLARE 	_grupo VARCHAR(2) DEFAULT '';
	DECLARE 	oStrimValue,
				sValue,
				yValue CHAR DEFAULT '';
	DECLARE cur_matcurso CURSOR FOR SELECT au.id_area FROM matcurso AS tm
				JOIN asignaturas AS ta ON tm.id_asig = ta.id_pk
				JOIN aux_asignaturas AS au ON (au.id_asign = ta.id_pk AND au.year = _year)
				WHERE tm.year = _year AND tm.id_grado = _grade
			   GROUP BY au.id_area, tm.year, tm.id_grado
			   ORDER BY au.id_area;
	DECLARE cur1 CURSOR FOR SELECT au.id_area,
			ROUND(IF(tmc.porciento BETWEEN 1 AND 99,
			SUM(IF(tn.nota_habilitacion > 0,(tn.nota_habilitacion*tmc.porciento)/100,(tn.final*tmc.porciento)/100)),
			AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final))),_ndecim) AS prom FROM nscp001 AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.`year` = tc.`year`)
			JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
			JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = _year)
			JOIN areas AS tar ON au.id_area = tar.id
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
			JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tm.id_grade
			AND tmc.`year` = tm.`year`)
			WHERE  tn.id_matric = _id_matric AND tn.periodo = _periodo
			AND tmc.id_grado = _grade AND tc.id_grado = _grade
			GROUP BY tn.id_matric, au.id_area, tn.periodo;
	DECLARE cur2 CURSOR FOR SELECT au.id_area,
			ROUND(IF(tmc.porciento BETWEEN 1 AND 99,
			SUM(IF(tn.nota_habilitacion > 0,(tn.nota_habilitacion*tmc.porciento)/100,(tn.final*tmc.porciento)/100)),
			AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final))),_ndecim) AS prom FROM nscp002 AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.`year` = tc.`year`)
			JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
			JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = _year)
			JOIN areas AS tar ON au.id_area = tar.id
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
			JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tm.id_grade
			AND tmc.`year` = tm.`year`)
			WHERE  tn.id_matric = _id_matric AND tn.periodo = _periodo
			AND tmc.id_grado = _grade AND tc.id_grado = _grade
			GROUP BY tn.id_matric, au.id_area, tn.periodo;
	DECLARE cur3 CURSOR FOR SELECT au.id_area,
			ROUND(IF(tmc.porciento BETWEEN 1 AND 99,
			SUM(IF(tn.nota_habilitacion > 0,(tn.nota_habilitacion*tmc.porciento)/100,(tn.final*tmc.porciento)/100)),
			AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final))),_ndecim) AS prom FROM nscp003 AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.`year` = tc.`year`)
			JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
			JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = _year)
			JOIN areas AS tar ON au.id_area = tar.id
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
			JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tm.id_grade
			AND tmc.`year` = tm.`year`)
			WHERE  tn.id_matric = _id_matric AND tn.periodo = _periodo
			AND tmc.id_grado = _grade AND tc.id_grado = _grade
			GROUP BY tn.id_matric, au.id_area, tn.periodo;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	SELECT tm.id_grade,tm.id_group,tm.`year` INTO _grade,_grupo,`_year`
	FROM student_enrollment AS tm WHERE tm.id = _id_matric;

	SELECT td.hasta INTO _desde FROM desempeños as td
	JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE td.`year` = _year AND td.reprueba = 1
	AND t2.id_grado = _grade LIMIT 1;

	SELECT tc.Ndecimales INTO _ndecim FROM config001 tc
	JOIN grados_agrupados AS t1 ON tc.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE tc.`year` = `_year` AND t2.id_grado = _grade LIMIT 1;

	OPEN cur_matcurso;
	REPEAT
	FETCH cur_matcurso INTO _id_area;
		IF NOT done THEN
		 SET x_count = x_count + 1;
			CASE x_count
				WHEN 1 THEN
					SET aa1 = _id_area;
				WHEN 2 THEN
					SET aa2 = _id_area;
				WHEN 3 THEN
					SET aa3 = _id_area;
				WHEN 4 THEN
					SET aa4 = _id_area;
				WHEN 5 THEN
					SET aa5 = _id_area;
				WHEN 6 THEN
					SET aa6 = _id_area;
				WHEN 7 THEN
					SET aa7 = _id_area;
				WHEN 8 THEN
					SET aa8 = _id_area;
				WHEN 9 THEN
					SET aa9 = _id_area;
				WHEN 10 THEN
					SET aa10 = _id_area;
				WHEN 11 THEN
					SET aa11 = _id_area;
				WHEN 12 THEN
					SET aa12 = _id_area;
				WHEN 13 THEN
					SET aa13 = _id_area;
				WHEN 14 THEN
					SET aa14 = _id_area;
				WHEN 15 THEN
					SET aa15 = _id_area;
				WHEN 16 THEN
					SET aa16 = _id_area;
				WHEN 17 THEN
					SET aa17 = _id_area;
				WHEN 18 THEN
					SET aa18 = _id_area;
				WHEN 19 THEN
					SET aa19 = _id_area;
				WHEN 20 THEN
					SET aa20 = _id_area;
				WHEN 21 THEN
					SET aa21 = _id_area;
				WHEN 22 THEN
					SET aa22 = _id_area;
				WHEN 23 THEN
					SET aa23 = _id_area;
				WHEN 24 THEN
					SET aa24 = _id_area;
				WHEN 25 THEN
					SET aa25 = _id_area;
				ELSE
					SET done = 1;
			END CASE;
		END IF;
	UNTIL done END REPEAT;
	CLOSE cur_matcurso;

	SELECT id_matric INTO x_id_matric FROM consolidado_areas WHERE id_matric = _id_matric AND periodo = _periodo;

	IF NOT x_id_matric THEN
		INSERT INTO  consolidado_areas (id_matric,periodo) VALUES (_id_matric,_periodo);
	ELSE
		UPDATE consolidado_areas SET nar1 = 0, nar2 = 0,nar3 = 0,nar4 = 0,nar5 = 0,nar6 = 0,nar7 = 0,nar8 = 0,nar9 = 0,nar10 = 0,
		nar11 = 0, nar12 = 0,nar13 = 0,nar14 = 0,nar15 = 0,nar16 = 0,nar17 = 0,nar18 = 0,nar19 = 0,nar20 = 0,
		nar21 = 0, nar22 = 0,nar23 = 0,nar24 = 0,nar25 = 0,
        ar1 = 0, ar2 = 0,ar3 = 0,ar4 = 0,ar5 = 0,ar6 = 0,ar7 = 0,ar8 = 0,ar9 = 0,ar10 = 0,
		ar11 = 0, ar12 = 0,ar13 = 0,ar14 = 0,ar15 = 0,ar16 = 0,ar17 = 0,ar18 = 0,ar19 = 0,ar20 = 0,
		ar21 = 0, ar22 = 0,ar23 = 0,ar24 = 0,ar25 = 0
		 WHERE id_matric = _id_matric  AND  periodo = _periodo ;
	END IF;
	SET done = 0;
	SET x_count = 0;
	CASE
		WHEN _grade >= 5 AND _grade <= 9 THEN
			OPEN cur1;
			REPEAT
			FETCH cur1 INTO _id_area_n,_final;
			IF NOT done THEN
				SET x_count = x_count + 1;
				SET x_count_matcurso = 25;
				SET _suma	= _suma + _final;
				WHILE x_count_matcurso > 0 DO
					SET x_count_matcurso = x_count_matcurso - 1;
					SET x_count_2 = x_count_2 + 1 ;
					CASE x_count_2
						WHEN 1 THEN
							IF _id_area_n =  aa1 THEN
								UPDATE consolidado_areas tc SET tc.ar1 = aa1 , tc.nar1 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar1 = aa1 , tc.nar1 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 2 THEN
							IF _id_area_n =  aa2 THEN
								UPDATE consolidado_areas tc SET tc.ar2 = aa2 , tc.nar2 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar2 = aa2 , tc.nar2 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 3 THEN
							IF _id_area_n =  aa3 THEN
								UPDATE consolidado_areas tc SET tc.ar3 = aa3 , tc.nar3 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar3 = aa3 , tc.nar3 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 4 THEN
							IF _id_area_n =  aa4 THEN
								UPDATE consolidado_areas tc SET tc.ar4 = aa4 , tc.nar4 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar4 = aa4 , tc.nar4 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 5 THEN
							IF _id_area_n =  aa5 THEN
								UPDATE consolidado_areas tc SET tc.ar5 = aa5 , tc.nar5 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar5 = aa5 , tc.nar5 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 6 THEN
							IF _id_area_n =  aa6 THEN
								UPDATE consolidado_areas tc SET tc.ar6 = aa6 , tc.nar6 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar6 = aa6 , tc.nar6 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 7 THEN
							IF _id_area_n =  aa7 THEN
								UPDATE consolidado_areas tc SET tc.ar7 = aa7 , tc.nar7 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar7 = aa7 , tc.nar7 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 8 THEN
							IF _id_area_n =  aa8 THEN
								UPDATE consolidado_areas tc SET tc.ar8 = aa8 , tc.nar8 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar8 = aa8 , tc.nar8 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 9 THEN
							IF _id_area_n =  aa9 THEN
								UPDATE consolidado_areas tc SET tc.ar9 = aa9 , tc.nar9 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar9 = aa9 , tc.nar9 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 10 THEN
							IF _id_area_n =  aa10 THEN
								UPDATE consolidado_areas tc SET tc.ar10 = aa10 , tc.nar10 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar10 = aa10 , tc.nar10 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 11 THEN
							IF _id_area_n =  aa11 THEN
								UPDATE consolidado_areas tc SET tc.ar11 = aa11 , tc.nar11 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar11 = aa11 , tc.nar11 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 12 THEN
							IF _id_area_n =  aa12 THEN
								UPDATE consolidado_areas tc SET tc.ar12 = aa12 , tc.nar12 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar12 = aa12 , tc.nar12 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 13 THEN
							IF _id_area_n =  aa13 THEN
								UPDATE consolidado_areas tc SET tc.ar13 = aa13 , tc.nar13 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar13 = aa13 , tc.nar13 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 14 THEN
							IF _id_area_n =  aa14 THEN
								UPDATE consolidado_areas tc SET tc.ar14 = aa14 , tc.nar14 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar14 = aa14 , tc.nar14 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 15 THEN
							IF _id_area_n =  aa15 THEN
								UPDATE consolidado_areas tc SET tc.ar15 = aa15 , tc.nar15 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar15 = aa15 , tc.nar15 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 16 THEN
							IF _id_area_n =  aa16 THEN
								UPDATE consolidado_areas tc SET tc.ar16 = aa16 , tc.nar16 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar16 = aa16 , tc.nar16 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 17 THEN
							IF _id_area_n =  aa17 THEN
								UPDATE consolidado_areas tc SET tc.ar17 = aa17 , tc.nar17 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar17 = aa17 , tc.nar17 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 18 THEN
							IF _id_area_n =  aa18 THEN
								UPDATE consolidado_areas tc SET tc.ar18 = aa18 , tc.nar18 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar18 = aa18 , tc.nar18 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 19 THEN
							IF _id_area_n =  aa19 THEN
								UPDATE consolidado_areas tc SET tc.ar19 = aa19 , tc.nar19 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar19 = aa19 , tc.nar19 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 20 THEN
							IF _id_area_n =  aa20 THEN
								UPDATE consolidado_areas tc SET tc.ar20 = aa20 , tc.nar20 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar20 = aa20 , tc.nar20 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 21 THEN
							IF _id_area_n =  aa21 THEN
								UPDATE consolidado_areas tc SET tc.ar21 = aa21 , tc.nar21 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar21 = aa21 , tc.nar21 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 22 THEN
							IF _id_area_n =  aa22 THEN
								UPDATE consolidado_areas tc SET tc.ar22 = aa22 , tc.nar22 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar22 = aa22 , tc.nar22 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 23 THEN
							IF _id_area_n =  aa23 THEN
								UPDATE consolidado_areas tc SET tc.ar23 = aa23 , tc.nar23 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar23 = aa23 , tc.nar23 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 24 THEN
							IF _id_area_n =  aa24 THEN
								UPDATE consolidado_areas tc SET tc.ar24 = aa24 , tc.nar24 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar24 = aa24 , tc.nar24 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 25 THEN
							IF _id_area_n =  aa25 THEN
								UPDATE consolidado_areas tc SET tc.ar25 = aa25 , tc.nar25 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar25 = aa25 , tc.nar25 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
					ELSE
						SET done = 0;
					END CASE;
				END WHILE;
			END IF;
		UNTIL done END REPEAT;
		IF _suma > 0 THEN
			SET _suma = ROUND(_suma/x_count,2);
		END IF;
		UPDATE consolidado_areas cn SET cn.prom = _suma, cn.t = x_cant_asig_perdidas
							WHERE cn.id_matric = _id_matric AND cn.periodo = _periodo;
		CLOSE cur1;
	WHEN _grade >= 10 AND _grade <= 13 THEN
			OPEN cur2;
			REPEAT
			FETCH cur2 INTO _id_area_n,_final;
			IF NOT done THEN
				SET x_count = x_count + 1;
				SET x_count_matcurso = 25;
				SET _suma	= _suma + _final;
				WHILE x_count_matcurso > 0 DO
					SET x_count_matcurso = x_count_matcurso - 1;
					SET x_count_2 = x_count_2 + 1 ;
					CASE x_count_2
						WHEN 1 THEN
							IF _id_area_n =  aa1 THEN
								UPDATE consolidado_areas tc SET tc.ar1 = aa1 , tc.nar1 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar1 = aa1 , tc.nar1 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 2 THEN
							IF _id_area_n =  aa2 THEN
								UPDATE consolidado_areas tc SET tc.ar2 = aa2 , tc.nar2 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar2 = aa2 , tc.nar2 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 3 THEN
							IF _id_area_n =  aa3 THEN
								UPDATE consolidado_areas tc SET tc.ar3 = aa3 , tc.nar3 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar3 = aa3 , tc.nar3 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 4 THEN
							IF _id_area_n =  aa4 THEN
								UPDATE consolidado_areas tc SET tc.ar4 = aa4 , tc.nar4 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar4 = aa4 , tc.nar4 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 5 THEN
							IF _id_area_n =  aa5 THEN
								UPDATE consolidado_areas tc SET tc.ar5 = aa5 , tc.nar5 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar5 = aa5 , tc.nar5 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 6 THEN
							IF _id_area_n =  aa6 THEN
								UPDATE consolidado_areas tc SET tc.ar6 = aa6 , tc.nar6 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar6 = aa6 , tc.nar6 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 7 THEN
							IF _id_area_n =  aa7 THEN
								UPDATE consolidado_areas tc SET tc.ar7 = aa7 , tc.nar7 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar7 = aa7 , tc.nar7 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 8 THEN
							IF _id_area_n =  aa8 THEN
								UPDATE consolidado_areas tc SET tc.ar8 = aa8 , tc.nar8 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar8 = aa8 , tc.nar8 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 9 THEN
							IF _id_area_n =  aa9 THEN
								UPDATE consolidado_areas tc SET tc.ar9 = aa9 , tc.nar9 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar9 = aa9 , tc.nar9 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 10 THEN
							IF _id_area_n =  aa10 THEN
								UPDATE consolidado_areas tc SET tc.ar10 = aa10 , tc.nar10 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar10 = aa10 , tc.nar10 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 11 THEN
							IF _id_area_n =  aa11 THEN
								UPDATE consolidado_areas tc SET tc.ar11 = aa11 , tc.nar11 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar11 = aa11 , tc.nar11 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 12 THEN
							IF _id_area_n =  aa12 THEN
								UPDATE consolidado_areas tc SET tc.ar12 = aa12 , tc.nar12 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar12 = aa12 , tc.nar12 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 13 THEN
							IF _id_area_n =  aa13 THEN
								UPDATE consolidado_areas tc SET tc.ar13 = aa13 , tc.nar13 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar13 = aa13 , tc.nar13 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 14 THEN
							IF _id_area_n =  aa14 THEN
								UPDATE consolidado_areas tc SET tc.ar14 = aa14 , tc.nar14 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar14 = aa14 , tc.nar14 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 15 THEN
							IF _id_area_n =  aa15 THEN
								UPDATE consolidado_areas tc SET tc.ar15 = aa15 , tc.nar15 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar15 = aa15 , tc.nar15 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 16 THEN
							IF _id_area_n =  aa16 THEN
								UPDATE consolidado_areas tc SET tc.ar16 = aa16 , tc.nar16 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar16 = aa16 , tc.nar16 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 17 THEN
							IF _id_area_n =  aa17 THEN
								UPDATE consolidado_areas tc SET tc.ar17 = aa17 , tc.nar17 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar17 = aa17 , tc.nar17 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 18 THEN
							IF _id_area_n =  aa18 THEN
								UPDATE consolidado_areas tc SET tc.ar18 = aa18 , tc.nar18 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar18 = aa18 , tc.nar18 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 19 THEN
							IF _id_area_n =  aa19 THEN
								UPDATE consolidado_areas tc SET tc.ar19 = aa19 , tc.nar19 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar19 = aa19 , tc.nar19 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 20 THEN
							IF _id_area_n =  aa20 THEN
								UPDATE consolidado_areas tc SET tc.ar20 = aa20 , tc.nar20 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar20 = aa20 , tc.nar20 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 21 THEN
							IF _id_area_n =  aa21 THEN
								UPDATE consolidado_areas tc SET tc.ar21 = aa21 , tc.nar21 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar21 = aa21 , tc.nar21 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 22 THEN
							IF _id_area_n =  aa22 THEN
								UPDATE consolidado_areas tc SET tc.ar22 = aa22 , tc.nar22 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar22 = aa22 , tc.nar22 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 23 THEN
							IF _id_area_n =  aa23 THEN
								UPDATE consolidado_areas tc SET tc.ar23 = aa23 , tc.nar23 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar23 = aa23 , tc.nar23 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 24 THEN
							IF _id_area_n =  aa24 THEN
								UPDATE consolidado_areas tc SET tc.ar24 = aa24 , tc.nar24 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar24 = aa24 , tc.nar24 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 25 THEN
							IF _id_area_n =  aa25 THEN
								UPDATE consolidado_areas tc SET tc.ar25 = aa25 , tc.nar25 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar25 = aa25 , tc.nar25 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
					ELSE
						SET done = 0;
					END CASE;
				END WHILE;
			END IF;
		UNTIL done END REPEAT;
		IF _suma > 0 THEN
			SET _suma = ROUND(_suma/x_count,2);
		END IF;
		UPDATE consolidado_areas cn SET cn.prom = _suma, cn.t = x_cant_asig_perdidas
							WHERE cn.id_matric = _id_matric AND cn.periodo = _periodo;
		CLOSE cur2;
	WHEN _grade >= 14 THEN
			OPEN cur3;
			REPEAT
			FETCH cur3 INTO _id_area_n,_final;
			IF NOT done THEN
				SET x_count = x_count + 1;
				SET x_count_matcurso = 25;
				SET _suma	= _suma + _final;
				WHILE x_count_matcurso > 0 DO
					SET x_count_matcurso = x_count_matcurso - 1;
					SET x_count_2 = x_count_2 + 1 ;
					CASE x_count_2
						WHEN 1 THEN
							IF _id_area_n =  aa1 THEN
								UPDATE consolidado_areas tc SET tc.ar1 = aa1 , tc.nar1 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar1 = aa1 , tc.nar1 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 2 THEN
							IF _id_area_n =  aa2 THEN
								UPDATE consolidado_areas tc SET tc.ar2 = aa2 , tc.nar2 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar2 = aa2 , tc.nar2 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 3 THEN
							IF _id_area_n =  aa3 THEN
								UPDATE consolidado_areas tc SET tc.ar3 = aa3 , tc.nar3 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar3 = aa3 , tc.nar3 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 4 THEN
							IF _id_area_n =  aa4 THEN
								UPDATE consolidado_areas tc SET tc.ar4 = aa4 , tc.nar4 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar4 = aa4 , tc.nar4 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 5 THEN
							IF _id_area_n =  aa5 THEN
								UPDATE consolidado_areas tc SET tc.ar5 = aa5 , tc.nar5 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar5 = aa5 , tc.nar5 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 6 THEN
							IF _id_area_n =  aa6 THEN
								UPDATE consolidado_areas tc SET tc.ar6 = aa6 , tc.nar6 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar6 = aa6 , tc.nar6 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 7 THEN
							IF _id_area_n =  aa7 THEN
								UPDATE consolidado_areas tc SET tc.ar7 = aa7 , tc.nar7 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar7 = aa7 , tc.nar7 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 8 THEN
							IF _id_area_n =  aa8 THEN
								UPDATE consolidado_areas tc SET tc.ar8 = aa8 , tc.nar8 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar8 = aa8 , tc.nar8 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 9 THEN
							IF _id_area_n =  aa9 THEN
								UPDATE consolidado_areas tc SET tc.ar9 = aa9 , tc.nar9 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar9 = aa9 , tc.nar9 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 10 THEN
							IF _id_area_n =  aa10 THEN
								UPDATE consolidado_areas tc SET tc.ar10 = aa10 , tc.nar10 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar10 = aa10 , tc.nar10 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 11 THEN
							IF _id_area_n =  aa11 THEN
								UPDATE consolidado_areas tc SET tc.ar11 = aa11 , tc.nar11 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar11 = aa11 , tc.nar11 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 12 THEN
							IF _id_area_n =  aa12 THEN
								UPDATE consolidado_areas tc SET tc.ar12 = aa12 , tc.nar12 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar12 = aa1 , tc.nar12 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 13 THEN
							IF _id_area_n =  aa13 THEN
								UPDATE consolidado_areas tc SET tc.ar13 = aa13 , tc.nar13 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar13 = aa13 , tc.nar13 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 14 THEN
							IF _id_area_n =  aa14 THEN
								UPDATE consolidado_areas tc SET tc.ar14 = aa14 , tc.nar14 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar14 = aa14 , tc.nar14 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 15 THEN
							IF _id_area_n =  aa15 THEN
								UPDATE consolidado_areas tc SET tc.ar15 = aa15 , tc.nar15 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar15 = aa15 , tc.nar15 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 16 THEN
							IF _id_area_n =  aa16 THEN
								UPDATE consolidado_areas tc SET tc.ar16 = aa16 , tc.nar16 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar16 = aa16 , tc.nar16 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 17 THEN
							IF _id_area_n =  aa17 THEN
								UPDATE consolidado_areas tc SET tc.ar17 = aa17 , tc.nar17 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar17 = aa17 , tc.nar17 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 18 THEN
							IF _id_area_n =  aa18 THEN
								UPDATE consolidado_areas tc SET tc.ar18 = aa18 , tc.nar18 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar18 = aa18 , tc.nar18 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 19 THEN
							IF _id_area_n =  aa19 THEN
								UPDATE consolidado_areas tc SET tc.ar19 = aa19 , tc.nar19 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar19 = aa19 , tc.nar19 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 20 THEN
							IF _id_area_n =  aa20 THEN
								UPDATE consolidado_areas tc SET tc.ar20 = aa20 , tc.nar20 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar20 = aa20 , tc.nar20 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 21 THEN
							IF _id_area_n =  aa21 THEN
								UPDATE consolidado_areas tc SET tc.ar21 = aa21 , tc.nar21 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar21 = aa21 , tc.nar21 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 22 THEN
							IF _id_area_n =  aa22 THEN
								UPDATE consolidado_areas tc SET tc.ar22 = aa22 , tc.nar22 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar22 = aa22 , tc.nar22 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 23 THEN
							IF _id_area_n =  aa23 THEN
								UPDATE consolidado_areas tc SET tc.ar23 = aa23 , tc.nar23 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar23 = aa23 , tc.nar23 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 24 THEN
							IF _id_area_n =  aa24 THEN
								UPDATE consolidado_areas tc SET tc.ar24 = aa24 , tc.nar24 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar24 = aa24 , tc.nar24 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 25 THEN
							IF _id_area_n =  aa25 THEN
								UPDATE consolidado_areas tc SET tc.ar25 = aa25 , tc.nar25 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado_areas tc SET tc.ar25 = aa25 , tc.nar25 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
					ELSE
						SET done = 0;
					END CASE;
				END WHILE;
			END IF;
		UNTIL done END REPEAT;
		IF _suma > 0 THEN
			SET _suma = ROUND(_suma/x_count,2);
		END IF;
		UPDATE consolidado_areas cn SET cn.prom = _suma, cn.t = x_cant_asig_perdidas
							WHERE cn.id_matric = _id_matric AND cn.periodo = _periodo;
		CLOSE cur3;
	ELSE
		SET done = 1;
	END CASE;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_consolidado_asignaturas
DROP PROCEDURE IF EXISTS `sp_consolidado_asignaturas`;
DELIMITER //
CREATE PROCEDURE `sp_consolidado_asignaturas`(
	IN `_id_matric` INT(30),
	IN `_periodo` VARCHAR(2)
)
BEGIN
	DECLARE 	done,
				_id_inst,
				_year,
				_id_asig,
				x_count,
				x_count_2,
				_id_asig_n,
				x_id_matric,
				_grade INT(30) DEFAULT 0;
	DECLARE aa1,aa2,aa3,aa4,aa5,aa6,aa7,aa8,aa9,aa10,aa11,
							aa12,aa13,aa14,aa15,aa16,aa17,aa18,aa19,aa20,
							aa21,aa22,aa23,aa24,aa25,x_count_matcurso,
							x_cant_asig_perdidas INT DEFAULT 0;
	DECLARE	_final,
				_suma,
				_desde DECIMAL(6,2) DEFAULT 0;
	DECLARE 	_grupo VARCHAR(2) DEFAULT '';
	DECLARE 	oStrimValue,
				sValue,
				yValue CHAR DEFAULT '';
	DECLARE cur_matcurso CURSOR FOR SELECT tm.id_asig FROM matcurso AS tm
				JOIN asignaturas AS ta ON tm.id_asig = ta.id_pk
				JOIN aux_asignaturas AS au ON (au.id_asign = ta.id_pk AND au.year = _year)
				WHERE tm.year = _year AND tm.id_grado = _grade AND au.year = _year
			   GROUP BY tm.id_asig, tm.year, tm.id_grado
			   ORDER BY au.id_area, tm.id_asig;
	DECLARE cur1 CURSOR FOR SELECT tc.id_asig, if(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final) AS final
				FROM nscp001 AS tn
				JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
				JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
				JOIN aux_asignaturas AS au ON (au.id_asign = ta.id_pk AND au.year = _year)
				JOIN student_enrollment AS tm ON tn.id_matric = tm.id
				WHERE tn.periodo = _periodo AND tm.id_state = 2 AND tm.id = _id_matric
				AND tn.year = _year
				ORDER BY au.id_area,tc.id_asig;
	DECLARE cur2 CURSOR FOR SELECT tc.id_asig, if(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final) AS final
				FROM nscp002 AS tn
				JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
				JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
				JOIN aux_asignaturas AS au ON (au.id_asign = ta.id_pk AND au.year = _year)
				JOIN student_enrollment AS tm ON tn.id_matric = tm.id
				WHERE tn.periodo = _periodo AND tm.id_state = 2 AND tm.id = _id_matric
				AND tn.year = _year
				ORDER BY au.id_area,tc.id_asig;
	DECLARE cur3 CURSOR FOR SELECT tc.id_asig, if(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final) AS final
				FROM nscp003 AS tn
				JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
				JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
				JOIN aux_asignaturas AS au ON (au.id_asign = ta.id_pk AND au.year = _year)
				JOIN student_enrollment AS tm ON tn.id_matric = tm.id
				WHERE tn.periodo = _periodo AND tm.id_state= 2 AND tm.id = _id_matric
			   AND tn.year = _year
				ORDER BY au.id_area,tc.id_asig;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	SELECT tm.id_grade,tm.id_group,tm.year INTO _grade,_grupo,`_year`
	FROM student_enrollment AS tm WHERE tm.id = _id_matric LIMIT 1;
	OPEN cur_matcurso;

	SELECT td.hasta INTO _desde FROM desempeños as td
	JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE td.year = _year AND td.reprueba = 1
	AND t2.id_grado = _grade LIMIT 1;

	REPEAT
	FETCH cur_matcurso INTO _id_asig;
		IF NOT done THEN
		 SET x_count = x_count + 1;
			CASE x_count
				WHEN 1 THEN
					SET aa1 = _id_asig;
				WHEN 2 THEN
					SET aa2 = _id_asig;
				WHEN 3 THEN
					SET aa3 = _id_asig;
				WHEN 4 THEN
					SET aa4 = _id_asig;
				WHEN 5 THEN
					SET aa5 = _id_asig;
				WHEN 6 THEN
					SET aa6 = _id_asig;
				WHEN 7 THEN
					SET aa7 = _id_asig;
				WHEN 8 THEN
					SET aa8 = _id_asig;
				WHEN 9 THEN
					SET aa9 = _id_asig;
				WHEN 10 THEN
					SET aa10 = _id_asig;
				WHEN 11 THEN
					SET aa11 = _id_asig;
				WHEN 12 THEN
					SET aa12 = _id_asig;
				WHEN 13 THEN
					SET aa13 = _id_asig;
				WHEN 14 THEN
					SET aa14 = _id_asig;
				WHEN 15 THEN
					SET aa15 = _id_asig;
				WHEN 16 THEN
					SET aa16 = _id_asig;
				WHEN 17 THEN
					SET aa17 = _id_asig;
				WHEN 18 THEN
					SET aa18 = _id_asig;
				WHEN 19 THEN
					SET aa19 = _id_asig;
				WHEN 20 THEN
					SET aa20 = _id_asig;
				WHEN 21 THEN
					SET aa21 = _id_asig;
				WHEN 22 THEN
					SET aa22 = _id_asig;
				WHEN 23 THEN
					SET aa23 = _id_asig;
				WHEN 24 THEN
					SET aa24 = _id_asig;
				WHEN 25 THEN
					SET aa25 = _id_asig;
				ELSE
					SET done = 1;
			END CASE;
		END IF;
	UNTIL done END REPEAT;
	CLOSE cur_matcurso;

	SELECT id_matric INTO x_id_matric FROM consolidado WHERE id_matric = _id_matric AND periodo = _periodo;

	IF NOT x_id_matric THEN
		INSERT INTO  consolidado (id_matric,periodo) VALUES (_id_matric,_periodo);
	ELSE
		UPDATE consolidado SET nar1 = 0, nar2 = 0,nar3 = 0,nar4 = 0,nar5 = 0,nar6 = 0,nar7 = 0,nar8 = 0,nar9 = 0,nar10 = 0,
		nar11 = 0, nar12 = 0,nar13 = 0,nar14 = 0,nar15 = 0,nar16 = 0,nar17 = 0,nar18 = 0,nar19 = 0,nar20 = 0,
		nar21 = 0, nar22 = 0,nar23 = 0,nar24 = 0,nar25 = 0,
        ar1 = 0, ar2 = 0,ar3 = 0,ar4 = 0,ar5 = 0,ar6 = 0,ar7 = 0,ar8 = 0,ar9 = 0,ar10 = 0,
		ar11 = 0, ar12 = 0,ar13 = 0,ar14 = 0,ar15 = 0,ar16 = 0,ar17 = 0,ar18 = 0,ar19 = 0,ar20 = 0,
		ar21 = 0, ar22 = 0,ar23 = 0,ar24 = 0,ar25 = 0
		 WHERE id_matric = _id_matric  AND  periodo = _periodo ;
	END IF;
	SET done = 0;
	SET x_count = 0;
	CASE
		WHEN _grade >= 5 AND _grade <= 9 THEN
			OPEN cur1;
			REPEAT
			FETCH cur1 INTO _id_asig_n,_final;
			IF NOT done THEN
				SET x_count = x_count + 1;
				SET x_count_matcurso = 25;
				SET _suma	= _suma + _final;
				WHILE x_count_matcurso > 0 DO
					SET x_count_matcurso = x_count_matcurso - 1;
					SET x_count_2 = x_count_2 + 1 ;
					CASE x_count_2
						WHEN 1 THEN
							IF _id_asig_n =  aa1 THEN
								UPDATE consolidado tc SET tc.ar1 = aa1 , tc.nar1 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar1 = aa1 , tc.nar1 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 2 THEN
							IF _id_asig_n =  aa2 THEN
								UPDATE consolidado tc SET tc.ar2 = aa2 , tc.nar2 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar2 = aa2 , tc.nar2 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 3 THEN
							IF _id_asig_n =  aa3 THEN
								UPDATE consolidado tc SET tc.ar3 = aa3 , tc.nar3 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar3 = aa3 , tc.nar3 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 4 THEN
							IF _id_asig_n =  aa4 THEN
								UPDATE consolidado tc SET tc.ar4 = aa4 , tc.nar4 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar4 = aa4 , tc.nar4 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 5 THEN
							IF _id_asig_n =  aa5 THEN
								UPDATE consolidado tc SET tc.ar5 = aa5 , tc.nar5 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar5 = aa5 , tc.nar5 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 6 THEN
							IF _id_asig_n =  aa6 THEN
								UPDATE consolidado tc SET tc.ar6 = aa6 , tc.nar6 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar6 = aa6 , tc.nar6 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 7 THEN
							IF _id_asig_n =  aa7 THEN
								UPDATE consolidado tc SET tc.ar7 = aa7 , tc.nar7 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar7 = aa7 , tc.nar7 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 8 THEN
							IF _id_asig_n =  aa8 THEN
								UPDATE consolidado tc SET tc.ar8 = aa8 , tc.nar8 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar8 = aa8 , tc.nar8 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 9 THEN
							IF _id_asig_n =  aa9 THEN
								UPDATE consolidado tc SET tc.ar9 = aa9 , tc.nar9 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar9 = aa9 , tc.nar9 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 10 THEN
							IF _id_asig_n =  aa10 THEN
								UPDATE consolidado tc SET tc.ar10 = aa10 , tc.nar10 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar10 = aa10 , tc.nar10 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 11 THEN
							IF _id_asig_n =  aa11 THEN
								UPDATE consolidado tc SET tc.ar11 = aa11 , tc.nar11 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar11 = aa11 , tc.nar11 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 12 THEN
							IF _id_asig_n =  aa12 THEN
								UPDATE consolidado tc SET tc.ar12 = aa12 , tc.nar12 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar12 = aa12 , tc.nar12 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 13 THEN
							IF _id_asig_n =  aa13 THEN
								UPDATE consolidado tc SET tc.ar13 = aa13 , tc.nar13 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar13 = aa13 , tc.nar13 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 14 THEN
							IF _id_asig_n =  aa14 THEN
								UPDATE consolidado tc SET tc.ar14 = aa14 , tc.nar14 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar14 = aa14 , tc.nar14 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 15 THEN
							IF _id_asig_n =  aa15 THEN
								UPDATE consolidado tc SET tc.ar15 = aa15 , tc.nar15 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar15 = aa15 , tc.nar15 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 16 THEN
							IF _id_asig_n =  aa16 THEN
								UPDATE consolidado tc SET tc.ar16 = aa16 , tc.nar16 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar16 = aa16 , tc.nar16 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 17 THEN
							IF _id_asig_n =  aa17 THEN
								UPDATE consolidado tc SET tc.ar17 = aa17 , tc.nar17 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar17 = aa17 , tc.nar17 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 18 THEN
							IF _id_asig_n =  aa18 THEN
								UPDATE consolidado tc SET tc.ar18 = aa18 , tc.nar18 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar18 = aa18 , tc.nar18 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 19 THEN
							IF _id_asig_n =  aa19 THEN
								UPDATE consolidado tc SET tc.ar19 = aa19 , tc.nar19 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar19 = aa19 , tc.nar19 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 20 THEN
							IF _id_asig_n =  aa20 THEN
								UPDATE consolidado tc SET tc.ar20 = aa20 , tc.nar20 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar20 = aa20 , tc.nar20 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 21 THEN
							IF _id_asig_n =  aa21 THEN
								UPDATE consolidado tc SET tc.ar21 = aa21 , tc.nar21 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar21 = aa21 , tc.nar21 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 22 THEN
							IF _id_asig_n =  aa22 THEN
								UPDATE consolidado tc SET tc.ar22 = aa22 , tc.nar22 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar22 = aa22 , tc.nar22 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 23 THEN
							IF _id_asig_n =  aa23 THEN
								UPDATE consolidado tc SET tc.ar23 = aa23 , tc.nar23 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar23 = aa23 , tc.nar23 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 24 THEN
							IF _id_asig_n =  aa24 THEN
								UPDATE consolidado tc SET tc.ar24 = aa24 , tc.nar24 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar24 = aa24 , tc.nar24 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 25 THEN
							IF _id_asig_n =  aa25 THEN
								UPDATE consolidado tc SET tc.ar25 = aa25 , tc.nar25 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar25 = aa25 , tc.nar25 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
					ELSE
						SET done = 0;
					END CASE;
				END WHILE;
			END IF;
		UNTIL done END REPEAT;
		IF _suma > 0 THEN
			SET _suma = ROUND(_suma/x_count,2);
		END IF;
		UPDATE consolidado cn SET cn.prom = _suma, cn.t = x_cant_asig_perdidas
							WHERE cn.id_matric = _id_matric AND cn.periodo = _periodo;
		CLOSE cur1;
	WHEN _grade >= 10 AND _grade <= 13 THEN
			OPEN cur2;
			REPEAT
			FETCH cur2 INTO _id_asig_n,_final;
			IF NOT done THEN
				SET x_count = x_count + 1;
				SET x_count_matcurso = 25;
				SET _suma	= _suma + _final;
				WHILE x_count_matcurso > 0 DO
					SET x_count_matcurso = x_count_matcurso - 1;
					SET x_count_2 = x_count_2 + 1 ;
					CASE x_count_2
						WHEN 1 THEN
							IF _id_asig_n =  aa1 THEN
								UPDATE consolidado tc SET tc.ar1 = aa1 , tc.nar1 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar1 = aa1 , tc.nar1 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							SET done = 0;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
						WHEN 2 THEN
							IF _id_asig_n =  aa2 THEN
								UPDATE consolidado tc SET tc.ar2 = aa2 , tc.nar2 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar2 = aa2 , tc.nar2 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 3 THEN
							IF _id_asig_n =  aa3 THEN
								UPDATE consolidado tc SET tc.ar3 = aa3 , tc.nar3 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar3 = aa3 , tc.nar3 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 4 THEN
							IF _id_asig_n =  aa4 THEN
								UPDATE consolidado tc SET tc.ar4 = aa4 , tc.nar4 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar4 = aa4 , tc.nar4 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 5 THEN
							IF _id_asig_n =  aa5 THEN
								UPDATE consolidado tc SET tc.ar5 = aa5 , tc.nar5 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar5 = aa5 , tc.nar5 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 6 THEN
							IF _id_asig_n =  aa6 THEN
								UPDATE consolidado tc SET tc.ar6 = aa6 , tc.nar6 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar6 = aa6 , tc.nar6 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 7 THEN
							IF _id_asig_n =  aa7 THEN
								UPDATE consolidado tc SET tc.ar7 = aa7 , tc.nar7 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar7 = aa7 , tc.nar7 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 8 THEN
							IF _id_asig_n =  aa8 THEN
								UPDATE consolidado tc SET tc.ar8 = aa8 , tc.nar8 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar8 = aa8 , tc.nar8 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 9 THEN
							IF _id_asig_n =  aa9 THEN
								UPDATE consolidado tc SET tc.ar9 = aa9 , tc.nar9 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar9 = aa9 , tc.nar9 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 10 THEN
							IF _id_asig_n =  aa10 THEN
								UPDATE consolidado tc SET tc.ar10 = aa10 , tc.nar10 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar10 = aa10 , tc.nar10 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 11 THEN
							IF _id_asig_n =  aa11 THEN
								UPDATE consolidado tc SET tc.ar11 = aa11 , tc.nar11 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar11 = aa11 , tc.nar11 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 12 THEN
							IF _id_asig_n =  aa12 THEN
								UPDATE consolidado tc SET tc.ar12 = aa12 , tc.nar12 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar12 = aa12 , tc.nar12 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 13 THEN
							IF _id_asig_n =  aa13 THEN
								UPDATE consolidado tc SET tc.ar13 = aa13 , tc.nar13 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar13 = aa13 , tc.nar13 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 14 THEN
							IF _id_asig_n =  aa14 THEN
								UPDATE consolidado tc SET tc.ar14 = aa14 , tc.nar14 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar14 = aa14 , tc.nar14 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 15 THEN
							IF _id_asig_n =  aa15 THEN
								UPDATE consolidado tc SET tc.ar15 = aa15 , tc.nar15 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar15 = aa15 , tc.nar15 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 16 THEN
							IF _id_asig_n =  aa16 THEN
								UPDATE consolidado tc SET tc.ar16 = aa16 , tc.nar16 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar16 = aa16 , tc.nar16 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 17 THEN
							IF _id_asig_n =  aa17 THEN
								UPDATE consolidado tc SET tc.ar17 = aa17 , tc.nar17 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar17 = aa17 , tc.nar17 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 18 THEN
							IF _id_asig_n =  aa18 THEN
								UPDATE consolidado tc SET tc.ar18 = aa18 , tc.nar18 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar18 = aa18 , tc.nar18 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 19 THEN
							IF _id_asig_n =  aa19 THEN
								UPDATE consolidado tc SET tc.ar19 = aa19 , tc.nar19 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar19 = aa19 , tc.nar19 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 20 THEN
							IF _id_asig_n =  aa20 THEN
								UPDATE consolidado tc SET tc.ar20 = aa20 , tc.nar20 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar20 = aa20 , tc.nar20 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 21 THEN
							IF _id_asig_n =  aa21 THEN
								UPDATE consolidado tc SET tc.ar21 = aa21 , tc.nar21 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar21 = aa21 , tc.nar21 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 22 THEN
							IF _id_asig_n =  aa22 THEN
								UPDATE consolidado tc SET tc.ar22 = aa22 , tc.nar22 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar22 = aa22 , tc.nar22 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 23 THEN
							IF _id_asig_n =  aa23 THEN
								UPDATE consolidado tc SET tc.ar23 = aa23 , tc.nar23 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar23 = aa23 , tc.nar23 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 24 THEN
							IF _id_asig_n =  aa24 THEN
								UPDATE consolidado tc SET tc.ar24 = aa24 , tc.nar24 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar24 = aa24 , tc.nar24 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 25 THEN
							IF _id_asig_n =  aa25 THEN
								UPDATE consolidado tc SET tc.ar25 = aa25 , tc.nar25 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar25 = aa25 , tc.nar25 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
					ELSE
						SET done = 0;
					END CASE;
				END WHILE;
			END IF;
		UNTIL done END REPEAT;
		IF _suma > 0 THEN
			SET _suma = ROUND(_suma/x_count,2);
		END IF;
		UPDATE consolidado cn SET cn.prom = _suma, cn.t = x_cant_asig_perdidas
							WHERE cn.id_matric = _id_matric AND cn.periodo = _periodo;
		CLOSE cur2;
	WHEN _grade >= 14 THEN
			OPEN cur3;
			REPEAT
			FETCH cur3 INTO _id_asig_n,_final;
			IF NOT done THEN
				SET x_count = x_count + 1;
				SET x_count_matcurso = 25;
				SET _suma	= _suma + _final;
				WHILE x_count_matcurso > 0 DO
					SET x_count_matcurso = x_count_matcurso - 1;
					SET x_count_2 = x_count_2 + 1 ;
					CASE x_count_2
						WHEN 1 THEN
							IF _id_asig_n =  aa1 THEN
								UPDATE consolidado tc SET tc.ar1 = aa1 , tc.nar1 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar1 = aa1 , tc.nar1 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 2 THEN
							IF _id_asig_n =  aa2 THEN
								UPDATE consolidado tc SET tc.ar2 = aa2 , tc.nar2 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar2 = aa2 , tc.nar2 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 3 THEN
							IF _id_asig_n =  aa3 THEN
								UPDATE consolidado tc SET tc.ar3 = aa3 , tc.nar3 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar3 = aa3 , tc.nar3 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 4 THEN
							IF _id_asig_n =  aa4 THEN
								UPDATE consolidado tc SET tc.ar4 = aa4 , tc.nar4 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar4 = aa4 , tc.nar4 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 5 THEN
							IF _id_asig_n =  aa5 THEN
								UPDATE consolidado tc SET tc.ar5 = aa5 , tc.nar5 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar5 = aa5 , tc.nar5 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 6 THEN
							IF _id_asig_n =  aa6 THEN
								UPDATE consolidado tc SET tc.ar6 = aa6 , tc.nar6 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar6 = aa6 , tc.nar6 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 7 THEN
							IF _id_asig_n =  aa7 THEN
								UPDATE consolidado tc SET tc.ar7 = aa7 , tc.nar7 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar7 = aa7 , tc.nar7 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 8 THEN
							IF _id_asig_n =  aa8 THEN
								UPDATE consolidado tc SET tc.ar8 = aa8 , tc.nar8 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar8 = aa8 , tc.nar8 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 9 THEN
							IF _id_asig_n =  aa9 THEN
								UPDATE consolidado tc SET tc.ar9 = aa9 , tc.nar9 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar9 = aa9 , tc.nar9 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 10 THEN
							IF _id_asig_n =  aa10 THEN
								UPDATE consolidado tc SET tc.ar10 = aa10 , tc.nar10 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar10 = aa10 , tc.nar10 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 11 THEN
							IF _id_asig_n =  aa11 THEN
								UPDATE consolidado tc SET tc.ar11 = aa11 , tc.nar11 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar11 = aa11 , tc.nar11 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 12 THEN
							IF _id_asig_n =  aa12 THEN
								UPDATE consolidado tc SET tc.ar12 = aa12 , tc.nar12 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar12 = aa12 , tc.nar12 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 13 THEN
							IF _id_asig_n =  aa13 THEN
								UPDATE consolidado tc SET tc.ar13 = aa13 , tc.nar13 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar13 = aa13 , tc.nar13 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 14 THEN
							IF _id_asig_n =  aa14 THEN
								UPDATE consolidado tc SET tc.ar14 = aa14 , tc.nar14 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar14 = aa14 , tc.nar14 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 15 THEN
							IF _id_asig_n =  aa15 THEN
								UPDATE consolidado tc SET tc.ar15 = aa15 , tc.nar15 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar15 = aa15 , tc.nar15 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 16 THEN
							IF _id_asig_n =  aa16 THEN
								UPDATE consolidado tc SET tc.ar16 = aa16 , tc.nar16 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar16 = aa16 , tc.nar16 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 17 THEN
							IF _id_asig_n =  aa17 THEN
								UPDATE consolidado tc SET tc.ar17 = aa17 , tc.nar17 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar17 = aa17 , tc.nar17 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 18 THEN
							IF _id_asig_n =  aa18 THEN
								UPDATE consolidado tc SET tc.ar18 = aa18 , tc.nar18 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar18 = aa18 , tc.nar18 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 19 THEN
							IF _id_asig_n =  aa19 THEN
								UPDATE consolidado tc SET tc.ar19 = aa19 , tc.nar19 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar19 = aa19 , tc.nar19 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 20 THEN
							IF _id_asig_n =  aa20 THEN
								UPDATE consolidado tc SET tc.ar20 = aa20 , tc.nar20 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar20 = aa20 , tc.nar20 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 21 THEN
							IF _id_asig_n =  aa21 THEN
								UPDATE consolidado tc SET tc.ar21 = aa21 , tc.nar21 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar21 = aa21 , tc.nar21 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 22 THEN
							IF _id_asig_n =  aa22 THEN
								UPDATE consolidado tc SET tc.ar22 = aa22 , tc.nar22 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar22 = aa22 , tc.nar22 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 23 THEN
							IF _id_asig_n =  aa23 THEN
								UPDATE consolidado tc SET tc.ar23 = aa23 , tc.nar23 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar23 = aa23 , tc.nar23 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 24 THEN
							IF _id_asig_n =  aa24 THEN
								UPDATE consolidado tc SET tc.ar24 = aa24 , tc.nar24 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar24 = aa24 , tc.nar24 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
						WHEN 25 THEN
							IF _id_asig_n =  aa25 THEN
								UPDATE consolidado tc SET tc.ar25 = aa25 , tc.nar25 = _final
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE consolidado tc SET tc.ar25 = aa25 , tc.nar25 = 0
								WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo;
							END IF;
							IF _final >0 AND _final <= _desde THEN
								SET x_cant_asig_perdidas = x_cant_asig_perdidas + 1;
							END IF;
							SET done = 0;
					ELSE
						SET done = 0;
					END CASE;
				END WHILE;
			END IF;
		UNTIL done END REPEAT;
		IF _suma > 0 THEN
			SET _suma = ROUND(_suma/x_count,2);
		END IF;
		UPDATE consolidado cn SET cn.prom = _suma, cn.t = x_cant_asig_perdidas
							WHERE cn.id_matric = _id_matric AND cn.periodo = _periodo;
		CLOSE cur3;
	ELSE
		SET done = 1;
	END CASE;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_consolidado_docentes
DROP PROCEDURE IF EXISTS `sp_consolidado_docentes`;
DELIMITER //
CREATE PROCEDURE `sp_consolidado_docentes`(IN `_id_matric` INT(20), IN `_periodo` VARCHAR(1), IN `_id_docente` INT(20))
BEGIN
	DECLARE 	done,
				_id_inst,
				_año,
				_id_asig,
				x_count,
				x_count_2,
				_id_asig_n,
				x_id_matric,
				x_count_all INT DEFAULT 0;
	DECLARE aa1,aa2,aa3,aa4,aa5,aa6,aa7,aa8,aa9,aa10,aa11,
							aa12,aa13,aa14,aa15,aa16,aa17,aa18,aa19,aa20,
							aa21,aa22,aa23,aa24,aa25,x_count_matcurso INT DEFAULT 0;
	DECLARE	_final,
				_suma DECIMAL(6,2) DEFAULT 0;
	DECLARE 	_cod_grado,
				_grupo VARCHAR(2) DEFAULT '';
	DECLARE 	oStrimValue,
				sValue,
				yValue CHAR DEFAULT '';
	DECLARE cur_matcurso CURSOR FOR SELECT tm.id_asig FROM matcurso AS tm
				JOIN asignaturas AS ta ON tm.id_asig = ta.id
				WHERE tm.año = _año AND tm.cod_grado = _cod_grado AND tm.id_inst = _id_inst
				AND ta.año = _año AND ta.id_inst = _id_inst
			   GROUP BY tm.id_asig, tm.año, tm.cod_grado,tm.id_inst
			   ORDER BY ta.cod_area,tm.id_asig;
	DECLARE cur1 CURSOR FOR SELECT tn.id_asig, if(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final) AS final
				FROM nscp001 AS tn
				JOIN matriculas AS tm ON tn.id_matric = tm.id_matric
				JOIN asignaturas AS ta ON tn.id_asig = ta.id
				WHERE tn.periodo = _periodo AND tm.estado='2' AND tm.id_matric = _id_matric
				AND ta.`año` = `_año`  AND ta.id_inst = _id_inst AND tn.id_docente = _id_docente
				ORDER BY ta.cod_area,tn.id_asig;
	DECLARE cur2 CURSOR FOR SELECT tn.id_asig, if(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final) AS final
				FROM nscp002 AS tn
				JOIN matriculas AS tm ON tn.id_matric = tm.id_matric
				JOIN asignaturas AS ta ON tn.id_asig = ta.id
				WHERE tn.periodo = _periodo AND tm.estado='2' AND tm.id_matric = _id_matric
				AND ta.`año` = `_año`  AND ta.id_inst = _id_inst AND tn.id_docente = _id_docente
				ORDER BY ta.cod_area,tn.id_asig;
	DECLARE cur3 CURSOR FOR SELECT tn.id_asig, if(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final) AS final
				FROM nscp003 AS tn
				JOIN matriculas AS tm ON tn.id_matric = tm.id_matric
				JOIN asignaturas AS ta ON tn.id_asig = ta.id
				WHERE tn.periodo = _periodo AND tm.estado='2' AND tm.id_matric = _id_matric
				AND ta.`año` = `_año`  AND ta.id_inst = _id_inst  AND tn.id_docente = _id_docente
				ORDER BY ta.cod_area,tn.id_asig;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	SELECT tm.id_inst,tm.cod_grado,tm.grupo,tm.`año` INTO _id_inst,_cod_grado,_grupo,`_año`
	 FROM matriculas AS tm WHERE tm.id_matric = _id_matric;
	OPEN cur_matcurso;

	REPEAT
	FETCH cur_matcurso INTO _id_asig;
		IF NOT done THEN
		 SET x_count = x_count + 1;
			CASE x_count
				WHEN 1 THEN
					SET aa1 = _id_asig;
				WHEN 2 THEN
					SET aa2 = _id_asig;
				WHEN 3 THEN
					SET aa3 = _id_asig;
				WHEN 4 THEN
					SET aa4 = _id_asig;
				WHEN 5 THEN
					SET aa5 = _id_asig;
				WHEN 6 THEN
					SET aa6 = _id_asig;
				WHEN 7 THEN
					SET aa7 = _id_asig;
				WHEN 8 THEN
					SET aa8 = _id_asig;
				WHEN 9 THEN
					SET aa9 = _id_asig;
				WHEN 10 THEN
					SET aa10 = _id_asig;
				WHEN 11 THEN
					SET aa11 = _id_asig;
				WHEN 12 THEN
					SET aa12 = _id_asig;
				WHEN 13 THEN
					SET aa13 = _id_asig;
				WHEN 14 THEN
					SET aa14 = _id_asig;
				WHEN 15 THEN
					SET aa15 = _id_asig;
				WHEN 16 THEN
					SET aa16 = _id_asig;
				WHEN 17 THEN
					SET aa17 = _id_asig;
				WHEN 18 THEN
					SET aa18 = _id_asig;
				WHEN 19 THEN
					SET aa19 = _id_asig;
				WHEN 20 THEN
					SET aa20 = _id_asig;
				WHEN 21 THEN
					SET aa21 = _id_asig;
				WHEN 22 THEN
					SET aa22 = _id_asig;
				WHEN 23 THEN
					SET aa23 = _id_asig;
				WHEN 24 THEN
					SET aa24 = _id_asig;
				WHEN 25 THEN
					SET aa25 = _id_asig;
				ELSE
					SET done = 1;
			END CASE;
		END IF;
	UNTIL done END REPEAT;
	CLOSE cur_matcurso;

	SELECT COUNT(*) INTO x_count_all FROM cursos tc WHERE tc.id_docente = _id_docente AND tc.cod_grado = _cod_grado;

	IF x_count_all >0 THEN
		SELECT id_matric INTO x_id_matric FROM consolidado_docentes
			WHERE id_matric = _id_matric AND periodo = _periodo AND id_docente = _id_docente;

		IF NOT x_id_matric THEN
			INSERT INTO  consolidado_docentes (id_matric,periodo,id_docente) VALUES (_id_matric,_periodo,_id_docente);
		ELSE
			UPDATE consolidado_docentes SET nar1 = 0, nar2 = 0,nar3 = 0,nar4 = 0,nar5 = 0,nar6 = 0,nar7 = 0,nar8 = 0,nar9 = 0,nar10 = 0,
			nar11 = 0, nar12 = 0,nar13 = 0,nar14 = 0,nar15 = 0,nar16 = 0,nar17 = 0,nar18 = 0,nar19 = 0,nar20 = 0,
			nar21 = 0, nar22 = 0,nar23 = 0,nar24 = 0,nar25 = 0,
			ar1 = 0, ar2 = 0,ar3 = 0,ar4 = 0,ar5 = 0,ar6 = 0,ar7 = 0,ar8 = 0,ar9 = 0,ar10 = 0,
			ar11 = 0, ar12 = 0,ar13 = 0,ar14 = 0,ar15 = 0,ar16 = 0,ar17 = 0,ar18 = 0,ar19 = 0,ar20 = 0,
			ar21 = 0, ar22 = 0,ar23 = 0,ar24 = 0,ar25 = 0
			 WHERE id_matric = _id_matric  AND  periodo = _periodo AND id_docente = _id_docente ;
		END IF;
		SET done = 0;
		SET x_count = 0;
		CASE
			WHEN _cod_grado >= '01' AND _cod_grado <= '05' THEN
				OPEN cur1;
				REPEAT
				FETCH cur1 INTO _id_asig_n,_final;
				IF NOT done THEN
					SET x_count = x_count + 1;
					SET x_count_matcurso = 25;
					SET _suma	= _suma + _final;
					WHILE x_count_matcurso > 0 DO
						SET x_count_matcurso = x_count_matcurso - 1;
						SET x_count_2 = x_count_2 + 1 ;
						CASE x_count_2
							WHEN 1 THEN
								IF _id_asig_n =  aa1 THEN
									UPDATE consolidado_docentes tc SET tc.ar1 = aa1 , tc.nar1 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar1 = aa1 , tc.nar1 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 2 THEN
								IF _id_asig_n =  aa2 THEN
									UPDATE consolidado_docentes tc SET tc.ar2 = aa2 , tc.nar2 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar2 = aa2 , tc.nar2 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 3 THEN
								IF _id_asig_n =  aa3 THEN
									UPDATE consolidado_docentes tc SET tc.ar3 = aa3 , tc.nar3 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar3 = aa3 , tc.nar3 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 4 THEN
								IF _id_asig_n =  aa4 THEN
									UPDATE consolidado_docentes tc SET tc.ar4 = aa4 , tc.nar4 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar4 = aa4 , tc.nar4 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 5 THEN
								IF _id_asig_n =  aa5 THEN
									UPDATE consolidado_docentes tc SET tc.ar5 = aa5 , tc.nar5 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar5 = aa5 , tc.nar5 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 6 THEN
								IF _id_asig_n =  aa6 THEN
									UPDATE consolidado_docentes tc SET tc.ar6 = aa6 , tc.nar6 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar6 = aa6 , tc.nar6 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 7 THEN
								IF _id_asig_n =  aa7 THEN
									UPDATE consolidado_docentes tc SET tc.ar7 = aa7 , tc.nar7 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar7 = aa7 , tc.nar7 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 8 THEN
								IF _id_asig_n =  aa8 THEN
									UPDATE consolidado_docentes tc SET tc.ar8 = aa8 , tc.nar8 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar8 = aa8 , tc.nar8 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 9 THEN
								IF _id_asig_n =  aa9 THEN
									UPDATE consolidado_docentes tc SET tc.ar9 = aa9 , tc.nar9 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar9 = aa9 , tc.nar9 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 10 THEN
								IF _id_asig_n =  aa10 THEN
									UPDATE consolidado_docentes tc SET tc.ar10 = aa10 , tc.nar10 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar10 = aa10 , tc.nar10 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 11 THEN
								IF _id_asig_n =  aa11 THEN
									UPDATE consolidado_docentes tc SET tc.ar11 = aa11 , tc.nar11 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar11 = aa11 , tc.nar11 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 12 THEN
								IF _id_asig_n =  aa12 THEN
									UPDATE consolidado_docentes tc SET tc.ar12 = aa12 , tc.nar12 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar12 = aa12 , tc.nar12 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 13 THEN
								IF _id_asig_n =  aa13 THEN
									UPDATE consolidado_docentes tc SET tc.ar13 = aa13 , tc.nar13 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar13 = aa13 , tc.nar13 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 14 THEN
								IF _id_asig_n =  aa14 THEN
									UPDATE consolidado_docentes tc SET tc.ar14 = aa14 , tc.nar14 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar14 = aa14 , tc.nar14 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 15 THEN
								IF _id_asig_n =  aa15 THEN
									UPDATE consolidado_docentes tc SET tc.ar15 = aa15 , tc.nar15 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar15 = aa15 , tc.nar15 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 16 THEN
								IF _id_asig_n =  aa16 THEN
									UPDATE consolidado_docentes tc SET tc.ar16 = aa16 , tc.nar16 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar16 = aa16 , tc.nar16 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 17 THEN
								IF _id_asig_n =  aa17 THEN
									UPDATE consolidado_docentes tc SET tc.ar17 = aa17 , tc.nar17 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar17 = aa17 , tc.nar17 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 18 THEN
								IF _id_asig_n =  aa18 THEN
									UPDATE consolidado_docentes tc SET tc.ar18 = aa18 , tc.nar18 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar18 = aa18 , tc.nar18 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 19 THEN
								IF _id_asig_n =  aa19 THEN
									UPDATE consolidado_docentes tc SET tc.ar19 = aa19 , tc.nar19 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar19 = aa19 , tc.nar19 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 20 THEN
								IF _id_asig_n =  aa20 THEN
									UPDATE consolidado_docentes tc SET tc.ar20 = aa20 , tc.nar20 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar20 = aa20 , tc.nar20 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 21 THEN
								IF _id_asig_n =  aa21 THEN
									UPDATE consolidado_docentes tc SET tc.ar21 = aa21 , tc.nar21 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar21 = aa21 , tc.nar21 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 22 THEN
								IF _id_asig_n =  aa22 THEN
									UPDATE consolidado_docentes tc SET tc.ar22 = aa22 , tc.nar22 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar22 = aa22 , tc.nar22 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 23 THEN
								IF _id_asig_n =  aa23 THEN
									UPDATE consolidado_docentes tc SET tc.ar23 = aa23 , tc.nar23 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar23 = aa23 , tc.nar23 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 24 THEN
								IF _id_asig_n =  aa24 THEN
									UPDATE consolidado_docentes tc SET tc.ar24 = aa24 , tc.nar24 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar24 = aa24 , tc.nar24 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 25 THEN
								IF _id_asig_n =  aa25 THEN
									UPDATE consolidado_docentes tc SET tc.ar25 = aa25 , tc.nar25 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar25 = aa25 , tc.nar25 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
						ELSE
							SET done = 0;
						END CASE;
					END WHILE;
				END IF;
			UNTIL done END REPEAT;
			IF _suma > 0 THEN
				SET _suma = ROUND(_suma/x_count,2);
			END IF;
			UPDATE consolidado_docentes cn SET cn.prom = _suma
								WHERE cn.id_matric = _id_matric AND cn.periodo = _periodo;
			CLOSE cur1;
		WHEN _cod_grado >= '06' AND _cod_grado <= '09' THEN
				OPEN cur2;
				REPEAT
				FETCH cur2 INTO _id_asig_n,_final;
				IF NOT done THEN
					SET x_count = x_count + 1;
					SET x_count_matcurso = 25;
					SET _suma	= _suma + _final;
					WHILE x_count_matcurso > 0 DO
						SET x_count_matcurso = x_count_matcurso - 1;
						SET x_count_2 = x_count_2 + 1 ;
						CASE x_count_2
							WHEN 1 THEN
								IF _id_asig_n =  aa1 THEN
									UPDATE consolidado_docentes tc SET tc.ar1 = aa1 , tc.nar1 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar1 = aa1 , tc.nar1 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 2 THEN
								IF _id_asig_n =  aa2 THEN
									UPDATE consolidado_docentes tc SET tc.ar2 = aa2 , tc.nar2 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar2 = aa2 , tc.nar2 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 3 THEN
								IF _id_asig_n =  aa3 THEN
									UPDATE consolidado_docentes tc SET tc.ar3 = aa3 , tc.nar3 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar3 = aa3 , tc.nar3 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 4 THEN
								IF _id_asig_n =  aa4 THEN
									UPDATE consolidado_docentes tc SET tc.ar4 = aa4 , tc.nar4 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar4 = aa4 , tc.nar4 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 5 THEN
								IF _id_asig_n =  aa5 THEN
									UPDATE consolidado_docentes tc SET tc.ar5 = aa5 , tc.nar5 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar5 = aa5 , tc.nar5 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 6 THEN
								IF _id_asig_n =  aa6 THEN
									UPDATE consolidado_docentes tc SET tc.ar6 = aa6 , tc.nar6 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar6 = aa6 , tc.nar6 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 7 THEN
								IF _id_asig_n =  aa7 THEN
									UPDATE consolidado_docentes tc SET tc.ar7 = aa7 , tc.nar7 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar7 = aa7 , tc.nar7 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 8 THEN
								IF _id_asig_n =  aa8 THEN
									UPDATE consolidado_docentes tc SET tc.ar8 = aa8 , tc.nar8 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar8 = aa8 , tc.nar8 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 9 THEN
								IF _id_asig_n =  aa9 THEN
									UPDATE consolidado_docentes tc SET tc.ar9 = aa9 , tc.nar9 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar9 = aa9 , tc.nar9 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 10 THEN
								IF _id_asig_n =  aa10 THEN
									UPDATE consolidado_docentes tc SET tc.ar10 = aa10 , tc.nar10 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar10 = aa10 , tc.nar10 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 11 THEN
								IF _id_asig_n =  aa11 THEN
									UPDATE consolidado_docentes tc SET tc.ar11 = aa11 , tc.nar11 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar11 = aa11 , tc.nar11 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 12 THEN
								IF _id_asig_n =  aa12 THEN
									UPDATE consolidado_docentes tc SET tc.ar12 = aa12 , tc.nar12 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar12 = aa12 , tc.nar12 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 13 THEN
								IF _id_asig_n =  aa13 THEN
									UPDATE consolidado_docentes tc SET tc.ar13 = aa13 , tc.nar13 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar13 = aa13 , tc.nar13 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 14 THEN
								IF _id_asig_n =  aa14 THEN
									UPDATE consolidado_docentes tc SET tc.ar14 = aa14 , tc.nar14 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar14 = aa14 , tc.nar14 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 15 THEN
								IF _id_asig_n =  aa15 THEN
									UPDATE consolidado_docentes tc SET tc.ar15 = aa15 , tc.nar15 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar15 = aa15 , tc.nar15 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 16 THEN
								IF _id_asig_n =  aa16 THEN
									UPDATE consolidado_docentes tc SET tc.ar16 = aa16 , tc.nar16 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar16 = aa16 , tc.nar16 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 17 THEN
								IF _id_asig_n =  aa17 THEN
									UPDATE consolidado_docentes tc SET tc.ar17 = aa17 , tc.nar17 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar17 = aa17 , tc.nar17 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 18 THEN
								IF _id_asig_n =  aa18 THEN
									UPDATE consolidado_docentes tc SET tc.ar18 = aa18 , tc.nar18 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar18 = aa18 , tc.nar18 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 19 THEN
								IF _id_asig_n =  aa19 THEN
									UPDATE consolidado_docentes tc SET tc.ar19 = aa19 , tc.nar19 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar19 = aa19 , tc.nar19 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 20 THEN
								IF _id_asig_n =  aa20 THEN
									UPDATE consolidado_docentes tc SET tc.ar20 = aa20 , tc.nar20 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar20 = aa20 , tc.nar20 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 21 THEN
								IF _id_asig_n =  aa21 THEN
									UPDATE consolidado_docentes tc SET tc.ar21 = aa21 , tc.nar21 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar21 = aa21 , tc.nar21 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 22 THEN
								IF _id_asig_n =  aa22 THEN
									UPDATE consolidado_docentes tc SET tc.ar22 = aa22 , tc.nar22 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar22 = aa22 , tc.nar22 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 23 THEN
								IF _id_asig_n =  aa23 THEN
									UPDATE consolidado_docentes tc SET tc.ar23 = aa23 , tc.nar23 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar23 = aa23 , tc.nar23 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 24 THEN
								IF _id_asig_n =  aa24 THEN
									UPDATE consolidado_docentes tc SET tc.ar24 = aa24 , tc.nar24 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar24 = aa24 , tc.nar24 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 25 THEN
								IF _id_asig_n =  aa25 THEN
									UPDATE consolidado_docentes tc SET tc.ar25 = aa25 , tc.nar25 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar25 = aa25 , tc.nar25 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
						ELSE
							SET done = 0;
						END CASE;
					END WHILE;
				END IF;
			UNTIL done END REPEAT;
			IF _suma > 0 THEN
				SET _suma = ROUND(_suma/x_count,2);
			END IF;
			UPDATE consolidado_docentes cn SET cn.prom = _suma
								WHERE cn.id_matric = _id_matric AND cn.periodo = _periodo;
			CLOSE cur2;
		WHEN _cod_grado >= '10' AND _cod_grado <= '99' THEN
				OPEN cur3;
				REPEAT
				FETCH cur3 INTO _id_asig_n,_final;
				IF NOT done THEN
					SET x_count = x_count + 1;
					SET x_count_matcurso = 25;
					SET _suma	= _suma + _final;
					WHILE x_count_matcurso > 0 DO
						SET x_count_matcurso = x_count_matcurso - 1;
						SET x_count_2 = x_count_2 + 1 ;
						CASE x_count_2
							WHEN 1 THEN
								IF _id_asig_n =  aa1 THEN
									UPDATE consolidado_docentes tc SET tc.ar1 = aa1 , tc.nar1 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar1 = aa1 , tc.nar1 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 2 THEN
								IF _id_asig_n =  aa2 THEN
									UPDATE consolidado_docentes tc SET tc.ar2 = aa2 , tc.nar2 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar2 = aa2 , tc.nar2 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 3 THEN
								IF _id_asig_n =  aa3 THEN
									UPDATE consolidado_docentes tc SET tc.ar3 = aa3 , tc.nar3 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar3 = aa3 , tc.nar3 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 4 THEN
								IF _id_asig_n =  aa4 THEN
									UPDATE consolidado_docentes tc SET tc.ar4 = aa4 , tc.nar4 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar4 = aa4 , tc.nar4 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 5 THEN
								IF _id_asig_n =  aa5 THEN
									UPDATE consolidado_docentes tc SET tc.ar5 = aa5 , tc.nar5 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar5 = aa5 , tc.nar5 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 6 THEN
								IF _id_asig_n =  aa6 THEN
									UPDATE consolidado_docentes tc SET tc.ar6 = aa6 , tc.nar6 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar6 = aa6 , tc.nar6 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 7 THEN
								IF _id_asig_n =  aa7 THEN
									UPDATE consolidado_docentes tc SET tc.ar7 = aa7 , tc.nar7 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar7 = aa7 , tc.nar7 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 8 THEN
								IF _id_asig_n =  aa8 THEN
									UPDATE consolidado_docentes tc SET tc.ar8 = aa8 , tc.nar8 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar8 = aa8 , tc.nar8 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 9 THEN
								IF _id_asig_n =  aa9 THEN
									UPDATE consolidado_docentes tc SET tc.ar9 = aa9 , tc.nar9 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar9 = aa9 , tc.nar9 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 10 THEN
								IF _id_asig_n =  aa10 THEN
									UPDATE consolidado_docentes tc SET tc.ar10 = aa10 , tc.nar10 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar10 = aa10 , tc.nar10 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 11 THEN
								IF _id_asig_n =  aa11 THEN
									UPDATE consolidado_docentes tc SET tc.ar11 = aa11 , tc.nar11 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar11 = aa11 , tc.nar11 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 12 THEN
								IF _id_asig_n =  aa12 THEN
									UPDATE consolidado_docentes tc SET tc.ar12 = aa12 , tc.nar12 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar12 = aa12 , tc.nar12 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 13 THEN
								IF _id_asig_n =  aa13 THEN
									UPDATE consolidado_docentes tc SET tc.ar13 = aa13 , tc.nar13 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar13 = aa13 , tc.nar13 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 14 THEN
								IF _id_asig_n =  aa14 THEN
									UPDATE consolidado_docentes tc SET tc.ar14 = aa14 , tc.nar14 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar14 = aa14 , tc.nar14 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 15 THEN
								IF _id_asig_n =  aa15 THEN
									UPDATE consolidado_docentes tc SET tc.ar15 = aa15 , tc.nar15 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar15 = aa15 , tc.nar15 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 16 THEN
								IF _id_asig_n =  aa16 THEN
									UPDATE consolidado_docentes tc SET tc.ar16 = aa16 , tc.nar16 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar16 = aa16 , tc.nar16 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 17 THEN
								IF _id_asig_n =  aa17 THEN
									UPDATE consolidado_docentes tc SET tc.ar17 = aa17 , tc.nar17 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar17 = aa17 , tc.nar17 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 18 THEN
								IF _id_asig_n =  aa18 THEN
									UPDATE consolidado_docentes tc SET tc.ar18 = aa18 , tc.nar18 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar18 = aa18 , tc.nar18 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 19 THEN
								IF _id_asig_n =  aa19 THEN
									UPDATE consolidado_docentes tc SET tc.ar19 = aa19 , tc.nar19 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar19 = aa19 , tc.nar19 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 20 THEN
								IF _id_asig_n =  aa20 THEN
									UPDATE consolidado_docentes tc SET tc.ar20 = aa20 , tc.nar20 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar20 = aa20 , tc.nar20 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 21 THEN
								IF _id_asig_n =  aa21 THEN
									UPDATE consolidado_docentes tc SET tc.ar21 = aa21 , tc.nar21 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar21 = aa21 , tc.nar21 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 22 THEN
								IF _id_asig_n =  aa22 THEN
									UPDATE consolidado_docentes tc SET tc.ar22 = aa22 , tc.nar22 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar22 = aa22 , tc.nar22 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 23 THEN
								IF _id_asig_n =  aa23 THEN
									UPDATE consolidado_docentes tc SET tc.ar23 = aa23 , tc.nar23 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar23 = aa23 , tc.nar23 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 24 THEN
								IF _id_asig_n =  aa24 THEN
									UPDATE consolidado_docentes tc SET tc.ar24 = aa24 , tc.nar24 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar24 = aa24 , tc.nar24 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
							WHEN 25 THEN
								IF _id_asig_n =  aa25 THEN
									UPDATE consolidado_docentes tc SET tc.ar25 = aa25 , tc.nar25 = _final
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
									SET x_count_matcurso = -1;
								ELSE
									UPDATE consolidado_docentes tc SET tc.ar25 = aa25 , tc.nar25 = 0
									WHERE tc.id_matric = _id_matric AND tc.periodo = _periodo AND tc.id_docente = _id_docente;
								END IF;
								SET done = 0;
						ELSE
							SET done = 0;
						END CASE;
					END WHILE;
				END IF;
			UNTIL done END REPEAT;
			IF _suma > 0 THEN
				SET _suma = ROUND(_suma/x_count,2);
			END IF;
			UPDATE consolidado_docentes cn SET cn.prom = _suma
								WHERE cn.id_matric = _id_matric AND cn.periodo = _periodo;
			CLOSE cur3;
		ELSE
			SET done = 1;
		END CASE;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_cons_estudio
DROP PROCEDURE IF EXISTS `sp_cons_estudio`;
DELIMITER //
CREATE PROCEDURE `sp_cons_estudio`(
	IN `_year` YEAR,
	IN `_enrrol` INT(30),
	IN `_type` INT(1)
)
BEGIN
	SELECT fn_cons_estudio(_year,_enrrol, _type);
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_conv_select_acciones_est
DROP PROCEDURE IF EXISTS `sp_conv_select_acciones_est`;
DELIMITER //
CREATE PROCEDURE `sp_conv_select_acciones_est`(IN `_id_inst` INT(20), IN `_año` YEAR, IN `_id` INT(30))
BEGIN
	SELECT tm.id_inst,tm.grupo,tm.id_jorn,tm.cod_grado,t1.personas_involucradas,t1.testigos,t1.personas_afectadas,t1.compromiso,
		t1.tratamiento_peg,t1.firma_ivolucrados,t1.obs_accion,t1.fecha_registro,t1.`año`,t2.observacion,
		t2.fecha_registro AS fecha_situacion, t3.descripcion AS situacion, t4.descripcion AS tipo_situacion,
		CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2))  AS estudiante,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2))  AS docente,
		CONCAT(RTRIM(ta.apellido1),' ',RTRIM(ta.apellido2),' ',RTRIM(ta.nombre1),' ',RTRIM(ta.nombre2))  AS admin,
		CONCAT(RTRIM(ta.apellido1),' ',RTRIM(ta.apellido2),' ',RTRIM(ta.nombre1),' ',RTRIM(ta.nombre2))  AS psicoorientador,
		RTRIM(tg.grado) AS grado, RTRIM(tj.JORNADA) AS jornada, RTRIM(ts.NOM_SEDE) AS sede,
		RTRIM(tac.nombre) AS accion
 		FROM conv_reg_acciones_est t1
		JOIN conv_reg_situaciones_est t2 ON t1.id_res_sit_est = t2.id
		JOIN conv_situaciones t3 ON t2.id_situacion = t3.id
		JOIN conv_tipo_situaciones t4 ON t3.id_tipo = t4.id
		JOIN administrativos ta ON (t2.id_admin = ta.id AND t1.id_admin = ta.id)
		JOIN docentes td ON t2.id_docente = td.id_docente
		JOIN matriculas tm ON t2.id_matric = tm.id_matric
		JOIN inscripciones ti ON tm.cod_est = ti.cod_est
		JOIN grados tg ON tm.cod_grado = tg.COD_GRADO
		JOIN jornadas tj ON tm.id_jorn = tj.COD_JORN
		JOIN sedes ts ON tm.id_sede = ts.ID
		JOIN conv_acciones tac ON t1.id_accion = tac.id
		WHERE t1.id = _id AND t1.`año` = `_año` AND t2.`año` = `_año` AND t4.id_inst = _id_inst
		AND t3.id_inst = _id_inst AND t3.`año` = `_año` AND ta.id_inst = _id_inst AND td.`año` = `_año`
		AND td.id_inst = _id_inst AND tm.id_inst = _id_inst AND tm.`año` = `_año` AND ts.ID_INST = _id_inst
		AND tac.id_inst = _id_inst;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_conv_select_control_seguimiento_est_situacion
DROP PROCEDURE IF EXISTS `sp_conv_select_control_seguimiento_est_situacion`;
DELIMITER //
CREATE PROCEDURE `sp_conv_select_control_seguimiento_est_situacion`(IN `_id_matric` INT(30), IN `_id_situacion` INT(30), IN `_id_inst` INT(30), IN `_año` YEAR)
BEGIN
	SELECT t1.id, CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) estudiante,
	RTRIM(tg.grado) grado, tm.grupo, RTRIM(tj.JORNADA) jornada, RTRIM(ts.NOM_SEDE) sede,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) docente,
	CONCAT(RTRIM(tad.apellido1),' ',RTRIM(tad.apellido2),' ',RTRIM(tad.nombre1),' ',RTRIM(tad.nombre2)) coordinador,
	t1.observacion, t1.fecha_registro,t1.`año`, t2.descripcion situacion, t3.descripcion tipo
	FROM inscripciones AS ti
	JOIN matriculas AS tm ON tm.cod_est = ti.cod_est
	JOIN conv_reg_situaciones_est AS t1 ON t1.id_matric = tm.id_matric
	JOIN grados AS tg ON tm.cod_grado =  tg.COD_GRADO
	JOIN sedes AS ts ON tm.id_sede = ts.ID
	JOIN jornadas AS tj ON tm.id_jorn = tj.COD_JORN
	JOIN docentes AS td ON t1.id_docente = td.id_docente
	JOIN administrativos AS tad ON t1.id_admin = tad.id
	JOIN conv_situaciones AS t2 ON t1.id_situacion = t2.id
	JOIN conv_tipo_situaciones AS t3 ON t2.id_tipo = t3.id
	WHERE ti.id_inst = _id_inst AND tm.id_matric = _id_matric AND ts.ID_INST = _id_inst
	AND td.id_inst = _id_inst AND td.`año` = `_año` AND tad.id_inst = _id_inst AND t1.id_matric = _id_matric
	AND t1.id = _id_situacion AND t2.id_inst = _id_inst AND t2.`año` = `_año` AND t3.id_inst = _id_inst;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_courses_live_classes
DROP PROCEDURE IF EXISTS `sp_courses_live_classes`;
DELIMITER //
CREATE PROCEDURE `sp_courses_live_classes`(
	IN `PTeacher` BIGINT,
	IN `PYear` YEAR,
	IN `PId` BIGINT,
	IN `PType` INT
)
BEGIN
	IF PType = 1 THEN
		SELECT tm.id,tm.id_grado, UPPER(tg.grado) AS grado, tm.grupo, tm.id_asig ,
		TRIM(ta.asignatura) AS asignatura, tm.id_sede, TRIM(ts.headquarters_name) AS sede , tm.id_jorn,
		TRIM(tj.jornada) AS jornada, tm.id_docente, tm.year, tmc.proc1, tmc.proc2, tmc.proc3,
		tmc.proc4, tg.id_nivel
		FROM cursos AS tm
		JOIN grados AS  tg ON tm.id_grado = tg.id
		JOIN asignaturas AS  ta ON tm.id_asig = ta.id_pk
		JOIN sedes AS ts ON tm.id_sede = ts.ID
		JOIN jornadas as tj ON tm.id_jorn = tj.cod_jorn
		JOIN matcurso AS tmc ON (tmc.id_asig = tm.id_asig AND tmc.id_grado = tm.id_grado
		AND tmc.year = tm.year)
		WHERE tm.id_docente = PTeacher AND tm.year = PYear  AND tm.estado = 1 AND NOT
		EXISTS(
			SELECT * FROM tl_course_live_classes a WHERE a.course_id = tm.id AND
			a.class_id	= PId
		)
	   ORDER BY tm.id_grado, tm.id_asig, tm.grupo;
	ELSE
		SELECT a.id, a.course_id, a.class_id,tm.id_grado, UPPER(tg.grado) AS grado, tm.grupo, tm.id_asig ,
		TRIM(ta.asignatura) AS asignatura, tm.id_sede, TRIM(ts.headquarters_name) AS sede , tm.id_jorn,
		TRIM(tj.jornada) AS jornada, tm.id_docente, tm.year, tmc.proc1, tmc.proc2, tmc.proc3,
		tmc.proc4, tg.id_nivel
		FROM tl_course_live_classes AS a
		JOIN cursos AS tm ON a.course_id = tm.id
		JOIN grados AS  tg ON tm.id_grado = tg.id
		JOIN asignaturas AS  ta ON tm.id_asig = ta.id_pk
		JOIN sedes AS ts ON tm.id_sede = ts.ID
		JOIN jornadas as tj ON tm.id_jorn = tj.cod_jorn
		JOIN matcurso AS tmc ON (tmc.id_asig = tm.id_asig AND tmc.id_grado = tm.id_grado
		AND tmc.year = tm.year)
		WHERE tm.id_docente = PTeacher AND a.class_id = PId AND tm.year = PYear  AND tm.estado = 1 AND
		EXISTS(
			SELECT * FROM tl_course_live_classes a WHERE a.course_id = tm.id AND
			a.class_id	= PId
		)
	   ORDER BY tm.id_grado, tm.id_asig, tm.grupo;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_criterios_obs_m3
DROP PROCEDURE IF EXISTS `sp_criterios_obs_m3`;
DELIMITER //
CREATE PROCEDURE `sp_criterios_obs_m3`(
	IN `PObserv` INT(20),
	IN `PTeacher` INT(20),
	IN `PYear` YEAR
)
BEGIN
	INSERT INTO obs_items_modelo_3 (id_observador,id_docente,id_item_criterio)
	SELECT PObserv, PTeacher, a.id FROM obs_criterios a
	WHERE a.estado = 1 AND NOT EXISTS(
		SELECT * FROM obs_items_modelo_3 AS b WHERE b.id_item_criterio = a.id
		AND b.id_observador = PObserv
	);
	SELECT ti.*, tc.descripcion AS criterio, tp.descripcion AS aspecto
	FROM obs_items_modelo_3 ti
	JOIN obs_criterios tc ON ti.id_item_criterio = tc.id
	JOIN obs_items_modelos tp ON tc.id_item_modelo = tp.id
	WHERE ti.id_observador = PObserv AND
	tc.estado = 1 AND tp.year = PYear AND tp.estado = 1
	ORDER BY tp.descripcion, tc.descripcion;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_desempeño
DROP PROCEDURE IF EXISTS `sp_desempeño`;
DELIMITER //
CREATE PROCEDURE `sp_desempeño`(
	IN `PYear` YEAR,
	IN `PNote` DECIMAL(6,2),
	IN `PGrade` INT
)
BEGIN
	SELECT `fn_Getdesempeño`(PYear, PNote, PGrade) AS desempeño;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_desempeños
DROP PROCEDURE IF EXISTS `sp_desempeños`;
DELIMITER //
CREATE PROCEDURE `sp_desempeños`(IN `_id_inst` INT(20), IN `_año` INT(4))
BEGIN
	select * from desempeños where año=_año and id_inst=_id_inst;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_estadistica_grupo
DROP PROCEDURE IF EXISTS `sp_estadistica_grupo`;
DELIMITER //
CREATE PROCEDURE `sp_estadistica_grupo`(
	IN `_year` YEAR,
	IN `_type` INT(1),
	IN `_per` VARCHAR(1)
)
BEGIN
	DECLARE _table VARCHAR(250) DEFAULT '';
	CASE
		WHEN _type = 2 THEN /*BÁSICA PRIMARIA*/
			SET @sqlsele = CONCAT("DELETE FROM estadistica_grupo  WHERE cod_grado BETWEEN 5 AND 9
			AND `year` = ",`_year`);
			SELECT fn_return_table_notas(5) INTO _table;
		WHEN _type = 3 THEN /*BÁSICA SECUNDARIA*/
			SET @sqlsele = CONCAT("DELETE FROM estadistica_grupo  WHERE cod_grado BETWEEN 10 AND 13
			AND `year` = ",`_year`);
			SELECT fn_return_table_notas(10) INTO _table;
		ELSE	/* MEDIA y más */
			SET @sqlsele = CONCAT("DELETE FROM estadistica_grupo  WHERE cod_grado > 13
			AND `year` = ",`_year`);
			SELECT fn_return_table_notas(14) INTO _table;
		END CASE;
	IF _per <> '0' THEN
		SET @sqlsele = CONCAT(@sqlsele," AND periodo='",_per,"'");
	END IF;
	PREPARE smtp FROM @sqlsele;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
	IF _per <> '0' THEN
		SET @sqlsele	= CONCAT("INSERT INTO estadistica_grupo(id_sede,cod_grado,grupo,total,id_desempeño,periodo,year,id_matric)
				(SELECT tm.id_headquarters,tg.id,tm.id_group, COUNT(tc.id_asig) AS tas,
					te.id, tn.periodo,tm.year, tm.id
					FROM ",_table," AS tn
					JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.`year` = tc.`year`)
					JOIN student_enrollment AS tm ON tn.id_matric = tm.id
					JOIN escala_nacional AS te ON tn.id_escala = te.id
					JOIN grados AS tg ON tm.id_grade = tg.id
					WHERE tn.id_matric = tm.id AND tn.id_curso = tc.id
					AND tn.final > 0   AND tn.periodo = ",_per,"
					AND tn.`year` = ",`_year`," AND tc.`year` = ",`_year`," AND tm.year= ",`_year`,"
					AND tm.id_state = 2 AND tm.id_grade = tg.id AND tn.id_escala = te.id
					AND tg.id_nivel = ",_type,"
					GROUP BY tm.id_headquarters,tn.id_matric,tm.id_grade,tm.id_group, tn.periodo, tn.id_escala
					ORDER BY tm.year,tm.id_headquarters,tg.cod_grado,tm.id_group,tn.periodo,tn.id_escala,tas)");
	ELSE
		SET @sqlsele	= CONCAT("INSERT INTO estadistica_grupo(id_sede,cod_grado,grupo,total,id_desempeño,periodo,year,id_matric)
				(SELECT tm.id_headquarters,tg.id,tm.id_group, COUNT(tc.id_asig) AS tas,
					te.id, tn.periodo,tm.year, tm.id
					FROM ",_table," AS tn
					JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.`year` = tc.`year`)
					JOIN student_enrollment AS tm ON tn.id_matric = tm.id
					JOIN escala_nacional AS te ON tn.id_escala = te.id
					JOIN grados AS tg ON tm.id_grade = tg.id
					WHERE tn.id_matric = tm.id AND tn.id_curso = tc.id
					AND tn.final > 0  AND tn.`year` = ",`_year`," AND tc.`year` = ",`_year`," AND
					tm.year= ",`_year`," AND tm.id_state = 2 AND tm.id_grade = tg.id AND tn.id_escala = te.id
					AND tg.id_nivel = ",_type,"
					GROUP BY tm.id_headquarters,tn.id_matric,tm.id_grade,tm.id_group, tn.periodo, tn.id_escala
					ORDER BY tm.year,tm.id_headquarters,tg.cod_grado,tm.id_group,tn.periodo,tn.id_escala,tas)");
	END IF;
	PREPARE smtp FROM @sqlsele;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_estadistica_select_grado
DROP PROCEDURE IF EXISTS `sp_estadistica_select_grado`;
DELIMITER //
CREATE PROCEDURE `sp_estadistica_select_grado`(
	IN `_year` YEAR,
	IN `_type` INT(1),
	IN `_periodo` VARCHAR(1),
	IN `_report` INT(1)
)
BEGIN
	DECLARE _BETWEEN, _PER VARCHAR(250) DEFAULT '';
	IF  _periodo = '0' THEN
		SET _PER			= "";
	ELSE
		SET _PER			= CONCAT(" AND te.periodo = '",_periodo,"'");
	END IF;
	CASE
		WHEN _type = 2 THEN
			SET _BETWEEN	= " BETWEEN 5 AND 9 ";
		WHEN _type = 3 THEN
			SET _BETWEEN	= " BETWEEN 10 AND 13 ";
		ELSE
			SET _BETWEEN	= " > 13 ";
	END CASE;
	IF _report = 1 THEN
		SET @sqlselect = CONCAT("SELECT te.cod_grado,te.total, COUNT(te.total) AS totals,
				te.`id_desempeño`, te.periodo, te.`year`, tg.grado, td.nombre_escala desempeño,
				(SELECT COUNT(tm.id) FROM student_enrollment AS tm,
				inscripciones AS ti  WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
				 tm.id_student = ti.id AND tm.id_grade = te.cod_grado
				GROUP BY  tm.`year`,tm.id_grade) AS total_niños,
				ROUND((COUNT(te.total)*100)/(SELECT COUNT(tm.id) FROM student_enrollment AS tm,
				inscripciones AS ti  WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
				 tm.id_student = ti.id AND tm.id_grade = te.cod_grado
				GROUP BY  tm.`year`,tm.id_grade),2) AS porciento
				FROM estadistica_grupo te
				JOIN grados AS tg ON te.cod_grado = tg.id
				JOIN escala_nacional  AS td ON te.id_desempeño = td.id
				JOIN sedes AS ts ON te.id_sede = ts.id
				WHERE  te.year = ",`_year`,_PER," AND
				 te.cod_grado ",_BETWEEN,"
				GROUP BY te.cod_grado,te.total, te.id_desempeño, te.periodo, te.`year`
				ORDER BY te.periodo,te.cod_grado,te.id_desempeño,te.total;");
	ELSE
		SET @sqlselect = CONCAT("SELECT te.cod_grado,te.total, COUNT(te.total) AS totals,
				te.`id_desempeño`, te.periodo, te.`year`, tg.grado, td.nombre_escala desempeño,
				(SELECT COUNT(tm.id) FROM student_enrollment AS tm,
				inscripciones AS ti  WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
				 tm.id_student = ti.id AND tm.id_grade = te.cod_grado
				GROUP BY  tm.`year`,tm.id_grade) AS total_niños,
				ROUND((COUNT(te.total)*100)/(SELECT COUNT(tm.id) FROM student_enrollment AS tm,
				inscripciones AS ti  WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
				 tm.id_student = ti.id AND tm.id_grade = te.cod_grado
				GROUP BY  tm.`year`,tm.id_grade),2) AS porciento
				FROM estadistica_grupo AS te
				JOIN grados AS tg ON te.cod_grado = tg.id
				JOIN escala_nacional  AS td ON te.id_desempeño = td.id
				JOIN aux_grados_agrupados AS t1 ON t1.id_grado = tg.id
				JOIN grados_agrupados AS t2 ON t1.id_grado_agrupado = t2.id
				JOIN `desempeños` AS de ON (de.id_escala = td.id AND de.id_grado_agrupado = t2.id AND
													de.year = te.year)
				JOIN sedes AS ts ON te.id_sede = ts.id
				WHERE  te.year = ",`_year`,_PER," AND te.cod_grado ",_BETWEEN," AND de.reprueba = 1
				GROUP BY te.cod_grado,te.total, te.id_desempeño, te.periodo, te.`year`
				ORDER BY te.periodo,te.cod_grado,te.id_desempeño,te.total;");
	END IF;
	PREPARE smtp FROM @sqlselect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_estadistica_select_grado_grupo
DROP PROCEDURE IF EXISTS `sp_estadistica_select_grado_grupo`;
DELIMITER //
CREATE PROCEDURE `sp_estadistica_select_grado_grupo`(
	IN `_year` YEAR,
	IN `_type` INT(1),
	IN `_period` VARCHAR(1)
)
BEGIN
	DECLARE _BETWEEN, _PER VARCHAR(250) DEFAULT '';
	IF  _period = '0' THEN
		SET _PER			= "";
	ELSE
		SET _PER			= CONCAT(" AND te.periodo = '",_period,"'");
	END IF;
	CASE
		WHEN _type = 2 THEN
			SET _BETWEEN	= " BETWEEN 5 AND 9 ";
		WHEN _type = 3 THEN
			SET _BETWEEN	= " BETWEEN 10 AND 13 ";
		ELSE
			SET _BETWEEN	= " > 13 ";
	END CASE;
	SET @sqlselect = CONCAT("SELECT tg.cod_grado,te.grupo, COUNT(te.total) AS totals,
		te.`id_desempeño`, te.periodo, te.`year`, td.nombre_escala desempeño,
		(SELECT COUNT(tm.id) FROM student_enrollment AS tm, inscripciones AS ti
		WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
		tm.id_student = ti.id AND tm.id_grade = te.cod_grado AND tm.id_group = te.grupo
		GROUP BY  tm.`year`,tm.id_grade,tm.id_group) AS total_niños,
		ROUND((COUNT(te.total)*100)/(SELECT COUNT(tm.id) FROM student_enrollment AS tm,
		inscripciones AS ti  WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
		tm.id_student = ti.id AND tm.id_grade = te.cod_grado AND tm.id_group = te.grupo
		GROUP BY  tm.`year`,tm.id_grade,tm.id_group),2) AS porciento
		FROM estadistica_grupo te
		JOIN grados AS tg ON te.cod_grado = tg.id
		JOIN escala_nacional AS td ON te.id_desempeño = td.id
		JOIN aux_grados_agrupados AS t1 ON t1.id_grado = tg.id
		JOIN grados_agrupados AS t2 ON t1.id_grado_agrupado = t2.id
		JOIN `desempeños` AS de ON (de.id_escala = td.id AND de.id_grado_agrupado = t2.id AND
													de.year = te.year)
		JOIN sedes AS ts ON te.id_sede = ts.id
		WHERE te.year = ",`_year`,_PER," AND
		 te.cod_grado ",_BETWEEN,"
		AND de.reprueba = 1
		GROUP BY te.cod_grado,te.grupo,te.id_desempeño, te.periodo, te.`year`
		ORDER BY te.periodo,te.cod_grado,te.grupo,te.id_desempeño,te.total;");
	PREPARE smtp FROM @sqlselect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_estadistica_select_nivel_agrupado
DROP PROCEDURE IF EXISTS `sp_estadistica_select_nivel_agrupado`;
DELIMITER //
CREATE PROCEDURE `sp_estadistica_select_nivel_agrupado`(
	IN `_year` YEAR,
	IN `_type` INT(1),
	IN `_period` VARCHAR(1)
)
BEGIN
	DECLARE _BETWEEN, _PER VARCHAR(250) DEFAULT '';
	IF  _period = '0' THEN
		SET _PER			= "";
	ELSE
		SET _PER			= CONCAT(" AND te.periodo = '",_period,"'");
	END IF;
	CASE
		WHEN _type = 2 THEN
			SET _BETWEEN	= " BETWEEN 5 AND 9 ";
		WHEN _type = 3 THEN
			SET _BETWEEN	= " BETWEEN 10 AND 13 ";
		ELSE
			SET _BETWEEN	= " > 13 ";
	END CASE;
	SET @sqlselect = CONCAT("SELECT  COUNT(te.total) AS totals,
		te.`id_desempeño`, te.periodo, te.`year`, td.nombre_escala desempeño,
		(SELECT COUNT(tm.id) FROM student_enrollment AS tm, inscripciones AS te
		WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
		tm.id_student = te.id AND tm.id_grade ",_BETWEEN,"
		GROUP BY  tm.`year`) AS total_niños,
		ROUND((COUNT(te.total)*100)/(SELECT COUNT(tm.id) FROM student_enrollment AS tm,
		inscripciones AS te  WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
		tm.id_student = te.id AND tm.id_grade ",_BETWEEN,"
		GROUP BY  tm.`year`),2) AS porciento
		FROM estadistica_grupo te
		JOIN grados AS tg ON te.cod_grado = tg.id
		JOIN escala_nacional AS td ON te.id_desempeño = td.id
		JOIN sedes AS ts ON te.id_sede = ts.id
		WHERE te.year = ",`_year`,_PER," AND
		 te.cod_grado ",_BETWEEN,"
		GROUP BY te.id_desempeño, te.periodo, te.`year`
		ORDER BY te.periodo,te.id_desempeño,te.total;");
	PREPARE smtp FROM @sqlselect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_estadistica_select_nivel_agrupado_perdidos
DROP PROCEDURE IF EXISTS `sp_estadistica_select_nivel_agrupado_perdidos`;
DELIMITER //
CREATE PROCEDURE `sp_estadistica_select_nivel_agrupado_perdidos`(
	IN `_year` YEAR,
	IN `_type` INT(1),
	IN `_period` VARCHAR(2)
)
BEGIN
	DECLARE _BETWEEN, _PER VARCHAR(250) DEFAULT '';
	IF  _period = '0' THEN
		SET _PER			= "";
	ELSE
		SET _PER			= CONCAT(" AND te.periodo = '",_period,"'");
	END IF;
	CASE
		WHEN _type = 2 THEN
			SET _BETWEEN	= " BETWEEN 5 AND 9 ";
		WHEN _type = 3 THEN
			SET _BETWEEN	= " BETWEEN 10 AND 13 ";
		ELSE
			SET _BETWEEN	= " > 13 ";
	END CASE;
	SET @sqlselect = CONCAT("SELECT tg.cod_grado, COUNT(te.total) AS totals,
			te.`id_desempeño`, te.periodo, te.`year`, td.nombre_escala desempeño,
			(SELECT COUNT(tm.id) FROM student_enrollment AS tm, inscripciones AS ti
			WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
			 tm.id_grade = te.cod_grado
			GROUP BY  tm.`year`,tm.id_grade) AS total_niños,
			ROUND((COUNT(te.total)*100)/(SELECT COUNT(tm.id) FROM student_enrollment AS tm,
			inscripciones AS ti  WHERE tm.id_state=2 AND tm.`year` = ",`_year`," AND
			 tm.id_grade = te.cod_grado
			GROUP BY  tm.`year`),2) AS porciento
			FROM estadistica_grupo te
			JOIN grados AS tg ON te.cod_grado = tg.id
			JOIN escala_nacional AS td ON te.id_desempeño = td.id
			JOIN aux_grados_agrupados AS t1 ON t1.id_grado = tg.id
			JOIN grados_agrupados AS t2 ON t1.id_grado_agrupado = t2.id
			JOIN `desempeños` AS de ON (de.id_escala = td.id AND de.id_grado_agrupado = t2.id AND
												de.year = te.year)
			JOIN sedes AS ts ON te.id_sede = ts.id
			WHERE te.year = ",`_year`,_PER," AND
			 te.cod_grado ",_BETWEEN,"	AND de.reprueba = 1
			GROUP BY te.cod_grado,te.id_desempeño, te.periodo, te.`year`
			ORDER BY te.cod_grado,te.periodo,te.id_desempeño,te.total");
	PREPARE smtp FROM @sqlselect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_estadistica_select_total_grados
DROP PROCEDURE IF EXISTS `sp_estadistica_select_total_grados`;
DELIMITER //
CREATE PROCEDURE `sp_estadistica_select_total_grados`(
	IN `_year` YEAR,
	IN `_grade` VARCHAR(2),
	IN `_per` VARCHAR(1)
)
BEGIN
		SELECT te.cod_grado, COUNT(te.total) AS totals,
		te.`id_desempeño`, te.periodo, te.`year`, tg.grado, td.nombre_escala desempeño,
		(SELECT COUNT(tm.id) FROM student_enrollment AS tm, inscripciones AS te  WHERE tm.id_state=2 AND tm.`year` = `_year` AND
		 tm.id_student = te.id AND tm.id_grade = _grade
		GROUP BY tm.`year`,tm.id_grade) AS total_niños,
		ROUND((COUNT(te.total)*100)/(SELECT COUNT(tm.id)
		FROM student_enrollment AS tm, inscripciones AS te  WHERE tm.id_state=2 AND tm.`year` = `_year` AND
		tm.id_student = te.id AND tm.id_grade = _grade
		GROUP BY tm.`year`,tm.id_grade),2) AS porciento
		FROM estadistica_grupo te
		JOIN grados AS tg ON te.cod_grado = tg.id
		JOIN escala_nacional AS td ON te.id_desempeño = td.id
		JOIN sedes AS ts ON te.id_sede = ts.id
		WHERE te.year = `_year` AND te.periodo = _per AND
		 te.cod_grado = _grade
		GROUP BY te.cod_grado, te.id_desempeño, te.periodo, te.`year`
		ORDER BY te.periodo,te.cod_grado,te.id_desempeño,te.total;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_evaluacion_estudiantes_update_nota
DROP PROCEDURE IF EXISTS `sp_evaluacion_estudiantes_update_nota`;
DELIMITER //
CREATE PROCEDURE `sp_evaluacion_estudiantes_update_nota`(IN `_id_eval_comp` INT(30))
BEGIN
	DECLARE _id_curso,_auto_calificar,_id_column_nota,_id_matric,_id_asig,_id_docente INT(30) DEFAULT 0;
	DECLARE _suma, _max DECIMAL(6,2) DEFAULT 0;
	DECLARE _column_nota VARCHAR(6) DEFAULT '';
	DECLARE _cod_grado,_periodo VARCHAR(2) DEFAULT '';
	SELECT t.id_curso,t.auto_calificar,RTRIM(SUBSTR(t.column_nota,2)),t.id_column_nota,te.id_matric,t.periodo INTO
		_id_curso,_auto_calificar,_column_nota,_id_column_nota,_id_matric,_periodo FROM te_evaluaciones t
		JOIN te_evaluacion_compartida AS te ON te.id_evaluacion = t.id
		WHERE te.id = _id_eval_comp;
	IF _auto_calificar = 1 THEN
		SELECT AVG(t.punataje), MAX(t.punataje) INTO _suma,_max FROM te_evaluaciones_estudiantes t
			WHERE t.id_evaluacion_compartida = _id_eval_comp;
		SELECT t.cod_grado,t.id_asig,t.id_docente INTO _cod_grado,_id_asig,_id_docente FROM cursos t WHERE t.id = _id_curso;
		SET @_column_nota = _column_nota;
		SET @_id_column_nota	= _id_column_nota;
		IF _suma > _max THEN
			SET _suma	= _suma;
		ELSE
			SET _suma	= _max;
		END IF;
		CASE
			WHEN _cod_grado >= '01' AND _cod_grado <= '05' THEN
				SET @sqlUpdate	= CONCAT('UPDATE nscp001 SET ',_column_nota,' = ',_suma,
				' WHERE id_asig = ',_id_asig,' AND id_matric = ',_id_matric,' AND periodo = ',_periodo,' AND id_docente = ',_id_docente);
			WHEN _cod_grado >= '06' AND _cod_grado <= '09' THEN
				SET @sqlUpdate	= CONCAT('UPDATE nscp002 SET ',_column_nota,' = ',_suma,
				' WHERE id_asig = ',_id_asig,' AND id_matric = ',_id_matric,' AND periodo = ',_periodo,' AND id_docente = ',_id_docente);
			WHEN _cod_grado >= '10' AND _cod_grado <= '99' THEN
				SET @sqlUpdate	= CONCAT('UPDATE nscp003 SET ',_column_nota,' = ',_suma,
				' WHERE id_asig = ',_id_asig,' AND id_matric = ',_id_matric,' AND periodo = ',_periodo,' AND id_docente = ',_id_docente);
			ELSE
				SET @sqlUpdate	= CONCAT('UPDATE nscp001 SET ',_column_nota,' = ',_suma,
				' WHERE id_asig = ',_id_asig,' AND id_matric = ',_id_matric,' AND periodo = ',_periodo,' AND id_docente = ',_id_docente);
		END CASE;
		PREPARE stmt FROM @sqlUpdate;
		EXECUTE stmt;
		DEALLOCATE PREPARE stmt;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_evaluation_courses_students
DROP PROCEDURE IF EXISTS `sp_evaluation_courses_students`;
DELIMITER //
CREATE PROCEDURE `sp_evaluation_courses_students`(
	IN `PCourse` INT,
	IN `PEvalution` BIGINT
)
    COMMENT 'Lista de estudiantes por curso asignado a una evalucion'
BEGIN
	SELECT i.id, h.course_id, a.id_sede, a.id_grado, a.id_asig, a.id_docente, a.id_jorn, a.grupo,
	b.asignatura, c.cod_grado, c.grado, trim(d.jornada) AS jornada, trim(e.headquarters_name) sede,
	CONCAT(TRIM(g.apellido1),' ',TRIM(g.apellido2),' ',TRIM(g.nombre1),' ',TRIM(g.nombre2)) estudiante,
	h.evaluation_id, a.year
	FROM te_evaluation_courses AS h
	JOIN cursos AS a ON h.course_id = a.id
	JOIN asignaturas AS b ON a.id_asig = b.id_pk
	JOIN grados AS c ON a.id_grado = c.id
	JOIN jornadas AS d ON a.id_jorn = d.cod_jorn
	JOIN sedes AS e ON a.id_sede = e.ID
	JOIN student_enrollment AS f  ON (f.id_headquarters = a.id_sede AND f.id_study_day = a.id_jorn AND
	f.id_grade = a.id_grado AND f.id_group = a.grupo AND f.year = a.year)
	JOIN inscripciones AS g ON f.id_student = g.id
	JOIN te_shared_evaluation AS i ON (i.evaluation_id = h.id AND i.enrollment_id = f.id)
	WHERE h.evaluation_id = PEvalution AND h.course_id = PCourse AND h.course_id = a.id
	AND a.estado = 1 AND f.id_state = 2
	ORDER BY estudiante;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_familiares
DROP PROCEDURE IF EXISTS `sp_familiares`;
DELIMITER //
CREATE PROCEDURE `sp_familiares`(
	IN `_year` SMALLINT,
	IN `_grade` INT(11),
	IN `_headq` INT(30),
	IN `_type` TINYINT,
	IN `_all` TINYINT
)
BEGIN
	DECLARE _A VARCHAR(120) DEFAULT '';
	IF _all = 0 THEN
		SET _A 	= CONCAT(" AND ta.id_type = ",_type);
	END IF;
	SET @sqlselect = CONCAT("SELECT te.nro_documento AS doc_student,
	CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante,
	tg.cod_grado,tm.id_group, te.direccion ,tf.document AS doc_familie,
	CONCAT(RTRIM(tf.lastname1),' ',RTRIM(tf.lastname2),' ',RTRIM(tf.name1),' ',RTRIM(tf.name2)) AS acudiente,
	tf.address, tf.mobile, RTRIM(tg.grado) grado, RTRIM(ts.headquarters_name) sede, ft.family_type_name
	FROM inscripciones AS te
	JOIN student_enrollment AS tm ON tm.id_student = te.id
	JOIN aux_families_students AS ta ON ta.id_student = te.id
	JOIN families AS tf ON ta.id_family = tf.id
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN family_type AS ft ON ta.id_type = ft.id
	WHERE tm.id_grade = ",_grade," AND tm.id_headquarters = ",_headq,"
	AND tm.year = ",_year,_A,"
	GROUP BY ta.id_student, ta.id_type
	ORDER BY tm.id_grade,tm.id_group,ta.id_type,acudiente,estudiante");
	PREPARE smtp FROM @sqlselect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_final_book_notes
DROP PROCEDURE IF EXISTS `sp_final_book_notes`;
DELIMITER //
CREATE PROCEDURE `sp_final_book_notes`(
	IN `PEnrolledId` BIGINT,
	IN `_year` YEAR,
	IN `_grado` INT,
	IN `_grupo` VARCHAR(4),
	IN `_id_sede` BIGINT,
	IN `_jorn` INT,
	IN `_n_per_div` INT,
	IN `_n_decimales` INT,
	IN `_n_promocion` INT
)
BEGIN
	DECLARE cTable VARCHAR(30) DEFAULT '';
	SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
	SELECT fn_return_table_notas(_grado) INTO cTable;
	DELETE FROM areasf WHERE id_matric = PEnrolledId;
	CASE
		WHEN _n_promocion BETWEEN 3 AND 4 THEN /*Cuarto o quinto periodo*/
			SET @sqlSelect =CONCAT("SELECT tn.id_curso,
				ROUND(IF(tn.nota_habilitacion > 0,tn.nota_habilitacion,tn.final),",_n_decimales,")
				AS final,tn.faltas, tn.injustificadas, tn.retraso
				FROM ",cTable," as tn
				JOIN cursos AS tc ON (tn.id_curso=tc.id AND tn.year=tc.year)
				JOIN student_enrollment AS tm ON tn.id_matric = tm.id
				WHERE tc.estado = 1 AND tc.year=",_year," AND tc.id_grado=",_grado," AND tc.grupo='",_grupo,
                    "' AND tc.id_sede=",_id_sede," AND tc.id_jorn=",_jorn,
                    " AND tn.periodo = '",_n_per_div,"' AND tm.year = ",_year,
                    " AND tm.id_state = 2 AND tm.id = ",PEnrolledId,
                    " ORDER BY tm.id_group,tn.id_matric,tc.id_asig;");
		ELSE
			SET @sqlSelect =CONCAT("SELECT tn.id_curso,tc.id_asig,
				ROUND(SUM(IF(tn.nota_habilitacion > 0,tn.nota_habilitacion,tn.final))/",_n_per_div,",",_n_decimales,")
				AS final,SUM(tn.faltas) AS faltas, SUM(tn.injustificadas) AS injustificadas, SUM(tn.retraso) AS retraso
				FROM ",cTable," as tn
				JOIN cursos AS tc ON (tn.id_curso=tc.id AND tn.year=tc.year)
				JOIN student_enrollment AS tm ON tn.id_matric = tm.id
				WHERE tc.year=",_year," AND tc.id_grado=",_grado," AND tc.grupo='",_grupo,"'
				AND tc.id_sede=",_id_sede," AND tc.id_jorn=",_jorn," AND tm.year = ",_year," AND
				tm.id = ",PEnrolledId,"
				GROUP BY tn.id_matric,tc.id_asig,tm.id_grade,tm.id_group,tm.`year`
				ORDER BY tm.id_group,tn.id_matric,tc.id_asig");
	END CASE;
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_firma_dir_grupo
DROP PROCEDURE IF EXISTS `sp_firma_dir_grupo`;
DELIMITER //
CREATE PROCEDURE `sp_firma_dir_grupo`(
	IN `_headq` INT(20),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_study_day` TINYINT,
	IN `_year` YEAR
)
BEGIN
	DECLARE _ndoc INT DEFAULT 0;
	DECLARE _firm TEXT DEFAULT '';

	SELECT td.id_docente INTO _ndoc FROM docentes AS td
	JOIN dir_grupo AS tdr ON tdr.id_docente = td.id_docente
	JOIN aux_docentes AS au ON (au.id_docente = td.id_docente AND au.year = tdr.year)
	WHERE tdr.id_grado = _grade  AND tdr.grupo = _group AND tdr.id_sede=_headq
	AND tdr.id_jorn = _study_day AND tdr.`year` = `_year` AND au.`year` = `_year`
	LIMIT 1;

	IF NOT _ndoc THEN
		SELECT tc.firma4 AS firma FROM firmas AS tc LIMIT 1;
	ELSE
		SELECT CONCAT("______________________________",'\n ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2),' ',
		RTRIM(td.apellido1),' ',RTRIM(td.apellido2),'\n ','DIRECTOR(A) DE GRUPO') AS firma FROM docentes AS td
		JOIN dir_grupo AS tdr ON tdr.id_docente = td.id_docente
		JOIN aux_docentes AS au ON (au.id_docente = td.id_docente AND au.year = tdr.year)
		WHERE tdr.id_grado = _grade  AND tdr.grupo = _group AND tdr.id_sede=_headq
		AND tdr.id_jorn = _study_day AND tdr.`year` = `_year` AND au.`year` = `_year` LIMIT 1;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_fn_asignaturas_perdidas
DROP PROCEDURE IF EXISTS `sp_fn_asignaturas_perdidas`;
DELIMITER //
CREATE PROCEDURE `sp_fn_asignaturas_perdidas`(
	IN `PEnrollment` INT(30),
	IN `PYear` YEAR,
	IN `PGrade` INT(11)
)
    READS SQL DATA
BEGIN
	/*DROP TABLE IF EXISTS tmpTableAreasf;*/
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableAreasf (
			cod_area	INT(30) NOT NULL,
			final	DECIMAL(6,2)
		);

	INSERT INTO tmpTableAreasf(cod_area,final)
	SELECT aux.id_area,
	ROUND(IF(tmc.porciento BETWEEN 1 AND 99,SUM((t.final*tmc.porciento)/100),AVG(t.final)),2)
	FROM areasf AS t
	JOIN cursos AS tc ON t.id_curso = tc.id
	JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
	JOIN aux_asignaturas AS aux ON (aux.id_asign = ta.id_pk AND aux.year = PYear)
	JOIN matcurso AS tmc ON (tmc.id_asig = ta.id_pk AND tmc.id_grado = tc.id_grado
	AND tmc.year = tc.year)
	WHERE t.id_matric = PEnrollment AND tc.year = PYear AND tc.id_grado = PGrade AND
	tmc.id_grado = PGrade AND tmc.estado = 1 AND ta.estado = 1 AND t.id_curso = tc.id
	GROUP BY aux.id_area, t.id_matric, tc.year;

	SELECT fn_asignaturas_perdidas(PEnrollment, PYear, PGrade) AS total;
	DELETE FROM tmpTableAreasf;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_generar_consolidados
DROP PROCEDURE IF EXISTS `sp_generar_consolidados`;
DELIMITER //
CREATE PROCEDURE `sp_generar_consolidados`(IN `_id_inst` INT(20), IN `_año` YEAR, IN `_periodo` VARCHAR(1), IN `_cod_grado` INT(11), IN `_grupo` VARCHAR(2), IN `_type` INT(20))
BEGIN
	DECLARE 	done,
				_id_matric INT DEFAULT 0;
	DECLARE curm CURSOR FOR SELECT tm.id_matric FROM matriculas AS tm WHERE tm.id_inst = _id_inst AND tm.`año` = `_año`
						AND tm.id_grado = _cod_grado AND tm.id_estado = 2 ORDER BY tm.id_grado, tm.grupo, tm.id_jorn;
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;
	OPEN curm;
	REPEAT
		FETCH curm INTO _id_matric;
		IF NOT done THEN
			CASE _type
				WHEN 1 THEN
					CALL sp_consolidado_asignaturas(_id_matric, _periodo);
				WHEN 2 THEN
					CALL sp_consolidado_areas(_id_matric, _periodo);
				ELSE
					CALL sp_consolidado_docentes(_id_matric, _periodo, _type);
			END CASE;
		END IF;
	UNTIL done END REPEAT;
	CLOSE curm;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_generate_sabanas
DROP PROCEDURE IF EXISTS `sp_generate_sabanas`;
DELIMITER //
CREATE PROCEDURE `sp_generate_sabanas`(
	IN `PYear` INT,
	IN `PEnrollment` INT(30),
	IN `PGrade` INT(11)
)
BEGIN
	DECLARE 	done,
				_cod_area,
				x_count,
				x_count_2,
				_id_area_n,
				x_id_matric,
				_ndecim,
				x_cant_asig_perdidas INT(11) DEFAULT 0;
	DECLARE aa1,aa2,aa3,aa4,aa5,aa6,aa7,aa8,aa9,aa10,aa11,
							aa12,aa13,aa14,aa15,aa16,aa17,aa18,aa19,aa20,
							aa21,aa22,aa23,aa24,aa25,x_count_matcurso INT(11) DEFAULT 0;
	DECLARE	_final,
				_suma,
				_desde DECIMAL(6,2) DEFAULT 0;
	DECLARE 	_cod_grado,
				_grupo VARCHAR(2) DEFAULT '';
	DECLARE 	oStrimValue,
				sValue,
				yValue CHAR DEFAULT '';
	DECLARE sf VARCHAR(20) DEFAULT '';
	DECLARE cur_matcurso CURSOR FOR SELECT aux.id_area FROM matcurso AS tm
				JOIN asignaturas AS ta ON tm.id_asig = ta.id_pk
				JOIN aux_asignaturas AS aux ON (aux.id_asign = ta.id_pk AND aux.year = PYear)
				WHERE tm.year = PYear AND tm.id_grado = PGrade
			   GROUP BY aux.id_area, tm.year, tm.id_grado
			   ORDER BY aux.id_area;
	DECLARE cur1 CURSOR FOR SELECT aux.id_area,
			ROUND(IF(tmc.porciento BETWEEN 1 AND 99,
			SUM(IF(tn.recuperacion > 0,(tn.recuperacion*tmc.porciento)/100,(tn.final*tmc.porciento)/100)),
			AVG(IF(tn.recuperacion > 0, tn.recuperacion, tn.final))),_ndecim) AS prom
			FROM areasf AS tn
			JOIN cursos AS tc ON tn.id_curso = tc.id
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
			JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
			JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = PYear)
			JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tc.id_grado)
			JOIN areas AS tar ON aux.id_area = tar.id
			WHERE tn.id_matric = Penrollment
			AND tc.year = PYear AND tc.id_grado = PGrade
			AND tmc.year = PYear	AND tmc.id_grado = PGrade
			GROUP BY tn.id_matric, aux.id_area;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	SELECT td.hasta INTO _desde FROM `desempeños` as td
	JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE td.year = PYear AND td.reprueba = 1
	AND t2.id_grado = PGrade LIMIT 1;

	SELECT tc.Ndecimales INTO _ndecim FROM config001 tc
	JOIN grados_agrupados AS t1 ON tc.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE tc.year = PYear AND t2.id_grado = PGrade LIMIT 1;

	OPEN cur_matcurso;
	REPEAT
	FETCH cur_matcurso INTO _cod_area;
		IF NOT done THEN
		 SET x_count = x_count + 1;
			CASE x_count
				WHEN 1 THEN
					SET aa1 = _cod_area;
				WHEN 2 THEN
					SET aa2 = _cod_area;
				WHEN 3 THEN
					SET aa3 = _cod_area;
				WHEN 4 THEN
					SET aa4 = _cod_area;
				WHEN 5 THEN
					SET aa5 = _cod_area;
				WHEN 6 THEN
					SET aa6 = _cod_area;
				WHEN 7 THEN
					SET aa7 = _cod_area;
				WHEN 8 THEN
					SET aa8 = _cod_area;
				WHEN 9 THEN
					SET aa9 = _cod_area;
				WHEN 10 THEN
					SET aa10 = _cod_area;
				WHEN 11 THEN
					SET aa11 = _cod_area;
				WHEN 12 THEN
					SET aa12 = _cod_area;
				WHEN 13 THEN
					SET aa13 = _cod_area;
				WHEN 14 THEN
					SET aa14 = _cod_area;
				WHEN 15 THEN
					SET aa15 = _cod_area;
				WHEN 16 THEN
					SET aa16 = _cod_area;
				WHEN 17 THEN
					SET aa17 = _cod_area;
				WHEN 18 THEN
					SET aa18 = _cod_area;
				WHEN 19 THEN
					SET aa19 = _cod_area;
				WHEN 20 THEN
					SET aa20 = _cod_area;
				WHEN 21 THEN
					SET aa21 = _cod_area;
				WHEN 22 THEN
					SET aa22 = _cod_area;
				WHEN 23 THEN
					SET aa23 = _cod_area;
				WHEN 24 THEN
					SET aa24 = _cod_area;
				WHEN 25 THEN
					SET aa25 = _cod_area;
				ELSE
					SET done = 1;
			END CASE;
		END IF;
	UNTIL done END REPEAT;
	CLOSE cur_matcurso;

	SELECT id_matric INTO x_id_matric FROM sabanas WHERE id_matric = PEnrollment;

	IF NOT x_id_matric THEN
		INSERT INTO  sabanas (id_matric) VALUES (PEnrollment);
	ELSE
		UPDATE sabanas SET nar1 = '', nar2 = '',nar3 = '',nar4 = '',nar5 = '',nar6 = '',nar7 = '',nar8 = '',nar9 = '',nar10 = '',
		nar11 = '', nar12 = '',nar13 = '',nar14 = '',nar15 = '',nar16 = '',nar17 = '',nar18 = '',nar19 = '',nar20 = '',
		nar21 = '', nar22 = '',nar23 = '',nar24 = '',nar25 = '',
        ar1 = 0, ar2 = 0,ar3 = 0,ar4 = 0,ar5 = 0,ar6 = 0,ar7 = 0,ar8 = 0,ar9 = 0,ar10 = 0,
		ar11 = 0, ar12 = 0,ar13 = 0,ar14 = 0,ar15 = 0,ar16 = 0,ar17 = 0,ar18 = 0,ar19 = 0,ar20 = 0,
		ar21 = 0, ar22 = 0,ar23 = 0,ar24 = 0,ar25 = 0
		 WHERE id_matric = PEnrollment;
	END IF;
	SET done = 0;
	SET x_count = 0;
			OPEN cur1;
			REPEAT
			FETCH cur1 INTO _id_area_n,_final;
			IF NOT done THEN
				SET x_count = x_count + 1;
				SET x_count_matcurso = 25;
				SET _suma	= _suma + _final;
				SELECT es.abrev INTO sf FROM `desempeños` as td
				JOIN escala_nacional AS es ON td.id_escala = es.id
				JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id
				JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
				WHERE td.year = PYear AND _final BETWEEN td.desde AND td.hasta
				AND t2.id_grado = PGrade LIMIT 1;
				SET done = 0;
				WHILE x_count_matcurso > 0 DO
					SET x_count_matcurso = x_count_matcurso - 1;
					SET x_count_2 = x_count_2 + 1 ;
					CASE x_count_2
						WHEN 1 THEN
							IF _id_area_n =  aa1 THEN
								UPDATE sabanas tc SET tc.ar1 = aa1 , tc.nar1 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar1 = aa1 , tc.nar1 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 2 THEN
							IF _id_area_n =  aa2 THEN
								UPDATE sabanas tc SET tc.ar2 = aa2 , tc.nar2 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar2 = aa2 , tc.nar2 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 3 THEN
							IF _id_area_n =  aa3 THEN
								UPDATE sabanas tc SET tc.ar3 = aa3 , tc.nar3 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar3 = aa3 , tc.nar3 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 4 THEN
							IF _id_area_n =  aa4 THEN
								UPDATE sabanas tc SET tc.ar4 = aa4 , tc.nar4 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar4 = aa4 , tc.nar4 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 5 THEN
							IF _id_area_n =  aa5 THEN
								UPDATE sabanas tc SET tc.ar5 = aa5 , tc.nar5 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar5 = aa5 , tc.nar5 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 6 THEN
							IF _id_area_n =  aa6 THEN
								UPDATE sabanas tc SET tc.ar6 = aa6 , tc.nar6 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar6 = aa6 , tc.nar6 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 7 THEN
							IF _id_area_n =  aa7 THEN
								UPDATE sabanas tc SET tc.ar7 = aa7 , tc.nar7 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar7 = aa7 , tc.nar7 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 8 THEN
							IF _id_area_n =  aa8 THEN
								UPDATE sabanas tc SET tc.ar8 = aa8 , tc.nar8 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar8 = aa8 , tc.nar8 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 9 THEN
							IF _id_area_n =  aa9 THEN
								UPDATE sabanas tc SET tc.ar9 = aa9 , tc.nar9 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar9 = aa9 , tc.nar9 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 10 THEN
							IF _id_area_n =  aa10 THEN
								UPDATE sabanas tc SET tc.ar10 = aa10 , tc.nar10 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar10 = aa10 , tc.nar10 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 11 THEN
							IF _id_area_n =  aa11 THEN
								UPDATE sabanas tc SET tc.ar11 = aa11 , tc.nar11 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar11 = aa11 , tc.nar11 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 12 THEN
							IF _id_area_n =  aa12 THEN
								UPDATE sabanas tc SET tc.ar12 = aa12 , tc.nar12 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar12 = aa12 , tc.nar12 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 13 THEN
							IF _id_area_n =  aa13 THEN
								UPDATE sabanas tc SET tc.ar13 = aa13 , tc.nar13 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar13 = aa13 , tc.nar13 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 14 THEN
							IF _id_area_n =  aa14 THEN
								UPDATE sabanas tc SET tc.ar14 = aa14 , tc.nar14 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar14 = aa14 , tc.nar14 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 15 THEN
							IF _id_area_n =  aa15 THEN
								UPDATE sabanas tc SET tc.ar15 = aa15 , tc.nar15 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar15 = aa15 , tc.nar15 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 16 THEN
							IF _id_area_n =  aa16 THEN
								UPDATE sabanas tc SET tc.ar16 = aa16 , tc.nar16 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar16 = aa16 , tc.nar16 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 17 THEN
							IF _id_area_n =  aa17 THEN
								UPDATE sabanas tc SET tc.ar17 = aa17 , tc.nar17 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar17 = aa17 , tc.nar17 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 18 THEN
							IF _id_area_n =  aa18 THEN
								UPDATE sabanas tc SET tc.ar18 = aa18 , tc.nar18 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar18 = aa18 , tc.nar18 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 19 THEN
							IF _id_area_n =  aa19 THEN
								UPDATE sabanas tc SET tc.ar19 = aa19 , tc.nar19 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar19 = aa19 , tc.nar19 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 20 THEN
							IF _id_area_n =  aa20 THEN
								UPDATE sabanas tc SET tc.ar20 = aa20 , tc.nar20 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar20 = aa20 , tc.nar20 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 21 THEN
							IF _id_area_n =  aa21 THEN
								UPDATE sabanas tc SET tc.ar21 = aa21 , tc.nar21 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar21 = aa21 , tc.nar21 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 22 THEN
							IF _id_area_n =  aa22 THEN
								UPDATE sabanas tc SET tc.ar22 = aa22 , tc.nar22 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar22 = aa22 , tc.nar22 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 23 THEN
							IF _id_area_n =  aa23 THEN
								UPDATE sabanas tc SET tc.ar23 = aa23 , tc.nar23 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar23 = aa23 , tc.nar23 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 24 THEN
							IF _id_area_n =  aa24 THEN
								UPDATE sabanas tc SET tc.ar24 = aa24 , tc.nar24 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar24 = aa24 , tc.nar24 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
						WHEN 25 THEN
							IF _id_area_n =  aa25 THEN
								UPDATE sabanas tc SET tc.ar25 = aa25 , tc.nar25 = sf
								WHERE tc.id_matric = Penrollment;
								SET x_count_matcurso = -1;
							ELSE
								UPDATE sabanas tc SET tc.ar25 = aa25 , tc.nar25 = ''
								WHERE tc.id_matric = Penrollment;
							END IF;
							SET done = 0;
					ELSE
						SET done = 0;
					END CASE;
				END WHILE;
			END IF;
		UNTIL done END REPEAT;
		IF _suma > 0 THEN
			SET _suma = ROUND(_suma/x_count,2);
		END IF;
		UPDATE sabanas cn SET cn.prom = _suma WHERE cn.id_matric = Penrollment;
		CLOSE cur1;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_gen_c_honor
DROP PROCEDURE IF EXISTS `sp_gen_c_honor`;
DELIMITER //
CREATE PROCEDURE `sp_gen_c_honor`(
	IN `_year` YEAR,
	IN `_period` VARCHAR(2),
	IN `_ck` INT(1)
)
BEGIN
	DECLARE
		_type_puesto INT DEFAULT 0;
	SELECT prom_area_puesto INTO _type_puesto FROM config001 WHERE year = `_year` LIMIT 1;
	IF _ck = 1 THEN
		SET _period = '';
	END IF;
	DELETE FROM cuadro_honor WHERE periodo = _period;
	IF _type_puesto = 1 THEN /*Promedio por Áreas*/
		IF _ck = 1 THEN /*Promedio todos los periodos o fin de año*/
			DELETE FROM tb_promedios_honor;
			INSERT INTO  tb_promedios_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, '',1, tv.id AS niv
			FROM nscp001 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tm.year = `_year` AND tmc.year = `_year` AND tmc.estado = 1 AND ta.estado = 1
			AND ta.electiva = 0 AND tm.id_state = 2
			GROUP BY tn.id_matric, au.id_area) UNION
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, '',1, tv.id AS niv
			FROM nscp002 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tm.year = `_year` AND tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0 AND tm.id_state = 2
			GROUP BY tn.id_matric, au.id_area) UNION
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, '',1, tv.id AS niv
			FROM nscp003 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tm.year = `_year` AND tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0  AND tm.id_state = 2
			GROUP BY tn.id_matric, au.id_area)
			ORDER BY niv, nota DESC, max DESC;
			INSERT INTO  cuadro_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			SELECT t.id_matric, ROUND(AVG(t.suma),2),MAX(t.nmax),t.periodo,t.id_inst,t.nivel
			FROM tb_promedios_honor t GROUP BY t.id_matric;
		ELSE
			DELETE FROM tb_promedios_honor;
			INSERT INTO  tb_promedios_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, tn.periodo,1, tv.id AS niv
			FROM nscp001 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tn.periodo = _period AND tm.year = `_year` AND
			tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0  AND tm.id_state = 2
			GROUP BY tn.id_matric,tn.periodo, au.id_area) UNION
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, tn.periodo,1, tv.id AS niv
			FROM nscp002 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tn.periodo = _period AND tm.year = `_year` AND
			tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0  AND tm.id_state = 2
			GROUP BY tn.id_matric,tn.periodo, au.id_area) UNION
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, tn.periodo,1, tv.id AS niv
			FROM nscp003 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tn.periodo = _period AND tm.year = `_year` AND
			tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0  AND tm.id_state = 2
			GROUP BY tn.id_matric,tn.periodo, au.id_area)
			ORDER BY niv, nota DESC, max DESC;
			INSERT INTO  cuadro_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			SELECT t.id_matric, ROUND(AVG(t.suma),2),MAX(t.nmax),t.periodo,t.id_inst,t.nivel
			FROM tb_promedios_honor t GROUP BY t.id_matric, t.periodo;
		END IF;
	ELSE
		IF _ck = 1 THEN /*Promedio todos los periodos o fin de año*/
			DELETE FROM tb_promedios_honor;
			INSERT INTO  tb_promedios_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, '',1, tv.id AS niv
			FROM nscp001 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tm.year = `_year` AND
			tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0 AND tm.id_state = 2
			GROUP BY tn.id_matric) UNION
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, '',1, tv.id AS niv
			FROM nscp002 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tm.year = `_year` AND
			tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0 AND tm.id_state = 2
			GROUP BY tn.id_matric) UNION
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, '',1, tv.id AS niv
			FROM nscp003 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tm.year = `_year` AND
			tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0 AND tm.id_state = 2
			GROUP BY tn.id_matric)
			ORDER BY niv, nota DESC, max DESC;
			INSERT INTO  cuadro_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			SELECT t.id_matric, ROUND(AVG(t.suma),2),MAX(t.nmax),t.periodo,t.id_inst,t.nivel
			FROM tb_promedios_honor t GROUP BY t.id_matric;
		ELSE
			DELETE FROM tb_promedios_honor;
			INSERT INTO  tb_promedios_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, tn.periodo,1, tv.id AS niv
			FROM nscp001 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tn.periodo = _period AND tm.year = `_year` AND
			tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0 AND tm.id_state = 2
			GROUP BY tn.id_matric,tn.periodo) UNION
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, tn.periodo,1, tv.id AS niv
			FROM nscp002 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tn.periodo = _period AND tm.year = `_year` AND
			tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0 AND tm.id_state = 2
			GROUP BY tn.id_matric,tn.periodo) UNION
			(SELECT SQL_SMALL_RESULT tn.id_matric,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) max, tn.periodo,1, tv.id AS niv
			FROM nscp003 AS tn
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN grados AS tg ON tm.id_grade = tg.id
		   JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year AND tc.id_grado = tg.id)
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		   JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		   JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
			JOIN matcurso AS tmc ON (tmc.id_grado = tg.id AND tmc.id_asig = ta.id_pk)
			WHERE tn.periodo = _period AND tm.year = `_year` AND
			tmc.year = `_year` AND tmc.estado = 1
			AND ta.estado = 1 AND ta.electiva = 0 AND tm.id_state = 2
			GROUP BY tn.id_matric,tn.periodo)
			ORDER BY niv, nota DESC, max DESC;
			INSERT INTO  cuadro_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			SELECT t.id_matric, ROUND(AVG(t.suma),2),MAX(t.nmax),t.periodo,t.id_inst,t.nivel
			FROM tb_promedios_honor t GROUP BY t.id_matric, t.periodo;
		END IF;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_gen_c_honor_est
DROP PROCEDURE IF EXISTS `sp_gen_c_honor_est`;
DELIMITER //
CREATE PROCEDURE `sp_gen_c_honor_est`(IN `_id_matric` INT(20), IN `_periodo` VARCHAR(1))
BEGIN
	DECLARE _año, _id_inst, _id_sede, x_niv, n_count INT DEFAULT 0;
	DECLARE _cod_grado, _grupo VARCHAR(2) DEFAULT '';
	DECLARE _suma,_max DECIMAL(6,2) DEFAULT 0;

	SELECT tm.año, tm.id_inst, tm.id_sede, tm.cod_grado, tm.grupo
	INTO  _año, _id_inst, _id_sede, _cod_grado, _grupo
	FROM matriculas AS tm WHERE tm.id_matric = _id_matric;
	DELETE FROM cuadro_honor WHERE id_matric = _id_matric AND periodo = _periodo;
	CASE
		WHEN _cod_grado BETWEEN '01' AND '05' THEN
			INSERT INTO  cuadro_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			SELECT SQL_SMALL_RESULT tn.id_matric, ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) nota,
			MAX(tn.final) max, tn.periodo,tm.id_inst, 2 niv FROM nscp001 AS tn
			JOIN matriculas AS tm ON tn.id_matric = tm.id_matric
			WHERE tn.periodo = _periodo AND tm.id_inst = _id_inst AND tm.`año` = `_año` AND tn.final > 0
			AND tm.id_matric = _id_matric
			GROUP BY tn.id_matric, tn.periodo;
		WHEN _cod_grado = '99' THEN
			INSERT INTO  cuadro_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			SELECT SQL_SMALL_RESULT tn.id_matric, ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) nota,
			MAX(tn.final) max, tn.periodo,tm.id_inst, 2 niv FROM nscp003 AS tn
			JOIN matriculas AS tm ON tn.id_matric = tm.id_matric
			WHERE tn.periodo = _periodo AND tm.id_inst = _id_inst AND tm.`año` = `_año` AND tn.final > 0
			AND tm.id_matric = _id_matric
			GROUP BY tn.id_matric, tn.periodo;
		WHEN _cod_grado BETWEEN '06' AND '09' THEN
			INSERT INTO  cuadro_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			SELECT SQL_SMALL_RESULT tn.id_matric, ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) nota,
			MAX(tn.final) max, tn.periodo,tm.id_inst, 3 niv FROM nscp002 AS tn
			JOIN matriculas AS tm ON tn.id_matric = tm.id_matric
			WHERE tn.periodo = _periodo AND tm.id_inst = _id_inst AND tm.`año` = `_año` AND tn.final > 0
			AND tm.id_matric = _id_matric
			GROUP BY tn.id_matric, tn.periodo;
		WHEN _cod_grado BETWEEN '10' AND '11' THEN
			INSERT INTO  cuadro_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			SELECT SQL_SMALL_RESULT tn.id_matric, ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) nota,
			MAX(tn.final) max, tn.periodo,tm.id_inst, 4 niv FROM nscp003 AS tn
			JOIN matriculas AS tm ON tn.id_matric = tm.id_matric
			WHERE tn.periodo = _periodo AND tm.id_inst = _id_inst AND tm.`año` = `_año` AND tn.final > 0
			AND tm.id_matric = _id_matric
			GROUP BY tn.id_matric, tn.periodo;
		WHEN _cod_grado BETWEEN '21' AND '26' THEN
			INSERT INTO  cuadro_honor (id_matric,suma,nmax,periodo,id_inst,nivel)
			SELECT SQL_SMALL_RESULT tn.id_matric, ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) nota,
			MAX(tn.final) max, tn.periodo,tm.id_inst, 5 niv FROM nscp003 AS tn
			JOIN matriculas AS tm ON tn.id_matric = tm.id_matric
			WHERE tn.periodo = _periodo AND tm.id_inst = _id_inst AND tm.`año` = `_año` AND tn.final > 0
			AND tm.id_matric = _id_matric
			GROUP BY tn.id_matric, tn.periodo;
	END CASE;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_get_columns_notas
DROP PROCEDURE IF EXISTS `sp_get_columns_notas`;
DELIMITER //
CREATE PROCEDURE `sp_get_columns_notas`(
	IN `PGrade` INT(11),
	IN `PYear` INT
)
BEGIN
	DECLARE _result TEXT DEFAULT '';
	DECLARE done, _num, _row INT DEFAULT 0;
	DECLARE _name, _tipo VARCHAR(200) DEFAULT '';
	DECLARE cur CURSOR FOR SELECT t.numero_column, CONCAT('tn.n',t.numero_column) name_column,
		t.tipo,
		ROW_NUMBER() OVER (PARTITION BY tipo ORDER BY t.id_competencia, t.tipo, t.numero_column) AS row_num
		FROM columnas_notas_competencias t
		JOIN competencias AS tc ON t.id_competencia = tc.id_pk
		JOIN grados_agrupados AS t1 ON tc.id_grado_agrupado = t1.id
		JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
		WHERE tc.year = PYear AND t2.id_grado = PGrade
		ORDER BY t.id_competencia, t.tipo, t.numero_column;
		DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;
	OPEN cur;
	REPEAT
		FETCH cur INTO _num, _name, _tipo, _row;
		IF NOT done THEN
			CASE _tipo
				WHEN 'PROM' THEN
					SET _result = CONCAT(_result,_name,' AS ',LOWER(_tipo),_row,',');
				WHEN 'PORC' THEN
					SET _result = CONCAT(_result,_name,' AS ',LOWER(_tipo),_row,',');
				ELSE
					SET _result = CONCAT(_result,_name,',');
			END CASE;
		END IF;
	UNTIL done END REPEAT;
	CLOSE cur;
	SELECT LEFT(_result,LENGTH(_result)-1) AS filas;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_header_final_certificate
DROP PROCEDURE IF EXISTS `sp_header_final_certificate`;
DELIMITER //
CREATE PROCEDURE `sp_header_final_certificate`(
	IN `PYear` YEAR,
	IN `PType` SMALLINT
)
BEGIN
	SET @sqlSelect =CONCAT("SELECT t.*, RIGHT(CONCAT('0000000',t2.total),7) cons, t2.year, r.logo, r.escudo, r.pie
	FROM config_const_cert_end AS t
	JOIN certificate_numbers AS t2 ON t2.id_parent = t.id
	JOIN encabezado_reportes AS r ON r.id > 0
	WHERE ",PYear," BETWEEN t.year_from AND t.year_until AND t2.year = ",PYear," AND t.type = ",PType," LIMIT 1");

	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_ih_select
DROP PROCEDURE IF EXISTS `sp_ih_select`;
DELIMITER //
CREATE PROCEDURE `sp_ih_select`(IN `_cod_grado` VARCHAR(2) CHARSET utf8, IN `_cod_dane` VARCHAR(14) CHARSET utf8, IN `_año` YEAR, IN `_cod_asig` INT(2))
BEGIN
	select ih from matcurso where cod_grado=_cod_grado and cod_dane=_cod_dane and año=_año and cod_asig=_cod_asig;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_insert_conv_situaciones_est_reincidencia
DROP PROCEDURE IF EXISTS `sp_insert_conv_situaciones_est_reincidencia`;
DELIMITER //
CREATE PROCEDURE `sp_insert_conv_situaciones_est_reincidencia`(IN `_id_matric` INT(20))
BEGIN
	 DECLARE  done,
 			 _count,
			 _count_s,
			 _id_inst,
			 _id_situacion,
			 _x_reincidencia,
			 _año INT DEFAULT 0;
SELECT id_inst, año INTO _id_inst, _año FROM matriculas tm WHERE  tm.id_matric = _id_matric;
SELECT c.conv_reincidencia INTO _x_reincidencia  FROM config001 c WHERE c.id_inst = _id_inst AND c.AÑO = _año;
SELECT MOD(COUNT(t1.id_matric),_x_reincidencia) INTO _count  FROM conv_reg_situaciones_est t1,
conv_situaciones t2 WHERE t1.id_situacion = t2.id AND t2.id_tipo = 1
GROUP BY t1.id_matric, t2.id_tipo HAVING t1.id_matric = _id_matric;
 IF _count = 0 THEN
 	SELECT count(t1.id) INTO _count_s FROM conv_situaciones t1
	 WHERE t1.add_auto = 1 AND t1.id_inst = _id_inst;

	IF _count_s THEN
		SELECT  t1.id  FROM conv_situaciones t1
	 	WHERE t1.add_auto = 1 AND t1.id_inst = _id_inst;
	ELSE
		SELECT t1.id  FROM conv_situaciones t1
	 	WHERE t1.id_tipo = 2 AND t1.id_inst = _id_inst LIMIT 1;

	END IF;
 ELSE
 	SELECT 0 as id;
 END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_insert_observador
DROP PROCEDURE IF EXISTS `sp_insert_observador`;
DELIMITER //
CREATE PROCEDURE `sp_insert_observador`(IN `_cod_grado` VARCHAR(2) CHARSET utf8, IN `_grupo` VARCHAR(2) CHARSET utf8, IN `_cod_jorn` INT(1), IN `_id_sede` INT(20), IN `_cod_est` INT(20), IN `_año` YEAR, IN `_fecha` DATE, IN `_id_inst` INT(20))
BEGIN
	INSERT INTO obs_observador_mod2 (cod_grado,grupo,cod_jorn,id_sede,cod_est, año, fecha,id_inst) VALUES
			(_cod_grado,_grupo,_cod_jorn,_id_sede,_cod_est,_año,_fecha,_id_inst);

	SELECT last_insert_id() AS id;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_insert_observador_items
DROP PROCEDURE IF EXISTS `sp_insert_observador_items`;
DELIMITER //
CREATE PROCEDURE `sp_insert_observador_items`(IN `_consecutivo` INT(11), IN `_id_observador` INT(20), IN `_id_docente` INT(20), IN `_cod_est` INT(20), IN `_cod_grado` VARCHAR(2) CHARSET utf8, IN `_grupo` VARCHAR(2) CHARSET utf8, IN `_cod_jorn` INT(1), IN `_id_inst` INT(20), IN `_id_sede` INT(20), IN `_observaciones` TEXT, IN `_compromisos` TEXT, IN `_tratamientos` TEXT, IN `_resultado` TEXT, IN `_fecha` DATE, IN `_estado` TINYINT(1), IN `_año` YEAR)
BEGIN
 insert into obs_items_modelo_obs2 (
	consecutivo,
    id_observador,
    id_docente,
    cod_est,
    cod_grado,
    grupo,
	cod_jorn,
    id_inst,
    id_sede,
    observaciones,
    compromisos,
    tratamientos,
    resultado,
    fecha,
    estado,
    año) values (
    _consecutivo,
    _id_observador,
    _id_docente,
    _cod_est,
    _cod_grado,
    _grupo,
	_cod_jorn,
    _id_inst,
    _id_sede,
    _observaciones,
    _compromisos,
    _tratamientos,
    _resultado,
    _fecha,
    _estado,
    _año
    );
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_insert_respeciales
DROP PROCEDURE IF EXISTS `sp_insert_respeciales`;
DELIMITER //
CREATE PROCEDURE `sp_insert_respeciales`(IN `_id_matric` INT(30), IN `_x_nro_act` INT, IN `_id_curso` INT(30), IN `_final` DECIMAL(6,2))
BEGIN
	DECLARE _count INT DEFAULT 0;
	SELECT tr.id INTO _count FROM respeciales AS tr WHERE tr.id_curso = _id_curso AND tr.id_matric = _id_matric;
	IF NOT _count THEN
		INSERT INTO respeciales (id_matric,nro_acta,id_curso,notafinal)
		VALUES (_id_matric,_x_nro_act,_id_curso,_final);
	ELSE
		UPDATE respeciales SET notafinal = _final WHERE id_matric = _id_matric AND id_curso = _id_curso;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_insert_sahred_evaluation
DROP PROCEDURE IF EXISTS `sp_insert_sahred_evaluation`;
DELIMITER //
CREATE PROCEDURE `sp_insert_sahred_evaluation`(
	IN `PEvaluation` BIGINT,
	IN `PCourse` INT(30)
)
BEGIN
	INSERT INTO te_shared_evaluation (evaluation_id,enrollment_id)
	SELECT PEvaluation, tm.id FROM student_enrollment AS tm
	JOIN cursos AS tc ON  (tm.year = tc.year AND tm.id_headquarters = tc.id_sede AND
	tm.id_grade = tc.id_grado AND tm.id_group = tc.grupo AND tm.id_study_day = tc.id_jorn)
	WHERE tm.id_state = 2 AND tc.id = PCourse AND tc.estado = 1 AND NOT
	EXISTS(
		SELECT * FROM te_shared_evaluation AS b
		WHERE b.enrollment_id = tm.id AND b.evaluation_id = PEvaluation
	);
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_insert_shared_online_activities
DROP PROCEDURE IF EXISTS `sp_insert_shared_online_activities`;
DELIMITER //
CREATE PROCEDURE `sp_insert_shared_online_activities`(
	IN `PMaterial` BIGINT,
	IN `PCourse` INT(30)
)
BEGIN
	INSERT INTO ta_shared_online_activities (activity_id,enrollment_id)
	SELECT PMaterial, tm.id FROM student_enrollment AS tm
	JOIN cursos AS tc ON  (tm.year = tc.year AND tm.id_headquarters = tc.id_sede AND
	tm.id_grade = tc.id_grado AND tm.id_group = tc.grupo AND tm.id_study_day = tc.id_jorn)
	WHERE tm.id_state = 2 AND tc.id = PCourse AND tc.estado = 1 AND NOT
	EXISTS(
		SELECT * FROM ta_shared_online_activities AS b
		WHERE b.enrollment_id = tm.id AND b.activity_id = PMaterial
	);
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_insert_students_live_classes
DROP PROCEDURE IF EXISTS `sp_insert_students_live_classes`;
DELIMITER //
CREATE PROCEDURE `sp_insert_students_live_classes`(
	IN `PClassId` BIGINT,
	IN `PCourseId` INT
)
BEGIN
	INSERT INTO tl_students_live_classes (class_id,enrollment_id)
	SELECT PClassId, tm.id FROM student_enrollment AS tm
	JOIN cursos AS tc ON  (tm.year = tc.year AND tm.id_headquarters = tc.id_sede AND
	tm.id_grade = tc.id_grado AND tm.id_group = tc.grupo AND tm.id_study_day = tc.id_jorn)
	WHERE tm.id_state = 2 AND tc.id = PCourseId AND tc.estado = 1 AND NOT
	EXISTS(
		SELECT * FROM tl_students_live_classes AS b
		WHERE b.enrollment_id = tm.id AND b.class_id = PClassId
	);
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_kill_sleeping_connections
DROP PROCEDURE IF EXISTS `sp_kill_sleeping_connections`;
DELIMITER //
CREATE PROCEDURE `sp_kill_sleeping_connections`()
    READS SQL DATA
    COMMENT 'Secuencia de comandos para matar las conexiones dormidas'
BEGIN
	DECLARE end_rows INT DEFAULT 0;
	DECLARE no_loops INT DEFAULT 0;
	DECLARE rownum INT DEFAULT 0;

	DECLARE ucur CURSOR FOR
	SELECT ID FROM information_schema.PROCESSLIST PL
	WHERE PL.COMMAND='Sleep' AND PL.TIME > 59;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET end_rows = 1;

	OPEN ucur;
	REPEAT
		FETCH ucur INTO rownum;
		IF NOT end_rows THEN
		 	IF rownum > 0 THEN
			 	KILL rownum;
		 	END IF;
		END IF;
	UNTIL end_rows END REPEAT;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_libro_final_areas
DROP PROCEDURE IF EXISTS `sp_libro_final_areas`;
DELIMITER //
CREATE PROCEDURE `sp_libro_final_areas`(
	IN `PEnrollment` INT(30),
	IN `PYear` YEAR
)
BEGIN
	DECLARE _grupo VARCHAR(2) DEFAULT '';
	DECLARE _n_mat,_id_jorn, _id_sede, _cod_area, _id_asig, _faltas, _injust, _retraso, nPYear INT DEFAULT 0;
	DECLARE _final,_recuperacion DECIMAL(6,2) DEFAULT 0;
	DECLARE done, _estado INT DEFAULT 0;
	DECLARE _des,_desempeño,_msg,_msg1,_msg2,_msg3,_msg4	VARCHAR(250) DEFAULT '';
	DECLARE  _pierde_rec,
				_gana_rec,
				_areas_perdidas,
				_areas_ganadas,
				_areas_pierde,
				_pierde_luego_rec,
				_rec_especial,
				_total_areas_recuperas,
				_areas_enrecuperacion,
				_recuperaciones_total,
				_n_decimales,
				_cont_porcentaje,
				_cont_areas,
				_total_areas_recuperadas,
				_baj, _sup,
				_promocion_a_lectivo, /*Promoción de los estudiantes, 1 = promedios, 2 = promedios - desempeño alto, 3= quinta nota
												4 = Cuarto periodo, 5 = Desempeños - Logros*/
				_pierde_año_lectivo_area, /*Al finalizar el año escolar, no será promovido el estudiante que pierda las siguientes áreas*/
				_area_next,
				_aplicar_redondeo_fin_año,
				_cod_grado,
				_cod_grado_prom,
				_curso INT DEFAULT 0;
	DECLARE  _nota_real_recuperada,
		     	_nota_real,
		     	_suma,
		     	_prom,
				_desde,
				_hasta,
				_nota_recuperacion,
				_porcentaje,
				_final_suma,
				_nota_max_rec,
				_nota_redondeo,
				_nota_final_redondeo,
				_porciento_ausencia, /*Porcentaje de inasistencia injustificada para perder un área.*/
				_prom_areas_sup, /*Si el estudiante pierde UN ÁREA y el PROMEDIO de esta es igual o superior a este valor es promovido sin hacer recuperación*/
				_w_sup DECIMAL(6,2) DEFAULT 0;
	DECLARE cur_areasf2 CURSOR FOR SELECT ta.id_matric,tm.id_headquarters id_sede,
		tm.id_grade id_grado,tm.id_group grupo,tm.id_study_day id_jorn,tm.year año,
		aux.id_area,tas.id_pk,ta.final,ta.recuperacion,
		ta.faltas,ta.injustificadas,ta.retraso,ta.id_curso,tmc.porciento
		FROM areasf AS ta
		JOIN cursos AS tc ON ta.id_curso = tc.id
		JOIN student_enrollment AS tm ON ta.id_matric=tm.id
		JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
		JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = tc.year)
		JOIN inscripciones AS te ON tm.id_student = te.id
		JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tc.id_grado
		AND tmc.year = tc.year)
		WHERE tm.year = PYear AND tc.year = PYear AND
		aux.id_area = _area_next AND tm.id = PEnrollment
		AND tas.excluir = 0 ORDER BY aux.id_area,tas.id_pk;
   /* Cursor que contiene solo el codigo de las areas */
   DECLARE cur_areasf CURSOR FOR SELECT SQL_SMALL_RESULT aux.id_area FROM areasf AS ta
   	JOIN cursos AS tc ON ta.id_curso = tc.id
		JOIN student_enrollment AS tm ON ta.id_matric=tm.id
		JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
		JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = PYear)
		JOIN inscripciones AS te ON tm.id_student = te.id
		WHERE tm.year= PYear AND tc.year = PYear AND tm.id = PEnrollment
		GROUP BY ta.id_matric,aux.id_area,tm.year
		ORDER BY aux.id_area,tas.id_pk;
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;
	SELECT id_grade INTO _cod_grado_prom FROM student_enrollment WHERE id = PEnrollment;
	SELECT areas_pierde,pierde_luego_rec,ndecimales,nota_max_rec,porciento_ausencia,prom_areas,promocion,
	pierde_año_lectivo_area,nota_redondeo,nota_final_redondeo,aplicar_redondeo_fin_año INTO
	_areas_pierde,_pierde_luego_rec,_n_decimales,_nota_max_rec,_porciento_ausencia,_prom_areas_sup,
	_promocion_a_lectivo,_pierde_año_lectivo_area,_nota_redondeo,_nota_final_redondeo,_aplicar_redondeo_fin_año
	FROM config001 AS t
	JOIN grados_agrupados AS t1 ON t.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE t.year = `PYear` AND t2.id_grado = _cod_grado_prom;

	SELECT t.desde, t.hasta INTO _desde, _hasta
	FROM `desempeños` AS t
	JOIN grados_agrupados AS t1 ON t.id_grado_agrupado = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE	t.reprueba =1 AND t.year =`PYear` AND t2.id_grado = _cod_grado_prom;
	SET _w_sup = _hasta;

	SELECT fn_recuperacion_total_asignaturas(PEnrollment) INTO _recuperaciones_total;
	SELECT fn_recuperacion_total_areas(PEnrollment) INTO _areas_enrecuperacion;
	/*
	 Si el usuario especifica una nota máxima para las actividades de apoyo, se establece.
	*/
	IF _nota_max_rec > 0 THEN
		SET _desde = _nota_max_rec;
	END IF;
	OPEN cur_areasf;
	REPEAT
		FETCH cur_areasf INTO _area_next;
		IF NOT done THEN
			SET _nota_real	= 0;
			SET _nota_real_recuperada = 0;
			SET _final_suma = 0;
			SET _cont_porcentaje = 0;
			OPEN cur_areasf2;
			REPEAT
				FETCH cur_areasf2 INTO _n_mat,_id_sede,_cod_grado,_grupo,_id_jorn,nPYear,_cod_area,_id_asig,
					_final,_recuperacion,_faltas,_injust,_retraso,_curso, _porcentaje;
				IF NOT done THEN
					/*
					  Nota de las actividades de apoyo en la asignatura,
					  si ha realizado actividades devuelve la nota, si no, devuelve 0.
					*/
					SELECT fn_recuperacion_notas(PEnrollment, _curso) INTO _nota_recuperacion;
					SET done = 0;
					/*
					 Suma de las notas
					*/
					SET _nota_real = _nota_real + ROUND((_final*_porcentaje)/100,_n_decimales);
					SET _nota_real_recuperada = _nota_real_recuperada + ROUND((_nota_recuperacion*_porcentaje)/100,_n_decimales);

					IF _nota_recuperacion > _final THEN
						SET _final_suma = _final_suma + ROUND((_nota_recuperacion*_porcentaje)/100,_n_decimales);
					ELSE
						SET _final_suma = _final_suma + ROUND((_final*_porcentaje)/100,_n_decimales);
					END IF;
					/*
					 Se determina el grado porcentual de la asignatura.
					*/
					IF _porcentaje = 0 OR _porcentaje = 100 THEN
						SET _cont_porcentaje = _cont_porcentaje + 1;
					ELSE
						SET _cont_porcentaje = 0;
					END IF;
					/*
					 Se determina si el estudiante hizo actividades de apoyo de fin de año.
					*/
					IF _nota_recuperacion > 0 THEN
						SET _rec_especial = _rec_especial + 1;
						IF (_nota_recuperacion > _final) AND (_nota_recuperacion > _hasta) THEN
							SET _gana_rec = _gana_rec + 1;
						ELSE
							SET _pierde_rec = _pierde_rec + 1;
						END IF;
					END IF;
				END IF;
			UNTIL done END REPEAT;
			CLOSE cur_areasf2;
			IF _cont_porcentaje > 0 THEN
				SET _prom	= ROUND((_final_suma/_cont_porcentaje),_n_decimales);
			ELSE
				SET _prom	= ROUND(_final_suma,_n_decimales);
			END IF;
			SET _cont_areas = _cont_areas + 1;
			SET _suma = _suma + _prom;
			IF _cont_porcentaje > 0 THEN
				SET _nota_real_recuperada	= ROUND((_nota_real_recuperada/_cont_porcentaje),_n_decimales);
				SET _nota_real	= ROUND((_nota_real/_cont_porcentaje),_n_decimales);
			ELSE
				SET _nota_real_recuperada	= ROUND(_nota_real_recuperada,_n_decimales);
				SET _nota_real	= ROUND(_nota_real,_n_decimales);
			END IF;
			/*
			 Se determina cuantas areas han estado en actividades de apoyo.
			*/
			IF _nota_real_recuperada > _w_sup THEN
				SET _total_areas_recuperadas = _total_areas_recuperadas + 1;
			END IF;
			/*
			 Se determina y aplica el redondeo del área.
			*/
			IF _nota_redondeo > 0 AND _aplicar_redondeo_fin_año > 0 THEN
				IF _prom BETWEEN _nota_redondeo AND _nota_final_redondeo THEN
					SET _prom = _nota_final_redondeo;
				END IF;
				IF _nota_real BETWEEN _nota_redondeo AND _nota_final_redondeo THEN
					SET _nota_real = _nota_final_redondeo;
				END IF;
			END IF;
			/*
			 Se determina la cantidad de áreas perdidas y ganadas.
			*/
			IF _nota_real <= _w_sup THEN
				SET _areas_perdidas = _areas_perdidas + 1;
			ELSE
				SET _areas_ganadas = _areas_ganadas + 1;
			END IF;
			IF _prom <= _w_sup THEN
				SET _baj	= _baj + 1;
			ELSE
				SET _sup	= _sup + 1;
			END IF;
			SET done = 0;
		END IF;
	UNTIL done END REPEAT;
	CLOSE cur_areasf;
	IF _recuperaciones_total > _rec_especial THEN
		SET _rec_especial = 0;
	END IF;
	IF _rec_especial > 0 THEN
		CASE  _pierde_luego_rec
			WHEN  1 THEN /*En caso de que el estudiante pierda una de las recuperaciones */
				IF _pierde_rec > 0 THEN  /*Si pierde una de las recuperaciones finales o especiales*/
					/* No promovido*/
					SET _estado = 3;
				ELSE /*Si no pierde las recuperaciones finales o especiales*/
					/*Promovido*/
					SET _estado = 1;
				END IF;
			WHEN 2 THEN /*En caso de que el estudiante pierda todas las recuperaciones*/
				CASE  _areas_pierde
					WHEN  3 THEN /*En caso que pierdan estudiantes con tres o más áreas*/
						IF _pierde_rec = _rec_especial THEN /* Si pierde todas las recuperaciones finales o especiales*/
							/*NO promovido*/
							SET _estado = 3;
						ELSE
							IF _gana_rec  =_rec_especial THEN /* Si gana todas las recuperaciones finales o especiales*/
								/*Promovido*/
								SET _estado = 1;
							ELSE
								/*Promovido con dificultad*/
								SET _estado = 2;
							END IF;
						END IF;
					WHEN  2 THEN /*En caso que pierdan estudiantes con 2 o más áreas*/
						IF _pierde_rec = _rec_especial THEN /*Si pierde todas las recuperaciones finales o especiales*/
							/*No promovido*/
							SET _estado = 3;
						ELSE
							IF _gana_rec = _rec_especial THEN /*Si gana todas las recuperaciones finales o especiales*/
								/*Promovido*/
								SET _estado = 1;
							ELSE
								/*Promovido con dificultad*/
								SET _estado = 2;
							END IF;
						END IF;
				ELSE
					SET _des = "ERROR EN EL SISTEMA, REPORTELO.";
				END CASE;
		ELSE
			IF _gana_rec = _rec_especial THEN /*Si gana todas las recuperaciones finales o especiales*/
					/*Promovido*/
					SET _estado = 1;
			ELSE
				IF _total_areas_recuperas = _areas_enrecuperacion THEN
					/*Promovido*/
					SET _estado = 1;
				ELSE
					/*No promovido*/
					SET _estado = 3;
				END IF;
			END IF;
		END CASE;
	ELSE
		IF  _baj < _areas_pierde THEN
	 		IF _baj = 0 THEN
	 			/*Promovido*/
				SET _estado = 1;
	 		ELSE
	 			/*Promovido con dificultad*/
				SET _estado = 2;
	 		END IF;
		 ELSE
			 /*No promovido*/
			SET _estado = 3;
		 END IF;
	END IF;
	IF _suma > 0 THEN
		SET _prom = ROUND(_suma/_cont_areas,_n_decimales);
	END IF;
	SELECT `estado_estudiante_normal`(_estado,_cod_grado_prom) INTO _des;
	SELECT `fn_Getdesempeño`(PYear, _prom,_cod_grado_prom) INTO `_desempeño`;
	SET _msg	 = CONCAT("ÁREAS PERDIDAS: ",_areas_perdidas," - ÁREAS GANADAS: ",_areas_ganadas," - TOTAL ÁREAS: ",_cont_areas);
	SET _msg1 = CONCAT("PONDERADO GENERAL POR ÁREAS: ",_prom," - DESEMPEÑO: ",_desempeño);
	SET _msg2 = _des;
	UPDATE acta_promocion
	SET msg = _msg2, msg1= _msg, msg2 = _msg1, estado=_estado, areas_p = _areas_perdidas, areas_g = _areas_ganadas
	WHERE id_matric = PEnrollment;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_libro_final_asignaturas
DROP PROCEDURE IF EXISTS `sp_libro_final_asignaturas`;
DELIMITER //
CREATE PROCEDURE `sp_libro_final_asignaturas`(IN `_id_matric` INT(30), IN `_año` YEAR, IN `_id_inst` INT(20))
BEGIN
	DECLARE  _grupo  VARCHAR(2) DEFAULT '';
	DECLARE _n_mat,_id_jorn, _id_sede, _cod_area, _id_asig,
	_faltas, _injust, _retraso, n_año,
	_cod_grado, _cod_grado_prom,_curso INT(30) DEFAULT 0;
	DECLARE _final,_recuperacion DECIMAL(6,2) DEFAULT 0;
	DECLARE done, _estado INT DEFAULT 0;
	DECLARE _des,_desempeño,_msg,_msg1,_msg2,_msg3,_msg4	VARCHAR(250) DEFAULT '';
	DECLARE  _pierde_rec,
				_gana_rec,
				_areas_perdidas,
				_areas_ganadas,
				_areas_pierde,
				_pierde_luego_rec,
				_rec_especial,
				_total_areas_recuperas,
				_areas_enrecuperacion,
				_recuperaciones_total,
				_n_decimales,
				_cont_porcentaje,
				_cont_areas,
				_total_areas_recuperadas,
				_baj, _sup,
				_area_next INT DEFAULT 0;
	DECLARE  _nota_real_recuperada,
		     	_nota_real,
		     	_suma,
		     	_prom,
				_desde,
				_hasta,
				_nota_recuperacion,
				_porcentaje,
				_final_suma,
				_nota_max_rec,
				_w_sup DECIMAL(6,2) DEFAULT 0;
	DECLARE cur_areasf CURSOR FOR SELECT ta.id_matric,tm.id_sede,tm.id_grado,tm.grupo,tm.id_jorn,tm.año,
		tas.id_area,tc.id_asig,ta.final,ta.recuperacion,
		ta.faltas,ta.injustificadas,ta.retraso,ta.id_curso, tmc.porciento
		FROM areasf AS ta
		JOIN cursos AS tc ON ta.id_curso = tc.id
		JOIN  matriculas AS tm ON ta.id_matric=tm.id_matric
		JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
		JOIN inscripciones AS te ON tm.cod_est=te.cod_est
		JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tc.id_grado)
		WHERE tm.id_inst=_id_inst AND tm.año=_año AND tc.año=_año AND tc.id_grado = _cod_grado_prom
		AND tas.id_inst=_id_inst AND tm.id_matric = _id_matric
		AND tmc.id_grado = _cod_grado_prom AND tmc.`año` = `_año`
		AND tas.excluir = 0 ORDER BY tas.id_pk;
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;
	SELECT id_grado INTO _cod_grado_prom FROM matriculas WHERE id_matric = _id_matric;
	SELECT areas_pierde,pierde_luego_rec,ndecimales,nota_max_rec INTO
	_areas_pierde,_pierde_luego_rec,_n_decimales,_nota_max_rec
	FROM config001 AS t
	JOIN grados_agrupados AS t1 ON t.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE t.año = `_año` AND t.id_inst = _id_inst AND t2.id_grado = _cod_grado_prom LIMIT 1;
	SELECT t.desde, t.hasta INTO _desde, _hasta
	FROM `desempeños` AS t
	JOIN grados_agrupados AS t1 ON t.id_grado_agrupado = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE	t.reprueba = 1 AND t.id_inst=_id_inst AND t.año=`_año`
	AND t2.id_grado = _cod_grado_prom LIMIT 1;
	SET _w_sup = _hasta;
	SELECT fn_recuperacion_total_asignaturas(_id_matric) INTO _recuperaciones_total;
	SELECT fn_recuperacion_total_areas(_id_matric) INTO _areas_enrecuperacion;

	/*
	 Si el usuario especifica una nota máxima para las actividades de apoyo, se establece.
	*/
	IF _nota_max_rec > 0 THEN
		SET _desde = _nota_max_rec;
	END IF;

	OPEN cur_areasf;
	REPEAT
		FETCH cur_areasf INTO _n_mat,_id_sede,_cod_grado,_grupo,_id_jorn,n_año,_cod_area,_id_asig,
					_final,_recuperacion,_faltas,_injust,_retraso,_curso,_porcentaje;
		IF NOT done THEN
			SET _nota_real	= 0;
			SET _nota_real_recuperada = 0;
			SET _final_suma = 0;
			SET _cont_porcentaje = 0;
			/*
			  Nota de las actividades de apoyo en la asignatura,
			  si ha realizado actividades devuelve la nota, si no, devuelve 0.
			*/
			SELECT fn_recuperacion_notas(_id_matric, _curso) INTO _nota_recuperacion;
			SET done = 0;
			/*
			 Suma de las notas
			*/
			SET _nota_real = _nota_real + _final ;
			SET _nota_real_recuperada = _nota_real_recuperada +  _nota_recuperacion;
			IF _nota_recuperacion > _final THEN
				SET _final_suma = _final_suma + _nota_recuperacion;
			ELSE
				SET _final_suma = _final_suma + _final;
			END IF;
			/*
			 Se determina si el estudiante hizo actividades de apoyo de fin de año.
			*/
			IF _nota_recuperacion > 0 THEN
				SET _rec_especial = _rec_especial + 1;
				IF (_nota_recuperacion > _final) AND (_nota_recuperacion > _hasta) THEN
					SET _gana_rec = _gana_rec + 1;
				ELSE
					SET _pierde_rec = _pierde_rec + 1;
				END IF;
			END IF;

			SET _prom	= _final_suma;

			SET _cont_areas = _cont_areas + 1;
			SET _suma = _suma + _prom;
			/*
			 Se determina cuantas areas han estado en actividades de apoyo.
			*/
			IF _nota_real_recuperada > _w_sup THEN
				SET _total_areas_recuperadas = _total_areas_recuperadas + 1;
			END IF;
			/*
			 Se determina la cantidad de áreas perdidas y ganadas.
			*/
			IF _nota_real <=_w_sup THEN
				SET _areas_perdidas = _areas_perdidas + 1;
			ELSE
				SET _areas_ganadas = _areas_ganadas + 1;
			END IF;
			IF _prom <= _w_sup THEN
				SET _baj	= _baj + 1;
			ELSE
				SET _sup	= _sup + 1;
			END IF;
		END IF;
	UNTIL done END REPEAT;
	CLOSE cur_areasf;
	IF _recuperaciones_total > _rec_especial THEN
		SET _rec_especial = 0;
	END IF;
	IF _rec_especial > 0 THEN
		CASE  _pierde_luego_rec
			WHEN  1 THEN /*En caso de que el estudiante pierda una de las recuperaciones */
				IF _pierde_rec > 0 THEN  /*Si pierde una de las recuperaciones finales o especiales*/
					/* No promovido*/
					SET _estado = 3;
				ELSE /*Si no pierde las recuperaciones finales o especiales*/
						/*Promovido*/
						SET _estado = 1;
				END IF;
			WHEN 2 THEN /*En caso de que el estudiante pierda todas las recuperaciones*/
				CASE  _areas_pierde
					WHEN  3 THEN /*En caso que pierdan estudiantes con tres o más áreas*/
						IF _pierde_rec = _rec_especial THEN /* Si pierde todas las recuperaciones finales o especiales*/
							/*NO promovido*/
							SET _estado = 3;
						ELSE
							IF _gana_rec  =_rec_especial THEN /* Si gana todas las recuperaciones finales o especiales*/
								/*Promovido*/
								SET _estado = 1;
							ELSE
								/*Promovido con dificultad*/
								SET _estado = 2;
							END IF;
						END IF;
					WHEN  2 THEN /*En caso que pierdan estudiantes con 2 o más áreas*/
						IF _pierde_rec = _rec_especial THEN /*Si pierde todas las recuperaciones finales o especiales*/
							/*No promovido*/
							SET _estado = 3;
						ELSE
							IF _gana_rec = _rec_especial THEN /*Si gana todas las recuperaciones finales o especiales*/
								/*Promovido*/
								SET _estado = 1;
							ELSE
								/*Promovido con dificultad*/
								SET _estado = 2;
							END IF;
						END IF;
				ELSE
					SET _des = "ERROR EN EL SISTEMA, REPORTELO.";
				END CASE;
		ELSE
			IF _gana_rec = _rec_especial THEN /*Si gana todas las recuperaciones finales o especiales*/
				/*Promovido*/
				SET _estado = 1;
			ELSE
				IF _total_areas_recuperas = _areas_enrecuperacion THEN
					/*Promovido*/
					SET _estado = 1;
				ELSE
					/*No promovido*/
					SET _estado = 3;
				END IF;
			END IF;
		END CASE;
	ELSE
		IF  _baj < _areas_pierde THEN
	 		IF _baj = 0 THEN
	 			/*Promovido*/
				SET _estado = 1;
	 		ELSE
	 			/*Promovido con dificultad*/
				SET _estado = 2;
	 		END IF;
		 ELSE
			/*No promovido*/
			SET _estado = 3;
		 END IF;
	END IF;
	IF _suma > 0 THEN
		SET _prom = ROUND(_suma/_cont_areas,_n_decimales);
	END IF;
	SELECT estado_estudiante_normal(_estado, _cod_grado_prom, _id_inst) INTO _des;
	SELECT `fn_Getdesempeño`(_id_inst, _año, _prom,_cod_grado_prom) INTO `_desempeño`;
	SET _msg	 = CONCAT("ÁREAS PERDIDAS: ",_areas_perdidas," - ÁREAS GANADAS: ",_areas_ganadas," - TOTAL ÁREAS: ",_cont_areas);
	SET _msg1 = CONCAT("PONDERADO GENERAL POR ÁREAS: ",_prom," - DESEMPEÑO: ",_desempeño);
	SET _msg2 = _des;
	UPDATE acta_promocion
	SET msg = _msg2, msg1= _msg, msg2 = _msg1, estado=_estado, areas_p = _areas_perdidas, areas_g = _areas_ganadas
	WHERE id_matric = _id_matric;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_organice_ciud
DROP PROCEDURE IF EXISTS `sp_organice_ciud`;
DELIMITER //
CREATE PROCEDURE `sp_organice_ciud`()
BEGIN
	DECLARE result, _id INT DEFAULT 0;
  	DECLARE done INT DEFAULT 0;
  	DECLARE _dpto VARCHAR (11);
 	DECLARE cur_especiales CURSOR FOR SELECT t.id, t.dpto FROM departamentos t;
 	DECLARE CONTINUE HANDLER FOR SQLSTATE	 '02000' SET done	= 1;
 OPEN cur_especiales;
 REPEAT
 	FETCH cur_especiales INTO _id, _dpto;
 	IF NOT done THEN
 		UPDATE ciudades t SET t.dpto = _id WHERE t.dpto = _dpto;
 	END IF;
 UNTIL done END REPEAT;
 CLOSE cur_especiales;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_organice_dpto
DROP PROCEDURE IF EXISTS `sp_organice_dpto`;
DELIMITER //
CREATE PROCEDURE `sp_organice_dpto`()
BEGIN
	DECLARE result, _id INT DEFAULT 0;
  	DECLARE done INT DEFAULT 0;
  	DECLARE _dpto, _ciud VARCHAR (11);
 	DECLARE cur_especiales CURSOR FOR SELECT t.id, t.dpto FROM departamentos t;
 	DECLARE CONTINUE HANDLER FOR SQLSTATE	 '02000' SET done	= 1;
 OPEN cur_especiales;
 REPEAT
 	FETCH cur_especiales INTO _id, _dpto;
 	IF NOT done THEN
 		UPDATE inscripciones t SET t.dpto_lug_pobl = _id WHERE t.dpto_lug_pobl = _dpto;
 		UPDATE inscripciones t SET t.dpto_lug_nac = _id WHERE t.dpto_lug_nac = _dpto;
 		UPDATE inscripciones t SET t.dpto_lug_res = _id WHERE t.dpto_lug_res = _dpto;
 		UPDATE inscripciones t SET t.dpto_lug_exp = _id WHERE t.dpto_lug_exp = _dpto;

 		UPDATE docentes t SET t.dpto_exp = _id WHERE t.dpto_exp = _dpto;
 		UPDATE docentes t SET t.dpto_nac = _id WHERE t.dpto_nac = _dpto;

 		UPDATE administrativos t SET t.dep_lug_nac = _id WHERE t.dep_lug_nac = _dpto;
 		UPDATE administrativos t SET t.dep_lug_exp = _id WHERE t.dep_lug_exp = _dpto;

 		UPDATE familiares t SET t.dpto_Lug_exp = _id WHERE t.dpto_Lug_exp = _dpto;
 		UPDATE familiares t SET t.dpto_Lug_resid = _id WHERE t.dpto_Lug_resid = _dpto;
 		SET done = 0;
 	END IF;
 UNTIL done END REPEAT;
 CLOSE cur_especiales;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_organice_dpto_ciud
DROP PROCEDURE IF EXISTS `sp_organice_dpto_ciud`;
DELIMITER //
CREATE PROCEDURE `sp_organice_dpto_ciud`()
BEGIN
	DECLARE result, _id INT DEFAULT 0;
  	DECLARE done INT DEFAULT 0;
  	DECLARE _dpto, _ciud VARCHAR (11);
 	DECLARE cur_ciud CURSOR FOR SELECT t.id, t.mun, t.dpto FROM ciudades t;
 	DECLARE CONTINUE HANDLER FOR SQLSTATE	 '02000' SET done	= 1;

 OPEN cur_ciud;
 REPEAT
 	FETCH cur_ciud INTO _id, _ciud, _dpto;
 	IF NOT done THEN
 		UPDATE inscripciones t SET t.mun_lug_pobl = _id WHERE t.mun_lug_pobl = _ciud AND t.dpto_lug_pobl = _dpto;
 		UPDATE inscripciones t SET t.mun_lug_nac = _id WHERE t.mun_lug_nac = _ciud AND t.dpto_lug_nac = _dpto;
 		UPDATE inscripciones t SET t.mun_lug_res = _id WHERE t.mun_lug_res = _ciud AND t.dpto_lug_res = _dpto;
 		UPDATE inscripciones t SET t.mun_lug_exp = _id WHERE t.mun_lug_exp = _ciud AND t.dpto_lug_exp = _dpto;

 		UPDATE docentes t SET t.mun_exp = _id WHERE t.mun_exp = _ciud AND t.dpto_exp = _dpto;
 		UPDATE docentes t SET t.mun_nac = _id WHERE t.mun_nac = _ciud AND t.dpto_nac = _dpto;

 		UPDATE administrativos t SET t.mun_lug_nac = _id WHERE t.mun_lug_nac = _ciud AND t.dep_lug_nac = _dpto;
 		UPDATE administrativos t SET t.mun_lug_exp = _id WHERE t.mun_lug_exp = _ciud AND t.dep_lug_exp = _dpto;

 		UPDATE familiares t SET t.mun_lug_exp = _id WHERE t.mun_lug_exp = _ciud AND t.dpto_Lug_exp = _dpto;
 		UPDATE familiares t SET t.mun_lug_resid = _id WHERE t.mun_lug_resid = _ciud AND t.dpto_Lug_resid = _dpto;
 		SET done = 0;
 	END IF;
 UNTIL done END REPEAT;
 CLOSE cur_ciud;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_par_cont_tem
DROP PROCEDURE IF EXISTS `sp_par_cont_tem`;
DELIMITER //
CREATE PROCEDURE `sp_par_cont_tem`(IN `_id_parcelador` INT(20), IN `_type` INT(1))
BEGIN
	SELECT tc.id, tc.id_parcelador, RTRIM(tc.descripcion) AS descripcion, rtrim(ti.descripcion) AS descripcion_item FROM
    parcelador_con_tem AS tc JOIN parcelador_items_con_tem AS ti ON tc.tipo=ti.id
	WHERE tc.id_parcelador=_id_parcelador AND tc.tipo=_type AND tc.estado=1;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_periodic_leveling
DROP PROCEDURE IF EXISTS `sp_periodic_leveling`;
DELIMITER //
CREATE PROCEDURE `sp_periodic_leveling`(
	IN `report_type` INT,
	IN `p_period` INT,
	IN `year` INT,
	IN `p_grade_id` INT,
	IN `p_teacher_id` INT,
	IN `p_desde` DECIMAL(6,2),
	IN `p_hasta` DECIMAL(6,2)
)
BEGIN
	SELECT fn_return_table_notas(p_grade_id) INTO @p_table;
	IF report_type < 2 THEN
	  IF p_teacher_id > 0 THEN
	      SET @where_clause = CONCAT(
	          "tn.nota_perdida > 0 AND tm.id_state = 2
	          AND tn.periodo='", p_period,"' AND tm.year=", year,"
	          AND tn.year=", year," AND tc.year=", year,"
	          AND tc.id_docente=", p_teacher_id,"
	          ORDER BY tm.id_grade, tm.id_group, tm.id_study_day, estudiante, docente,tc.id_asig,tau.id_area"
	      );
	  	ELSE
	      SET @where_clause = CONCAT(
	          "tn.nota_perdida > 0 AND tm.id_state = 2 AND tm.id_grade='", p_grade_id,"'
	          AND tn.periodo='", period,"' AND tm.year=", year,"
	          AND tn.year=", year," AND tc.year=", year,"
	          AND tc.id_grado=", p_grade_id,"
	          AND tc.id_docente=", p_teacher_id,"
	          ORDER BY tm.id_grade, tm.id_group, tm.id_study_day, estudiante, docente,tc.id_asig,tau.id_area"
	      );
	  	END IF;
	ELSE
     	IF p_teacher_id > 0 THEN
         SET @where_clause = CONCAT(
             "tn.final BETWEEN '", desde,"' AND '", hasta,"' AND tm.id_state = 2
             AND tn.periodo='", p_periodo,"' AND tm.year=", year,"
             AND tn.year=", year," AND tc.year=", year,"
             AND tc.id_docente=", p_teacher_id,"
             ORDER BY tm.id_grade, tm.id_group, tm.id_study_day, estudiante, docente,tc.id_asig,tau.id_area"
         );
      ELSE
         SET @where_clause = CONCAT(
             "tn.final BETWEEN '", desde,"' AND '", hasta,"' AND tm.id_state = 2 AND tm.id_grade='", p_grade_id,"'
             AND tn.periodo='", p_periodo,"' AND tm.year=", year,"
             AND tn.year=", year," AND tc.year=", year,"
             AND tc.id_grado=", p_grade_id,"
             AND tc.id_docente=", p_teacher_id,"
             ORDER BY tm.id_grade, tm.id_group, tm.id_study_day, estudiante, docente,tc.id_asig,tau.id_area"
         );
      END IF;
	END IF;
	SET @querySql = CONCAT(
        "SELECT tn.periodo, tn.final, tn.nota_perdida, tn.nota_habilitacion,
        tn.fecha, tc.id_grado, tc.grupo, tc.year,
        tc.id_jorn, tc.id_sede, tc.id_asig, tc.id_docente,
        tn.id_escala conceptual, CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',RTRIM(te.nombre1),
        ' ',RTRIM(te.nombre2)) AS estudiante, te.id AS id_student, tm.id_state estado, tar.area, tar.abrev AS abre_area,
        tas.asignatura, tas.abrev AS abrev_asig, tau.id_area cod_area,
        CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
        ts.headquarters_name AS sede, tj.jornada, tg.grado, tg.cod_grado
        FROM ", @p_table, " AS tn
        JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
        JOIN student_enrollment AS tm ON tn.id_matric = tm.id
        JOIN inscripciones AS te ON tm.id_student = te.id
        JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
        JOIN aux_asignaturas AS tau ON (tau.id_asign = tas.id_pk  AND tau.year = tc.year)
        JOIN areas AS tar ON tau.id_area = tar.id
        JOIN docentes AS td ON tc.id_docente = td.id_docente
        JOIN sedes AS ts ON tc.id_sede = ts.id
        JOIN jornadas AS tj ON tc.id_jorn = tj.cod_jorn
        JOIN grados AS tg ON tc.id_grado = tg.id "
    );

   SET @sqlString = CONCAT(@querySql, " WHERE ", @where_clause);
   PREPARE smtp FROM @sqlString;
   EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_periodos_promedio
DROP PROCEDURE IF EXISTS `sp_periodos_promedio`;
DELIMITER //
CREATE PROCEDURE `sp_periodos_promedio`(
	IN `_grade` INT(11),
	IN `_grupo` VARCHAR(2),
	IN `_id_jorn` INT(2),
	IN `_year` YEAR,
	IN `_id_matric` INT(20),
	IN `_id_asig` INT(11),
	IN `_periodo` VARCHAR(2)
)
BEGIN
	DECLARE	done, _count INT DEFAULT 0;
	DECLARE	_suma,
				_prom,
				_nota DECIMAL(6,2) DEFAULT 0;
	DECLARE _table VARCHAR(30) DEFAULT '';
	SELECT fn_return_table_notas(_grade) INTO _table;
	SET @sqlQuery = CONCAT("SELECT ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS nota
			FROM  ",_table," AS tn
			JOIN cursos AS tc ON (tn.id_curso=tc.id AND tn.year=tc.`year`)
			JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
			JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tc.id_grado)
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
			WHERE tn.periodo  BETWEEN 1 AND '",_periodo,"' AND tm.id_grade = ",_grade," AND tm.id_group = '",_grupo,"'
			AND tm.year = ",_year,"	AND tm.id_study_day = ",_id_jorn,"
			AND tm.id = ",_id_matric," AND tc.`year` = ",_year," AND tc.id_asig = ",_id_asig,
			" AND tmc.`year` = ",_year," AND tmc.id_grado = ",_grade,
			" GROUP BY tn.id_matric, tc.id_asig;");
	PREPARE smtp FROM @sqlQuery;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_periodos_select
DROP PROCEDURE IF EXISTS `sp_periodos_select`;
DELIMITER //
CREATE PROCEDURE `sp_periodos_select`(
	IN `_grade` INT(11),
	IN `_grupo` VARCHAR(2),
	IN `_id_jorn` INT(1),
	IN `_year` YEAR,
	IN `_periodo` VARCHAR(2),
	IN `_id_matric` INT(30),
	IN `_id_asig` INT(11)
)
BEGIN
	DECLARE cTable VARCHAR(30) DEFAULT '';
	SELECT fn_return_table_notas(_grade) INTO  cTable;
	SET @sqlSelect = CONCAT("SELECT ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, final)),2) AS nota,
		tn.periodo FROM ",cTable," AS tn
		JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.`year` = tc.`year`)
      JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		WHERE tn.id_matric = ",_id_matric," AND tn.periodo = '",_periodo,"' AND tc.id_grado = ",
		_grade," AND tc.grupo = '",_grupo,"' AND tc.`year` = ",_year," AND tc.id_jorn = ",
		_id_jorn," AND tc.id_asig =",_id_asig," AND tm.id = ",
		_id_matric," LIMIT 1");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_prom_area
DROP PROCEDURE IF EXISTS `sp_prom_area`;
DELIMITER //
CREATE PROCEDURE `sp_prom_area`(
	IN `_enroll` INT(30),
	IN `_id_area` INT(11),
	IN `_periodo` VARCHAR(1),
	IN `_grade` INT(11),
	IN `_year` YEAR
)
BEGIN
	DECLARE _ndecim INT DEFAULT 0;
	DECLARE cTable	VARCHAR(30) DEFAULT '';
	SELECT tc.Ndecimales INTO _ndecim FROM config001 AS tc
	JOIN grados_agrupados AS t1 ON tc.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE tc.year = _year AND t2.id_grado = _grade LIMIT 1;
	SELECT fn_return_table_notas(_grade) INTO cTable;
SET @sqlSelect = CONCAT("SELECT au.id_area,
	ROUND(IF(tmc.porciento BETWEEN 1 AND 99,
	SUM(IF(tn.nota_habilitacion > 0,(tn.nota_habilitacion*tmc.porciento)/100,(tn.final*tmc.porciento)/100)),
	AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final))),",_ndecim,") AS prom
	FROM ",cTable," AS tn
	JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.`year` = tc.`year`)
	JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
	JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = tc.year)
	JOIN areas AS tar ON au.id_area = tar.id
	JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tc.id_grado)
	JOIN student_enrollment AS tm ON tn.id_matric = tm.id
	WHERE tn.periodo = '",_periodo,"' AND tn.id_matric = ",_enroll," AND tc.`year` = ",_year,
	" AND au.id_area = ",_id_area," AND tmc.`year` =",`_year`,"
	 AND tmc.id_grado = ",_grade," AND au.year = ",_year,"
	GROUP BY tn.id_matric, au.id_area, tn.periodo");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_prom_area_final
DROP PROCEDURE IF EXISTS `sp_prom_area_final`;
DELIMITER //
CREATE PROCEDURE `sp_prom_area_final`(
	IN `PYear` YEAR,
	IN `PEnrollment` INT(30),
	IN `PArea` INT(30),
	IN `PGrade` INT(11)
)
BEGIN
	DECLARE _ndecim,
			  _aplica,
			  _area INT(30) DEFAULT 0;
	DECLARE	_n_red,
			_n_final_red,
			_final DECIMAL(6,2) DEFAULT 0;
	SELECT tc.Ndecimales,tc.nota_redondeo,tc.nota_final_redondeo, tc.aplicar_redondeo_fin_año
	INTO _ndecim, _n_red, _n_final_red, _aplica
	FROM config001 AS tc
	JOIN grados_agrupados AS t1 ON tc.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE tc.year = PYear AND t2.id_grado = PGrade LIMIT 1;
	SELECT aux.id_area cod_area,
		ROUND(IF(tmc.porciento BETWEEN 1 AND 99,SUM((tn.final*tmc.porciento)/100),	AVG(tn.final)),_ndecim) AS prom
		INTO _area, _final FROM areasf AS tn
		JOIN cursos AS tc ON tn.id_curso = tc.id
		JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
		JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = PYear)
		JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tc.id_grado
		AND tmc.year = tc.year)
		JOIN areas AS tar ON aux.id_area = tar.id
		WHERE tc.year = PYear AND tm.id = PEnrollment AND tas.estado = 1
		AND tar.estado = 1 AND tmc.year = PYear AND tmc.estado = 1
		AND tar.id = PArea
		GROUP BY tn.id_matric, aux.id_area;
  	IF _n_red > 0 AND _aplica > 0 THEN
		IF _final BETWEEN _n_red AND _n_final_red THEN
			SELECT _area AS cod_area, _n_final_red AS prom;
		ELSE
			SELECT _area AS cod_area, _final AS prom;
		END IF;
	ELSE
		SELECT _area AS cod_area, _final AS prom;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_prom_por_area
DROP PROCEDURE IF EXISTS `sp_prom_por_area`;
DELIMITER //
CREATE PROCEDURE `sp_prom_por_area`(
	IN `PYear` YEAR,
	IN `PEnrollment` INT(30),
	IN `PCourse` INT(30),
	IN `PSubject` INT(11),
	IN `PNro` INT,
	IN `PGrade` INT(11),
	IN `_d` DECIMAL(6,2),
	IN `_a` DECIMAL(6,2),
	IN `_p` INT
)
BEGIN
	SELECT t.nota_redondeo,t.nota_final_redondeo, t.aplicar_redondeo_fin_año INTO @_n_red, @_n_final_red, @_aplica
	FROM config001 t
	JOIN grados_agrupados AS t1 ON t.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE t.year = PYear AND t2.id_grado = PGrade LIMIT 1;
	SELECT fn_return_table_notas(PGrade) INTO @stable;
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableNotas (
		id_matric INT(30) NOT NULL,
		id_asig	INT NOT NULL,
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2),
		prom	DECIMAL(6,2),
		porciento DECIMAL(6,2)
	);
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableAreas (
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2)
	);
	SET @sqlSelect =CONCAT("INSERT INTO tmpTableNotas (id_matric,id_asig,cod_area,final,prom,porciento) ",
			"SELECT tn.id_matric,tc.id_asig,aux.id_area,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS final,
			ROUND(AVG(IF(tn.nota_habilitacion > 0,tn.nota_habilitacion ,tn.final)),2) AS prom,
			tmc.porciento FROM ",@stable," AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
			JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
			JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = tc.year)
			JOIN matcurso AS tmc ON tmc.id_asig=tas.id_pk
			WHERE tn.id_matric = ",PEnrollment,"
			AND tc.year  =",PYear," AND tc.id_grado = ",PGrade,"
			AND tmc.year =",PYear," AND tmc.id_grado = ",PGrade,"
			GROUP BY tn.id_matric,aux.id_area,tc.id_asig
			ORDER BY tn.id_matric,aux.id_area,tc.id_asig");
	SET @sqlSelect2	= CONCAT("INSERT INTO tmpTableAreas (cod_area, final) ",
										"SELECT cod_area,AVG(prom) FROM tmpTableNotas GROUP BY cod_area");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
	PREPARE smtp FROM @sqlSelect2;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
	IF @_n_red > 0 AND @_aplica > 0 THEN
		UPDATE tmpTableAreas SET final = @_n_final_red WHERE final BETWEEN @_n_red AND @_n_final_red ;
	END IF;
	SELECT COUNT(*) INTO @nAr FROM tmpTableAreas  WHERE final BETWEEN _d AND _a;
	IF @nAr > 0 THEN
		IF @nAr < _p THEN
			SELECT id_asig, prom, cod_area INTO @nAsig, @_final, @nAr FROM tmpTableNotas WHERE id_asig = PSubject
			AND prom BETWEEN _d AND _a;
			SELECT final INTO @_prom FROM tmpTableAreas WHERE cod_area = @nAr LIMIT 1;
			IF @nAsig > 0 AND @_prom BETWEEN _d AND _a THEN
				CALL sp_insert_respeciales(PEnrollment, PNro, PCourse, @_final);
			END IF;
		END IF;
	END IF;
	DELETE FROM tmpTableNotas;
	DELETE FROM tmpTableAreas;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_prom_por_area_porcentaje
DROP PROCEDURE IF EXISTS `sp_prom_por_area_porcentaje`;
DELIMITER //
CREATE PROCEDURE `sp_prom_por_area_porcentaje`(
	IN `PYear` YEAR,
	IN `PEnrollment` INT(30),
	IN `PCourse` INT(30),
	IN `PSubject` INT(11),
	IN `PNro` INT,
	IN `PGrade` INT(11),
	IN `_d` DECIMAL(6,2),
	IN `_a` DECIMAL(6,2),
	IN `_p` INT
)
BEGIN
	SELECT fn_return_table_notas(PGrade) INTO @stable;

	SELECT t.nota_redondeo,t.nota_final_redondeo, t.aplicar_redondeo_fin_año INTO @_n_red, @_n_final_red, @_aplica
	FROM config001 t
	JOIN grados_agrupados AS t1 ON t.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE t.year = PYear AND t2.id_grado = PGrade LIMIT 1;

	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableNotas (
		id_matric INT(30) NOT NULL,
		id_asig	INT NOT NULL,
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2),
		prom	DECIMAL(6,2),
		porciento DECIMAL(6,2)
	);
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableAreas (
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2)
	);
	SET @sqlSelect =CONCAT("INSERT INTO tmpTableNotas (id_matric,id_asig,cod_area,final,prom,porciento) ",
			"SELECT tn.id_matric,tc.id_asig,aux.id_area,
			ROUND(AVG(IF(tn.nota_habilitacion > 0,(tn.nota_habilitacion*tmc.porciento)/100,
			(tn.final*tmc.porciento)/100)),2) AS final,
			ROUND(AVG(IF(tn.nota_habilitacion > 0,tn.nota_habilitacion ,tn.final)),2) AS prom,
			tmc.porciento FROM ",@stable," AS tn
			JOIN cursos AS tc ON (tn.id_curso=tc.id AND tn.year = tc.year)
			JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
			JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year =",PYear,")
			JOIN matcurso AS tmc ON tmc.id_asig=tas.id_pk
			WHERE tn.id_matric = ",PEnrollment," AND tc.year = ",PYear,
			" AND tc.id_grado =",PGrade," AND tmc.year=",PYear," AND tmc.id_grado = ",PGrade,"
			GROUP BY tn.id_matric,aux.id_area,tc.id_asig
			ORDER BY tn.id_matric,aux.id_area,tc.id_asig");
	SET @sqlSelect2	= CONCAT("INSERT INTO tmpTableAreas (cod_area, final) ",
										"SELECT cod_area,SUM(final) FROM tmpTableNotas GROUP BY cod_area");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
	PREPARE smtp FROM @sqlSelect2;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
	IF @_n_red > 0 AND @_aplica > 0 THEN
		UPDATE tmpTableAreas SET final = @_n_final_red WHERE final BETWEEN @_n_red AND @_n_final_red ;
	END IF;
	SELECT COUNT(*) INTO @nAr FROM tmpTableAreas  WHERE final BETWEEN _d AND _a;
	IF @nAr > 0 THEN
		IF @nAr < _p THEN
			SELECT id_asig, prom, cod_area INTO @nAsig, @_final, @nAr FROM tmpTableNotas WHERE id_asig = PSubject
			AND prom BETWEEN _d AND _a;
			SELECT final INTO @_prom FROM tmpTableAreas WHERE cod_area = @nAr LIMIT 1;
			IF @nAsig > 0 AND @_prom BETWEEN _d AND _a THEN
				CALL sp_insert_respeciales(PEnrollment, PNro, PCourse, @_final);
			END IF;
		END IF;
	END IF;
	DELETE FROM tmpTableNotas;
	DELETE FROM tmpTableAreas;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_prom_por_area_porcentaje_quinta
DROP PROCEDURE IF EXISTS `sp_prom_por_area_porcentaje_quinta`;
DELIMITER //
CREATE PROCEDURE `sp_prom_por_area_porcentaje_quinta`(
	IN `PYear` YEAR,
	IN `PEnrollment` INT(30),
	IN `PCourse` INT(30),
	IN `PSubject` INT(11),
	IN `PNro` INT,
	IN `PGrade` INT(11),
	IN `_d` DECIMAL(6,2),
	IN `_a` DECIMAL(6,2),
	IN `_p` INT,
	IN `_per` VARCHAR(2)
)
BEGIN
	SELECT fn_return_table_notas(PGrade) INTO @stable;
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableNotas (
		id_matric INT(30) NOT NULL,
		id_asig	INT NOT NULL,
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2),
		prom	DECIMAL(6,2),
		porciento DECIMAL(6,2)
	);
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableAreas (
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2)
	);
	SET @sqlSelect =CONCAT("INSERT INTO tmpTableNotas (id_matric,id_asig,cod_area,final,prom,porciento) ",
			"SELECT tn.id_matric,tc.id_asig,aux.id_area,
			IF(tn.nota_habilitacion > 0,
			ROUND(((tn.nota_habilitacion*tmc.porciento)/100),2),
			ROUND(((tn.final*tmc.porciento)/100),2)) AS final,
			ROUND((IF(tn.nota_habilitacion > 0,tn.nota_habilitacion ,tn.final)),2) AS prom,
			tmc.porciento FROM ",@stable," AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
			JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
			JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = tc.year)
			JOIN matcurso AS tmc ON tmc.id_asig=tas.id_pk
			WHERE tn.id_matric = ",PEnrollment,"
			AND tc.year =",PYear," AND tc.id_grado=",PGrade," AND tn.periodo ='",_per,"'
			AND tmc.year=",PYear," AND tmc.id_grado = ",PGrade,"
			GROUP BY tn.id_matric,aux.id_area,tc.id_asig
			ORDER BY tn.id_matric,aux.id_area,tc.id_asig");
	SET @sqlSelect2	= CONCAT("INSERT INTO tmpTableAreas (cod_area, final) ",
										"SELECT cod_area,SUM(final) FROM tmpTableNotas GROUP BY cod_area");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
	PREPARE smtp FROM @sqlSelect2;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
	SELECT COUNT(*) INTO @tAr FROM tmpTableAreas  WHERE final BETWEEN _d AND _a;
	IF @tAr > 0 THEN
		IF @tAr < _p THEN
			SET  @nAsig 	= 0;
			SET  @_final  	= 0;
			SET  @nAr		= 0;
			SET  @_prom		= 0;
			SELECT id_asig, prom, cod_area INTO @nAsig, @_final, @nAr FROM tmpTableNotas WHERE id_asig = PSubject
			AND prom BETWEEN _d AND _a;
			SELECT final INTO @_prom FROM tmpTableAreas WHERE cod_area = @nAr LIMIT 1;
			IF @nAsig > 0 AND @_prom BETWEEN _d AND _a THEN
				CALL sp_insert_respeciales(PEnrollment, PNro, PCourse, @_final);
			END IF;
		END IF;
	END IF;
	DELETE FROM tmpTableNotas;
	DELETE FROM tmpTableAreas;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_prom_por_area_quinta
DROP PROCEDURE IF EXISTS `sp_prom_por_area_quinta`;
DELIMITER //
CREATE PROCEDURE `sp_prom_por_area_quinta`(
	IN `PYear` YEAR,
	IN `PEnrollment` INT(30),
	IN `PCourse` INT(30),
	IN `PSubject` INT(11),
	IN `PNro` INT,
	IN `PGrade` INT(11),
	IN `_d` DECIMAL(6,2),
	IN `_a` DECIMAL(6,2),
	IN `_p` INT,
	IN `_per` VARCHAR(2)
)
BEGIN
		DECLARE cTable VARCHAR(20) DEFAULT "";
	DECLARE nAr,
				nAsig INT DEFAULT 0;
	DECLARE _final,_prom DECIMAL(6,2) DEFAULT 0;
	SELECT fn_return_table_notas(PGrade) INTO @stable;
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableNotas (
		id_matric INT(30) NOT NULL,
		id_asig	INT NOT NULL,
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2),
		prom	DECIMAL(6,2),
		porciento DECIMAL(6,2)
	);
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableAreas (
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2)
	);
	SET @sqlSelect =CONCAT("INSERT INTO tmpTableNotas (id_matric,id_asig,cod_area,final,prom,porciento) ",
			"SELECT tn.id_matric,tc.id_asig,aux.id_area,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS final,
			ROUND(AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final)),2) AS prom,
			tmc.porciento FROM ",@stable," AS tn
			JOIN cursos AS tc ON (tn.id_curso=tc.id AND tn.year = tc.year)
			JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
			JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = tc.year)
			JOIN matcurso AS tmc ON tmc.id_asig=tas.id_pk
			WHERE tn.id_matric = ",PEnrollment,"
			AND tc.year  = ",PYear," AND tc.id_grado=",PGrade," AND tn.periodo = '",_per,"'
			AND tmc.year =",PYear," AND tmc.id_grado = ",PGrade,"
			GROUP BY tn.id_matric,aux.id_area,tc.id_asig
			ORDER BY tn.id_matric,aux.id_area,tc.id_asig");
	SET @sqlSelect2	= CONCAT("INSERT INTO tmpTableAreas (cod_area, final) ",
										"SELECT cod_area,AVG(prom) FROM tmpTableNotas GROUP BY cod_area");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
	PREPARE smtp FROM @sqlSelect2;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
	SELECT COUNT(*) INTO @nAr FROM tmpTableAreas  WHERE final BETWEEN _d AND _a;
	IF @nAr > 0 THEN
		IF @nAr < _p THEN
			SELECT id_asig, prom, cod_area INTO @nAsig, @_final, @nAr FROM tmpTableNotas WHERE id_asig = PSubject
			AND prom BETWEEN _d AND _a;
			SELECT final INTO @_prom FROM tmpTableAreas WHERE cod_area = @nAr LIMIT 1;
			IF @nAsig > 0 AND @_prom BETWEEN _d AND _a THEN
				CALL sp_insert_respeciales(PEnrollment, PNro, PCourse, @_final);
			END IF;
		END IF;
	END IF;
	DELETE FROM tmpTableNotas;
	DELETE FROM tmpTableAreas;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_prom_por_asignaturas
DROP PROCEDURE IF EXISTS `sp_prom_por_asignaturas`;
DELIMITER //
CREATE PROCEDURE `sp_prom_por_asignaturas`(
	IN `PYear` YEAR,
	IN `PEnrollment` INT(30),
	IN `PCourse` INT(30),
	IN `PSubject` INT,
	IN `PNro` INT,
	IN `PGrade` INT(11),
	IN `_d` DECIMAL(6,2),
	IN `_a` DECIMAL(6,2),
	IN `_p` INT
)
BEGIN
	SELECT fn_return_table_notas(PGrade) INTO @stable;
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableNotas (
		id_matric INT(30) NOT NULL,
		id_asig	INT NOT NULL,
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2),
		prom	DECIMAL(6,2),
		porciento DECIMAL(6,2)
	);
	SET @sqlSelect =CONCAT("INSERT INTO tmpTableNotas (id_matric,id_asig,cod_area,final,prom,porciento) ",
			"SELECT tn.id_matric,tc.id_asig,aux.id_area,
			ROUND(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final),2) AS final,
			ROUND(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final),2) AS prom,
			tmc.porciento FROM ",@stable," AS tn
			JOIN cursos As tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
			JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
			JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = tc.year)
			JOIN matcurso AS tmc ON tmc.id_asig=tas.id_pk
			WHERE tn.id_matric = ",PEnrollment,"
			AND tc.year =",PYear," AND tc.id_grado =",PGrade,"
			AND tmc.year =",PYear," AND tmc.id_grado = ",PGrade,"
			GROUP BY tn.id_matric,aux.id_area,tc.id_asig
			ORDER BY tn.id_matric,aux.id_area,tc.id_asig");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;

	SELECT COUNT(*) INTO @nAr FROM tmpTableNotas  WHERE final BETWEEN _d AND _a;
	IF @nAr > 0 THEN
		IF @nAr < _p THEN
			SELECT id_asig, prom INTO @nAsig, @_final FROM tmpTableNotas WHERE id_asig = PSubject
			AND prom BETWEEN _d AND _a;
			IF @nAsig > 0 THEN
				CALL sp_insert_respeciales(PEnrollment, PNro, PCourse, @_final);
			END IF;
		END IF;
	END IF;
	DELETE FROM tmpTableNotas;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_prom_por_asignaturas_quinta
DROP PROCEDURE IF EXISTS `sp_prom_por_asignaturas_quinta`;
DELIMITER //
CREATE PROCEDURE `sp_prom_por_asignaturas_quinta`(
	IN `PYear` YEAR,
	IN `PEnrollment` INT(30),
	IN `PCourse` INT(30),
	IN `PSubject` INT(11),
	IN `PNro` INT,
	IN `PGrade` INT(11),
	IN `_d` DECIMAL(6,2),
	IN `_a` DECIMAL(6,2),
	IN `_p` INT,
	IN `_per` VARCHAR(2)
)
BEGIN
	SELECT fn_return_table_notas(PGrade) INTO @stable;
	CREATE TEMPORARY TABLE IF NOT EXISTS tmpTableNotas (
		id_matric INT(30) NOT NULL,
		id_asig	INT NOT NULL,
		cod_area	INT NOT NULL,
		final	DECIMAL(6,2),
		prom	DECIMAL(6,2),
		porciento DECIMAL(6,2)
	);
	SET @sqlSelect =CONCAT("INSERT INTO tmpTableNotas (id_matric,id_asig,cod_area,final,prom,porciento) ",
			"SELECT tn.id_matric,tc.id_asig,aux.id_area,
			ROUND(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion,tn.final),2) AS final,
			ROUND(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion,tn.final),2) AS prom,
			tmc.porciento FROM ",@stable," AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year )
			JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
			JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = tc.year)
			JOIN matcurso AS tmc ON tmc.id_asig=tas.id_pk
			WHERE tn.id_matric = ",PEnrollment,"
			AND tc.year = ",PYear," AND tc.id_grado=",PGrade," AND tn.periodo ='",_per,"'
			AND tmc.year =",PYear," AND tmc.id_grado = ",PGrade,"
			GROUP BY tn.id_matric,aux.id_area,tc.id_asig
			ORDER BY tn.id_matric,aux.id_area,tc.id_asig");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;

	SELECT COUNT(*) INTO @nAr FROM tmpTableNotas  WHERE final BETWEEN _d AND _a;
	IF @nAr > 0 THEN
		IF @nAr < _p THEN
			SELECT id_asig, prom INTO @nAsig, @_final FROM tmpTableNotas WHERE id_asig = PSubject
			AND prom BETWEEN _d AND _a;
			IF @nAsig > 0 THEN
				CALL sp_insert_respeciales(PEnrollment, PNro, PCourse, @_final);
			END IF;
		END IF;
	END IF;
	DELETE FROM tmpTableNotas;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_puestos_generate
DROP PROCEDURE IF EXISTS `sp_puestos_generate`;
DELIMITER //
CREATE PROCEDURE `sp_puestos_generate`(
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_id_study_day` INT(1),
	IN `_id_head` INT(30),
	IN `_year` YEAR,
	IN `_period` VARCHAR(1)
)
BEGIN
	DECLARE 	done,
				_id_matric,
				_id_matric_n,
				_total,
				_puesto,
				_type_puesto INT DEFAULT 0;
	DECLARE 	_prom,
				_n_max,
				_n_min DECIMAL(6,2) DEFAULT 0;
	DECLARE  _SQL TEXT DEFAULT '';
	DECLARE 	_per VARCHAR(1) DEFAULT '';
	DECLARE cTable VARCHAR(30) DEFAULT '';
	DECLARE curs  CURSOR FOR SELECT t.id_matric,ROUND(AVG(t.prom),2) AS prom, t.periodo, MIN(t.nmin) min, MAX(t.nmax) max
			FROM tb_promedios t
			JOIN student_enrollment AS b ON t.id_matric = b.id
			JOIN inscripciones AS c ON b.id_student = c.id
			WHERE t.id_matric = b.id AND b.id_headquarters = _id_head AND
			b.id_study_day = _id_study_day AND b.id_grade = _grade AND
			b.id_group = _group AND t.periodo = _period
			GROUP BY id_matric,periodo
			ORDER BY prom DESC, max DESC, CONCAT(c.apellido1, c.apellido2, c.nombre1, c.nombre2);
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	SELECT t.prom_area_puesto INTO _type_puesto FROM config001 t
	JOIN grados_agrupados AS t1 ON t.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE t.`year` = _year AND t2.id_grado = _grade LIMIT 1;

	SELECT COUNT(*) INTO _total FROM student_enrollment AS tm
					WHERE tm.id_grade = _grade AND tm.id_group = _group AND
					tm.id_study_day = _id_study_day AND tm.id_headquarters = _id_head AND
					tm.`year` = _year AND tm.id_state = 2;

	SELECT fn_return_table_notas(_grade) INTO cTable;
	DELETE FROM tb_promedios WHERE EXISTS(
		SELECT * FROM tb_promedios AS b
		JOIN student_enrollment AS c ON b.id_matric = c.id
		WHERE b.id_matric = c.id AND c.id_headquarters = _id_head AND
		c.id_grade = _grade AND c.id_study_day = _id_study_day AND
		c.id_group = _group AND b.periodo = _period
	);

	IF _type_puesto = 1 THEN /* Promedio por áreas */
		SET @sqlSelect = CONCAT("INSERT INTO tb_promedios (id_matric,prom,periodo,nmin,nmax)
			SELECT tm.id,
			ROUND(IF(tmc.porciento BETWEEN 1 AND 99,
			SUM(IF(tn.nota_habilitacion > 0,(tn.nota_habilitacion*tmc.porciento)/100,(tn.final*tmc.porciento)/100)),
			AVG(IF(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final))),2) AS prome,
			tn.periodo,
			MIN(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) AS nmin,
			MAX(if(tn.nota_habilitacion > 0,tn.nota_habilitacion, tn.final)) AS nmax
			FROM ",cTable," AS tn
			JOIN cursos AS tc ON tn.id_curso = tc.id
			JOIN student_enrollment AS tm ON tn.id_matric = tm.id
			JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
			JOIN aux_asignaturas AS au ON (au.id_asign = ta.id_pk AND au.year = tc.year)
			JOIN matcurso AS tmc ON (tmc.id_grado = tc.id_grado AND tmc.id_asig = ta.id_pk)
			WHERE tm.id_state=2 AND tm.id_grade = '",_grade,"' AND tm.id_group='",_group,"' AND
			tm.year= ",_year," AND tm.id_headquarters= ",_id_head," AND
			tn.periodo = '",_period,"' AND tm.id_study_day= ",_id_study_day," AND
			tmc.id_grado = '",_grade,"' AND tmc.`year` = ",_year," AND
			tmc.estado = 1 AND ta.estado = 1 AND ta.electiva = 0
			GROUP BY tn.id_matric, tm.id_grade, tm.id_group, tn.periodo, tm.year,au.id_area
			ORDER BY prome DESC, nmax DESC;");

		PREPARE smtp FROM @sqlSelect;
		EXECUTE smtp;
		DEALLOCATE PREPARE smtp;
		OPEN curs;
		REPEAT
			FETCH curs INTO _id_matric_n,_prom,_per,_n_min,_n_max;
			IF NOT done THEN
				SET _puesto = _puesto +1;
				SET _SQL	= CONCAT(_SQL,"('",_id_matric_n,"','",_total,"','",_puesto,"','",_prom,"','",_n_max,"','",
					_n_min,"','",_per,"'),");
			END IF;
		UNTIL done END REPEAT;
		CLOSE curs;

		DELETE FROM puestos  WHERE id_matric IN (SELECT id FROM student_enrollment AS t2
							WHERE t2.id = id_matric AND t2.id_headquarters = _id_head AND
							t2.id_grade = _grade AND t2.id_group = _group AND t2.id_study_day = _id_study_day
							AND t2.`year` = _year) AND periodo = _period;
		IF LENGTH(_SQL) > 0 THEN
			SET @sqlInsert = CONCAT("INSERT INTO puestos (id_matric,total,puesto,prom,nota_max,nota_min,periodo) VALUES ",
								 LEFT(_SQL, LENGTH(_SQL)-1),";");
			PREPARE smtp FROM @sqlInsert;
			EXECUTE smtp;
			DEALLOCATE PREPARE smtp;
		END IF;
	ELSE
		DELETE FROM puestos  WHERE id_matric IN (SELECT id FROM student_enrollment AS t2
							WHERE t2.id = id_matric AND t2.id_headquarters = _id_head AND
						   t2.id_grade = _grade AND t2.id_group = _group AND
							t2.id_study_day = _id_study_day AND t2.`year` = _year) AND
							periodo = _period;

		SET @sqlSelect = CONCAT("INSERT INTO puestos (id_matric,prom,periodo,nota_min,nota_max,puesto,total)
			SELECT tm.id, ROUND(AVG(if(nota_habilitacion > 0,nota_habilitacion, final)),2) AS prome,
			tn.periodo,
			MIN(if(nota_habilitacion > 0,nota_habilitacion, final)) AS nmin,
			MAX(if(nota_habilitacion > 0,nota_habilitacion, final)) AS nmax,
			ROW_NUMBER() OVER (PARTITION BY periodo ORDER BY prome DESC, nmax DESC) AS puesto,",
			_total," FROM ",cTable," AS tn
			JOIN cursos AS tc ON tn.id_curso = tc.id
		   JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		   JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
			WHERE tm.id_state=2 AND tm.id_grade = ",_grade," AND tm.id_group= '",_group,"' AND
			tm.year= ",_year," AND tm.id_headquarters= ",_id_head," AND
			tn.periodo = '",_period,"' AND tm.id_study_day= ",_id_study_day," AND ta.estado = 1 AND ta.electiva = 0
			GROUP BY tn.id_matric, tm.id_grade, tm.id_group, tn.periodo, tm.year
			ORDER BY puesto, prome DESC, nmax DESC");
		PREPARE smtp FROM @sqlSelect;
		EXECUTE smtp;
		DEALLOCATE PREPARE smtp;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_puestos_select
DROP PROCEDURE IF EXISTS `sp_puestos_select`;
DELIMITER //
CREATE PROCEDURE `sp_puestos_select`(IN `_id_inst` INT(20), IN `_id_sede` INT(20), IN `_cod_grado` VARCHAR(2) CHARSET utf8, IN `_grupo` VARCHAR(2) CHARSET utf8, IN `_id_jorn` INT(1), IN `_año` YEAR, IN `_periodo` VARCHAR(1) CHARSET utf8)
BEGIN
	SELECT tp.*,tm.cod_grado, tm.grupo FROM puestos AS tp
		 JOIN matriculas  AS tm ON tp.id_matric = tm.id_matric
		 WHERE tm.cod_grado = _cod_grado AND tm.grupo = _grupo AND tm.id_jorn = _id_jorn AND
		 tm.id_sede = _id_sede AND tm.id_inst = _id_inst AND tm.`año` = `_año` AND tp.periodo = _periodo;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_acta_promocion
DROP PROCEDURE IF EXISTS `sp_select_acta_promocion`;
DELIMITER //
CREATE PROCEDURE `sp_select_acta_promocion`(
	IN `PGrade` INT(11),
	IN `PGroup` VARCHAR(2),
	IN `PStudyDay` INT(2),
	IN `PHeadq` INT(20),
	IN `PYear` YEAR
)
BEGIN
	SET @sgroup = '';
	IF LENGTH(PGroup) > 0 THEN
			SET @sgroup = CONCAT(" AND tm.id_group = ",PGroup);
	END IF;
	SET @sqlSelect = CONCAT("SELECT ta.msg,ta.promedio, ta.promedio_rec, ta.prom_comision,tg.cod_grado,
	tm.id_group grupo, tx.abrev_sexo sexo,
	CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) estudiante,
	RTRIM(tg.grado) grado, RTRIM(tj.jornada) jornada, RTRIM(ts.headquarters_name) sede, tm.year, tm.id, tm.id_grade
	FROM acta_promocion AS ta
	JOIN student_enrollment AS tm ON ta.id_matric = tm.id
	JOIN inscripciones AS te ON tm.id_student = te.id
	JOIN sexo AS tx ON te.id_sexo = tx.id
	JOIN grados tg ON tm.id_grade = tg.id
	JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	WHERE tm.id_grade = ",PGrade," AND tm.id_study_day = ",PStudyDay," AND
	tm.id_state = 2  AND tm.id_headquarters = ",PHeadq," AND tm.year = ",PYear,"
	ORDER BY tm.id_grade, tm.id_group,ta.estado,sexo,estudiante");

	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_areasf
DROP PROCEDURE IF EXISTS `sp_select_areasf`;
DELIMITER //
CREATE PROCEDURE `sp_select_areasf`(
	IN `PYear` YEAR,
	IN `PSede` INT(30),
	IN `PGrade` INT(11),
	IN `PGroup` VARCHAR(2),
	IN `PStudyDay` INT(1),
	IN `PEnrollment` INT(30),
	IN `PDist` INT(1)
)
    SQL SECURITY INVOKER
BEGIN
	SET @enrollment = "";
	IF PEnrollment > 0 THEN
		SET @enrollment = CONCAT(" AND tm.id=",PEnrollment," ");
	END IF;
	IF PDist > 0 THEN
		SET @sqlSelect = CONCAT("SELECT tm.id_headquarters id_sede,tm.id_grade cod_grado,tm.id_group grupo,tj.cod_jorn,tm.year,
				aux.id_area cod_area,tc.id_asig,ta.final,ta.recuperacion,
				ta.faltas,ta.injustificadas,ta.retraso,ta.estado,RTRIM(ts.headquarters_name) As sede,tg.grado,tj.jornada,
		      RTRIM(tar.area) area,RTRIM(tas.asignatura) asignatura,
			   concat(rtrim(te.apellido1),' ',rtrim(te.apellido2),' ',rtrim(te.nombre1),' ',rtrim(te.nombre2))
			   as estudiante,tm.id id_matric,RIGHT(CONCAT('0000',tm.folio),4) id_folio,te.id_documento cod_doc,
				tx.abrev_sexo sexo,ct.id_dept AS dpto_lug_exp, te.lug_expedicion AS mun_lug_exp,
				te.nro_documento AS nro_doc_id,tas.excluir,
				tas.electiva,te.id cod_est, RIGHT(CONCAT('0000',tm.registration_number),4) nro_matricula,
				RIGHT(CONCAT('0000',tm.book),4) libro_mat, tmc.ih,
		      tp.promedio, tp.promedio_rec,tp.prom_comision,tp.msg,tp.msg1,tp.msg2,tp.msg3,
				RTRIM(ac.nombre) asignaturac,ac.ih ihc, es.nombre_escala
				FROM areasf AS ta
				JOIN cursos AS tc ON ta.id_curso = tc.id
		      JOIN student_enrollment AS tm ON ta.id_matric=tm.id
				JOIN sedes AS ts ON tm.id_headquarters	= ts.id
			   JOIN grados AS tg ON tm.id_grade			= tg.id
				JOIN jornadas AS tj ON tm.id_study_day	= tj.cod_jorn
			   JOIN asignaturas AS tas ON tc.id_asig	= tas.id_pk
			   JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = ",PYear,")
		      JOIN areas AS tar ON aux.id_area = tar.id
				JOIN inscripciones AS te ON tm.id_student = te.id
				JOIN cities AS ct ON te.lug_expedicion = ct.id
				JOIN sexo AS tx ON te.id_sexo = tx.id
				JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tg.id AND tmc.`year` = ",PYear,")
				JOIN acta_promocion AS tp ON tp.id_matric = ta.id_matric
				JOIN asignaturas_certificados AS ac ON ac.id_asig_padre = tas.id_pk
				JOIN `desempeños` AS td ON (ta.final BETWEEN td.desde AND td.hasta AND td.year = ",PYear,")
				JOIN escala_nacional AS es ON td.id_escala = es.id
				JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id
				JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
				WHERE tc.`year` = ",`PYear`," AND tc.id_grado = ",PGrade,"
				AND tm.year = ",PYear," AND tm.id_grade  = ",PGrade," AND tm.id_group = '",PGroup,"'
				AND tm.id_study_day = ",PStudyDay," AND tm.id_state = 2 AND tm.id_headquarters = ",PSede,"
				AND tar.estado = 1 AND tas.estado = 1 AND tmc.estado = 1
				AND tmc.id_grado = ",PGrade,"	AND ac.estado = 1
				AND td.`year` = ",`PYear`," AND t2.id_grado = ",PGrade,@enrollment,"
		      ORDER BY estudiante,tar.ordenar,tar.id,tas.ordenar");
		   PREPARE smtp FROM @sqlSelect;
		   EXECUTE smtp;
		   DEALLOCATE PREPARE smtp;
	ELSE
		SET @sqlSelect = CONCAT("SELECT tm.id_headquarters id_sede,tm.id_grade cod_grado,tm.id_group grupo,tj.cod_jorn,tm.year,
			aux.id_area cod_area,tc.id_asig,ta.p1,ta.p2,ta.p3,ta.p4,ta.final,ta.recuperacion,
			ta.faltas,ta.injustificadas,ta.retraso,ta.estado,RTRIM(ts.headquarters_name) As sede,tg.grado,tj.jornada,
	      RTRIM(tar.area) area,RTRIM(tas.asignatura) asignatura,
		   concat(rtrim(te.apellido1),' ',rtrim(te.apellido2),' ',rtrim(te.nombre1),' ',rtrim(te.nombre2))
		   as estudiante,tm.id id_matric,RIGHT(CONCAT('0000',tm.folio),4) id_folio,te.id_documento cod_doc,
			tx.abrev_sexo sexo,ct.id_dept AS dpto_lug_exp, te.lug_expedicion mun_lug_exp, te.nro_documento nro_doc_id,
			tas.excluir,tas.electiva,te.id cod_est, RIGHT(CONCAT('0000',tm.registration_number),4) nro_matricula,
			RIGHT(CONCAT('0000',tm.book),4) libro_mat, tmc.ih, tp.promedio, tp.promedio_rec,tp.prom_comision,
			tp.msg,tp.msg1,tp.msg2,tp.msg3, tn.nombre_nivel, es.nombre_escala
			FROM areasf AS ta
			JOIN cursos AS tc ON ta.id_curso = tc.id
	      JOIN student_enrollment AS tm ON ta.id_matric=tm.id
			JOIN sedes AS ts ON tm.id_headquarters=ts.id
		   JOIN grados AS tg ON tm.id_grade=tg.id
			JOIN jornadas AS tj ON tm.id_study_day =tj.cod_jorn
		   JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
		   JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk  AND aux.year = ",PYear,")
	      JOIN areas AS tar ON aux.id_area=tar.id
			JOIN inscripciones AS te ON tm.id_student = te.id
			JOIN sexo AS tx ON te.id_sexo = tx.id
			JOIN cities AS ct ON te.lug_expedicion = ct.id
			JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tc.id_grado AND tmc.`year` = ",PYear,")
			JOIN acta_promocion AS tp ON tp.id_matric = ta.id_matric
			JOIN niveles_estudio AS tn ON tg.id_nivel = tn.id
			JOIN `desempeños` AS td ON (ta.final BETWEEN td.desde AND td.hasta AND td.year = ",PYear,")
			JOIN escala_nacional AS es ON td.id_escala = es.id
			JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id
			JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
			WHERE tc.`year` = ",`PYear`," AND tc.id_grado = ",PGrade," AND tm.year = ",PYear,"
			AND tm.id_headquarters = ",PSede," AND tm.id_grade = ",PGrade," AND tm.id_group = '",PGroup,"'
			AND tm.id_study_day = ",PStudyDay," AND tm.id_state = 2 AND
			tar.estado = 1 AND tas.estado = 1 AND tmc.`year` = ",`PYear`," AND tmc.estado = 1
			AND td.`year` = ",`PYear`," AND t2.id_grado = ",PGrade,@enrollment,"
	      ORDER BY estudiante,tar.ordenar,tar.id,tas.ordenar");
      PREPARE smtp FROM @sqlSelect;
	   EXECUTE smtp;
	   DEALLOCATE PREPARE smtp;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_areasf_agrupada
DROP PROCEDURE IF EXISTS `sp_select_areasf_agrupada`;
DELIMITER //
CREATE PROCEDURE `sp_select_areasf_agrupada`(
	IN `PYear` YEAR,
	IN `PHeadq` INT(30),
	IN `PGrade` INT(11),
	IN `PGroup` VARCHAR(2),
	IN `PDay` INT(1),
	IN `PEnrollment` INT(30)
)
BEGIN
	SELECT tc.Ndecimales INTO @ndecim
		FROM config001 AS tc
		JOIN grados_agrupados AS t1 ON tc.id_grupo_grados = t1.id
		JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
		WHERE tc.year = PYear AND t2.id_grado = PGrade LIMIT 1;
	SET @sqlWhere = "";
	IF PEnrollment > 0 THEN
		SET @sqlWhere = CONCAT("tm.id = ",PEnrollment," AND ");
	END IF;
	SET @sqlSelect = CONCAT("SELECT tm.id_headquarters AS id_sede,tm.id_grade, tg.cod_grado,tm.id_group grupo,tj.cod_jorn,tm.year,
		aux.id_area cod_area,ta.recuperacion,
		ta.faltas,ta.injustificadas,ta.retraso,ta.estado,RTRIM(ts.headquarters_name) As sede,tg.grado,tj.jornada,
      RTRIM(tar.area) area,
	   concat(rtrim(te.apellido1),' ',rtrim(te.apellido2),' ',rtrim(te.nombre1),' ',rtrim(te.nombre2))
	   as estudiante,tm.id id_matric,RIGHT(CONCAT('0000',tm.folio),4) id_folio,te.id_documento cod_doc,
		tx.abrev_sexo sexo,ct.id_dept AS dpto_lug_exp, te.lug_expedicion AS mun_lug_exp, te.nro_documento AS nro_doc_id,
		tas.excluir,tas.electiva,te.id cod_est, RIGHT(CONCAT('0000',tm.registration_number),4) nro_matricula,
		RIGHT(CONCAT('0000',tm.book),4) libro_mat,SUM(tmc.ih) ih,
      tp.promedio, tp.promedio_rec,tp.prom_comision,tp.msg,tp.msg1,tp.msg2,tp.msg3,
      ROUND(IF(tmc.porciento BETWEEN 1 AND 99,
		SUM(IF(ta.recuperacion > 0,(ta.recuperacion*tmc.porciento)/100,(ta.final*tmc.porciento)/100)),
		AVG(IF(ta.recuperacion > 0, ta.recuperacion, ta.final))),",@ndecim,") AS final,  es.nombre_escala
		FROM areasf AS ta
		JOIN cursos AS tc ON ta.id_curso = tc.id
      JOIN student_enrollment AS tm ON ta.id_matric=tm.id
		JOIN sedes AS ts ON tm.id_headquarters=ts.id
	   JOIN grados AS tg ON tm.id_grade =tg.id
		JOIN jornadas AS tj ON tm.id_study_day=tj.cod_jorn
	   JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
	   JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = ",PYear,")
      JOIN areas AS tar ON aux.id_area=tar.id
		JOIN inscripciones AS te ON tm.id_student = te.id
		JOIN sexo AS tx ON te.id_sexo = tx.id
		JOIN cities AS ct ON te.lug_expedicion = ct.id
		JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tg.id AND
		tmc.year = tc.year)
		JOIN acta_promocion AS tp ON tp.id_matric = ta.id_matric
		JOIN `desempeños` AS td ON (ta.final BETWEEN td.desde AND td.hasta)
		JOIN escala_nacional AS es ON td.id_escala = es.id
		JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id
		JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
		WHERE tc.year = ",`PYear`," AND tc.id_grado = ",PGrade," AND tm.year =",PYear," AND
		tm.id_grade =",PGrade," AND tm.id_group ='",PGroup,"' AND tm.id_study_day =",PDay," AND
		tm.id_state = 2 AND ",@sqlWhere," tm.id_headquarters = ",PHeadq," AND
		tas.estado = 1 AND tar.estado = 1  AND tmc.year = ",`PYear`," AND tmc.estado = 1 AND
		tmc.id_grado = ",PGrade," AND td.year =",`PYear`," AND t2.id_grado =",PGrade,"
		GROUP BY ta.id_matric,tar.id
      ORDER BY estudiante,tar.ordenar");

   PREPARE smtp FROM @sqlSelect;
   EXECUTE smtp;
   DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_areasf_grado
DROP PROCEDURE IF EXISTS `sp_select_areasf_grado`;
DELIMITER //
CREATE PROCEDURE `sp_select_areasf_grado`(IN `_cod_grado` VARCHAR(2) charset utf8, IN `_id_sede` INT(20), IN `_año` YEAR)
BEGIN
	SELECT ta.*,tm.`año`,ts.nom_sede As sede,tg.grado,tj.jornada,tar.area,tas.asignatura,tas.cod_area,tm.id_sede,tm.grupo,
	   concat(rtrim(te.apellido1),' ',rtrim(te.apellido2),' ',rtrim(te.nombre1),' ',rtrim(te.nombre2))
	   as estudiantes,tm.id_matric,tm.id_folio,te.cod_doc,te.sexo,te.dpto_lug_exp,tm.id_folio, tm.nro_matricula,
        te.mun_lug_exp, te.nro_doc_id,tas.excluir,tas.electiva,tm.cod_est,tm.cod_grado, tm.id_jorn AS cod_jorn
		FROM areasf AS ta
		JOIN  matriculas AS tm ON ta.id_matric=tm.id_matric
		JOIN sedes AS ts ON tm.id_sede=ts.id
	   JOIN grados AS tg ON tm.cod_grado=tg.cod_grado
		JOIN jornadas AS tj ON tm.id_jorn = tj.cod_jorn
		JOIN asignaturas AS tas ON ta.id_asig=tas.id
		JOIN areas AS tar ON tas.cod_area = tar.cod_area
		JOIN inscripciones AS te ON tm.cod_est = te.cod_est
		WHERE tm.id_sede= _id_sede and tm.cod_grado= _cod_grado
	 	and tm.año=_año AND tar.año=_año AND tas.año=_año
		ORDER BY tm.cod_grado,tm.id_jorn,tm.grupo,estudiantes,tar.cod_area,ta.id_asig;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_bancocli
DROP PROCEDURE IF EXISTS `sp_select_bancocli`;
DELIMITER //
CREATE PROCEDURE `sp_select_bancocli`(IN `_id_inst` INT(20), IN `_cod_grado` VARCHAR(2) charset utf8, IN `_id_asig` INT(2), IN `_periodo` VARCHAR(2) charset utf8, IN `_tipo` INT(1), IN `_limit` TINYINT, IN `_min` INT(6), IN `_max` INT(6))
BEGIN
	if _limit = 1 then
		select tb.*, tg.grado, ta.descripcion AS asignatura from banco_cli AS tb
		JOIN grados as tg on tb.cod_grado=tg.cod_grado
		JOIN asignaturas_banco as ta on tb.id_asig=ta.id where
		tb.period=_periodo and tb.cod_grado=_cod_grado and tb.id_ins=_id_inst
		and tb.id_asig=_id_asig and tb.tipo=_tipo limit _min, _max;
	else
		select tb.*, tg.grado, ta.descripcion AS asignatura from banco_cli AS tb
		JOIN grados as tg on tb.cod_grado=tg.cod_grado
		JOIN asignaturas_banco as ta on tb.id_asig=ta.id where
		tb.period=_periodo and tb.cod_grado=_cod_grado and tb.id_ins=_id_inst
		and tb.id_asig=_id_asig and tb.tipo=_tipo;
    end if;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_boletines
DROP PROCEDURE IF EXISTS `sp_select_boletines`;
DELIMITER //
CREATE PROCEDURE `sp_select_boletines`(IN `_cod_grado` VARCHAR(2) CHARSET utf8, IN `_grupo` VARCHAR(2) CHARSET utf8, IN `_cod_jorn` INT(1), IN `_id_sede` INT(20), IN `_año` YEAR, IN `_periodo` VARCHAR(1) CHARSET utf8, IN `_id_inst` INT(20))
BEGIN
IF _cod_grado>= '21' AND _cod_grado <='26' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp003 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSEIF _cod_grado>= '01' AND _cod_grado<='05' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp001 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSEIF _cod_grado>= '06' AND _cod_grado<='09' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp002 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSEIF _cod_grado>= '10' AND _cod_grado<='11' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp003 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSEIF _cod_grado = '99' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp003 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSE
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp00 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_boletin_final
DROP PROCEDURE IF EXISTS `sp_select_boletin_final`;
DELIMITER //
CREATE PROCEDURE `sp_select_boletin_final`(IN `_cod_grado` VARCHAR(2) CHARSET utf8, IN `_grupo` VARCHAR(2) CHARSET utf8, IN `_cod_jorn` INT(1), IN `_id_sede` INT(20), IN `_año` YEAR, IN `_periodo` VARCHAR(1) CHARSET utf8, IN `_id_inst` INT(20))
BEGIN
IF _cod_grado>= '21' AND _cod_grado <='26' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp003 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSEIF _cod_grado>= '01' AND _cod_grado<='05' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp001 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSEIF _cod_grado>= '06' AND _cod_grado<='09' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp002 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSEIF _cod_grado>= '10' AND _cod_grado<='11' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp003 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSEIF _cod_grado = '99' THEN
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp003 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo BETWEEN 1 AND _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSE
	SELECT tn.id, tn.id_matric, tm.cod_est, tm.cod_grado, tm.grupo, tm.año, tn.periodo,
	tm.id_jorn, tm.id_sede, tn.id_asig, tn.id_docente,
	tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
	tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
	te.apellido1, te.apellido2, te.nombre1,
	te.nombre2, te.nro_doc_id, tm.estado,
	tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.asignatura,
	tas.abrev AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
	RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
	ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio
	FROM nscp00 AS tn
	JOIN matriculas AS tm ON tn.id_matric=tm.id_matric
	JOIN inscripciones AS te ON tm.cod_est=te.cod_est
	JOIN asignaturas AS tas ON tn.id_asig=tas.id
	JOIN areas AS tar ON tas.cod_area=tar.cod_area
	JOIN docentes AS td ON tn.id_docente=td.id_docente
	JOIN sedes AS ts ON tm.id_sede=ts.id
	JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
	JOIN grados As tg ON tm.cod_grado=tg.cod_grado
	WHERE tm.estado=2 AND tm.grupo=_grupo
	AND tm.año=_año AND tn.año=_año AND tar.año=_año and tas.año=_año
	AND tn.id_inst=_Id_inst and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
	and tar.id_inst=_id_inst and td.id_inst=_Id_inst and tn.final>=0
	AND tm.cod_grado=_cod_grado AND tm.id_sede=_id_sede AND tm.id_jorn=_cod_jorn
	AND tn.periodo = _periodo
	ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_boletin_final_est
DROP PROCEDURE IF EXISTS `sp_select_boletin_final_est`;
DELIMITER //
CREATE PROCEDURE `sp_select_boletin_final_est`(IN `_cod_grado` VARCHAR(2) CHARSET utf8, IN `_grupo` VARCHAR(2) CHARSET utf8, IN `_cod_jorn` INT(1), IN `_id_sede` INT(20), IN `_año` YEAR, IN `_periodo` VARCHAR(1) CHARSET utf8, IN `_id_inst` INT(20), IN `_cod_est` INT(20))
BEGIN
IF _cod_grado>= '21' AND _cod_grado<='26' THEN
	SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp0011 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo =_periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
ELSE
	CASE _cod_grado
		WHEN '01' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp001 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '02' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp002 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '03' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp003 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '04' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp004 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '05' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp005 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '06' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp006 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '07' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp007 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '08' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp008 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '09' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp009 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '10' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp0010 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '11' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp0011 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		WHEN '99' THEN
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp0011 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
		ELSE
			SELECT tn.cod_est,tm.id_matric, tn.cod_grado, tn.grupo, tm.año, tn.periodo,
			tn.cod_jorn, tn.id_sede, tn.id_asig, tn.id_docente,
			tn.id_logro, tn.id_logro1, tn.id_logro2, tn.id_sugerencia,
			tn.ind1, tn.ind2, tn.ind3, tn.ind4, tn.ind5, tn.ind6,
			tn.ind7, tn.ind8, tn.ind9, tn.ind10, tn.ind11, tn.ind12,
			tn.notap1, tn.p1, tn.notap2, tn.p2, tn.notap3, tn.p3,
			tn.notap4, tn.p4, tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas, tn.conceptual,
			te.apellido1, te.apellido2, te.nombre1,
			te.nombre2, te.nro_doc_id, tm.estado,
			tar.area, tar.abrev AS abre_area,tar.ordenar AS order_ar, tas.des_asign AS asignatura,
			tas.abrv AS abrev_asig, tas.electiva, tas.cod_area, tas.ordenar AS order_as,
			CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),
			RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
			ts.nom_sede AS sede, tj.jornada, tg.grado,tm.id_folio,
			tn.tipo_sug,tn.id_obser,
			tn.tipo_ind1, tn.tipo_ind2, tn.tipo_ind3, tn.tipo_ind4, tn.tipo_ind5, tn.tipo_ind6,
			tn.tipo_ind7, tn.tipo_ind8, tn.tipo_ind9, tn.tipo_ind10, tn.tipo_ind11, tn.tipo_ind12
			FROM scp00 AS tn JOIN inscripciones AS te ON te.cod_est=
			tn.cod_est JOIN matriculas AS tm on tm.cod_est=te.cod_est
			JOIN asignaturas AS tas ON tn.id_asig=tas.cod_asign
		    JOIN areas AS tar ON tas.cod_area=tar.cod_area JOIN docentes AS td ON
		    td.id_docente=tn.id_docente JOIN sedes AS ts ON tn.id_sede=ts.id
		    JOIN jornadas AS tj ON tn.cod_jorn=tj.cod_jorn
		    JOIN grados As tg ON tn.cod_grado=tg.cod_grado
			WHERE tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=tm.cod_grado AND tn.id_sede=tm.id_sede
			AND tm.año=_año AND tn.año=_año AND tn.cod_jorn=tm.id_jorn
			AND tar.año=_año and tas.año=_año AND tn.id_inst=_Id_inst
			and te.id_inst=_Id_inst and tas.id_inst=_Id_inst
			and tar.id_inst=_id_inst and td.id_inst=_Id_inst
			HAVING tn.final>=0 AND tm.estado=2 AND tn.grupo=_grupo
			AND tn.cod_grado=_cod_grado AND tn.id_sede=_id_sede
			AND tm.año=_año AND tn.cod_jorn=_cod_jorn
			AND tn.periodo = _periodo AND tn.cod_est=_cod_est
			ORDER BY te.apellido1,te.apellido2,te.nombre1,te.nombre2,tas.cod_area,tn.id_asig;
    END CASE;
END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_canotaciones_obs_m3
DROP PROCEDURE IF EXISTS `sp_select_canotaciones_obs_m3`;
DELIMITER //
CREATE PROCEDURE `sp_select_canotaciones_obs_m3`(
	IN `_year` YEAR,
	IN `_enrrol` INT(30)
)
BEGIN
	SELECT ti.anotacion,ti.compromiso_est,ti.compromiso_acu,ti.compromiso_inst,ti.periodo,ti.fecha,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) docente,
	tm.year `año`,tm.id_group grupo,
	tm.id_grade cod_grado,RTRIM(tj.JORNADA) jornada, TRIM(tg.grado) grado, RTRIM(ts.headquarters_name) sede,
	CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) estudiante
	, tn.nombre_nivel FROM obs_anotaciones_mod_3 ti
	JOIN docentes td ON ti.id_docente = td.id_docente
	JOIN aux_docentes AS au ON (au.id_docente = td.id_docente AND au.year = _year)
	JOIN obs_observador_mod_3 AS tb ON ti.id_observador = tb.id
	JOIN student_enrollment AS tm ON tb.id_matric = tm.id
	JOIN jornadas AS tj ON tm.id_study_day = tj.COD_JORN
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN inscripciones AS te ON tm.id_student = te.id
	JOIN niveles_estudio AS tn ON tg.id_nivel = tn.id
	WHERE ti.estado = 1 AND au.year = _year
	AND td.estado = 1 AND tb.id_matric = _enrrol
	ORDER BY ti.periodo,ti.fecha;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_carga_report
DROP PROCEDURE IF EXISTS `sp_select_carga_report`;
DELIMITER //
CREATE PROCEDURE `sp_select_carga_report`(
	IN `_year` YEAR,
	IN `_headq` INT(30),
	IN `_grade` INT(11),
	IN `_teacher` INT(30)
)
BEGIN
	DECLARE _SL VARCHAR(250) DEFAULT '';
	IF _teacher > 0 THEN
		SET _SL	= CONCAT(" AND tc.id_docente = ",_teacher," ");
	ELSE
		SET _SL	= CONCAT(" AND tc.id_sede = ",_headq," AND tc.id_grado=",_grade," ");
	END IF;
	SET @sqlselect = CONCAT("SELECT tc.id_grado cod_grado, tc.grupo, tc.id_docente, tc.id_asig,
		tc.id_sede, tc.id_jorn cod_jorn, tc.year año, tg.grado, RTRIM(ta.asignatura) asignatura,
		TRIM(ts.headquarters_name) as sede,  tj.jornada, tm.ih,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) AS docente
		FROM cursos AS tc
		JOIN grados as tg ON tc.id_grado = tg.id
		JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
		JOIN sedes AS ts ON tc.id_sede = ts.id
		JOIN jornadas AS tj ON tc.id_jorn = tj.cod_jorn
		JOIN matcurso AS tm ON (tm.id_grado  = tg.id AND tm.id_asig = ta.id_pk AND tm.year = tc.year)
		JOIN docentes AS td ON tc.id_docente = td.id_docente
		WHERE tc.year = ",_year," AND tm.year = ",_year,_SL,"
		AND tc.estado = 1 ORDER BY tc.id_grado,tc.id_jorn,tc.grupo,docente,tc.id_asig");
	PREPARE smtp FROM @sqlselect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_class_course_students
DROP PROCEDURE IF EXISTS `sp_select_class_course_students`;
DELIMITER //
CREATE PROCEDURE `sp_select_class_course_students`(
	IN `PCourse` INT,
	IN `PClassId` BIGINT
)
    COMMENT 'Estudiantes del curso de la clase'
BEGIN
	SELECT i.id, h.course_id, a.id_sede, a.id_grado, a.id_asig, a.id_docente, a.id_jorn, a.grupo,
	b.asignatura, c.cod_grado, c.grado, trim(d.jornada) AS jornada, trim(e.headquarters_name) sede,
	CONCAT(TRIM(g.apellido1),' ',TRIM(g.apellido2),' ',TRIM(g.nombre1),' ',TRIM(g.nombre2)) estudiante,
	h.class_id, a.year
	FROM tl_course_live_classes AS h
	JOIN cursos AS a ON h.course_id = a.id
	JOIN asignaturas AS b ON a.id_asig = b.id_pk
	JOIN grados AS c ON a.id_grado = c.id
	JOIN jornadas AS d ON a.id_jorn = d.cod_jorn
	JOIN sedes AS e ON a.id_sede = e.ID
	JOIN student_enrollment AS f  ON (f.id_headquarters = a.id_sede AND f.id_study_day = a.id_jorn AND
	f.id_grade = a.id_grado AND f.id_group = a.grupo AND f.year = a.year)
	JOIN inscripciones AS g ON f.id_student = g.id
	JOIN tl_students_live_classes AS i ON (i.class_id = h.id AND i.enrollment_id = f.id)
	WHERE h.class_id = PClassId AND h.course_id = PCourse AND h.course_id = a.id
	AND a.estado = 1 AND f.id_state = 2
	ORDER BY estudiante;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_comments_activities
DROP PROCEDURE IF EXISTS `sp_select_comments_activities`;
DELIMITER //
CREATE PROCEDURE `sp_select_comments_activities`(
	IN `PActitityId` BIGINT,
	IN `PCourseId` BIGINT,
	IN `PEnrollment` BIGINT
)
BEGIN
	SELECT k.id, k.shared_activity_id, k.comment_activity, k.url_attached, k.mime,
	DATE_FORMAT(k.hour_comment,'%d-%m-%Y') AS date, DATE_FORMAT(k.hour_comment,'%r') AS time,
	k.comment_title, k.type_comment, k.state, a.teacher_id, a.nombre,
	CONCAT(TRIM(b.apellido1),' ',TRIM(b.apellido2),' ',TRIM(b.nombre1),' ',TRIM(b.nombre2)) AS docente,
	c.course_id, c.activity_id, e.grupo, f.grado, trim(g.jornada) jornada, h.asignatura,
	TRIM(i.headquarters_name) AS sede, b.image AS image_teacher, j.enrollment_id,
	CONCAT(TRIM(n.apellido1),' ',TRIM(n.apellido2),' ',TRIM(n.nombre1),' ',TRIM(n.nombre2)) AS estudiante,
	n.foto AS image_student
	FROM ta_online_activities a
	JOIN docentes AS b ON a.teacher_id = b.id_docente
	JOIN ta_courses_online_activities AS c ON c.activity_id = a.id
	JOIN cursos AS e ON c.course_id = e.id
	JOIN grados AS f ON e.id_grado = f.id
	JOIN jornadas AS g ON e.id_jorn = g.cod_jorn
	JOIN asignaturas AS h ON e.id_asig = h.id_pk
	JOIN sedes AS i ON e.id_sede = i.ID
	JOIN ta_shared_online_activities AS j ON j.activity_id = c.id
	JOIN ta_comments_activities AS k ON k.shared_activity_id = j.id
	JOIN student_enrollment AS m ON j.enrollment_id = m.id
	JOIN inscripciones AS n ON m.id_student = n.id
	WHERE j.id = PActitityId AND k.shared_activity_id = j.id
	ORDER BY k.hour_comment DESC;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_config_diploma
DROP PROCEDURE IF EXISTS `sp_select_config_diploma`;
DELIMITER //
CREATE PROCEDURE `sp_select_config_diploma`(IN `_id_inst` INT(20), IN `_año` YEAR)
BEGIN
	SELECT * FROM configdiplomas tc WHERE tc.id_inst = _id_inst AND tc.`año` = `_año`;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_consolidado_asig
DROP PROCEDURE IF EXISTS `sp_select_consolidado_asig`;
DELIMITER //
CREATE PROCEDURE `sp_select_consolidado_asig`(
	IN `_id_head` INT(20),
	IN `_id_study_day` INT(1),
	IN `_id_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_year` YEAR,
	IN `_per` VARCHAR(1),
	IN `_type` INT(1)
)
BEGIN
	IF _type = 1 THEN /* Asignaturas*/
		IF _per = '0' THEN
			SELECT tm.year,tc.*, tm.id_grade, tm.id_group, tm.id_study_day, tm.id_headquarters,tm.id_student,
			CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
			RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante,tg.grado, tg.cod_grado, tj.jornada, ts.headquarters_name As sede
			FROM consolidado AS tc
			JOIN student_enrollment AS tm ON tc.id_matric=tm.id
			JOIN inscripciones AS te ON tm.id_student=te.id
			JOIN grados AS tg ON tm.id_grade = tg.id
			JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			WHERE tm.id_state=2 AND tm.id_grade = _id_grade
			AND tm.id_headquarters= _id_head AND tm.year = _year AND ts.ID = _id_head
			AND tm.id_study_day= _id_study_day AND tm.id_group= _group
			ORDER BY estudiante, tc.periodo;
		ELSE
			SELECT tm.year,tc.*, tm.id_grade, tm.id_group, tm.id_study_day, tm.id_headquarters,tm.id_student,
			CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
			RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante,tg.grado, tg.cod_grado, tj.jornada, ts.headquarters_name As sede
			FROM consolidado AS tc
			JOIN student_enrollment AS tm ON tc.id_matric=tm.id
			JOIN inscripciones AS te ON tm.id_student=te.id
			JOIN grados AS tg ON tm.id_grade = tg.id
			JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			WHERE tm.id_state=2 AND tm.id_grade = _id_grade  AND ts.ID = _id_head
			AND tm.id_headquarters= _id_head AND tm.year = _year AND tc.periodo = _per
			AND tm.id_study_day= _id_study_day AND tm.id_group= _group
			ORDER BY estudiante, tc.periodo;
		END IF;
	ELSE
		IF _per = '0' THEN
			SELECT tm.year,tc.*, tm.id_grade, tm.id_group, tm.id_study_day, tm.id_headquarters,tm.id_student,
			CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
			RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante,tg.grado, tg.cod_grado, tj.jornada, ts.headquarters_name As sede
			FROM consolidado_areas AS tc
			JOIN student_enrollment AS tm ON tc.id_matric=tm.id
			JOIN inscripciones AS te ON tm.id_student=te.id
			JOIN grados AS tg ON tm.id_grade = tg.id
			JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			WHERE tm.id_state=2 AND tm.id_grade = _id_grade
			AND tm.id_headquarters= _id_head AND tm.year = _year AND ts.ID = _id_head
			AND tm.id_study_day= _id_study_day AND tm.id_group= _group
			ORDER BY estudiante, tc.periodo;
		ELSE
			SELECT tm.year,tc.*, tm.id_grade, tm.id_group, tm.id_study_day, tm.id_headquarters,tm.id_student,
			CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
			RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante,tg.grado, tg.cod_grado, tj.jornada, ts.headquarters_name As sede
			FROM consolidado_areas AS tc
			JOIN student_enrollment AS tm ON tc.id_matric=tm.id
			JOIN inscripciones AS te ON tm.id_student=te.id
			JOIN grados AS tg ON tm.id_grade = tg.id
			JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			WHERE tm.id_state=2 AND tm.id_grade = _id_grade  AND ts.ID = _id_head
			AND tm.id_headquarters= _id_head AND tm.year = _year AND tc.periodo = _per
			AND tm.id_study_day= _id_study_day AND tm.id_group= _group
			ORDER BY estudiante, tc.periodo;
		END IF;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_consolidado_matricula
DROP PROCEDURE IF EXISTS `sp_select_consolidado_matricula`;
DELIMITER //
CREATE PROCEDURE `sp_select_consolidado_matricula`(
	IN `_year` SMALLINT
)
BEGIN
	SELECT tem.name_state estado, te.apellido1, te.apellido2, te.nombre1, te.nombre2,
		tx.nombre_sexo AS sexo, te.tipo_sangre, te.fecha_nacimiento, FLOOR(TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE())) edad,
		ex.sisben, te.estrato, RTRIM(te.ips) IPS, RTRIM(te.direccion) direccion, tz.zone_name zona,
		te.nro_documento documento, RTRIM(tdoc.tipo) tipo_documento,te.telefono,
		tg.cod_grado,RTRIM(tg.grado) grado,tm.id_group, tj.jornada, RTRIM(ts.headquarters_name) sede,tm.year,
		tpv.nombre pob_vict_conf, ex.cod_flia_accion, ex.nro_sisben
		FROM inscripciones AS te
		JOIN student_enrollment AS tm ON tm.id_student = te.id
		JOIN extra_inscripciones AS ex ON ex.id_inscripcion = te.id
		JOIN grados AS tg  ON tm.id_grade = tg.id
		JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
		JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		JOIN documentos AS tdoc ON te.id_documento = tdoc.id
		JOIN registration_status AS tem ON tm.id_state = tem.id
		JOIN zona tz ON te.id_zona = tz.id_zona
		JOIN sexo AS tx ON te.id_sexo = tx.id
		JOIN poblacion_victima_conflicto AS tpv ON ex.id_pob_vic_conf = tpv.id
		WHERE tm.year = _year
		ORDER BY sede, tm.id_grade, tm.id_group, tm.id_study_day, te.apellido1, te.apellido2, te.nombre1, te.nombre2;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_criterios_obs_m3
DROP PROCEDURE IF EXISTS `sp_select_criterios_obs_m3`;
DELIMITER //
CREATE PROCEDURE `sp_select_criterios_obs_m3`(
	IN `_year` YEAR,
	IN `_enrrol` INT(30)
)
BEGIN
	SELECT ti.n1,ti.n2,ti.n3,ti.n4,ti.av1,ti.av2,ti.av3,ti.av4,ti.cs1,ti.cs2,ti.cs3,ti.cs4,
	ti.s1,ti.s2,ti.s3,ti.s4,tc.descripcion AS criterio, tp.descripcion AS aspecto,
	tm.year `año`,tm.id_group grupo,
	tm.id_grade cod_grado,RTRIM(tj.JORNADA) jornada, TRIM(tg.grado) grado, RTRIM(ts.headquarters_name) sede,
	CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) estudiante,
	tn.nombre_nivel FROM obs_items_modelo_3 ti
	JOIN obs_criterios tc ON ti.id_item_criterio = tc.id
	JOIN obs_items_modelos tp ON tc.id_item_modelo = tp.id
	JOIN obs_observador_mod_3 AS tb ON ti.id_observador = tb.id
	JOIN student_enrollment AS tm ON tb.id_matric = tm.id
	JOIN jornadas AS tj ON tm.id_study_day = tj.COD_JORN
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN inscripciones AS te ON tm.id_student = te.id
	JOIN niveles_estudio AS tn ON tg.id_nivel = tn.id
	WHERE tc.estado = 1 AND tp.year = _year AND tp.estado = 1
	AND tb.id_matric = _enrrol
	ORDER BY tp.descripcion, tc.descripcion;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_cuadro_honor
DROP PROCEDURE IF EXISTS `sp_select_cuadro_honor`;
DELIMITER //
CREATE PROCEDURE `sp_select_cuadro_honor`(
	IN `_year` YEAR,
	IN `_headquarters` INT(30),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_per` VARCHAR(1),
	IN `_lm` INT,
	IN `_type` INT(1),
	IN `_niv` INT,
	IN `_ck` INT(1)
)
BEGIN
	IF _ck = 1 THEN
		SET _per = '';
	END IF;
	CASE _type
		WHEN 1 THEN
			SELECT tm.id_group,th.*, CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
			RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante, te.foto,
			RTRIM(ts.headquarters_name) sede, tg.grado, tg.cod_grado
			FROM cuadro_honor AS th
			JOIN student_enrollment AS tm ON th.id_matric = tm.id
			JOIN inscripciones AS te ON tm.id_student = te.id
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			JOIN grados AS tg ON tm.id_grade = tg.id
			WHERE tm.year=_year AND th.periodo=_per
			AND tg.id =_grade AND tm.id_headquarters= _headquarters
			 AND tm.id_group= _group
			ORDER BY th.suma DESC, th.nmax DESC, estudiante LIMIT _lm;
		WHEN 2 THEN
			SELECT tm.id_group,th.*, CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
			RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante, te.foto,
			RTRIM(ts.headquarters_name) sede, tg.grado, tg.cod_grado
			FROM cuadro_honor AS th
			JOIN student_enrollment AS tm ON th.id_matric = tm.id
			JOIN inscripciones AS te ON tm.id_student = te.id
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			JOIN grados AS tg ON tm.id_grade = tg.id
			WHERE tm.year=_year AND th.periodo=_per
			 AND tm.id_grade=_grade AND tm.id_headquarters= _headquarters
			  AND tm.id_group= _group
			 ORDER BY th.suma DESC, th.nmax DESC, estudiante LIMIT _lm;
		WHEN 3 THEN /*Sede y grado*/
			SELECT tm.id_group,th.id_matric, th.periodo, th.nivel, th.suma, th.nmax, th.nro, th.`type`,
			CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
			RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante, te.foto,
			RTRIM(ts.headquarters_name) sede, tg.grado, tg.cod_grado
			FROM cuadro_honor AS th
			JOIN student_enrollment AS tm ON th.id_matric = tm.id
			JOIN inscripciones AS te ON tm.id_student = te.id
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			JOIN grados AS tg ON tm.id_grade = tg.id
			WHERE tm.year=_year AND th.periodo=_per
			 AND tm.id_grade=_grade AND tm.id_headquarters= _headquarters
			 ORDER BY th.suma DESC, th.nmax DESC, estudiante LIMIT _lm;
		WHEN 4 THEN /*Sede*/
			SELECT tm.id_group,th.*, CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
			RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante,te.foto,
			RTRIM(ts.headquarters_name) sede, tg.grado, tg.cod_grado
			FROM cuadro_honor AS th
			JOIN student_enrollment AS tm ON th.id_matric = tm.id
			JOIN inscripciones AS te ON tm.id_student = te.id
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			JOIN grados AS tg ON tm.id_grade = tg.id
			WHERE tm.year=_year AND th.periodo=_per
			 AND tm.id_headquarters= _headquarters
			 ORDER BY th.suma DESC, th.nmax DESC, estudiante LIMIT _lm;
		WHEN 5 THEN /*Niveles*/
			SELECT tm.id_group,th.*, CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
			RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante,te.foto,
			RTRIM(ts.headquarters_name) sede, tg.grado, tg.cod_grado,tv.nombre_nivel
			FROM cuadro_honor AS th
			JOIN student_enrollment AS tm ON th.id_matric = tm.id
			JOIN inscripciones AS te ON tm.id_student = te.id
			JOIN sedes AS ts ON tm.id_headquarters = ts.ID
			JOIN grados AS tg ON tm.id_grade = tg.id
			JOIN niveles_estudio AS tv ON th.nivel = tv.id
			WHERE tm.year=_year AND th.periodo=_per  AND th.nivel = _niv
			 AND tm.id_headquarters= _headquarters
			 ORDER BY th.suma DESC, th.nmax DESC, estudiante LIMIT _lm;
	END CASE;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_cursos_grado
DROP PROCEDURE IF EXISTS `sp_select_cursos_grado`;
DELIMITER //
CREATE PROCEDURE `sp_select_cursos_grado`(
	IN `_year` YEAR,
	IN `_grade` INT(11)
)
BEGIN
	SELECT tc.*,CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',
	RTRIM(td.nombre2)) AS docente, RTRIM(ta.asignatura) asignatura,ts.headquarters_name AS sede,
	tj.jornada, tg.grado
	FROM cursos AS tc
	JOIN docentes AS td ON td.id_docente=tc.id_docente
	JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
	JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
	JOIN sedes AS ts ON tc.id_sede = ts.ID
	JOIN jornadas AS tj ON tc.id_jorn = tj.cod_jorn
	JOIN grados As tg ON tc.id_grado=tg.id
	WHERE tc.id_grado =  _grade AND tc.year= _year AND au.year = _year
	ORDER BY tc.id_sede,tc.id_grado,tc.grupo,tc.id_jorn,docente,au.id_area,tc.id_asig LIMIT 300;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_cursos_notas
DROP PROCEDURE IF EXISTS `sp_select_cursos_notas`;
DELIMITER //
CREATE PROCEDURE `sp_select_cursos_notas`(
	IN `_id_headquarters` INT(20),
	IN `_study_day` INT(11),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_year` YEAR
)
BEGIN
	SELECT tc.*,CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',
	RTRIM(td.nombre2)) AS docente, RTRIM(ta.asignatura) asignatura,ts.headquarters_name AS sede, tj.jornada, tg.grado
	FROM cursos AS tc
	JOIN docentes AS td ON td.id_docente=tc.id_docente
	JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
	JOIN aux_asignaturas AS au ON (au.id_asign = ta.id_pk AND au.year = _year)
	JOIN sedes AS ts ON ts.id=tc.id_sede
	JOIN jornadas AS tj ON tc.id_jorn = tj.cod_jorn
	JOIN grados As tg ON tc.id_grado=tg.id
	WHERE tc.id_grado =  _grade and tc.year =  _year AND
	tc.id_sede = _id_headquarters AND tc.grupo = _group AND
	tc.id_jorn = _study_day AND tc.estado = 1 AND au.year = _year
	ORDER BY tc.id_sede,tc.id_grado,tc.grupo,tc.id_jorn,docente,au.id_area,tc.id_asig;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_datos_observador
DROP PROCEDURE IF EXISTS `sp_select_datos_observador`;
DELIMITER //
CREATE PROCEDURE `sp_select_datos_observador`(
	IN `_year` YEAR,
	IN `_enrrol` INT(30),
	IN `_type` INT(1)
)
BEGIN
	CASE _type
		WHEN 3 THEN
			SELECT CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) nombres,
				ti.nro_documento nro_doc_id, ti.fecha_nacimiento, RTRIM(ti.direccion) direccion, ti.telefono, ti.email e_mail,
				ti.tipo_sangre, tx.sisben,	tx.nro_sisben, ti.estrato,ti.ips, tm.id_grade cod_grado,
				RTRIM(ts.headquarters_name) sede,tm.year año,
				te.name_state estado,tm.id_study_day id_jorn,tm.id_group grupo,UPPER(td.name_departament) AS dpto,
				upper(tde.name_departament) AS dpto_e,upper(tde.name_departament) AS dpto_u,
				tc.name_city AS mun, tce.name_city AS mun_e,tce.name_city AS mun_u,tj.jornada,
				tm.date As fecha_m, tm.inst_origin ins_proced,
				tm.inst_address dir_inst,RIGHT(CONCAT('0000',tm.folio),4) id_folio,
				RIGHT(CONCAT('0000',tm.registration_number),4) nro_matricula,
				RIGHT(CONCAT('0000',tm.book),4) libro_mat,
				tz.tipo AS zona, tdoc.tipo as documento, tdoc.abrev AS abrev_doc, tg.grado,
				t.id_matric,t.peso,t.talla,t.religion,t.deporte,t.musica,t.arte,t.comida,t.prof_oficio,t.motricidad_fina,
				t.motricidad_gruesa,t.temporo_espacial,t.actitud_verval,t.artitud_numerica,t.liderazgo,t.comportamiento,
				t.dislexia,t.disortografia,t.discalculia,t.fecha, RTRIM(ep.DES_EPS) AS eps, cex.nombre AS capacidad_exp,
				dis.nombre AS discapacidad, RTRIM(et.nombre_etnia) etnia, RTRIM(res.nombre_resguardo) resguardo
				FROM inscripciones AS ti
			 	JOIN cities AS tc  ON (ti.lug_nacimiento = tc.id)
			 	JOIN departments AS td ON tc.id_dept = td.id
			 	JOIN cities AS tce  ON (ti.lug_expedicion = tce.id)
			 	JOIN departments AS tde ON tce.id = tde.id
			 	JOIN cities AS tcu  ON (ti.lug_residencia = tcu.id)
			 	JOIN departments AS tdu ON tcu.id_dept = tdu.id
				JOIN student_enrollment AS tm ON tm.id_student = ti.id
				JOIN jornadas AS tj ON tm.id_study_day=tj.cod_jorn
				JOIN sedes AS ts ON tm.id_headquarters=ts.id
				JOIN registration_status AS te ON tm.id_state = te.id
				JOIN zona AS tz ON ti.id_zona = tz.id_zona
				JOIN documentos AS tdoc ON ti.id_documento = tdoc.id
				JOIN grados AS tg ON tm.id_grade = tg.id
				JOIN obs_observador_mod_3 AS t ON t.id_matric = tm.id
				JOIN extra_inscripciones AS tx ON tx.id_inscripcion = ti.id
				JOIN eps AS ep ON tx.id_eps = ep.id
				JOIN capacidades_excepcionales AS cex ON tx.id_cap_exc = cex.id
				JOIN tipo_discapacidad AS dis ON tx.id_discapacidad = dis.id
				JOIN etnias AS et ON tx.id_etnia = et.id
				JOIN resguardos AS res ON tx.id_resgua = res.id
				WHERE  tm.year= `_year`	AND tm.id = _enrrol
				ORDER BY apellido1,apellido2,nombre1,nombre2 LIMIT 1;
	END CASE;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_desplazados
DROP PROCEDURE IF EXISTS `sp_select_desplazados`;
DELIMITER //
CREATE PROCEDURE `sp_select_desplazados`(
	IN `_year` SMALLINT
)
BEGIN
	SELECT te.nro_documento nro_doc_id,
	CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' '+RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) nombres,
	tes.name_state estado, tg.cod_grado,tm.id_group grupo, RTRIM(te.direccion) direccion, RTRIM(ts.headquarters_name) sede,
	RTRIM(tg.grado) grado, RTRIM(tj.JORNADA) jornada
	FROM inscripciones AS te
	JOIN student_enrollment AS tm ON tm.id_student = te.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN registration_status AS tes ON tm.id_state = tes.id
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
	JOIN extra_inscripciones AS ex ON ex.id_inscripcion = te.id
	WHERE tm.year = _year AND ex.id_pob_vic_conf = 1
	ORDER BY sede,tm.id_grade,tm.id_group,tm.id_state,tm.id_study_day,nombres;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_dir_grupo
DROP PROCEDURE IF EXISTS `sp_select_dir_grupo`;
DELIMITER //
CREATE PROCEDURE `sp_select_dir_grupo`(
	IN `_year` INT
)
    COMMENT 'Directores de grupo'
BEGIN
 SELECT td.id_grado,td.grupo,td.year,CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
		RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS docente, ts.headquarters_name AS sede,
		tj.jornada,RTRIM(tg.grado) AS grado
		FROM dir_grupo AS td
		JOIN aux_docentes AS ta ON td.id_docente=ta.id_docente
		JOIN docentes AS te ON ta.id_docente=te.id_docente
		JOIN sedes AS ts ON ts.id=td.id_sede
		JOIN jornadas AS tj ON td.id_jorn=tj.cod_jorn
		JOIN grados AS tg ON td.id_grado = tg.id
		WHERE td.year = _year AND ta.year = _year
		ORDER BY sede,tj.jornada,td.id_grado,td.grupo,docente;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_docentes_report
DROP PROCEDURE IF EXISTS `sp_select_docentes_report`;
DELIMITER //
CREATE PROCEDURE `sp_select_docentes_report`(
	IN `_year` SMALLINT,
	IN `_teacher` INT(30)
)
BEGIN
	DECLARE _SL VARCHAR(250) DEFAULT '';
	IF _teacher > 0 THEN
		SET _SL = CONCAT(" AND au.id_docente =",_teacher," ");
	ELSE
		SET _SL = "";
	END IF;

	SET @sqlselect = CONCAT("SELECT td.id_docente,RTRIM(td.direccion) direccion,td.tipo_sangre,
		td.image,td.documento,td.fecha_nacimiento,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) nombres,
		td.sexo,FLOOR(TIMESTAMPDIFF(YEAR, td.fecha_nacimiento, CURDATE())) edad,
		td.movil, td.fijo,'' otra,td.email,au.year,tdoc.documento,
		ten.nivel,tnv.nivel_nom,
		dp.name_departament dpto_expedicion,
		dp2.name_departament AS dpto_nacimiento, tm.name_city AS mun_expedicion, tm1.name_city AS mun_nacimiento,
		RTRIM(tes.tipo) AS Escalafon
		FROM docentes AS td
		JOIN docdocente AS tdoc ON td.id_documento = tdoc.id_doc
		JOIN aux_docentes AS au ON au.id_docente = td.id_docente
		JOIN `enseñanza` AS ten ON td.cod_ense = ten.id
		JOIN niveles AS tnv ON td.cod_nivel    = tnv.id_nivel
		JOIN cities AS tm ON td.mun_exp 			= tm.id
		JOIN cities AS tm1 ON td.mun_nac = tm1.id
		JOIN departments AS dp ON tm.id_dept = dp.id
		JOIN departments AS dp2 ON tm1.id_dept = dp2.id
		JOIN escalafon AS tes ON td.id_escalafon =tes.id
		WHERE au.year = ",_year,_SL,"
		ORDER BY nombres");
	PREPARE smtp FROM @sqlselect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_doc_digitales_est
DROP PROCEDURE IF EXISTS `sp_select_doc_digitales_est`;
DELIMITER //
CREATE PROCEDURE `sp_select_doc_digitales_est`(IN `_id_est` INT(20))
BEGIN
	SELECT * FROM doc_digitales_est td WHERE td.id_estudiante = _id_est;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_estadistica_edades
DROP PROCEDURE IF EXISTS `sp_select_estadistica_edades`;
DELIMITER //
CREATE PROCEDURE `sp_select_estadistica_edades`(
	IN `_year` SMALLINT
)
BEGIN
	DECLARE done,
			  s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11,s12,s13,s14,s15,s16,s17,s18,s19,s20,_cant,_jorn,x_year, _edad, _total INT DEFAULT 0;
	DECLARE _sede, _grado  INT(30) DEFAULT 0;
	DECLARE _sexo,_grupo VARCHAR(2) DEFAULT '';

	DECLARE cur_mat CURSOR FOR SELECT COUNT(ti.edad) AS _total, ti.edad
   FROM inscripciones AS ti
	JOIN student_enrollment AS tm ON tm.id_student = ti.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	WHERE tm.year = _year AND tm.id_state =2
	AND tm.id_grade = _grado AND tm.id_group = _grupo AND tm.id_study_day = _jorn AND
	tm.id_headquarters = _sede AND ti.id_sexo = _sexo
	GROUP BY tm.id_grade, tm.id_group, tm.id_study_day,ti.id_sexo,ti.edad, tm.id_headquarters
	ORDER BY tm.id_headquarters,tm.id_grade, tm.id_group, tm.id_study_day,ti.id_sexo,ti.edad;

	DECLARE cur	CURSOR FOR SELECT tm.year,tm.id_grade, tm.id_group, ti.id_sexo, tm.id_study_day , tm.id_headquarters
   FROM inscripciones AS ti
	JOIN student_enrollment AS tm ON tm.id_student = ti.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN grados AS tg ON tm.id_grade = tg.id
	WHERE tm.year=`_year`  AND tm.id_state =2
	GROUP BY tm.id_grade, tm.id_group, tm.id_study_day,ti.id_sexo, tm.id_headquarters
	ORDER BY tm.id_headquarters,tm.id_grade, tm.id_group, tm.id_study_day,ti.id_sexo;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	UPDATE inscripciones SET edad=FLOOR(TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE())) WHERE 1;
	DELETE FROM estadistica_edades WHERE year = `_year`;

	OPEN cur;
	REPEAT
		FETCH cur INTO x_year, _grado, _grupo, _sexo, _jorn, _sede;
		IF NOT done THEN
			OPEN cur_mat;
			SET s0 = 0;
			SET s1 = 0;
			SET s2 = 0;
			SET s3 = 0;
			SET s4 = 0;
			SET s5 = 0;
			SET s6 = 0;
			SET s7 = 0;
			SET s8 = 0;
			SET s9 = 0;
			SET s10 = 0;
			SET s11 = 0;SET s12 = 0;SET s13 = 0;SET s14 = 0;
			SET s15 = 0;SET s16 = 0;SET s17 = 0;SET s18 = 0;
			SET s19 = 0;SET s20 = 0;SET _cant= 0;
			REPEAT
				FETCH cur_mat INTO _total, _edad;
				IF NOT done THEN
					SET _cant= _cant + _total;
					CASE
						WHEN _edad BETWEEN 0 AND 1 AND NOT _sexo = "" THEN
							SET s0= (_total);
						WHEN _edad = 2 AND NOT _sexo = "" THEN
							SET s1= (_total);
						WHEN  _edad = 3 AND NOT _sexo = "" THEN
							SET s2= (_total);
						WHEN  _edad=4 AND NOT _sexo = "" THEN
							SET s3= (_total);
						WHEN  _edad=5 AND NOT _sexo = "" THEN
							SET s4= (_total);
						WHEN  _edad=6 AND NOT _sexo = "" THEN
							SET s5= (_total);
						WHEN  _edad=7 AND NOT _sexo = "" THEN
							SET s6= (_total);
						WHEN  _edad=8 AND NOT _sexo = "" THEN
							SET s7= (_total);
						WHEN  _edad=9 AND NOT _sexo = "" THEN
							SET s8= (_total);
						WHEN  _edad=10 AND NOT _sexo = "" THEN
							SET s9= (_total);
						WHEN  _edad=11 AND NOT _sexo = "" THEN
							SET s10= (_total);
						WHEN  _edad=12 AND NOT _sexo = "" THEN
							SET s11= (_total);
						WHEN  _edad=13 AND NOT _sexo = "" THEN
							SET s12= (_total);
						WHEN  _edad=14 AND NOT _sexo = "" THEN
							SET s13= (_total);
						WHEN  _edad=15 AND NOT _sexo = "" THEN
							SET s14= (_total);
						WHEN  _edad=16 AND NOT _sexo = "" THEN
							SET s15= (_total);
						WHEN  _edad=17 AND NOT _sexo = "" THEN
							SET s16= (_total);
						WHEN  _edad=18 AND NOT _sexo = "" THEN
							SET s17= (_total);
						WHEN  _edad>18 AND NOT _sexo = "" THEN
							SET s18=s18+ (_total);
						WHEN  _edad=0 AND NOT _sexo = "" THEN
							SET s19=s19+ (_total);
						WHEN  _edad >= 0 AND _sexo = "" THEN
							SET s20=s20+ (_total);
					END CASE;
				END IF;
			UNTIL done END REPEAT;
			CLOSE cur_mat;
			INSERT INTO estadistica_edades (id_sede,id_grado,grupo,id_jorn,year,id_sexo,e1,e2,e3,e4,e5,e6,e7,e8,e9,e10,
													  e11,e12,e13,e14,e15,e16,e17,e18,e19,sf,ss,total) VALUES
													  (_sede,_grado,_grupo,_jorn,_year,_sexo,s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,
													  s11,s12,s13,s14,s15,s16,s17,s18,s19,s20,_cant);
			SET done = 0;
		END IF;
	UNTIL done END REPEAT;
	CLOSE cur;

	SELECT t.*, RTRIM(tg.grado) grado, RTRIM(tj.jornada) jornada, RTRIM(ts.headquarters_name) sede,
	sx.abrev_sexo AS sexo, tg.cod_grado
	FROM estadistica_edades AS t
	JOIN grados AS tg ON t.id_grado = tg.id
	JOIN jornadas AS tj ON t.id_jorn = tj.cod_jorn
	JOIN sedes AS ts ON t.id_sede = ts.ID
	JOIN sexo AS sx ON t.id_sexo = sx.id
	WHERE t.`year` = `_year`
	ORDER BY sede,t.id_grado,grupo,jornada;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_estudiantes_jorn
DROP PROCEDURE IF EXISTS `sp_select_estudiantes_jorn`;
DELIMITER //
CREATE PROCEDURE `sp_select_estudiantes_jorn`(
	IN `_year` SMALLINT
)
BEGIN
	SELECT  COUNT(tm.id_grade) AS Total,tg.cod_grado, tm.id_group, tm.id_study_day , tm.year,
	RTRIM(tg.grado) grado, RTRIM(tj.jornada) jornada, RTRIM(ts.headquarters_name) sede, tr.name_state
	FROM student_enrollment AS tm
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN registration_status AS tr ON tm.id_state = tr.id
	WHERE tm.year = _year
	GROUP BY tm.id_headquarters, tm.id_grade, tm.id_group, tm.id_study_day, tm.year, tm.id_state
	ORDER BY tm.id_state,sede, tm.id_grade,tm.id_study_day,tm.id_group;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_estudiantes_sin_notas
DROP PROCEDURE IF EXISTS `sp_select_estudiantes_sin_notas`;
DELIMITER //
CREATE PROCEDURE `sp_select_estudiantes_sin_notas`(
	IN `_year` SMALLINT
)
BEGIN
	(SELECT CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) as estudiante,
		RTRIM(tg.grado) grado,tm.id_group, RTRIM(tj.jornada) jornada, RTRIM(ts.headquarters_name) sede, RTRIM(tas.asignatura) asignatura,
		RTRIM(tar.area) area, tn.final,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente, tn.periodo
		FROM inscripciones ti
		JOIN student_enrollment AS tm ON tm.id_student = ti.id
		JOIN grados AS tg ON tm.id_grade = tg.id
		JOIN jornadas AS tj ON tm.id_study_day = tj.COD_JORN
		JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		JOIN nscp001 AS tn ON tn.id_matric = tm.id
		JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
		JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
		JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = tc.year)
		JOIN areas AS tar ON au.id_area = tar.id
		JOIN docentes AS td ON tc.id_docente = td.id_docente
		WHERE tm.year = _year AND tm.id_state = 2
		AND tn.final = 0 AND tc.`year` = `_year` AND tc.estado = 1
		)
		UNION
		(SELECT CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) as estudiante,
		RTRIM(tg.grado) grado,tm.id_group, RTRIM(tj.jornada) jornada, RTRIM(ts.headquarters_name) sede, RTRIM(tas.asignatura) asignatura,
		RTRIM(tar.area) area, tn.final,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente, tn.periodo
		FROM inscripciones ti
		JOIN student_enrollment AS tm ON tm.id_student = ti.id
		JOIN grados AS tg ON tm.id_grade = tg.id
		JOIN jornadas AS tj ON tm.id_study_day = tj.COD_JORN
		JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		JOIN nscp002 AS tn ON tn.id_matric = tm.id
		JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.`year` = tc.`year`)
		JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
		JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = tc.year)
		JOIN areas AS tar ON au.id_area = tar.id
		JOIN docentes AS td ON tc.id_docente = td.id_docente
		WHERE tm.year = `_year` AND tm.id_state = 2
		AND tn.final = 0 AND tc.`year` = `_year` AND tc.estado = 1
		)
		UNION
		(SELECT CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) as estudiante,
		RTRIM(tg.grado) grado,tm.id_group, RTRIM(tj.jornada) jornada, RTRIM(ts.headquarters_name) sede, RTRIM(tas.asignatura) asignatura,
		RTRIM(tar.area) area, tn.final,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente, tn.periodo
		FROM inscripciones ti
		JOIN student_enrollment AS tm ON tm.id_student = ti.id
		JOIN grados AS tg ON tm.id_grade = tg.id
		JOIN jornadas AS tj ON tm.id_study_day = tj.COD_JORN
		JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		JOIN nscp003 AS tn ON tn.id_matric = tm.id
		JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.`year` = tc.`year`)
		JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
		JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = tc.year)
		JOIN areas AS tar ON au.id_area = tar.id
		JOIN docentes AS td ON tc.id_docente = td.id_docente
		WHERE tm.year = `_year` AND tm.id_state = 2
		AND tn.final = 0 AND tc.`year` = `_year` AND tc.estado = 1
		)
		ORDER BY sede,grado,id_group,jornada,estudiante,docente,asignatura,periodo;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_evaluaciones
DROP PROCEDURE IF EXISTS `sp_select_evaluaciones`;
DELIMITER //
CREATE PROCEDURE `sp_select_evaluaciones`(
	IN `PTeacher` INT,
	IN `PCourse` INT,
	IN `PYear` YEAR
)
BEGIN
	SELECT tm.* FROM te_evaluaciones AS tm
	  JOIN cursos AS tc ON tm.id_curso=tc.id
	  JOIN docentes AS td ON tc.id_docente = td.id_docente
	  WHERE tc.id_docente= PTeacher AND tc.year = PYear AND
	  tc.id = PCourse;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_evaluation_result
DROP PROCEDURE IF EXISTS `sp_select_evaluation_result`;
DELIMITER //
CREATE PROCEDURE `sp_select_evaluation_result`(
	IN `PCourse` INT,
	IN `PEvaluation` BIGINT
)
BEGIN
	SELECT j.id, h.course_id, a.id_sede, a.id_grado, a.id_asig, a.id_docente, a.id_jorn, a.grupo,
	b.asignatura, c.cod_grado, c.grado, trim(d.jornada) AS jornada, trim(e.headquarters_name) sede,
	CONCAT(TRIM(g.apellido1),' ',TRIM(g.apellido2),' ',TRIM(g.nombre1),' ',TRIM(g.nombre2)) estudiante,
	h.evaluation_id, a.year, j.res_verdaderas, j.res_falsas, j.res_abiertas, j.hora_inicio, j.hora_final,
	j.tiempo, j.segundos, j.punataje, j.intento, k.periodo
	FROM te_evaluation_courses AS h
	JOIN te_shared_evaluation AS i ON i.evaluation_id = h.id
	JOIN te_evaluation_result AS j ON j.shared_evaluation_id =  i.id
	JOIN te_evaluations AS k ON h.evaluation_id = k.id
	JOIN cursos AS a ON h.course_id = a.id
	JOIN asignaturas AS b ON a.id_asig = b.id_pk
	JOIN grados AS c ON a.id_grado = c.id
	JOIN jornadas AS d ON a.id_jorn = d.cod_jorn
	JOIN sedes AS e ON a.id_sede = e.ID
	JOIN student_enrollment AS f  ON i.enrollment_id = f.id
	JOIN inscripciones AS g ON f.id_student = g.id
	WHERE h.evaluation_id = PEvaluation AND h.course_id = PCourse
	AND a.estado = 1 AND j.shared_evaluation_id =  i.id
	ORDER BY estudiante, k.periodo;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_familia_ficha
DROP PROCEDURE IF EXISTS `sp_select_familia_ficha`;
DELIMITER //
CREATE PROCEDURE `sp_select_familia_ficha`()
BEGIN
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_fechas_nac_report
DROP PROCEDURE IF EXISTS `sp_select_fechas_nac_report`;
DELIMITER //
CREATE PROCEDURE `sp_select_fechas_nac_report`(
	IN `_year` SMALLINT,
	IN `_headq` INT(30),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_study_day` INT(1),
	IN `type` INT
)
BEGIN
	DECLARE _ORD VARCHAR(120) DEFAULT '';
	IF `type` = 1 THEN /*Ordor by fecha_nacimiento*/
		SET _ORD	= CONCAT(" ORDER BY ti.fecha_nacimiento");
	ELSE /*Ordor by nombres*/
		 SET _ORD = CONCAT(" ORDER BY nombres");
	END IF;
	SET @sqlselect = CONCAT("SELECT RIGHT(CONCAT('000000',tm.registration_number),6) id, ti.nro_documento,
		 CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) nombres,
		 RTRIM(tg.grado) grado, tm.id_group, RTRIM(tj.jornada) jornada, sx.abrev_sexo AS sexo,
		 ti.fecha_nacimiento, ti.telefono,
		 FLOOR(TIMESTAMPDIFF(YEAR,fecha_nacimiento, CURDATE())) edad , RTRIM(ts.headquarters_name) sede,
		 tr.name_state, tm.id_state
		 FROM inscripciones AS ti
		 JOIN student_enrollment AS tm ON tm.id_student = ti.id
		 JOIN grados AS tg ON tm.id_grade = tg.id
		 JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
		 JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		 JOIN sexo AS sx ON ti.id_sexo = sx.id
		 JOIN registration_status AS tr ON tm.id_state = tr.id
		 WHERE tm.id_grade = ",_grade," AND tm.id_headquarters = ",_headq," AND
		 tm.year =  ",_year," AND tm.id_study_day = ",_study_day," AND tm.id_group = '",_group,"'",_ORD);
	PREPARE smtp FROM @sqlselect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_ficha_matricula
DROP PROCEDURE IF EXISTS `sp_select_ficha_matricula`;
DELIMITER //
CREATE PROCEDURE `sp_select_ficha_matricula`(
	IN `_year` YEAR,
	IN `_id` INT(30),
	IN `_grado` INT(11),
	IN `_grupo` VARCHAR(2),
	IN `_sede` INT(30),
	IN `_jorn` INT(1),
	IN `_tipo` INT(1)
)
BEGIN
	IF _tipo = 1 THEN
		SELECT ti.id AS id_student, ti.nro_documento, ti.apellido1, ti.apellido2, ti.nombre1, ti.nombre2, ti.tipo_sangre, ti.telefono,
		ti.movil, ti.direccion, ti.estrato, ti.email, ti.fecha_nacimiento,
		CONCAT(UPPER(TRIM(tc.name_city)),' (',TRIM(dp.name_departament),' - ',TRIM(cn.country_name),')') AS lug_nacimiento,
		CONCAT(UPPER(TRIM(tce.name_city)),' (',TRIM(dpe.name_departament),' - ',TRIM(cne.country_name),')') AS lug_expedicion,
		tm.id_grade, tm.id_study_day,tm.id_group,tm.date As fecha_m,tm.inst_origin,tm.inst_address,tm.folio, tm.registration_number,
		tm.book, tm.year, tj.jornada, '' as cons_sede, RTRIM(ts.headquarters_name) sede, te.name_state,
		tz.zone_name AS zona, tdoc.tipo as documento, tdoc.abrev AS abrev_doc,
		tg.cod_grado, tg.grado, ei.sisben, sex.abrev_sexo AS sexo
		FROM inscripciones AS ti
	 	JOIN cities AS tc  ON ti.lug_nacimiento = tc.id
	 	JOIN departments AS dp ON tc.id_dept = dp.id
	 	JOIN countries AS cn ON dp.id_country = cn.id
	 	JOIN cities AS tce ON ti.lug_expedicion = tce.id
	 	JOIN departments AS dpe ON tce.id_dept = dpe.id
	 	JOIN countries AS cne ON dpe.id_country = cne.id
		JOIN student_enrollment AS tm ON tm.id_student = ti.id
		JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
		JOIN sedes AS ts ON tm.id_headquarters = ts.id
		JOIN registration_status AS te ON tm.id_state = te.id
		JOIN zona AS tz ON ti.id_zona = tz.id_zona
		JOIN documentos AS tdoc ON ti.id_documento = tdoc.id
		JOIN grados AS tg ON tm.id_grade = tg.id
		JOIN extra_inscripciones AS ei ON ei.id_inscripcion = ti.id
		JOIN sexo AS sex ON ti.id_sexo = sex.id
		WHERE  tm.year = _year AND tm.id_state <> 1 AND tm.id = _id
		ORDER BY apellido1,apellido2,nombre1,nombre2 LIMIT 1;
	ELSE
		SELECT ti.id AS id_student, ti.nro_documento, ti.apellido1, ti.apellido2, ti.nombre1, ti.nombre2, ti.tipo_sangre, ti.telefono,
		ti.movil, ti.direccion, ti.estrato, ti.email, ti.fecha_nacimiento,
		CONCAT(UPPER(TRIM(tc.name_city)),' (',TRIM(dp.name_departament),' - ',TRIM(cn.country_name),')') AS lug_nacimiento,
		CONCAT(UPPER(TRIM(tce.name_city)),' (',TRIM(dpe.name_departament),' - ',TRIM(cne.country_name),')') AS lug_expedicion,
		tm.id_grade, tm.id_study_day,tm.id_group,tm.date As fecha_m,tm.inst_origin,tm.inst_address,tm.folio, tm.registration_number,
		tm.book, tm.year, tj.jornada, '' as cons_sede, RTRIM(ts.headquarters_name) sede, te.name_state,
		tz.zone_name AS zona, tdoc.tipo as documento, tdoc.abrev AS abrev_doc,
		tg.cod_grado, tg.grado, ei.sisben, sex.abrev_sexo AS sexo
		FROM inscripciones AS ti
	 	JOIN cities AS tc  ON ti.lug_nacimiento = tc.id
	 	JOIN departments AS dp ON tc.id_dept = dp.id
	 	JOIN countries AS cn ON dp.id_country = cn.id
	 	JOIN cities AS tce ON ti.lug_expedicion = tce.id
	 	JOIN departments AS dpe ON tce.id_dept = dpe.id
	 	JOIN countries AS cne ON dpe.id_country = cne.id
		JOIN student_enrollment AS tm ON tm.id_student = ti.id
		JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
		JOIN sedes AS ts ON tm.id_headquarters = ts.id
		JOIN registration_status AS te ON tm.id_state = te.id
		JOIN zona AS tz ON ti.id_zona = tz.id_zona
		JOIN documentos AS tdoc ON ti.id_documento = tdoc.id
		JOIN grados AS tg ON tm.id_grade = tg.id
		JOIN extra_inscripciones AS ei ON ei.id_inscripcion = ti.id
		JOIN sexo AS sex ON ti.id_sexo = sex.id
		WHERE  tm.year = _year AND tm.id_state <> 1
		AND tm.id_grade = _grado AND tm.id_group = _grupo AND tm.id_headquarters = _sede
		AND tm.id_study_day = _jorn
		ORDER BY apellido1,apellido2,nombre1,nombre2 LIMIT 60;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_group_dir_grade
DROP PROCEDURE IF EXISTS `sp_select_group_dir_grade`;
DELIMITER //
CREATE PROCEDURE `sp_select_group_dir_grade`(
	IN `pyear` YEAR,
	IN `pgrade` INT
)
    COMMENT 'Directores de grupos por grados'
BEGIN
	IF pgrade > 0 THEN
		SELECT td.*, CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
		RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS docente, ts.headquarters_name AS sede,
		TRIM(tj.jornada) AS jornada, RTRIM(tg.grado) AS grado
		FROM dir_grupo AS td
		JOIN aux_docentes AS t1 ON td.id_docente = t1.id_docente
		JOIN docentes AS te ON t1.id_docente = te.id_docente
		JOIN sedes AS ts ON td.id_sede = ts.id
		JOIN jornadas AS tj ON td.id_jorn = tj.cod_jorn
		JOIN grados AS tg ON td.id_grado = tg.id
		WHERE	td.year = pyear AND td.id_grado = pgrade AND t1.year = pyear
		ORDER BY td.id_grado,td.grupo;
	ELSE
		SELECT td.*, CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
		RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS docente, ts.headquarters_name AS sede,
		TRIM(tj.jornada) AS jornada, RTRIM(tg.grado) AS grado
		FROM dir_grupo AS td
		JOIN aux_docentes AS t1 ON td.id_docente = t1.id_docente
		JOIN docentes AS te ON t1.id_docente = te.id_docente
		JOIN sedes AS ts ON td.id_sede = ts.id
		JOIN jornadas AS tj ON td.id_jorn = tj.cod_jorn
		JOIN grados AS tg ON td.id_grado = tg.id
		WHERE	td.year = pyear AND t1.year = pyear
		ORDER BY sede, td.id_grado,td.grupo;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_historial_matriculas
DROP PROCEDURE IF EXISTS `sp_select_historial_matriculas`;
DELIMITER //
CREATE PROCEDURE `sp_select_historial_matriculas`(
	IN `_cod_est` INT(30)
)
BEGIN
	SELECT tm.id, tm.id_state, tm.id_student, tm.date, tm.id_grade, tm.`id_group`, tm.year,
	TRIM(tg.grado) AS grado, RTRIM(tj.JORNADA) AS jornada, RTRIM(ts.headquarters_name) AS sede,
	te.name_state , tm.folio, tm.book, tm.registration_number, ta.msg, ta.estado AS promoted
	FROM student_enrollment AS tm
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN registration_status AS te on tm.id_state = te.id
	JOIN acta_promocion AS ta ON tm.id =  ta.id_matric
	WHERE tm.id_student = _cod_est
	ORDER BY tm.year;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_indicadores_estudiante_boletin
DROP PROCEDURE IF EXISTS `sp_select_indicadores_estudiante_boletin`;
DELIMITER //
CREATE PROCEDURE `sp_select_indicadores_estudiante_boletin`(
	IN `_year` YEAR,
	IN `_grade` TINYINT,
	IN `_periodo` VARCHAR(2),
	IN `_id_nota` INT(30),
	IN `type` INT
)
BEGIN
	DECLARE cTable, cTable2	VARCHAR(30) DEFAULT '';
	SELECT fn_return_table_notas(_grade) INTO cTable;
	SELECT fn_return_table_logros_indicadores(_grade) INTO cTable2;
	SET @sqlSelect = CONCAT("SELECT RTRIM(tl.descripcion) AS descripcion, tl.tipo,
		UPPER(tt.nombre_proceso) nombre_proceso
		FROM logros_estandares AS tl
		JOIN ",cTable2," AS tg ON tg.id_logro_estandar = tl.id
		JOIN ",cTable," AS tn ON tg.id_nota = tn.id
		JOIN tipo_procesos_educativos AS tt ON tl.tipo = tt.id
		WHERE tl.year = ",_year ,"
		AND tl.periodo ='",_periodo,"' AND tg.id_nota = ",_id_nota," AND tn.periodo = '",_periodo,"'
		AND tl.tipo NOT BETWEEN 1 AND 2 AND tl.id_competencia BETWEEN 0 AND 4 ORDER BY tl.tipo,tl.descripcion");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_indicadores_estudiante_boletin_comp
DROP PROCEDURE IF EXISTS `sp_select_indicadores_estudiante_boletin_comp`;
DELIMITER //
CREATE PROCEDURE `sp_select_indicadores_estudiante_boletin_comp`(
	IN `_year` SMALLINT,
	IN `_grade` INT(11),
	IN `_per` VARCHAR(2),
	IN `_id_nota` INT(30),
	IN `type` INT
)
BEGIN
DECLARE cTable, cTable2	VARCHAR(30) DEFAULT '';
	SELECT fn_return_table_notas(_grade) INTO cTable;
	SELECT fn_return_table_logros_indicadores(_grade) INTO cTable2;
	SET @sqlSelect = CONCAT("SELECT RTRIM(tl.descripcion) AS descripcion,
		RTRIM(tc.competencia) AS competencia, tl.tipo,
		tc.id_pk,UPPER(tt.nombre_proceso) nombre_proceso,
		ROW_NUMBER() OVER (PARTITION BY tc.id ORDER BY tc.competencia DESC) AS row_num,
		(SELECT CONCAT('n',t.numero_column) FROM columnas_notas_competencias t
		WHERE t.id_competencia = tc.id_pk AND t.tipo = 'PROM' LIMIT 1) nota,
		(SELECT fn_return_table_notas(",_grade,")) tabla
		FROM logros_estandares AS tl
		JOIN competencias AS tc on tl.id_competencia = tc.id
		JOIN grados_agrupados AS t1 ON tc.id_grado_agrupado = t1.id
		JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
		JOIN ",cTable2," AS tg ON tg.id_logro_estandar = tl.id
		JOIN ",cTable," AS tn ON tg.id_nota = tn.id
		JOIN tipo_procesos_educativos AS tt ON tl.tipo = tt.id
		WHERE tl.year = ",_year ,"
		AND tl.periodo ='",_per,"' AND tg.id_nota = ",_id_nota," AND tn.periodo = '",_per,"'
		AND tl.tipo > 2 AND tl.id_competencia > 0 AND tc.`year` =",`_year`," AND t2.id_grado =",_grade,
		" ORDER BY tl.id_competencia, tl.tipo");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_indicadores_estudiante_boletin_proy
DROP PROCEDURE IF EXISTS `sp_select_indicadores_estudiante_boletin_proy`;
DELIMITER //
CREATE PROCEDURE `sp_select_indicadores_estudiante_boletin_proy`(IN `_id_inst` INT(20), IN `_año` YEAR, IN `_cod_grado` VARCHAR(2) charset utf8, IN `_periodo` VARCHAR(1) charset utf8, IN `_id_nota` INT(30), IN `type` INT)
BEGIN
	CASE
		WHEN _cod_grado >= '01' AND _cod_grado <= '05' THEN
				SELECT tl.id,RTRIM(tl.descripcion) AS descripcion, RTRIM(tc.competencia) AS competencia, tl.tipo,tc.foto
				FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN log_nscp001 AS tg ON tg.id_logro_estandar = tl.id
				JOIN nscp001 AS tn ON tg.id_nota = tn.id
				WHERE tl.id_inst = _id_inst AND tl.año  = _año and tl.cod_grado=_cod_grado
				and tc.año = _año and tc.id_inst = _id_inst and tg.id_nota = _id_nota
				AND tl.tipo > 2 AND tn.periodo = _periodo AND tl.periodo = _periodo
				AND tl.id_competencia BETWEEN 5 AND 9
				order by tl.tipo, tl.descripcion;
		WHEN _cod_grado >= '06' AND _cod_grado <= '09' THEN
				SELECT tl.id,RTRIM(tl.descripcion) AS descripcion, RTRIM(tc.competencia) AS competencia, tl.tipo,tc.foto
				FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN log_nscp002 AS tg ON tg.id_logro_estandar = tl.id
				JOIN nscp002 AS tn ON tg.id_nota = tn.id
				WHERE tl.id_inst = _id_inst AND tl.año  = _año and tl.cod_grado=_cod_grado
				and tc.año = _año and tc.id_inst = _id_inst and tg.id_nota = _id_nota
				AND tl.tipo > 2 AND tn.periodo = _periodo AND tl.periodo = _periodo
				AND tl.id_competencia BETWEEN 5 AND 9
				order by tl.tipo, tl.descripcion;
		WHEN _cod_grado >= '10' THEN
				SELECT tl.id,RTRIM(tl.descripcion) AS descripcion, RTRIM(tc.competencia) AS competencia, tl.tipo,tc.foto
				FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN log_nscp003 AS tg ON tg.id_logro_estandar = tl.id
				JOIN nscp003 AS tn ON tg.id_nota = tn.id
				WHERE tl.id_inst = _id_inst AND tl.año  = _año and tl.cod_grado=_cod_grado
				and tc.año = _año and tc.id_inst = _id_inst and tg.id_nota = _id_nota
				AND tl.tipo > 2 AND tn.periodo = _periodo AND tl.periodo = _periodo
				AND tl.id_competencia BETWEEN 5 AND 9
				order by tl.tipo, tl.descripcion;
		ELSE
				SELECT tl.id,RTRIM(tl.descripcion) AS descripcion, RTRIM(tc.competencia) AS competencia, tl.tipo,tc.foto
				FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN log_nscp00 AS tg ON tg.id_logro_estandar = tl.id
				JOIN nscp00 AS tn ON tg.id_nota = tn.id
				WHERE tl.id_inst = _id_inst AND tl.año  = _año and tl.cod_grado=_cod_grado
				and tc.año = _año and tc.id_inst = _id_inst and tg.id_nota = _id_nota
				AND tl.tipo > 2 AND tn.periodo = _periodo AND tl.periodo = _periodo
				AND tl.id_competencia BETWEEN 5 AND 9
				order by tl.tipo, tl.descripcion;
	END CASE;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_items_bol
DROP PROCEDURE IF EXISTS `sp_select_items_bol`;
DELIMITER //
CREATE PROCEDURE `sp_select_items_bol`(IN `_id_inst` INT(20), IN `_cod_grado` VARCHAR(2) CHARSET utf8, IN `_periodo` VARCHAR(1) charset utf8, IN `_año` YEAR, IN `_type` INT(1))
BEGIN
	CASE _type
		WHEN 1  THEN
            if _cod_grado >= '10' then
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp003 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo=2
				order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
			elseif _cod_grado >= '06' AND _cod_grado <= '09' then
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp002 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo=2
				order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
			elseif _cod_grado >= '01' AND _cod_grado <= '05' then
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp001 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo=2
				order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
			else
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp00 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo=2
				order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
			end if;
		WHEN 2  THEN
			if _cod_grado >= '10' then
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp003 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo > 2
				order by tg.id_nota, tl.id_competencia;
			elseif _cod_grado >= '06' AND _cod_grado <= '09' then
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp002 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo > 2
				order by tg.id_nota, tl.id_competencia;
			elseif _cod_grado >= '01' AND _cod_grado <= '05' then
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp001 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo > 2
				order by tg.id_nota, tl.id_competencia;
			else
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp00 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo > 2
				order by tg.id_nota, tl.id_competencia;
			end if;
        WHEN 3  THEN
			if _cod_grado >= '10' then
				SELECT ts.*, tg.* FROM sugerencias AS ts
				JOIN sug_nscp003 AS tg ON tg.id_sugerencia = ts.id
				where ts.id_inst=_id_inst and ts.año=_año and ts.periodo= _periodo
				order by ts.periodo, ts.tipo;
			elseif _cod_grado >= '06' AND _cod_grado <= '09' then
				SELECT ts.*, tg.* FROM sugerencias AS ts
				JOIN sug_nscp002 AS tg ON tg.id_sugerencia = ts.id
				where ts.id_inst=_id_inst and ts.año=_año and ts.periodo= _periodo
				order by ts.periodo, ts.tipo;
			elseif _cod_grado >= '01' AND _cod_grado <= '05' then
				SELECT ts.*, tg.* FROM sugerencias AS ts
				JOIN sug_nscp001 AS tg ON tg.id_sugerencia = ts.id
				where ts.id_inst=_id_inst and ts.año=_año and ts.periodo= _periodo
				order by ts.periodo, ts.tipo;
			else
				SELECT ts.*, tg.* FROM sugerencias AS ts
				JOIN sug_nscp00 AS tg ON tg.id_sugerencia = ts.id
				where ts.id_inst=_id_inst and ts.año=_año and ts.periodo= _periodo
				order by ts.periodo, ts.tipo;
			end if;
        ELSE
			if _cod_grado >= '10' then
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp003 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo=1
				order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
			elseif _cod_grado >= '06' AND _cod_grado <= '09' then
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp002 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo=1
				order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
			elseif _cod_grado >= '01' AND _cod_grado <= '05' then
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp001 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo=1
				order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
			else
				SELECT tl.*, tc.competencia, td.desempeño, tg.*
                FROM logros_estandares AS tl
				JOIN competencias AS tc on tl.id_competencia = tc.id
				JOIN desempeños AS td ON tl.id_desempeño = td.id
				JOIN log_nscp00 AS tg ON tg.id_logro_estandar = tl.id
				where tl.id_inst=_id_inst and tl.año=_año and tl.cod_grado=_cod_grado
				and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
				and tl.periodo = _periodo AND tl.tipo=1
				order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
			end if;
        END CASE;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_listado_diploma
DROP PROCEDURE IF EXISTS `sp_select_listado_diploma`;
DELIMITER //
CREATE PROCEDURE `sp_select_listado_diploma`(IN `_id_inst` INT(20), IN `_id_sede` INT(20), IN `_cod_grado` VARCHAR(2), IN `_grupo` VARCHAR(2), IN `_id_jorn` INT(2), IN `_año` YEAR, IN `_matric` INT(30))
BEGIN
  DECLARE done, x_count, _libro INT(1) DEFAULT 0;
  DECLARE _id_mat INT(20) DEFAULT 0;
  DECLARE _nom VARCHAR(250) DEFAULT '';
  DECLARE _cur CURSOR FOR SELECT tm.id_matric,
		concat(rtrim(te.nombre1),' ',rtrim(te.nombre2),' ',rtrim(te.apellido1),' ',rtrim(te.apellido2))
	   as estudiantes FROM matriculas AS tm
      JOIN acta_promocion AS tac ON tac.id_matric = tm.id_matric
		JOIN sedes AS ts ON tm.id_sede=ts.id
	   JOIN grados AS tg ON tm.cod_grado=tg.cod_grado
		JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
		JOIN inscripciones AS te ON tm.cod_est=te.cod_est
		JOIN documentos AS td ON te.cod_doc = td.id
		WHERE tm.año = _año  and tm.id_sede  =_id_sede and tm.cod_grado=_cod_grado and
		tm.grupo=_grupo and tm.id_jorn=_id_jorn AND tm.estado = 2 AND
		(tac.estado = 1 OR tac.estado = 4) AND tm.id_inst = _id_inst AND ts.ID_INST = _id_inst
		ORDER BY estudiantes;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

  OPEN _cur;
  REPEAT
   FETCH _cur INTO _id_mat, _nom;
   IF NOT done THEN
      SET x_count = x_count + 1;

	   IF _grupo = '01' OR _grupo = 'A' THEN
	      SET _libro = 1;
	   ELSEIF _grupo = '02' OR _grupo = 'B' THEN
	      SET _libro = 2;
	   ELSEIF _grupo = '03' OR _grupo = 'C' THEN
	      SET _libro = 3;
	   ELSEIF _grupo = '04' OR _grupo = 'D' THEN
	      SET _libro = 4;
	   ELSEIF _grupo = '05' OR _grupo = 'E' THEN
	      SET _libro = 5;
	   ELSEIF _grupo = '06' OR _grupo = 'F' THEN
	      SET _libro = 6;
	   ELSEIF _grupo = '07' OR _grupo = 'G' THEN
	      SET _libro = 7;
	   ELSEIF _grupo = '08' OR _grupo = 'H' THEN
	      SET _libro = 8;
	   ELSEIF _grupo = '09' OR _grupo = 'I' THEN
	      SET _libro = 9;
	   ELSEIF _grupo = '10' OR _grupo = 'J' THEN
	      SET _libro = 10;
	   ELSEIF _grupo = '11' OR _grupo = 'K' THEN
	      SET _libro = 11;
	   ELSEIF _grupo = '12' OR _grupo = 'L' THEN
	      SET _libro = 12;
	   ELSEIF _grupo = '13' OR _grupo = 'M' THEN
	      SET _libro = 13;
	   ELSEIF _grupo = '14' OR _grupo = 'N' THEN
	      SET _libro = 14;
	   ELSEIF _grupo = '15' OR _grupo = 'O' THEN
	      SET _libro = 15;
	   ELSEIF _grupo = '16' OR _grupo = 'P' THEN
	      SET _libro = 16;
	   ELSEIF _grupo = '17' OR _grupo = 'Q' THEN
	      SET _libro = 17;
	   ELSEIF _grupo = '18' OR _grupo = 'R' THEN
	      SET _libro = 18;
		ELSE
	      SET _libro = 1;
	  END IF;

	  UPDATE acta_promocion SET libro = _libro, folio = x_count WHERE id_matric = _id_mat;
   END IF;
  UNTIL done END REPEAT;
  IF _matric > 0 THEN
	SELECT tm.id_inst,tm.id_sede,tm.cod_grado,tm.grupo,tm.año,tm.id_matric,tm.id_folio,tm.nro_matricula,tm.libro_mat,
		RTRIM(ts.nom_sede) As sede,tg.grado,tj.jornada,
		concat(rtrim(te.nombre1),' ',rtrim(te.nombre2),' ',rtrim(te.apellido1),' ',rtrim(te.apellido2))
	   as estudiantes,te.cod_doc,td.tipo, td.abrev,te.sexo,te.nro_doc_id, tac.estado,
		tac.libro, tac.folio, UPPER(RTRIM(tdt.nombre)) dpto, UPPER(RTRIM(mun.nombre_mun)) mun
		FROM matriculas AS tm
      JOIN acta_promocion AS tac ON tac.id_matric = tm.id_matric
		JOIN sedes AS ts ON tm.id_sede=ts.id
	   JOIN grados AS tg ON tm.cod_grado=tg.cod_grado
		JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
		JOIN inscripciones AS te ON tm.cod_est=te.cod_est
		JOIN documentos AS td ON te.cod_doc = td.id
		JOIN departamentos AS tdt ON te.dpto_lug_exp = tdt.id
		JOIN ciudades AS mun ON te.mun_lug_exp = mun.id
		WHERE tm.año = _año AND tm.id_sede  =_id_sede AND tm.cod_grado=_cod_grado AND
		tm.grupo=_grupo AND tm.id_jorn=_id_jorn AND tm.estado = 2 AND (tac.estado = 1 OR tac.estado = 4) AND
		tm.id_inst = _id_inst AND ts.ID_INST = _id_inst AND tm.id_matric = _matric
		ORDER BY estudiantes;
	ELSE
		SELECT tm.id_inst,tm.id_sede,tm.cod_grado,tm.grupo,tm.año,tm.id_matric,tm.id_folio,tm.nro_matricula,tm.libro_mat,
		RTRIM(ts.nom_sede) As sede,tg.grado,tj.jornada,
		concat(rtrim(te.nombre1),' ',rtrim(te.nombre2),' ',rtrim(te.apellido1),' ',rtrim(te.apellido2))
	   as estudiantes,te.cod_doc,td.tipo, td.abrev,te.sexo,te.nro_doc_id, tac.estado,
		tac.libro, tac.folio, UPPER(RTRIM(tdt.nombre)) dpto, UPPER(RTRIM(mun.nombre_mun)) mun
		FROM matriculas AS tm
      JOIN acta_promocion AS tac ON tac.id_matric = tm.id_matric
		JOIN sedes AS ts ON tm.id_sede=ts.id
	   JOIN grados AS tg ON tm.cod_grado=tg.cod_grado
		JOIN jornadas AS tj ON tm.id_jorn=tj.cod_jorn
		JOIN inscripciones AS te ON tm.cod_est=te.cod_est
		JOIN documentos AS td ON te.cod_doc = td.id
		JOIN departamentos AS tdt ON te.dpto_lug_exp = tdt.id
		JOIN ciudades AS mun ON te.mun_lug_exp = mun.id
		WHERE tm.año = _año AND tm.id_sede  =_id_sede AND tm.cod_grado=_cod_grado AND
		tm.grupo=_grupo AND tm.id_jorn=_id_jorn AND tm.estado = 2 AND (tac.estado = 1 OR tac.estado = 4) AND
		tm.id_inst = _id_inst AND ts.ID_INST = _id_inst
		ORDER BY estudiantes;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_listas
DROP PROCEDURE IF EXISTS `sp_select_listas`;
DELIMITER //
CREATE PROCEDURE `sp_select_listas`(
	IN `_year` SMALLINT,
	IN `_headq` INT(30),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_study_day` INT(1)
)
BEGIN
	SELECT tm.id_headquarters id_inst,tm.year `año`,tm.id_headquarters id_sede,
	CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS nombres,
	tg.id cod_grado, tm.id_group grupo, tm.id_study_day id_jorn, RTRIM(ts.headquarters_name) sede,
	RTRIM(tg.grado) grado, RTRIM(tj.jornada) jornada
	FROM inscripciones AS ti
	JOIN student_enrollment AS tm ON tm.id_student = ti.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
	WHERE tm.id_grade =  _grade AND tm.id_headquarters = _headq AND
	tm.year = _year AND tm.id_state = 2 AND
	tm.id_group = _group AND tm.id_study_day = _study_day
	ORDER BY nombres;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_listas_carga
DROP PROCEDURE IF EXISTS `sp_select_listas_carga`;
DELIMITER //
CREATE PROCEDURE `sp_select_listas_carga`(
	IN `_year` SMALLINT,
	IN `_teacher` INT(30)
)
BEGIN
	SELECT tm.id_headquarters id_inst,tm.year `año`,tm.id_headquarters id_sede,
	CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS nombres,
	tg.id cod_grado, tm.id_group grupo, tm.id_study_day id_jorn, RTRIM(ts.headquarters_name) sede, RTRIM(tg.grado) grado,
	RTRIM(tj.jornada) jornada,	RTRIM(tas.asignatura) asignatura,
	CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) AS docente
	FROM inscripciones AS ti
	JOIN student_enrollment AS tm ON tm.id_student = ti.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
	JOIN cursos AS tc ON (tc.id_grado = tg.id AND tc.grupo = tm.id_group AND
										tc.id_sede = ts.ID AND tc.id_jorn = tj.cod_jorn)
	JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
	JOIN docentes AS td ON tc.id_docente = td.id_docente
	WHERE tm.year = _year AND tm.id_state = 2 AND
	tas.estado = 1 AND td.estado = 1 AND td.id_docente = _teacher AND
	tc.`year` = `_year` AND tc.estado = 1 AND tc.id_docente = _teacher
	ORDER BY sede,grado,tm.id_group,tm.id_study_day,asignatura,nombres;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_logros_estudiante
DROP PROCEDURE IF EXISTS `sp_select_logros_estudiante`;
DELIMITER //
CREATE PROCEDURE `sp_select_logros_estudiante`(IN `_id_inst` INT(20), IN `_id_docente` INT(20), IN `_año` YEAR, IN `_cod_grado` VARCHAR(2) charset utf8, IN `_id_asig` INT(2), IN `_periodo` VARCHAR(1) charset utf8, IN `_id_nota` INT(30), IN `_limit` TINYINT, IN `_min` INT(6), IN `_max` INT(6))
BEGIN
if _periodo = '0' then
	if _cod_grado >= '10' then
		SELECT tl.*, tc.competencia, td.desempeño, tg.*, tn.id_matric FROM logros_estandares AS tl
		JOIN competencias AS tc on tl.id_competencia = tc.id
		JOIN desempeños AS td ON tl.id_desempeño = td.id
		JOIN log_nscp003 AS tg ON tg.id_logro_estandar = tl.id
		JOIN nscp003 AS tn ON tn.id = tg.id_nota
		where tl.id_inst=_id_inst and tl.id_docente=_id_docente and
		tl.año=_año and tl.cod_grado=_cod_grado and tl.id_asig=_id_asig
		and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
		and tg.id_nota = _id_nota
		order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
	elseif _cod_grado >= '06' AND _cod_grado <= '09' then
		SELECT tl.*, tc.competencia, td.desempeño, tg.*, tn.id_matric FROM logros_estandares AS tl
		JOIN competencias AS tc on tl.id_competencia = tc.id
		JOIN desempeños AS td ON tl.id_desempeño = td.id
		JOIN log_nscp002 AS tg ON tg.id_logro_estandar = tl.id
		JOIN nscp002 AS tn ON tn.id = tg.id_nota
		where tl.id_inst=_id_inst and tl.id_docente=_id_docente and
		tl.año=_año and tl.cod_grado=_cod_grado and tl.id_asig=_id_asig
		and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
		and tg.id_nota = _id_nota
		order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
	elseif _cod_grado >= '01' AND _cod_grado <= '05' then
		SELECT tl.*, tc.competencia, td.desempeño, tg.*, tn.id_matric FROM logros_estandares AS tl
		JOIN competencias AS tc on tl.id_competencia = tc.id
		JOIN desempeños AS td ON tl.id_desempeño = td.id
		JOIN log_nscp001 AS tg ON tg.id_logro_estandar = tl.id
		JOIN nscp001 AS tn ON tn.id = tg.id_nota
		where tl.id_inst=_id_inst and tl.id_docente=_id_docente and
		tl.año=_año and tl.cod_grado=_cod_grado and tl.id_asig=_id_asig
		and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
		and tg.id_nota = _id_nota
		order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
	else
		SELECT tl.*, tc.competencia, td.desempeño, tg.*, tn.id_matric FROM logros_estandares AS tl
		JOIN competencias AS tc on tl.id_competencia = tc.id
		JOIN desempeños AS td ON tl.id_desempeño = td.id
		JOIN log_nscp00 AS tg ON tg.id_logro_estandar = tl.id
		JOIN nscp00 AS tn ON tn.id = tg.id_nota
		where tl.id_inst=_id_inst and tl.id_docente=_id_docente and
		tl.año=_año and tl.cod_grado=_cod_grado and tl.id_asig=_id_asig
		and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
		and tg.id_nota = _id_nota
		order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo ;
	end if;
else
	if _cod_grado >= '10' then
		SELECT tl.*, tc.competencia, td.desempeño, tg.*, tn.id_matric FROM logros_estandares AS tl
		JOIN competencias AS tc on tl.id_competencia = tc.id
		JOIN desempeños AS td ON tl.id_desempeño = td.id
		JOIN log_nscp003 AS tg ON tg.id_logro_estandar = tl.id
		JOIN nscp003 AS tn ON tn.id = tg.id_nota
		where tl.id_inst=_id_inst and tl.id_docente=_id_docente and
		tl.año=_año and tl.cod_grado=_cod_grado and tl.id_asig=_id_asig
		and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
		and tl.periodo = _periodo and tg.id_nota = _id_nota
		order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo ;
	elseif _cod_grado >= '06' AND _cod_grado <= '09' then
		SELECT tl.*, tc.competencia, td.desempeño, tg.*, tn.id_matric FROM logros_estandares AS tl
		JOIN competencias AS tc on tl.id_competencia = tc.id
		JOIN desempeños AS td ON tl.id_desempeño = td.id
		JOIN log_nscp002 AS tg ON tg.id_logro_estandar = tl.id
		JOIN nscp002 AS tn ON tn.id = tg.id_nota
		where tl.id_inst=_id_inst and tl.id_docente=_id_docente and
		tl.año=_año and tl.cod_grado=_cod_grado and tl.id_asig=_id_asig
		and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
		and tl.periodo = _periodo and tg.id_nota = _id_nota
		order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
	elseif _cod_grado >= '01' AND _cod_grado <= '05' then
		SELECT tl.*, tc.competencia, td.desempeño, tg.*, tn.id_matric FROM logros_estandares AS tl
		JOIN competencias AS tc on tl.id_competencia = tc.id
		JOIN desempeños AS td ON tl.id_desempeño = td.id
		JOIN log_nscp001 AS tg ON tg.id_logro_estandar = tl.id
		JOIN nscp001 AS tn ON tn.id = tg.id_nota
		where tl.id_inst=_id_inst and tl.id_docente=_id_docente and
		tl.año=_año and tl.cod_grado=_cod_grado and tl.id_asig=_id_asig
		and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
		and tl.periodo = _periodo and tg.id_nota = _id_nota
		order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo;
	else
		SELECT tl.*, tc.competencia, td.desempeño, tg.*, tn.id_matric FROM logros_estandares AS tl
		JOIN competencias AS tc on tl.id_competencia = tc.id
		JOIN desempeños AS td ON tl.id_desempeño = td.id
		JOIN log_nscp00 AS tg ON tg.id_logro_estandar = tl.id
		JOIN nscp00 AS tn ON tn.id = tg.id_nota
		where tl.id_inst=_id_inst and tl.id_docente=_id_docente and
		tl.año=_año and tl.cod_grado=_cod_grado and tl.id_asig=_id_asig
		and tc.año=_año and tc.id_inst=_id_inst and td.id_inst=_id_inst and td.año=_año
		and tl.periodo = _periodo and tg.id_nota = _id_nota
		order by tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo ;
	end if;
end if;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_logros_estudiante_all
DROP PROCEDURE IF EXISTS `sp_select_logros_estudiante_all`;
DELIMITER //
CREATE PROCEDURE `sp_select_logros_estudiante_all`(
	IN `PTeacher` INT(30),
	IN `PYear` YEAR,
	IN `PGrade` INT(11),
	IN `PSubject` INT(11),
	IN `PPeriod` VARCHAR(1) charset utf8,
	IN `PGroup` VARCHAR(2),
	IN `PHeadq` INT(20),
	IN `PDay` INT(2)
)
BEGIN
	SELECT fn_return_table_notas(PGrade) INTO @stable;
	SELECT fn_return_table_logros_indicadores(PGrade) INTO @stable2;
	SET @sqlSelect = CONCAT("SELECT tl.*, tcm.competencia, tg.*, es.nombre_escala, tp.nombre_proceso,
		tn.id_matric,
	   concat(rtrim(ti.apellido1),' ',rtrim(ti.apellido2),' ',rtrim(ti.nombre1),' ',rtrim(ti.nombre2))
	   AS nombres
		FROM logros_estandares AS tl
		JOIN ",@stable2," AS tg ON tg.id_logro_estandar = tl.id
		JOIN ",@stable," AS tn ON tg.id_nota = tn.id
		JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year=tc.`year`)
		JOIN escala_nacional AS es ON tl.id_escala = es.id
		JOIN tipo_procesos_educativos AS tp ON tl.tipo = tp.id
		JOIN competencias AS tcm ON (tl.id_competencia = tcm.id AND tl.`year` = tcm.`year`)
		JOIN grados_agrupados AS t1 ON tcm.id_grado_agrupado = t1.id
		JOIN aux_grados_agrupados AS t2 ON (t2.id_grado_agrupado = t1.id)
   	JOIN student_enrollment AS tm  ON tn.id_matric = tm.id
   	JOIN inscripciones AS ti on tm.id_student = ti.id
		WHERE tl.year = ",PYear,"	AND tl.periodo ='",PPeriod,"' AND tn.periodo = '",PPeriod,"'
		AND tc.`year` = ",PYear," AND tc.id_docente = ",PTeacher," AND tc.id_grado = "
		,PGrade," AND tc.id_asig =",PSubject," AND tcm.`year` =",PYear,"
		AND t2.id_grado = ",PGrade," AND tm.id_grade = ",PGrade,"
		AND tm.`year` = ",PYear," AND tm.id_group ='",PGroup,"'
		ORDER BY nombres, tl.tipo, tl.periodo, tl.asignacion, tl.consecutivo");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_logros_estudiante_boletin
DROP PROCEDURE IF EXISTS `sp_select_logros_estudiante_boletin`;
DELIMITER //
CREATE PROCEDURE `sp_select_logros_estudiante_boletin`(
	IN `_year` YEAR,
	IN `_grade` INT(11),
	IN `_periodo` VARCHAR(2),
	IN `_id_nota` INT(30)
)
BEGIN
	DECLARE cTable, cTable2	VARCHAR(30) DEFAULT '';
	SELECT fn_return_table_notas(_grade) INTO cTable;
	SELECT fn_return_table_logros_indicadores(_grade) INTO cTable2;
	SET @sqlSelect = CONCAT("SELECT RTRIM(tl.descripcion) AS descripcion, tl.tipo
		FROM logros_estandares AS tl
		JOIN ",cTable2," AS tg ON tg.id_logro_estandar = tl.id
		JOIN ",cTable," AS tn ON tg.id_nota = tn.id
		WHERE tl.year = ",_year ,"
		AND tl.periodo ='",_periodo,"' AND tg.id_nota = ",_id_nota," AND tn.periodo = '",_periodo,"'
		AND tl.tipo = 2 ORDER BY tl.descripcion");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_logros_es_docente
DROP PROCEDURE IF EXISTS `sp_select_logros_es_docente`;
DELIMITER //
CREATE PROCEDURE `sp_select_logros_es_docente`(
	IN `PTeacher` INT(30),
	IN `PYear` YEAR,
	IN `PGrade` INT(11),
	IN `PSubject` INT(11),
	IN `PPeriod` VARCHAR(2)
)
BEGIN
	SET @period = "";
	IF LENGTH(PPeriod) > 0 THEN
		SET @period = CONCAT(" AND tl.periodo = ",PPeriod," ");
	END IF;
	SET @sqlSelect = CONCAT("SELECT tl.*,tp.nombre_proceso, tc.competencia, es.nombre_escala
		FROM logros_estandares AS tl
		JOIN escala_nacional AS es ON tl.id_escala = es.id
		JOIN tipo_procesos_educativos AS tp ON tl.tipo = tp.id
		JOIN competencias AS tc ON (tl.id_competencia = tc.id AND tl.year = tc.year)
		JOIN grados_agrupados AS t1 ON tc.id_grado_agrupado = t1.id
		JOIN aux_grados_agrupados AS t2 ON (t2.id_grado_agrupado = t1.id AND t2.id_grado = tl.id_grado)
		WHERE tl.id_docente = ",PTeacher," AND tl.id_grado = ",PGrade,"
		AND tl.id_asig = ",PSubject," AND tl.year = ",PYear,@period,"
		AND tc.year = ",PYear," AND t2.id_grado = ",PGrade,"
		ORDER BY tl.tipo, tl.periodo, tl.id_competencia,tl.id_escala");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_matcurso
DROP PROCEDURE IF EXISTS `sp_select_matcurso`;
DELIMITER //
CREATE PROCEDURE `sp_select_matcurso`(
	IN `_grade` INT(11),
	IN `_year` YEAR
)
BEGIN
	IF _grade > 0 THEN
		SELECT tm.*, au.id_area, RTRIM(ta.asignatura) as asignatura, tg.grado,ta.abrev
		FROM matcurso AS tm
		JOIN asignaturas AS ta ON tm.id_asig=ta.id_pk
		JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		JOIN grados AS tg ON tm.id_grado = tg.id
		WHERE tm.year = _year AND au.year = _year AND tg.id = _grade
		ORDER BY au.id_area, tm.id_asig LIMIT 60;
	ELSE
		SELECT tm.*, au.id_area, RTRIM(ta.asignatura) as asignatura, tg.grado,ta.abrev
		FROM matcurso AS tm
		JOIN asignaturas AS ta ON tm.id_asig=ta.id_pk
		JOIN aux_asignaturas AS au ON au.id_asign = ta.id_pk
		JOIN grados AS tg ON tm.id_grado = tg.id
		WHERE tm.year = _year AND au.year = _year
		ORDER BY tm.id_grado, au.id_area, tm.id_asig LIMIT 60;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_matriculados
DROP PROCEDURE IF EXISTS `sp_select_matriculados`;
DELIMITER //
CREATE PROCEDURE `sp_select_matriculados`(
	IN `_year` SMALLINT,
	IN `_headq` INT(30),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_study_day` INT(1)
)
BEGIN
	SELECT tm.id_student, ti.nro_documento nro_doc_id,
	CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) nombres,
	tg.cod_grado, tm.id_group grupo, tm.id_study_day id_jorn,
	RIGHT(CONCAT('000000',tm.registration_number),6) nro_matricula,
	tm.id id_matric, RTRIM(tg.grado) grado, RTRIM(ts.headquarters_name) sede,
	RTRIM(tj.jornada) jornada, td.abrev tdocumento
	FROM inscripciones AS ti
	JOIN student_enrollment AS tm ON tm.id_student = ti.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN documentos AS td ON ti.id_documento = td.id
	WHERE tm.year = _year AND tm.id_group =_group AND tm.id_study_day = _study_day AND
	tm.id_headquarters = _headq AND tm.id_state = 2 AND
	tm.id_grade = _grade ORDER BY nombres;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_matriculas
DROP PROCEDURE IF EXISTS `sp_select_matriculas`;
DELIMITER //
CREATE PROCEDURE `sp_select_matriculas`(
	IN `_year` YEAR,
	IN `_headq` INT(20),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_study_day` INT
)
BEGIN
	SELECT tm.id,tm.id_group,tm.id_study_day,tm.id_headquarters, tm.id_grade,
		CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) nombres,
		RTRIM(tg.grado) grado, tg.cod_grado, RTRIM(ts.headquarters_name) sede, RTRIM(tj.jornada) jornada, tm.year
		FROM inscripciones AS te
		JOIN student_enrollment AS tm ON tm.id_student = te.id
		JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		JOIN grados AS tg ON tm.id_grade = tg.id
		JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
		WHERE tm.id_grade = _grade AND tm.id_study_day = _study_day AND tm.id_state = 2
		AND tm.id_headquarters = _headq AND tm.year= _year
		AND tm.id_group = _group ORDER BY nombres;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_nivel_ens
DROP PROCEDURE IF EXISTS `sp_select_nivel_ens`;
DELIMITER //
CREATE PROCEDURE `sp_select_nivel_ens`(IN `_id_inst` INT(30), IN `_grado` VARCHAR(2))
BEGIN
	SELECT fn_niveles_ens(_id_inst,_grado);
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_notas_academicas_curso
DROP PROCEDURE IF EXISTS `sp_select_notas_academicas_curso`;
DELIMITER //
CREATE PROCEDURE `sp_select_notas_academicas_curso`(
	IN `PCourse` INT(30),
	IN `PPeriod` VARCHAR(2),
	IN `PYear` YEAR,
	IN `PGrade` INT(11),
	IN `PSx` VARCHAR(4)
)
BEGIN
	SELECT fn_return_table_notas(PGrade) INTO @stable;
	SELECT fn_return_table_notas_promedios(PGrade) INTO @stable2;
	SET @Vsex	= '';
	IF NOT PSx = "MX" THEN
		SET @Vsex = CONCAT(" AND tx.abrev_sexo ='",PSx,"'");
	END IF;
	SET @sqlSelect = CONCAT("SELECT tn.*, tc.id_grado, tc.grupo, tc.id_jorn,
			CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2))  AS nombres,
			tx.abrev_sexo AS sexo, ta.asignatura, tmc.proc1, tmc.proc2, tmc.proc3, tmc.proc4, es.nombre_escala,
			tp.prom FROM ",@stable," AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
			JOIN student_enrollment AS tm ON (tn.id_matric=tm.id AND tm.id_grade = tc.id_grado AND tm.year = tc.year)
			JOIN inscripciones AS ti ON tm.id_student = ti.id
			JOIN sexo AS tx ON ti.id_sexo = tx.id
			JOIN asignaturas AS ta ON tc.id_asig=ta.id_pk
			JOIN matcurso AS tmc ON (tmc.id_asig = ta.id_pk AND tmc.id_grado = tc.id_grado AND tmc.year = tc.year)
			JOIN escala_nacional AS es ON tn.id_escala = es.id
			JOIN ",@stable2," AS tp ON (tp.id_curso = tc.id AND tp.id_matric = tn.id_matric)
			WHERE tn.periodo='",PPeriod,"' AND tm.id_state = 2 ",@Vsex," AND
			tc.year =",`PYear`," AND tc.id_grado =",PGrade," AND tc.id=",PCourse,"
			ORDER BY nombres");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_notas_academicas_estudiante
DROP PROCEDURE IF EXISTS `sp_select_notas_academicas_estudiante`;
DELIMITER //
CREATE PROCEDURE `sp_select_notas_academicas_estudiante`(
	IN `_enrollment` INT(30),
	IN `_year` SMALLINT(4)
)
BEGIN
	DECLARE cTable, cTable2 VARCHAR(30) DEFAULT '';
	SELECT a.id_grade INTO @grade FROM student_enrollment a
	WHERE a.id = _enrollment LIMIT 1;
	SELECT fn_return_table_notas(@grade) INTO cTable;
	SELECT fn_return_table_notas_promedios(@grade) INTO cTable2;

	SET @sqlSelect = CONCAT("SELECT tn.*, tc.id_grado, tc.grupo, tc.id_jorn,ta.asignatura,
			tmc.proc1, tmc.proc2, tmc.proc3, tmc.proc4, tmc.ih , es.nombre_escala,
			tp.prom FROM ",cTable," AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
			JOIN student_enrollment AS tm ON tn.id_matric=tm.id
			JOIN asignaturas AS ta ON tc.id_asig=ta.id_pk
			JOIN matcurso AS tmc ON (tmc.id_asig = ta.id_pk AND tmc.year = tn.year AND tmc.id_grado = tc.id_grado)
			JOIN escala_nacional AS es ON tn.id_escala = es.id
			JOIN ",cTable2," AS tp ON (tp.id_curso = tc.id AND tp.id_matric = tn.id_matric)
			WHERE tm.id = ",_enrollment," ORDER BY tn.periodo, ta.asignatura");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_notas_academicas_periodo
DROP PROCEDURE IF EXISTS `sp_select_notas_academicas_periodo`;
DELIMITER //
CREATE PROCEDURE `sp_select_notas_academicas_periodo`(
	IN `_enrollment` INT(30),
	IN `_period` VARCHAR(2),
	IN `_year` SMALLINT(4),
	IN `_grade` INT(11)
)
BEGIN
	DECLARE cTable, cTable2 VARCHAR(30) DEFAULT '';
	SELECT fn_return_table_notas(_grade) INTO cTable;
	SELECT fn_return_table_notas_promedios(_grade) INTO cTable2;

	SET @sqlSelect = CONCAT("SELECT tn.*, tc.id_grado, tc.grupo, tc.id_jorn,ta.asignatura,
			tmc.proc1, tmc.proc2, tmc.proc3, tmc.proc4, tmc.ih , es.nombre_escala,
			tp.prom FROM ",cTable," AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
			JOIN student_enrollment AS tm ON tn.id_matric=tm.id
			JOIN asignaturas AS ta ON tc.id_asig=ta.id_pk
			JOIN matcurso AS tmc ON tmc.id_asig = ta.id_pk
			JOIN escala_nacional AS es ON tn.id_escala = es.id
			JOIN ",cTable2," AS tp ON (tp.id_curso = tc.id AND tp.id_matric = tn.id_matric)
			WHERE tn.periodo='",_period,"' AND tm.year = ",_year," AND tmc.year=",_year,
			" AND tc.year =",`_year`," AND tc.id_grado =",_grade,
			" AND tm.id=",_enrollment," AND tmc.id_grado=",_grade,' ORDER BY ta.asignatura');
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_notas_academicas_periodo_final
DROP PROCEDURE IF EXISTS `sp_select_notas_academicas_periodo_final`;
DELIMITER //
CREATE PROCEDURE `sp_select_notas_academicas_periodo_final`(
	IN `_enrollment` INT(30),
	IN `_period` VARCHAR(2),
	IN `_year` SMALLINT(4),
	IN `_grade` INT(11)
)
BEGIN
	DECLARE cTable, cTable2 VARCHAR(30) DEFAULT '';
	SELECT fn_return_table_notas(_grade) INTO cTable;
	SELECT fn_return_table_notas_promedios(_grade) INTO cTable2;

	SET @sqlSelect = CONCAT("SELECT tn.final, tn.periodo, tc.id_grado, tc.grupo, tc.id_jorn,ta.asignatura,
			tmc.proc1, tmc.proc2, tmc.proc3, tmc.proc4, tmc.ih , es.nombre_escala,
			tp.prom FROM ",cTable," AS tn
			JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
			JOIN student_enrollment AS tm ON tn.id_matric=tm.id
			JOIN asignaturas AS ta ON tc.id_asig=ta.id_pk
			JOIN matcurso AS tmc ON tmc.id_asig = ta.id_pk
			JOIN escala_nacional AS es ON tn.id_escala = es.id
			JOIN ",cTable2," AS tp ON (tp.id_curso = tc.id AND tp.id_matric = tn.id_matric)
			WHERE tn.periodo='",_period,"' AND tm.year = ",_year," AND tmc.year=",_year,
			" AND tc.year =",`_year`," AND tc.id_grado =",_grade,
			" AND tm.id=",_enrollment," AND tmc.id_grado=",_grade,' ORDER BY ta.asignatura');
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_notas_reportadas
DROP PROCEDURE IF EXISTS `sp_select_notas_reportadas`;
DELIMITER //
CREATE PROCEDURE `sp_select_notas_reportadas`(
	IN `_id_docente` INT(20),
	IN `_year` YEAR,
	IN `_periodo` VARCHAR(2)
)
BEGIN
	(SELECT tn.periodo,tn.year,tn.final, tc.grupo, tg.cod_grado, tg.grado,
		RTRIM(tas.asignatura) asignatura,tas.abrev AS abrev_asig,
		RTRIM(tar.area) area, tar.abrev AS abre_area,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',
		RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
		ts.headquarters_name AS sede, tj.jornada
		,CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
		RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) as estudiante,
		tme.name_state, es.nombre_escala	FROM nscp00 AS tn
		JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
		JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
		JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = _year)
	   JOIN areas AS tar ON au.id_area = tar.id
		JOIN docentes AS td ON tc.id_docente=td.id_docente
		JOIN sedes AS ts ON tc.id_sede=ts.id
	   JOIN jornadas AS tj ON tc.id_jorn=tj.cod_jorn
	   JOIN grados As tg ON tc.id_grado=tg.id
	   JOIN student_enrollment AS tm ON tn.id_matric=tm.id
		JOIN inscripciones AS te ON tm.id_student = te.id
		JOIN registration_status AS tme ON tm.id_state = tme.id
		JOIN `desempeños` AS t1 ON (tn.final BETWEEN t1.desde AND t1.hasta AND t1.year = tn.year)
		JOIN grados_agrupados AS t2 ON t1.id_grado_agrupado = t2.id
		JOIN aux_grados_agrupados AS t3 ON t3.id_grado_agrupado = t2.id
		JOIN escala_nacional AS es ON t1.id_escala = es.id
		WHERE tn.periodo = _periodo AND tn.year =  _year AND
		tc.year =  _year AND tm.year =  _year
		AND  tc.id_docente = _id_docente AND t3.id_grado = tc.id_grado)
	UNION ALL
	(SELECT tn.periodo,tn.year,tn.final, tc.grupo, tg.cod_grado, tg.grado,
		RTRIM(tas.asignatura) asignatura,tas.abrev AS abrev_asig,
		RTRIM(tar.area) area, tar.abrev AS abre_area,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',
		RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
		ts.headquarters_name AS sede, tj.jornada
		,CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
		RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) as estudiante,
		tme.name_state, es.nombre_escala	FROM nscp001 AS tn
		JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
		JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
		JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = _year)
	   JOIN areas AS tar ON au.id_area = tar.id
		JOIN docentes AS td ON tc.id_docente=td.id_docente
		JOIN sedes AS ts ON tc.id_sede=ts.id
	   JOIN jornadas AS tj ON tc.id_jorn=tj.cod_jorn
	   JOIN grados As tg ON tc.id_grado=tg.id
	   JOIN student_enrollment AS tm ON tn.id_matric=tm.id
		JOIN inscripciones AS te ON tm.id_student = te.id
		JOIN registration_status AS tme ON tm.id_state = tme.id
		JOIN `desempeños` AS t1 ON (tn.final BETWEEN t1.desde AND t1.hasta AND t1.year = tn.year)
		JOIN grados_agrupados AS t2 ON t1.id_grado_agrupado = t2.id
		JOIN aux_grados_agrupados AS t3 ON t3.id_grado_agrupado = t2.id
		JOIN escala_nacional AS es ON t1.id_escala = es.id
		WHERE tn.periodo = _periodo AND tn.year =  _year AND
		tc.year =  _year AND tm.year =  _year
		AND  tc.id_docente = _id_docente AND t3.id_grado = tc.id_grado)
	UNION ALL
	(SELECT tn.periodo,tn.year,tn.final, tc.grupo, tg.cod_grado, tg.grado,
		RTRIM(tas.asignatura) asignatura,tas.abrev AS abrev_asig,
		RTRIM(tar.area) area, tar.abrev AS abre_area,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',
		RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
		ts.headquarters_name AS sede, tj.jornada
		,CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
		RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) as estudiante,
		tme.name_state, es.nombre_escala	FROM nscp002 AS tn
		JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
		JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
		JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = _year)
	   JOIN areas AS tar ON au.id_area = tar.id
		JOIN docentes AS td ON tc.id_docente=td.id_docente
		JOIN sedes AS ts ON tc.id_sede=ts.id
	   JOIN jornadas AS tj ON tc.id_jorn=tj.cod_jorn
	   JOIN grados As tg ON tc.id_grado=tg.id
	   JOIN student_enrollment AS tm ON tn.id_matric=tm.id
		JOIN inscripciones AS te ON tm.id_student = te.id
		JOIN registration_status AS tme ON tm.id_state = tme.id
		JOIN `desempeños` AS t1 ON (tn.final BETWEEN t1.desde AND t1.hasta AND t1.year = tn.year)
		JOIN grados_agrupados AS t2 ON t1.id_grado_agrupado = t2.id
		JOIN aux_grados_agrupados AS t3 ON t3.id_grado_agrupado = t2.id
		JOIN escala_nacional AS es ON t1.id_escala = es.id
		WHERE tn.periodo = _periodo AND tn.year =  _year AND
		tc.year =  _year AND tm.year =  _year AND  tc.id_docente = _id_docente
		AND t3.id_grado = tc.id_grado)
	UNION ALL
	(SELECT tn.periodo,tn.year,tn.final, tc.grupo, tg.cod_grado, tg.grado,
		RTRIM(tas.asignatura) asignatura,tas.abrev AS abrev_asig,
		RTRIM(tar.area) area, tar.abrev AS abre_area,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',
		RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,
		ts.headquarters_name AS sede, tj.jornada
		,CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
		RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) as estudiante,
		tme.name_state, es.nombre_escala	FROM nscp003 AS tn
		JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
		JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
		JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = _year)
	   JOIN areas AS tar ON au.id_area = tar.id
		JOIN docentes AS td ON tc.id_docente=td.id_docente
		JOIN sedes AS ts ON tc.id_sede=ts.id
	   JOIN jornadas AS tj ON tc.id_jorn=tj.cod_jorn
	   JOIN grados As tg ON tc.id_grado=tg.id
	   JOIN student_enrollment AS tm ON tn.id_matric=tm.id
		JOIN inscripciones AS te ON tm.id_student = te.id
		JOIN registration_status AS tme ON tm.id_state = tme.id
		JOIN `desempeños` AS t1 ON (tn.final BETWEEN t1.desde AND t1.hasta AND t1.year = tn.year)
		JOIN grados_agrupados AS t2 ON t1.id_grado_agrupado = t2.id
		JOIN aux_grados_agrupados AS t3 ON t3.id_grado_agrupado = t2.id
		JOIN escala_nacional AS es ON t1.id_escala = es.id
		WHERE tn.periodo = _periodo AND tn.year =  _year AND
		tc.year =  _year AND tm.year =  _year
		AND  tc.id_docente = _id_docente AND t3.id_grado = tc.id_grado)
		ORDER BY sede,cod_grado,grupo,jornada,name_state,area,asignatura,estudiante;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_online_activities
DROP PROCEDURE IF EXISTS `sp_select_online_activities`;
DELIMITER //
CREATE PROCEDURE `sp_select_online_activities`(
	IN `PYear` YEAR,
	IN `PStudent` INT(30),
	IN `PMaterial` BIGINT
)
BEGIN
	SET @studen = "";
	IF PStudent > 0 THEN
		SET @studen	= CONCAT(" AND ma.id = ", PStudent," ");
	END IF;
	SET @material = "";
	IF PMaterial > 0 THEN
		SET @material	= CONCAT(" AND a.id = ", PMaterial," ");
	END IF;
	SET @sqlSelect = CONCAT("SELECT d.id, a.id AS master_id, d.id_material, d.id_matric, d.leido, a.nombre, a.descripcion, a.url_video,
	a.mime, a.url_enlace, a.estado, a.restringir, a.calificable, a.fecha, a.hora,
	a.fecha_cierre, a.hora_cierre, RTRIM(ta.asignatura) asignatura,
		tc.id_grado, tc.grupo, tg.grado,RTRIM(tj.JORNADA) jornada, RTRIM(ts.headquarters_name) sede,
		CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) docente,
		td.image,td.mime,
		CONCAT(TRIM(ti.apellido1),' ',TRIM(ti.apellido2),' ',TRIM(ti.nombre1),'',TRIM(ti.nombre2)) estudiante
	FROM material_educ AS a
	JOIN cursos_material_educ AS b ON b.id_material = a.id
	JOIN cursos AS tc ON b.id_curso = tc.id
	JOIN material_educ_compartido AS d ON d.id_material = b.id
	JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
	JOIN student_enrollment AS ma ON (d.id_matric = ma.id AND ma.id_group = tc.grupo AND ma.year = tc.year
	AND ma.id_grade = tc.id_grado AND ma.id_study_day = tc.id_jorn AND ma.id_headquarters = tc.id_sede)
	JOIN inscripciones AS ti ON ma.id_student = ti.id
	JOIN docentes AS td ON tc.id_docente = td.id_docente
	JOIN sedes AS ts ON tc.id_sede = ts.ID
	JOIN grados AS tg ON tc.id_grado = tg.id
	JOIN jornadas AS tj ON tc.id_jorn = tj.cod_jorn
	WHERE tc.year = ",PYear,@studen,@material," AND
	ta.estado = 1 AND ma.id_state = 2 AND td.estado = 1
	ORDER BY tc.id_grado, tc.grupo, tc.id_jorn, estudiante");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_parcelador
DROP PROCEDURE IF EXISTS `sp_select_parcelador`;
DELIMITER //
CREATE PROCEDURE `sp_select_parcelador`(IN `_id_inst` INT(20), IN `_id_docente` INT(30), IN `_año` YEAR)
BEGIN
SELECT tm.*, UPPER(tg.grado) AS grado, TRIM(ta.asignatura) AS asignatura
	FROM parcelador AS tm, grados AS tg, asignaturas AS ta
	WHERE tm.id_grado = tg.id AND tm.id_asig=ta.id_pk
	AND tm.estado=1 AND tm.id_docente=_id_docente
	AND tm.año=_año AND tm.id_inst=_id_inst
	AND ta.id_inst=_id_inst
	ORDER BY tm.id_grado,asignatura, tm.periodo;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_par_cl
DROP PROCEDURE IF EXISTS `sp_select_par_cl`;
DELIMITER //
CREATE PROCEDURE `sp_select_par_cl`(IN `_id_parcelador` INT(20), IN `_type` INT(1))
BEGIN
	SELECT * FROM parcelador_cli WHERE id_parcelador=_id_parcelador AND tipo=_type;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_par_cli
DROP PROCEDURE IF EXISTS `sp_select_par_cli`;
DELIMITER //
CREATE PROCEDURE `sp_select_par_cli`(IN `_id_parcelador` INT(20), IN `_type` INT(1), IN `_año` YEAR, IN `_id_inst` INT(20), IN `_grado` INT(11))
BEGIN
	SELECT tp.*, tc.competencia , td.nombre_escala
		FROM parcelador_cli AS tp
		JOIN competencias AS tc ON tp.id_competencia=tc.id
		JOIN grados_agrupados AS t1 ON tc.id_grado_agrupado= t1.id
		JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
		JOIN escala_nacional AS td ON tp.id_escala=td.id
		WHERE tp.id_parcelador=_id_parcelador AND tp.tipo >= _type AND tc.año=_año
		AND tc.id_inst=_id_inst AND td.id_inst=_id_inst
		AND t2.id_grado = _grado
      ORDER BY competencia;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_par_cont_tem
DROP PROCEDURE IF EXISTS `sp_select_par_cont_tem`;
DELIMITER //
CREATE PROCEDURE `sp_select_par_cont_tem`(IN `_id_parcelador` INT(20), IN `_type` INT(1))
BEGIN
	SELECT tc.id, tc.id_parcelador, RTRIM(tc.descripcion) AS descripcion, rtrim(ti.descripcion) AS descripcion_item FROM
    parcelador_con_tem AS tc JOIN parcelador_items_con_tem AS ti ON tc.tipo=ti.id
	WHERE tc.id_parcelador=_id_parcelador AND tc.tipo=_type AND tc.estado=1;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_plan_semanal_clases
DROP PROCEDURE IF EXISTS `sp_select_plan_semanal_clases`;
DELIMITER //
CREATE PROCEDURE `sp_select_plan_semanal_clases`(IN `_id_inst` INT(20), IN `_id_docente` INT(20), IN `_año` YEAR, IN `_limit` TINYINT, IN `_min` INT(6), IN `_max` INT(6))
BEGIN
	IF _limit = 1 then
		SELECT tp.*, CONCAT(rtrim(td.apellido1),' ',rtrim(td.apellido2),' ',rtrim(td.nombre1),' ',rtrim(td.nombre2)) AS docente,
		tg.grado, tas.asignatura FROM plan_semanal_clases AS tp
		JOIN docentes AS td on tp.id_docente=td.id_docente
		JOIN grados as tg on tp.cod_grado=tg.cod_grado
		JOIN asignaturas as tas on tp.id_asig=tas.id WHERE
		tp.id_inst=_id_inst AND tp.id_docente=_id_docente AND
		tp.año=_año and tas.año=_año and tas.id_inst=_id_inst
		ORDER BY tp.cod_grado,tp.id_asig,tp.periodo limit _min,_max;
	else
		SELECT tp.*, CONCAT(rtrim(td.apellido1),' ',rtrim(td.apellido2),' ',rtrim(td.nombre1),' ',rtrim(td.nombre2)) AS docente,
		tg.grado, tas.asignatura FROM plan_semanal_clases AS tp
		JOIN docentes AS td on tp.id_docente=td.id_docente
		JOIN grados as tg on tp.cod_grado=tg.cod_grado
		JOIN asignaturas as tas on tp.id_asig=tas.id WHERE
		tp.id_inst=_id_inst AND tp.id_docente=_id_docente AND
		tp.año=_año and tas.año=_año and tas.id_inst=_id_inst
		ORDER BY tp.cod_grado,tp.id_asig,tp.periodo;
    end if;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_preinforme
DROP PROCEDURE IF EXISTS `sp_select_preinforme`;
DELIMITER //
CREATE PROCEDURE `sp_select_preinforme`(IN `_id_matric` INT(30), IN `_id_curso` INT(30), IN `_per` VARCHAR(2), IN `_grado` INT(11))
BEGIN
	DECLARE
		cTable, cTable1 VARCHAR(60) DEFAULT '';
	SELECT fn_return_table_preinforme(_grado) INTO cTable;
	SELECT fn_return_table_notas(_grado) INTO cTable1;
	SET @sqlSelect = CONCAT("SELECT tn.final, tn.periodo, t1.obs,
	IF(ISNULL(t1.estado), 0, t1.estado) estado
	FROM ",cTable1," AS tn
	JOIN ",cTable," AS t1 ON t1.id_nota = tn.id
	WHERE tn.periodo = '",_per,"' AND tn.id_curso = ",_id_curso," AND
	tn.id_matric = ",_id_matric);
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_preinforme_all
DROP PROCEDURE IF EXISTS `sp_select_preinforme_all`;
DELIMITER //
CREATE PROCEDURE `sp_select_preinforme_all`(
	IN `PCourse` INT(30),
	IN `PPeriod` VARCHAR(2),
	IN `PGrade` INT(11),
	IN `PGroup` VARCHAR(2),
	IN `PYear` YEAR
)
BEGIN
	SELECT fn_return_table_preinforme(PGrade) INTO @stable;
	SELECT fn_return_table_notas(PGrade) INTO @stable2;

	SET @sqlQuery	= CONCAT("INSERT INTO ",@stable," (id_nota)
			SELECT tn.id FROM ",@stable2," AS tn
			WHERE tn.id_curso = ",PCourse," AND tn.periodo = ",PPeriod," AND
			NOT EXISTS(
				SELECT * FROM ",@stable," AS a
				WHERE a.id_nota = tn.id
			)");
	PREPARE smtp FROM @sqlQuery;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;

	SET @sqlSelect = CONCAT("SELECT tn.final, tn.periodo, t1.id, t1.obs,
	IF(ISNULL(t1.estado), 0, t1.estado) estado,
	CONCAT(TRIM(ti.apellido1),' ',TRIM(ti.apellido2),' ',TRIM(ti.nombre1),' ',TRIM(ti.nombre2)) AS estudiante
	FROM ",@stable2," AS tn
	JOIN cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year)
	JOIN ",@stable," AS t1 ON t1.id_nota = tn.id
	JOIN student_enrollment AS tm ON tn.id_matric = tm.id
	JOIN inscripciones AS ti ON tm.id_student = ti.id
	WHERE tn.periodo = '",PPeriod,"' AND tn.id_curso = ",PCourse,"
	AND tc.id = ",PCourse," AND t1.id_nota = tn.id
	AND tc.year = ",PYear," AND tm.year = ",PYear,"
	AND tm.id_grade=",PGrade," AND tm.id_group = ",PGroup," ORDER BY estudiante");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_respeciales
DROP PROCEDURE IF EXISTS `sp_select_respeciales`;
DELIMITER //
CREATE PROCEDURE `sp_select_respeciales`(IN `_id_sede` INT(20), IN `_año` YEAR, IN `_cod_grado` VARCHAR(2) charset utf8)
BEGIN
SELECT tr.nro_acta,tr.id_docente,tm.cod_est,tm.cod_grado,tm.grupo,
	 tm.id_sede,tm.id_jorn,tr.id_asig,tm.año,tas.cod_area,tr.notafinal,
	 tr.notarecuperada,tr.fecha,tas.abrev, tar.area,
	 CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS nombres
	 FROM respeciales AS tr
	 JOIN asignaturas AS tas ON tr.id_asig = tas.id
	 JOIN areas AS tar ON tas.cod_area = tar.cod_area
	 JOIN matriculas AS tm ON tr.id_matric = tm.id_matric
	 JOIN inscripciones AS ti ON tm.cod_est = ti.cod_est
	 WHERE tm.id_sede = _id_sede AND tm.cod_grado = _cod_grado and
	 tm.año = _año AND tar.año = _año AND tas.año = _año AND tm.estado = 2
	 ORDER BY tr.nro_acta,tm.cod_grado,tm.grupo,nombres,tas.cod_area,tr.id_asig,tm.año;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_respeciales_docente
DROP PROCEDURE IF EXISTS `sp_select_respeciales_docente`;
DELIMITER //
CREATE PROCEDURE `sp_select_respeciales_docente`(
	IN `PYear` YEAR,
	IN `PTeacher` INT(30),
	IN `_all` INT
)
BEGIN
	IF _all > 0 THEN
		SELECT tr.id,tr.id_matric,RIGHT(CONCAT('000000',tr.nro_acta),6) nro_acta,tc.id_docente,tc.id_asig,
		tr.notafinal,tr.notarecuperada,tr.fecha,tr.estado,tm.year,tg.cod_grado,tm.id_grade,tm.id_group grupo,
		aux.id_area cod_area,tas.abrev,
		RTRIM(tas.asignatura) asignatura, RTRIM(tar.area) area,
		 CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS estudiante,
		 CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) AS docente,
		 RTRIM(ts.headquarters_name) sede, RTRIM(tj.jornada) jornada
		 FROM respeciales AS tr
		 JOIN cursos AS tc ON tr.id_curso = tc.id
		 JOIN student_enrollment AS tm ON tr.id_matric = tm.id
		 JOIN grados AS tg ON (tc.id_grado = tg.id AND tm.id_grade = tg.id)
		 JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
		 JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = tc.year)
		 JOIN areas AS tar ON aux.id_area = tar.id
		 JOIN inscripciones AS ti ON tm.id_student = ti.id
		 JOIN docentes AS td ON tc.id_docente = td.id_docente
		 JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		 JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
		 WHERE tc.year = `Pyear` AND tc.id_docente = PTeacher AND tm.year = Pyear
		 AND tm.id_state = 2
		 ORDER BY tr.nro_acta,tm.id_grade,tm.id_group,estudiante,aux.id_area,tc.id_asig,tm.year;
	ELSE
		SELECT tr.id,tr.id_matric,RIGHT(CONCAT('000000',tr.nro_acta),6) nro_acta,tc.id_docente,tc.id_asig,
		tr.notafinal,tr.notarecuperada,tr.fecha,tr.estado,tm.year,tg.cod_grado,tm.id_grade,tm.id_group grupo,
		aux.id_area cod_area,tas.abrev,
		RTRIM(tas.asignatura) asignatura, RTRIM(tar.area) area,
		 CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS estudiante,
		 CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) AS docente,
		 RTRIM(ts.headquarters_name) sede, RTRIM(tj.jornada) jornada
		 FROM respeciales AS tr
		 JOIN cursos AS tc ON tr.id_curso = tc.id
		 JOIN student_enrollment AS tm ON tr.id_matric = tm.id
		 JOIN grados AS tg ON (tc.id_grado = tg.id AND tm.id_grade = tg.id)
		 JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
		 JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk AND aux.year = tc.year)
		 JOIN areas AS tar ON aux.id_area = tar.id
		 JOIN inscripciones AS ti ON tm.id_student = ti.id
		 JOIN docentes AS td ON tc.id_docente = td.id_docente
		 JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		 JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
		 WHERE tc.year = `Pyear` AND tc.id_docente = PTeacher AND tm.year = Pyear
		 AND tm.id_state = 2 AND  tr.estado = 1
		 ORDER BY tr.nro_acta,tm.id_grade,tm.id_group,estudiante,aux.id_area,tc.id_asig,tm.year;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_respeciales_est
DROP PROCEDURE IF EXISTS `sp_select_respeciales_est`;
DELIMITER //
CREATE PROCEDURE `sp_select_respeciales_est`(
	IN `PYear` YEAR,
	IN `PEnrollment` INT(30)
)
BEGIN
	SELECT RIGHT(CONCAT('000000',tr.nro_acta),6) acta,tm.id id_matric,tm.year año,aux.id_area cod_area,tr.notafinal,
	 tr.notarecuperada,tr.fecha,tas.abrev, RTRIM(tar.area) area,
	 CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS nombres
	 FROM respeciales AS tr
	 JOIN cursos AS tc ON tr.id_curso = tc.id
	 JOIN asignaturas AS tas ON tc.id_asig = tas.id_pk
	 JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk  AND aux.year =  PYear)
	 JOIN areas AS tar ON aux.id_area = tar.id
	 JOIN student_enrollment AS tm ON tr.id_matric = tm.id
	 JOIN inscripciones AS ti ON tm.id_student = ti.id
	 WHERE tm.year = PYear AND tm.id = PEnrollment
	 AND tc.year = PYear AND tar.estado = 1 AND tas.estado = 1
	 ORDER BY tr.nro_acta,tm.id_grade,tm.id_group,nombres,aux.id_area,tc.id_asig,tm.year;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_sabanas
DROP PROCEDURE IF EXISTS `sp_select_sabanas`;
DELIMITER //
CREATE PROCEDURE `sp_select_sabanas`(
	IN `PYear` YEAR,
	IN `PHeadq` INT(30),
	IN `PStudyDay` INT(1),
	IN `PGrade` INT(11),
	IN `PGroup` VARCHAR(2)
)
BEGIN
	SELECT ta.*,tm.id_grade, tg.cod_grado,tm.id id_matric,tm.id_group grupo,tm.year,tm.id_headquarters,
	RIGHT(CONCAT('0000',tm.folio),4) id_folio, RIGHT(CONCAT('000000',tm.registration_number),6) AS id_matricula,
	CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) nombres,
	RTRIM(tg.grado) grado, RTRIM(tj.jornada) jornada, RTRIM(ts.headquarters_name) sede, tac.msg
	FROM sabanas AS ta
	JOIN student_enrollment 	AS tm ON ta.id_matric 	= tm.id
	JOIN inscripciones 		AS ti ON tm.id_student 	= ti.id
	JOIN grados 					AS tg ON tm.id_grade 	= tg.id
	JOIN jornadas 				AS tj ON tm.id_study_day 	= tj.cod_jorn
	JOIN sedes 					AS ts ON tm.id_headquarters= ts.ID
	JOIN acta_promocion 		AS tac ON tac.id_matric 	= tm.id
	WHERE tm.id_grade = PGrade  AND tm.id_headquarters = PHeadq AND tm.year = PYear AND
	tm.id_study_day = PStudyDay AND tm.id_group = PGroup AND tm.id_state = 2
	ORDER BY nombres;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_school_carnets
DROP PROCEDURE IF EXISTS `sp_select_school_carnets`;
DELIMITER //
CREATE PROCEDURE `sp_select_school_carnets`(
	IN `PYear` YEAR,
	IN `PId` BIGINT
)
BEGIN
	DECLARE _WR VARCHAR(250) DEFAULT '';
	IF PId > 0 THEN
		SET _WR	= CONCAT(" AND a.id_docente = ",PId," ");
	END IF;
	SET @sqlselect = CONCAT("SELECT a.documento,
     CONCAT(TRIM(a.nombre1),' ',TRIM(a.nombre2),' ',TRIM(a.apellido1),' ',TRIM(a.apellido2)) docente,
     a.tipo_sangre, if(LENGTH(a.image) > 15, a.image, 'assets/img/avatars/unknown_carnets.png') image , a.movil, a.email,
     CAST(b.year AS CHAR) year, c.abrev, d.url, d.name, d.school, d.info, d.header , d.qr, r.logo AS school_img
     FROM docentes a
     JOIN aux_docentes AS b ON b.id_docente = a.id_docente
     JOIN documentos AS c ON a.id_documento = c.id
     JOIN carnets AS d ON d.active = 1
     JOIN encabezado_reportes AS r ON r.id > 0
     WHERE b.year = ",PYear," AND a.estado = 1",_WR," ORDER BY docente");
	PREPARE smtp FROM @sqlselect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_students_card
DROP PROCEDURE IF EXISTS `sp_select_students_card`;
DELIMITER //
CREATE PROCEDURE `sp_select_students_card`(
	IN `_year` SMALLINT,
	IN `_headq` INT(30),
	IN `_grade` INT(11),
	IN `_group` VARCHAR(2),
	IN `_study_day` INT(1),
	IN `PEnroll` BIGINT
)
BEGIN
	SET @enroll	= '';
	IF PEnroll > 0 THEN
		SET @enroll	= CONCAT(" AND tm.id=", PEnroll);
	END IF;
	SELECT tm.id_student, ti.nro_documento nro_doc_id,
	CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) nombres,
	tg.cod_grado, tm.id_group grupo, tm.id_study_day id_jorn,
	RIGHT(CONCAT('000000',tm.registration_number),6) nro_matricula,
	tm.id id_matric, RTRIM(tg.grado) grado, RTRIM(ts.headquarters_name) sede,
	RTRIM(tj.JORNADA) jornada, td.abrev tdocumento
	FROM inscripciones AS ti
	JOIN student_enrollment AS tm ON tm.id_student = ti.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN documentos AS td ON ti.id_documento = td.id
	WHERE tm.year = _year AND tm.id_group =_group AND tm.id_study_day = _study_day AND
	tm.id_headquarters = _headq AND tm.id_state = 2 AND
	tm.id_grade = _grade ORDER BY nombres;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_students_evaluations
DROP PROCEDURE IF EXISTS `sp_select_students_evaluations`;
DELIMITER //
CREATE PROCEDURE `sp_select_students_evaluations`(
	IN `PEnrollment` INT(30)
)
BEGIN
	SELECT i.id, i.eread, i.enrollment_id, te.teacher_id, te.nombre, te.descripcion, te.num_preguntas, te.esquema,
	te.intentos, te.tiempo, te.paginas, te.hora_apertura, te.hora_cierre, te.fecha_cierre,
	te.fecha, te.estado, te.publicada, te.auto_calificar, te.periodo, te.year,
	h.course_id, h.evaluation_id, a.grupo,
	b.asignatura, c.grado, trim(d.jornada) AS jornada, trim(e.headquarters_name) sede,
	CONCAT(TRIM(g.apellido1),' ',TRIM(g.apellido2),' ',TRIM(g.nombre1),' ',TRIM(g.nombre2)) estudiante,
	h.evaluation_id, a.year, f.id_grade,
	CONCAT(TRIM(j.apellido1),' ',TRIM(j.apellido2),' ',TRIM(j.nombre1),' ',TRIM(j.nombre2)) docente
	FROM te_evaluations AS te
	JOIN te_evaluation_courses AS h ON h.evaluation_id = te.id
	JOIN cursos AS a ON h.course_id = a.id
	JOIN asignaturas AS b ON a.id_asig = b.id_pk
	JOIN grados AS c ON a.id_grado = c.id
	JOIN jornadas AS d ON a.id_jorn = d.cod_jorn
	JOIN sedes AS e ON a.id_sede = e.ID
	JOIN student_enrollment AS f  ON (f.id_headquarters = a.id_sede AND f.id_study_day = a.id_jorn AND
	f.id_grade = a.id_grado AND f.id_group = a.grupo AND f.year = a.year)
	JOIN inscripciones AS g ON f.id_student = g.id
	JOIN te_shared_evaluation AS i ON (i.evaluation_id = h.id AND i.enrollment_id = f.id)
	JOIN docentes AS j ON te.teacher_id = j.id_docente
	WHERE i.enrollment_id = PEnrollment AND i.evaluation_id = h.id AND i.enrollment_id = f.id AND
	te.publicada = 1
	ORDER BY te.periodo;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_students_with_observer
DROP PROCEDURE IF EXISTS `sp_select_students_with_observer`;
DELIMITER //
CREATE PROCEDURE `sp_select_students_with_observer`(
	IN `PYear` YEAR
)
    COMMENT 'Muestra la lista de todos los estudiantes con ficha de observación llena'
BEGIN
	SELECT tm.*, CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',
	RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS nombres,
	RTRIM(tg.grado) AS grado, RTRIM(ts.headquarters_name) AS sede, ti.foto, ti.mime,
	RTRIM(tj.jornada) AS jornada, RTRIM(tes.name_state) estado_mat
	FROM student_enrollment AS tm
	JOIN inscripciones AS ti ON tm.id_student = ti.id
	JOIN grados AS tg ON tm.id_grade = tg.id
	JOIN sedes AS ts ON tm.id_headquarters = ts.ID
	JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
	JOIN registration_status AS tes ON tm.id_state = tes.id
	WHERE tm.year = PYear AND tm.id_state > 1 AND EXISTS (
		SELECT * FROM obs_observador_mod_3 AS bb WHERE bb.id_matric = tm.id
	);
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_sugerencias_estudiante
DROP PROCEDURE IF EXISTS `sp_select_sugerencias_estudiante`;
DELIMITER //
CREATE PROCEDURE `sp_select_sugerencias_estudiante`(
	IN `_year` YEAR,
	IN `_periodo` VARCHAR(2),
	IN `_id_nota` INT(30),
	IN `_grade` INT(11)
)
BEGIN
	DECLARE cTable, cTable2	VARCHAR(30) DEFAULT '';
	SELECT fn_return_table_notas(_grade) INTO cTable;
	SELECT fn_return_table_sug(_grade) INTO cTable2;
	SET @sqlSelect = CONCAT("SELECT ts.id,RTRIM(ts.sugerencia) AS sugerencia,ts.tipo
		FROM sugerencias AS ts
		JOIN ",cTable2," AS tg ON tg.id_sugerencia = ts.id
		JOIN ",cTable," AS tn ON tg.id_nota = tn.id
		WHERE ts.year = ",_year," AND
		ts.periodo = '",_periodo,"' AND tg.id_nota = ",_id_nota,"
		ORDER BY ts.tipo, ts.sugerencia");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_sugerencias_estudiante_all
DROP PROCEDURE IF EXISTS `sp_select_sugerencias_estudiante_all`;
DELIMITER //
CREATE PROCEDURE `sp_select_sugerencias_estudiante_all`(
	IN `PTeacher` INT(30),
	IN `PYear` YEAR,
	IN `PGrade` INT(11),
	IN `PPeriod` VARCHAR(2),
	IN `PGroup` VARCHAR(2),
	IN `PHeadq` INT(30),
	IN `PDay` INT(2),
	IN `PSubjet` INT(11)
)
BEGIN
	SELECT fn_return_table_sug(PGrade) INTO @stable;
	SELECT fn_return_table_notas(PGrade) INTO @stable2;
	SET @sqlSelect = CONCAT("SELECT ts.*, tg.*, tn.id_matric,
		concat(rtrim(ti.apellido1),' ',rtrim(ti.apellido2),' ',rtrim(ti.nombre1),' ',rtrim(ti.nombre2))
		AS nombres FROM sugerencias AS ts
		JOIN ",@stable," AS tg ON tg.id_sugerencia = ts.id
		JOIN ",@stable2," AS tn ON tg.id_nota = tn.id
	   JOIN student_enrollment AS tm ON tn.id_matric = tm.id
		JOIN inscripciones AS ti on tm.id_student = ti.id
		WHERE ts.id_docente=",PTeacher," AND ts.year=",PYear," AND ts.periodo = '",PPeriod,
		"'  AND tm.id_grade = ",PGrade," AND tm.id_group = '",PGroup,"' AND tm.id_headquarters = ",PHeadq,
		" AND tm.id_study_day = ",PDay," AND tm.year = ",PYear,"
		ORDER BY nombres, ts.periodo, ts.tipo");
	PREPARE smtp FROM @sqlSelect;
	EXECUTE smtp;
	DEALLOCATE PREPARE smtp;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_select_unidades
DROP PROCEDURE IF EXISTS `sp_select_unidades`;
DELIMITER //
CREATE PROCEDURE `sp_select_unidades`(IN `_id_parcelador` INT(20))
BEGIN
	SELECT * FROM parcelador_unidades
	WHERE id_parcelador=_id_parcelador AND estado=1;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_set_folio_matriculas
DROP PROCEDURE IF EXISTS `sp_set_folio_matriculas`;
DELIMITER //
CREATE PROCEDURE `sp_set_folio_matriculas`(IN `_id_inst` INT(20), IN `_año` YEAR)
BEGIN
	DECLARE 	done,
				_cant_est_x_libro,
				_count_libro,
				_count_folio,
				_cant_mat,
				_id_matric,
				_n_libro INT DEFAULT 0;
	DECLARE 	_total_libros DECIMAL (6,2) DEFAULT 0;
	DECLARE cur_mat CURSOR FOR SELECT id_matric FROM matriculas WHERE año = `_año` AND id_inst = _id_inst ORDER BY id_matric;
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	SELECT cant_est_x_libro INTO _cant_est_x_libro FROM config001 WHERE año = `_año` AND id_inst = _id_inst;
	SET _n_libro = 1;
	OPEN cur_mat;
	REPEAT
		FETCH cur_mat INTO _id_matric;
		IF NOT done THEN
			SET _count_libro = _count_libro + 1;
			SET _count_folio = _count_folio + 1;
			UPDATE matriculas SET nro_matricula = _count_folio, id_folio = _count_folio, libro_mat = _n_libro
			WHERE id_matric = _id_matric;
			IF _count_libro = _cant_est_x_libro THEN
				SET _count_libro = 0;
				SET _n_libro = _n_libro +1;
			END IF;
		END IF;
	UNTIL done END REPEAT;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_set_notas_resp_normal
DROP PROCEDURE IF EXISTS `sp_set_notas_resp_normal`;
DELIMITER //
CREATE PROCEDURE `sp_set_notas_resp_normal`(IN `_id_inst` INT(20), IN `_id_sede` INT(20), IN `_id_docente` INT(20), IN `_cod_grado` VARCHAR(2), IN `_grupo` VARCHAR(2), IN `_id_asig` INT(3), IN `_año` YEAR, IN `_x_nro_acta` INT(6))
BEGIN
	DECLARE 	done,
				_id_matric,
				_promocion INT DEFAULT 0;
	DECLARE _c_grado VARCHAR(2) DEFAULT '';

	DECLARE	cur_mat CURSOR FOR SELECT tm.id_matric,tm.cod_grado FROM matriculas AS tm WHERE tm.cod_grado = _cod_grado AND
					tm.grupo = _grupo AND tm.`año` = `_año` AND tm.id_inst = _id_inst AND tm.estado = 2;
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	SELECT promocion INTO _promocion FROM config001 AS cg WHERE cg.`AÑO` = `_año` AND cg.id_inst = _id_inst;

	OPEN cur_mat;
	REPEAT
		FETCH cur_mat INTO _id_matric, _c_grado;
		IF NOT done THEN
			SET done = 1;
		END IF;
	UNTIL done END REPEAT;
	CLOSE cur_mat;

END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_students_activities
DROP PROCEDURE IF EXISTS `sp_students_activities`;
DELIMITER //
CREATE PROCEDURE `sp_students_activities`(
	IN `PEnrollment` BIGINT
)
    COMMENT 'Retorna las actividades asignadas a un estudiante'
BEGIN
	SELECT j.id, a.teacher_id, a.nombre, a.descripcion, a.url_video, a.url_archivo, a.mime, a.url_enlace,
	a.estado, a.calificable, a.fecha, a.hora, a.fecha_cierre, a.hora_cierre, a.year,
	CONCAT(TRIM(b.apellido1),' ',TRIM(b.apellido2),' ',TRIM(b.nombre1),' ',TRIM(b.nombre2)) AS docente,
	c.course_id, c.activity_id, e.grupo, f.grado, trim(g.jornada) jornada, h.asignatura,
	TRIM(i.headquarters_name) AS sede, b.image, j.enrollment_id, j.leido
	FROM ta_online_activities a
	JOIN docentes AS b ON a.teacher_id = b.id_docente
	JOIN ta_courses_online_activities AS c ON c.activity_id = a.id
	JOIN cursos AS e ON c.course_id = e.id
	JOIN grados AS f ON e.id_grado = f.id
	JOIN jornadas AS g ON e.id_jorn = g.cod_jorn
	JOIN asignaturas AS h ON e.id_asig = h.id_pk
	JOIN sedes AS i ON e.id_sede = i.ID
	JOIN ta_shared_online_activities AS j ON j.activity_id = c.id
	WHERE j.enrollment_id = PEnrollment;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_students_live_classes
DROP PROCEDURE IF EXISTS `sp_students_live_classes`;
DELIMITER //
CREATE PROCEDURE `sp_students_live_classes`(
	IN `PEnrollment` BIGINT
)
BEGIN
	SELECT j.id, j.class_id, j.enrollment_id, j.isit_read, j.reading_time, j.transmitting,
	DATE_FORMAT(j.transmission_start_time,'%d-%m-%Y %h:%i %p') AS transmission_start_time,
	DATE_FORMAT(j.transmission_closing_time,'%d-%m-%Y %h:%i %p') AS transmission_closing_time,
	a.teacher_id, a.class_name, a.class_description, a.url_file, a.active AS active_class,
	a.transmitting AS transmiting_class, a.closing_date, a.closing_time, a.class_time,
	DATE_FORMAT(a.transmission_start_time,'%d-%m-%Y %h:%i %p') AS transmission_start_time_class,
	DATE_FORMAT(a.transmission_closing_time,'%d-%m-%Y %h:%i %p') AS transmission_closing_time_class,
	c.course_id,
	CONCAT(TRIM(b.apellido1),' ',TRIM(b.apellido2),' ',TRIM(b.nombre1),' ',TRIM(b.nombre2)) AS docente,
	e.grupo, f.grado, trim(g.jornada) jornada, h.asignatura,
	TRIM(i.headquarters_name) AS sede, b.image
	FROM tl_live_classes a
	JOIN docentes AS b ON a.teacher_id = b.id_docente
	JOIN tl_course_live_classes AS c ON c.class_id = a.id
	JOIN cursos AS e ON c.course_id = e.id
	JOIN grados AS f ON e.id_grado = f.id
	JOIN jornadas AS g ON e.id_jorn = g.cod_jorn
	JOIN asignaturas AS h ON e.id_asig = h.id_pk
	JOIN sedes AS i ON e.id_sede = i.ID
	JOIN tl_students_live_classes AS j ON j.class_id = c.id
	WHERE j.enrollment_id = PEnrollment;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_update_areasf
DROP PROCEDURE IF EXISTS `sp_update_areasf`;
DELIMITER //
CREATE PROCEDURE `sp_update_areasf`(IN `_id_matric` INT(20), IN `_final` DECIMAL(6,2), IN `_recuperacion` DECIMAL(6,2), IN `_periodo` VARCHAR(1))
BEGIN
	DECLARE n_matric, _año, _id_inst INT DEFAULT 0;
	DECLARE done, _t_año_lectivo INT DEFAULT 0;
	DECLARE _cod_grado CHAR(2) DEFAULT '';
	DECLARE _prom, _prom_rec DECIMAL(6,2) DEFAULT 0;
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	SELECT COUNT(*) INTO n_matric FROM acta_promocion WHERE id_matric = _id_matric;
	SELECT año, id_inst,cod_grado INTO _año, _id_inst,_cod_grado FROM matriculas WHERE id_matric = _id_matric;
	SELECT t_año_lectivo INTO _t_año_lectivo FROM config001 WHERE id_inst=_id_inst AND año=_año;

	IF n_matric	= 0 THEN
		INSERT INTO acta_promocion (id_matric,promedio,promedio_rec)
		VALUES(_id_matric,_final,IF(_final > _recuperacion,_final,_recuperacion));
	ELSE
		SELECT ROUND(AVG(final),2), ROUND(AVG(IF(final > recuperacion,final,recuperacion)),2)  INTO _prom, _prom_rec
		FROM areasf WHERE id_matric=_id_matric GROUP BY id_matric;
		UPDATE acta_promocion SET promedio = _prom,promedio_rec = _prom_rec WHERE id_matric = _id_matric;
	END IF;
	IF _t_año_lectivo = 1 THEN
		/* Año lectivo por areas */
		 IF _cod_grado BETWEEN '21' AND '26' THEN
		 	CALL sp_libro_final_areas_ciclos(_id_matric, _año, _id_inst,_periodo);
		 ELSE
		 	CALL sp_libro_final_areas(_id_matric, _año, _id_inst);
		 END IF;
	ELSE
		/* Año Lectivo por asignaturas*/
		 IF _cod_grado BETWEEN '21' AND '26' THEN
		 	CALL sp_libro_final_asignaturas_ciclos(_id_matric, _año, _id_inst,_periodo);
		 ELSE
		 	CALL sp_libro_final_asignaturas(_id_matric, _año, _id_inst);
		 END IF;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_update_areasf_notas
DROP PROCEDURE IF EXISTS `sp_update_areasf_notas`;
DELIMITER //
CREATE PROCEDURE `sp_update_areasf_notas`(IN `_id_matric` INT(20), IN `_periodo` VARCHAR(1), IN `_id_asig` INT(3), IN `_nota_final` DECIMAL(6,2), IN `_prom` DECIMAL(6,2), IN `_faltas` INT, IN `_injustificadas` INT, IN `_retraso` INT)
BEGIN
	DECLARE 	_promocion,
				_año,
				_id_inst,
				_id_sede,
				_id_jorn,
				_count INT DEFAULT 0;
	DECLARE 	_cod_grado,
				_grupo VARCHAR(2) DEFAULT '';

	SELECT cod_grado,grupo,año,id_sede,id_inst,id_jorn
	INTO _cod_grado,_grupo,_año,_id_sede,_id_inst,_id_jorn
	FROM matriculas WHERE id_matric = _id_matric;

	SELECT promocion INTO _promocion FROM config001 WHERE año=`_año` AND id_inst = `_id_inst`;
	SELECT COUNT(id_matric) INTO _count FROM areasf WHERE id_asig = _id_asig AND id_matric = _id_matric;

	CASE  _promocion
		WHEN 1  THEN /*Promoción por promedios*/
			IF NOT _count THEN /*Si no existe el registro*/
				CASE _periodo
					WHEN '1' THEN
						 INSERT INTO areasf (id_asig,id_matric,periodo,p1,final,faltas,injustificadas,retraso)
						 VALUES (_id_asig,_id_matric,1,_nota_final,_prom,_faltas,_injustificadas,_retraso);
					WHEN '2' THEN
						 INSERT INTO areasf (id_asig,id_matric,periodo,p2,final,faltas,injustificadas,retraso)
						 VALUES (_id_asig,_id_matric,2,_nota_final,_prom,_faltas,_injustificadas,_retraso);
					WHEN '3' THEN
						 INSERT INTO areasf (id_asig,id_matric,periodo,p3,final,faltas,injustificadas,retraso)
						 VALUES (_id_asig,_id_matric,3,_nota_final,_prom,_faltas,_injustificadas,_retraso);
					WHEN '4' THEN
						 INSERT INTO areasf (id_asig,id_matric,periodo,p4,final,faltas,injustificadas,retraso)
						 VALUES (_id_asig,_id_matric,4,_nota_final,_prom,_faltas,_injustificadas,_retraso);
					ELSE
						INSERT INTO areasf (id_asig,id_matric,periodo,final,faltas,injustificadas,retraso)
						VALUES (_id_asig,_id_matric,_periodo,_prom,_faltas,_injustificadas,_retraso);
				END CASE;
			ELSE
				CASE _periodo
					WHEN '1' THEN
						  UPDATE areasf SET periodo=1,p1=_nota_final,final=_prom,faltas=_faltas,
						  injustificadas=_injustificadas,retraso=_retraso
						  WHERE id_matric = _id_matric AND id_asig = _id_asig;
					WHEN '2' THEN
						 UPDATE areasf SET periodo=2,p2=_nota_final,final=_prom,faltas=_faltas,
						  injustificadas=_injustificadas,retraso=_retraso
						  WHERE id_matric = _id_matric AND id_asig = _id_asig;
					WHEN '3' THEN
						 UPDATE areasf SET periodo=3,p3=_nota_final,final=_prom,faltas=_faltas,
						  injustificadas=_injustificadas,retraso=_retraso
						  WHERE id_matric = _id_matric AND id_asig = _id_asig;
					WHEN '4' THEN
						UPDATE areasf SET periodo=4,p4=_nota_final,final=_prom,faltas=_faltas,
						  injustificadas=_injustificadas,retraso=_retraso
						  WHERE id_matric = _id_matric AND id_asig = _id_asig;
					ELSE
						UPDATE areasf SET periodo=_periodo,final=_prom,faltas=_faltas,
						  injustificadas=_injustificadas,retraso=_retraso
						  WHERE id_matric = _id_matric AND id_asig = _id_asig;
				END CASE;
			END IF;
	END CASE;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_update_id_matric_respeciales
DROP PROCEDURE IF EXISTS `sp_update_id_matric_respeciales`;
DELIMITER //
CREATE PROCEDURE `sp_update_id_matric_respeciales`()
BEGIN
	DECLARE done,_año,_cod_est INT DEFAULT 0;
	DECLARE cur_respeciales CURSOR FOR SELECT cod_est,año FROM respeciales GROUP BY cod_est,año ORDER BY cod_est, año;
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

	OPEN cur_respeciales;

	REPEAT
		FETCH cur_respeciales INTO _cod_est, _año;
		IF NOT done THEN
			UPDATE respeciales SET id_matric = (SELECT id_matric FROM matriculas WHERE cod_est=_cod_est AND año=_año)
			WHERE cod_est=_cod_est AND año=_año;
		END IF;
	UNTIL done END REPEAT;
 CLOSE cur_respeciales;
END//
DELIMITER ;

-- Volcando estructura para procedimiento asaie_exodo.sp_update_mayus
DROP PROCEDURE IF EXISTS `sp_update_mayus`;
DELIMITER //
CREATE PROCEDURE `sp_update_mayus`(
	IN `_year` YEAR,
	IN `_per` VARCHAR(1)
)
BEGIN
	UPDATE logros_estandares SET descripcion = UPPER(RTRIM(descripcion))
	WHERE periodo = _per AND year = _year;
END//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
