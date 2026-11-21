# ASAIE ÉXODO V3 — Portal Unificado de la Comunidad Educativa (Angular 20)

Portal único Multi-Tenant construido con **Angular 20** (`Signals`, componentes Standalone, `Transloco` i18n, `DebugService` y directiva `[appCustomTooltip]`) conectado a `v3-backend` (`NestJS 11 + Fastify 5 + PostgreSQL 17 RLS`).

## Comandos Principales

- `npm run check:native-title` — Valida cero usos del atributo HTML nativo `title` en plantillas `.html` y templates inline `.ts`.
- `npm run typecheck` — Verificación de tipos TypeScript (`tsconfig.app.json`).
- `npm run build` — Ejecuta `prebuild` (`check:native-title`) y compila la aplicación para producción en `dist/asaie-v3-frontend`.
- `npm test` — Ejecuta pruebas unitarias Karma/Jasmine.
