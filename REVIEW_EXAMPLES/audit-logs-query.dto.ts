/**
 * DTO para query parameters de audit logs
 * Archivo: apps/backend/src/workspaces/dto/audit-logs-query.dto.ts
 */

import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of logs to return',
    minimum: 1,
    maximum: 100,
    default: 50,
    example: 20
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
    example: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

/**
 * USO EN EL CONTROLLER:
 *
 * @Get(':id/audit-logs')
 * @UseGuards(WorkspaceGuard)
 * @Roles(MemberRole.OWNER, MemberRole.ADMIN)
 * getAuditLogs(
 *   @Param('id') workspaceId: string,
 *   @Query() query: AuditLogsQueryDto,
 * ) {
 *   return this.workspacesService.getAuditLogs(
 *     workspaceId,
 *     query.limit,
 *     query.offset,
 *   );
 * }
 */
