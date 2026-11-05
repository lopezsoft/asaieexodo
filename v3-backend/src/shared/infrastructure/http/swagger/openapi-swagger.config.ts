import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configura y expone la documentacion interactiva OpenAPI 3.0 / Swagger
 * para el Backend SaaS Multi-Tenant de ASAIE EXODO V3 sobre Fastify 5.
 *
 * Rutas expuestas:
 * - GET /api/docs       -> Interfaz interactiva Swagger UI
 * - GET /api/docs-json  -> Especificacion OpenAPI 3.0 en formato JSON
 * - GET /api/docs-yaml  -> Especificacion OpenAPI 3.0 en formato YAML
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ASAIE ÉXODO V3 — Multi-Tenant Educational SaaS & School CRM API')
    .setDescription(
      [
        'API RESTful empresarial de **ASAIE ÉXODO V3** construida con **NestJS 11 + Fastify 5 + Arquitectura Hexagonal (Ports & Adapters)**.',
        '',
        '### Características Principales de Arquitectura:',
        '- **Single-DB Multi-Tenant con PostgreSQL 17 RLS (`Row-Level Security`):** Aislamiento estricto por `school_id` (`app.current_school_id`).',
        '- **Esquema 100% Normalizado (1NF, 2NF, 3NF/BCNF) en Inglés:** 135 tablas y particiones normalizadas + 55 catálogos oficiales MEN/DANE/SIMAT.',
        '- **CRM Escolar Omnicanal + Búsqueda Semántica (`pgvector 0.8.1`):** Comunicación unificada entre Directivos, Administrativos, Docentes, Estudiantes y Padres/Acudientes, con índice vectorial HNSW (`vector(768)`) para consulta semántica de PEI, SIEE y Manual de Convivencia.',
        '- **Continuidad 100% JasperReports (`.jrxml` / `.jasper`):** Procesamiento asíncrono sobre colas BullMQ + Redis 7.4.',
      ].join('\n'),
    )
    .setVersion('3.2.0')
    .setContact(
      'Equipo de Arquitectura ASAIE ÉXODO - LOPEZSOFT',
      'https://asaie.co',
      'arquitectura@asaie.co',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Token JWT emitido por /api/v3/auth/login o /api/v3/auth/switch-context con el contexto institucional activo.',
      },
      'jwt-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-school-id',
        description:
          'Identificador numérico de la Institución Educativa activa (Tenant RLS en PostgreSQL 17).',
      },
      'tenant-school-header',
    )
    .addTag(
      'Tenants & Schools',
      'Gestión de Instituciones Educativas (Single-DB Multi-Tenant) y Sedes DANE',
    )
    .addTag(
      'IAM & Community Auth',
      'Autenticación unificada y cambio de contexto multi-colegio / multi-rol (Directivo, Administrativo, Docente, Estudiante, Acudiente)',
    )
    .addTag(
      'Academic Grading & Bulletins',
      'Calificaciones periódicas, cálculo ponderado de definitivas y boletines académicos',
    )
    .addTag(
      'School CRM & Vector AI (pgvector)',
      'CRM Escolar Omnicanal (Conversaciones, Circulares, PQRSD) y Búsqueda Semántica Vectorial con pgvector (PEI, SIEE, Convivencia)',
    )
    .addTag(
      'JasperReports Engine',
      'Generación asíncrona de reportes oficiales (.jrxml / .jasper) mediante BullMQ y Redis 7.4',
    )
    .build();

  return SwaggerModule.createDocument(app, swaggerConfig);
}

export function setupOpenApiSwagger(app: INestApplication): OpenAPIObject {
  const document = buildOpenApiDocument(app);

  // Registra /api/docs-json y /api/docs-yaml nativamente en @nestjs/swagger
  SwaggerModule.setup('api/docs', app, document, {
    ui: false,
    raw: ['json', 'yaml'],
    jsonDocumentUrl: 'api/docs-json',
    yamlDocumentUrl: 'api/docs-yaml',
  });

  const httpAdapter = app.getHttpAdapter();
  const swaggerDistDir = path.dirname(
    require.resolve('swagger-ui-dist/package.json'),
  );

  const allowedAssets: Record<string, string> = {
    'swagger-ui.css': 'text/css; charset=utf-8',
    'swagger-ui-bundle.js': 'application/javascript; charset=utf-8',
    'swagger-ui-standalone-preset.js': 'application/javascript; charset=utf-8',
    'favicon-32x32.png': 'image/png',
    'favicon-16x16.png': 'image/png',
  };

  httpAdapter.get('/api/docs', (_req: unknown, reply: any) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ASAIE ÉXODO V3 — Swagger OpenAPI 3.0</title>
  <link rel="stylesheet" type="text/css" href="/api/docs/assets/swagger-ui.css" />
  <link rel="icon" type="image/png" href="/api/docs/assets/favicon-32x32.png" sizes="32x32" />
</head>
<body style="margin:0; background:#fafafa;">
  <div id="swagger-ui"></div>
  <script src="/api/docs/assets/swagger-ui-bundle.js"></script>
  <script src="/api/docs/assets/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api/docs-json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: 'StandaloneLayout'
      });
    };
  </script>
</body>
</html>`;
    reply.header('Content-Type', 'text/html; charset=utf-8').send(html);
  });

  httpAdapter.get('/api/docs/assets/:file', (req: any, reply: any) => {
    const requestedFile = String(req.params?.file ?? '');
    const contentType = allowedAssets[requestedFile];
    if (!contentType) {
      reply.code(404).send({ statusCode: 404, message: 'Asset no encontrado' });
      return;
    }
    const assetPath = path.join(swaggerDistDir, requestedFile);
    if (!fs.existsSync(assetPath)) {
      reply.code(404).send({ statusCode: 404, message: 'Asset no existe' });
      return;
    }
    const content = fs.readFileSync(assetPath);
    reply.header('Content-Type', contentType).send(content);
  });

  return document;
}
