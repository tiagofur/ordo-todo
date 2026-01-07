import { UseCase } from '../../shared/use-case';
import { MeetingRepository } from '../provider/meeting.repository';
import { Meeting } from '../model';

export interface ListMeetingsInput {
  userId: string;
  projectId?: string;
  upcoming?: boolean;
  past?: boolean;
  days?: number;
}

export class ListMeetingsUseCase implements UseCase<ListMeetingsInput, Meeting[]> {
  constructor(private readonly meetingRepo: MeetingRepository) {}

  async execute(input: ListMeetingsInput): Promise<Meeting[]> {
    if (input.projectId) {
      return await this.meetingRepo.findByProjectId(input.projectId);
    }

    if (input.upcoming) {
      return await this.meetingRepo.findUpcoming(input.userId, input.days);
    }

    if (input.past) {
      return await this.meetingRepo.findPast(input.userId);
    }

    return await this.meetingRepo.findByUserId(input.userId);
  }
}
