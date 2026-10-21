import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EveningMoveDto } from './evening-move.dto';

// ODD 006 S2 (T2): the evening ritual completes by giving every pending task
// of today's plan a destination + a one-touch reason. An empty array is VALID:
// a perfect day (zero pendings) closes DONE, not SKIPPED.
export class CompleteEveningDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EveningMoveDto)
  moves: EveningMoveDto[];
}
