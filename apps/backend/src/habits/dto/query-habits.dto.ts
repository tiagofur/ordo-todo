import { IsBooleanString, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Query params for `GET /habits`: optional archived filter plus shared
 * pagination (opt-in: no `limit`/`page` means the full list, as before).
 */
export class QueryHabitsDto extends PaginationDto {
  @IsOptional()
  @IsBooleanString()
  includeArchived?: string;
}
