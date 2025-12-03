import { Entity, EntityProps } from "../../shared/entity";

export type ViewType = "LIST" | "KANBAN" | "CALENDAR" | "TIMELINE" | "FOCUS";

export interface WorkspaceSettingsProps extends EntityProps {
    workspaceId: string;
    defaultView?: ViewType;
    defaultDueTime?: number; // minutos desde inicio del día (ej. 540 = 9:00 AM)
    timezone?: string; // ej. "America/Mexico_City"
    locale?: string; // ej. "es-MX"
    createdAt?: Date;
    updatedAt?: Date;
}

export class WorkspaceSettings extends Entity<WorkspaceSettingsProps> {
    constructor(props: WorkspaceSettingsProps) {
        super({
            ...props,
            defaultView: props.defaultView ?? "LIST",
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<WorkspaceSettingsProps, "id" | "createdAt" | "updatedAt">): WorkspaceSettings {
        return new WorkspaceSettings({
            ...props,
            defaultView: props.defaultView ?? "LIST",
        });
    }

    update(props: Partial<Omit<WorkspaceSettingsProps, "id" | "workspaceId" | "createdAt">>): WorkspaceSettings {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }
}
