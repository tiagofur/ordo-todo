import { IsString, MinLength } from 'class-validator';

// ODD 005 S3 (T3b): freeze/unfreeze a day-plan block.
export class FreezeTaskDto {
  @IsString()
  @MinLength(1)
  taskId: string;
}
