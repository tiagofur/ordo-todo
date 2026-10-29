import { ConfigService } from '@nestjs/config';
import { McpWellKnownController } from './mcp-well-known.controller';

describe('McpWellKnownController (openai-apps-challenge)', () => {
  const metadataMock = {} as any;

  const buildResponse = () => {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      send: jest.fn(),
      end: jest.fn(),
    };
    return res;
  };

  const buildController = (env: Record<string, string>) => {
    const config = {
      get: jest.fn((key: string) => env[key]),
    } as unknown as ConfigService;
    return new McpWellKnownController(metadataMock, config);
  };

  it('serves the configured token verbatim as text/plain', () => {
    const controller = buildController({
      OPENAI_APPS_CHALLENGE_TOKEN: 'challenge-token-123',
    });
    const res = buildResponse();

    controller.openaiAppsChallenge(res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.header).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(res.type).toHaveBeenCalledWith('text/plain');
    expect(res.send).toHaveBeenCalledWith('challenge-token-123');
  });

  it('answers 404 without a body when no token is configured', () => {
    const controller = buildController({});
    const res = buildResponse();

    controller.openaiAppsChallenge(res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});
