import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import {
  MeetingAssistantService,
  ActionItem,
  MeetingAnalysis,
} from './meeting-assistant.service';

// DTOs
class AnalyzeTranscriptDto {
  transcript: string;
  meetingTitle?: string;
  participants?: string[];
  duration?: number;
  projectContext?: string;
}

class ExtractActionItemsDto {
  transcript: string;
  projectContext?: string;
}

class GenerateSummaryDto {
  transcript: string;
  style?: 'executive' | 'detailed' | 'bullet-points';
}

class ConvertToTasksDto {
  actionItems: ActionItem[];
  projectId?: string;
  autoAssign?: boolean;
}

class SaveMeetingDto {
  title: string;
  date: string;
  duration: number;
  transcript?: string;
  audioUrl?: string;
  analysis?: MeetingAnalysis;
  projectId?: string;
}

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingService: MeetingAssistantService) {}

  /**
   * Analyze a meeting transcript completely
   * Returns summary, action items, decisions, participants, topics
   */
  @Post('analyze')
  async analyzeTranscript(
    @Body() dto: AnalyzeTranscriptDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.meetingService.analyzeTranscript(dto.transcript, {
      meetingTitle: dto.meetingTitle,
      participants: dto.participants,
      duration: dto.duration,
      projectContext: dto.projectContext,
    });
  }

  /**
   * Extract only action items from transcript (lighter operation)
   */
  @Post('extract-actions')
  async extractActionItems(
    @Body() dto: ExtractActionItemsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.meetingService.extractActionItems(
      dto.transcript,
      dto.projectContext,
    );
  }

  /**
   * Generate a summary of the meeting transcript
   */
  @Post('summary')
  async generateSummary(
    @Body() dto: GenerateSummaryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const summary = await this.meetingService.generateSummary(
      dto.transcript,
      dto.style || 'executive',
    );
    return { summary };
  }

  /**
   * Convert extracted action items to actual tasks
   */
  @Post('convert-to-tasks')
  async convertToTasks(
    @Body() dto: ConvertToTasksDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.meetingService.convertToTasks(user.id, dto.actionItems, {
      projectId: dto.projectId,
      autoAssign: dto.autoAssign,
    });
  }

  /**
   * Save a meeting record for future reference
   */
  @Post('save')
  async saveMeeting(
    @Body() dto: SaveMeetingDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.meetingService.saveMeeting(user.id, {
      title: dto.title,
      date: new Date(dto.date),
      duration: dto.duration,
      transcript: dto.transcript,
      audioUrl: dto.audioUrl,
      analysis: dto.analysis,
      projectId: dto.projectId,
    });
  }

  /**
   * Quick analyze - just summary and action items
   */
  @Post('quick-analyze')
  async quickAnalyze(
    @Body() dto: { transcript: string; projectId?: string },
    @CurrentUser() user: RequestUser,
  ) {
    const [summary, actionItems] = await Promise.all([
      this.meetingService.generateSummary(dto.transcript, 'bullet-points'),
      this.meetingService.extractActionItems(dto.transcript),
    ]);

    return {
      summary,
      actionItems,
      actionItemCount: actionItems.length,
    };
  }
}
