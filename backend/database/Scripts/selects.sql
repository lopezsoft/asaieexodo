
INSERT INTO aux_docentes (id_docente, year)
SELECT a.id_docente, 2023 FROM docentes AS a
WHERE NOT EXISTS(SELECT * FROM aux_docentes AS b
                 WHERE b.id_docente = a.id_docente AND b.`year` = 2023);


SELECT * FROM docentes AS a WHERE a.documento = '1068582955';
SELECT * FROM cursos AS a
WHERE a.id_docente = 9 AND a.`year` = 2023
ORDER BY a.id_grado;
SET FOREIGN_KEY_CHECKS =  0;
DELETE  FROM cursos WHERE id_docente = 9 AND `year` = 2023;
SET FOREIGN_KEY_CHECKS  = 1;


INSERT INTO school_modules(school_id, system_module_id, is_active, status, created_at)
SELECT a.id AS school_id, b.id AS system_module_id, 1, 0, CURRENT_TIMESTAMP()
FROM schools AS a, system_modules AS b
WHERE NOT EXISTS(
	SELECT 1 FROM  school_modules AS aa WHERE aa.school_id = a.id AND aa.system_module_id = b.id
)


SELECT * FROM schools AS a
WHERE a.active =1 AND  NOT EXISTS (
    SELECT 1 FROM school_users AS b WHERE b.school_id = a.id
    AND b.user_id = 1
)


INSERT INTO user_roles(user_id, school_id, profile_id)
SELECT 1, a.id, 3 FROM schools AS a
WHERE a.active =1 AND  NOT EXISTS (
    SELECT 1 FROM user_roles AS b WHERE b.school_id = a.id AND
    b.user_id = 1 AND b.profile_id = 3
)
INSERT INTO school_users (user_id, school_id)
SELECT 1, a.id FROM schools AS a
WHERE a.active =1 AND  NOT EXISTS (
    SELECT 1 FROM school_users AS b WHERE b.school_id = a.id
                                      AND b.user_id = 1
)


SELECT * FROM matcurso AS a
WHERE a.`year` = 2022 AND NOT EXISTS (
    SELECT 1 FROM cursos AS b WHERE b.id_asig = a.id_asig AND b.id_grado = a.id_grado AND b.`year` = a.`year`
);

INSERT INTO matcurso(id_grado, id_asig, year)
SELECT a.id_grado, a.id_asig, a.`year` FROM cursos AS a
WHERE a.`year` = 2021 AND NOT EXISTS (
    SELECT 1 FROM matcurso AS b WHERE b.id_asig = a.id_asig AND b.id_grado = a.id_grado AND b.`year` = a.`year`
);


DELETE FROM matcurso
WHERE `year` = 2009 AND NOT EXISTS (
    SELECT 1 FROM cursos AS b WHERE b.id_asig = matcurso.id_asig AND
            b.id_grado = matcurso.id_grado AND b.`year` = matcurso.`year`
);

SELECT a.*, c.asignatura FROM nscp002 AS a
                                  JOIN cursos AS b ON b.id = a.id_curso
                                  JOIN asignaturas AS c ON c.id_pk = b.id_asig
WHERE a.id_matric = 4551;


UPDATE nscp002 a SET a.nota_habilitacion = 0
WHERE a.final > a.nota_habilitacion AND a.nota_habilitacion > 0;

UPDATE nscp002 a SET a.nota_perdida = 0
WHERE a.final > a.nota_perdida AND a.nota_perdida > 0;


/*** CIERRE DE AÑO **/

-- 1. Desempeños
INSERT INTO desempeños (id, id_grado_agrupado, id_escala, desde, hasta, `year`, reprueba, calificable)
SELECT a.id, a.id_grado_agrupado, a.id_escala, a.desde, a.hasta, a.`year` + 1, a.reprueba, a.calificable
FROM desempeños AS a WHERE a.year = 2023 AND  NOT EXISTS (
    SELECT 1 FROM desempeños AS b WHERE b.id = a.id AND b.`year` = a.`year` + 1
);

-- 2. competencias
INSERT INTO competencias (id, id_grado_agrupado, competencia, porcentaje, `year`, calificable)
SELECT a.id, a.id_grado_agrupado, a.competencia, a.porcentaje, a.`year` + 1, a.calificable
FROM competencias AS a WHERE a.year = 2023 AND  NOT EXISTS (
    SELECT 1 FROM competencias AS b WHERE b.id = a.id AND b.`year` = a.`year` + 1
);

-- 3. config001
INSERT INTO `config001` (
    `id_grupo_grados`,
    `year`,
    `t_año_lectivo`,
    `areas_pierde`,
    `pierde_luego_rec`,
    `promocion`,
    `Ndecimales`,
    `nota_max_rec`,
    `grupo`,
    `procesos`,
    `prom_areas`,
    `porcentaje_areas`,
    `docente_ficha_obs`,
    `porciento_ausencia`,
    `pierde_año_lectivo_area`,
    `a_estra_apoyo_fecha`,
    `cant_est_x_libro`,
    `conv_reincidencia`,
    `ficha_mat_x_año`,
    `nota_redondeo`,
    `nota_final_redondeo`,
    `prom_area_puesto`,
    `fecha_prom`,
    `aplicar_redondeo_fin_año`
) SELECT
    `id_grupo_grados`,
    `year` + 1,
    `t_año_lectivo`,
    `areas_pierde`,
    `pierde_luego_rec`,
    `promocion`,
    `Ndecimales`,
    `nota_max_rec`,
    `grupo`,
    `procesos`,
    `prom_areas`,
    `porcentaje_areas`,
    `docente_ficha_obs`,
    `porciento_ausencia`,
    `pierde_año_lectivo_area`,
    `a_estra_apoyo_fecha`,
    `cant_est_x_libro`,
    `conv_reincidencia`,
    `ficha_mat_x_año`,
    `nota_redondeo`,
    `nota_final_redondeo`,
    `prom_area_puesto`,
    `fecha_prom`,
    `aplicar_redondeo_fin_año`
FROM `config001` WHERE `year` = 2023 AND NOT EXISTS (
    SELECT 1 FROM `config001` AS b WHERE b.id_grupo_grados = `config001`.id_grupo_grados AND b.`year` = `config001`.`year` + 1
);

-- 4. matcurso
INSERT INTO `matcurso` (
    `id_grado`,
    `id_asig`,
    `ih`,
    `year`,
    `porciento`,
    `proc1`,
    `proc2`,
    `proc3`,
    `proc4`,
    `estado`
) SELECT
    `id_grado`,
    `id_asig`,
    `ih`,
    `year` + 1,
    `porciento`,
    `proc1`,
    `proc2`,
    `proc3`,
    `proc4`,
    `estado`
FROM `matcurso` WHERE `year` = 2023 AND NOT EXISTS (
    SELECT 1 FROM `matcurso` AS b WHERE b.id_grado = `matcurso`.id_grado AND b.id_asig = `matcurso`.id_asig AND b.`year` = `matcurso`.`year` + 1
);


-- 5. aux_asignaturas
INSERT INTO `aux_asignaturas` (
    `id_asign`,
    `id_area`,
    `year`,
    `activa`
) SELECT
    `id_asign`,
    `id_area`,
    `year` + 1,
    `activa`
FROM `aux_asignaturas` WHERE `year` = 2023 AND NOT EXISTS (
    SELECT 1 FROM `aux_asignaturas` AS b WHERE b.id_asign = `aux_asignaturas`.id_asign AND b.`year` = `aux_asignaturas`.`year` + 1
);

-- 6. aux_docentes
INSERT INTO `aux_docentes` (
    `id_docente`,
    `year`
) SELECT
    `id_docente`,
    `year` + 1
FROM `aux_docentes` WHERE `year` = 2023 AND NOT EXISTS (
    SELECT 1 FROM `aux_docentes` AS b WHERE b.id_docente = `aux_docentes`.id_docente AND b.`year` = `aux_docentes`.`year` + 1
);
