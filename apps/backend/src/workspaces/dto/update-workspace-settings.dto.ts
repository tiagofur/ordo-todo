import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';

export class UpdateWorkspaceSettingsDto {
    @IsOptional()
    @IsIn(['LIST', 'KANBAN', 'CALENDAR', 'TIMELINE', 'FOCUS'])
    defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';

    @IsOptional()
    @IsInt()
    defaultDueTime?: number; // minutos desde inicio del día (ej. 540 = 9:00 AM)

    @IsOptional()
    @IsString()
    timezone?: string; // ej. "America/Mexico_City"

    @IsOptional()
    @IsString()
    locale?: string; // ej. "es-MX"
}
