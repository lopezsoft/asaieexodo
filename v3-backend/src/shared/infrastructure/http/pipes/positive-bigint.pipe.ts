import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

/**
 * Pipe de validacion estricta para parametros de ruta numericos positivos (BIGINT).
 */
@Injectable()
export class PositiveBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string, metadata: ArgumentMetadata): bigint {
    const trimmed = String(value ?? '').trim();
    if (!/^[1-9]\d{0,18}$/.test(trimmed)) {
      throw new BadRequestException(
        `El parámetro '${metadata.data ?? 'id'}' debe ser un entero positivo válido.`,
      );
    }
    return BigInt(trimmed);
  }
}
