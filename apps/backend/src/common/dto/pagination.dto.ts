import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Shared offset pagination for list endpoints.
 *
 * Conventions (from the pre-existing `QueryNoteDto`, notes module):
 * `limit` default 20, max 100; `page` default 0. Callers that need full
 * lists (statistics, AI tools, crons, versioned public APIs) simply do not
 * accept this DTO, so no silent truncation happens anywhere.
 *
 * Opt-in semantics: `toTakeSkip` returns `undefined` when the client sent
 * neither `limit` nor `page`, preserving the endpoint's previous unbounded
 * behavior. This keeps first-party callers (web `api-client`, which fetches
 * full lists) working unchanged while any *explicit* pagination is capped.
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number;
}

export interface TakeSkip {
  take: number;
  skip: number;
}

function toNumber(value: number | string | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return Number.isNaN(value) ? undefined : value;
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Resolve `take`/`skip` from a (possibly plain-object) pagination query.
 * Returns `undefined` when neither `limit` nor `page` was sent, so the
 * caller keeps its previous unbounded behavior. Explicit values fall back
 * to the shared defaults (`limit` 20, `page` 0) and `take` is capped at
 * 100 even when validation pipes are bypassed (unit tests, plain calls).
 */
export function toTakeSkip(
  query?:
    PaginationDto | { limit?: number | string; page?: number | string } | null,
): TakeSkip | undefined {
  const limit = toNumber(query?.limit);
  const page = toNumber(query?.page);
  if (limit === undefined && page === undefined) return undefined;
  const take = Math.min(100, Math.max(1, limit ?? 20));
  const skip = Math.max(0, page ?? 0) * take;
  return { take, skip };
}
