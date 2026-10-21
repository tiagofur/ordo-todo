import { Test, TestingModule } from '@nestjs/testing';
import { RitualController } from './ritual.controller';
import { RitualService } from './ritual.service';

// ODD 006 S1 (T1): morning endpoints delegate to RitualService.
describe('RitualController morning', () => {
  let controller: RitualController;
  let service: RitualService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RitualController],
      providers: [
        {
          provide: RitualService,
          useValue: {
            getMorning: jest.fn(),
            completeMorning: jest.fn(),
            skipMorning: jest.fn(),
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

  it('getMorning returns the morning view', async () => {
    const view = { plan: {}, overdue: [], suggestedTop3: [], ritual: null };
    (service.getMorning as jest.Mock).mockResolvedValue(view);

    const result = await controller.getMorning(user);

    expect(result).toEqual(view);
    expect(service.getMorning).toHaveBeenCalledWith('user-1');
  });

  it('completeMorning passes the top-3 through', async () => {
    const view = { morningStatus: 'DONE' };
    (service.completeMorning as jest.Mock).mockResolvedValue(view);

    const result = await controller.completeMorning({ top3: ['a'] }, user);

    expect(result).toEqual(view);
    expect(service.completeMorning).toHaveBeenCalledWith('user-1', ['a']);
  });

  it('skipMorning skips', async () => {
    const view = { morningStatus: 'SKIPPED' };
    (service.skipMorning as jest.Mock).mockResolvedValue(view);

    const result = await controller.skipMorning(user);

    expect(result).toEqual(view);
    expect(service.skipMorning).toHaveBeenCalledWith('user-1');
  });
});
