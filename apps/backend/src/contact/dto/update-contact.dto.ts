import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContactDto {
    @ApiPropertyOptional({ example: true, description: 'Mark as read' })
    @IsOptional()
    @IsBoolean()
    read?: boolean;
}
