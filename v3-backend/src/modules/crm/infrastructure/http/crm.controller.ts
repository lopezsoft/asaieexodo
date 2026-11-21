import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
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
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  CurrentUser,
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { ManageSchoolCrmUseCase } from '../../application/use-cases/manage-school-crm.use-case';

const ALLOWED_DOCUMENT_SOURCES = [
  'PEI',
  'SIEE',
  'MANUAL_CONVIVENCIA',
  'FAQ_CIRCULAR',
  'CRM_MESSAGE',
  'ACADEMIC_CALENDAR',
] as const;

export class ConversationParticipantDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  userId!: number;

  @ApiProperty({ enum: CommunityRole, example: CommunityRole.FAMILY })
  @IsEnum(CommunityRole)
  participantRole!: CommunityRole;
}

export class CreateCrmConversationRequestDto {
  @ApiProperty({
    example: 1,
    description:
      'Canal de comunicación omnicanal (1=IN_APP, 2=WHATSAPP, 3=EMAIL, 4=SMS, 5=PUSH_NOTIFICATION)',
  })
  @IsInt()
  @Min(1)
  @Max(10)
  channelId!: number;

  @ApiPropertyOptional({ example: 105 })
  @IsOptional()
  @IsInt()
  @Min(1)
  studentEnrollmentId?: number;

  @ApiProperty({
    example: 'Seguimiento académico y citación de padres - Primer Periodo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  subject!: string;

  @ApiProperty({
    example: 'FAMILY_TEACHER',
    enum: ['DIRECT', 'GROUP_ACADEMIC', 'FAMILY_TEACHER', 'ADMINISTRATIVE'],
  })
  @IsString()
  @IsIn(['DIRECT', 'GROUP_ACADEMIC', 'FAMILY_TEACHER', 'ADMINISTRATIVE'])
  conversationType!:
    | 'DIRECT'
    | 'GROUP_ACADEMIC'
    | 'FAMILY_TEACHER'
    | 'ADMINISTRATIVE';

  @ApiProperty({ type: [ConversationParticipantDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ConversationParticipantDto)
  participantUserIds!: ConversationParticipantDto[];

  @ApiProperty({
    example:
      'Cordial saludo acudiente, le compartimos el avance académico del primer periodo.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  initialMessageBody!: string;
}

export class SendCrmMessageRequestDto {
  @ApiProperty({ example: 'Gracias docente, asistiremos puntualmente a la reunión.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  bodyText!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  channelId?: number;

  @ApiPropertyOptional({ example: 42 })
  @IsOptional()
  @IsInt()
  @Min(1)
  attachmentFileId?: number;
}

export class CreateCrmAnnouncementRequestDto {
  @ApiProperty({
    example: ['TEACHER', 'STUDENT', 'FAMILY'],
    enum: CommunityRole,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(CommunityRole, { each: true })
  targetRoles!: CommunityRole[];

  @ApiProperty({ example: 'Circular 012 - Entrega de Boletines Primer Periodo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title!: string;

  @ApiProperty({ example: 'Se convoca a padres de familia y acudientes el próximo viernes a las 7:00 AM.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  contentBody!: string;

  @ApiPropertyOptional({ enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], example: 'NORMAL' })
  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priorityLevel?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  requiresAcknowledgment?: boolean;

  @ApiPropertyOptional({ example: '2026-12-15T23:59:59.000Z' })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  campusId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  shiftId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  gradeId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  academicGroupId?: number;
}

export class CreateCrmSupportTicketRequestDto {
  @ApiProperty({ example: 2, description: 'ID de categoría PQRSD (1..6)' })
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiPropertyOptional({ example: 101 })
  @IsOptional()
  @IsInt()
  @Min(1)
  studentEnrollmentId?: number;

  @ApiProperty({ example: 'Solicitud de certificado de estudio 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  subject!: string;

  @ApiProperty({ example: 'Requiero constancia de matrícula activa firmada para trámite de subsidio.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], example: 'MEDIUM' })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export class UpdateCrmSupportTicketRequestDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  assignedUserId?: number;

  @ApiPropertyOptional({ enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
  @IsOptional()
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
  @IsOptional()
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status?: string;
}

export class IndexKnowledgeEmbeddingRequestDto {
  @ApiProperty({ example: 'SIEE', enum: ALLOWED_DOCUMENT_SOURCES })
  @IsString()
  @IsIn(ALLOWED_DOCUMENT_SOURCES)
  documentSource!: (typeof ALLOWED_DOCUMENT_SOURCES)[number];

  @ApiProperty({ example: 'Artículo 14 - Criterios de Promoción y Nivelación SIEE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title!: string;

  @ApiProperty({
    example:
      'Todo estudiante que obtenga desempeño bajo en una o dos áreas tendrá derecho a presentar actividades de superación antes del cierre del año lectivo.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15000)
  chunkText!: string;

  @ApiPropertyOptional({
    description: 'Vector numérico opcional de exactamente 768 dimensiones',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(768)
  @ArrayMaxSize(768)
  @IsNumber({}, { each: true })
  embedding?: number[];

  @ApiPropertyOptional({ example: { article: 14, resolutionYear: 2026 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class SemanticKnowledgeSearchRequestDto {
  @ApiPropertyOptional({
    example: 'requisitos para nivelación y superación de áreas perdidas según SIEE',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  queryText?: string;

  @ApiPropertyOptional({
    description: 'Vector de consulta de exactamente 768 dimensiones (opcional)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(768)
  @ArrayMaxSize(768)
  @IsNumber({}, { each: true })
  queryEmbedding?: number[];

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ example: 'SIEE', enum: ALLOWED_DOCUMENT_SOURCES })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_DOCUMENT_SOURCES)
  documentSource?: (typeof ALLOWED_DOCUMENT_SOURCES)[number];
}

@ApiTags('School CRM & Vector AI (pgvector)')
@ApiBearerAuth('jwt-auth')
@Controller('crm')
export class CrmController {
  constructor(private readonly manageSchoolCrmUseCase: ManageSchoolCrmUseCase) {}

  @Post('conversations')
  @ApiOperation({
    summary: 'Iniciar conversación omnicanal en el CRM Escolar (RLS desde JWT)',
  })
  @ApiResponse({ status: 201, description: 'Conversación creada exitosamente.' })
  public async startConversation(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: CreateCrmConversationRequestDto,
  ): Promise<Record<string, unknown>> {
    const summary = await this.manageSchoolCrmUseCase.startConversation({
      schoolId: principal.schoolId,
      channelId: dto.channelId,
      createdByUserId: principal.userId,
      createdByRole: principal.activeRole,
      studentEnrollmentId: dto.studentEnrollmentId
        ? BigInt(dto.studentEnrollmentId)
        : null,
      subject: dto.subject,
      conversationType: dto.conversationType,
      participantUserIds: dto.participantUserIds.map((p) => ({
        userId: BigInt(p.userId),
        participantRole: p.participantRole,
      })),
      initialMessageBody: dto.initialMessageBody,
    });

    return { success: true, data: summary };
  }

  @Get('conversations')
  @ApiOperation({
    summary: 'Listar conversaciones activas del usuario en su colegio (paginado)',
  })
  @ApiResponse({ status: 200, description: 'Listado paginado de conversaciones.' })
  public async listConversations(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.manageSchoolCrmUseCase.listConversations({
      schoolId: principal.schoolId,
      userId: principal.userId,
      activeRole: principal.activeRole,
      limit: query.limit,
      offset: query.offset,
    });
    return {
      success: true,
      total: result.total,
      data: result.items,
    };
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Listar mensajes de una conversación CRM Escolar' })
  @ApiParam({ name: 'conversationId', example: 1 })
  public async listConversationMessages(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('conversationId', PositiveBigIntPipe) conversationId: bigint,
    @Query() query: PaginationQueryDto,
  ): Promise<Record<string, unknown>> {
    const messages = await this.manageSchoolCrmUseCase.listConversationMessages({
      schoolId: principal.schoolId,
      conversationId,
      userId: principal.userId,
      activeRole: principal.activeRole,
      limit: query.limit,
      offset: query.offset,
    });
    return { success: true, total: messages.length, data: messages };
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Enviar un nuevo mensaje a una conversación existente' })
  @ApiParam({ name: 'conversationId', example: 1 })
  public async sendMessage(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('conversationId', PositiveBigIntPipe) conversationId: bigint,
    @Body() dto: SendCrmMessageRequestDto,
  ): Promise<Record<string, unknown>> {
    const message = await this.manageSchoolCrmUseCase.sendMessage({
      schoolId: principal.schoolId,
      conversationId,
      senderUserId: principal.userId,
      channelId: dto.channelId,
      bodyText: dto.bodyText,
      attachmentFileId: dto.attachmentFileId
        ? BigInt(dto.attachmentFileId)
        : null,
    });
    return { success: true, data: message };
  }

  @Patch('conversations/:conversationId/read')
  @ApiOperation({ summary: 'Marcar conversación como leída (reinicia unread_count)' })
  @ApiParam({ name: 'conversationId', example: 1 })
  public async markConversationRead(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('conversationId', PositiveBigIntPipe) conversationId: bigint,
  ): Promise<Record<string, unknown>> {
    const result = await this.manageSchoolCrmUseCase.markConversationRead(
      principal.schoolId,
      conversationId,
      principal.userId,
    );
    return { success: true, data: result };
  }

  @Post('announcements')
  @Roles(
    CommunityRole.SUPER_ADMIN,
    CommunityRole.SCHOOL_ADMIN,
    CommunityRole.RECTOR,
    CommunityRole.COORDINATOR,
    CommunityRole.SECRETARY,
    CommunityRole.TEACHER,
  )
  @ApiOperation({ summary: 'Publicar circular o comunicado institucional segmentado' })
  public async publishAnnouncement(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: CreateCrmAnnouncementRequestDto,
  ): Promise<Record<string, unknown>> {
    const announcement = await this.manageSchoolCrmUseCase.publishAnnouncement({
      schoolId: principal.schoolId,
      authorUserId: principal.userId,
      campusId: dto.campusId ? BigInt(dto.campusId) : null,
      shiftId: dto.shiftId ? BigInt(dto.shiftId) : null,
      gradeId: dto.gradeId ? BigInt(dto.gradeId) : null,
      academicGroupId: dto.academicGroupId ? BigInt(dto.academicGroupId) : null,
      targetRoles: dto.targetRoles,
      title: dto.title,
      contentBody: dto.contentBody,
      priorityLevel: dto.priorityLevel,
      requiresAcknowledgment: dto.requiresAcknowledgment,
      expiresAt: dto.expiresAt ?? null,
    });
    return { success: true, data: announcement };
  }

  @Get('announcements')
  @ApiOperation({ summary: 'Listar circulares institucionales vigentes para el rol activo' })
  public async listAnnouncements(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<Record<string, unknown>> {
    const items = await this.manageSchoolCrmUseCase.listAnnouncements({
      schoolId: principal.schoolId,
      userId: principal.userId,
      activeRole: principal.activeRole,
      limit: query.limit,
      offset: query.offset,
    });
    return { success: true, total: items.length, data: items };
  }

  @Post('announcements/:announcementId/acknowledge')
  @ApiOperation({ summary: 'Registrar acuse de lectura/recibido de circular institucional' })
  @ApiParam({ name: 'announcementId', example: 1 })
  public async acknowledgeAnnouncement(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('announcementId', PositiveBigIntPipe) announcementId: bigint,
  ): Promise<Record<string, unknown>> {
    const result = await this.manageSchoolCrmUseCase.acknowledgeAnnouncement(
      principal.schoolId,
      announcementId,
      principal.userId,
    );
    return { success: true, data: result };
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Radicar solicitud o ticket PQRSD con cálculo automático de SLA' })
  public async createSupportTicket(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: CreateCrmSupportTicketRequestDto,
  ): Promise<Record<string, unknown>> {
    const ticket = await this.manageSchoolCrmUseCase.createSupportTicket({
      schoolId: principal.schoolId,
      categoryId: dto.categoryId,
      requesterUserId: principal.userId,
      studentEnrollmentId: dto.studentEnrollmentId
        ? BigInt(dto.studentEnrollmentId)
        : null,
      subject: dto.subject,
      description: dto.description,
      priority: dto.priority,
    });
    return { success: true, data: ticket };
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Listar solicitudes/tickets PQRSD accesibles al usuario' })
  public async listSupportTickets(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<Record<string, unknown>> {
    const tickets = await this.manageSchoolCrmUseCase.listSupportTickets({
      schoolId: principal.schoolId,
      userId: principal.userId,
      activeRole: principal.activeRole,
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    });
    return { success: true, total: tickets.length, data: tickets };
  }

  @Patch('tickets/:ticketId')
  @Roles(
    CommunityRole.SUPER_ADMIN,
    CommunityRole.SCHOOL_ADMIN,
    CommunityRole.RECTOR,
    CommunityRole.COORDINATOR,
    CommunityRole.SECRETARY,
  )
  @ApiOperation({ summary: 'Asignar o actualizar estado de ticket PQRSD (Directivos/Secretaría)' })
  @ApiParam({ name: 'ticketId', example: 1 })
  public async updateSupportTicket(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('ticketId', PositiveBigIntPipe) ticketId: bigint,
    @Body() dto: UpdateCrmSupportTicketRequestDto,
  ): Promise<Record<string, unknown>> {
    const updated = await this.manageSchoolCrmUseCase.updateSupportTicket({
      schoolId: principal.schoolId,
      ticketId,
      assignedUserId: dto.assignedUserId ? BigInt(dto.assignedUserId) : null,
      status: dto.status,
      priority: dto.priority,
    });
    return { success: true, data: updated };
  }

  @Post('knowledge/embeddings')
  @Roles(
    CommunityRole.SUPER_ADMIN,
    CommunityRole.SCHOOL_ADMIN,
    CommunityRole.RECTOR,
    CommunityRole.COORDINATOR,
    CommunityRole.SECRETARY,
  )
  @ApiOperation({
    summary: 'Indexar fragmento documental (PEI, SIEE, Convivencia, CRM) en pgvector',
  })
  public async indexKnowledge(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: IndexKnowledgeEmbeddingRequestDto,
  ): Promise<Record<string, unknown>> {
    const created =
      await this.manageSchoolCrmUseCase.indexInstitutionalKnowledge({
        schoolId: principal.schoolId,
        documentSource: dto.documentSource,
        title: dto.title,
        chunkText: dto.chunkText,
        embedding: dto.embedding,
        metadata: dto.metadata,
      });

    return { success: true, data: created };
  }

  @Post('knowledge/semantic-search')
  @ApiOperation({
    summary: 'Búsqueda semántica vectorial con pgvector (<=> distancia coseno) aislada por JWT',
  })
  public async searchKnowledge(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SemanticKnowledgeSearchRequestDto,
  ): Promise<Record<string, unknown>> {
    const matches = await this.manageSchoolCrmUseCase.searchKnowledgeBase({
      schoolId: principal.schoolId,
      queryText: dto.queryText,
      queryEmbedding: dto.queryEmbedding,
      limit: dto.limit,
      documentSource: dto.documentSource,
    });

    return {
      success: true,
      totalMatches: matches.length,
      data: matches,
    };
  }
}
