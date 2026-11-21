export abstract class PasswordHasherPort {
  abstract hash(plainText: string): Promise<string>;
  abstract verify(plainText: string, passwordHash: string): Promise<boolean>;
  abstract needsRehash(passwordHash: string): boolean;
  abstract verifyDummy(plainText: string): Promise<void>;
}
