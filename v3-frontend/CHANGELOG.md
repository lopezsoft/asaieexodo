# Registro de Cambios (Changelog) - ASAIE ÉXODO V3 Frontend

Todos los cambios notables de **v3-frontend** (Angular 20+ para toda la Comunidad Educativa) se documentan en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [3.1.0] - 2026-11-05

### Añadido
- Sincronización de contratos de tipos y catálogos estáticos con el esquema normalizado 3NF en inglés de `v3-backend` (`3.1.0`).

## [3.0.0] - 2026-11-05

### Añadido
- Creación del directorio aislado `v3-frontend` en **Angular 20** sin afectar el frontend en mantenimiento (`fronts/campus`).
- Implementación de `DebugService` para registro controlado en desarrollo sin exposición de datos en producción.
- Implementación de la directiva `CustomTooltipDirective` (`[appCustomTooltip]`) y validador `scripts/check-native-title.js` (`0` usos nativos de `title` en los 245 archivos HTML).
- Implementación de `V3UnifiedAuthService` para autenticación unificada de toda la comunidad educativa (Directivos, Docentes, Estudiantes y Padres/Acudientes) y cambio seguro de colegio/rol verificado por el backend.
