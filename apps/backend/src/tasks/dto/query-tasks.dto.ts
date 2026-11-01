import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Query params for `GET /tasks`: the existing filters plus shared
 * offset pagination. All fields optional to preserve the current
 * contract; `limit`/`page` fall back to `PaginationDto` defaults.
 */
export class QueryTasksDto extends PaginationDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  // No value validation: kept as pass-through like the previous manual
  // parsing (single string or repeated param).
  @IsOptional()
  tags?: string | string[];

  @IsOptional()
  @IsBooleanString()
  assignedToMe?: string;

  @IsOptional()
  @IsBooleanString()
  withoutProject?: string;
}
