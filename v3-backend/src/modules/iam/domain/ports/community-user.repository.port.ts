import { CommunityUser } from '../entities/community-user.entity';
import { CommunityRole } from '../enums/community-role.enum';

export interface UpsertCommunityUserInput {
  readonly documentTypeId: number;
  readonly documentNumber: string;
  readonly email?: string | null;
  readonly username: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly middleName?: string | null;
  readonly lastName: string;
  readonly secondLastName?: string | null;
  readonly schoolId: bigint;
  readonly role: CommunityRole;
}

export abstract class CommunityUserRepositoryPort {
  abstract findByUsernameOrDocument(
    identifier: string,
  ): Promise<CommunityUser | null>;
  abstract findById(userId: bigint): Promise<CommunityUser | null>;
  abstract upsertWithMembership(
    input: UpsertCommunityUserInput,
  ): Promise<CommunityUser>;
}
