import { UseCase } from '../../shared/use-case';
import { MeetingAnalysisService } from '../provider/meeting.repository';

export interface GenerateSummaryInput {
  transcript: string;
  style?: 'executive' | 'detailed' | 'bullet-points';
}

export class GenerateSummaryUseCase implements UseCase<GenerateSummaryInput, string> {
  constructor(
    private readonly analysisService: MeetingAnalysisService,
  ) {}

  async execute(input: GenerateSummaryInput): Promise<string> {
    return await this.analysisService.generateSummary(
      input.transcript,
      input.style || 'executive',
    );
  }
}
