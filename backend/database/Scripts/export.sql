/*Consolidado de matriculas*/
SELECT tem.name_state estado, te.apellido1, te.apellido2, te.nombre1, te.nombre2,
       tx.nombre_sexo AS sexo, te.tipo_sangre, te.fecha_nacimiento, FLOOR(TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE())) edad,
       ex.sisben, te.estrato, RTRIM(te.ips) IPS, RTRIM(te.direccion) direccion, tz.zone_name zona,
       te.nro_documento documento, RTRIM(tdoc.tipo) tipo_documento,te.telefono,
       tg.cod_grado,RTRIM(tg.grado) grado,tm.id_group, tj.jornada, RTRIM(ts.headquarters_name) sede,tm.year,
       tpv.nombre pob_vict_conf, ex.cod_flia_accion, ex.nro_sisben
FROM inscripciones AS te
         LEFT JOIN student_enrollment AS tm ON tm.id_student = te.id
         LEFT JOIN extra_inscripciones AS ex ON ex.id_inscripcion = te.id
         JOIN grados AS tg  ON tm.id_grade = tg.id
         JOIN jornadas AS tj ON tm.id_study_day = tj.cod_jorn
         JOIN sedes AS ts ON tm.id_headquarters = ts.ID
         LEFT JOIN documentos AS tdoc ON te.id_documento = tdoc.id
         LEFT JOIN registration_status AS tem ON tm.id_state = tem.id
         LEFT JOIN zona tz ON te.id_zona = tz.id_zona
         LEFT JOIN sexo AS tx ON te.id_sexo = tx.id
         LEFT JOIN poblacion_victima_conflicto AS tpv ON ex.id_pob_vic_conf = tpv.id
ORDER BY tm.year, sede, tm.id_grade, tm.id_group, tm.id_study_day, te.apellido1, te.apellido2, te.nombre1, te.nombre2;

/*Asignacion academica*/
SELECT tc.year, tg.grado, RTRIM(ta.asignatura) asignatura,
       ts.headquarters_name as sede,  tj.jornada, tm.ih,
       CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) AS docente
FROM cursos AS tc
         LEFT JOIN grados as tg ON tc.id_grado = tg.id
         LEFT JOIN asignaturas AS ta ON tc.id_asig = ta.id_pk
         LEFT JOIN sedes AS ts ON tc.id_sede = ts.id
         LEFT JOIN jornadas AS tj ON tc.id_jorn = tj.cod_jorn
         LEFT JOIN matcurso AS tm ON (tm.id_grado  = tg.id
    AND tm.id_asig = ta.id_pk AND tm.year=tc.year)
         LEFT JOIN docentes AS td ON td.id_docente=tc.id_docente
WHERE ta.estado = 1 AND tc.estado = 1
ORDER BY tc.year, sede, tc.id_grado,tc.id_jorn,tc.grupo,docente,asignatura;

/*Docentes*/
SELECT RTRIM(td.direccion) direccion,td.tipo_sangre,
       td.image,td.documento,td.fecha_nacimiento,
       CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) nombres,
       td.sexo,FLOOR(TIMESTAMPDIFF(YEAR, td.fecha_nacimiento, CURDATE())) edad,
       td.movil, td.fijo,'' otra,td.email,au.year,tdoc.documento,
       ten.nivel,tnv.nivel_nom,
       dp.name_departament dpto_expedicion,
       dp2.name_departament AS dpto_nacimiento, tm.name_city AS mun_expedicion, tm1.name_city AS mun_nacimiento,
       RTRIM(tes.tipo) AS Escalafon
FROM docentes AS td
         LEFT JOIN docdocente AS tdoc ON td.id_documento = tdoc.id_doc
         LEFT JOIN aux_docentes AS au ON au.id_docente = td.id_docente
         LEFT JOIN `enseñanza` AS ten ON td.cod_ense = ten.id
         LEFT JOIN niveles AS tnv ON td.cod_nivel    = tnv.id_nivel
         LEFT JOIN cities AS tm ON td.mun_exp 			= tm.id
         LEFT JOIN cities AS tm1 ON td.mun_nac = tm1.id
         LEFT JOIN departments AS dp ON tm.id_dept = dp.id
         LEFT JOIN departments AS dp2 ON tm1.id_dept = dp2.id
         LEFT JOIN escalafon AS tes ON td.id_escalafon =tes.id
ORDER BY au.year, nombres;

/*Areas*/
SELECT t.area, t.abrev, t.ordenar orden, t.estado activa
FROM areas t
ORDER BY t.AREA;

/*Asignaturas*/

SELECT t.asignatura, t.abrev, t.ordenar orden, t.electiva, a.AREA, au.`year`
FROM asignaturas t
JOIN aux_asignaturas AS au ON au.id_asign = t.id_pk
JOIN areas AS a ON  a.id = au.id_area
ORDER BY au.`year`, AREA, asignatura;


/*Matcurso*/
SELECT tm.year, RTRIM(ta.asignatura) as asignatura, tg.grado,ta.abrev, tm.ih, tm.porciento
FROM matcurso AS tm
         LEFT JOIN asignaturas AS ta ON tm.id_asig=ta.id_pk
         LEFT JOIN grados AS tg ON tm.id_grado = tg.id
ORDER BY year, tg.id, asignatura;


/*Notas*/
SELECT tm.id_group grupo,tm.year,ta.p1,ta.p2,ta.p3,ta.p4,ta.final,ta.recuperacion,
       ta.faltas,ta.injustificadas,ta.retraso,RTRIM(ts.headquarters_name) As sede,tg.grado,tj.jornada,
       RTRIM(tar.area) area,RTRIM(tas.asignatura) asignatura,
       concat(rtrim(te.apellido1),' ',rtrim(te.apellido2),' ',rtrim(te.nombre1),' ',rtrim(te.nombre2))
                                                                          as estudiante, te.nro_documento, RIGHT(CONCAT('0000',tm.registration_number),4) nro_matricula,
    RIGHT(CONCAT('0000',tm.book),4) libro_mat, tmc.ih, tp.msg,tn.nombre_nivel, es.nombre_escala
FROM areasf AS ta
    LEFT JOIN cursos AS tc ON ta.id_curso = tc.id
    LEFT JOIN student_enrollment AS tm ON ta.id_matric=tm.id
    LEFT JOIN sedes AS ts ON tm.id_headquarters=ts.id
    LEFT JOIN grados AS tg ON tm.id_grade=tg.id
    LEFT JOIN jornadas AS tj ON tm.id_study_day =tj.cod_jorn
    LEFT JOIN asignaturas AS tas ON tc.id_asig=tas.id_pk
    LEFT JOIN aux_asignaturas AS aux ON (aux.id_asign = tas.id_pk  AND aux.year = tc.year)
    LEFT JOIN areas AS tar ON aux.id_area=tar.id
    LEFT JOIN inscripciones AS te ON tm.id_student = te.id
    LEFT JOIN sexo AS tx ON te.id_sexo = tx.id
    LEFT JOIN cities AS ct ON te.lug_expedicion = ct.id
    LEFT JOIN matcurso AS tmc ON (tmc.id_asig = tas.id_pk AND tmc.id_grado = tc.id_grado AND tmc.`year` = tc.year)
    LEFT JOIN acta_promocion AS tp ON tp.id_matric = ta.id_matric
    LEFT JOIN niveles_estudio AS tn ON tg.id_nivel = tn.id
    LEFT JOIN `desempeños` AS td ON (ta.final BETWEEN td.desde AND td.hasta AND td.year = tc.year)
    LEFT JOIN escala_nacional AS es ON td.id_escala = es.id
    LEFT JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id
    LEFT JOIN aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
WHERE tar.estado = 1 AND tas.estado = 1 AND tmc.estado = 1 AND
    ta.id_matric=tm.id
ORDER BY tc.year, tc.id_grado, tc.grupo , estudiante,tar.ordenar,tar.id,tas.ordenar;

/*Notas periodicas*/
SELECT tcr.year, tn.periodo,	tn.nota_perdida, tn.nota_habilitacion, tn.final, tn.faltas,tn.retraso,tn.injustificadas,
       tcr.grupo, CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',
                         RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) AS estudiante , te.nro_documento, RTRIM(tar.area) AS area,
       RTRIM(tas.asignatura) AS asignatura, CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',
                                                   RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) as docente,RTRIM(ts.headquarters_name) AS sede, tj.jornada, tg.grado,
       tes.name_state, tc.ih,
       round(if(tn.nota_habilitacion > 0, (tn.nota_habilitacion*tc.porciento)/100, (tn.final*tc.porciento)/100),2) AS
           nota_p, tn.nivelacion, TRIM(es.nombre_escala) escala, tv.nombre_nivel
FROM nscp003 AS tn
         LEFT JOIN cursos AS tcr ON (tn.id_curso=tcr.id AND tn.year=tcr.`year`)
         LEFT JOIN grados As tg ON tcr.id_grado = tg.id
         LEFT JOIN asignaturas AS tas ON tcr.id_asig = tas.id_pk
         LEFT JOIN aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = tcr.year)
         LEFT JOIN areas AS tar ON au.id_area=tar.id
         LEFT JOIN docentes AS td ON  tcr.id_docente = td.id_docente
         LEFT JOIN sedes AS ts ON tcr.id_sede = ts.id
         LEFT JOIN jornadas AS tj ON tcr.id_jorn = tj.cod_jorn
         LEFT JOIN matcurso AS tc ON (tc.id_grado = tg.id AND tc.id_asig = tas.id_pk AND tc.id_grado = tcr.id_grado AND tc.year = tcr.year)
         LEFT JOIN student_enrollment AS tm on tn.id_matric = tm.id
         LEFT JOIN inscripciones AS te ON tm.id_student = te.id
         LEFT JOIN registration_status AS tes ON tm.id_state = tes.id
         LEFT JOIN escala_nacional AS es ON tn.id_escala=es.id
         LEFT JOIN niveles_estudio AS tv ON tg.id_nivel = tv.id
WHERE tn.id_matric = tm.id
ORDER BY tn.year, tm.id_grade, tm.id_group, tm.id_study_day, estudiante, tn.periodo ,tar.ordenar, au.id_area,tas.id_pk;

SELECT td.year, td.desde, td.hasta, t1.nombre_grado_agrupado, t2.nombre_escala, t2.abrev
FROM `desempeños` AS td
         LEFT JOIN grados_agrupados AS t1 ON td.id_grado_agrupado = t1.id
         LEFT JOIN escala_nacional AS t2 ON td.id_escala = t2.id
ORDER BY td.year, td.id_grado_agrupado, td.id;
