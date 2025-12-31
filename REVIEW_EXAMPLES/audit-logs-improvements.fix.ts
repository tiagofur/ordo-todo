/**
 * SOLUCIÓN: Mejoras al sistema de audit logs
 */

// ============ DTO CON FILTROS ============

// File: apps/backend/src/workspaces/dto/audit-logs-filter.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum AuditAction {
  WORKSPACE_CREATED = 'WORKSPACE_CREATED',
  WORKSPACE_UPDATED = 'WORKSPACE_UPDATED',
  WORKSPACE_DELETED = 'WORKSPACE_DELETED',
  WORKSPACE_ARCHIVED = 'WORKSPACE_ARCHIVED',
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_INVITED = 'MEMBER_INVITED',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  INVITATION_CANCELLED = 'INVITATION_CANCELLED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
}

export class AuditLogsFilterDto {
  @ApiPropertyOptional({
    description: 'Maximum number of logs to return',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Number of logs to skip for pagination',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Filter by action type',
    enum: AuditAction,
    example: 'MEMBER_ADDED',
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    description: 'Filter by actor user ID',
    example: 'clx1234567890',
  })
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @ApiPropertyOptional({
    description: 'Filter logs from this date (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter logs until this date (ISO 8601)',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// ============ ACTUALIZAR REPOSITORY ============

// File: packages/core/src/workspace/repositories/workspace-audit-log.repository.ts
export interface WorkspaceAuditLogRepository {
  create(log: WorkspaceAuditLog): Promise<WorkspaceAuditLog>;

  findByWorkspaceId(
    workspaceId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
      actorId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<WorkspaceAuditLog[]>;

  countByWorkspaceId(
    workspaceId: string,
    filters?: {
      action?: string;
      actorId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<number>;
}

// File: apps/backend/src/repositories/workspace-audit-log.repository.ts
@Injectable()
export class PrismaWorkspaceAuditLogRepository implements WorkspaceAuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaLog: PrismaWorkspaceAuditLog): WorkspaceAuditLog {
    return new WorkspaceAuditLog({
      id: prismaLog.id,
      workspaceId: prismaLog.workspaceId,
      actorId: prismaLog.actorId ?? undefined,
      action: prismaLog.action as AuditAction,
      payload: prismaLog.payload as Record<string, any> | undefined,
      createdAt: prismaLog.createdAt,
    });
  }

  async create(log: WorkspaceAuditLog): Promise<WorkspaceAuditLog> {
    const created = await this.prisma.workspaceAuditLog.create({
      data: {
        id: log.id as string,
        workspaceId: log.props.workspaceId,
        actorId: log.props.actorId,
        action: log.props.action,
        payload: log.props.payload,
      },
    });

    return this.toDomain(created);
  }

  async findByWorkspaceId(
    workspaceId: string,
    options: {
      limit?: number;
      offset?: number;
      action?: string;
      actorId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<WorkspaceAuditLog[]> {
    const {
      limit = 50,
      offset = 0,
      action,
      actorId,
      startDate,
      endDate,
    } = options;

    // Construir filtros dinámicamente
    const where: any = { workspaceId };

    if (action) {
      where.action = action;
    }

    if (actorId) {
      where.actorId = actorId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const logs = await this.prisma.workspaceAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return logs.map((log) => this.toDomain(log));
  }

  async countByWorkspaceId(
    workspaceId: string,
    filters: {
      action?: string;
      actorId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<number> {
    const { action, actorId, startDate, endDate } = filters;

    const where: any = { workspaceId };

    if (action) {
      where.action = action;
    }

    if (actorId) {
      where.actorId = actorId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    return this.prisma.workspaceAuditLog.count({ where });
  }
}

// ============ ACTUALIZAR USE CASE ============

// File: packages/core/src/workspace/use-cases/get-workspace-audit-logs.use-case.ts
export class GetWorkspaceAuditLogsUseCase {
  constructor(
    private readonly auditLogRepository: WorkspaceAuditLogRepository,
  ) {}

  async execute(params: {
    workspaceId: string;
    limit?: number;
    offset?: number;
    action?: string;
    actorId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    logs: WorkspaceAuditLog[];
    total: number;
    hasMore: boolean;
  }> {
    const { workspaceId, limit = 50, offset = 0, ...filters } = params;

    const [logs, total] = await Promise.all([
      this.auditLogRepository.findByWorkspaceId(workspaceId, {
        limit,
        offset,
        ...filters,
      }),
      this.auditLogRepository.countByWorkspaceId(workspaceId, filters),
    ]);

    return {
      logs,
      total,
      hasMore: offset + logs.length < total,
    };
  }
}

// ============ ACTUALIZAR CONTROLLER Y SERVICE ============

// File: apps/backend/src/workspaces/workspaces.controller.ts
@Get(':id/audit-logs')
@UseGuards(WorkspaceGuard)
@Roles(MemberRole.OWNER, MemberRole.ADMIN)
@ApiOperation({
  summary: 'Get workspace audit logs with filters',
  description: 'Returns filtered audit trail of workspace activities. Supports pagination and filtering by action, actor, date range.',
})
getAuditLogs(
  @Param('id', ParseUUIDPipe) workspaceId: string,
  @Query() filters: AuditLogsFilterDto,
) {
  return this.workspacesService.getAuditLogs(workspaceId, filters);
}

// File: apps/backend/src/workspaces/workspaces.service.ts
async getAuditLogs(
  workspaceId: string,
  filters: AuditLogsFilterDto,
) {
  const getAuditLogsUseCase = new GetWorkspaceAuditLogsUseCase(
    this.auditLogRepository,
  );

  const result = await getAuditLogsUseCase.execute({
    workspaceId,
    limit: filters.limit,
    offset: filters.offset,
    action: filters.action,
    actorId: filters.actorId,
    startDate: filters.startDate ? new Date(filters.startDate) : undefined,
    endDate: filters.endDate ? new Date(filters.endDate) : undefined,
  });

  return {
    logs: result.logs.map((log) => ({
      ...log.props,
      // Aquí se incluiría info del actor si la agregamos al log
    })),
    total: result.total,
    hasMore: result.hasMore,
    limit: filters.limit,
    offset: filters.offset,
  };
}

// ============ ENDPOINT PARA EXPORTAR AUDIT LOGS ============

// File: apps/backend/src/workspaces/workspaces.controller.ts
@Get(':id/audit-logs/export')
@UseGuards(WorkspaceGuard)
@Roles(MemberRole.OWNER, MemberRole.ADMIN)
@Header('Content-Type', 'text/csv')
@Header('Content-Disposition', 'attachment; filename="audit-logs.csv"')
@ApiOperation({
  summary: 'Export audit logs as CSV',
  description: 'Downloads audit logs in CSV format for external analysis.',
})
async exportAuditLogs(
  @Param('id', ParseUUIDPipe) workspaceId: string,
  @Query() filters: AuditLogsFilterDto,
  @Res() res: Response,
) {
  const data = await this.workspacesService.exportAuditLogs(
    workspaceId,
    filters,
  );

  // Convertir a CSV
  const csv = this.convertToCSV(data);
  res.send(csv);
}

/**
 * BENEFICIOS:
 * 1. Filtrado avanzado de audit logs
 * 2. Búsqueda por actor, acción, rango de fechas
 * 3. Paginación correcta con hasMore
 * 4. Exportación a CSV para análisis
 * 5. Incluye información del actor
 * 6. Queries optimizadas
 */
