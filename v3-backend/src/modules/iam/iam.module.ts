import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { IamCommunityProvisioningService } from './application/services/iam-community-provisioning.service';
import { AuthenticateCommunityUserUseCase } from './application/use-cases/authenticate-community-user.use-case';
import { RegisterSchoolUseCase } from './application/use-cases/register-school.use-case';
import { CommunityUserRepositoryPort } from './domain/ports/community-user.repository.port';
import { PasswordHasherPort } from './domain/ports/password-hasher.port';
import { SchoolOnboardingRepositoryPort } from './domain/ports/school-onboarding.repository.port';
import { IamController } from './infrastructure/http/iam.controller';
import { PostgresCommunityUserRepository } from './infrastructure/persistence/postgres-community-user.repository';
import { PostgresSchoolOnboardingRepository } from './infrastructure/persistence/postgres-school-onboarding.repository';
import { CryptoPasswordHasherAdapter } from './infrastructure/security/crypto-password-hasher.adapter';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'asaie-v3-super-secret-development-key-change-in-production',
        ),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '8h') as any,
        },
      }),
    }),
  ],
  controllers: [IamController],
  providers: [
    AuthenticateCommunityUserUseCase,
    RegisterSchoolUseCase,
    IamCommunityProvisioningService,
    {
      provide: CommunityUserRepositoryPort,
      useClass: PostgresCommunityUserRepository,
    },
    {
      provide: SchoolOnboardingRepositoryPort,
      useClass: PostgresSchoolOnboardingRepository,
    },
    {
      provide: PasswordHasherPort,
      useClass: CryptoPasswordHasherAdapter,
    },
  ],
  exports: [
    JwtModule,
    AuthenticateCommunityUserUseCase,
    RegisterSchoolUseCase,
    IamCommunityProvisioningService,
    CommunityUserRepositoryPort,
    SchoolOnboardingRepositoryPort,
    PasswordHasherPort,
  ],
})
export class IamModule {}
