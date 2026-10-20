import { ValidationPipe, type ArgumentMetadata } from '@nestjs/common';
import { CreateTaskDto } from './create-task.dto';

// Same pipe config as main.ts (whitelist + forbidNonWhitelisted).
// Without @ValidateIf + @IsDate + @Type + @IsOptional decorators,
// doDate would be rejected with 400.
function testPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });
}

const meta: ArgumentMetadata = { type: 'body', metatype: CreateTaskDto };

describe('CreateTaskDto (ODD 005 S1: doDate)', () => {
  it('accepts doDate as ISO string and transforms it to Date', async () => {
    const out = await testPipe().transform(
      {
        title: 'Task with doDate',
        projectId: 'project-123',
        doDate: '2026-10-25T09:00:00.000Z',
      },
      meta,
    );
    expect(out).toBeInstanceOf(CreateTaskDto);
    expect(out.doDate).toBeInstanceOf(Date);
    expect((out.doDate as Date).toISOString()).toBe('2026-10-25T09:00:00.000Z');
  });

  it('accepts explicit null doDate', async () => {
    const out = await testPipe().transform(
      { title: 'Task', projectId: 'project-123', doDate: null },
      meta,
    );
    expect(out.doDate).toBeNull();
  });

  it('preserves legacy contract: payload without doDate still works', async () => {
    const out = await testPipe().transform(
      { title: 'Legacy task', projectId: 'project-123' },
      meta,
    );
    expect(out).toBeInstanceOf(CreateTaskDto);
    expect(out.title).toBe('Legacy task');
    expect(out.doDate).toBeUndefined();
  });

  it('rejects invalid doDate values', async () => {
    await expect(
      testPipe().transform(
        { title: 'Task', projectId: 'project-123', doDate: 'not-a-date' },
        meta,
      ),
    ).rejects.toThrow();
  });
});
