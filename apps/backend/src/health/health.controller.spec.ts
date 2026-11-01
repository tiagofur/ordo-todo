import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController readiness (ODD 027 T8)', () => {
  let controller: HealthController;
  let healthService: { isReady: jest.Mock };

  beforeEach(async () => {
    healthService = { isReady: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('returns the readiness payload when ready', async () => {
    healthService.isReady.mockResolvedValue({ ready: true });

    await expect(controller.getReadiness()).resolves.toEqual({
      ready: true,
    });
  });

  it('throws 503 when not ready', async () => {
    healthService.isReady.mockResolvedValue({ ready: false });

    const error = await controller.getReadiness().catch((e) => e);

    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getStatus()).toBe(503);
  });
});
