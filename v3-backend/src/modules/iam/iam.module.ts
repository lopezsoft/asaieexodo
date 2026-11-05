import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticateCommunityUserUseCase } from './application/use-cases/authenticate-community-user.use-case';
import { CommunityUserRepositoryPort } from './domain/ports/community-user.repository.port';
import { PasswordHasherPort } from './domain/ports/password-hasher.port';
import { IamController } from './infrastructure/http/iam.controller';
import { PostgresCommunityUserRepository } from './infrastructure/persistence/postgres-community-user.repository';
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
          expiresIn: '8h',
        },
      }),
    }),
  ],
  controllers: [IamController],
  providers: [
    AuthenticateCommunityUserUseCase,
    {
      provide: CommunityUserRepositoryPort,
      useClass: PostgresCommunityUserRepository,
    },
    {
      provide: PasswordHasherPort,
      useClass: CryptoPasswordHasherAdapter,
    },
  ],
  exports: [
    AuthenticateCommunityUserUseCase,
    CommunityUserRepositoryPort,
    PasswordHasherPort,
  ],
})
export class IamModule {}
