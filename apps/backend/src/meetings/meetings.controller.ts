import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('Meetings')
@ApiBearerAuth()
@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingService: MeetingAssistantService) {}

  /**
   * Analyze a meeting transcript completely
   * Returns summary, action items, decisions, participants, topics
   */
  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze complete meeting transcript',
    description:
      'Performs a comprehensive analysis of a meeting transcript, extracting summary, action items, decisions, participants, and topics.',
  })
  @ApiBody({
    type: AnalyzeTranscriptDto,
    examples: {
      basic: {
        summary: 'Basic meeting analysis',
        value: {
          transcript:
            "In today's meeting we discussed the Q4 roadmap. Alice suggested we focus on the mobile app first. Bob agreed to prepare the technical architecture by Friday.",
          meetingTitle: 'Q4 Roadmap Planning',
          participants: ['Alice', 'Bob', 'Charlie'],
          duration: 60,
          projectContext: 'Mobile App Development Project',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Meeting analyzed successfully',
    schema: {
      example: {
        summary:
          'The team discussed the Q4 roadmap focusing on mobile app development.',
        actionItems: [
          {
            description: 'Prepare technical architecture',
            assignee: 'Bob',
            dueDate: '2025-01-03',
            priority: 'HIGH',
          },
        ],
        decisions: [
          {
            description: 'Focus on mobile app development for Q4',
          },
        ],
        participants: ['Alice', 'Bob', 'Charlie'],
        topics: ['Q4 Roadmap', 'Mobile App', 'Technical Architecture'],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid transcript or analysis failed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Extract action items from transcript',
    description:
      'Extracts action items from a meeting transcript. A lighter operation than full analysis, focuses only on tasks and assignments.',
  })
  @ApiBody({
    type: ExtractActionItemsDto,
    examples: {
      basic: {
        summary: 'Extract action items',
        value: {
          transcript:
            'John will complete the API documentation by Monday. Sarah needs to review the design mockups by Wednesday.',
          projectContext: 'Website Redesign Project',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Action items extracted successfully',
    schema: {
      type: 'array',
      example: [
        {
          description: 'Complete the API documentation',
          assignee: 'John',
          dueDate: '2025-01-06',
          priority: 'HIGH',
        },
        {
          description: 'Review the design mockups',
          assignee: 'Sarah',
          dueDate: '2025-01-08',
          priority: 'MEDIUM',
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid transcript' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Generate meeting summary',
    description:
      'Generates a summary of the meeting transcript in the specified style (executive, detailed, or bullet-points).',
  })
  @ApiBody({
    type: GenerateSummaryDto,
    examples: {
      executive: {
        summary: 'Executive summary',
        value: {
          transcript:
            'The team met to discuss the quarterly goals. We decided to prioritize customer satisfaction and launch the new feature next month.',
          style: 'executive',
        },
      },
      detailed: {
        summary: 'Detailed summary',
        value: {
          transcript:
            'The team met to discuss the quarterly goals. We decided to prioritize customer satisfaction and launch the new feature next month.',
          style: 'detailed',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Summary generated successfully',
    schema: {
      example: {
        summary:
          'The team prioritized customer satisfaction and decided to launch the new feature next month.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid transcript or style' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Convert action items to tasks',
    description:
      'Converts extracted meeting action items into actual tasks in the system. Optionally assigns to a project and auto-assigns based on assignee names.',
  })
  @ApiBody({
    type: ConvertToTasksDto,
    examples: {
      basic: {
        summary: 'Convert to tasks',
        value: {
          actionItems: [
            {
              description: 'Complete API documentation',
              assignee: 'John',
              dueDate: '2025-01-06',
              priority: 'HIGH',
            },
            {
              description: 'Review design mockups',
              assignee: 'Sarah',
              dueDate: '2025-01-08',
              priority: 'MEDIUM',
            },
          ],
          projectId: 'project123',
          autoAssign: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks created successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'clx1234567890',
          title: 'Complete API documentation',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: '2025-01-06T23:59:59.000Z',
          projectId: 'project123',
          assigneeId: 'user123',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid action items or project not found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Save meeting record',
    description:
      'Saves a meeting record with metadata, transcript, audio URL, and analysis for future reference and retrieval.',
  })
  @ApiBody({
    type: SaveMeetingDto,
    examples: {
      basic: {
        summary: 'Save meeting',
        value: {
          title: 'Q4 Roadmap Planning',
          date: '2025-01-02',
          duration: 60,
          transcript: "In today's meeting we discussed the Q4 roadmap.",
          audioUrl: 'https://storage.com/meeting-audio.mp3',
          analysis: {
            summary: 'Team discussed Q4 roadmap',
            actionItems: [],
            decisions: [],
            participants: [],
            topics: [],
          },
          projectId: 'project123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Meeting saved successfully',
    schema: {
      example: {
        id: 'meeting123',
        title: 'Q4 Roadmap Planning',
        date: '2025-01-02T00:00:00.000Z',
        duration: 60,
        transcript: "In today's meeting we discussed the Q4 roadmap.",
        audioUrl: 'https://storage.com/meeting-audio.mp3',
        projectId: 'project123',
        userId: 'user123',
        createdAt: '2025-01-02T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid meeting data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Quick meeting analysis',
    description:
      'Performs a quick analysis of a meeting transcript, returning just the summary and action items in bullet-point format. Ideal for rapid meeting processing.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transcript: {
          type: 'string',
          description: 'Meeting transcript text',
          example:
            'John will fix the bug today. Mary will update the documentation by Friday.',
        },
        projectId: {
          type: 'string',
          description: 'Optional project ID to associate with action items',
          example: 'project123',
        },
      },
      required: ['transcript'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Quick analysis completed',
    schema: {
      example: {
        summary:
          '- John will fix the bug today\n- Mary will update documentation',
        actionItems: [
          {
            description: 'Fix the bug',
            assignee: 'John',
            priority: 'HIGH',
          },
          {
            description: 'Update the documentation',
            assignee: 'Mary',
            dueDate: '2025-01-03',
            priority: 'MEDIUM',
          },
        ],
        actionItemCount: 2,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid transcript' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
