import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordconfirmation',
  'currentpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'apikey',
  'documentnumber',
]);

/**
 * Servicio centralizado de depuracion para Angular.
 * Evita exponer trazas o datos sensibles (PII, tokens, credenciales) en produccion.
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

    const sanitizedPayload =
      payload !== undefined ? this.sanitizePayload(payload) : undefined;
    const prefix = `[ASAIE-V3][${level.toUpperCase()}][${context}]`;

    const loggerFn =
      level === 'error'
        ? globalThis.console.error
        : level === 'warn'
          ? globalThis.console.warn
          : globalThis.console.info;

    if (sanitizedPayload !== undefined) {
      loggerFn(`${prefix} ${message}`, sanitizedPayload);
    } else {
      loggerFn(`${prefix} ${message}`);
    }
  }

  private sanitizePayload(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizePayload(item));
    }
    if (typeof value === 'object') {
      const sanitizedRecord: Record<string, unknown> = {};
      for (const [key, entryValue] of Object.entries(
        value as Record<string, unknown>,
      )) {
        if (SENSITIVE_KEYS.has(key.toLowerCase().replace(/[_-]/g, ''))) {
          sanitizedRecord[key] = '[REDACTED]';
        } else {
          sanitizedRecord[key] = this.sanitizePayload(entryValue);
        }
      }
      return sanitizedRecord;
    }
    return value;
  }
}
