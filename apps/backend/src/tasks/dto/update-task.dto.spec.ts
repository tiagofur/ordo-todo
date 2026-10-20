import { ValidationPipe, type ArgumentMetadata } from '@nestjs/common';
import { UpdateTaskDto } from './update-task.dto';

// Same pipe config as main.ts (whitelist + forbidNonWhitelisted).
function testPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });
}

const meta: ArgumentMetadata = { type: 'body', metatype: UpdateTaskDto };

describe('UpdateTaskDto (ODD 005 S1: doDate)', () => {
  it('accepts doDate as ISO string and transforms it to Date', async () => {
    const out = await testPipe().transform(
      { doDate: '2026-10-25T09:00:00.000Z' },
      meta,
    );
    expect(out).toBeInstanceOf(UpdateTaskDto);
    expect(out.doDate).toBeInstanceOf(Date);
    expect((out.doDate as Date).toISOString()).toBe('2026-10-25T09:00:00.000Z');
  });

  it('accepts explicit null doDate (clear the date)', async () => {
    const out = await testPipe().transform({ doDate: null }, meta);
    expect(out.doDate).toBeNull();
  });

  it('preserves legacy contract: payload without doDate still works', async () => {
    const out = await testPipe().transform({ title: 'New title' }, meta);
    expect(out).toBeInstanceOf(UpdateTaskDto);
    expect(out.title).toBe('New title');
    expect(out.doDate).toBeUndefined();
  });

  it('rejects invalid doDate values', async () => {
    await expect(
      testPipe().transform({ doDate: 'not-a-date' }, meta),
    ).rejects.toThrow();
  });
});
