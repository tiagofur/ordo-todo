import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
} from 'class-validator';
import { SeriesType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSeriesDto {
    @ApiProperty({
        description: 'Name of the series',
        example: 'JavaScript Tutorial Series',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the series',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Color for the series (hex)',
        example: '#6366F1',
    })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({
        description: 'Cover image URL',
    })
    @IsString()
    @IsOptional()
    coverImage?: string;

    @ApiPropertyOptional({
        description: 'Type of series',
        enum: SeriesType,
        default: 'EPISODIC',
    })
    @IsEnum(SeriesType)
    @IsOptional()
    seriesType?: SeriesType;
}

export class UpdateSeriesDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    coverImage?: string;

    @ApiPropertyOptional({ enum: SeriesType })
    @IsEnum(SeriesType)
    @IsOptional()
    seriesType?: SeriesType;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class SeriesResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty()
    color: string;

    @ApiPropertyOptional()
    coverImage?: string;

    @ApiProperty({ enum: SeriesType })
    seriesType: SeriesType;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    workspaceId: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional()
    contentCount?: number;

    @ApiPropertyOptional({ type: [Object] })
    contentPieces?: Array<{
        id: string;
        title: string;
        status: string;
        episodeNumber?: number;
    }>;
}
