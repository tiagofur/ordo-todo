import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email address to subscribe' })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({ example: 'cl1234567890', description: 'Optional User ID if logged in' })
    @IsOptional()
    @IsString()
    userId?: string;
}
