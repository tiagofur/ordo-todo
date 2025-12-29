import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnsubscribeDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email address to unsubscribe' })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;
}
