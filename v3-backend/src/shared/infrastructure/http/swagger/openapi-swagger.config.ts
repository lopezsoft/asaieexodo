import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface CachedSwaggerAsset {
  readonly buffer: Buffer;
  readonly contentType: string;
  readonly etag: string;
}

function readPackageVersion(): string {
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const raw = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
      version?: string;
    };
    return raw.version ?? '3.6.0';
  } catch {
    return '3.6.0';
  }
}

/**
 * Configura y expone la documentacion interactiva OpenAPI 3.0 / Swagger
 * para el Backend SaaS Multi-Tenant de ASAIE EXODO V3 sobre Fastify 5.
 *
 * Rutas expuestas (habilitadas en desarrollo/pruebas o cuando SWAGGER_ENABLED=true):
 * - GET /api/docs       -> Interfaz interactiva Swagger UI
 * - GET /api/docs-json  -> Especificacion OpenAPI 3.0 en formato JSON
 * - GET /api/docs-yaml  -> Especificacion OpenAPI 3.0 en formato YAML
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const apiVersion = readPackageVersion();
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ASAIE ÉXODO V3 — Multi-Tenant Educational SaaS & School CRM API')
    .setDescription(
      [
        'API RESTful empresarial de **ASAIE ÉXODO V3** construida con **NestJS 11 + Fastify 5 + Arquitectura Hexagonal (Ports & Adapters)**.',
        '',
        '### Características Principales de Arquitectura:',
        '- **Single-DB Multi-Tenant con PostgreSQL 17 RLS (`Row-Level Security`):** Aislamiento estricto por `school_id` (`app.current_school_id`) derivado exclusivamente del JWT verificado en servidor.',
        '- **Esquema 100% Normalizado (1NF, 2NF, 3NF/BCNF) en Inglés:** 139 tablas y particiones normalizadas + 55 catálogos oficiales MEN/DANE/SIMAT.',
        '- **CRM Escolar Omnicanal + Búsqueda Semántica (`pgvector 0.8.1`):** Comunicación unificada entre Directivos, Administrativos, Docentes, Estudiantes y Padres/Acudientes, con índice vectorial HNSW (`vector(768)`).',
        '- **Continuidad JasperReports (`.jrxml` / `.jasper`):** Procesamiento asíncrono sobre colas BullMQ + Redis 7.4 con almacenamiento en AWS S3 y URLs prefirmadas.',
      ].join('\n'),
    )
    .setVersion(apiVersion)
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
          'Token JWT emitido por /api/v1/auth/login o /api/v1/auth/switch-context con el contexto institucional y sesión activa.',
      },
      'jwt-auth',
    )
    .addTag(
      'Tenants & Schools',
      'Gestión de Instituciones Educativas (Single-DB Multi-Tenant) y Sedes DANE',
    )
    .addTag(
      'IAM & Community Auth',
      'Autenticación unificada, gestión de sesiones y cambio de contexto multi-colegio / multi-rol',
    )
    .addTag(
      'Academic Grading & Bulletins',
      'Calificaciones periódicas, cálculo ponderado de definitivas, preinformes y boletines académicos',
    )
    .addTag(
      'School CRM & Vector AI (pgvector)',
      'CRM Escolar Omnicanal (Conversaciones, Mensajes, Circulares, PQRSD) y Búsqueda Semántica Vectorial con pgvector',
    )
    .addTag(
      'Cloud Storage & AWS S3 Files',
      'Almacenamiento en AWS S3 por carpeta institucional (schools.storage_folder), carga multipart, URLs prefirmadas y cloud_files bajo RLS',
    )
    .addTag(
      'JasperReports Engine',
      'Generación asíncrona de reportes oficiales (.jrxml / .jasper) mediante BullMQ, Redis 7.4 y AWS S3',
    )
    .build();

  return SwaggerModule.createDocument(app, swaggerConfig);
}

export function setupOpenApiSwagger(app: INestApplication): OpenAPIObject {
  const document = buildOpenApiDocument(app);

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

  // Precargar los 5 assets permitidos en un Map en memoria (evita I/O sincrono por request y prototype pollution)
  const assetDefinitions: ReadonlyArray<[string, string]> = [
    ['swagger-ui.css', 'text/css; charset=utf-8'],
    ['swagger-ui-bundle.js', 'application/javascript; charset=utf-8'],
    ['swagger-ui-standalone-preset.js', 'application/javascript; charset=utf-8'],
    ['favicon-32x32.png', 'image/png'],
    ['favicon-16x16.png', 'image/png'],
  ];

  const cachedAssets = new Map<string, CachedSwaggerAsset>();
  for (const [fileName, contentType] of assetDefinitions) {
    const assetPath = path.join(swaggerDistDir, fileName);
    if (fs.existsSync(assetPath)) {
      const buffer = fs.readFileSync(assetPath);
      const etag = `"${crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16)}"`;
      cachedAssets.set(fileName, { buffer, contentType, etag });
    }
  }

  const swaggerHtml = `<!DOCTYPE html>
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

  httpAdapter.get('/api/docs', (_req: unknown, reply: any) => {
    reply.header('Content-Type', 'text/html; charset=utf-8').send(swaggerHtml);
  });

  httpAdapter.get('/api/docs/assets/:file', (req: any, reply: any) => {
    const requestedFile = String(req.params?.file ?? '');
    const asset = cachedAssets.get(requestedFile);
    if (!asset) {
      reply.code(404).send({ statusCode: 404, message: 'Asset no encontrado' });
      return;
    }

    if (req.headers?.['if-none-match'] === asset.etag) {
      reply.code(304).send();
      return;
    }

    reply
      .header('Content-Type', asset.contentType)
      .header('ETag', asset.etag)
      .header('Cache-Control', 'public, max-age=86400, immutable')
      .send(asset.buffer);
  });

  return document;
}
