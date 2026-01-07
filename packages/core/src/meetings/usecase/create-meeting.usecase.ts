import { UseCase } from '../../shared/use-case';
import { MeetingRepository } from '../provider/meeting.repository';
import { Meeting } from '../model';

export interface CreateMeetingInput {
  userId: string;
  title: string;
  date: Date;
  duration: number;
  transcript?: string;
  audioUrl?: string;
  projectId?: string;
}

export class CreateMeetingUseCase implements UseCase<CreateMeetingInput, Meeting> {
  constructor(private readonly meetingRepo: MeetingRepository) {}

  async execute(input: CreateMeetingInput): Promise<Meeting> {
    const meeting = Meeting.create({
      userId: input.userId,
      title: input.title,
      date: input.date,
      duration: input.duration,
      transcript: input.transcript,
      audioUrl: input.audioUrl,
      projectId: input.projectId,
    });

    return await this.meetingRepo.create(meeting);
  }
}
