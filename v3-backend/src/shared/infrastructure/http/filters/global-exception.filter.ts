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

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: SmartLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Ha ocurrido un error interno al procesar la solicitud.';

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
      message =
        typeof responsePayload === 'string'
          ? responsePayload
          : ((responsePayload as Record<string, unknown>).message as string) ||
            exception.message;
    }

    if (statusCode >= 500) {
      this.logger.error('Excepcion no controlada en peticion HTTP', {
        method: request.method,
        url: request.url,
        statusCode,
        errorMessage:
          exception instanceof Error ? exception.message : 'Unknown exception',
      });
    }

    void reply.status(statusCode).send({
      success: false,
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
