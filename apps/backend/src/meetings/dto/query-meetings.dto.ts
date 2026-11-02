import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Query params for `GET /meetings`: optional project filter plus shared
 * pagination (replaces the hand-rolled `limit` string param).
 */
export class QueryMeetingsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  projectId?: string;
}
