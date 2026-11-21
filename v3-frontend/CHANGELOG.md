# Registro de Cambios (Changelog) - ASAIE ÉXODO V3 Frontend

Todos los cambios notables de **v3-frontend** (Angular 20+ para toda la Comunidad Educativa) se documentan en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [3.10.0] - 2026-11-21

### Añadido
- **Rediseño Moderno y Animado del Flujo `/auth/*` (`AuthenticationComponent`):**
  - Nuevo shell dividido y responsivo con fondo hero animado (orbes flotantes, cuadrícula, anillo orbital sutil, *parallax* con puntero y soporte `prefers-reduced-motion`), carrusel interactivo de 3 vistas sobre ASAIE ÉXODO, barra superior con selector de modo (`Iniciar sesión` ↔ `Registrar IE`), cambio de idioma (`ES`/`EN`) y alternancia Claro/Oscuro.
  - **Login (`SignInComponent`):** tarjeta animada con detección de `Bloq Mayús`, alternancia de visibilidad de contraseña con `[appCustomTooltip]`, recordación opcional de usuario, spinner inline, animación *shake* ante errores y tarjeta CTA destacada para registrar nuevas IE con 30 días de prueba gratis.
  - **Wizard de Auto-Registro de Nueva IE (`SignUpComponent`, `/auth/sign-up`):** flujo animado en 2 pasos (*Institución* y *Administrador*) con carga de catálogos públicos, auto-sugerencia de usuario, medidor interactivo de fortaleza de contraseña, inicio de sesión automático y enrutamiento inteligente mediante `resolvePostLoginRoute`.
  - **Componente Reutilizable `V3SearchableSelectComponent` (`<app-v3-searchable-select>`):** selector `ControlValueAccessor` con búsqueda instantánea insensible a tildes, navegación completa por teclado, detección de espacio inferior/superior y estilos propios en `_searchable-select.scss`.
- **Unificación Visual y Tokens:** reorganización de tokens `$auth-*` en `_variables.scss` y `page-auth.scss` sin colores hexadecimales hardcodeados, extendiendo la nueva estética a `forgot-password`, `reset-password`, `confirm-email`, `logout`, `not-authorized` y `lock-screen`.

## [3.9.0] - 2026-11-21

### Añadido
- **Panel de Accesos Multi-Colegio / Multi-Rol (`/access-panel`, `AccessPanelComponent`):** Vista dedicada para usuarios con múltiples perfiles o colegios con buscador instantáneo (por colegio, código DANE o módulo), filtros rápidos por rol, tarjetas de 3 columnas con iconos diferenciados por módulo y cambio seguro de contexto vía `POST /api/v1/auth/switch-context` (JWT + RLS).
- **Enrutamiento Inteligente Post-Login y Post-Cambio de Rol (`resolveLandingRouteByRole` / `resolvePostLoginRoute`):**
  - Usuarios con múltiples accesos ingresan al **Panel de Accesos (`/access-panel`)** con barra lateral y encabezado limpios hasta seleccionar colegio y módulo.
  - Usuarios con un único perfil ingresan directamente a su portal (`/teacher` para Docentes, `/student/academic-notes` para Estudiantes/Acudientes y `/dashboard` para Directivos/Administrativos).
  - Al cambiar de tarjeta o contexto, se invalida la caché de catálogos y se redirige automáticamente al portal del rol elegido.

## [3.8.1] - 2026-11-20

### Cambiado
- Actualización de `favicon.ico` institucional y sincronización de la constante `VERSION` en `environment.ts`, `environment.hmr.ts` y `environment.prod.ts`.

## [3.8.0] - 2026-11-20

### Añadido
- **Paridad 100% Portal Docente Dedicado (`fronts/asaie-teachers` → `/teacher/*`, 9 vistas Standalone + Signals):**
  - **Hub Docente (`TeacherHubComponent`):** Calendario oficial de periodos habilitados con ventanas de notas y nivelaciones (`PeriodosDocentesView`), 8 tarjetas de acceso rápido y carga académica con saltos directos a Notas, Nivelaciones y Seguimiento.
  - **Planilla Avanzada (`TeacherGradebookComponent`):** Columnas dinámicas `N1..N30` con modal de configuración por dimensión (`ConfigColumnView`), filtro por sexo (`Mixto`/`M`/`F`), columnas de asistencia `F.J`/`F.I`/`Ret.`, autoguardado con temporizador, sincronización automática de descriptores, modal de logros y sugerencias por estudiante, e importación/exportación bidireccional de plantillas Excel (`.xlsx`).
  - **Descriptores Multi-Escala, Sugerencias y Parcelador (`TeacherAchievementsPlanningComponent`):** Generación simultánea por los 4 desempeños nacionales con vista previa, pestaña dedicada de Sugerencias/Observaciones y Parcelador/Plan Semanal con fechas, horas, evaluación e impresión PDF JasperReports (`parcelador_clases`).
  - **Nivelaciones (`/teacher/levelings`, `TeacherLevelingsComponent`):** Nivelaciones periódicas y recuperaciones de fin de año con detección automática de reprobados, validación contra topes SIEE y actas PDF JasperReports.
  - **Observador M3/M5 (`/teacher/observer`, `TeacherObserverComponent`):** Ficha integral Modelo 5 (salud, familia, barreras, limitaciones+EPS/DX, PIAR/inclusión), matriz de criterios Modelo 3 (`N/AV/CS/S` P1–P4), anotaciones con impresión PDF (`observador_estudiante`), vista de acudientes y filtrado por grupos del docente.
  - **Formato de Seguimiento (`/teacher/tracking`, `TeacherTrackingFormatComponent`):** Matriz grupal editable de conectividad y medios de acceso (`PV`, `TV`, `GW`, `GF`, `OT`, `EE`, `IN`, `TV`, `DC`) con indicadores KPI.
  - **Informes y Boletines Docentes (`/teacher/reports`, `TeacherReportsComponent`):** Generador de boletines en 6 formatos (`Oficio`/`Carta`, grupo o estudiante individual) y los 10 informes oficiales del docente conectados a BullMQ + JasperReports + AWS S3.
  - **Aula Virtual (`TeacherVirtualClassroomComponent`):** Fecha límite y adjunto S3 en actividades, biblioteca de Material Educativo AWS S3 (`EDUCATIONAL_RESOURCES`), constructor de preguntas con los 4 tipos de evaluación y eliminación de preguntas.
  - **Mi Perfil y Firma Digital (`/teacher/profile`, `TeacherProfileComponent`):** Edición del perfil docente y carga de firma digital oficial en AWS S3 (`INSTITUTIONAL_SIGNATURES`).
- **Sidebar y Traducciones:** Nuevos accesos en `full-menu.ts`, `es.json` y `en.json` (`0` atributos `title` nativos, `0` usos de `console.*`).

## [3.7.0] - 2026-11-20

### Añadido
- **Portal Docente Completo (Sprint 8, `/teacher/*`):** Migración completa de `docentes/` y `asaie-teachers` (incluyendo Observador Modelo 5) hacia Angular 20 Standalone + Signals (`V3PortalService`, Hub Docente, Planilla Interactiva de Notas con exportación Excel `.xlsx` + Preinformes + Inasistencias, Banco de Logros + Importación interanual + Planes de Clase/Parcelador, Observador Modelos 1–5 y Aula Virtual LMS con Actividades/Evaluaciones/Clases en Vivo).
- **Portal Estudiantil y Familiar Completo (`/student/*`):** Reemplazo total de los 3 stubs restantes (`AcademicNotesComponent`, `AcademicReportsComponent`, `AcademicActivitiesComponent` con exámenes en línea calificados en servidor y clases en vivo) — completando el 100% de los 8 sprints de migración desde ExtJS.

### Eliminado y Limpiado
- Migración de `UserContainerComponent` a `V3UnifiedAuthService` + `RouterLink` y eliminación definitiva de los servicios legacy obsoletos (`ApiService`, `AuthService`, `UsersService`, `UserActionsService`) y archivos `.html`/`.scss` vacíos de stubs estudiantiles (`0` usos de `console.*` y `0` atributos nativos `title`).

## [3.6.0] - 2026-11-20

### Añadido
- **Módulo Elecciones Escolares y Cabina Estudiantil (Sprint 7, `/elections/*` y `/student/school-elections`):** Migración completa desde ExtJS (`elecciones/` y `estudiantes/` votaciones) hacia Angular 20 Standalone + Signals (`V3ElectionsService`, Hub Electoral, Control de Jornadas/Mesas/Jurados, Inscripción de Candidatos y Voto en Blanco, Escrutinio en Tiempo Real y reemplazo total del stub `SchoolElectionsComponent` por la Cabina Electoral Estudiantil con voto único verificado).

## [3.5.0] - 2026-11-20

### Añadido
- **Módulo Promoción y Cierre de Año (Sprint 6, `/promotion/*`):** Migración completa desde ExtJS (`promocion/`) hacia Angular 20 Standalone + Signals (`V3PromotionService`, Hub de Promoción, Libro Final/Actas/Sábanas con reportes JasperReports, Promoción Anticipada, Matrícula Masiva de Estudiantes Antiguos, Historial Académico Multianual + Encabezados de Certificados, y Cierre/Reapertura del Año Lectivo).

## [3.4.0] - 2026-11-20

### Añadido
- **Módulo Académico Completo (Sprints 4 y 5, `/academic/*`):** Migración completa desde ExtJS (`academico/`, `inscripciones/`, `general/`) hacia Angular 20 Standalone + Signals (`V3AcademicService`, Hub Académico, Currículo y Carga Académica con traslado masivo docente, Inscripciones/Matrículas/Familias/Novedades/S3/Traslado de Estudiantes, Control de Notas/Editor Rectoral/Transferencia/Nivelaciones/Cuadro de Honor/Mayúsculas de Logros, y Centro de 17 Reportes Oficiales JasperReports conectado a BullMQ + AWS S3).
- **Helper RBAC `V3UnifiedAuthService.hasAnyRole()`** y menú lateral/i18n (`es.json`, `en.json`).

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
