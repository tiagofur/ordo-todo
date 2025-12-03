import { Injectable } from '@nestjs/common';
import { WorkspaceAuditLog as PrismaWorkspaceAuditLog } from '@prisma/client';
import {
    WorkspaceAuditLog,
    WorkspaceAuditLogRepository,
    AuditAction,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaWorkspaceAuditLogRepository implements WorkspaceAuditLogRepository {
    constructor(private readonly prisma: PrismaService) { }

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
        limit: number = 50,
        offset: number = 0,
    ): Promise<WorkspaceAuditLog[]> {
        const logs = await this.prisma.workspaceAuditLog.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        return logs.map((log) => this.toDomain(log));
    }

    async countByWorkspaceId(workspaceId: string): Promise<number> {
        return this.prisma.workspaceAuditLog.count({
            where: { workspaceId },
        });
    }
}
