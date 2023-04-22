
INSERT INTO aux_docentes (id_docente, year)
SELECT a.id_docente, 2023 FROM docentes AS a
WHERE NOT EXISTS(SELECT * FROM aux_docentes AS b
                 WHERE b.id_docente = a.id_docente AND b.`year` = 2023);
