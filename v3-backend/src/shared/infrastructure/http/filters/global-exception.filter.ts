import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import { TenantAccessDeniedException } from '../../../domain/exceptions/tenant-access-denied.exception';
import { SmartLoggerService } from '../../logging/smart-logger.service';

interface PgDatabaseError {
  readonly code?: string;
  readonly constraint?: string;
  readonly detail?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: SmartLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const safePath = (request.url ?? '/').split('?')[0];

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message: string | string[] =
      'Ha ocurrido un error interno al procesar la solicitud.';

    if (exception instanceof TenantAccessDeniedException) {
      statusCode = HttpStatus.FORBIDDEN;
      errorCode = exception.code;
      message = exception.message;
    } else if (exception instanceof ResourceNotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
      errorCode = exception.code;
      message = exception.message;
    } else if (exception instanceof DomainException) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      errorCode = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const responsePayload = exception.getResponse();
      errorCode = exception.name;
      if (typeof responsePayload === 'string') {
        message = responsePayload;
      } else {
        const payloadObj = responsePayload as Record<string, unknown>;
        message =
          (payloadObj.message as string | string[]) || exception.message;
      }
    } else if (
      exception instanceof SyntaxError &&
      exception.message.includes('BigInt')
    ) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = 'INVALID_IDENTIFIER_FORMAT';
      message = 'El identificador numérico suministrado no tiene un formato válido.';
    } else if (this.isPgDatabaseError(exception)) {
      const mapped = this.mapPostgresError(exception);
      statusCode = mapped.statusCode;
      errorCode = mapped.errorCode;
      message = mapped.message;
    }

    if (statusCode >= 500) {
      this.logger.error('Excepcion no controlada en peticion HTTP', {
        method: request.method,
        path: safePath,
        statusCode,
        error: exception instanceof Error ? exception : 'Unknown exception',
      });
    } else if (
      statusCode === HttpStatus.UNAUTHORIZED ||
      statusCode === HttpStatus.FORBIDDEN
    ) {
      this.logger.warn('Evento de seguridad HTTP (Acceso denegado / No autorizado)', {
        method: request.method,
        path: safePath,
        statusCode,
        errorCode,
      });
    }

    void reply.status(statusCode).send({
      success: false,
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: safePath,
    });
  }

  private isPgDatabaseError(error: unknown): error is PgDatabaseError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as PgDatabaseError).code === 'string' &&
      /^[0-9A-Z]{5}$/.test((error as PgDatabaseError).code!)
    );
  }

  private mapPostgresError(error: PgDatabaseError): {
    statusCode: number;
    errorCode: string;
    message: string;
  } {
    switch (error.code) {
      case '23505':
        return {
          statusCode: HttpStatus.CONFLICT,
          errorCode: 'DUPLICATE_RESOURCE',
          message: 'Ya existe un registro con los mismos datos únicos.',
        };
      case '22P02':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: 'INVALID_DATA_SYNTAX',
          message: 'Uno o más parámetros enviados tienen un formato de dato inválido.',
        };
      case '23503':
        return {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          errorCode: 'REFERENTIAL_INTEGRITY_VIOLATION',
          message: 'El registro referenciado no existe o no pertenece a la institución activa.',
        };
      case '23514':
        return {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          errorCode: 'CHECK_CONSTRAINT_VIOLATION',
          message: 'Los datos enviados incumplen una regla de integridad del dominio.',
        };
      case '42501':
        return {
          statusCode: HttpStatus.FORBIDDEN,
          errorCode: 'RLS_POLICY_VIOLATION',
          message: 'Acceso denegado por política de aislamiento multi-colegio (RLS).',
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: 'DATABASE_ERROR',
          message: 'Error al procesar la operación en la base de datos.',
        };
    }
  }
}
