import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ActiveTenantContext } from '../../shared/application/context/tenant-context.service';
import {
  CurrentUser,
  RequireAnyPermission,
  RequirePermissions,
} from '../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import { ExodoGridQueryDto } from '../../shared/infrastructure/http/pagination/exodo-grid-query.dto';
import {
  buildLaravelPaginatorResponse,
  normalizeExodoGridQuery,
} from '../../shared/infrastructure/http/pagination/laravel-paginator';
import { RBAC_PERMISSIONS } from '../../shared/infrastructure/rbac/rbac-permissions.constants';
import {
  RBAC_MEMBERSHIP_AUDIENCES,
  RbacMembershipAudience,
  RbacPermissionsService,
} from '../../shared/infrastructure/rbac/rbac-permissions.service';
import { CommunityRole } from '../iam/domain/enums/community-role.enum';

export class RolePermissionChangeItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  permissionCode!: string;

  @IsString()
  @IsIn(['ALLOW', 'DENY', 'DEFAULT'])
  effect!: 'ALLOW' | 'DENY' | 'DEFAULT';
}

export class UpdateSchoolRoleMatrixDto {
  @IsEnum(CommunityRole)
  role!: CommunityRole;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RolePermissionChangeItemDto)
  changes!: RolePermissionChangeItemDto[];
}

export class UserPermissionOverrideItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  permissionCode!: string;

  @IsString()
  @IsIn(['ALLOW', 'DENY', 'INHERIT'])
  effect!: 'ALLOW' | 'DENY' | 'INHERIT';
}

export class UpdateUserPermissionOverridesDto {
  @IsEnum(CommunityRole)
  role!: CommunityRole;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => UserPermissionOverrideItemDto)
  changes!: UserPermissionOverrideItemDto[];
}

export class AssignSchoolMembershipDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  identifier?: string;

  @IsEnum(CommunityRole)
  role!: CommunityRole;
}

export class ToggleSchoolMembershipDto {
  @IsBoolean()
  isActive!: boolean;
}

export class RbacMembershipsQueryDto extends ExodoGridQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  audience?: string;
}

@ApiTags('RBAC Permissions & Institutional Memberships')
@ApiBearerAuth('jwt-auth')
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacPermissionsService) {}

  @Get('catalog')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.IAM_RBAC_MANAGE,
    RBAC_PERMISSIONS.IAM_MEMBERSHIPS_VIEW,
  )
  @ApiOperation({
    summary: 'Listar catálogo maestro de permisos atómicos del sistema',
  })
  async listCatalog() {
    return {
      success: true,
      data: await this.rbacService.listPermissionsCatalog(),
    };
  }

  @Get('roles-matrix')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.IAM_RBAC_MANAGE,
    RBAC_PERMISSIONS.IAM_MEMBERSHIPS_VIEW,
  )
  @ApiOperation({
    summary:
      'Consultar matriz de permisos efectivos y overrides institucionales por rol',
  })
  async getRolesMatrix(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.rbacService.getRolesMatrix(principal.schoolId),
    };
  }

  @Patch('roles-matrix')
  @RequirePermissions(RBAC_PERMISSIONS.IAM_RBAC_MANAGE)
  @ApiOperation({
    summary:
      'Personalizar permisos (ALLOW / DENY / DEFAULT) para un rol en el colegio activo',
  })
  async updateRolesMatrix(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: UpdateSchoolRoleMatrixDto,
  ) {
    const result = await this.rbacService.updateSchoolRolePermissions({
      schoolId: principal.schoolId,
      actorUserId: principal.userId,
      role: dto.role,
      changes: dto.changes,
    });
    return {
      success: true,
      data: result,
    };
  }

  @Post('roles-matrix/:role/reset')
  @RequirePermissions(RBAC_PERMISSIONS.IAM_RBAC_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Restablecer los permisos de un rol a la configuración MEN por defecto',
  })
  async resetRoleMatrix(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('role') rawRole: string,
  ) {
    const role = rawRole.toUpperCase() as CommunityRole;
    if (!Object.values(CommunityRole).includes(role)) {
      throw new BadRequestException(`El rol '${rawRole}' no es válido.`);
    }
    const result = await this.rbacService.resetSchoolRolePermissions(
      principal.schoolId,
      principal.userId,
      role,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('users/:userId/overrides')
  @RequirePermissions(RBAC_PERMISSIONS.IAM_RBAC_MANAGE)
  @ApiQuery({ name: 'role', enum: CommunityRole, required: true })
  @ApiOperation({
    summary:
      'Consultar excepciones puntuales (ALLOW/DENY) de un usuario en un rol específico',
  })
  async getUserOverrides(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('userId', PositiveBigIntPipe) userId: bigint,
    @Query('role') rawRole: string,
  ) {
    const role = (rawRole ?? '').toUpperCase() as CommunityRole;
    if (!Object.values(CommunityRole).includes(role)) {
      throw new BadRequestException(
        `Debe especificar un parámetro 'role' válido.`,
      );
    }
    return {
      success: true,
      data: await this.rbacService.getUserOverrides(
        principal.schoolId,
        userId,
        role,
      ),
    };
  }

  @Patch('users/:userId/overrides')
  @RequirePermissions(RBAC_PERMISSIONS.IAM_RBAC_MANAGE)
  @ApiOperation({
    summary:
      'Guardar o revocar excepciones individuales de permisos para un usuario',
  })
  async updateUserOverrides(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('userId', PositiveBigIntPipe) userId: bigint,
    @Body() dto: UpdateUserPermissionOverridesDto,
  ) {
    return {
      success: true,
      data: await this.rbacService.updateUserOverrides({
        schoolId: principal.schoolId,
        actorUserId: principal.userId,
        targetUserId: userId,
        role: dto.role,
        changes: dto.changes,
      }),
    };
  }

  @Get('memberships/summary')
  @RequirePermissions(RBAC_PERMISSIONS.IAM_MEMBERSHIPS_VIEW)
  @ApiOperation({
    summary:
      'Consultar conteo resumido de usuarios por audiencia y rol institucional en el colegio activo',
  })
  async getMembershipsSummary(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.rbacService.getSchoolMembershipsSummary(
        principal.schoolId,
      ),
    };
  }

  @Get('memberships')
  @RequirePermissions(RBAC_PERMISSIONS.IAM_MEMBERSHIPS_VIEW)
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', enum: CommunityRole, required: false })
  @ApiQuery({ name: 'audience', enum: RBAC_MEMBERSHIP_AUDIENCES, required: false })
  @ApiQuery({ name: 'paginated', required: false, example: '1' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 15 })
  @ApiOperation({
    summary:
      'Listar usuarios y sus roles asignados dentro del colegio activo con filtrado por audiencia y paginación remota',
  })
  async listMemberships(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: RbacMembershipsQueryDto,
  ): Promise<unknown> {
    let roleFilter: CommunityRole | undefined;
    if (query.role && query.role.trim().length > 0) {
      const parsed = query.role.trim().toUpperCase() as CommunityRole;
      if (!Object.values(CommunityRole).includes(parsed)) {
        throw new BadRequestException(
          `El filtro de rol '${query.role}' no es válido.`,
        );
      }
      roleFilter = parsed;
    }

    let audience: RbacMembershipAudience | undefined;
    if (query.audience && query.audience.trim().length > 0) {
      const parsedAudience = query.audience
        .trim()
        .toUpperCase() as RbacMembershipAudience;
      if (!RBAC_MEMBERSHIP_AUDIENCES.includes(parsedAudience)) {
        throw new BadRequestException(
          `El filtro de audiencia '${query.audience}' no es válido.`,
        );
      }
      audience = parsedAudience;
    }

    const normalized = normalizeExodoGridQuery(query, 15, 500);
    const result = await this.rbacService.listSchoolMembershipsPaginated(
      principal.schoolId,
      {
        search: normalized.search,
        roleFilter,
        audience,
        filterField: normalized.filterField,
        filterValue: normalized.filterValue,
        sortField: normalized.sortField,
        sortDirection: normalized.sortDirection,
        limit: normalized.limit,
        offset: normalized.offset,
      },
    );

    if (normalized.isLaravelPagination) {
      return buildLaravelPaginatorResponse({
        items: result.items,
        total: result.total,
        page: normalized.page,
        perPage: normalized.limit,
        basePath: '/api/v1/rbac/memberships',
        queryParams: {
          audience,
          role: roleFilter,
          search: normalized.search,
        },
      });
    }

    return {
      success: true,
      data: result.items,
    };
  }

  @Post('memberships')
  @RequirePermissions(RBAC_PERMISSIONS.IAM_MEMBERSHIPS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Asignar o reactivar un rol institucional a un usuario existente en el colegio',
  })
  async assignMembership(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: AssignSchoolMembershipDto,
  ) {
    return {
      success: true,
      data: await this.rbacService.assignSchoolMembership({
        schoolId: principal.schoolId,
        actorRole: principal.activeRole,
        actorUserId: principal.userId,
        userId: dto.userId,
        identifier: dto.identifier,
        role: dto.role,
      }),
    };
  }

  @Patch('memberships/:membershipId')
  @RequirePermissions(RBAC_PERMISSIONS.IAM_MEMBERSHIPS_MANAGE)
  @ApiOperation({
    summary:
      'Activar o suspender una membresía de rol (revoca sesiones activas al suspender)',
  })
  async toggleMembership(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('membershipId', PositiveBigIntPipe) membershipId: bigint,
    @Body() dto: ToggleSchoolMembershipDto,
  ) {
    return {
      success: true,
      data: await this.rbacService.toggleSchoolMembership({
        schoolId: principal.schoolId,
        actorRole: principal.activeRole,
        actorUserId: principal.userId,
        membershipId,
        isActive: dto.isActive,
      }),
    };
  }

  @Delete('memberships/:membershipId')
  @RequirePermissions(RBAC_PERMISSIONS.IAM_MEMBERSHIPS_MANAGE)
  @ApiOperation({
    summary:
      'Eliminar una membresía de rol del colegio y revocar sesiones activas',
  })
  async removeMembership(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('membershipId', PositiveBigIntPipe) membershipId: bigint,
  ) {
    return {
      success: true,
      data: await this.rbacService.removeSchoolMembership({
        schoolId: principal.schoolId,
        actorRole: principal.activeRole,
        actorUserId: principal.userId,
        membershipId,
      }),
    };
  }
}
