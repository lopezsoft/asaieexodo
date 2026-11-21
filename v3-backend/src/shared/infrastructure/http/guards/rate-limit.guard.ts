import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { SmartLoggerService } from '../../logging/smart-logger.service';
import {
  RATE_LIMIT_KEY,
  RateLimitPolicy,
} from '../decorators/security.decorators';

interface InMemoryBucket {
  count: number;
  expiresAt: number;
}

/**
 * Guard distribuido de limitacion de tasa (Rate Limiting) respaldado por Redis 7.4
 * con fallback en memoria para pruebas unitarias o contingencia de conexion.
 */
@Injectable()
export class RateLimitGuard implements CanActivate, OnModuleDestroy {
  private readonly redisClient: Redis | null;
  private readonly memoryBuckets = new Map<string, InMemoryBucket>();
  private readonly isTestEnv: boolean;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    this.isTestEnv =
      this.configService.get<string>('NODE_ENV', 'development') === 'test';

    if (this.isTestEnv) {
      this.redisClient = null;
    } else {
      const password = this.configService.get<string>('REDIS_PASSWORD');
      const useTls =
        this.configService.get<string>('REDIS_TLS', 'false') === 'true';

      this.redisClient = new Redis({
        host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
        port: Number(this.configService.get<string>('REDIS_PORT', '6384')),
        ...(password ? { password } : {}),
        ...(useTls ? { tls: {} } : {}),
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      });

      this.redisClient.on('error', (err) => {
        this.logger.warn(
          'RateLimitGuard operando en modo degradado en memoria por fallo Redis',
          { errorMessage: err.message },
        );
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = this.reflector.getAllAndOverride<RateLimitPolicy>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policy) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      ip?: string;
      method?: string;
      url?: string;
    }>();

    const ip = request.ip ?? 'unknown';
    const routeKey = `${request.method ?? 'HTTP'}:${(request.url ?? '/').split('?')[0]}`;
    const bucketKey = `asaie:ratelimit:${routeKey}:${ip}`;

    const count = await this.incrementCounter(bucketKey, policy.windowSeconds);
    if (count > policy.maxRequests) {
      throw new HttpException(
        'Has excedido el límite temporal de solicitudes permitidas. Intenta nuevamente en unos minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private async incrementCounter(
    key: string,
    windowSeconds: number,
  ): Promise<number> {
    if (this.redisClient) {
      try {
        if (this.redisClient.status === 'wait') {
          await this.redisClient.connect();
        }
        const current = await this.redisClient.incr(key);
        if (current === 1) {
          await this.redisClient.expire(key, windowSeconds);
        }
        return current;
      } catch {
        // Degradacion controlada a memoria local para no bloquear peticiones legitimas
      }
    }

    const now = Date.now();
    const existing = this.memoryBuckets.get(key);
    if (!existing || existing.expiresAt <= now) {
      this.memoryBuckets.set(key, {
        count: 1,
        expiresAt: now + windowSeconds * 1000,
      });
      return 1;
    }
    existing.count += 1;
    return existing.count;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit().catch(() => undefined);
    }
  }
}
