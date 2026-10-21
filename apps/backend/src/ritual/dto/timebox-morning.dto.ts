import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ODD 006 S3 (T3): one manual time block for a morning top-3 task.
// `end` defaults server-side to start + estimated minutes.
export class TimeboxBlockDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'start must be in HH:mm format' })
  start: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'end must be in HH:mm format' })
  end?: string;
}

export class TimeboxMorningDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeboxBlockDto)
  blocks: TimeboxBlockDto[];
}
