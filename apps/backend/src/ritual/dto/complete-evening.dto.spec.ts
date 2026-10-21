import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CompleteEveningDto } from './complete-evening.dto';

/**
 * DTO validation (ODD 006 S2).
 *
 * The global ValidationPipe (whitelist + forbidNonWhitelisted) enforces
 * these decorators at the HTTP boundary: invalid destinations/reasons or
 * malformed dates 400 here, never reach the service.
 */
describe('CompleteEveningDto', () => {
  const valid = (moves: unknown[]) =>
    plainToInstance(CompleteEveningDto, { moves });

  it('accepts a move per pending task with destination + reason', async () => {
    const dto = valid([
      { taskId: 'a', destination: 'tomorrow', reason: 'overran' },
      {
        taskId: 'b',
        destination: 'date',
        date: '2026-12-25',
        reason: 'urgent',
      },
      { taskId: 'c', destination: 'archived', reason: 'no-energy' },
    ]);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects unknown destinations or reasons', async () => {
    for (const moves of [
      [{ taskId: 'a', destination: 'never', reason: 'overran' }],
      [{ taskId: 'a', destination: 'tomorrow', reason: 'bored' }],
    ]) {
      expect((await validate(valid(moves))).length).toBeGreaterThan(0);
    }
  });

  it('requires date only when destination is date', async () => {
    const withDate = valid([
      { taskId: 'a', destination: 'date', date: '2026-12-25', reason: 'other' },
    ]);
    expect(await validate(withDate)).toHaveLength(0);

    const missing = valid([
      { taskId: 'a', destination: 'date', reason: 'other' },
    ]);
    const missingErrors = await validate(missing);
    expect(missingErrors.length).toBeGreaterThan(0);

    const badDate = valid([
      {
        taskId: 'a',
        destination: 'date',
        date: 'not-a-date',
        reason: 'other',
      },
    ]);
    expect((await validate(badDate)).length).toBeGreaterThan(0);
  });

  it('accepts an empty moves array (perfect day closes DONE)', async () => {
    expect(await validate(valid([]))).toHaveLength(0);
  });
});
