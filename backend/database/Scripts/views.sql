-- =======================================================================================
-- ARCHIVO MAESTRO OPTIMIZADO: VISTAS NSCP
-- =======================================================================================
-- ESTRATEGIA DE OPTIMIZACIÓN APLICADA:
-- 1. "Derived Tables" (Subconsultas): Para queries con GROUP BY. 
--    Primero se agrupan los datos en una subconsulta (dt) y luego se aplica 
--    la función de ventana (COUNT OVER) afuera. Esto evita bloqueos y tablas temporales gigantes.
-- 2. Eliminación de tablas redundantes: Se eliminó el JOIN a 'asignaturas' ya que 
--    'cursos' conecta directamente con 'matcurso' y 'aux_asignaturas'.
-- 3. Limpieza de DISTINCT redundantes donde ya existía GROUP BY.
-- =======================================================================================

-- ---------------------------------------------------------------------------------------
-- GRUPO: NSCP001
-- ---------------------------------------------------------------------------------------

-- **1. Query de `nscp001_view_porcentaje_areas`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    -- Función de ventana aplicada sobre el resultado ya agrupado (Rápido)
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`) AS `t_areas`
FROM (
    -- CAPA INTERNA: Agregación pura
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100)), 2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)), 2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp001` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year`, `tn`.`periodo`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`periodo`, dt.`id_area`, dt.`id_asig`;

-- **2. Query de `nscp001_view_porcentaje_areas_periodos`**
SELECT DISTINCT
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    ROUND(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100), 2) AS `final`,
    ROUND(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado`,
    COUNT(*) OVER (PARTITION BY `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`) AS `t_areas`
FROM 
    `nscp001` `tn` 
    JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
    JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
ORDER BY 
    `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`, `tc`.`id_asig`;

-- **3. Query de `nscp001_view_prom_por_area`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp001` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year`, `tn`.`periodo`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`id_area`, dt.`id_asig`;

-- **4. Query de `nscp001_view_prom_por_area_periodos`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`, dt.`periodo`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp001` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`periodo`, `tn`.`year`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`periodo`, dt.`id_area`, dt.`id_asig`;

-- ---------------------------------------------------------------------------------------
-- GRUPO: NSCP002
-- ---------------------------------------------------------------------------------------

-- **5. Query de `nscp002_view_porcentaje_areas`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100)), 2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)), 2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp002` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year`, `tn`.`periodo`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`periodo`, dt.`id_area`, dt.`id_asig`;

-- **6. Query de `nscp002_view_porcentaje_areas_periodos`**
SELECT DISTINCT
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    ROUND(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100), 2) AS `final`,
    ROUND(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado`,
    COUNT(*) OVER (PARTITION BY `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`) AS `t_areas`
FROM 
    `nscp002` `tn` 
    JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
    JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
ORDER BY 
    `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`, `tc`.`id_asig`;

-- **7. Query de `nscp002_view_prom_por_area`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp002` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year`, `tn`.`periodo`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`id_area`, dt.`id_asig`;

-- **8. Query de `nscp002_view_prom_por_area_periodos`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`, dt.`periodo`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp002` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`periodo`, `tn`.`year`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`periodo`, dt.`id_area`, dt.`id_asig`;

-- ---------------------------------------------------------------------------------------
-- GRUPO: NSCP003
-- ---------------------------------------------------------------------------------------

-- **9. Query de `nscp003_view_porcentaje_areas`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100)), 2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)), 2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp003` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year`, `tn`.`periodo`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`periodo`, dt.`id_area`, dt.`id_asig`;

-- **10. Query de `nscp003_view_porcentaje_areas_periodos`**
SELECT DISTINCT
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    ROUND(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100), 2) AS `final`,
    ROUND(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado`,
    COUNT(*) OVER (PARTITION BY `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`) AS `t_areas`
FROM 
    `nscp003` `tn` 
    JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
    JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
ORDER BY 
    `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`, `tc`.`id_asig`;

-- **11. Query de `nscp003_view_prom_por_area`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp003` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year`, `tn`.`periodo`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`id_area`, dt.`id_asig`;

-- **12. Query de `nscp003_view_prom_por_area_periodos`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`, dt.`periodo`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp003` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`periodo`, `tn`.`year`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`periodo`, dt.`id_area`, dt.`id_asig`;

-- ---------------------------------------------------------------------------------------
-- GRUPO: NSCP00 (General)
-- ---------------------------------------------------------------------------------------

-- **13. Query de `nscp00_view_porcentaje_areas`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100)), 2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)), 2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp00` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year`, `tn`.`periodo`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`periodo`, dt.`id_area`, dt.`id_asig`;

-- **14. Query de `nscp00_view_porcentaje_areas_periodos`**
SELECT DISTINCT
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    ROUND(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100), 2) AS `final`,
    ROUND(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado`,
    COUNT(*) OVER (PARTITION BY `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`) AS `t_areas`
FROM 
    `nscp00` `tn` 
    JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
    JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
ORDER BY 
    `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`, `tc`.`id_asig`;

-- **15. Query de `nscp00_view_prom_por_area`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp00` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year`, `tn`.`periodo`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`id_area`, dt.`id_asig`;

-- **16. Query de `nscp00_view_prom_por_area_periodos`**
SELECT 
    dt.`id_matric`,
    dt.`id_asig`,
    dt.`id_area`,
    dt.`final`,
    dt.`prom`,
    dt.`porciento`,
    dt.`periodo`,
    dt.`year`,
    dt.`id_grado`,
    COUNT(*) OVER (PARTITION BY dt.`id_matric`, dt.`id_area`, dt.`periodo`) AS `t_areas`
FROM (
    SELECT 
        `tn`.`id_matric`,
        `tc`.`id_asig`,
        `aux`.`id_area`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `final`,
        ROUND(AVG(GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`)),2) AS `prom`,
        `tmc`.`porciento`,
        `tn`.`periodo`,
        `tc`.`year`,
        `tc`.`id_grado`
    FROM 
        `nscp00` `tn` 
        JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
        JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tc`.`id_asig` AND `aux`.`year` = `tc`.`year`) 
        JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tc`.`id_asig` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
    GROUP BY 
        `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`periodo`, `tn`.`year`, `tmc`.`porciento`, `tc`.`id_grado`
) AS dt
ORDER BY 
    dt.`id_matric`, dt.`periodo`, dt.`id_area`, dt.`id_asig`;