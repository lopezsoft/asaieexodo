# Registro de Cambios (Changelog) - ASAIE ÉXODO V3 Frontend

Todos los cambios notables de **v3-frontend** (Angular 20+ para toda la Comunidad Educativa) se documentan en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [3.3.0] - 2026-11-20

### Añadido
- **Módulo Configuraciones Institucionales (Sprint 3, `/settings/*`):** Migración completa de `configuraciones/` desde ExtJS hacia Angular 20 Standalone + Signals (`V3SettingsService`, Hub de Configuraciones, Estructura Académica, Evaluación y SIEE con bloqueo de periodos y limpieza de notas en cero, Observador jerárquico, y Firmas/Boletines/Carnés/Marcas de Agua S3/Módulos Extra).

## [3.2.0] - 2026-11-20

### Añadido
- **Fundación UI V3 (Sprint 1):** Selector global de Año Lectivo y colegio activo en `HeaderComponent`, Sidebar jerárquico multi-nivel con RBAC (`roleGuard`), componentes compartidos (`V3DataGridComponent`, `V3ModalDialogComponent`, `V3FileManagerModalComponent`), servicios `V3CatalogsService` y `V3AdministrationService`.
- **Dashboard Ejecutivo y Perfil V3:** KPIs institucionales y 3 gráficas anuales `ApexCharts` reactivas al año lectivo/colegio, más migración completa de `ProfileComponent` y `ProfileChangeComponent` hacia `/api/v1/auth/*` + AWS S3.
- **Módulo Administrativo Completo (Sprint 2, `/admin/*`):** Migración desde ExtJS de Hub Administrativo, Datos del Plantel, Sedes Educativas (+ Jornadas y Niveles por sede), Personal Docente (+ documentos S3), Personal Administrativo (+ documentos S3) y Directores de Grupo (+ reporte PDF JasperReports).

### Corregido y Limpiado
- Eliminación total de 786 archivos de demos Trezo y POS legacy sin uso, migración de interceptores/guards a `V3UnifiedAuthService`, remoción de `withHashLocation()`, endurecimiento de `DebugService` y `CustomTooltipDirective` (0 atributos nativos `title` y 0 `console.*`).

## [3.1.0] - 2026-11-05

### Añadido
- Sincronización de contratos de tipos y catálogos estáticos con el esquema normalizado 3NF en inglés de `v3-backend` (`3.1.0`).

## [3.0.0] - 2026-11-05

### Añadido
- Creación del directorio aislado `v3-frontend` en **Angular 20** sin afectar el frontend en mantenimiento (`fronts/campus`).
- Implementación de `DebugService` para registro controlado en desarrollo sin exposición de datos en producción.
- Implementación de la directiva `CustomTooltipDirective` (`[appCustomTooltip]`) y validador `scripts/check-native-title.js` (`0` usos nativos de `title` en los 245 archivos HTML).
- Implementación de `V3UnifiedAuthService` para autenticación unificada de toda la comunidad educativa (Directivos, Docentes, Estudiantes y Padres/Acudientes) y cambio seguro de colegio/rol verificado por el backend.
