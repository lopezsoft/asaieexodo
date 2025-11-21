
-- **1. Query de `nscp001_view_porcentaje_areas`-- **

```sql
SELECT 
    `tn`.`periodo` AS `periodo`,
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    `tc`.`id_grado` AS `id_grado`,
    `tc`.`year` AS `year`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion` * `tmc`.`porciento` / 100, `tn`.`final` * `tmc`.`porciento` / 100)), 2) AS `final`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento` 
FROM 
    `nscp001` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year` 
ORDER BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`;
```

-- **2. Query de `nscp001_view_porcentaje_areas_periodos`-- **

```sql
SELECT DISTINCT
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    
    -- Nota Final Calculada
    ROUND(
        GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100), 
    2) AS `final`,

    -- Nota Promedio (Pura)
    ROUND(
        GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`), 
    2) AS `prom`,

    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado`,
    -- Cuenta cuántas materias tiene este alumno en esta área y periodo específico
    COUNT(*) OVER (PARTITION BY `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`) AS `t_areas`

FROM 
    `nscp001` `tn` 
    JOIN `cursos` `tc` 
        ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    JOIN `asignaturas` `tas` 
        ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    JOIN `aux_asignaturas` `aux` 
        ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    JOIN `matcurso` `tmc` 
        ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
ORDER BY 
    `tn`.`id_matric`, 
    `tn`.`periodo`, 
    `aux`.`id_area`, 
    `tc`.`id_asig`;
```

-- **3. Query de `nscp001_view_prom_por_area`-- **

```sql
SELECT 
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    `tc`.`id_grado` AS `id_grado`,
    `tc`.`year` AS `year`,
    `tn`.`periodo` AS `periodo`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `final`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento` 
FROM 
    `nscp001` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year` 
ORDER BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`;
```

-- **4. Query de `nscp001_view_prom_por_area_periodos`-- **

```sql
SELECT 
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    ROUND(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`), 2) AS `final`,
    ROUND(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado` 
FROM 
    `nscp001` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`periodo` 
ORDER BY 
    `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`, `tc`.`id_asig`;
```

-----

### Grupo: NSCP002

-- **5. Query de `nscp002_view_porcentaje_areas`-- **

```sql
SELECT 
    `tn`.`periodo` AS `periodo`,
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    `tc`.`id_grado` AS `id_grado`,
    `tc`.`year` AS `year`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion` * `tmc`.`porciento` / 100, `tn`.`final` * `tmc`.`porciento` / 100)), 2) AS `final`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento` 
FROM 
    `nscp002` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year` 
ORDER BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`;
```

-- **6. Query de `nscp002_view_porcentaje_areas_periodos`-- **

```sql
SELECT DISTINCT
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    
    -- Nota Final Calculada
    ROUND(
        GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100), 
    2) AS `final`,

    -- Nota Promedio (Pura)
    ROUND(
        GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`), 
    2) AS `prom`,

    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado`,
    -- Cuenta cuántas materias tiene este alumno en esta área y periodo específico
    COUNT(*) OVER (PARTITION BY `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`) AS `t_areas`

FROM 
    `nscp002` `tn` 
    JOIN `cursos` `tc` 
        ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    JOIN `asignaturas` `tas` 
        ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    JOIN `aux_asignaturas` `aux` 
        ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    JOIN `matcurso` `tmc` 
        ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
ORDER BY 
    `tn`.`id_matric`, 
    `tn`.`periodo`, 
    `aux`.`id_area`, 
    `tc`.`id_asig`;
```

-- **7. Query de `nscp002_view_prom_por_area`-- **

```sql
SELECT 
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    `tc`.`id_grado` AS `id_grado`,
    `tc`.`year` AS `year`,
    `tn`.`periodo` AS `periodo`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `final`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento` 
FROM 
    `nscp002` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year` 
ORDER BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`;
```

-- **8. Query de `nscp002_view_prom_por_area_periodos`-- **

```sql
SELECT 
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    ROUND(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`), 2) AS `final`,
    ROUND(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado` 
FROM 
    `nscp002` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`periodo` 
ORDER BY 
    `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`, `tc`.`id_asig`;
```

-----

### Grupo: NSCP003

-- **9. Query de `nscp003_view_porcentaje_areas`-- **

```sql
SELECT 
    `tn`.`periodo` AS `periodo`,
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    `tc`.`id_grado` AS `id_grado`,
    `tc`.`year` AS `year`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion` * `tmc`.`porciento` / 100, `tn`.`final` * `tmc`.`porciento` / 100)), 2) AS `final`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento` 
FROM 
    `nscp003` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year` 
ORDER BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`;
```

-- **10. Query de `nscp003_view_porcentaje_areas_periodos`-- **

```sql
SELECT DISTINCT
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    
    -- Nota Final Calculada
    ROUND(
        GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100), 
    2) AS `final`,

    -- Nota Promedio (Pura)
    ROUND(
        GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`), 
    2) AS `prom`,

    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado`,
    -- Cuenta cuántas materias tiene este alumno en esta área y periodo específico
    COUNT(*) OVER (PARTITION BY `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`) AS `t_areas`

FROM 
    `nscp003` `tn` 
    JOIN `cursos` `tc` 
        ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    JOIN `asignaturas` `tas` 
        ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    JOIN `aux_asignaturas` `aux` 
        ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    JOIN `matcurso` `tmc` 
        ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
ORDER BY 
    `tn`.`id_matric`, 
    `tn`.`periodo`, 
    `aux`.`id_area`, 
    `tc`.`id_asig`;
```

-- **11. Query de `nscp003_view_prom_por_area`-- **

```sql
SELECT 
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    `tc`.`id_grado` AS `id_grado`,
    `tc`.`year` AS `year`,
    `tn`.`periodo` AS `periodo`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `final`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento` 
FROM 
    `nscp003` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year` 
ORDER BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`;
```

-- **12. Query de `nscp003_view_prom_por_area_periodos`-- **

```sql
SELECT 
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    ROUND(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`), 2) AS `final`,
    ROUND(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado` 
FROM 
    `nscp003` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`periodo` 
ORDER BY 
    `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`, `tc`.`id_asig`;
```

-----

### Grupo: NSCP00 (General)

-- **13. Query de `nscp00_view_porcentaje_areas`-- **

```sql
SELECT 
    `tn`.`periodo` AS `periodo`,
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    `tc`.`id_grado` AS `id_grado`,
    `tc`.`year` AS `year`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion` * `tmc`.`porciento` / 100, `tn`.`final` * `tmc`.`porciento` / 100)), 2) AS `final`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento` 
FROM 
    `nscp00` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year` 
ORDER BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`;
```

-- **14. Query de `nscp00_view_porcentaje_areas_periodos`-- **

```sql
SELECT DISTINCT
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    
    -- Nota Final Calculada
    ROUND(
        GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`) * (`tmc`.`porciento` / 100), 
    2) AS `final`,

    -- Nota Promedio (Pura)
    ROUND(
        GREATEST(COALESCE(`tn`.`nota_habilitacion`, 0), `tn`.`final`), 
    2) AS `prom`,

    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado`,
    -- Cuenta cuántas materias tiene este alumno en esta área y periodo específico
    COUNT(*) OVER (PARTITION BY `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`) AS `t_areas`

FROM 
    `nscp00` `tn` 
    JOIN `cursos` `tc` 
        ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    JOIN `asignaturas` `tas` 
        ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    JOIN `aux_asignaturas` `aux` 
        ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    JOIN `matcurso` `tmc` 
        ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
ORDER BY 
    `tn`.`id_matric`, 
    `tn`.`periodo`, 
    `aux`.`id_area`, 
    `tc`.`id_asig`;
```

-- **15. Query de `nscp00_view_prom_por_area`-- **

```sql
SELECT 
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    `tc`.`id_grado` AS `id_grado`,
    `tc`.`year` AS `year`,
    `tn`.`periodo` AS `periodo`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `final`,
    ROUND(AVG(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`)), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento` 
FROM 
    `nscp00` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`year` 
ORDER BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`;
```

-- **16. Query de `nscp00_view_prom_por_area_periodos`-- **

```sql
SELECT 
    `tn`.`id_matric` AS `id_matric`,
    `tc`.`id_asig` AS `id_asig`,
    `aux`.`id_area` AS `id_area`,
    ROUND(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`), 2) AS `final`,
    ROUND(IF(`tn`.`nota_habilitacion` > `tn`.`final`, `tn`.`nota_habilitacion`, `tn`.`final`), 2) AS `prom`,
    `tmc`.`porciento` AS `porciento`,
    `tn`.`periodo` AS `periodo`,
    `tc`.`year` AS `year`,
    `tc`.`id_grado` AS `id_grado` 
FROM 
    `nscp00` `tn` 
    LEFT JOIN `cursos` `tc` ON (`tn`.`id_curso` = `tc`.`id` AND `tn`.`year` = `tc`.`year`) 
    LEFT JOIN `asignaturas` `tas` ON (`tc`.`id_asig` = `tas`.`id_pk`) 
    LEFT JOIN `aux_asignaturas` `aux` ON (`aux`.`id_asign` = `tas`.`id_pk` AND `aux`.`year` = `tc`.`year`) 
    LEFT JOIN `matcurso` `tmc` ON (`tmc`.`id_asig` = `tas`.`id_pk` AND `tmc`.`year` = `tc`.`year` AND `tmc`.`id_grado` = `tc`.`id_grado`)
GROUP BY 
    `tn`.`id_matric`, `aux`.`id_area`, `tc`.`id_asig`, `tn`.`periodo` 
ORDER BY 
    `tn`.`id_matric`, `tn`.`periodo`, `aux`.`id_area`, `tc`.`id_asig`;
```