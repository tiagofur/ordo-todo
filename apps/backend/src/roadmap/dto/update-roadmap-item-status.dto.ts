import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoadmapStatus } from '@prisma/client';

export class UpdateRoadmapItemStatusDto {
    @ApiProperty({ enum: RoadmapStatus, example: RoadmapStatus.PLANNED, description: 'New status for the item' })
    @IsEnum(RoadmapStatus)
    @IsNotEmpty()
    status: RoadmapStatus;
}
