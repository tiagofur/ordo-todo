import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoadmapItemDto {
    @ApiProperty({ example: 'Dark Mode', description: 'Title of the feature request' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Add support for dark mode...', description: 'Description of the feature' })
    @IsString()
    @IsNotEmpty()
    description: string;
}
