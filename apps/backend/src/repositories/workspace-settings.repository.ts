import { Injectable } from '@nestjs/common';
import { ViewType as PrismaViewType, WorkspaceSettings as PrismaWorkspaceSettings } from '@prisma/client';
import {
    WorkspaceSettings,
    WorkspaceSettingsRepository,
    ViewType,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaWorkspaceSettingsRepository implements WorkspaceSettingsRepository {
    constructor(private readonly prisma: PrismaService) { }

    private toDomain(prismaSettings: PrismaWorkspaceSettings): WorkspaceSettings {
        return new WorkspaceSettings({
            id: prismaSettings.id,
            workspaceId: prismaSettings.workspaceId,
            defaultView: prismaSettings.defaultView
                ? this.mapViewTypeToDomain(prismaSettings.defaultView)
                : undefined,
            defaultDueTime: prismaSettings.defaultDueTime ?? undefined,
            timezone: prismaSettings.timezone ?? undefined,
            locale: prismaSettings.locale ?? undefined,
            createdAt: prismaSettings.createdAt,
            updatedAt: prismaSettings.updatedAt,
        });
    }

    private mapViewTypeToDomain(viewType: PrismaViewType): ViewType {
        switch (viewType) {
            case 'LIST':
                return 'LIST';
            case 'KANBAN':
                return 'KANBAN';
            case 'CALENDAR':
                return 'CALENDAR';
            case 'TIMELINE':
                return 'TIMELINE';
            case 'FOCUS':
                return 'FOCUS';
            default:
                return 'LIST';
        }
    }

    private mapViewTypeToPrisma(viewType: ViewType): PrismaViewType {
        switch (viewType) {
            case 'LIST':
                return 'LIST';
            case 'KANBAN':
                return 'KANBAN';
            case 'CALENDAR':
                return 'CALENDAR';
            case 'TIMELINE':
                return 'TIMELINE';
            case 'FOCUS':
                return 'FOCUS';
            default:
                return 'LIST';
        }
    }

    async findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettings | null> {
        const settings = await this.prisma.workspaceSettings.findUnique({
            where: { workspaceId },
        });

        if (!settings) return null;
        return this.toDomain(settings);
    }

    async upsert(settings: WorkspaceSettings): Promise<WorkspaceSettings> {
        const data = {
            workspaceId: settings.props.workspaceId,
            defaultView: settings.props.defaultView
                ? this.mapViewTypeToPrisma(settings.props.defaultView)
                : null,
            defaultDueTime: settings.props.defaultDueTime ?? null,
            timezone: settings.props.timezone ?? null,
            locale: settings.props.locale ?? null,
            updatedAt: settings.props.updatedAt,
        };

        const upserted = await this.prisma.workspaceSettings.upsert({
            where: { workspaceId: settings.props.workspaceId },
            create: {
                id: settings.id as string,
                ...data,
            },
            update: data,
        });

        return this.toDomain(upserted);
    }

    async delete(workspaceId: string): Promise<void> {
        await this.prisma.workspaceSettings.delete({
            where: { workspaceId },
        });
    }
}
