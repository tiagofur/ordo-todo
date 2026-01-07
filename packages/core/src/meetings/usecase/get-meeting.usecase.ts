import { UseCase } from '../../shared/use-case';
import { MeetingRepository } from '../provider/meeting.repository';
import { Meeting } from '../model';

export interface GetMeetingInput {
  id: string;
}

export class GetMeetingUseCase implements UseCase<GetMeetingInput, Meeting | null> {
  constructor(private readonly meetingRepo: MeetingRepository) {}

  async execute(input: GetMeetingInput): Promise<Meeting | null> {
    return await this.meetingRepo.findById(input.id);
  }
}
