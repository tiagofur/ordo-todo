import { UseCase } from '../../shared/use-case';
import { MeetingRepository } from '../provider/meeting.repository';
import { Meeting, MeetingAnalysis } from '../model';

export interface UpdateMeetingAnalysisInput {
  meetingId: string;
  analysis: MeetingAnalysis;
}

export class UpdateMeetingAnalysisUseCase
  implements UseCase<UpdateMeetingAnalysisInput, Meeting>
{
  constructor(private readonly meetingRepo: MeetingRepository) {}

  async execute(input: UpdateMeetingAnalysisInput): Promise<Meeting> {
    const meeting = await this.meetingRepo.findById(input.meetingId);

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    const updatedMeeting = meeting.updateAnalysis(input.analysis);
    return await this.meetingRepo.update(updatedMeeting);
  }
}
