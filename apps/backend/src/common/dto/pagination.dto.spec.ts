import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  const parse = async (query: Record<string, unknown>) => {
    const dto = plainToInstance(PaginationDto, query, {
      enableImplicitConversion: false,
    });
    const errors = await validate(dto);
    return { dto, errors };
  };

  it('applies defaults when no params are given', async () => {
    const { dto, errors } = await parse({});

    expect(errors).toHaveLength(0);
    expect(dto.take).toBe(20);
    expect(dto.skip).toBe(0);
  });

  it('computes skip from page and limit', async () => {
    const { dto, errors } = await parse({ limit: '10', page: '3' });

    expect(errors).toHaveLength(0);
    expect(dto.take).toBe(10);
    expect(dto.skip).toBe(30);
  });

  it('rejects limits above the max', async () => {
    const { errors } = await parse({ limit: '1000' });

    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects non-positive limits and negative pages', async () => {
    const { errors: zeroLimit } = await parse({ limit: '0' });
    const { errors: negativePage } = await parse({ page: '-1' });

    expect(zeroLimit.length).toBeGreaterThan(0);
    expect(negativePage.length).toBeGreaterThan(0);
  });
});
