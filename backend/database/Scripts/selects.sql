
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
