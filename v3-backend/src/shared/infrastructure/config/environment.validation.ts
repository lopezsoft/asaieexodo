/**
 * Validacion estricta de variables de entorno al iniciar la aplicacion (Fail-Fast).
 * En entornos de produccion impide el arranque si existen secretos faltantes, debiles o CORS abierto.
 */
export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const nodeEnv = String(config.NODE_ENV ?? 'development').toLowerCase();
  const isProduction = nodeEnv === 'production';

  if (isProduction) {
    const jwtSecret = String(config.JWT_SECRET ?? '').trim();
    if (
      jwtSecret.length < 32 ||
      jwtSecret.includes('development') ||
      jwtSecret.includes('change-in-production')
    ) {
      throw new Error(
        'Configuracion invalida en produccion: JWT_SECRET debe tener al menos 32 caracteres seguros.',
      );
    }

    const dbPassword = String(config.DB_PASSWORD ?? '').trim();
    if (!dbPassword || dbPassword === 'asaie_local_secret_2026') {
      throw new Error(
        'Configuracion invalida en produccion: DB_PASSWORD debe ser una credencial segura no predeterminada.',
      );
    }

    const redisPassword = String(config.REDIS_PASSWORD ?? '').trim();
    if (!redisPassword || redisPassword === 'asaie_redis_local_secret_2026') {
      throw new Error(
        'Configuracion invalida en produccion: REDIS_PASSWORD es obligatorio y no puede usar valores locales.',
      );
    }

    const corsOrigin = String(config.CORS_ORIGIN ?? '').trim();
    if (!corsOrigin || corsOrigin.split(',').some((o) => o.trim() === '*')) {
      throw new Error(
        'Configuracion invalida en produccion: CORS_ORIGIN debe definir origenes explicitos sin wildcard (*).',
      );
    }

    const frontendUrl = String(config.FRONTEND_URL ?? '').trim();
    if (!frontendUrl || frontendUrl.includes('localhost')) {
      throw new Error(
        'Configuracion invalida en produccion: FRONTEND_URL debe apuntar al dominio publico HTTPS.',
      );
    }

    const awsBucket = String(config.AWS_BUCKET ?? '').trim();
    const awsAccessKey = String(config.AWS_ACCESS_KEY_ID ?? '').trim();
    if (!awsBucket) {
      throw new Error(
        'Configuracion invalida en produccion: AWS_BUCKET es obligatorio.',
      );
    }
    if (
      awsAccessKey &&
      (awsAccessKey.startsWith('YOUR_') || awsAccessKey.startsWith('test-'))
    ) {
      throw new Error(
        'Configuracion invalida en produccion: AWS_ACCESS_KEY_ID contiene un placeholder no valido.',
      );
    }
  }

  return config;
}
