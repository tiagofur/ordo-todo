import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Query params for `GET /tags?workspaceId=`. `workspaceId` stays required
 * (the `TagGuard` 403s without it); pagination is optional with
 * `PaginationDto` defaults.
 */
export class QueryTagsDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
