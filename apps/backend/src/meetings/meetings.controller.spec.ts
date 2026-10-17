import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsController } from './meetings.controller';
import { MeetingAssistantService } from './meeting-assistant.service';

describe('MeetingsController', () => {
  let controller: MeetingsController;
  let service: jest.Mocked<MeetingAssistantService>;

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'USER',
  } as any;

  beforeEach(async () => {
    const mockService = {
      saveMeeting: jest.fn().mockResolvedValue({
        id: 'meeting-1',
        userId: 'user-123',
        title: 'Standup',
        date: new Date(),
        duration: 30,
      }),
      getMeetings: jest.fn().mockResolvedValue([
        {
          id: 'meeting-1',
          userId: 'user-123',
          title: 'Standup',
          date: new Date(),
          duration: 30,
        },
      ]),
      getMeetingById: jest.fn().mockResolvedValue({
        id: 'meeting-1',
        userId: 'user-123',
        title: 'Standup',
        date: new Date(),
        duration: 30,
      }),
      deleteMeeting: jest.fn().mockResolvedValue(undefined),
      analyzeTranscript: jest.fn(),
      extractActionItems: jest.fn(),
      generateSummary: jest.fn(),
      convertToTasks: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
      providers: [
        {
          provide: MeetingAssistantService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MeetingsController>(MeetingsController);
    service = module.get(MeetingAssistantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should save a meeting', async () => {
    const result = await controller.saveMeeting(
      {
        title: 'Planning',
        date: '2026-10-17T08:00:00Z',
        duration: 45,
      },
      mockUser,
    );

    expect(service.saveMeeting).toHaveBeenCalledWith('user-123', {
      title: 'Planning',
      date: expect.any(Date),
      duration: 45,
      transcript: undefined,
      audioUrl: undefined,
      analysis: undefined,
      projectId: undefined,
    });
    expect(result.id).toBe('meeting-1');
  });

  it('should list meetings', async () => {
    const result = await controller.getMeetings(mockUser, undefined, '10');

    expect(service.getMeetings).toHaveBeenCalledWith('user-123', {
      projectId: undefined,
      limit: 10,
    });
    expect(result).toHaveLength(1);
  });

  it('should get meeting by id', async () => {
    const result = await controller.getMeetingById('meeting-1', mockUser);

    expect(service.getMeetingById).toHaveBeenCalledWith('user-123', 'meeting-1');
    expect(result.title).toBe('Standup');
  });

  it('should delete a meeting', async () => {
    await controller.deleteMeeting('meeting-1', mockUser);

    expect(service.deleteMeeting).toHaveBeenCalledWith('user-123', 'meeting-1');
  });
});
