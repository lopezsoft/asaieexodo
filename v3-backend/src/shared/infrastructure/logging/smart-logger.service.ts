import { Injectable, LoggerService } from '@nestjs/common';

const SENSITIVE_FIELD_NAMES = new Set([
  'password',
  'passwordhash',
  'currentpassword',
  'newpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'jwtsecret',
  'dbpassword',
  'documentnumber',
]);

/**
 * Servicio centralizado de logging (Regla 4 Obligatoria).
 * Reemplaza por completo console.log y redacta automaticamente PII, credenciales y tokens.
 */
@Injectable()
export class SmartLoggerService implements LoggerService {
  log(message: string, contextOrMetadata?: unknown): void {
    this.writeStructuredEntry('INFO', message, contextOrMetadata);
  }

  error(message: string, traceOrMetadata?: unknown, context?: string): void {
    this.writeStructuredEntry('ERROR', message, traceOrMetadata, context);
  }

  warn(message: string, contextOrMetadata?: unknown): void {
    this.writeStructuredEntry('WARN', message, contextOrMetadata);
  }

  debug(message: string, contextOrMetadata?: unknown): void {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    this.writeStructuredEntry('DEBUG', message, contextOrMetadata);
  }

  verbose(message: string, contextOrMetadata?: unknown): void {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    this.writeStructuredEntry('VERBOSE', message, contextOrMetadata);
  }

  private writeStructuredEntry(
    level: string,
    message: string,
    metadata?: unknown,
    context?: string,
  ): void {
    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      service: 'asaie-v3-backend',
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (metadata !== undefined) {
      entry.metadata = this.redactSensitiveData(metadata);
    }

    const serialized = `${JSON.stringify(entry)}\n`;
    if (level === 'ERROR') {
      process.stderr.write(serialized);
    } else {
      process.stdout.write(serialized);
    }
  }

  private redactSensitiveData(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.redactSensitiveData(item));
    }
    if (typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, fieldValue] of Object.entries(
        value as Record<string, unknown>,
      )) {
        const normalizedKey = key.toLowerCase().replace(/[_-]/g, '');
        if (SENSITIVE_FIELD_NAMES.has(normalizedKey)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.redactSensitiveData(fieldValue);
        }
      }
      return sanitized;
    }
    return value;
  }
}
