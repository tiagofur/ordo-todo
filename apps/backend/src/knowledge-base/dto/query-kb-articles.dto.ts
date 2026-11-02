import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Query params for `GET /kb/articles`: existing filters plus shared
 * pagination (opt-in: no `limit`/`page` means the full list, as before).
 */
export class QueryKbArticlesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBooleanString()
  publishedOnly?: string;
}
