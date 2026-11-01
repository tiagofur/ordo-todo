import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Shared offset pagination for list endpoints.
 *
 * Conventions match the pre-existing `QueryNoteDto` (notes module):
 * `limit` default 20, max 100; `page` default 0. Callers that need full
 * lists (statistics, AI tools, crons, versioned public APIs) simply do not
 * accept this DTO, so no silent truncation happens anywhere.
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  get take(): number {
    return this.limit ?? 20;
  }

  get skip(): number {
    return (this.page ?? 0) * this.take;
  }
}
