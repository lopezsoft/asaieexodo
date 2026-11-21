import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordconfirmation',
  'currentpassword',
  'newpassword',
  'oldpassword',
  'confirmpassword',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'resettoken',
  'confirmationtoken',
  'jwt',
  'bearer',
  'authorization',
  'cookie',
  'secret',
  'apikey',
  'documentnumber',
  'cedula',
  'dni',
  'identification',
  'email',
  'phone',
  'phonenumber',
  'mobile',
  'address',
  'fullname',
  'firstname',
  'lastname',
  'username',
  'birthdate',
]);

const MAX_DEPTH = 6;

/**
 * Servicio centralizado de depuracion para Angular (Regla 4 Obligatoria).
 * Evita exponer trazas o datos sensibles (PII, tokens JWT, credenciales) en produccion
 * y protege contra referencias circulares, instancias Error y Date.
 */
@Injectable({
  providedIn: 'root',
})
export class DebugService {
  private readonly isProduction = environment.production;

  debug(context: string, message: string, metadata?: unknown): void {
    this.writeLog('debug', context, message, metadata);
  }

  info(context: string, message: string, metadata?: unknown): void {
    this.writeLog('info', context, message, metadata);
  }

  warn(context: string, message: string, metadata?: unknown): void {
    this.writeLog('warn', context, message, metadata);
  }

  error(context: string, message: string, error?: unknown): void {
    this.writeLog('error', context, message, error);
  }

  private writeLog(
    level: LogLevel,
    context: string,
    message: string,
    payload?: unknown,
  ): void {
    if (this.isProduction && level !== 'error') {
      return;
    }

    const prefix = `[ASAIE-V3][${level.toUpperCase()}][${context}]`;
    const safeMessage = this.redactString(message);
    const consoleRef = globalThis.console;

    // En produccion nunca exponer payloads detallados en consola del navegador
    if (this.isProduction) {
      consoleRef.error(`${prefix} ${safeMessage}`);
      return;
    }

    const sanitizedPayload =
      payload !== undefined
        ? this.sanitizePayload(payload, new WeakSet(), 0)
        : undefined;

    if (level === 'error') {
      sanitizedPayload !== undefined
        ? consoleRef.error(`${prefix} ${safeMessage}`, sanitizedPayload)
        : consoleRef.error(`${prefix} ${safeMessage}`);
    } else if (level === 'warn') {
      sanitizedPayload !== undefined
        ? consoleRef.warn(`${prefix} ${safeMessage}`, sanitizedPayload)
        : consoleRef.warn(`${prefix} ${safeMessage}`);
    } else if (level === 'debug') {
      sanitizedPayload !== undefined
        ? consoleRef.debug(`${prefix} ${safeMessage}`, sanitizedPayload)
        : consoleRef.debug(`${prefix} ${safeMessage}`);
    } else {
      sanitizedPayload !== undefined
        ? consoleRef.info(`${prefix} ${safeMessage}`, sanitizedPayload)
        : consoleRef.info(`${prefix} ${safeMessage}`);
    }
  }

  private redactString(value: string): string {
    return value
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
      .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_JWT]');
  }

  private sanitizePayload(
    value: unknown,
    visited: WeakSet<object>,
    depth: number,
  ): unknown {
    if (value === null || value === undefined) {
      return value;
    }
    if (typeof value === 'string') {
      return this.redactString(value);
    }
    if (typeof value !== 'object') {
      return value;
    }
    if (depth >= MAX_DEPTH) {
      return '[MAX_DEPTH]';
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (value instanceof RegExp) {
      return value.toString();
    }
    if (value instanceof Error) {
      return {
        name: value.name,
        message: this.redactString(value.message),
      };
    }
    if (visited.has(value)) {
      return '[CIRCULAR]';
    }
    visited.add(value);

    if (Array.isArray(value)) {
      return value.map((item) =>
        this.sanitizePayload(item, visited, depth + 1),
      );
    }

    const sanitizedRecord: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const normalized = key.toLowerCase().replace(/[_-]/g, '');
      if (SENSITIVE_KEYS.has(normalized)) {
        sanitizedRecord[key] = '[REDACTED]';
      } else {
        sanitizedRecord[key] = this.sanitizePayload(
          entryValue,
          visited,
          depth + 1,
        );
      }
    }
    return sanitizedRecord;
  }
}
