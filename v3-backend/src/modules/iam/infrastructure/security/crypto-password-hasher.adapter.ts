import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';

const scryptAsync = promisify(scrypt);

@Injectable()
export class CryptoPasswordHasherAdapter implements PasswordHasherPort {
  async hash(plainText: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(plainText, salt, 64)) as Buffer;
    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async verify(plainText: string, passwordHash: string): Promise<boolean> {
    if (!passwordHash.startsWith('scrypt:')) {
      return false;
    }
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
}
