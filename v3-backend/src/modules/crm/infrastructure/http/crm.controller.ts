import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ManageSchoolCrmUseCase } from '../../application/use-cases/manage-school-crm.use-case';

export class CreateCrmConversationRequestDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la Institución Educativa activa (Tenant RLS)',
  })
  @IsInt()
  schoolId!: number;

  @ApiProperty({
    example: 1,
    description:
      'Canal de comunicación omnicanal (1=IN_APP, 2=WHATSAPP, 3=EMAIL, 4=SMS, 5=PUSH_NOTIFICATION)',
  })
  @IsInt()
  channelId!: number;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario que inicia la conversación (Docente, Directivo, Acudiente o Estudiante)',
  })
  @IsInt()
  createdByUserId!: number;

  @ApiPropertyOptional({
    example: 105,
    description: 'ID opcional de la matrícula del estudiante sobre el cual trata la conversación',
  })
  @IsOptional()
  @IsInt()
  studentEnrollmentId?: number;

  @ApiProperty({
    example: 'Seguimiento académico y citación de padres - Primer Periodo',
    description: 'Asunto del hilo de conversación en el CRM Escolar',
  })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    example: 'FAMILY_TEACHER',
    enum: ['DIRECT', 'GROUP_ACADEMIC', 'FAMILY_TEACHER', 'ADMINISTRATIVE'],
    description: 'Tipo de conversación dentro de la comunidad educativa',
  })
  @IsString()
  @IsIn(['DIRECT', 'GROUP_ACADEMIC', 'FAMILY_TEACHER', 'ADMINISTRATIVE'])
  conversationType!:
    | 'DIRECT'
    | 'GROUP_ACADEMIC'
    | 'FAMILY_TEACHER'
    | 'ADMINISTRATIVE';

  @ApiProperty({
    example: [
      { userId: 1, participantRole: 'TEACHER' },
      { userId: 2, participantRole: 'FAMILY' },
    ],
    description: 'Lista de miembros participantes en el hilo de conversación',
  })
  @IsArray()
  participantUserIds!: Array<{ userId: number; participantRole: string }>;

  @ApiProperty({
    example:
      'Cordial saludo acudiente, le compartimos el avance académico del primer periodo.',
    description: 'Mensaje inicial del hilo omnicanal',
  })
  @IsString()
  @IsNotEmpty()
  initialMessageBody!: string;
}

export class IndexKnowledgeEmbeddingRequestDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la Institución Educativa propietaria del documento (RLS)',
  })
  @IsInt()
  schoolId!: number;

  @ApiProperty({
    example: 'SIEE',
    enum: [
      'PEI',
      'SIEE',
      'MANUAL_CONVIVENCIA',
      'FAQ_CIRCULAR',
      'CRM_MESSAGE',
      'ACADEMIC_CALENDAR',
    ],
    description: 'Fuente documental institucional indexada en pgvector',
  })
  @IsString()
  @IsIn([
    'PEI',
    'SIEE',
    'MANUAL_CONVIVENCIA',
    'FAQ_CIRCULAR',
    'CRM_MESSAGE',
    'ACADEMIC_CALENDAR',
  ])
  documentSource!:
    | 'PEI'
    | 'SIEE'
    | 'MANUAL_CONVIVENCIA'
    | 'FAQ_CIRCULAR'
    | 'CRM_MESSAGE'
    | 'ACADEMIC_CALENDAR';

  @ApiProperty({
    example: 'Artículo 14 - Criterios de Promoción y Nivelación SIEE',
    description: 'Título de la sección o fragmento institucional',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example:
      'Todo estudiante que obtenga desempeño bajo en una o dos áreas tendrá derecho a presentar actividades de superación antes del cierre del año lectivo.',
    description: 'Contenido textual del fragmento indexado para búsqueda semántica',
  })
  @IsString()
  @IsNotEmpty()
  chunkText!: string;

  @ApiPropertyOptional({
    description:
      'Vector numérico de 768 dimensiones (opcional; si se omite, el backend genera el embedding semántico normalizado)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  embedding?: number[];

  @ApiPropertyOptional({
    example: { article: 14, resolutionYear: 2026 },
    description: 'Metadatos adicionales en formato JSONB',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class SemanticKnowledgeSearchRequestDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la Institución Educativa activa donde se realiza la consulta (RLS)',
  })
  @IsInt()
  schoolId!: number;

  @ApiPropertyOptional({
    example: 'requisitos para nivelación y superación de áreas perdidas según SIEE',
    description: 'Consulta en lenguaje natural realizada por un docente, padre o estudiante',
  })
  @IsOptional()
  @IsString()
  queryText?: string;

  @ApiPropertyOptional({
    description: 'Vector de consulta de 768 dimensiones (opcional)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  queryEmbedding?: number[];

  @ApiPropertyOptional({
    example: 5,
    description: 'Cantidad máxima de resultados ordenados por similitud coseno (<=>)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    example: 'SIEE',
    description: 'Filtro opcional por tipo de documento institucional',
  })
  @IsOptional()
  @IsString()
  documentSource?: string;
}

@ApiTags('School CRM & Vector AI (pgvector)')
@ApiBearerAuth('jwt-auth')
@ApiHeader({
  name: 'x-school-id',
  description: 'Identificador numérico del Colegio activo para Row-Level Security (RLS)',
  required: false,
})
@Controller('crm')
export class CrmController {
  constructor(private readonly manageSchoolCrmUseCase: ManageSchoolCrmUseCase) {}

  @Post('conversations')
  @ApiOperation({
    summary: 'Iniciar conversación omnicanal en el CRM Escolar',
    description:
      'Crea un hilo de conversación entre miembros de la comunidad educativa (Directivos, Docentes, Acudientes, Estudiantes) aislado por `school_id` mediante PostgreSQL RLS.',
  })
  @ApiResponse({
    status: 201,
    description: 'Conversación e hilo omnicanal creados exitosamente.',
  })
  public async startConversation(
    @Body() dto: CreateCrmConversationRequestDto,
  ): Promise<Record<string, unknown>> {
    const summary = await this.manageSchoolCrmUseCase.startConversation({
      schoolId: BigInt(dto.schoolId),
      channelId: dto.channelId,
      createdByUserId: BigInt(dto.createdByUserId),
      studentEnrollmentId: dto.studentEnrollmentId
        ? BigInt(dto.studentEnrollmentId)
        : null,
      subject: dto.subject,
      conversationType: dto.conversationType,
      participantUserIds: (dto.participantUserIds ?? []).map((p) => ({
        userId: BigInt(p.userId),
        participantRole: p.participantRole,
      })),
      initialMessageBody: dto.initialMessageBody,
    });

    return {
      success: true,
      data: summary,
    };
  }

  @Get('conversations/:schoolId')
  @ApiOperation({
    summary: 'Listar conversaciones activas del CRM Escolar por institución',
    description:
      'Retorna los hilos de comunicación omnicanal del colegio indicado aplicando la política RLS `tenant_isolation_crm_conversations`.',
  })
  @ApiParam({
    name: 'schoolId',
    example: 1,
    description: 'ID de la Institución Educativa',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de conversaciones omnicanal de la institución.',
  })
  public async listConversations(
    @Param('schoolId') schoolId: string,
  ): Promise<Record<string, unknown>> {
    const items = await this.manageSchoolCrmUseCase.listConversations(
      BigInt(schoolId),
    );
    return {
      success: true,
      total: items.length,
      data: items,
    };
  }

  @Post('knowledge/embeddings')
  @ApiOperation({
    summary: 'Indexar fragmento documental (PEI, SIEE, Convivencia, CRM) en pgvector',
    description:
      'Almacena un fragmento de conocimiento institucional con su vector de 768 dimensiones (`vector(768)`) e índice HNSW (`vector_cosine_ops`) aislado por `school_id`.',
  })
  @ApiResponse({
    status: 201,
    description: 'Embedding vectorial indexado exitosamente en PostgreSQL 17 (pgvector).',
  })
  public async indexKnowledge(
    @Body() dto: IndexKnowledgeEmbeddingRequestDto,
  ): Promise<Record<string, unknown>> {
    const created = await this.manageSchoolCrmUseCase.indexInstitutionalKnowledge({
      schoolId: BigInt(dto.schoolId),
      documentSource: dto.documentSource,
      title: dto.title,
      chunkText: dto.chunkText,
      embedding: dto.embedding,
      metadata: dto.metadata,
    });

    return {
      success: true,
      data: created,
    };
  }

  @Post('knowledge/semantic-search')
  @ApiOperation({
    summary: 'Búsqueda semántica vectorial con pgvector (<=> distancia coseno)',
    description:
      'Ejecuta una consulta de similitud coseno sobre `crm_knowledge_embeddings` utilizando el índice HNSW de `pgvector` y garantizando que un colegio nunca vea documentos ni conversaciones de otro colegio.',
  })
  @ApiResponse({
    status: 200,
    description: 'Fragmentos institucionales ordenados por mayor similitud semántica.',
  })
  public async searchKnowledge(
    @Body() dto: SemanticKnowledgeSearchRequestDto,
  ): Promise<Record<string, unknown>> {
    const matches = await this.manageSchoolCrmUseCase.searchKnowledgeBase({
      schoolId: BigInt(dto.schoolId),
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
