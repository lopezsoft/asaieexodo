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

-- Volcando estructura para función asaie_exodo.estado_estudiante_normal
DROP FUNCTION IF EXISTS `estado_estudiante_normal`;
DELIMITER //
CREATE FUNCTION `estado_estudiante_normal`(
	`Pid` INT(2),
	`PGrade` INT(11)
) RETURNS varchar(250) CHARSET utf8
    READS SQL DATA
BEGIN
	SET @returnGrade = PGrade + 1;

	SELECT RTRIM(t.descripcion_estado), t.prom_manual, t1.fin_ciclo_escolar
	INTO @estado, @prom, @fin
	FROM estado_estudiante t
	JOIN grados_agrupados AS t1 ON t.id_grupo_grados = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE t.id = Pid AND t2.id_grado = PGrade;

	IF @prom = 1 THEN /* Promoción manual */
		SET @result = @estado;
	ELSEIF @fin = 1 THEN /* Fin de ciclo escolar */
		SELECT RTRIM(grado) INTO @gradeName FROM grados WHERE id = PGrade;
		SET @result = CONCAT(@estado);
	ELSE
		SELECT RTRIM(grado) INTO @gradeName FROM grados WHERE id = @returnGrade;
		SET @result = CONCAT(@estado,' ',@gradeName);
	END IF;

	RETURN UPPER(@result);
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_asignaturas_perdidas
DROP FUNCTION IF EXISTS `fn_asignaturas_perdidas`;
DELIMITER //
CREATE FUNCTION `fn_asignaturas_perdidas`(
	`PEnrollment` INT(30),
	`PYear` YEAR,
	`PGrade` INT(11)
) RETURNS text CHARSET utf8
    READS SQL DATA
BEGIN
 	DECLARE result, _as TEXT DEFAULT '';
	DECLARE x, x_ar, x_c INT(30) DEFAULT 0;
  	DECLARE done INT DEFAULT 0;
  	DECLARE _desde, _hasta DECIMAL(6,2) DEFAULT 0;
 	DECLARE cur_ar CURSOR FOR SELECT SQL_SMALL_RESULT tc.id_asig, TRIM(ta.asignatura), aux.id_area
	   FROM areasf t
	   JOIN cursos AS tc ON t.id_curso = tc.id
		JOIN asignaturas AS ta ON tc.id_asig =ta.id_pk
		JOIN aux_asignaturas AS aux ON (aux.id_asign = ta.id_pk AND aux.year = PYear )
		JOIN student_enrollment AS tm ON t.id_matric = tm.id
		JOIN respeciales AS tr  ON (tr.id_matric = tm.id AND tr.id_curso = t.id_curso)
		WHERE t.final BETWEEN _desde AND _hasta AND
		t.id_matric = PEnrollment AND tc.year = PYear AND tc.id_grado = PGrade
		AND tm.year = PYear AND ta.estado = 1 AND tm.id_state = 2
		AND IF(ISNULL(tr.notarecuperada), t.final <= _hasta, tr.notarecuperada <= _hasta);
 	DECLARE CONTINUE HANDLER FOR SQLSTATE	 '02000' SET done	= 1;

 SELECT t.desde, t.hasta INTO _desde, _hasta
 FROM `desempeños` t
 JOIN grados_agrupados AS t1 ON t.id_grado_agrupado = t1.id
 JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
 WHERE t.reprueba = 1 AND t.year = PYear AND t2.id_grado = PGrade LIMIT 1;

 OPEN cur_ar;

 REPEAT
 	FETCH cur_ar INTO x, _as, x_ar;
 	IF NOT done THEN
 		SET x_c = 0;
 		SELECT cod_area INTO x_c FROM tmpTableAreasf WHERE cod_area = x_ar AND final BETWEEN _desde AND _hasta LIMIT 1;
 		SET done = 0;
 		IF x_c > 0 THEN
 			SET result = CONCAT(result,_as,', ');
 		END IF;
 	END IF;
 UNTIL done END REPEAT;

 CLOSE cur_ar;

RETURN LEFT(result,LENGTH(result)-2);
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_cert_final_estudio
DROP FUNCTION IF EXISTS `fn_cert_final_estudio`;
DELIMITER //
CREATE FUNCTION `fn_cert_final_estudio`(
	`PYear` YEAR,
	`PEnrollment` INT(30),
	`PModel` INT
) RETURNS text CHARSET utf8
    NO SQL
BEGIN
	DECLARE result, lEstado, _prom TEXT DEFAULT '';
	DECLARE _estudiante, _sexo, _documento, _tipo_documento, _estado_est,
		_jornada, _sede, _principal, _tipo_estab,lIdent, lLugar, _grado,
		_nivel,c_id_folio, c_libro_mat,_nivel2,c_grado VARCHAR (250) DEFAULT '';
	DECLARE _dpto_lug_exp, _mun_lug_exp, _estado,_id_folio, _libro_mat, _cod_grado,
	_nro_matricula, _niv INT DEFAULT 0;

	SET _tipo_estab = "INSTITUCIÓN";
	IF PYear > YEAR(CURDATE()) THEN
		SET result = 'Las fechas no coinciden, verifique por favor';
	ELSE
		SELECT CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) estudiante,
		tx.abrev_sexo sexo, ti.nro_documento documento, RTRIM(tdoc.tipo) tipo_documento, ct.id_dept AS dpto_lug_exp,
		ti.lug_expedicion AS mun_lug_exp, RTRIM(te.name_state) estado_est, RTRIM(tg.grado) grado, RTRIM(tj.JORNADA) jornada,
		RTRIM(ts.headquarters_name) sede, IF (ts.is_main = 'SI', 'PRINCIPAL', ts.headquarters_name) principal,
		tm.id_state id_estado, tm.id_grade AS id_grado, tm.folio AS id_folio, tm.book AS libro_mat,
		tm.registration_number AS nro_matricula INTO _estudiante, _sexo, _documento, _tipo_documento, _dpto_lug_exp,
		_mun_lug_exp, _estado_est, _grado, _jornada, _sede, _principal, _estado, _cod_grado,_id_folio, _libro_mat,
		_nro_matricula FROM inscripciones AS ti
		JOIN sexo AS tx ON ti.id_sexo = tx.id
		JOIN cities AS ct ON ti.lug_expedicion = ct.id
		JOIN student_enrollment AS tm ON tm.id_student = ti.id
		JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		JOIN documentos AS tdoc ON ti.id_documento = tdoc.id
		JOIN registration_status AS te ON tm.id_state = te.id
		JOIN grados AS tg ON tm.id_grade = tg.id
		JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
		JOIN school AS t ON ti.id > 0
		WHERE tm.year = PYear AND tm.id = PEnrollment AND tm.id_state > 1 LIMIT 1;

		IF _sexo = 'M' THEN
			SET lIdent = 'identificado con';
			SET lEstado = 'matriculado';
		ELSE
			SET lIdent = 'identificada con';
			SET lEstado = 'matriculada';
		END IF;
		SET c_grado = _cod_grado;
		SELECT tg.id_nivel INTO _niv FROM grados AS tg WHERE tg.id = _cod_grado LIMIT 1;
		SELECT fn_lugar_exp(_mun_lug_exp, 1) INTO lLugar;
		SELECT fn_niveles_ens(_cod_grado) INTO _nivel2;
		IF _niv > 1 THEN
			SELECT fn_GetEstadoFinalEst(PEnrollment, 1) INTO _prom;
		ELSE
			SELECT estado_estudiante_normal(1, _cod_grado) INTO _prom;
		END IF;
		SELECT fn_GetOriginalGrado(_cod_grado) INTO _cod_grado;
		SELECT fn_niveles_ens(_cod_grado) INTO _nivel;
		CASE
			WHEN PModel = 1 THEN
				SET c_libro_mat = RIGHT(CONCAT('0000',_libro_mat),4);
				SET c_id_folio  = RIGHT(CONCAT('0000',_id_folio),4);
				IF _niv > 1 THEN
					SET lEstado = CONCAT(', durante el año lectivo de ',PYear,', cursó el grado ',_grado,
					' y ',_prom,' de ',_nivel);
				ELSE
					SET lEstado = CONCAT(', durante el año lectivo de ',PYear,', cursó y aprobó el grado ',_grado,
					' de ',_nivel2);
				END IF;
				SET result =CONCAT('Que: ',_estudiante,', ',lIdent,' ',_tipo_documento,' Nº. ',_documento,' de ',
									    lLugar,lEstado,'.',' MATRICULA Nº. ',c_id_folio,' Y FOLIO Nº. ',c_id_folio,'. ');
			WHEN PModel = 2 THEN
				IF _sexo = 'M' THEN
					SET lEstado = 'registrado en el Libro de Matriculas de esta(e) ';
				ELSE
					SET lEstado = 'registrada en el Libro de Matriculas de esta(e) ';
				END IF;

				SET c_libro_mat = RIGHT(CONCAT('0000',_libro_mat),4);
				SET c_id_folio  = RIGHT(CONCAT('0000',_id_folio),4);
				IF _niv > 1 THEN
					SET lEstado = CONCAT(', durante el año lectivo de ',PYear,' estuvo ',lEstado,_tipo_estab,
							' según registro ',c_libro_mat,' Folio ',c_id_folio,
							' cursando el Grado ',_grado,' Nivel de ',_nivel2,' y ',_prom,' de ',_nivel);
				ELSE
					SET lEstado = CONCAT(', durante el año lectivo de ',PYear,' estuvo ',lEstado,_tipo_estab,
							' según registro ',c_libro_mat,' Folio ',c_id_folio,
							' cursando el Grado ',_grado,' Nivel de ',_nivel2,' y FUE PROMOVIDO AL SIGUIENTE GRADO');
				END IF;
				SET result = CONCAT('Que ',_estudiante,' ',lIdent,' ',_tipo_documento,' Número ',_documento,' de ',
									    lLugar,lEstado,'. ');
			ELSE
				SET result = 'Error interno del sistema';
		END CASE;
	END IF;
	RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_cons_estudio
DROP FUNCTION IF EXISTS `fn_cons_estudio`;
DELIMITER //
CREATE FUNCTION `fn_cons_estudio`(
	`_year` YEAR,
	`_enrrol` INT(30),
	`_modelo` INT(1)
) RETURNS text CHARSET utf8
    NO SQL
BEGIN
DECLARE result, lEstado TEXT DEFAULT '';
DECLARE _estudiante, _sexo, _documento, _tipo_documento, _estado_est,
		_grado, _jornada, _sede, _principal, _tipo_estab,lIdent, lLugar,
		_nivel,c_id_folio, c_libro_mat VARCHAR (250) DEFAULT '';
DECLARE _dpto_lug_exp, _mun_lug_exp, _estado,_id_folio, _libro_mat, _nro_matricula, _cod_grado INT(30);
	IF _year > YEAR(CURDATE()) THEN
		SET result = 'Las fechas no coinciden, verifique por favor';
	ELSE
		SELECT CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) estudiante,
		ti.id_sexo, ti.nro_documento documento, RTRIM(tdoc.tipo) tipo_documento, ti.lug_expedicion, RTRIM(te.name_state)
		estado_est, RTRIM(tg.grado) grado, RTRIM(tj.jornada) jornada, RTRIM(ts.headquarters_name) sede,
		IF (ts.is_main = 'SI', 'PRINCIPAL', ts.headquarters_name) principal,
		CONCAT('esta Institución educativa') as tipo_estab,
		tm.id_state, tm.id_grade,
		tm.folio, tm.book, tm.registration_number, tn.nombre_nivel
		INTO _estudiante, _sexo, _documento, _tipo_documento, _mun_lug_exp, _estado_est,
		_grado, _jornada, _sede, _principal, _tipo_estab, _estado, _cod_grado,_id_folio, _libro_mat,
		_nro_matricula, _nivel
		FROM inscripciones AS ti
		JOIN student_enrollment AS tm ON tm.id_student = ti.id
		JOIN sedes AS ts ON tm.id_headquarters = ts.ID
		JOIN documentos AS tdoc ON ti.id_documento = tdoc.id
		JOIN registration_status AS te ON tm.id_state = te.id
		JOIN grados AS tg ON tm.id_grade = tg.id
		JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
		JOIN school AS t ON t.id > 0
		JOIN niveles_estudio AS tn ON tg.id_nivel = tn.id
		WHERE tm.year = _year AND tm.id = _enrrol AND tm.id_state > 1 LIMIT 1;

		IF _sexo = '1' THEN
			SET lIdent = 'identificado con';
			SET lEstado = 'matriculado';
		ELSE
			SET lIdent = 'identificada con';
			SET lEstado = 'matriculada';
		END IF;
		SELECT fn_lugar_exp(_mun_lug_exp, 1) INTO lLugar;
		CASE
			WHEN _modelo = 1 THEN
				IF _year < YEAR(CURDATE()) THEN
					SET lEstado = CONCAT(', estuvo ',lEstado,' en ',_tipo_estab,', cursando el grado ',
										_grado,' de ',_nivel,' jornada ',_jornada,', año lectivo ',_year,', en la sede ',_principal);
				ELSEIF _estado > 2 THEN
					SET lEstado = CONCAT(', estuvo ',lEstado,' en ',_tipo_estab,', cursando el grado ',
										_grado,' de ',_nivel,', jornada ',_jornada,', año lectivo ',_year,', en la sede ',_principal,
										'. Su estado actual es: ',_estado_est);
				ELSE
					SET lEstado = CONCAT(', se encuentra ',lEstado,' en ',_tipo_estab,', cursando el grado ',
										_grado,' de ',_nivel,', jornada ',_jornada,', año lectivo ',_year,', en la sede ',_principal);
				END IF;
				SET result = CONCAT('Que: ',_estudiante,', ',lIdent,' ',_tipo_documento,' Nº. ',_documento,' de ',
									    lLugar,lEstado,'.');
			WHEN _modelo = 2 THEN
				IF _sexo = 'M' THEN
					SET lEstado = 'registrado en el Libro de Matriculas de ';
				ELSE
					SET lEstado = 'registrada en el Libro de Matriculas de ';
				END IF;
				SET c_libro_mat = RIGHT(CONCAT('0000',_libro_mat),4);
				SET c_id_folio  = RIGHT(CONCAT('0000',_id_folio),4);
				IF _year < YEAR(CURDATE()) THEN
					SET lEstado = CONCAT(' Estuvo ',lEstado,_tipo_estab,' según registro ',c_libro_mat,' Folio ',c_id_folio,
										' como alumno (a) del Grado ',_grado,' Nivel de ',_nivel,' jornada ',_jornada,
										' para desarrollar todas las actividades curriculares programadas para el Año lectivo ',_year,
										' en la sede ',_principal);
				ELSEIF _estado > 2 THEN
					SET lEstado = CONCAT(' Estuvo ',lEstado,_tipo_estab,' según registro ',c_libro_mat,' Folio ',c_id_folio,
										' como alumno (a) del Grado ',_grado,' Nivel de ',_nivel,' jornada ',_jornada,
										' para desarrollar todas las actividades curriculares programadas para el Año lectivo ',_year,
										' en la sede ',_principal,
										'. Su estado actual es: ',_estado_est);
				ELSE
					SET lEstado = CONCAT(' Se encuentra ',lEstado,_tipo_estab,' según registro ',c_libro_mat,' Folio ',c_id_folio,
										' como alumno (a) del Grado ',_grado,' Nivel de ',_nivel,' jornada ',_jornada,
										' para desarrollar todas las actividades curriculares programadas para el Año lectivo ',_year,
										' en la sede ',_principal);
				END IF;
				SET result = CONCAT('Que ',_estudiante,' ',lIdent,_tipo_documento,' Número ',_documento,' de ',
									    lLugar,lEstado,'.');
			ELSE
				SET result = 'Error interno del sistema';
		END CASE;
	END IF;
	RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_Getdesempeño
DROP FUNCTION IF EXISTS `fn_Getdesempeño`;
DELIMITER //
CREATE FUNCTION `fn_Getdesempeño`(
	`PYear` YEAR,
	`PNota` DECIMAL(6,2),
	`PGrade` INT(11)
) RETURNS varchar(50) CHARSET utf8
    NO SQL
BEGIN
	SELECT RTRIM(es.nombre_escala) INTO @result
	FROM `desempeños` AS t
	JOIN escala_nacional AS es ON t.id_escala = es.id
	JOIN grados_agrupados AS t1 ON t.id_grado_agrupado = t1.id
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE t.year = PYear AND PNota BETWEEN t.desde AND
	t.hasta AND t2.id_grado = PGrade LIMIT 1;
	RETURN @result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_GetEstadoFinalEst
DROP FUNCTION IF EXISTS `fn_GetEstadoFinalEst`;
DELIMITER //
CREATE FUNCTION `fn_GetEstadoFinalEst`(
	`PEnrollment` INT(3),
	`PType` INT
) RETURNS text CHARSET utf8
    NO SQL
BEGIN
	DECLARE _result, _msg, _msg1, _msg2, _msg3 TEXT DEFAULT '';
	SELECT t.msg,t.msg1,t.msg2,t.msg3 INTO _msg, _msg1, _msg2, _msg3
	FROM acta_promocion t WHERE t.id_matric = PEnrollment LIMIT 1;
	CASE
		WHEN PType = 1 THEN
			SET _result = _msg;
		WHEN PType = 2 THEN
			SET _result = _msg1;
		WHEN PType = 3 THEN
			SET _result = _msg2;
		WHEN PType = 4 THEN
			SET _result = _msg3;
		ELSE
			SET _result = 'ERROR.';
	END CASE;
	RETURN _result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_GetOriginalGrado
DROP FUNCTION IF EXISTS `fn_GetOriginalGrado`;
DELIMITER //
CREATE FUNCTION `fn_GetOriginalGrado`(
	`PGrade` INT(11)
) RETURNS int(11)
    NO SQL
BEGIN
	SELECT t2.id_grado INTO @grade
	FROM grados_agrupados AS t1
	JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
	WHERE t2.id_grado = PGrade AND t1.fin_ciclo_escolar = 1;
	IF @grade THEN
		SET @result = @grade;
	ELSE
		SET @result = PGrade + 1;
	END IF;
	RETURN @result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_lugar_exp
DROP FUNCTION IF EXISTS `fn_lugar_exp`;
DELIMITER //
CREATE FUNCTION `fn_lugar_exp`(
	`PCity` INT,
	`PType` INT(1)
) RETURNS varchar(250) CHARSET utf8
    NO SQL
BEGIN
DECLARE _result, dpto, mun VARCHAR(250) DEFAULT '';
	IF PType = 1 THEN /* Nombre completo de departamento */
		SELECT UPPER(RTRIM(ct.name_city)) , UPPER(RTRIM(dp.name_departament)) INTO mun, dpto
		FROM cities AS ct
		JOIN departments AS dp ON ct.id_dept = dp.id
		WHERE ct.id = PCity LIMIT 1;
	ELSE
		SELECT UPPER(RTRIM(ct.name_city)) , UPPER(RTRIM(dp.abbreviation)) INTO mun, dpto
		FROM cities AS ct
		JOIN departments AS dp ON ct.id_dept = dp.id
		WHERE ct.id = PCity LIMIT 1;
	END IF;
	SET _result = CONCAT(mun,' ',dpto);
	RETURN _result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_niveles_ens
DROP FUNCTION IF EXISTS `fn_niveles_ens`;
DELIMITER //
CREATE FUNCTION `fn_niveles_ens`(
	`PGrade` INT(11)
) RETURNS varchar(250) CHARSET utf8
    NO SQL
BEGIN
	SELECT tn.nombre_nivel INTO @result
	FROM niveles_estudio AS tn
	JOIN grados AS tg ON tg.id_nivel = tn.id
	WHERE tg.id = PGrade LIMIT 1;
	RETURN CONCAT(@result);
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_porciento_asignatura
DROP FUNCTION IF EXISTS `fn_porciento_asignatura`;
DELIMITER //
CREATE FUNCTION `fn_porciento_asignatura`(`_id_asig` INT(11), `_año` YEAR, `_cod_grado` INT(11)) RETURNS double
    READS SQL DATA
BEGIN
 DECLARE result DECIMAL(6,2) DEFAULT 0;
 SELECT porciento INTO result FROM matcurso WHERE id_asig=_id_asig AND id_grado=_cod_grado AND año=_año LIMIT 1;
RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_recuperacion_notas
DROP FUNCTION IF EXISTS `fn_recuperacion_notas`;
DELIMITER //
CREATE FUNCTION `fn_recuperacion_notas`(
	`PEnrollement` INT(20),
	`PCourse` INT(11)
) RETURNS double
    READS SQL DATA
BEGIN
	DECLARE result DECIMAL(6,2) DEFAULT 0.0;
	SELECT notarecuperada INTO result FROM respeciales
 	WHERE id_matric= PEnrollement AND id_curso= PCourse LIMIT 1;

	RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_recuperacion_total_areas
DROP FUNCTION IF EXISTS `fn_recuperacion_total_areas`;
DELIMITER //
CREATE FUNCTION `fn_recuperacion_total_areas`(
	`PEnrollment` INT(30)
) RETURNS int(11)
    READS SQL DATA
BEGIN
 	DECLARE result, x INT DEFAULT 0;
	SELECT a.year INTO @PYear FROM student_enrollment a
	WHERE a.id = PEnrollment LIMIT 1;

	SELECT COUNT(id_matric) AS total,
	ROW_NUMBER() OVER (PARTITION BY t.id_matric ORDER BY ta.id_pk DESC) AS row_num
	INTO x, result	FROM respeciales AS t
	JOIN cursos AS tc ON t.id_curso = tc.id
	JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
	JOIN aux_asignaturas AS aux ON (aux.id_asign = ta.id_pk  AND aux.year = @PYear)
	WHERE id_matric= PEnrollment GROUP BY t.id_matric, aux.id_area  LIMIT 1;

RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_recuperacion_total_asignaturas
DROP FUNCTION IF EXISTS `fn_recuperacion_total_asignaturas`;
DELIMITER //
CREATE FUNCTION `fn_recuperacion_total_asignaturas`(
	`PEnrollment` BIGINT
) RETURNS int(11)
    READS SQL DATA
BEGIN
	SELECT COUNT(*) INTO @result FROM respeciales WHERE id_matric = PEnrollment;
	RETURN @result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_return_table_logros_indicadores
DROP FUNCTION IF EXISTS `fn_return_table_logros_indicadores`;
DELIMITER //
CREATE FUNCTION `fn_return_table_logros_indicadores`(`_grado` INT(11)) RETURNS varchar(30) CHARSET utf8
    READS SQL DATA
BEGIN
DECLARE result VARCHAR(30) DEFAULT '';
	CASE
		WHEN _grado BETWEEN 1 AND 4 THEN
			SET result = 'log_nscp00';
		WHEN _grado BETWEEN 5 AND 9 THEN
			SET result = 'log_nscp001';
		WHEN _grado BETWEEN 10 AND 13 THEN
			SET result = 'log_nscp002';
		ELSE
			SET result = 'log_nscp003';
	END CASE;
RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_return_table_notas
DROP FUNCTION IF EXISTS `fn_return_table_notas`;
DELIMITER //
CREATE FUNCTION `fn_return_table_notas`(`_grado` INT(11)) RETURNS varchar(30) CHARSET utf8
    READS SQL DATA
BEGIN
DECLARE result VARCHAR(30) DEFAULT '';
	CASE
		WHEN _grado BETWEEN 1 AND 4 THEN
			SET result = 'nscp00';
		WHEN _grado BETWEEN 5 AND 9 THEN
			SET result = 'nscp001';
		WHEN _grado BETWEEN 10 AND 13 THEN
			SET result = 'nscp002';
		ELSE
			SET result = 'nscp003';
	END CASE;
RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_return_table_notas_promedios
DROP FUNCTION IF EXISTS `fn_return_table_notas_promedios`;
DELIMITER //
CREATE FUNCTION `fn_return_table_notas_promedios`(`_grado` INT(11)) RETURNS varchar(30) CHARSET utf8
    READS SQL DATA
BEGIN
DECLARE result VARCHAR(30) DEFAULT '';
	CASE
		WHEN _grado BETWEEN 1 AND 4 THEN
			SET result = 'nscp00_promedio_notas';
		WHEN _grado BETWEEN 5 AND 9 THEN
			SET result = 'nscp001_promedio_notas';
		WHEN _grado BETWEEN 10 AND 13 THEN
			SET result = 'nscp002_promedio_notas';
		ELSE
			SET result = 'nscp003_promedio_notas';
	END CASE;
RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_return_table_preinforme
DROP FUNCTION IF EXISTS `fn_return_table_preinforme`;
DELIMITER //
CREATE FUNCTION `fn_return_table_preinforme`(`_grado` INT(11)) RETURNS varchar(60) CHARSET utf8
    READS SQL DATA
BEGIN
DECLARE result VARCHAR(60) DEFAULT '';
	CASE
		WHEN _grado BETWEEN 1 AND 4 THEN
			SET result = 'preinforme_nscp00';
		WHEN _grado BETWEEN 5 AND 9 THEN
			SET result = 'preinforme_nscp001';
		WHEN _grado BETWEEN 10 AND 13 THEN
			SET result = 'preinforme_nscp002';
		ELSE
			SET result = 'preinforme_nscp003';
	END CASE;
RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_return_table_sug
DROP FUNCTION IF EXISTS `fn_return_table_sug`;
DELIMITER //
CREATE FUNCTION `fn_return_table_sug`(`_grado` INT(11)) RETURNS varchar(30) CHARSET utf8
    READS SQL DATA
BEGIN
DECLARE result VARCHAR(30) DEFAULT '';
	CASE
		WHEN _grado BETWEEN 1 AND 4 THEN
			SET result = 'sug_nscp00';
		WHEN _grado BETWEEN 5 AND 9 THEN
			SET result = 'sug_nscp001';
		WHEN _grado BETWEEN 10 AND 13 THEN
			SET result = 'sug_nscp002';
		ELSE
			SET result = 'sug_nscp003';
	END CASE;
RETURN result;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.fn_set_notas_resp_ciclos
DROP FUNCTION IF EXISTS `fn_set_notas_resp_ciclos`;
DELIMITER //
CREATE FUNCTION `fn_set_notas_resp_ciclos`(`_id_inst` INT(20), `_id_sede` INT(20), `_id_docente` INT(20), `_cod_grado` VARCHAR(2), `_grupo` VARCHAR(2), `_id_asig` INT(3), `_año` YEAR, `_x_nro_acta` INT(6)) RETURNS int(1)
    NO SQL
BEGIN
RETURN 1;
END//
DELIMITER ;

-- Volcando estructura para función asaie_exodo.strip_tags
DROP FUNCTION IF EXISTS `strip_tags`;
DELIMITER //
CREATE FUNCTION `strip_tags`(
	`$str` TEXT
) RETURNS text CHARSET utf8
    DETERMINISTIC
BEGIN
 DECLARE $start, $end INT DEFAULT 1;
    LOOP
        SET $start = LOCATE("<", $str, $start);
        IF (!$start) THEN RETURN $str; END IF;
        SET $end = LOCATE(">", $str, $start);
        IF (!$end) THEN SET $end = $start; END IF;
        SET $str = INSERT($str, $start, $end - $start + 1, "");
    END LOOP;
END//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
