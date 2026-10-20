import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AIDailyReportDto } from './ai-daily-report.dto';

/**
 * DTO validation tests (ODD 004 S4 + JD-04).
 *
 * The global ValidationPipe (whitelist + forbidNonWhitelisted) enforces
 * these decorators at the HTTP boundary: a non-date `date` must 400 here,
 * never reach Prisma as an Invalid Date (500).
 */
describe('AIDailyReportDto', () => {
  it('accepts AM/PM with an optional ISO date', async () => {
    for (const dto of [
      plainToInstance(AIDailyReportDto, { kind: 'AM' }),
      plainToInstance(AIDailyReportDto, {
        kind: 'PM',
        date: '2026-10-19',
      }),
    ]) {
      expect(await validate(dto)).toHaveLength(0);
    }
  });

  it('rejects unknown kinds', async () => {
    const dto = plainToInstance(AIDailyReportDto, { kind: 'XX' });
    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('JD-04: rejects a non-date string (would 500 as Invalid Date)', async () => {
    const dto = plainToInstance(AIDailyReportDto, {
      kind: 'AM',
      date: 'not-a-date',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('date');
  });
});
