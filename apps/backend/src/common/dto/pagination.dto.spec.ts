import 'reflect-metadata';
import { PaginationDto, toTakeSkip } from './pagination.dto';

describe('toTakeSkip', () => {
  it('should return undefined when no pagination is sent (opt-in)', () => {
    expect(toTakeSkip(undefined)).toBeUndefined();
    expect(toTakeSkip(null)).toBeUndefined();
    expect(toTakeSkip({})).toBeUndefined();
    expect(toTakeSkip(new PaginationDto())).toBeUndefined();
  });

  it('should map limit/page to take/skip', () => {
    expect(toTakeSkip({ limit: 10, page: 2 })).toEqual({ take: 10, skip: 20 });
    expect(toTakeSkip({ limit: 10 })).toEqual({ take: 10, skip: 0 });
    expect(toTakeSkip({ page: 3 })).toEqual({ take: 20, skip: 60 });
  });

  it('should coerce string values from plain query objects', () => {
    expect(toTakeSkip({ limit: '10', page: '2' })).toEqual({
      take: 10,
      skip: 20,
    });
  });

  it('should cap take at 100 and clamp negatives', () => {
    expect(toTakeSkip({ limit: 5000 })).toEqual({ take: 100, skip: 0 });
    expect(toTakeSkip({ limit: -5 })).toEqual({ take: 1, skip: 0 });
    expect(toTakeSkip({ page: -2, limit: 10 })).toEqual({ take: 10, skip: 0 });
  });

  it('should fall back to defaults on garbage input', () => {
    expect(toTakeSkip({ limit: 'abc', page: 'xyz' })).toBeUndefined();
    expect(toTakeSkip({ limit: 'abc', page: 1 })).toEqual({
      take: 20,
      skip: 20,
    });
  });
});
