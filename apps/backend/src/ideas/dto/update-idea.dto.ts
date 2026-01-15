import { PartialType } from '@nestjs/swagger';
import { CreateIdeaDto } from './create-idea.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { IdeaStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIdeaDto extends PartialType(CreateIdeaDto) {
    @ApiPropertyOptional({
        description: 'The status of the idea',
        enum: IdeaStatus,
    })
    @IsEnum(IdeaStatus)
    @IsOptional()
    status?: IdeaStatus;
}
