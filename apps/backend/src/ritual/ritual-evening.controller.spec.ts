import { Test, TestingModule } from '@nestjs/testing';
import { RitualController } from './ritual.controller';
import { RitualService } from './ritual.service';

// ODD 006 S2 (T2): evening endpoints delegate to RitualService.
describe('RitualController evening', () => {
  let controller: RitualController;
  let service: RitualService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RitualController],
      providers: [
        {
          provide: RitualService,
          useValue: {
            getEvening: jest.fn(),
            completeEvening: jest.fn(),
            skipEvening: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<RitualController>(RitualController);
    service = module.get<RitualService>(RitualService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'user-1', email: 'test@example.com' } as never;

  it('getEvening returns the evening view', async () => {
    const view = { summary: {}, completed: [], pending: [], ritual: null };
    (service.getEvening as jest.Mock).mockResolvedValue(view);

    const result = await controller.getEvening(user);

    expect(result).toEqual(view);
    expect(service.getEvening).toHaveBeenCalledWith('user-1');
  });

  it('completeEvening passes the moves through', async () => {
    const view = { shutdownComplete: true, suggestion: 'x' };
    (service.completeEvening as jest.Mock).mockResolvedValue(view);
    const dto = {
      moves: [{ taskId: 'a', destination: 'tomorrow', reason: 'overran' }],
    };

    const result = await controller.completeEvening(dto as never, user);

    expect(result).toEqual(view);
    expect(service.completeEvening).toHaveBeenCalledWith('user-1', dto.moves);
  });

  it('skipEvening skips', async () => {
    const view = { eveningStatus: 'SKIPPED' };
    (service.skipEvening as jest.Mock).mockResolvedValue(view);

    const result = await controller.skipEvening(user);

    expect(result).toEqual(view);
    expect(service.skipEvening).toHaveBeenCalledWith('user-1');
  });
});
