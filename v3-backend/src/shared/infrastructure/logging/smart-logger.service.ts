import { Injectable, LoggerService } from '@nestjs/common';

const SENSITIVE_FIELD_NAMES = new Set([
  'password',
  'passwordhash',
  'currentpassword',
  'newpassword',
  'oldpassword',
  'dbpassword',
  'redispassword',
  'mailpassword',
  'smtppassword',
  'mailusername',
  'token',
  'accesstoken',
  'refreshtoken',
  'resettoken',
  'confirmationtoken',
  'sessionid',
  'authorization',
  'cookie',
  'setcookie',
  'secret',
  'jwtsecret',
  'appkey',
  'apikey',
  'xapikey',
  'privatekey',
  'awsaccesskeyid',
  'awssecretaccesskey',
  'accesskeyid',
  'secretaccesskey',
  'securityanswer',
  'securityanswerhash',
  'documentnumber',
  'directordocument',
  'secretarydocument',
  'email',
  'recipientemail',
  'phone',
  'phones',
  'mobilephone',
  'address',
  'birthdate',
  'taxid',
]);

const SENSITIVE_KEY_PATTERN =
  /(password|passwd|pwd|secret|token|apikey|authorization|cookie|privatekey|credential|accesskey|securityanswer|documentnumber|email|phone)/i;

const MAX_SERIALIZE_DEPTH = 8;

/**
 * Servicio centralizado de logging (Regla 4 Obligatoria).
 * Reemplaza por completo console.log, redacta PII/credenciales/tokens en claves y textos planos,
 * y maneja de forma segura referencias circulares, BigInt, Date y Error.
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
      message: this.redactString(String(message)),
    };

    if (context) {
      entry.context = context;
    }

    if (metadata !== undefined) {
      entry.metadata = this.redactSensitiveData(metadata, new WeakSet(), 0);
    }

    let serialized: string;
    try {
      serialized = `${JSON.stringify(entry)}\n`;
    } catch {
      serialized = `${JSON.stringify({
        timestamp: entry.timestamp,
        level,
        service: entry.service,
        message: entry.message,
        metadata: '[UNSERIALIZABLE_METADATA]',
      })}\n`;
    }

    if (level === 'ERROR') {
      process.stderr.write(serialized);
    } else {
      process.stdout.write(serialized);
    }
  }

  private redactString(text: string): string {
    return text
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
      .replace(
        /([?&](?:token|resetToken|confirmationToken|api_key|password)=)[^&\s]+/gi,
        '$1[REDACTED]',
      )
      .replace(/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED_AWS_KEY]')
      .replace(
        /(postgres(?:ql)?|redis|mysql|smtp):\/\/([^:\s/]+):([^@\s/]+)@/gi,
        '$1://$2:[REDACTED]@',
      );
  }

  private redactSensitiveData(
    value: unknown,
    visited: WeakSet<object>,
    depth: number,
  ): unknown {
    if (value === null || value === undefined) {
      return value;
    }
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (typeof value === 'string') {
      return this.redactString(value);
    }
    if (typeof value !== 'object') {
      return value;
    }
    if (depth >= MAX_SERIALIZE_DEPTH) {
      return '[MAX_DEPTH_REACHED]';
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (value instanceof Error) {
      const errObj: Record<string, unknown> = {
        name: value.name,
        message: this.redactString(value.message),
      };
      if (process.env.NODE_ENV !== 'production' && value.stack) {
        errObj.stack = this.redactString(value.stack);
      }
      return errObj;
    }
    if (visited.has(value)) {
      return '[CIRCULAR_REFERENCE]';
    }
    visited.add(value);

    if (Array.isArray(value)) {
      return value.map((item) =>
        this.redactSensitiveData(item, visited, depth + 1),
      );
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, fieldValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const normalizedKey = key.toLowerCase().replace(/[_-]/g, '');
      if (
        SENSITIVE_FIELD_NAMES.has(normalizedKey) ||
        SENSITIVE_KEY_PATTERN.test(normalizedKey)
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = this.redactSensitiveData(
          fieldValue,
          visited,
          depth + 1,
        );
      }
    }
    return sanitized;
  }
}
