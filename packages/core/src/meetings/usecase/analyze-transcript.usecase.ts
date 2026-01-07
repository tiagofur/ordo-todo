import { UseCase } from '../../shared/use-case';
import { MeetingRepository, MeetingAnalysisService } from '../provider/meeting.repository';
import { Meeting, MeetingAnalysis } from '../model';

export interface AnalyzeTranscriptInput {
  transcript: string;
  meetingTitle?: string;
  participants?: string[];
  duration?: number;
  projectContext?: string;
}

export class AnalyzeTranscriptUseCase
  implements UseCase<AnalyzeTranscriptInput, MeetingAnalysis>
{
  constructor(
    private readonly analysisService: MeetingAnalysisService,
  ) {}

  async execute(input: AnalyzeTranscriptInput): Promise<MeetingAnalysis> {
    return await this.analysisService.analyzeTranscript(input.transcript, {
      meetingTitle: input.meetingTitle,
      participants: input.participants,
      duration: input.duration,
      projectContext: input.projectContext,
    });
  }
}
