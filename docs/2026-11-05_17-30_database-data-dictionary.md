# Diccionario de Datos Oficial — Base de Datos Unificada `asaie_v3_unified` (PostgreSQL 17)

- **Fecha de Generación:** `2026-11-05 17:30 (-05:00)`
- **Motor de Base de Datos:** `PostgreSQL 17.11` + `pgvector 0.8.1` + `pgcrypto` + `unaccent` + `pg_trgm`
- **Nivel de Normalización:** **3NF / BCNF (Tercera Forma Normal / Forma Normal de Boyce-Codd)** con identificadores 100% en inglés (`snake_case`)
- **Total de Relaciones Documentadas:** **135** (127 tablas base + 8 particiones anuales)
- **Total de Columnas Documentadas:** **1,127** (`100%` con metadato nativo `COMMENT ON COLUMN` en `pg_description`)
- **Aislamiento Multi-Tenant:** **Row-Level Security (`RLS`)** activo y forzado en las 71 tablas operativas mediante `school_id = current_tenant_school_id()`

---

## Índice de Dominios Arquitectónicos

1. **Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT)**
2. **Dominio 2: Multi-Tenancy (Colegios), IAM, Sesiones, Almacenamiento S3 y Auditoría**
3. **Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE)**
4. **Dominio 4: Comunidad Educativa (Docentes, Administrativos, Estudiantes y Familias)**
5. **Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica**
6. **Dominio 6: Matrículas SIMAT, Novedades y Promoción Escolar**
7. **Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado)**
8. **Dominio 8: Observador del Estudiante y Convivencia Escolar**
9. **Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea**
10. **Dominio 10: Gobierno Escolar y Votaciones Electrónicas**
11. **Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector)**

---

## Dominio 1: Catálogos Estáticos y Configuración Oficial (MEN / DANE / SIMAT)

### Tabla `academic_calendars`
- **Descripción:** Catálogo de calendarios escolares oficiales (Calendario A, Calendario B, Otro).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(60)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `academic_characters`
- **Descripción:** Catálogo de carácter de educación media (Académico, Técnico, No Aplica).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(80)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `academic_degrees_catalog`
- **Descripción:** Catálogo de últimos niveles educativos y títulos universitarios alcanzados por el personal docente y administrativo.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `academic_specialties`
- **Descripción:** Catálogo oficial MEN de especialidades académicas y técnicas (Comercial, Industrial, Agropecuaria, Pedagógica, Promoción Social).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(10)` | `NOT NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `character_id` | `smallint` | `NULL` | Identificador del carácter de educación media (Académico o Técnico). |
| 4 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `administrative_career_types`
- **Descripción:** Catálogo de pertenencia a carrera administrativa para funcionarios administrativos.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `cities`
- **Descripción:** Catálogo oficial DANE (DIVIPOLA) de municipios y ciudades de Colombia y el exterior.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `integer` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `department_id` | `integer` | `NOT NULL` | Identificador del departamento territorial DANE (referencia a departments). |
| 3 | `dane_code` | `character varying(20)` | `NOT NULL` | Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede. |
| 4 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `conflict_victim_types`
- **Descripción:** Catálogo oficial SIMAT de situaciones de víctima del conflicto armado y desplazamiento forzado.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(10)` | `NOT NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `cost_regimes`
- **Descripción:** Catálogo de regímenes de costos y tarifas educativas (Libertad Regulada, Libertad Vigilada, Régimen Controlado).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(100)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `countries`
- **Descripción:** Catálogo oficial de países del mundo (ISO 3166-1) utilizado para nacionalidad, lugar de nacimiento y expedición de documentos de identidad.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `integer` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `iso_code` | `character varying(10)` | `NOT NULL` | Código ISO 3166-1 alfa-2 de dos letras del país (ej. CO, US, VE). |
| 3 | `iso_alpha3` | `character varying(10)` | `NULL` | Código ISO 3166-1 alfa-3 de tres letras del país (ej. COL, USA, VEN). |
| 4 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 5 | `continent_code` | `character varying(10)` | `NULL` | Código de dos letras del continente geográfico (ej. SA, NA, EU). |
| 6 | `fips_code` | `character varying(10)` | `NULL` | Código estándar FIPS de identificación geográfica del país. |
| 7 | `language_code` | `character varying(20)` | `NULL` | Código de idioma principal hablado en el país (ej. es-CO). |
| 8 | `phone_prefix` | `character varying(20)` | `NULL` | Prefijo telefónico internacional de marcación del país (ej. +57). |
| 9 | `top_level_domain` | `character varying(10)` | `NULL` | Dominio de nivel superior geográfico ccTLD de Internet (ej. .co). |
| 10 | `flag_image` | `character varying(150)` | `NULL` | Nombre o ruta del archivo de icono de la bandera nacional. |
| 11 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `departments`
- **Descripción:** Catálogo oficial DANE de departamentos o estados territoriales vinculados a un país.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `integer` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `country_id` | `integer` | `NOT NULL` | Identificador del país en el catálogo ISO (referencia a countries). |
| 3 | `dane_code` | `character varying(15)` | `NOT NULL` | Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede. |
| 4 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 5 | `abbreviation` | `character varying(20)` | `NULL` | Abreviatura o sigla corta para visualización en boletines y planillas. |

### Tabla `disability_categories`
- **Descripción:** Catálogo de categorías generales de discapacidad para caracterización de educación inclusiva (PIAR).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `disability_types`
- **Descripción:** Catálogo oficial SIMAT de tipos específicos de discapacidad diagnosticada del estudiante.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(10)` | `NOT NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `document_types`
- **Descripción:** Catálogo oficial SIMAT/ Registraduría de tipos de documento de identidad (CC, TI, RC, CE, PEP, PPT, NES).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(15)` | `NOT NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `education_levels_catalog`
- **Descripción:** Catálogo base MEN de niveles educativos (Preescolar, Básica Primaria, Básica Secundaria, Media).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(20)` | `NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `educational_process_types`
- **Descripción:** Catálogo de tipos de procesos formativos y dimensiones de evaluación institucional.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 3 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `election_candidacy_types`
- **Descripción:** Catálogo de órganos y dignidades del Gobierno Escolar (Personero Estudiantil, Contralor Escolar, Consejo Estudiantil).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 3 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `enrollment_statuses`
- **Descripción:** Catálogo oficial SIMAT de estados de matrícula del estudiante (Matriculado, Retirado, Desertor, Trasladado, Graduado).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(100)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `ethnic_groups`
- **Descripción:** Catálogo oficial DANE/SIMAT de pueblos y grupos étnicos (Indígenas, Afrocolombianos, Raizales, Palenqueros, Rrom).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `integer` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `dane_code` | `character varying(20)` | `NOT NULL` | Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede. |
| 3 | `name` | `character varying(180)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `ethno_education_types`
- **Descripción:** Catálogo de modalidades de etnoeducación aplicables a instituciones educativas focalizadas.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `evaluation_question_types`
- **Descripción:** Catálogo de tipos de preguntas para evaluaciones en línea del Aula Virtual (Selección Múltiple Única/Múltiple, Falso/Verdadero, Ensayo).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 3 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `exceptional_capabilities`
- **Descripción:** Catálogo oficial SIMAT de capacidades y talentos excepcionales reconocidos en estudiantes.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(10)` | `NOT NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `family_member_types`
- **Descripción:** Catálogo de clasificación del rol familiar en la ficha socioeconómica del estudiante.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(80)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `family_relationship_types`
- **Descripción:** Catálogo de tipos de parentesco familiar (Padre, Madre, Abuelo, Tío, Acudiente Legal) respecto al estudiante.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(80)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `funding_sources`
- **Descripción:** Catálogo de fuentes de financiación de cargos (Sistema General de Participaciones SGP, Recursos Propios).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `genders`
- **Descripción:** Catálogo de géneros biológicos e identitarios para caracterización demográfica SIMAT.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(10)` | `NOT NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `name` | `character varying(60)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `geographical_zones`
- **Descripción:** Catálogo de zonas geográficas DANE (Urbana, Rural, Urbana-Rural) para ubicación de sedes y residencia estudiantil.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(60)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `grade_groups_catalog`
- **Descripción:** Catálogo base de agrupaciones de grados por ciclo académico para reglas de evaluación y promoción.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 3 | `is_cycle_end` | `boolean` | `NOT NULL` | Indica si el grupo de grados corresponde a cierre de ciclo educativo. |

### Tabla `grades_catalog`
- **Descripción:** Catálogo oficial SIMAT de los 24 grados escolares estandarizados (Prejardín a Once y Ciclos CLEI de Adultos).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `education_level_id` | `smallint` | `NULL` | Identificador del nivel educativo institucional (referencia a education_levels). |
| 3 | `grade_code` | `character varying(10)` | `NOT NULL` | Código oficial SIMAT del grado escolar (ej. -2, -1, 0, 1..11, 21..26). |
| 4 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 5 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `health_providers`
- **Descripción:** Catálogo nacional de Entidades Promotoras de Salud (EPS) y aseguradoras médicas.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `integer` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(30)` | `NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `name` | `character varying(200)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `hierarchy_levels`
- **Descripción:** Catálogo de niveles jerárquicos de empleos públicos (Directivo, Asesor, Profesional, Técnico, Asistencial).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `indigenous_reserves`
- **Descripción:** Catálogo oficial DANE/SIMAT de resguardos indígenas reconocidos en el territorio nacional.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `integer` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `dane_code` | `character varying(20)` | `NOT NULL` | Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede. |
| 3 | `name` | `character varying(180)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `institution_types`
- **Descripción:** Catálogo de tipos de establecimiento educativo (Institución Educativa, Centro Educativo).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(80)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `institutional_novelty_types`
- **Descripción:** Catálogo de tipos de novedades institucionales reportables ante la Secretaría de Educación.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(180)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `languages`
- **Descripción:** Catálogo de idiomas oficiales y lenguas nativas reconocidos por el Ministerio de Educación Nacional.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(100)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `legal_ownership_types`
- **Descripción:** Catálogo de tipos de propiedad jurídica de establecimientos educativos según clasificación DANE.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `sector_id` | `smallint` | `NULL` | Identificador del sector educativo Oficial o Privado (referencia a school_sectors). |
| 3 | `code` | `character varying(10)` | `NOT NULL` | Código alfanumérico corto estandarizado del registro. |
| 4 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `national_grading_scales`
- **Descripción:** Catálogo de la Escala de Valoración Nacional (Decreto 1290: Desempeño Superior, Alto, Básico y Bajo).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(80)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 3 | `abbreviation` | `character varying(15)` | `NULL` | Abreviatura o sigla corta para visualización en boletines y planillas. |
| 4 | `description` | `text` | `NULL` | Descripción detallada del registro o elemento. |
| 5 | `report_message` | `text` | `NULL` | Mensaje institucional predeterminado asociado al nivel de desempeño en el boletín. |
| 6 | `hex_color` | `character varying(20)` | `NULL` | Color hexadecimal (ej. #10B981) para representar visualmente el nivel de desempeño. |
| 7 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `private_associations`
- **Descripción:** Catálogo de asociaciones de colegios privados reconocidas a nivel nacional.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `promotion_statuses_catalog`
- **Descripción:** Catálogo oficial de estados finales de promoción académica al cierre del año lectivo (Promovido, No Promovido, Pendiente de Nivelación).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `status_code` | `smallint` | `NOT NULL` | Código numérico interno del estado de promoción según reglas de negocio. |
| 3 | `grade_group_id` | `smallint` | `NULL` | Identificador de la agrupación o ciclo de grados (referencia a grade_groups). |
| 4 | `description` | `character varying(180)` | `NOT NULL` | Descripción detallada del registro o elemento. |
| 5 | `is_manual_promotion` | `boolean` | `NOT NULL` | Indica si el estado de promoción puede ser asignado manualmente por comisión de evaluación. |

### Tabla `school_sectors`
- **Descripción:** Catálogo de sectores educativos (Oficial / Público, No Oficial / Privado).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(60)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `school_shifts_catalog`
- **Descripción:** Catálogo base MEN de jornadas escolares (Completa, Mañana, Tarde, Nocturna, Fin de Semana, Única).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(80)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 3 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `staff_appointment_types`
- **Descripción:** Catálogo de tipos de vinculación laboral (Propiedad, Período de Prueba, Provisional Vacante Definitiva/Temporal, Planta Temporal).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `staff_categories`
- **Descripción:** Catálogo de categorías de planta de personal (Docente / Directivo Docente, Administrativo).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(100)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `staff_positions`
- **Descripción:** Catálogo de cargos institucionales (Rector, Coordinador, Docente de Aula, Orientador, Secretario, Bibliotecario).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `category_id` | `smallint` | `NULL` | Identificador de la categoría del ticket o cargo (referencia al catálogo respectivo). |
| 3 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `staff_ranks`
- **Descripción:** Catálogo de rangos laborales del personal vinculado a la institución educativa.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `study_methodologies`
- **Descripción:** Catálogo oficial MEN de 23 metodologías y modelos educativos flexibles (Educación Tradicional, Escuela Nueva, Postprimaria, CAFAN, Aceleración).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `subjects_bank`
- **Descripción:** Banco estándar de 52 asignaturas curriculares de referencia para la creación rápida de planes de estudio.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `integer` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(200)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 3 | `abbreviation` | `character varying(30)` | `NULL` | Abreviatura o sigla corta para visualización en boletines y planillas. |
| 4 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `system_modules`
- **Descripción:** Catálogo maestro de módulos funcionales licenciables dentro de la plataforma SaaS ASAIE ÉXODO V3.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `tag` | `character varying(50)` | `NOT NULL` | Clave técnica única en mayúsculas que identifica al módulo del sistema. |
| 3 | `module_name` | `character varying(120)` | `NOT NULL` | Nombre comercial y funcional del módulo dentro de la plataforma. |
| 4 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 5 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `teacher_pay_scales`
- **Descripción:** Catálogo oficial de los 39 grados del Escalafón Nacional Docente (Decretos 2277 y 1278).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `teaching_areas`
- **Descripción:** Catálogo oficial MEN de 22 áreas de enseñanza y nombramiento docente.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(180)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `technical_areas`
- **Descripción:** Catálogo de áreas técnicas de formación vocacional y articulación SENA.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `user_profiles_catalog`
- **Descripción:** Catálogo de perfiles funcionales de seguridad y navegación para toda la comunidad educativa.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `profile_name` | `character varying(80)` | `NOT NULL` | Nombre del perfil de usuario (Administrador, Docente, Estudiante, Acudiente, Coordinador). |
| 3 | `profile_type` | `character varying(40)` | `NOT NULL` | Categoría técnica del perfil de seguridad. |
| 4 | `description` | `character varying(255)` | `NULL` | Descripción detallada del registro o elemento. |
| 5 | `icon_class` | `character varying(80)` | `NULL` | Clase de icono visual asociada al perfil en el selector de contexto. |
| 6 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `work_time_allocations`
- **Descripción:** Catálogo de dedicación de tiempo laboral (Tiempo Completo, Medio Tiempo, Por Horas).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(100)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

### Tabla `workplace_locations`
- **Descripción:** Catálogo de ubicaciones laborales del personal dentro de la estructura escolar.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |

## Dominio 2: Multi-Tenancy (Colegios), IAM, Sesiones, Almacenamiento S3 y Auditoría

### Tabla `audit_logs`
- **Descripción:** Bitácora inmutable de auditoría de operaciones críticas (creación, actualización, eliminación) aislada por institución educativa.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_audit_logs` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `user_id` | `bigint` | `NULL` | Identificador del usuario global de la comunidad educativa en la tabla users. |
| 4 | `entity_name` | `character varying(100)` | `NOT NULL` | Nombre de la tabla o entidad de dominio afectada por la operación auditada. |
| 5 | `entity_id` | `character varying(100)` | `NULL` | Identificador del registro afectado por la operación auditada. |
| 6 | `action` | `character varying(40)` | `NOT NULL` | Acción ejecutada registrada en auditoría (INSERT, UPDATE, DELETE, LOGIN, SWITCH_CONTEXT). |
| 7 | `ip_address` | `character varying(45)` | `NULL` | Dirección IPv4 o IPv6 desde la cual el cliente realizó la petición. |
| 8 | `previous_data` | `jsonb` | `NULL` | Instantánea JSONB del estado de los datos antes de la modificación. |
| 9 | `new_data` | `jsonb` | `NULL` | Instantánea JSONB del nuevo estado de los datos después de la modificación. |
| 10 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `auth_sessions`
- **Descripción:** Registro de sesiones de autenticación activas e históricas por institución educativa para control de concurrencia y revocación de tokens.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_auth_sessions` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `uuid` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `user_id` | `bigint` | `NOT NULL` | Identificador del usuario global de la comunidad educativa en la tabla users. |
| 4 | `ip_address` | `character varying(45)` | `NULL` | Dirección IPv4 o IPv6 desde la cual el cliente realizó la petición. |
| 5 | `user_agent` | `text` | `NULL` | Cadena User-Agent del navegador o aplicación móvil del usuario. |
| 6 | `device_info` | `character varying(250)` | `NULL` | Resumen del dispositivo y sistema operativo detectado en la sesión. |
| 7 | `started_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora de inicio de la sesión o intento de evaluación. |
| 8 | `ended_at` | `timestamp with time zone` | `NULL` | Fecha y hora de cierre o finalización de la sesión. |
| 9 | `expires_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora de expiración del token de sesión o comunicado. |
| 10 | `is_revoked` | `boolean` | `NOT NULL` | Indica si la sesión fue revocada manualmente o por cierre de seguridad. |

### Tabla `cloud_files`
- **Descripción:** Repositorio centralizado de metadatos de archivos almacenados en AWS S3 por colegio (documentos estudiantiles, guías virtuales, adjuntos CRM, escudos y reportes Jasper).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_cloud_files` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `file_uuid` | `uuid` | `NOT NULL` | Identificador universal único (UUID v4) asignado al archivo en la nube. |
| 4 | `uploaded_by_user_id` | `bigint` | `NULL` | Identificador del usuario que subió el archivo a AWS S3. |
| 5 | `owner_entity_type` | `character varying(50)` | `NULL` | Categoría o entidad de negocio propietaria del archivo (STUDENT_DOCUMENTS, VIRTUAL_ACTIVITIES, CRM_ATTACHMENTS, etc.). |
| 6 | `owner_entity_id` | `bigint` | `NULL` | Identificador del registro propietario del archivo en la entidad correspondiente. |
| 7 | `file_name` | `character varying(255)` | `NOT NULL` | Nombre original o descriptivo del archivo subido. |
| 8 | `description` | `character varying(255)` | `NULL` | Descripción detallada del registro o elemento. |
| 9 | `storage_path` | `character varying(500)` | `NOT NULL` | Ruta completa (Key) del objeto dentro del bucket de AWS S3 incluyendo el storage_folder del colegio. |
| 10 | `public_url` | `text` | `NULL` | URL de acceso o referencia base del objeto en el almacenamiento S3. |
| 11 | `extension` | `character varying(20)` | `NULL` | Extensión del archivo sin punto (ej. pdf, png, jpg, docx). |
| 12 | `mime_type` | `character varying(120)` | `NOT NULL` | Tipo de contenido estándar MIME del archivo (ej. application/pdf, image/png). |
| 13 | `size_bytes` | `bigint` | `NULL` | Tamaño físico del archivo expresado en bytes. |
| 14 | `is_watermark` | `boolean` | `NOT NULL` | Indica si la imagen se utiliza como marca de agua de fondo en los reportes Jasper. |
| 15 | `metadata` | `jsonb` | `NOT NULL` | Objeto JSONB con metadatos técnicos adicionales del registro (ETag, bucket, artículos, etc.). |
| 16 | `status` | `smallint` | `NOT NULL` | Estado operativo actual del registro dentro de su flujo de ciclo de vida. |
| 17 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 18 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

### Tabla `school_modules`
- **Descripción:** Módulos del sistema habilitados por suscripción para cada institución educativa (protegida por RLS).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_school_modules` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `system_module_id` | `smallint` | `NOT NULL` | Identificador del módulo funcional del sistema (referencia a system_modules). |
| 4 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 5 | `status` | `smallint` | `NOT NULL` | Estado operativo actual del registro dentro de su flujo de ciclo de vida. |
| 6 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 7 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

### Tabla `schools`
- **Descripción:** Tabla maestra de Instituciones Educativas (Tenants) en la arquitectura Single-DB Multi-Tenant. Define el código DANE, carpeta física en AWS S3 (storage_folder) y configuración general del colegio.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `public_uuid` | `uuid` | `NOT NULL` | Identificador público UUID v4 de la institución educativa para integraciones externas. |
| 3 | `country_id` | `integer` | `NOT NULL` | Identificador del país en el catálogo ISO (referencia a countries). |
| 4 | `city_id` | `integer` | `NULL` | Identificador del municipio o ciudad DANE (referencia a cities). |
| 5 | `calendar_id` | `smallint` | `NULL` | Identificador del calendario académico A o B (referencia a academic_calendars). |
| 6 | `sector_id` | `smallint` | `NULL` | Identificador del sector educativo Oficial o Privado (referencia a school_sectors). |
| 7 | `institution_type_id` | `smallint` | `NULL` | Identificador del tipo de institución educativa (referencia a institution_types). |
| 8 | `dane_code` | `character varying(30)` | `NULL` | Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede. |
| 9 | `tax_id` | `character varying(30)` | `NULL` | Número de Identificación Tributaria (NIT) con dígito de verificación de la institución educativa. |
| 10 | `name` | `character varying(250)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 11 | `short_name` | `character varying(80)` | `NULL` | Nombre corto o sigla resumida de la institución educativa. |
| 12 | `resolution_text` | `text` | `NULL` | Texto legal de la resolución de aprobación de estudios expedida por la Secretaría de Educación. |
| 13 | `header_line_1` | `character varying(255)` | `NULL` | Primera línea de encabezado institucional para boletines, constancias y reportes Jasper. |
| 14 | `header_line_2` | `character varying(255)` | `NULL` | Segunda línea de encabezado institucional (lema, DANE o NIT) para reportes oficiales. |
| 15 | `footer_text` | `text` | `NULL` | Texto de pie de página institucional para documentos y certificados oficiales. |
| 16 | `director_name` | `character varying(150)` | `NULL` | Nombre completo del Rector(a) o Director(a) Rural en ejercicio. |
| 17 | `director_document` | `character varying(30)` | `NULL` | Número y lugar de expedición del documento de identidad del Rector(a). |
| 18 | `director_signature_url` | `text` | `NULL` | Ruta en AWS S3 de la imagen de la firma digitalizada del Rector(a) para reportes. |
| 19 | `secretary_name` | `character varying(150)` | `NULL` | Nombre completo del Secretario(a) Académico(a) o Auxiliar Administrativo. |
| 20 | `secretary_document` | `character varying(30)` | `NULL` | Documento de identidad del Secretario(a) Académico(a) para firma de certificados. |
| 21 | `secretary_signature_url` | `text` | `NULL` | Ruta en AWS S3 de la firma digitalizada del Secretario(a) Académico(a). |
| 22 | `address` | `character varying(200)` | `NULL` | Dirección física de residencia o ubicación. |
| 23 | `suburb` | `character varying(100)` | `NULL` | Barrio, vereda o corregimiento de ubicación. |
| 24 | `phones` | `character varying(150)` | `NULL` | Números telefónicos de contacto institucional. |
| 25 | `email` | `character varying(180)` | `NULL` | Dirección de correo electrónico de contacto o notificación. |
| 26 | `website` | `character varying(150)` | `NULL` | Dirección del sitio web oficial de la institución educativa. |
| 27 | `logo_url` | `text` | `NULL` | Ruta en AWS S3 del logotipo institucional del colegio. |
| 28 | `shield_url` | `text` | `NULL` | Ruta en AWS S3 del escudo oficial de la institución educativa para boletines Jasper. |
| 29 | `storage_folder` | `character varying(120)` | `NOT NULL` | Nombre único del directorio raíz asignado al colegio dentro del bucket de AWS S3 (ej. pto_beato, asaie_exodo). |
| 30 | `subscription_lock_date` | `date` | `NULL` | Fecha de vencimiento de la suscripción comercial SaaS del colegio. |
| 31 | `settings` | `jsonb` | `NOT NULL` | Objeto JSONB con parámetros adicionales de personalización de la institución educativa. |
| 32 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 33 | `legacy_db_name` | `character varying(60)` | `NULL` | Nombre de la base de datos MySQL original del colegio (usado para trazabilidad y futura migración ETL). |
| 34 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 35 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

### Tabla `user_school_memberships`
- **Descripción:** Membresías multi-colegio y multi-rol que vinculan a un usuario global (users) con uno o varios colegios (schools) y roles específicos (RECTOR, COORDINATOR, TEACHER, STUDENT, FAMILY, STAFF).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_user_school_memberships` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `user_id` | `bigint` | `NOT NULL` | Identificador del usuario global de la comunidad educativa en la tabla users. |
| 4 | `role` | `character varying(30)` | `NOT NULL` | Rol institucional asignado al usuario en el colegio (RECTOR, COORDINATOR, TEACHER, STUDENT, FAMILY, STAFF). |
| 5 | `profile_id` | `smallint` | `NULL` | Referencia opcional al catálogo de perfiles visuales (user_profiles_catalog). |
| 6 | `is_default_school` | `boolean` | `NOT NULL` | Indica si esta institución educativa es el colegio predeterminado al iniciar sesión. |
| 7 | `status` | `character varying(20)` | `NOT NULL` | Estado operativo actual del registro dentro de su flujo de ciclo de vida. |
| 8 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 9 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |
| 10 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `users`
- **Descripción:** Identidad global única de personas de la comunidad educativa (Directivos, Administrativos, Docentes, Estudiantes y Padres/Acudientes) con credenciales scrypt y verificación de correo.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `document_type_id` | `smallint` | `NOT NULL` | Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types). |
| 3 | `document_number` | `character varying(30)` | `NOT NULL` | Número de documento de identidad de la persona sin puntos ni espacios. |
| 4 | `email` | `character varying(255)` | `NULL` | Dirección de correo electrónico de contacto o notificación. |
| 5 | `username` | `character varying(100)` | `NOT NULL` | Nombre de usuario único para autenticación en el portal educativo. |
| 6 | `password_hash` | `character varying(255)` | `NOT NULL` | Hash criptográfico seguro (scrypt + salt) de la contraseña del usuario. |
| 7 | `first_name` | `character varying(80)` | `NOT NULL` | Primer nombre legal de la persona. |
| 8 | `middle_name` | `character varying(80)` | `NULL` | Segundo nombre de la persona (opcional). |
| 9 | `last_name` | `character varying(80)` | `NOT NULL` | Primer apellido legal de la persona. |
| 10 | `second_last_name` | `character varying(80)` | `NULL` | Segundo apellido de la persona (opcional). |
| 11 | `gender_id` | `smallint` | `NULL` | Identificador del género de la persona (referencia a genders). |
| 12 | `birth_date` | `date` | `NULL` | Fecha de nacimiento de la persona. |
| 13 | `phone` | `character varying(40)` | `NULL` | Número telefónico fijo o principal de contacto. |
| 14 | `avatar_url` | `text` | `NULL` | Ruta en AWS S3 de la fotografía de perfil o avatar del usuario. |
| 15 | `security_question` | `character varying(200)` | `NULL` | Pregunta de seguridad opcional configurada por el usuario. |
| 16 | `security_answer_hash` | `character varying(255)` | `NULL` | Hash criptográfico de la respuesta a la pregunta de seguridad. |
| 17 | `email_verified_at` | `timestamp with time zone` | `NULL` | Fecha y hora en que el usuario confirmó su correo electrónico mediante token enviado por Nodemailer. |
| 18 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 19 | `last_login_at` | `timestamp with time zone` | `NULL` | Fecha y hora del último inicio de sesión exitoso del usuario. |
| 20 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 21 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

## Dominio 3: Sedes, Estructura Académica y Configuración Institucional (SIEE)

### Tabla `academic_grading_rules`
- **Descripción:** Reglas institucionales del Sistema Institucional de Evaluación de Estudiantes (SIEE) por año lectivo y grupo de grados (nota mínima aprobatoria, decimales, áreas perdidas, redondeo).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grading_rules` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `grade_group_id` | `bigint` | `NOT NULL` | Identificador de la agrupación o ciclo de grados (referencia a grade_groups). |
| 5 | `decimals_count` | `smallint` | `NOT NULL` | Cantidad de cifras decimales utilizadas para truncar o redondear las calificaciones (0, 1 o 2). |
| 6 | `min_passing_score` | `numeric(6,2)` | `NOT NULL` | Nota mínima requerida para aprobar una asignatura o área según el SIEE del colegio. |
| 7 | `max_recovery_score` | `numeric(6,2)` | `NOT NULL` | Nota máxima reconocible al aprobar una nivelación académica según el SIEE. |
| 8 | `failed_areas_limit` | `smallint` | `NOT NULL` | Número máximo de áreas reprobadas a partir del cual el estudiante reprueba el año lectivo. |
| 9 | `fails_after_recovery` | `boolean` | `NOT NULL` | Indica si se mantiene la reprobación tras no superar el proceso de nivelación. |
| 10 | `promotion_mode` | `smallint` | `NOT NULL` | Modalidad de cálculo de promoción (por asignaturas, por áreas ponderadas o por promedio general). |
| 11 | `uses_weighted_areas` | `boolean` | `NOT NULL` | Indica si el cálculo de áreas utiliza el peso porcentual de cada asignatura. |
| 12 | `absence_fail_percentage` | `numeric(5,2)` | `NOT NULL` | Porcentaje de inasistencias (ej. 25%) a partir del cual se reprueba por fallas. |
| 13 | `rounds_period_score` | `boolean` | `NOT NULL` | Indica si el sistema redondea automáticamente la nota definitiva de cada periodo. |
| 14 | `rounds_final_score` | `boolean` | `NOT NULL` | Indica si el sistema redondea automáticamente el promedio definitivo anual. |
| 15 | `promotion_date` | `date` | `NULL` | Fecha oficial de cierre y expedición del acta de promoción anual. |

### Tabla `academic_periods`
- **Descripción:** Periodos académicos de evaluación del año lectivo con su porcentaje de ponderación y ventanas de fechas para digitación de notas y nivelaciones.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_periods` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `grade_group_id` | `bigint` | `NULL` | Identificador de la agrupación o ciclo de grados (referencia a grade_groups). |
| 4 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 5 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 6 | `name` | `character varying(80)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 7 | `weight_percentage` | `numeric(5,2)` | `NOT NULL` | Porcentaje de ponderación (0.00 a 100.00) que aporta el elemento al cálculo definitivo. |
| 8 | `start_date` | `date` | `NOT NULL` | Fecha de inicio de vigencia del año o periodo académico. |
| 9 | `end_date` | `date` | `NOT NULL` | Fecha de finalización del año o periodo académico. |
| 10 | `grading_open_date` | `date` | `NULL` | Fecha de apertura de plataforma para digitación de calificaciones docentes. |
| 11 | `grading_close_date` | `date` | `NULL` | Fecha límite de cierre de plataforma para digitación de calificaciones ordinarias. |
| 12 | `recovery_open_date` | `date` | `NULL` | Fecha de apertura para registro de calificaciones de nivelación periódica. |
| 13 | `recovery_close_date` | `date` | `NULL` | Fecha límite para cierre de digitación de nivelaciones periódicas. |
| 14 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 15 | `is_closed` | `boolean` | `NOT NULL` | Indica si el año lectivo o periodo académico se encuentra cerrado definitivamente. |

### Tabla `academic_years`
- **Descripción:** Años lectivos por institución educativa con fechas de apertura/cierre y parametrización JSONB de boletines, certificados y actas de grado.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_years` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `year` | `smallint` | `NOT NULL` | Año calendario numérico de cuatro dígitos del año lectivo. |
| 4 | `start_date` | `date` | `NULL` | Fecha de inicio de vigencia del año o periodo académico. |
| 5 | `end_date` | `date` | `NULL` | Fecha de finalización del año o periodo académico. |
| 6 | `online_enrollment_closed_at` | `date` | `NULL` | Fecha de cierre del proceso de prematrícula y renovación de matrícula en línea. |
| 7 | `is_online_enrollment_open` | `boolean` | `NOT NULL` | Indica si el portal de matrículas en línea se encuentra habilitado para padres y estudiantes. |
| 8 | `is_closed` | `boolean` | `NOT NULL` | Indica si el año lectivo o periodo académico se encuentra cerrado definitivamente. |
| 9 | `report_card_settings` | `jsonb` | `NOT NULL` | Configuración JSONB de diseño, firmas, márgenes y opciones de impresión de boletines periódicos. |
| 10 | `certificate_settings` | `jsonb` | `NOT NULL` | Configuración JSONB de encabezados, textos legales y firmas para certificados de estudio. |
| 11 | `graduation_act_settings` | `jsonb` | `NOT NULL` | Configuración JSONB de parámetros para actas de graduación y diplomas. |

### Tabla `campus_education_levels`
- **Descripción:** Niveles educativos autorizados y ofertados específicamente en cada sede del colegio.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_campus_education_levels` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `campus_id` | `bigint` | `NOT NULL` | Identificador de la sede física de la institución educativa (referencia a campuses). |
| 4 | `education_level_id` | `bigint` | `NOT NULL` | Identificador del nivel educativo institucional (referencia a education_levels). |
| 5 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `campus_shifts`
- **Descripción:** Relación muchos-a-muchos que define qué jornadas funcionan en cada sede educativa.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_campus_shifts` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `campus_id` | `bigint` | `NOT NULL` | Identificador de la sede física de la institución educativa (referencia a campuses). |
| 4 | `shift_id` | `bigint` | `NOT NULL` | Identificador de la jornada escolar de la institución (referencia a school_shifts). |
| 5 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `campuses`
- **Descripción:** Sedes físicas o plantas educativas pertenecientes a una institución educativa con su respectivo código DANE consecutivo.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_campuses` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `city_id` | `integer` | `NULL` | Identificador del municipio o ciudad DANE (referencia a cities). |
| 4 | `zone_id` | `smallint` | `NULL` | Identificador de la zona geográfica DANE (Urbana o Rural, referencia a geographical_zones). |
| 5 | `dane_code` | `character varying(30)` | `NULL` | Código oficial asignado por el DANE o SIMAT a la entidad territorial, resguardo, etnia, colegio o sede. |
| 6 | `consecutive_code` | `character varying(20)` | `NULL` | Código consecutivo DANE de 12 dígitos que identifica a la sede educativa. |
| 7 | `name` | `character varying(200)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 8 | `address` | `character varying(200)` | `NULL` | Dirección física de residencia o ubicación. |
| 9 | `phones` | `character varying(100)` | `NULL` | Números telefónicos de contacto institucional. |
| 10 | `email` | `character varying(150)` | `NULL` | Dirección de correo electrónico de contacto o notificación. |
| 11 | `is_main_campus` | `boolean` | `NOT NULL` | Indica si corresponde a la sede principal o rectoría de la institución educativa. |
| 12 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 13 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `education_levels`
- **Descripción:** Niveles educativos ofrecidos por cada institución educativa (Preescolar, Primaria, Secundaria, Media, Ciclos).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_education_levels` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `catalog_level_id` | `smallint` | `NULL` | Referencia al nivel educativo estándar en el catálogo nacional (education_levels_catalog). |
| 4 | `level_code` | `character varying(20)` | `NOT NULL` | Código interno del nivel educativo en la institución. |
| 5 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 6 | `abbreviation` | `character varying(20)` | `NULL` | Abreviatura o sigla corta para visualización en boletines y planillas. |
| 7 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `evaluation_dimension_columns`
- **Descripción:** Subcolumnas estándar parametrizadas dentro de cada dimensión evaluativa institucional.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_evaluation_dimension_columns` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `dimension_id` | `bigint` | `NOT NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 4 | `column_number` | `smallint` | `NOT NULL` | Número secuencial de la columna dentro de la dimensión evaluativa. |
| 5 | `label` | `character varying(100)` | `NOT NULL` | Etiqueta o título corto de la columna evaluativa. |
| 6 | `weight_percentage` | `numeric(5,2)` | `NOT NULL` | Porcentaje de ponderación (0.00 a 100.00) que aporta el elemento al cálculo definitivo. |

### Tabla `evaluation_dimensions`
- **Descripción:** Dimensiones o componentes del proceso evaluativo (ej. Cognitivo/Conceptual, Procedimental, Actitudinal, Evaluación Final) con su peso porcentual.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_evaluation_dimensions` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `grade_group_id` | `bigint` | `NULL` | Identificador de la agrupación o ciclo de grados (referencia a grade_groups). |
| 4 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 5 | `dimension_code` | `smallint` | `NOT NULL` | Código numérico interno de la dimensión evaluativa en el SIEE. |
| 6 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 7 | `abbreviation` | `character varying(20)` | `NULL` | Abreviatura o sigla corta para visualización en boletines y planillas. |
| 8 | `weight_percentage` | `numeric(5,2)` | `NOT NULL` | Porcentaje de ponderación (0.00 a 100.00) que aporta el elemento al cálculo definitivo. |
| 9 | `is_editable` | `boolean` | `NOT NULL` | Indica si los docentes pueden modificar las subcolumnas de esta dimensión. |

### Tabla `grade_groups`
- **Descripción:** Agrupaciones de grados configuradas por el colegio para parametrizar reglas de evaluación, escalas y periodos diferenciados.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_grade_groups` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `catalog_grade_group_id` | `smallint` | `NULL` | Referencia al catálogo nacional de grupos de grados (grade_groups_catalog). |
| 4 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 5 | `is_cycle_end` | `boolean` | `NOT NULL` | Indica si el grupo de grados corresponde a cierre de ciclo educativo. |

### Tabla `grades`
- **Descripción:** Grados académicos activos de la institución educativa vinculados a su nivel educativo y grado de promoción siguiente.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_grades` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `education_level_id` | `bigint` | `NOT NULL` | Identificador del nivel educativo institucional (referencia a education_levels). |
| 4 | `grade_group_id` | `bigint` | `NULL` | Identificador de la agrupación o ciclo de grados (referencia a grade_groups). |
| 5 | `catalog_grade_id` | `smallint` | `NULL` | Referencia al grado equivalente en el catálogo nacional SIMAT (grades_catalog). |
| 6 | `grade_code` | `character varying(10)` | `NOT NULL` | Código oficial SIMAT del grado escolar (ej. -2, -1, 0, 1..11, 21..26). |
| 7 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 8 | `display_order` | `smallint` | `NOT NULL` | Orden numérico secuencial de presentación en interfaces, certificados y boletines. |
| 9 | `next_grade_code` | `character varying(10)` | `NULL` | Código del grado siguiente al cual se promueve automáticamente el estudiante que aprueba. |
| 10 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `grading_scales`
- **Descripción:** Rangos numéricos (nota mínima y máxima) que mapean las calificaciones del colegio a la Escala de Valoración Nacional (Bajo, Básico, Alto, Superior).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_grading_scales` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `grade_group_id` | `bigint` | `NULL` | Identificador de la agrupación o ciclo de grados (referencia a grade_groups). |
| 4 | `national_scale_id` | `smallint` | `NOT NULL` | Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior). |
| 5 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 6 | `min_score` | `numeric(6,2)` | `NOT NULL` | Valor mínimo del rango numérico en la escala de valoración institucional. |
| 7 | `max_score` | `numeric(6,2)` | `NOT NULL` | Valor máximo del rango numérico en la escala de valoración institucional. |
| 8 | `rank_order` | `character varying(5)` | `NULL` | Orden jerárquico del desempeño dentro de la escala de valoración. |

### Tabla `school_shifts`
- **Descripción:** Jornadas académicas configuradas y activas dentro de una institución educativa.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_school_shifts` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `catalog_shift_id` | `smallint` | `NULL` | Referencia a la jornada equivalente en el catálogo nacional (school_shifts_catalog). |
| 4 | `shift_code` | `smallint` | `NOT NULL` | Código numérico SIMAT de la jornada escolar (1=Completa, 2=Mañana, 3=Tarde, 4=Nocturna, 5=Fin de Semana, 6=Única). |
| 5 | `name` | `character varying(80)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 6 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

## Dominio 4: Comunidad Educativa (Docentes, Administrativos, Estudiantes y Familias)

### Tabla `administrative_staff`
- **Descripción:** Ficha laboral de directivos y personal administrativo vinculados a la institución educativa.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_administrative_staff` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `user_id` | `bigint` | `NULL` | Identificador del usuario global de la comunidad educativa en la tabla users. |
| 4 | `document_type_id` | `smallint` | `NULL` | Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types). |
| 5 | `document_number` | `character varying(30)` | `NOT NULL` | Número de documento de identidad de la persona sin puntos ni espacios. |
| 6 | `first_name` | `character varying(80)` | `NOT NULL` | Primer nombre legal de la persona. |
| 7 | `middle_name` | `character varying(80)` | `NULL` | Segundo nombre de la persona (opcional). |
| 8 | `last_name` | `character varying(80)` | `NOT NULL` | Primer apellido legal de la persona. |
| 9 | `second_last_name` | `character varying(80)` | `NULL` | Segundo apellido de la persona (opcional). |
| 10 | `gender_id` | `smallint` | `NULL` | Identificador del género de la persona (referencia a genders). |
| 11 | `birth_date` | `date` | `NULL` | Fecha de nacimiento de la persona. |
| 12 | `phone` | `character varying(50)` | `NULL` | Número telefónico fijo o principal de contacto. |
| 13 | `email` | `character varying(180)` | `NULL` | Dirección de correo electrónico de contacto o notificación. |
| 14 | `hierarchy_level_id` | `smallint` | `NULL` | Identificador del nivel jerárquico administrativo (referencia a hierarchy_levels). |
| 15 | `career_type_id` | `smallint` | `NULL` | Identificador del tipo de carrera administrativa (referencia a administrative_career_types). |
| 16 | `appointment_type_id` | `smallint` | `NULL` | Identificador del tipo de nombramiento o vinculación laboral (referencia a staff_appointment_types). |
| 17 | `workplace_location_id` | `smallint` | `NULL` | Identificador de la ubicación laboral del funcionario (referencia a workplace_locations). |
| 18 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 19 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `family_profiles`
- **Descripción:** Ficha de padres de familia, madres y acudientes con datos de contacto, ocupación y dirección laboral.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_family_profiles` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `user_id` | `bigint` | `NULL` | Identificador del usuario global de la comunidad educativa en la tabla users. |
| 4 | `document_type_id` | `smallint` | `NULL` | Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types). |
| 5 | `document_number` | `character varying(30)` | `NOT NULL` | Número de documento de identidad de la persona sin puntos ni espacios. |
| 6 | `expedition_department_id` | `integer` | `NULL` | Departamento de expedición del documento de identidad (referencia a departments). |
| 7 | `expedition_city_id` | `integer` | `NULL` | Municipio de expedición del documento de identidad (referencia a cities). |
| 8 | `full_name` | `character varying(200)` | `NOT NULL` | Nombre completo concatenado de la persona. |
| 9 | `gender_id` | `smallint` | `NULL` | Identificador del género de la persona (referencia a genders). |
| 10 | `birth_date` | `date` | `NULL` | Fecha de nacimiento de la persona. |
| 11 | `address` | `character varying(200)` | `NULL` | Dirección física de residencia o ubicación. |
| 12 | `work_address` | `character varying(200)` | `NULL` | Dirección física del lugar de trabajo del acudiente. |
| 13 | `phone` | `character varying(50)` | `NULL` | Número telefónico fijo o principal de contacto. |
| 14 | `mobile_phone` | `character varying(50)` | `NULL` | Número de teléfono celular o móvil personal. |
| 15 | `work_phone` | `character varying(50)` | `NULL` | Número telefónico del lugar de trabajo. |
| 16 | `email` | `character varying(180)` | `NULL` | Dirección de correo electrónico de contacto o notificación. |
| 17 | `occupation` | `character varying(150)` | `NULL` | Ocupación, profesión u oficio del padre o acudiente. |
| 18 | `company_name` | `character varying(150)` | `NULL` | Nombre de la empresa o entidad donde labora el acudiente. |
| 19 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 20 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `student_digital_documents`
- **Descripción:** Documentos digitalizados del expediente estudiantil vinculados a objetos en AWS S3 (cloud_files).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_student_digital_documents` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `student_profile_id` | `bigint` | `NOT NULL` | Identificador del perfil socio-demográfico del estudiante (referencia a student_profiles). |
| 4 | `cloud_file_id` | `bigint` | `NULL` | Identificador del archivo almacenado en la tabla cloud_files (AWS S3). |
| 5 | `document_name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo del documento digitalizado del estudiante (ej. Registro Civil, Carnet EPS). |
| 6 | `mime_type` | `character varying(100)` | `NULL` | Tipo de contenido estándar MIME del archivo (ej. application/pdf, image/png). |
| 7 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `student_family_links`
- **Descripción:** Tabla asociativa normalizada (3NF) que vincula a cada estudiante con sus padres y acudientes indicando quién es el acudiente principal y el responsable financiero.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_student_family_links` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `student_profile_id` | `bigint` | `NOT NULL` | Identificador del perfil socio-demográfico del estudiante (referencia a student_profiles). |
| 4 | `family_profile_id` | `bigint` | `NOT NULL` | Identificador de la ficha del padre, madre o acudiente (referencia a family_profiles). |
| 5 | `relationship_type_id` | `smallint` | `NOT NULL` | Identificador del parentesco familiar respecto al estudiante (referencia a family_relationship_types). |
| 6 | `member_type_id` | `smallint` | `NOT NULL` | Identificador del tipo de miembro familiar (referencia a family_member_types). |
| 7 | `is_primary_guardian` | `boolean` | `NOT NULL` | Indica si este familiar es el acudiente principal autorizado ante la institución. |
| 8 | `is_financial_responsible` | `boolean` | `NOT NULL` | Indica si este familiar es el responsable económico y tributario del estudiante. |

### Tabla `student_profiles`
- **Descripción:** Ficha socio-demográfica, médica y de caracterización SIMAT del estudiante (datos personales, EPS, etnia, discapacidad, capacidades excepcionales, víctima del conflicto).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_student_profiles` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `user_id` | `bigint` | `NULL` | Identificador del usuario global de la comunidad educativa en la tabla users. |
| 4 | `document_type_id` | `smallint` | `NULL` | Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types). |
| 5 | `document_number` | `character varying(30)` | `NOT NULL` | Número de documento de identidad de la persona sin puntos ni espacios. |
| 6 | `expedition_country_id` | `integer` | `NULL` | País de expedición del documento de identidad (referencia a countries). |
| 7 | `expedition_department_id` | `integer` | `NULL` | Departamento de expedición del documento de identidad (referencia a departments). |
| 8 | `expedition_city_id` | `integer` | `NULL` | Municipio de expedición del documento de identidad (referencia a cities). |
| 9 | `first_name` | `character varying(80)` | `NOT NULL` | Primer nombre legal de la persona. |
| 10 | `middle_name` | `character varying(80)` | `NULL` | Segundo nombre de la persona (opcional). |
| 11 | `last_name` | `character varying(80)` | `NOT NULL` | Primer apellido legal de la persona. |
| 12 | `second_last_name` | `character varying(80)` | `NULL` | Segundo apellido de la persona (opcional). |
| 13 | `gender_id` | `smallint` | `NULL` | Identificador del género de la persona (referencia a genders). |
| 14 | `birth_date` | `date` | `NULL` | Fecha de nacimiento de la persona. |
| 15 | `birth_country_id` | `integer` | `NULL` | País de nacimiento del estudiante (referencia a countries). |
| 16 | `birth_department_id` | `integer` | `NULL` | Departamento de nacimiento del estudiante (referencia a departments). |
| 17 | `birth_city_id` | `integer` | `NULL` | Municipio o ciudad de nacimiento del estudiante (referencia a cities). |
| 18 | `blood_type` | `character varying(10)` | `NULL` | Grupo sanguíneo y factor RH del estudiante (ej. O+, A+, B-, AB+). |
| 19 | `address` | `character varying(200)` | `NULL` | Dirección física de residencia o ubicación. |
| 20 | `suburb` | `character varying(120)` | `NULL` | Barrio, vereda o corregimiento de ubicación. |
| 21 | `zone_id` | `smallint` | `NULL` | Identificador de la zona geográfica DANE (Urbana o Rural, referencia a geographical_zones). |
| 22 | `locality` | `character varying(120)` | `NULL` | Localidad o comuna de residencia del estudiante. |
| 23 | `socioeconomic_stratum` | `character varying(5)` | `NULL` | Estrato socioeconómico de la vivienda del estudiante (1 a 6). |
| 24 | `sisben_score` | `character varying(20)` | `NULL` | Grupo o puntaje de clasificación en el SISBÉN (ej. A1, B4, C2). |
| 25 | `phone` | `character varying(50)` | `NULL` | Número telefónico fijo o principal de contacto. |
| 26 | `email` | `character varying(180)` | `NULL` | Dirección de correo electrónico de contacto o notificación. |
| 27 | `health_provider_id` | `integer` | `NULL` | Identificador de la EPS a la que se encuentra afiliado el estudiante (referencia a health_providers). |
| 28 | `ips_name` | `character varying(150)` | `NULL` | Nombre de la IPS primaria de atención médica asignada al estudiante. |
| 29 | `ars_name` | `character varying(150)` | `NULL` | Nombre de la Administradora de Régimen Subsidiado (ARS) cuando aplica. |
| 30 | `ethnic_group_id` | `integer` | `NULL` | Identificador de pertenencia étnica del estudiante (referencia a ethnic_groups). |
| 31 | `indigenous_reserve_id` | `integer` | `NULL` | Identificador del resguardo indígena al que pertenece el estudiante (referencia a indigenous_reserves). |
| 32 | `disability_category_id` | `smallint` | `NULL` | Identificador de la categoría de discapacidad del estudiante (referencia a disability_categories). |
| 33 | `disability_type_id` | `smallint` | `NULL` | Identificador del tipo específico de discapacidad según SIMAT (referencia a disability_types). |
| 34 | `exceptional_capability_id` | `smallint` | `NULL` | Identificador de capacidad o talento excepcional según SIMAT (referencia a exceptional_capabilities). |
| 35 | `conflict_victim_type_id` | `smallint` | `NULL` | Identificador de condición de víctima del conflicto armado según SIMAT (referencia a conflict_victim_types). |
| 36 | `expulsion_department_id` | `integer` | `NULL` | Departamento expulsor en caso de desplazamiento forzado (referencia a departments). |
| 37 | `expulsion_city_id` | `integer` | `NULL` | Municipio expulsor en caso de desplazamiento forzado (referencia a cities). |
| 38 | `is_icbf_beneficiary` | `boolean` | `NOT NULL` | Indica si el estudiante ha sido beneficiario de programas del ICBF. |
| 39 | `is_familias_en_accion` | `boolean` | `NOT NULL` | Indica si el núcleo familiar es beneficiario del programa Más Familias en Acción / Renta Ciudadana. |
| 40 | `has_live_together_record` | `boolean` | `NOT NULL` | Indica si el estudiante cuenta con ficha de caracterización sociofamiliar activa. |
| 41 | `photo_url` | `text` | `NULL` | URL de la fotografía del estudiante o candidato almacenada en S3. |
| 42 | `additional_info` | `jsonb` | `NOT NULL` | Objeto JSONB con atributos complementarios de salud, transporte escolar, PAE o inclusión (PIAR). |
| 43 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 44 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 45 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

### Tabla `teacher_profiles`
- **Descripción:** Ficha profesional y laboral de los docentes de cada institución educativa (escalafón, título, área de enseñanza, firma digitalizada).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_teacher_profiles` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `user_id` | `bigint` | `NULL` | Identificador del usuario global de la comunidad educativa en la tabla users. |
| 4 | `document_type_id` | `smallint` | `NULL` | Identificador del tipo de documento de identidad según catálogo SIMAT (referencia a document_types). |
| 5 | `document_number` | `character varying(30)` | `NOT NULL` | Número de documento de identidad de la persona sin puntos ni espacios. |
| 6 | `first_name` | `character varying(80)` | `NOT NULL` | Primer nombre legal de la persona. |
| 7 | `middle_name` | `character varying(80)` | `NULL` | Segundo nombre de la persona (opcional). |
| 8 | `last_name` | `character varying(80)` | `NOT NULL` | Primer apellido legal de la persona. |
| 9 | `second_last_name` | `character varying(80)` | `NULL` | Segundo apellido de la persona (opcional). |
| 10 | `gender_id` | `smallint` | `NULL` | Identificador del género de la persona (referencia a genders). |
| 11 | `birth_date` | `date` | `NULL` | Fecha de nacimiento de la persona. |
| 12 | `address` | `character varying(200)` | `NULL` | Dirección física de residencia o ubicación. |
| 13 | `phone` | `character varying(50)` | `NULL` | Número telefónico fijo o principal de contacto. |
| 14 | `email` | `character varying(180)` | `NULL` | Dirección de correo electrónico de contacto o notificación. |
| 15 | `academic_degree_id` | `smallint` | `NULL` | Identificador del último título académico alcanzado por el docente (referencia a academic_degrees_catalog). |
| 16 | `pay_scale_id` | `smallint` | `NULL` | Identificador del grado en el Escalafón Nacional Docente (referencia a teacher_pay_scales). |
| 17 | `teaching_area_id` | `smallint` | `NULL` | Identificador del área de enseñanza de nombramiento del docente (referencia a teaching_areas). |
| 18 | `technical_area_id` | `smallint` | `NULL` | Identificador del área técnica del docente (referencia a technical_areas). |
| 19 | `appointment_type_id` | `smallint` | `NULL` | Identificador del tipo de nombramiento o vinculación laboral (referencia a staff_appointment_types). |
| 20 | `position_id` | `smallint` | `NULL` | Identificador del cargo desempeñado por el funcionario (referencia a staff_positions). |
| 21 | `workplace_location_id` | `smallint` | `NULL` | Identificador de la ubicación laboral del funcionario (referencia a workplace_locations). |
| 22 | `signature_url` | `text` | `NULL` | Ruta en AWS S3 de la firma digitalizada del docente para boletines y observador. |
| 23 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 24 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

## Dominio 5: Grupos, Áreas, Asignaturas, Plan de Estudios y Carga Académica

### Tabla `academic_areas`
- **Descripción:** Áreas curriculares fundamentales y optativas configuradas por cada institución educativa según la Ley 115.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_areas` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `name` | `character varying(200)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `abbreviation` | `character varying(30)` | `NULL` | Abreviatura o sigla corta para visualización en boletines y planillas. |
| 5 | `fails_school_year` | `boolean` | `NOT NULL` | Indica si la pérdida de esta área curricular incide directamente en la reprobación del año escolar. |
| 6 | `display_order` | `smallint` | `NOT NULL` | Orden numérico secuencial de presentación en interfaces, certificados y boletines. |
| 7 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 8 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `academic_groups`
- **Descripción:** Grupos o cursos escolares por año lectivo, sede, jornada y grado (ej. 6°01, 11°A) con su director de grupo asignado.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_groups` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `campus_id` | `bigint` | `NOT NULL` | Identificador de la sede física de la institución educativa (referencia a campuses). |
| 4 | `shift_id` | `bigint` | `NOT NULL` | Identificador de la jornada escolar de la institución (referencia a school_shifts). |
| 5 | `grade_id` | `bigint` | `NOT NULL` | Identificador del grado académico de la institución (referencia a grades). |
| 6 | `homeroom_teacher_id` | `bigint` | `NULL` | Identificador del docente director de grupo (referencia a teacher_profiles). |
| 7 | `study_methodology_id` | `smallint` | `NULL` | Identificador de la metodología educativa SIMAT aplicada (referencia a study_methodologies). |
| 8 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 9 | `group_code` | `character varying(10)` | `NOT NULL` | Código identificador del grupo dentro del grado (ej. 01, 02, A, B). |
| 10 | `name` | `character varying(80)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 11 | `max_capacity` | `smallint` | `NOT NULL` | Cupo máximo de estudiantes permitidos en el salón o grupo académico. |
| 12 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `achievement_standards`
- **Descripción:** Banco normalizado de logros, indicadores de desempeño, competencias y estándares básicos por grado, asignatura y periodo (reemplaza las 20 columnas repetitivas l1..l20).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_achievement_standards` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `grade_id` | `bigint` | `NOT NULL` | Identificador del grado académico de la institución (referencia a grades). |
| 4 | `subject_id` | `bigint` | `NOT NULL` | Identificador de la asignatura académica institucional (referencia a subjects). |
| 5 | `dimension_id` | `bigint` | `NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 6 | `national_scale_id` | `smallint` | `NULL` | Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior). |
| 7 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 8 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 9 | `code` | `character varying(20)` | `NULL` | Código alfanumérico corto estandarizado del registro. |
| 10 | `indicator_type` | `character varying(30)` | `NOT NULL` | Tipo de indicador pedagógico (LOGRO, FORTALEZA, DIFICULTAD, RECOMENDACION, COMPETENCIA). |
| 11 | `description` | `text` | `NOT NULL` | Descripción detallada del registro o elemento. |
| 12 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 13 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `course_assignments`
- **Descripción:** Carga académica docente que asigna un profesor específico para dictar una asignatura en un grupo, grado, sede y jornada durante el año lectivo.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_course_assignments` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `campus_id` | `bigint` | `NOT NULL` | Identificador de la sede física de la institución educativa (referencia a campuses). |
| 4 | `shift_id` | `bigint` | `NOT NULL` | Identificador de la jornada escolar de la institución (referencia a school_shifts). |
| 5 | `grade_id` | `bigint` | `NOT NULL` | Identificador del grado académico de la institución (referencia a grades). |
| 6 | `academic_group_id` | `bigint` | `NOT NULL` | Identificador del grupo o salón de clases activo (referencia a academic_groups). |
| 7 | `subject_id` | `bigint` | `NOT NULL` | Identificador de la asignatura académica institucional (referencia a subjects). |
| 8 | `teacher_profile_id` | `bigint` | `NOT NULL` | Identificador del perfil profesional del docente (referencia a teacher_profiles). |
| 9 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 10 | `weekly_hours` | `smallint` | `NOT NULL` | Intensidad horaria semanal (IHS) en horas de clase asignadas a la asignatura. |
| 11 | `area_weight_percentage` | `numeric(5,2)` | `NOT NULL` | Porcentaje de peso que tiene la asignatura dentro del promedio ponderado de su área curricular. |
| 12 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 13 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `curriculum_study_plans`
- **Descripción:** Plan de estudios institucional (pensum) que define la intensidad horaria semanal y el peso porcentual de cada asignatura dentro de su área por grado y año lectivo.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_curriculum_study_plans` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `campus_id` | `bigint` | `NULL` | Identificador de la sede física de la institución educativa (referencia a campuses). |
| 4 | `grade_id` | `bigint` | `NOT NULL` | Identificador del grado académico de la institución (referencia a grades). |
| 5 | `subject_id` | `bigint` | `NOT NULL` | Identificador de la asignatura académica institucional (referencia a subjects). |
| 6 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 7 | `weekly_hours` | `smallint` | `NOT NULL` | Intensidad horaria semanal (IHS) en horas de clase asignadas a la asignatura. |
| 8 | `area_weight_percentage` | `numeric(5,2)` | `NOT NULL` | Porcentaje de peso que tiene la asignatura dentro del promedio ponderado de su área curricular. |
| 9 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `lesson_plan_units`
- **Descripción:** Unidades temáticas, actividades pedagógicas y estrategias de evaluación detalladas dentro de un planeador docente.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_lesson_plan_units` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `lesson_plan_id` | `bigint` | `NOT NULL` | Identificador del planeador docente padre (referencia a lesson_plans). |
| 4 | `unit_number` | `smallint` | `NOT NULL` | Número secuencial de la unidad temática dentro del planeador. |
| 5 | `topic_title` | `character varying(250)` | `NOT NULL` | Título del eje temático o unidad de aprendizaje. |
| 6 | `content_description` | `text` | `NULL` | Descripción de los contenidos temáticos a desarrollar en la unidad. |
| 7 | `pedagogical_activities` | `text` | `NULL` | Actividades pedagógicas y didácticas planeadas para el desarrollo de la unidad. |
| 8 | `evaluation_strategy` | `text` | `NULL` | Estrategias e instrumentos de evaluación formativa y sumativa de la unidad. |
| 9 | `planned_hours` | `smallint` | `NULL` | Cantidad de horas de clase estimadas para cubrir la unidad temática. |
| 10 | `execution_date` | `date` | `NULL` | Fecha programada para la ejecución de la unidad temática. |

### Tabla `lesson_plans`
- **Descripción:** Planeadores de área y asignatura elaborados por los docentes por periodo académico.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_lesson_plans` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 4 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 5 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 6 | `title` | `character varying(250)` | `NOT NULL` | Título principal de la actividad, evaluación, documento o circular. |
| 7 | `general_objective` | `text` | `NULL` | Objetivo general de aprendizaje formulado en el planeador del periodo. |
| 8 | `methodology_notes` | `text` | `NULL` | Descripción de la metodología didáctica general del planeador. |
| 9 | `bibliography` | `text` | `NULL` | Fuentes bibliográficas y recursos digitales de apoyo del planeador. |
| 10 | `observations` | `text` | `NULL` | Observaciones adicionales o notas aclaratorias del registro. |
| 11 | `status` | `smallint` | `NOT NULL` | Estado operativo actual del registro dentro de su flujo de ciclo de vida. |
| 12 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `subjects`
- **Descripción:** Asignaturas académicas pertenecientes a un área curricular de la institución educativa.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_subjects` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_area_id` | `bigint` | `NOT NULL` | Identificador del área curricular institucional (referencia a academic_areas). |
| 4 | `bank_subject_id` | `integer` | `NULL` | Referencia opcional a la asignatura estándar en el banco nacional (subjects_bank). |
| 5 | `name` | `character varying(200)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 6 | `abbreviation` | `character varying(30)` | `NULL` | Abreviatura o sigla corta para visualización en boletines y planillas. |
| 7 | `is_elective` | `boolean` | `NOT NULL` | Indica si la asignatura es de carácter optativo o profundización. |
| 8 | `display_order` | `smallint` | `NOT NULL` | Orden numérico secuencial de presentación en interfaces, certificados y boletines. |
| 9 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 10 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `teacher_gradebook_columns`
- **Descripción:** Columnas de actividades evaluativas creadas por el docente en su planilla de calificaciones para cada dimensión y periodo.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_teacher_gradebook_columns` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 4 | `dimension_id` | `bigint` | `NOT NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 5 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 6 | `column_number` | `smallint` | `NOT NULL` | Número secuencial de la columna dentro de la dimensión evaluativa. |
| 7 | `description` | `character varying(200)` | `NOT NULL` | Descripción detallada del registro o elemento. |
| 8 | `weight_percentage` | `numeric(5,2)` | `NOT NULL` | Porcentaje de ponderación (0.00 a 100.00) que aporta el elemento al cálculo definitivo. |
| 9 | `activity_date` | `date` | `NULL` | Fecha en que se realizó o evaluó la actividad registrada en la columna de planilla. |

## Dominio 6: Matrículas SIMAT, Novedades y Promoción Escolar

### Tabla `enrollment_novelties`
- **Descripción:** Historial de novedades de matrícula del estudiante (retiros, traslados, deserciones, cambios de estado SIMAT).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_enrollment_novelties` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 4 | `enrollment_status_id` | `smallint` | `NOT NULL` | Identificador del estado de matrícula SIMAT (referencia a enrollment_statuses). |
| 5 | `novelty_date` | `date` | `NOT NULL` | Fecha efectiva en que se produjo la novedad de matrícula (retiro, traslado, deserción). |
| 6 | `reason` | `text` | `NOT NULL` | Motivo detallado de la novedad de matrícula registrada. |
| 7 | `created_by_user_id` | `bigint` | `NULL` | Identificador del usuario que creó originalmente el registro. |
| 8 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `promotion_records`
- **Descripción:** Acta consolidada de promoción final y graduación del estudiante al cierre del año lectivo (promedio final, áreas perdidas, puesto, diploma y folio de grado).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_promotion_records` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 4 | `promotion_status_id` | `smallint` | `NOT NULL` | Identificador del estado de promoción final (referencia a promotion_statuses_catalog). |
| 5 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 6 | `act_number` | `character varying(30)` | `NULL` | Número consecutivo del acta oficial de nivelación o de promoción/graduación. |
| 7 | `final_average` | `numeric(6,2)` | `NOT NULL` | Promedio numérico general obtenido por el estudiante al finalizar el año lectivo. |
| 8 | `failed_areas_count` | `smallint` | `NOT NULL` | Cantidad total de áreas curriculares reprobadas al cierre del año escolar. |
| 9 | `failed_subjects_count` | `smallint` | `NOT NULL` | Cantidad total de asignaturas reprobadas en el periodo o año lectivo. |
| 10 | `total_absences` | `integer` | `NOT NULL` | Sumatoria total de inasistencias acumuladas durante el año lectivo. |
| 11 | `group_rank` | `smallint` | `NULL` | Puesto ocupado por el estudiante dentro de su grupo académico según su promedio. |
| 12 | `is_graduated` | `boolean` | `NOT NULL` | Indica si el estudiante obtuvo título de graduación en cierre de ciclo. |
| 13 | `diploma_number` | `character varying(50)` | `NULL` | Número de registro del diploma de bachiller o certificado de grado. |
| 14 | `graduation_folio` | `character varying(50)` | `NULL` | Número de folio del libro oficial de actas de grado donde quedó registrado. |
| 15 | `observations` | `text` | `NULL` | Observaciones adicionales o notas aclaratorias del registro. |
| 16 | `promoted_at` | `date` | `NULL` | Fecha oficial en que se asentó la decisión de promoción escolar. |

### Tabla `student_enrollments`
- **Descripción:** Matrícula académica anual del estudiante en una sede, jornada, grado y grupo, incluyendo número de matrícula, folio, estado SIMAT y condición de repitencia.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_student_enrollments` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `student_profile_id` | `bigint` | `NOT NULL` | Identificador del perfil socio-demográfico del estudiante (referencia a student_profiles). |
| 4 | `campus_id` | `bigint` | `NOT NULL` | Identificador de la sede física de la institución educativa (referencia a campuses). |
| 5 | `shift_id` | `bigint` | `NOT NULL` | Identificador de la jornada escolar de la institución (referencia a school_shifts). |
| 6 | `grade_id` | `bigint` | `NOT NULL` | Identificador del grado académico de la institución (referencia a grades). |
| 7 | `academic_group_id` | `bigint` | `NOT NULL` | Identificador del grupo o salón de clases activo (referencia a academic_groups). |
| 8 | `study_methodology_id` | `smallint` | `NULL` | Identificador de la metodología educativa SIMAT aplicada (referencia a study_methodologies). |
| 9 | `character_id` | `smallint` | `NULL` | Identificador del carácter de educación media (Académico o Técnico). |
| 10 | `specialty_id` | `smallint` | `NULL` | Identificador de la especialidad académica o técnica de la matrícula (referencia a academic_specialties). |
| 11 | `enrollment_status_id` | `smallint` | `NOT NULL` | Identificador del estado de matrícula SIMAT (referencia a enrollment_statuses). |
| 12 | `promotion_status_id` | `smallint` | `NULL` | Identificador del estado de promoción final (referencia a promotion_statuses_catalog). |
| 13 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 14 | `registration_number` | `character varying(40)` | `NULL` | Número oficial de matrícula o código de inscripción asignado al estudiante. |
| 15 | `folio_number` | `character varying(40)` | `NULL` | Número de folio del libro oficial de matrículas donde reposa el registro. |
| 16 | `enrollment_date` | `date` | `NOT NULL` | Fecha oficial en que se formalizó la matrícula del estudiante para el año lectivo. |
| 17 | `withdrawal_date` | `date` | `NULL` | Fecha de retiro o cancelación de matrícula cuando el estudiante deja la institución. |
| 18 | `is_repeating_grade` | `boolean` | `NOT NULL` | Indica si el estudiante se encuentra repitiendo el grado actual. |
| 19 | `is_new_student` | `boolean` | `NOT NULL` | Indica si el estudiante ingresa por primera vez a la institución educativa. |
| 20 | `is_subsidized` | `boolean` | `NOT NULL` | Indica si el cupo escolar del estudiante es financiado o subsidiado por el Estado. |
| 21 | `previous_school_name` | `character varying(200)` | `NULL` | Nombre del establecimiento educativo de procedencia del estudiante. |
| 22 | `observations` | `text` | `NULL` | Observaciones adicionales o notas aclaratorias del registro. |
| 23 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 24 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

## Dominio 7: Calificaciones Periódicas, Nivelaciones, Puestos y Asistencia (Particionado)

### Tabla `academic_area_period_results`
- **Descripción:** Consolidado de notas definitivas ponderadas por área curricular en cada periodo académico.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_area_period_results` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `academic_area_id` | `bigint` | `NOT NULL` | Identificador del área curricular institucional (referencia a academic_areas). |
| 6 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 7 | `weighted_score` | `numeric(6,2)` | `NOT NULL` | Calificación promedio ponderada obtenida en el área curricular durante el periodo. |
| 8 | `recovery_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en el proceso de nivelación o superación académica. |
| 9 | `national_scale_id` | `smallint` | `NULL` | Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior). |
| 10 | `is_failed` | `boolean` | `NOT NULL` | Indica si el resultado consolidado del área se encuentra reprobado en el periodo. |

### Tabla `academic_grade_achievements`
- **Descripción:** Tabla asociativa en 3NF que vincula los logros e indicadores alcanzados por el estudiante en cada calificación periódica.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grade_achievements` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `academic_grade_id` | `bigint` | `NOT NULL` | Identificador del registro padre de calificación periódica (referencia a academic_grades). |
| 5 | `achievement_standard_id` | `bigint` | `NOT NULL` | Identificador del logro o indicador de desempeño asignado (referencia a achievement_standards). |

### Tabla `academic_grade_audit_logs`
- **Descripción:** Trazabilidad de auditoría de modificaciones de notas periódicas (valor anterior, valor nuevo, usuario responsable y motivo).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grade_audit_logs` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 6 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 7 | `previous_score` | `numeric(6,2)` | `NULL` | Calificación anterior antes de aplicar la modificación o nivelación. |
| 8 | `new_score` | `numeric(6,2)` | `NULL` | Nueva calificación registrada tras la modificación en planilla. |
| 9 | `changed_by_user_id` | `bigint` | `NULL` | Identificador del usuario que ejecutó el cambio de nota auditado. |
| 10 | `change_reason` | `character varying(250)` | `NULL` | Justificación o motivo registrado para la modificación de la calificación. |
| 11 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `academic_grade_items`
- **Descripción:** Tabla maestra particionada en 3NF que almacena cada nota parcial individual de una calificación periódica (reemplaza las 30 columnas repetitivas n1..n30).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grade_items` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `academic_grade_id` | `bigint` | `NOT NULL` | Identificador del registro padre de calificación periódica (referencia a academic_grades). |
| 5 | `dimension_id` | `bigint` | `NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 6 | `gradebook_column_id` | `bigint` | `NULL` | Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns). |
| 7 | `item_number` | `smallint` | `NOT NULL` | Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30). |
| 8 | `score` | `numeric(6,2)` | `NOT NULL` | Valor numérico de la calificación obtenida. |
| 9 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `academic_grade_items_2025`
- **Descripción:** Partición física de notas parciales individuales correspondiente al año lectivo 2025.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grade_items_2025` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `academic_grade_id` | `bigint` | `NOT NULL` | Identificador del registro padre de calificación periódica (referencia a academic_grades). |
| 5 | `dimension_id` | `bigint` | `NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 6 | `gradebook_column_id` | `bigint` | `NULL` | Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns). |
| 7 | `item_number` | `smallint` | `NOT NULL` | Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30). |
| 8 | `score` | `numeric(6,2)` | `NOT NULL` | Valor numérico de la calificación obtenida. |
| 9 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `academic_grade_items_2026`
- **Descripción:** Partición física de notas parciales individuales correspondiente al año lectivo 2026.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grade_items_2026` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `academic_grade_id` | `bigint` | `NOT NULL` | Identificador del registro padre de calificación periódica (referencia a academic_grades). |
| 5 | `dimension_id` | `bigint` | `NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 6 | `gradebook_column_id` | `bigint` | `NULL` | Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns). |
| 7 | `item_number` | `smallint` | `NOT NULL` | Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30). |
| 8 | `score` | `numeric(6,2)` | `NOT NULL` | Valor numérico de la calificación obtenida. |
| 9 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `academic_grade_items_2027`
- **Descripción:** Partición física de notas parciales individuales correspondiente al año lectivo 2027.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grade_items_2027` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `academic_grade_id` | `bigint` | `NOT NULL` | Identificador del registro padre de calificación periódica (referencia a academic_grades). |
| 5 | `dimension_id` | `bigint` | `NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 6 | `gradebook_column_id` | `bigint` | `NULL` | Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns). |
| 7 | `item_number` | `smallint` | `NOT NULL` | Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30). |
| 8 | `score` | `numeric(6,2)` | `NOT NULL` | Valor numérico de la calificación obtenida. |
| 9 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `academic_grade_items_historic`
- **Descripción:** Partición por defecto para notas parciales individuales de años lectivos históricos.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grade_items_historic` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `academic_grade_id` | `bigint` | `NOT NULL` | Identificador del registro padre de calificación periódica (referencia a academic_grades). |
| 5 | `dimension_id` | `bigint` | `NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 6 | `gradebook_column_id` | `bigint` | `NULL` | Identificador de la columna de actividad en la planilla docente (referencia a teacher_gradebook_columns). |
| 7 | `item_number` | `smallint` | `NOT NULL` | Número secuencial del ítem o casilla de nota parcial dentro del periodo (1..30). |
| 8 | `score` | `numeric(6,2)` | `NOT NULL` | Valor numérico de la calificación obtenida. |
| 9 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `academic_grades`
- **Descripción:** Tabla maestra particionada por año lectivo que consolida las calificaciones periódicas por matrícula, carga académica y periodo (unifica nscp00..003 eliminando columnas repetitivas).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grades` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 6 | `period_id` | `bigint` | `NOT NULL` | Identificador del periodo académico institucional (referencia a academic_periods). |
| 7 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 8 | `conceptual_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión conceptual o cognitiva del periodo. |
| 9 | `procedural_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión procedimental o práxica del periodo. |
| 10 | `attitudinal_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión actitudinal o axiológica del periodo. |
| 11 | `evaluation_exam_score` | `numeric(6,2)` | `NOT NULL` | Nota obtenida en la evaluación periódica o examen acumulativo. |
| 12 | `final_score` | `numeric(6,2)` | `NOT NULL` | Calificación definitiva calculada para la asignatura en el periodo académico. |
| 13 | `recovery_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en el proceso de nivelación o superación académica. |
| 14 | `leveling_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en actividades de nivelación o habilitación extraordinaria. |
| 15 | `national_scale_id` | `smallint` | `NULL` | Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior). |
| 16 | `justified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias con excusa justificada registradas en el periodo. |
| 17 | `unjustified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias sin excusa justificada registradas en el periodo. |
| 18 | `late_arrivals` | `smallint` | `NOT NULL` | Cantidad de llegadas tarde o retardos registrados en el periodo. |
| 19 | `teacher_observations` | `text` | `NULL` | Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo. |
| 20 | `is_locked` | `boolean` | `NOT NULL` | Indica si la calificación se encuentra bloqueada por cierre de periodo académico. |
| 21 | `updated_by_user_id` | `bigint` | `NULL` | Identificador del usuario que realizó la última modificación del registro. |
| 22 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 23 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

### Tabla `academic_grades_2025`
- **Descripción:** Partición física de calificaciones periódicas correspondiente al año lectivo 2025.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grades_2025` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 6 | `period_id` | `bigint` | `NOT NULL` | Identificador del periodo académico institucional (referencia a academic_periods). |
| 7 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 8 | `conceptual_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión conceptual o cognitiva del periodo. |
| 9 | `procedural_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión procedimental o práxica del periodo. |
| 10 | `attitudinal_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión actitudinal o axiológica del periodo. |
| 11 | `evaluation_exam_score` | `numeric(6,2)` | `NOT NULL` | Nota obtenida en la evaluación periódica o examen acumulativo. |
| 12 | `final_score` | `numeric(6,2)` | `NOT NULL` | Calificación definitiva calculada para la asignatura en el periodo académico. |
| 13 | `recovery_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en el proceso de nivelación o superación académica. |
| 14 | `leveling_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en actividades de nivelación o habilitación extraordinaria. |
| 15 | `national_scale_id` | `smallint` | `NULL` | Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior). |
| 16 | `justified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias con excusa justificada registradas en el periodo. |
| 17 | `unjustified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias sin excusa justificada registradas en el periodo. |
| 18 | `late_arrivals` | `smallint` | `NOT NULL` | Cantidad de llegadas tarde o retardos registrados en el periodo. |
| 19 | `teacher_observations` | `text` | `NULL` | Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo. |
| 20 | `is_locked` | `boolean` | `NOT NULL` | Indica si la calificación se encuentra bloqueada por cierre de periodo académico. |
| 21 | `updated_by_user_id` | `bigint` | `NULL` | Identificador del usuario que realizó la última modificación del registro. |
| 22 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 23 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

### Tabla `academic_grades_2026`
- **Descripción:** Partición física de calificaciones periódicas correspondiente al año lectivo 2026.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grades_2026` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 6 | `period_id` | `bigint` | `NOT NULL` | Identificador del periodo académico institucional (referencia a academic_periods). |
| 7 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 8 | `conceptual_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión conceptual o cognitiva del periodo. |
| 9 | `procedural_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión procedimental o práxica del periodo. |
| 10 | `attitudinal_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión actitudinal o axiológica del periodo. |
| 11 | `evaluation_exam_score` | `numeric(6,2)` | `NOT NULL` | Nota obtenida en la evaluación periódica o examen acumulativo. |
| 12 | `final_score` | `numeric(6,2)` | `NOT NULL` | Calificación definitiva calculada para la asignatura en el periodo académico. |
| 13 | `recovery_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en el proceso de nivelación o superación académica. |
| 14 | `leveling_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en actividades de nivelación o habilitación extraordinaria. |
| 15 | `national_scale_id` | `smallint` | `NULL` | Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior). |
| 16 | `justified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias con excusa justificada registradas en el periodo. |
| 17 | `unjustified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias sin excusa justificada registradas en el periodo. |
| 18 | `late_arrivals` | `smallint` | `NOT NULL` | Cantidad de llegadas tarde o retardos registrados en el periodo. |
| 19 | `teacher_observations` | `text` | `NULL` | Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo. |
| 20 | `is_locked` | `boolean` | `NOT NULL` | Indica si la calificación se encuentra bloqueada por cierre de periodo académico. |
| 21 | `updated_by_user_id` | `bigint` | `NULL` | Identificador del usuario que realizó la última modificación del registro. |
| 22 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 23 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

### Tabla `academic_grades_2027`
- **Descripción:** Partición física de calificaciones periódicas correspondiente al año lectivo 2027.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grades_2027` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 6 | `period_id` | `bigint` | `NOT NULL` | Identificador del periodo académico institucional (referencia a academic_periods). |
| 7 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 8 | `conceptual_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión conceptual o cognitiva del periodo. |
| 9 | `procedural_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión procedimental o práxica del periodo. |
| 10 | `attitudinal_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión actitudinal o axiológica del periodo. |
| 11 | `evaluation_exam_score` | `numeric(6,2)` | `NOT NULL` | Nota obtenida en la evaluación periódica o examen acumulativo. |
| 12 | `final_score` | `numeric(6,2)` | `NOT NULL` | Calificación definitiva calculada para la asignatura en el periodo académico. |
| 13 | `recovery_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en el proceso de nivelación o superación académica. |
| 14 | `leveling_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en actividades de nivelación o habilitación extraordinaria. |
| 15 | `national_scale_id` | `smallint` | `NULL` | Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior). |
| 16 | `justified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias con excusa justificada registradas en el periodo. |
| 17 | `unjustified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias sin excusa justificada registradas en el periodo. |
| 18 | `late_arrivals` | `smallint` | `NOT NULL` | Cantidad de llegadas tarde o retardos registrados en el periodo. |
| 19 | `teacher_observations` | `text` | `NULL` | Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo. |
| 20 | `is_locked` | `boolean` | `NOT NULL` | Indica si la calificación se encuentra bloqueada por cierre de periodo académico. |
| 21 | `updated_by_user_id` | `bigint` | `NULL` | Identificador del usuario que realizó la última modificación del registro. |
| 22 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 23 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

### Tabla `academic_grades_historic`
- **Descripción:** Partición por defecto para calificaciones periódicas de años lectivos históricos o futuros adicionales.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_grades_historic` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 6 | `period_id` | `bigint` | `NOT NULL` | Identificador del periodo académico institucional (referencia a academic_periods). |
| 7 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 8 | `conceptual_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión conceptual o cognitiva del periodo. |
| 9 | `procedural_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión procedimental o práxica del periodo. |
| 10 | `attitudinal_score` | `numeric(6,2)` | `NOT NULL` | Nota acumulada en la dimensión actitudinal o axiológica del periodo. |
| 11 | `evaluation_exam_score` | `numeric(6,2)` | `NOT NULL` | Nota obtenida en la evaluación periódica o examen acumulativo. |
| 12 | `final_score` | `numeric(6,2)` | `NOT NULL` | Calificación definitiva calculada para la asignatura en el periodo académico. |
| 13 | `recovery_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en el proceso de nivelación o superación académica. |
| 14 | `leveling_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en actividades de nivelación o habilitación extraordinaria. |
| 15 | `national_scale_id` | `smallint` | `NULL` | Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior). |
| 16 | `justified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias con excusa justificada registradas en el periodo. |
| 17 | `unjustified_absences` | `smallint` | `NOT NULL` | Cantidad de inasistencias sin excusa justificada registradas en el periodo. |
| 18 | `late_arrivals` | `smallint` | `NOT NULL` | Cantidad de llegadas tarde o retardos registrados en el periodo. |
| 19 | `teacher_observations` | `text` | `NULL` | Observaciones pedagógicas redactadas por el docente titular en el boletín del periodo. |
| 20 | `is_locked` | `boolean` | `NOT NULL` | Indica si la calificación se encuentra bloqueada por cierre de periodo académico. |
| 21 | `updated_by_user_id` | `bigint` | `NULL` | Identificador del usuario que realizó la última modificación del registro. |
| 22 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |
| 23 | `updated_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de la última actualización del registro. |

### Tabla `academic_pre_reports`
- **Descripción:** Preinformes académicos periódicos de alerta temprana para padres de familia sobre estudiantes con riesgo de pérdida académica.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_academic_pre_reports` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 6 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 7 | `partial_score` | `numeric(6,2)` | `NOT NULL` | Nota parcial acumulada al momento del corte de preinforme académico. |
| 8 | `national_scale_id` | `smallint` | `NULL` | Identificador del desempeño en la Escala de Valoración Nacional Decreto 1290 (1=Bajo, 2=Básico, 3=Alto, 4=Superior). |
| 9 | `observations` | `text` | `NULL` | Observaciones adicionales o notas aclaratorias del registro. |
| 10 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `period_recovery_records`
- **Descripción:** Actas de nivelación, superación y recuperación periódica o final presentadas por los estudiantes.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_period_recovery_records` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 6 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 7 | `act_number` | `character varying(30)` | `NULL` | Número consecutivo del acta oficial de nivelación o de promoción/graduación. |
| 8 | `previous_score` | `numeric(6,2)` | `NOT NULL` | Calificación anterior antes de aplicar la modificación o nivelación. |
| 9 | `recovery_score` | `numeric(6,2)` | `NOT NULL` | Calificación obtenida en el proceso de nivelación o superación académica. |
| 10 | `recovery_type` | `character varying(30)` | `NOT NULL` | Tipo de nivelación realizada (PERIODICA, FINAL_ANUAL, EXTRAORDINARIA). |
| 11 | `recovery_date` | `date` | `NOT NULL` | Fecha en que se llevó a cabo la prueba o sustentación de nivelación. |
| 12 | `observations` | `text` | `NULL` | Observaciones adicionales o notas aclaratorias del registro. |

### Tabla `student_absences`
- **Descripción:** Registro diario de inasistencias justificadas e injustificadas y retardos del estudiante por asignatura.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_student_absences` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 4 | `course_assignment_id` | `bigint` | `NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 5 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 6 | `absence_date` | `date` | `NOT NULL` | Fecha calendario en que se presentó la inasistencia del estudiante. |
| 7 | `hours_missed` | `smallint` | `NOT NULL` | Cantidad de horas de clase no asistidas en la fecha registrada. |
| 8 | `is_justified` | `boolean` | `NOT NULL` | Indica si la inasistencia cuenta con soporte o excusa médica/familiar válida. |
| 9 | `justification_notes` | `text` | `NULL` | Detalle de la excusa o soporte presentado para justificar la inasistencia. |
| 10 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `student_period_rankings`
- **Descripción:** Promedio académico, puesto en el grupo, puesto en el grado y cuadro de honor del estudiante por periodo.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_student_period_rankings` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `academic_group_id` | `bigint` | `NOT NULL` | Identificador del grupo o salón de clases activo (referencia a academic_groups). |
| 6 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 7 | `average_score` | `numeric(6,2)` | `NOT NULL` | Promedio numérico ponderado de todas las asignaturas cursadas por el estudiante en el periodo. |
| 8 | `group_rank` | `smallint` | `NOT NULL` | Puesto ocupado por el estudiante dentro de su grupo académico según su promedio. |
| 9 | `grade_rank` | `smallint` | `NULL` | Puesto ocupado por el estudiante entre todos los grupos de su mismo grado. |
| 10 | `failed_subjects_count` | `smallint` | `NOT NULL` | Cantidad total de asignaturas reprobadas en el periodo o año lectivo. |
| 11 | `is_honor_roll` | `boolean` | `NOT NULL` | Indica si el estudiante fue exaltado en el Cuadro de Honor del periodo. |

## Dominio 8: Observador del Estudiante y Convivencia Escolar

### Tabla `observer_annotations`
- **Descripción:** Anotaciones periódicas de seguimiento académico y de convivencia escolar (situaciones Tipo I, II o III, descargos del estudiante y compromisos pedagógicos).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_observer_annotations` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `student_observer_id` | `bigint` | `NOT NULL` | Identificador de la ficha anual del Observador del Estudiante (referencia a student_observers). |
| 4 | `section_id` | `bigint` | `NULL` | Identificador de la sección de la plantilla del observador (referencia a observer_template_sections). |
| 5 | `created_by_user_id` | `bigint` | `NOT NULL` | Identificador del usuario que creó originalmente el registro. |
| 6 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 7 | `annotation_type` | `character varying(40)` | `NOT NULL` | Tipo de anotación registrada en el observador (ACADEMICA, CONVIVENCIA, FELICITACION, ORIENTACION). |
| 8 | `severity_level` | `character varying(20)` | `NOT NULL` | Clasificación de la situación según Ley 1620 de Convivencia Escolar (LEVE, TIPO_I, TIPO_II, TIPO_III). |
| 9 | `situation_description` | `text` | `NOT NULL` | Descripción objetiva de los hechos o situación académica/convivencial registrada. |
| 10 | `student_version` | `text` | `NULL` | Versión libre o descargos presentados por el estudiante frente a la situación. |
| 11 | `pedagogical_commitment` | `text` | `NULL` | Compromiso pedagógico o formativo acordado por el estudiante y su acudiente. |
| 12 | `guardian_notified` | `boolean` | `NOT NULL` | Indica si el padre de familia o acudiente fue notificado de la anotación. |
| 13 | `annotation_date` | `date` | `NOT NULL` | Fecha en que ocurrió la situación registrada en el observador. |
| 14 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `observer_criteria`
- **Descripción:** Criterios e ítems de valoración definidos dentro de cada sección del Observador del Estudiante.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_observer_criteria` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `section_id` | `bigint` | `NOT NULL` | Identificador de la sección de la plantilla del observador (referencia a observer_template_sections). |
| 4 | `description` | `text` | `NOT NULL` | Descripción detallada del registro o elemento. |
| 5 | `display_order` | `smallint` | `NOT NULL` | Orden numérico secuencial de presentación en interfaces, certificados y boletines. |
| 6 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `observer_template_sections`
- **Descripción:** Secciones o capítulos dentro de una plantilla del Observador del Estudiante (Académico, Convivencia, Orientación).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_observer_template_sections` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `template_id` | `bigint` | `NOT NULL` | Identificador de la plantilla del observador utilizada (referencia a observer_templates). |
| 4 | `title` | `character varying(200)` | `NOT NULL` | Título principal de la actividad, evaluación, documento o circular. |
| 5 | `is_coexistence_section` | `boolean` | `NOT NULL` | Indica si la sección corresponde a seguimiento de convivencia escolar (Ley 1620). |
| 6 | `display_order` | `smallint` | `NOT NULL` | Orden numérico secuencial de presentación en interfaces, certificados y boletines. |
| 7 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `observer_templates`
- **Descripción:** Modelos y formatos parametrizables del Observador del Estudiante por institución educativa.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_observer_templates` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `name` | `character varying(150)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `description` | `text` | `NULL` | Descripción detallada del registro o elemento. |
| 5 | `header_config` | `jsonb` | `NOT NULL` | Configuración JSONB del encabezado de impresión del formato de observador. |
| 6 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `student_observers`
- **Descripción:** Ficha anual del Observador del Estudiante vinculada a su matrícula activa (fortalezas, dificultades y compromisos generales).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_student_observers` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 4 | `template_id` | `bigint` | `NULL` | Identificador de la plantilla del observador utilizada (referencia a observer_templates). |
| 5 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 6 | `strengths` | `text` | `NULL` | Síntesis de fortalezas y potencialidades generales destacadas en el Observador del Estudiante. |
| 7 | `difficulties` | `text` | `NULL` | Síntesis de aspectos por mejorar o dificultades registradas en el Observador del Estudiante. |
| 8 | `commitments` | `text` | `NULL` | Compromisos generales asumidos por el estudiante y su familia durante el año escolar. |
| 9 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

## Dominio 9: Aula Virtual (LMS), Clases en Vivo y Evaluaciones en Línea

### Tabla `live_class_attendances`
- **Descripción:** Registro automático de asistencia y conexión de estudiantes a las clases virtuales en vivo.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_live_class_attendances` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `live_class_id` | `bigint` | `NOT NULL` | Identificador de la sesión de clase en vivo (referencia a live_classes). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `joined_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora en que el usuario fue vinculado a la conversación o clase en vivo. |

### Tabla `live_classes`
- **Descripción:** Sesiones de clases sincrónicas en vivo programadas por asignatura con enlace de videoconferencia.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_live_classes` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 4 | `title` | `character varying(250)` | `NOT NULL` | Título principal de la actividad, evaluación, documento o circular. |
| 5 | `meeting_url` | `text` | `NOT NULL` | URL de conexión a la sala de videoconferencia de la clase en vivo. |
| 6 | `scheduled_start` | `timestamp with time zone` | `NOT NULL` | Fecha y hora programada de inicio de la clase sincrónica en vivo. |
| 7 | `scheduled_end` | `timestamp with time zone` | `NULL` | Fecha y hora programada de finalización de la clase en vivo. |
| 8 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
| 9 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `online_evaluation_attempts`
- **Descripción:** Intentos de presentación de evaluaciones en línea por estudiante con respuestas en JSONB y calificación obtenida.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_online_evaluation_attempts` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `online_evaluation_id` | `bigint` | `NOT NULL` | Identificador de la evaluación en línea (referencia a online_evaluations). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `attempt_number` | `smallint` | `NOT NULL` | Número secuencial del intento realizado por el estudiante (1, 2, ...). |
| 6 | `total_score` | `numeric(6,2)` | `NOT NULL` | Puntaje o calificación total obtenida en el intento de evaluación. |
| 7 | `answers_payload` | `jsonb` | `NOT NULL` | Estructura JSONB con las respuestas seleccionadas o redactadas por el estudiante en el intento. |
| 8 | `started_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora de inicio de la sesión o intento de evaluación. |
| 9 | `submitted_at` | `timestamp with time zone` | `NULL` | Fecha y hora exacta en que el estudiante entregó la actividad o evaluación. |

### Tabla `online_evaluation_options`
- **Descripción:** Opciones de respuesta para preguntas de selección múltiple o falso/verdadero indicando la opción correcta.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_online_evaluation_options` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `question_id` | `bigint` | `NOT NULL` | Identificador de la pregunta de evaluación en línea (referencia a online_evaluation_questions). |
| 4 | `option_label` | `character varying(10)` | `NULL` | Letra o etiqueta de la opción de respuesta (A, B, C, D). |
| 5 | `option_text` | `text` | `NOT NULL` | Texto completo de la opción de respuesta. |
| 6 | `is_correct` | `boolean` | `NOT NULL` | Indica si esta opción constituye una respuesta correcta de la pregunta. |

### Tabla `online_evaluation_questions`
- **Descripción:** Preguntas pertenecientes a una evaluación en línea con su puntaje e imagen opcional.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_online_evaluation_questions` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `online_evaluation_id` | `bigint` | `NOT NULL` | Identificador de la evaluación en línea (referencia a online_evaluations). |
| 4 | `question_type_id` | `smallint` | `NOT NULL` | Identificador del tipo de pregunta (referencia a evaluation_question_types). |
| 5 | `question_text` | `text` | `NOT NULL` | Enunciado completo de la pregunta de evaluación. |
| 6 | `image_url` | `text` | `NULL` | URL de la imagen o gráfico de apoyo asociado al enunciado de la pregunta. |
| 7 | `points` | `numeric(5,2)` | `NOT NULL` | Puntaje o valor ponderado que otorga la pregunta al total del examen. |
| 8 | `display_order` | `smallint` | `NOT NULL` | Orden numérico secuencial de presentación en interfaces, certificados y boletines. |

### Tabla `online_evaluations`
- **Descripción:** Exámenes y quices en línea configurados con tiempo límite, número de intentos y ventana de disponibilidad.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_online_evaluations` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 4 | `dimension_id` | `bigint` | `NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 5 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 6 | `evaluation_type` | `character varying(30)` | `NOT NULL` | Tipo de prueba en línea (EXAM, QUIZ, DIAGNOSTIC, RECOVERY). |
| 7 | `title` | `character varying(250)` | `NOT NULL` | Título principal de la actividad, evaluación, documento o circular. |
| 8 | `description` | `text` | `NULL` | Descripción detallada del registro o elemento. |
| 9 | `duration_minutes` | `smallint` | `NOT NULL` | Tiempo máximo permitido en minutos para resolver la evaluación en línea. |
| 10 | `max_attempts` | `smallint` | `NOT NULL` | Cantidad máxima de intentos permitidos por estudiante para presentar la prueba. |
| 11 | `available_from` | `timestamp with time zone` | `NULL` | Fecha y hora a partir de la cual se habilita la presentación de la evaluación. |
| 12 | `available_until` | `timestamp with time zone` | `NULL` | Fecha y hora límite hasta la cual está disponible la evaluación en línea. |
| 13 | `is_published` | `boolean` | `NOT NULL` | Indica si la actividad o evaluación ya está visible para los estudiantes. |
| 14 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `virtual_activities`
- **Descripción:** Actividades pedagógicas, tareas y talleres publicados por el docente en el Aula Virtual.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_virtual_activities` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `course_assignment_id` | `bigint` | `NOT NULL` | Identificador de la carga académica docente que vincula asignatura, grupo y profesor (referencia a course_assignments). |
| 4 | `dimension_id` | `bigint` | `NULL` | Identificador de la dimensión o componente evaluativo institucional (referencia a evaluation_dimensions). |
| 5 | `period_number` | `smallint` | `NOT NULL` | Número secuencial del periodo académico dentro del año lectivo (1, 2, 3, 4). |
| 6 | `title` | `character varying(250)` | `NOT NULL` | Título principal de la actividad, evaluación, documento o circular. |
| 7 | `instructions` | `text` | `NOT NULL` | Instrucciones pedagógicas detalladas para realizar la actividad virtual. |
| 8 | `resource_url` | `text` | `NULL` | Enlace externo de apoyo (video, lectura o recurso educativo digital) de la actividad. |
| 9 | `attachment_file_id` | `bigint` | `NULL` | Identificador del archivo adjunto almacenado en AWS S3 (referencia a cloud_files). |
| 10 | `due_date` | `timestamp with time zone` | `NULL` | Fecha y hora límite para la entrega de la actividad virtual por parte del estudiante. |
| 11 | `is_published` | `boolean` | `NOT NULL` | Indica si la actividad o evaluación ya está visible para los estudiantes. |
| 12 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `virtual_activity_submissions`
- **Descripción:** Entregas de actividades virtuales realizadas por los estudiantes con su archivo adjunto, calificación y retroalimentación docente.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_virtual_activity_submissions` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `virtual_activity_id` | `bigint` | `NOT NULL` | Identificador de la actividad virtual a la cual corresponde la entrega (referencia a virtual_activities). |
| 4 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 5 | `student_comment` | `text` | `NULL` | Comentario o mensaje escrito por el estudiante al enviar su tarea virtual. |
| 6 | `attachment_file_id` | `bigint` | `NULL` | Identificador del archivo adjunto almacenado en AWS S3 (referencia a cloud_files). |
| 7 | `score` | `numeric(6,2)` | `NULL` | Valor numérico de la calificación obtenida. |
| 8 | `teacher_feedback` | `text` | `NULL` | Retroalimentación formativa escrita por el docente al calificar la entrega virtual. |
| 9 | `submitted_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta en que el estudiante entregó la actividad o evaluación. |
| 10 | `graded_at` | `timestamp with time zone` | `NULL` | Fecha y hora en que el docente calificó la entrega de la actividad virtual. |

## Dominio 10: Gobierno Escolar y Votaciones Electrónicas

### Tabla `election_candidates`
- **Descripción:** Candidatos inscritos a Personería, Contraloría o Consejo Estudiantil con número en el tarjetón, foto y propuesta.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_election_candidates` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `election_id` | `bigint` | `NOT NULL` | Identificador de la jornada electoral escolar (referencia a school_elections). |
| 4 | `candidacy_type_id` | `smallint` | `NOT NULL` | Identificador de la dignidad u órgano del Gobierno Escolar al que aspira (referencia a election_candidacy_types). |
| 5 | `enrollment_id` | `bigint` | `NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 6 | `ballot_number` | `character varying(10)` | `NOT NULL` | Número en el tarjetón electoral asignado al candidato (ej. 01, 02, VOTO EN BLANCO). |
| 7 | `candidate_name` | `character varying(200)` | `NOT NULL` | Nombre completo del estudiante candidato visible en el tarjetón electrónico. |
| 8 | `proposal_text` | `text` | `NULL` | Resumen del plan de trabajo o propuestas del candidato estudiantil. |
| 9 | `photo_url` | `text` | `NULL` | URL de la fotografía del estudiante o candidato almacenada en S3. |
| 10 | `is_blank_vote_option` | `boolean` | `NOT NULL` | Indica si el registro representa la opción institucional de Voto en Blanco. |
| 11 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `election_juries`
- **Descripción:** Jurados de votación asignados a cada mesa electoral de la institución.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_election_juries` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `polling_station_id` | `bigint` | `NOT NULL` | Identificador de la mesa de votación asignada (referencia a election_polling_stations). |
| 4 | `full_name` | `character varying(200)` | `NOT NULL` | Nombre completo concatenado de la persona. |
| 5 | `role_title` | `character varying(80)` | `NULL` | Cargo desempeñado por el jurado dentro de la mesa de votación (Presidente, Vicepresidente, Vocal). |

### Tabla `election_polling_stations`
- **Descripción:** Mesas de votación electrónica o presencial habilitadas por sede y grados autorizados.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_election_polling_stations` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `election_id` | `bigint` | `NOT NULL` | Identificador de la jornada electoral escolar (referencia a school_elections). |
| 4 | `campus_id` | `bigint` | `NULL` | Identificador de la sede física de la institución educativa (referencia a campuses). |
| 5 | `station_number` | `character varying(20)` | `NOT NULL` | Número identificador de la mesa de votación. |
| 6 | `station_name` | `character varying(200)` | `NOT NULL` | Nombre descriptivo de la mesa de votación escolar. |
| 7 | `location_description` | `character varying(250)` | `NULL` | Ubicación física de la mesa de votación dentro de la sede educativa. |
| 8 | `allowed_grades` | `jsonb` | `NOT NULL` | Arreglo JSONB con los códigos de grados habilitados para sufragar en esta mesa. |
| 9 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `election_votes`
- **Descripción:** Registro único e inmutable de votos emitidos por estudiante y dignidad en las elecciones escolares.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_election_votes` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `election_id` | `bigint` | `NOT NULL` | Identificador de la jornada electoral escolar (referencia a school_elections). |
| 4 | `polling_station_id` | `bigint` | `NULL` | Identificador de la mesa de votación asignada (referencia a election_polling_stations). |
| 5 | `candidacy_type_id` | `smallint` | `NOT NULL` | Identificador de la dignidad u órgano del Gobierno Escolar al que aspira (referencia a election_candidacy_types). |
| 6 | `enrollment_id` | `bigint` | `NOT NULL` | Identificador de la matrícula académica anual del estudiante (referencia a student_enrollments). |
| 7 | `candidate_id` | `bigint` | `NOT NULL` | Identificador del candidato por el cual se emitió el voto (referencia a election_candidates). |
| 8 | `voted_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta en que se registró el voto electrónico. |

### Tabla `school_elections`
- **Descripción:** Jornadas electorales de Gobierno Escolar por año lectivo (unifica las tablas duplicadas tp_elecciones/tp_elections).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_school_elections` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `academic_year` | `smallint` | `NOT NULL` | Año lectivo escolar de cuatro dígitos al cual pertenece el registro (ej. 2025, 2026, 2027). |
| 4 | `election_name` | `character varying(200)` | `NOT NULL` | Nombre oficial de la jornada electoral de Gobierno Escolar. |
| 5 | `election_date` | `date` | `NOT NULL` | Fecha calendario programada para las votaciones estudiantiles. |
| 6 | `start_time` | `time without time zone` | `NOT NULL` | Hora de apertura de las urnas electrónicas. |
| 7 | `end_time` | `time without time zone` | `NOT NULL` | Hora de cierre de las urnas electrónicas. |
| 8 | `allows_blank_vote` | `boolean` | `NOT NULL` | Indica si la elección habilita la casilla de Voto en Blanco en los tarjetones. |
| 9 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

## Dominio 11: CRM Escolar, Comunicación Omnicanal y Búsqueda Vectorial (pgvector)

### Tabla `crm_announcement_receipts`
- **Descripción:** Confirmaciones de lectura y acuse de recibo de circulares institucionales por parte de docentes, estudiantes y acudientes.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_crm_announcement_receipts` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `announcement_id` | `bigint` | `NOT NULL` | Identificador de la circular o comunicado institucional (referencia a crm_announcements). |
| 4 | `user_id` | `bigint` | `NOT NULL` | Identificador del usuario global de la comunidad educativa en la tabla users. |
| 5 | `read_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta en que el destinatario abrió y leyó el comunicado. |
| 6 | `acknowledged_at` | `timestamp with time zone` | `NULL` | Fecha y hora en que el acudiente o destinatario firmó la confirmación de enterado. |

### Tabla `crm_announcements`
- **Descripción:** Circulares, comunicados y anuncios masivos segmentados por sede, jornada, grado, grupo y roles destinatarios.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_crm_announcements` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `author_user_id` | `bigint` | `NOT NULL` | Identificador del directivo o docente autor del comunicado institucional. |
| 4 | `campus_id` | `bigint` | `NULL` | Identificador de la sede física de la institución educativa (referencia a campuses). |
| 5 | `shift_id` | `bigint` | `NULL` | Identificador de la jornada escolar de la institución (referencia a school_shifts). |
| 6 | `grade_id` | `bigint` | `NULL` | Identificador del grado académico de la institución (referencia a grades). |
| 7 | `academic_group_id` | `bigint` | `NULL` | Identificador del grupo o salón de clases activo (referencia a academic_groups). |
| 8 | `target_roles` | `text[]` | `NOT NULL` | Arreglo de roles de la comunidad educativa destinatarios de la circular (TEACHER, STUDENT, FAMILY, etc.). |
| 9 | `title` | `character varying(250)` | `NOT NULL` | Título principal de la actividad, evaluación, documento o circular. |
| 10 | `content_body` | `text` | `NOT NULL` | Contenido completo del comunicado o circular institucional. |
| 11 | `priority_level` | `character varying(20)` | `NOT NULL` | Nivel de prioridad del anuncio (LOW, NORMAL, HIGH, URGENT). |
| 12 | `requires_acknowledgment` | `boolean` | `NOT NULL` | Indica si el comunicado exige confirmación expresa de lectura por parte del acudiente o estudiante. |
| 13 | `published_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora de publicación oficial del comunicado. |
| 14 | `expires_at` | `timestamp with time zone` | `NULL` | Fecha y hora de expiración del token de sesión o comunicado. |

### Tabla `crm_channels`
- **Descripción:** Catálogo estático #54 de canales omnicanal soportados por el CRM Escolar (IN_APP, WHATSAPP, EMAIL, SMS, PUSH_NOTIFICATION).
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(30)` | `NOT NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `name` | `character varying(100)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `provider_name` | `character varying(80)` | `NULL` | Nombre del proveedor tecnológico del canal omnicanal (ASAIE_REALTIME, META_CLOUD_API, SMTP_SES, AWS_SNS, FCM_WEB_PUSH). |
| 5 | `supports_bidirectional` | `boolean` | `NOT NULL` | Indica si el canal permite respuesta bidireccional entre el destinatario y el colegio. |
| 6 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |

### Tabla `crm_conversation_participants`
- **Descripción:** Participantes suscritos a un hilo de conversación del CRM Escolar con contador de mensajes no leídos y marca de última lectura.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_crm_conversation_participants` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `conversation_id` | `bigint` | `NOT NULL` | Identificador del hilo de conversación en el CRM Escolar (referencia a crm_conversations). |
| 4 | `user_id` | `bigint` | `NOT NULL` | Identificador del usuario global de la comunidad educativa en la tabla users. |
| 5 | `participant_role` | `character varying(30)` | `NOT NULL` | Rol institucional con el que actúa el usuario dentro de la conversación (RECTOR, TEACHER, FAMILY, STUDENT). |
| 6 | `unread_count` | `integer` | `NOT NULL` | Cantidad de mensajes pendientes por leer para este participante en el hilo. |
| 7 | `last_read_at` | `timestamp with time zone` | `NULL` | Fecha y hora en que el participante leyó por última vez la conversación. |
| 8 | `is_muted` | `boolean` | `NOT NULL` | Indica si el participante silenció las notificaciones de este hilo de conversación. |
| 9 | `joined_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora en que el usuario fue vinculado a la conversación o clase en vivo. |

### Tabla `crm_conversations`
- **Descripción:** Hilos de conversación omnicanal entre miembros de la comunidad educativa (Directivos, Docentes, Acudientes y Estudiantes) aislados por colegio mediante RLS.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_crm_conversations` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `channel_id` | `smallint` | `NOT NULL` | Identificador del canal omnicanal utilizado (referencia a crm_channels). |
| 4 | `created_by_user_id` | `bigint` | `NOT NULL` | Identificador del usuario que creó originalmente el registro. |
| 5 | `student_enrollment_id` | `bigint` | `NULL` | Identificador opcional de la matrícula del estudiante asociada al caso o conversación (referencia a student_enrollments). |
| 6 | `subject` | `character varying(250)` | `NOT NULL` | Asunto o tema principal de la conversación o ticket de soporte. |
| 7 | `conversation_type` | `character varying(40)` | `NOT NULL` | Clasificación de la conversación (DIRECT, GROUP_ACADEMIC, FAMILY_TEACHER, ADMINISTRATIVE). |
| 8 | `status` | `character varying(30)` | `NOT NULL` | Estado operativo actual del registro dentro de su flujo de ciclo de vida. |
| 9 | `last_message_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora del último mensaje enviado en el hilo de conversación (para ordenamiento de bandeja). |
| 10 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `crm_knowledge_embeddings`
- **Descripción:** Base de conocimiento vectorial (pgvector 768 dimensiones + índice HNSW) para búsqueda semántica sobre PEI, SIEE, Manual de Convivencia, Circulares y Mensajes CRM aislada por colegio (RLS).
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_crm_knowledge_embeddings` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `document_source` | `character varying(50)` | `NOT NULL` | Fuente documental institucional del fragmento vectorizado (PEI, SIEE, MANUAL_CONVIVENCIA, FAQ_CIRCULAR, CRM_MESSAGE, ACADEMIC_CALENDAR). |
| 4 | `source_reference_id` | `bigint` | `NULL` | Identificador opcional del registro origen del fragmento indexado. |
| 5 | `title` | `character varying(250)` | `NOT NULL` | Título principal de la actividad, evaluación, documento o circular. |
| 6 | `chunk_text` | `text` | `NOT NULL` | Texto completo del fragmento institucional indexado para recuperación semántica (RAG). |
| 7 | `embedding` | `vector(768)` | `NOT NULL` | Vector numérico normalizado de 768 dimensiones (pgvector) para búsqueda de similitud coseno con índice HNSW. |
| 8 | `metadata` | `jsonb` | `NOT NULL` | Objeto JSONB con metadatos técnicos adicionales del registro (ETag, bucket, artículos, etc.). |
| 9 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `crm_messages`
- **Descripción:** Mensajes individuales enviados dentro de una conversación del CRM Escolar con soporte de adjuntos en AWS S3 y estado de entrega.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_crm_messages` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `conversation_id` | `bigint` | `NOT NULL` | Identificador del hilo de conversación en el CRM Escolar (referencia a crm_conversations). |
| 4 | `sender_user_id` | `bigint` | `NOT NULL` | Identificador del usuario remitente que envió el mensaje en el CRM Escolar. |
| 5 | `channel_id` | `smallint` | `NOT NULL` | Identificador del canal omnicanal utilizado (referencia a crm_channels). |
| 6 | `body_text` | `text` | `NOT NULL` | Cuerpo textual del mensaje enviado en la conversación omnicanal. |
| 7 | `attachment_file_id` | `bigint` | `NULL` | Identificador del archivo adjunto almacenado en AWS S3 (referencia a cloud_files). |
| 8 | `delivery_status` | `character varying(30)` | `NOT NULL` | Estado de entrega del mensaje omnicanal (QUEUED, SENT, DELIVERED, READ, FAILED). |
| 9 | `external_message_id` | `character varying(120)` | `NULL` | Identificador externo devuelto por la pasarela de WhatsApp Cloud API, SMTP o SMS. |
| 10 | `sent_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta de envío del mensaje. |

### Tabla `crm_support_tickets`
- **Descripción:** Tickets de atención a padres, solicitudes de certificados y casos PQRSD gestionados con SLA dentro del CRM Escolar.
- **Aislamiento Multi-Tenant (RLS):** Sí (`tenant_isolation_crm_support_tickets` por `school_id`)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `bigint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `school_id` | `bigint` | `NOT NULL` | Identificador de la Institución Educativa propietaria del registro (clave de particionamiento lógico y aislamiento Row-Level Security RLS). |
| 3 | `ticket_code` | `character varying(30)` | `NOT NULL` | Código radicado único del ticket PQRSD o solicitud dentro de la institución educativa. |
| 4 | `category_id` | `smallint` | `NOT NULL` | Identificador de la categoría del ticket o cargo (referencia al catálogo respectivo). |
| 5 | `requester_user_id` | `bigint` | `NOT NULL` | Identificador del padre, estudiante o docente que radica la solicitud o PQRSD. |
| 6 | `assigned_user_id` | `bigint` | `NULL` | Identificador del funcionario o coordinador asignado para resolver el ticket. |
| 7 | `student_enrollment_id` | `bigint` | `NULL` | Identificador opcional de la matrícula del estudiante asociada al caso o conversación (referencia a student_enrollments). |
| 8 | `subject` | `character varying(250)` | `NOT NULL` | Asunto o tema principal de la conversación o ticket de soporte. |
| 9 | `description` | `text` | `NOT NULL` | Descripción detallada del registro o elemento. |
| 10 | `priority` | `character varying(20)` | `NOT NULL` | Prioridad de atención del ticket (LOW, MEDIUM, HIGH, CRITICAL). |
| 11 | `status` | `character varying(30)` | `NOT NULL` | Estado operativo actual del registro dentro de su flujo de ciclo de vida. |
| 12 | `due_at` | `timestamp with time zone` | `NULL` | Fecha y hora máxima de vencimiento del acuerdo de nivel de servicio (SLA). |
| 13 | `resolved_at` | `timestamp with time zone` | `NULL` | Fecha y hora en que la solicitud o ticket fue resuelto. |
| 14 | `created_at` | `timestamp with time zone` | `NOT NULL` | Fecha y hora exacta (TIMESTAMPTZ) de creación del registro en la base de datos. |

### Tabla `crm_ticket_categories`
- **Descripción:** Catálogo estático #55 de categorías de solicitudes, trámites y PQRSD del CRM Escolar con tiempo de respuesta SLA en horas.
- **Aislamiento Multi-Tenant (RLS):** No (Catálogo Global / Maestro)

| # | Columna (`snake_case`) | Tipo de Dato (`PostgreSQL 17`) | Nulabilidad | Descripción Funcional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `id` | `smallint` | `NOT NULL` | Identificador único del registro en la tabla (clave primaria o parte de la clave primaria compuesta). |
| 2 | `code` | `character varying(40)` | `NOT NULL` | Código alfanumérico corto estandarizado del registro. |
| 3 | `name` | `character varying(120)` | `NOT NULL` | Nombre descriptivo oficial del registro. |
| 4 | `sla_hours` | `smallint` | `NOT NULL` | Tiempo máximo de respuesta y solución expresado en horas hábiles según la categoría. |
| 5 | `is_active` | `boolean` | `NOT NULL` | Indica si el registro se encuentra activo y habilitado para operaciones (TRUE/FALSE). |
