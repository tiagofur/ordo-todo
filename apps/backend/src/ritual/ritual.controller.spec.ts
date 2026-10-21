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
            timeboxMorning: jest.fn(),
            acceptTimeboxProposal: jest.fn(),
            getStreak: jest.fn(),
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

  // ODD 006 S3 (T3): time-boxing endpoints delegate to RitualService.
  it('timeboxMorning passes the blocks through', async () => {
    const blocks = [{ taskId: 'a', start: '09:00', end: '09:30' }];
    (service.timeboxMorning as jest.Mock).mockResolvedValue(blocks);

    const result = await controller.timeboxMorning({ blocks }, user);

    expect(result).toEqual(blocks);
    expect(service.timeboxMorning).toHaveBeenCalledWith('user-1', blocks);
  });

  it('acceptTimeboxProposal accepts the proposal', async () => {
    const blocks = [{ taskId: 'a', start: '09:00', end: '10:00' }];
    (service.acceptTimeboxProposal as jest.Mock).mockResolvedValue(blocks);

    const result = await controller.acceptTimeboxProposal(user);

    expect(result).toEqual(blocks);
    expect(service.acceptTimeboxProposal).toHaveBeenCalledWith('user-1');
  });

  it('getStreak returns the streak', async () => {
    const streak = { current: 5, longest: 9 };
    (service.getStreak as jest.Mock).mockResolvedValue(streak);

    const result = await controller.getStreak(user);

    expect(result).toEqual(streak);
    expect(service.getStreak).toHaveBeenCalledWith('user-1');
  });
});
