import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Query params for `GET /faq`: existing filters plus shared pagination.
 */
export class QueryFaqDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBooleanString()
  publishedOnly?: string;
}
