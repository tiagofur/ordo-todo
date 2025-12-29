import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
    @ApiProperty({ example: 'John Doe', description: 'Name of the sender' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email of the sender' })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Inquiry about pricing', description: 'Subject of the message' })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({ example: 'Hello, I would like to know...', description: 'Content of the message' })
    @IsString()
    @IsNotEmpty()
    message: string;
}
