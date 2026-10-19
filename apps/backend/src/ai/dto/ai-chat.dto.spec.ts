import { ValidationPipe, type ArgumentMetadata } from '@nestjs/common';
import { AIParseTaskDto } from './ai-chat.dto';

// Same pipe config as main.ts (whitelist + forbidNonWhitelisted).
// Before C1b this DTO had no decorators, so the global pipe 400'd
// every request — including plain { input }.
function testPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });
}

const meta: ArgumentMetadata = { type: 'body', metatype: AIParseTaskDto };

describe('AIParseTaskDto validation', () => {
  it('accepts input with the optional fast flag', async () => {
    const out = await testPipe().transform(
      { input: 'Informe viernes 9h', fast: true },
      meta,
    );
    expect(out).toBeInstanceOf(AIParseTaskDto);
    expect(out.fast).toBe(true);
  });

  it('accepts input alone (fast defaults at the service layer)', async () => {
    const out = await testPipe().transform({ input: 'hola' }, meta);
    expect(out).toBeInstanceOf(AIParseTaskDto);
    expect(out.fast).toBeUndefined();
  });

  it('rejects empty input', async () => {
    await expect(testPipe().transform({ input: '' }, meta)).rejects.toThrow();
  });

  it('rejects unknown properties', async () => {
    await expect(
      testPipe().transform({ input: 'hola', hacker: 1 }, meta),
    ).rejects.toThrow();
  });
});
