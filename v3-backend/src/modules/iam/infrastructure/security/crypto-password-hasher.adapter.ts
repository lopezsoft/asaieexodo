import { Injectable, Optional } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';

const scryptAsync = promisify(scrypt);
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
const MAX_PASSWORD_LENGTH = 128;
const DUMMY_SALT = '0123456789abcdef0123456789abcdef';

/**
 * Adaptador de hashing criptografico de contraseñas:
 * - Emite hashes modernos Node.js `scrypt` (64 bytes, salt aleatorio de 16 bytes).
 * - Soporta verificacion transparente de hashes legados `bcrypt` de Laravel (`$2y$`, `$2b$`, `$2a$`)
 *   utilizando la extension nativa `pgcrypto` de PostgreSQL 17 y señalizando `needsRehash() = true`
 *   para actualizar automaticamente a `scrypt` en el primer inicio de sesion exitoso.
 */
@Injectable()
export class CryptoPasswordHasherAdapter implements PasswordHasherPort {
  constructor(
    @Optional() private readonly db?: PostgresRlsService,
  ) {}

  async hash(plainText: string): Promise<string> {
    if (!plainText || plainText.length > MAX_PASSWORD_LENGTH) {
      throw new Error(
        `La contraseña debe tener entre 1 y ${MAX_PASSWORD_LENGTH} caracteres.`,
      );
    }
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(plainText, salt, 64)) as Buffer;
    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async verify(plainText: string, passwordHash: string): Promise<boolean> {
    if (
      !plainText ||
      !passwordHash ||
      plainText.length > MAX_PASSWORD_LENGTH
    ) {
      return false;
    }

    if (passwordHash.startsWith('scrypt:')) {
      const parts = passwordHash.split(':');
      if (parts.length !== 3) {
        return false;
      }
      const [, salt, keyHex] = parts;
      const keyBuffer = Buffer.from(keyHex, 'hex');
      const derivedKey = (await scryptAsync(plainText, salt, 64)) as Buffer;

      if (keyBuffer.length !== derivedKey.length) {
        return false;
      }
      return timingSafeEqual(keyBuffer, derivedKey);
    }

    // Compatibilidad con hashes legados bcrypt de Laravel ($2y$, $2a$, $2b$)
    if (BCRYPT_HASH_REGEX.test(passwordHash) && this.db) {
      const normalizedBcrypt = passwordHash.replace(/^\$2y\$/, '$2b$');
      const res = await this.db.queryGlobal<{ computed: string | null }>(
        `SELECT crypt($1, $2) AS computed`,
        [plainText, normalizedBcrypt],
      );
      const computed = res.rows[0]?.computed;
      if (!computed) {
        return false;
      }
      const computedBuf = Buffer.from(computed, 'utf8');
      const expectedBuf = Buffer.from(normalizedBcrypt, 'utf8');
      if (computedBuf.length !== expectedBuf.length) {
        return false;
      }
      return timingSafeEqual(computedBuf, expectedBuf);
    }

    return false;
  }

  needsRehash(passwordHash: string): boolean {
    return BCRYPT_HASH_REGEX.test(passwordHash);
  }

  async verifyDummy(plainText: string): Promise<void> {
    await scryptAsync(
      (plainText || 'dummy').slice(0, MAX_PASSWORD_LENGTH),
      DUMMY_SALT,
      64,
    );
  }
}
