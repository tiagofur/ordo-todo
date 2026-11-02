import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Query params for `GET /templates?workspaceId=`: required workspace
 * filter plus shared pagination (opt-in: no `limit`/`page` means the
 * full list, as before).
 */
export class QueryTemplatesDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
