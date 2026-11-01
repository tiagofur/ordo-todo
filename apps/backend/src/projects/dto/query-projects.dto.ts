import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Query params for `GET /projects?workspaceId=`. `workspaceId` stays
 * required (the `ProjectGuard` 403s without it); pagination is optional
 * with `PaginationDto` defaults.
 */
export class QueryProjectsDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
