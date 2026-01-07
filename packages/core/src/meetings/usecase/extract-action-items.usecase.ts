import { UseCase } from '../../shared/use-case';
import { MeetingAnalysisService } from '../provider/meeting.repository';
import { ActionItem } from '../model';

export interface ExtractActionItemsInput {
  transcript: string;
  projectContext?: string;
}

export class ExtractActionItemsUseCase implements UseCase<ExtractActionItemsInput, ActionItem[]> {
  constructor(
    private readonly analysisService: MeetingAnalysisService,
  ) {}

  async execute(input: ExtractActionItemsInput): Promise<ActionItem[]> {
    return await this.analysisService.extractActionItems(
      input.transcript,
      input.projectContext,
    );
  }
}
