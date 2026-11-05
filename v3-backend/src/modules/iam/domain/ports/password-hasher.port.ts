export abstract class PasswordHasherPort {
  abstract hash(plainText: string): Promise<string>;
  abstract verify(plainText: string, passwordHash: string): Promise<boolean>;
}
