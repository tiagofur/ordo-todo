import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EveningMoveDto } from './evening-move.dto';

// ODD 006 S2 (T2): the evening ritual completes by giving every pending task
// of today's plan a destination + a one-touch reason.
export class CompleteEveningDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EveningMoveDto)
  moves: EveningMoveDto[];
}
