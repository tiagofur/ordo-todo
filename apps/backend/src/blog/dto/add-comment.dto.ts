import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCommentDto {
  @ApiProperty({
    example: 'Great post!',
    description: 'Content of the comment',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
