import {
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  CurrentUser,
  RequireAnyPermission,
  RequireModule,
  RequirePermissions,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { ManageElectionsUseCase } from '../../application/use-cases/manage-elections.use-case';
import {
  AddElectionJuryDto,
  CastElectionVoteDto,
  SaveElectionCandidateDto,
  SavePollingStationDto,
  SaveSchoolElectionDto,
} from './dto/elections.dto';

@ApiTags('School Government & Electronic Voting')
@ApiBearerAuth('jwt-auth')
@RequireModule(RBAC_MODULES.SCHOOL_ELECTIONS)
@Controller('elections')
export class ElectionsController {
  constructor(private readonly electionsUseCase: ManageElectionsUseCase) {}

  @Get('candidacy-types')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_VIEW)
  async listCandidacyTypes(@CurrentUser() p: ActiveTenantContext) {
    return {
      success: true,
      data: await this.electionsUseCase.listCandidacyTypes(p.schoolId),
    };
  }

  @Get()
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_VIEW)
  async listElections(@CurrentUser() p: ActiveTenantContext) {
    return {
      success: true,
      data: await this.electionsUseCase.listElections(p.schoolId),
    };
  }

  @Post()
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async createElection(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveSchoolElectionDto,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.saveElection(p.schoolId, dto),
    };
  }

  @Patch(':electionId')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_MANAGE)
  async updateElection(
    @CurrentUser() p: ActiveTenantContext,
    @Param('electionId', PositiveBigIntPipe) electionId: bigint,
    @Body() dto: SaveSchoolElectionDto,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.saveElection(p.schoolId, {
        ...dto,
        id: electionId,
      }),
    };
  }

  @Delete(':electionId')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_DELETE)
  async deleteElection(
    @CurrentUser() p: ActiveTenantContext,
    @Param('electionId', PositiveBigIntPipe) electionId: bigint,
  ) {
    await this.electionsUseCase.deleteElection(p.schoolId, electionId);
    return { success: true, data: { deleted: true, id: Number(electionId) } };
  }

  // Mesas y jurados
  @Get(':electionId/stations')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_VIEW)
  async listStations(
    @CurrentUser() p: ActiveTenantContext,
    @Param('electionId', PositiveBigIntPipe) electionId: bigint,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.listStations(p.schoolId, electionId),
    };
  }

  @Post(':electionId/stations')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async createStation(
    @CurrentUser() p: ActiveTenantContext,
    @Param('electionId', PositiveBigIntPipe) electionId: bigint,
    @Body() dto: SavePollingStationDto,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.saveStation(p.schoolId, electionId, dto),
    };
  }

  @Delete('stations/:stationId')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_MANAGE)
  async deleteStation(
    @CurrentUser() p: ActiveTenantContext,
    @Param('stationId', PositiveBigIntPipe) stationId: bigint,
  ) {
    await this.electionsUseCase.deleteStation(p.schoolId, stationId);
    return { success: true, data: { deleted: true, id: Number(stationId) } };
  }

  @Post('stations/:stationId/juries')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async addJury(
    @CurrentUser() p: ActiveTenantContext,
    @Param('stationId', PositiveBigIntPipe) stationId: bigint,
    @Body() dto: AddElectionJuryDto,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.addJury(p.schoolId, stationId, dto),
    };
  }

  @Delete('juries/:juryId')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_MANAGE)
  async deleteJury(
    @CurrentUser() p: ActiveTenantContext,
    @Param('juryId', PositiveBigIntPipe) juryId: bigint,
  ) {
    await this.electionsUseCase.deleteJury(p.schoolId, juryId);
    return { success: true, data: { deleted: true, id: Number(juryId) } };
  }

  // Candidatos
  @Get(':electionId/candidates')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_VIEW)
  async listCandidates(
    @CurrentUser() p: ActiveTenantContext,
    @Param('electionId', PositiveBigIntPipe) electionId: bigint,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.listCandidates(p.schoolId, electionId),
    };
  }

  @Post(':electionId/candidates')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async createCandidate(
    @CurrentUser() p: ActiveTenantContext,
    @Param('electionId', PositiveBigIntPipe) electionId: bigint,
    @Body() dto: SaveElectionCandidateDto,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.saveCandidate(p.schoolId, electionId, dto),
    };
  }

  @Patch(':electionId/candidates/:candidateId')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_MANAGE)
  async updateCandidate(
    @CurrentUser() p: ActiveTenantContext,
    @Param('electionId', PositiveBigIntPipe) electionId: bigint,
    @Param('candidateId', PositiveBigIntPipe) candidateId: bigint,
    @Body() dto: SaveElectionCandidateDto,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.saveCandidate(p.schoolId, electionId, {
        ...dto,
        id: candidateId,
      }),
    };
  }

  @Delete('candidates/:candidateId')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_MANAGE)
  async deleteCandidate(
    @CurrentUser() p: ActiveTenantContext,
    @Param('candidateId', PositiveBigIntPipe) candidateId: bigint,
  ) {
    await this.electionsUseCase.deleteCandidate(p.schoolId, candidateId);
    return { success: true, data: { deleted: true, id: Number(candidateId) } };
  }

  // Cabina electoral estudiantil y escrutinio en vivo
  @Get('active-ballot')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_VIEW)
  @ApiOperation({
    summary:
      'Obtener tarjetón electoral activo y estado de votación del estudiante autenticado',
  })
  async getActiveBallot(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    const year =
      academicYear && /^\d{4}$/.test(academicYear)
        ? Number(academicYear)
        : p.academicYear;
    return {
      success: true,
      data: await this.electionsUseCase.getActiveBallot(
        p.schoolId,
        p.userId,
        year,
      ),
    };
  }

  @Post(':electionId/vote')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
    RBAC_PERMISSIONS.ELECTIONS_MANAGE,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar voto único verificado por candidatura y estudiante',
  })
  async castVote(
    @CurrentUser() p: ActiveTenantContext,
    @Param('electionId', PositiveBigIntPipe) electionId: bigint,
    @Body() dto: CastElectionVoteDto,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.castVote(
        p.schoolId,
        p.userId,
        electionId,
        dto,
      ),
    };
  }

  @Get(':electionId/results')
  @RequirePermissions(RBAC_PERMISSIONS.ELECTIONS_VIEW)
  @ApiOperation({
    summary: 'Escrutinio electoral en vivo por candidatura, candidato y mesa',
  })
  async getResults(
    @CurrentUser() p: ActiveTenantContext,
    @Param('electionId', PositiveBigIntPipe) electionId: bigint,
  ) {
    return {
      success: true,
      data: await this.electionsUseCase.getElectionResults(
        p.schoolId,
        electionId,
      ),
    };
  }
}
