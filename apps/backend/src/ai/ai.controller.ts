import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Optional,
  Post,
  Delete,
  Patch,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { AIService } from './ai.service';
import { BurnoutPreventionService } from './burnout-prevention.service';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import {
  AIChatDto,
  AIParseTaskDto,
  AIWorkflowSuggestionDto,
  AIDecomposeTaskDto,
} from './dto/ai-chat.dto';
import { AIAskDto } from './dto/ai-ask.dto';
import { AIDailyReportDto } from './dto/ai-daily-report.dto';
import { AIRechargeDto } from './dto/ai-usage.dto';
import { ExecutePlanDto, ProposePlanDto } from './tools/dto/agent-tools.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly burnoutService: BurnoutPreventionService,
    // @Optional: keeps ai.controller.spec.ts green (manual testing module
    // without ConfigService); the real module always provides it.
    @Optional() private readonly configService?: ConfigService,
  ) {}

  // ============ AI CHAT ============

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat with AI assistant',
    description:
      'Send a message to the AI assistant and get contextual responses about tasks, projects, workflows, and productivity tips. Supports conversation history for context-aware responses.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI response',
    schema: {
      example: {
        message: 'Based on your tasks, I recommend focusing on...',
        suggestions: ['Task 1', 'Task 2'],
        actionItems: ['Schedule review', 'Update dependencies'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async chat(@Body() chatDto: AIChatDto, @CurrentUser() user: RequestUser) {
    return this.aiService.chat(user.id, chatDto.message, chatDto.history, {
      workspaceId: chatDto.workspaceId,
      projectId: chatDto.projectId,
    });
  }

  // ============ ASK (ODD 004 S2) ============

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ask a question over indexed workspace content',
    description:
      'Retrieves content visible to the user via vector search with permission verification, then answers citing sources.',
  })
  @ApiResponse({
    status: 200,
    description: 'Answer with citations',
    schema: {
      example: {
        answer: 'Task X is due this week.',
        citations: [
          {
            type: 'TASK',
            id: 'task-123',
            title: 'Task X',
            excerpt: 'Task X ...',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async ask(@Body() dto: AIAskDto, @CurrentUser() user: RequestUser) {
    return this.aiService.ask(user.id, dto.question, dto.limit);
  }

  // ============ AGENT TOOLS (ODD 004 S3) ============

  @Post('tools/propose')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Propose an audited action plan',
    description:
      'Validates permission-checked tool calls and returns a human-described plan with its confirmation requirement.',
  })
  @ApiResponse({
    status: 200,
    description: 'Proposed plan',
    schema: {
      example: {
        planId: '550e8400-e29b-41d4-a716-446655440000',
        steps: [
          {
            tool: 'complete_task',
            args: { taskId: 'task-123' },
            description: "Completar tarea 'Buy milk'",
          },
        ],
        requiresConfirmation: false,
        reason: 'acción única de bajo riesgo',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'No access to target resource' })
  async proposePlan(
    @Body() dto: ProposePlanDto,
    @CurrentUser() user: RequestUser,
  ) {
    const plan = await this.aiService.proposePlan(user.id, dto.calls);
    return { plan };
  }

  @Post('tools/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute an audited action plan',
    description:
      'Re-validates the re-sent calls (stateless), re-derives the confirmation requirement server-side, and executes step by step. Plans requiring confirmation are rejected with 403 unless confirmed. Successful steps are audit-logged.',
  })
  @ApiResponse({
    status: 200,
    description: 'Execution result',
    schema: {
      example: {
        planId: '550e8400-e29b-41d4-a716-446655440000',
        executed: [{ step: 0, tool: 'complete_task', ok: true, result: {} }],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Plan requires confirmation or no access to resource',
  })
  async executePlan(
    @Body() dto: ExecutePlanDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.aiService.executePlan(
      user.id,
      dto.planId,
      dto.calls,
      dto.confirmed,
    );
    return { result };
  }

  // ============ NATURAL LANGUAGE TASK PARSING ============

  @Post('parse-task')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Parse natural language task input',
    description:
      'Convert natural language task descriptions into structured task data including title, description, due date, priority, and estimated duration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Parsed task data',
    schema: {
      example: {
        title: 'Complete project documentation',
        description: 'Write comprehensive docs for the new feature',
        dueDate: '2025-12-31',
        priority: 'HIGH',
        estimatedMinutes: 120,
        tags: ['documentation', 'high-priority'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async parseTask(@Body() parseDto: AIParseTaskDto) {
    return this.aiService.parseNaturalLanguageTask(
      parseDto.input,
      parseDto.projectId,
      parseDto.timezone,
      parseDto.fast,
    );
  }

  // ============ WELLBEING ============

  @Get('wellbeing')
  @ApiOperation({
    summary: 'Get wellbeing indicators',
    description:
      'Retrieve personal wellbeing indicators including energy levels, stress levels, work-life balance, and productivity patterns. Can filter by date range.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (ISO 8601 format)',
    example: '2025-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Wellbeing indicators',
    schema: {
      example: {
        overallScore: 75,
        energyLevel: 'HIGH',
        stressLevel: 'MODERATE',
        workLifeBalance: 8,
        trends: {
          increasing: ['productivity'],
          decreasing: ['stress'],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWellbeing(
    @CurrentUser() user: RequestUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.aiService.getWellbeingIndicators(
      user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // ============ BURNOUT PREVENTION ============

  @Get('burnout/analysis')
  @ApiOperation({
    summary: 'Get burnout risk analysis',
    description:
      'Comprehensive burnout risk assessment including risk level, score, work patterns, warning signs, and AI-powered insights with actionable recommendations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Burnout analysis',
    schema: {
      example: {
        riskLevel: 'MODERATE',
        score: 62,
        indicators: {
          overworking: true,
          lackOfBreaks: false,
          highStressTasks: true,
          scheduleTightness: 'HIGH',
        },
        warnings: [
          'Working hours exceed recommended limit',
          'High-priority tasks concentrated in short timeframe',
        ],
        recommendations: [
          'Take at least 15-minute breaks every 2 hours',
          'Consider redistributing workload',
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBurnoutAnalysis(@CurrentUser() user: RequestUser) {
    return this.burnoutService.analyzeBurnoutRisk(user.id);
  }

  @Get('burnout/patterns')
  @ApiOperation({
    summary: 'Get work pattern analysis',
    description:
      'Analyze work patterns over the last N days to identify trends in productivity, focus time, break patterns, and task distribution.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to analyze (default: 14)',
    example: 14,
  })
  @ApiResponse({
    status: 200,
    description: 'Work pattern analysis',
    schema: {
      example: {
        periodDays: 14,
        totalWorkHours: 42.5,
        averageDailyHours: 3.04,
        peakProductivityHours: ['09:00-12:00', '14:00-16:00'],
        breakPatterns: {
          averageBreakDuration: 12,
          breaksPerDay: 2.5,
          adherenceToBreaks: 0.85,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWorkPatterns(
    @CurrentUser() user: RequestUser,
    @Query('days') days?: string,
  ) {
    const parsedDays = days ? parseInt(days, 10) : 14;
    return this.burnoutService.analyzeWorkPatterns(user.id, parsedDays);
  }

  @Get('burnout/recommendations')
  @ApiOperation({
    summary: 'Get rest recommendations',
    description:
      'Receive personalized rest and recovery recommendations based on current work patterns, stress levels, and burnout risk assessment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rest recommendations',
    schema: {
      example: {
        urgent: [
          'Take a 30-minute break now',
          'Reschedule 2 non-urgent tasks to tomorrow',
        ],
        shortTerm: [
          'Schedule a 1-hour lunch break',
          'Block time for deep work',
        ],
        longTerm: [
          'Implement 90-minute work cycles',
          'Review and optimize weekly schedule',
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRestRecommendations(@CurrentUser() user: RequestUser) {
    return this.burnoutService.getRestRecommendations(user.id);
  }

  @Get('burnout/intervention')
  @ApiOperation({
    summary: 'Check for burnout intervention',
    description:
      'Check if user requires immediate intervention based on burnout risk threshold. Used for proactive notifications and alerts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Intervention check result',
    schema: {
      example: {
        needsIntervention: false,
        urgency: 'NONE',
        riskLevel: 'LOW',
        message: 'No immediate intervention needed',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkIntervention(@CurrentUser() user: RequestUser) {
    return this.burnoutService.checkForIntervention(user.id);
  }

  @Get('burnout/weekly-summary')
  @ApiOperation({
    summary: 'Get weekly wellbeing summary',
    description:
      'Generate a comprehensive weekly wellbeing summary with key metrics, achievements, challenges, and AI-powered insights for the current week.',
  })
  @ApiResponse({
    status: 200,
    description: 'Weekly wellbeing summary',
    schema: {
      example: {
        weekStart: '2025-01-27',
        weekEnd: '2025-02-02',
        summary:
          'Great productivity this week with good work-life balance. Consider adding more variety to task types.',
        metrics: {
          totalTasksCompleted: 28,
          focusScore: 78,
          burnoutRisk: 'LOW',
          wellbeingTrend: 'IMPROVING',
        },
        achievements: ['Completed all high-priority tasks', 'Met weekly goals'],
        challenges: ['Multiple interruptions on Tuesday'],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWeeklyWellbeingSummary(@CurrentUser() user: RequestUser) {
    return this.burnoutService.generateWeeklyWellbeingSummary(user.id);
  }

  // ============ WORKFLOW SUGGESTIONS ============

  @Post('workflow-suggestion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suggest workflow structure',
    description:
      'Get AI-powered workflow suggestions based on project name, description, and objectives. Returns recommended workflows with phases, stages, and best practices.',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow suggestions',
    schema: {
      example: {
        suggestedWorkflow: {
          name: 'Agile Development',
          phases: [
            {
              name: 'Planning',
              stages: ['Backlog refinement', 'Sprint planning'],
            },
            {
              name: 'Development',
              stages: ['Coding', 'Code review', 'Testing'],
            },
          ],
        },
        alternatives: [
          { name: 'Kanban', description: 'Continuous flow' },
          { name: 'Scrum', description: 'Sprint-based' },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async suggestWorkflow(@Body() suggestionDto: AIWorkflowSuggestionDto) {
    return this.aiService.suggestWorkflow(
      suggestionDto.projectName,
      suggestionDto.projectDescription,
      suggestionDto.objectives,
    );
  }

  // ============ TASK DECOMPOSITION ============

  @Post('decompose-task')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Decompose task into subtasks',
    description:
      'Break down a complex task into manageable subtasks using AI. Each subtask includes title, description, estimated duration, and dependencies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Decomposed subtasks',
    schema: {
      example: {
        subtasks: [
          {
            title: 'Research requirements',
            description: 'Gather and document all requirements',
            estimatedMinutes: 60,
            priority: 'HIGH',
            dependencies: [],
          },
          {
            title: 'Create wireframes',
            description: 'Design wireframes for UI components',
            estimatedMinutes: 90,
            priority: 'HIGH',
            dependencies: ['Research requirements'],
          },
        ],
        totalEstimatedMinutes: 150,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async decomposeTask(@Body() dto: AIDecomposeTaskDto) {
    return this.aiService.decomposeTask(
      dto.taskTitle,
      dto.taskDescription,
      dto.projectContext,
      dto.maxSubtasks,
    );
  }

  // ============ EXISTING ENDPOINTS ============

  @Get('profile')
  @ApiOperation({
    summary: 'Get AI profile',
    description:
      'Retrieve the AI-powered productivity profile including work patterns, peak hours, task preferences, and personalized insights.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI profile',
    schema: {
      example: {
        userId: 'clx1234567890',
        workPatterns: {
          peakHours: ['09:00-12:00', '14:00-16:00'],
          averageTaskDuration: 45,
          preferredTaskTypes: ['development', 'writing'],
        },
        productivityScore: 82,
        lastUpdated: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: RequestUser) {
    return this.aiService.getProfile(user.id);
  }

  @Get('model-stats')
  @ApiOperation({
    summary: 'Get model usage statistics',
    description:
      'Returns Gemini model usage statistics and estimated cost savings.',
  })
  getModelStats() {
    return this.aiService.getModelStats();
  }

  // ============ USAGE & CREDITS (ODD 004 S6) ============

  @Get('usage')
  @ApiOperation({
    summary: 'Get AI credit balance and usage history',
    description:
      'Returns the credit balance (trial: 100 on first use) plus the last 50 usage events. Costs: ask 1, tool step 2, report 5.',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance and history',
    schema: {
      example: {
        balance: 97,
        trialUsed: true,
        history: [{ kind: 'ask', cost: -1, balance: 99 }],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUsage(@CurrentUser() user: RequestUser) {
    return this.aiService.getUsage(user.id);
  }

  @Post('usage/recharge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recharge a user (admin stub until Stripe billing)',
    description:
      'Adds credits directly. Authorized via x-admin-api-key header (ADMIN_API_KEY) or ADMIN_EMAILS, mirroring auth-security.',
  })
  @ApiResponse({ status: 200, description: 'New balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin only' })
  rechargeCredits(
    @Body() dto: AIRechargeDto,
    @CurrentUser() user: RequestUser,
    @Req() req: Request,
  ) {
    this.assertAdminAccess(user, req);
    return this.aiService.rechargeCredits(dto.userId, dto.amount);
  }

  /**
   * Admin check mirroring AuthSecurityController.assertAdminAccess:
   * ADMIN_API_KEY header, ADMIN_EMAILS list, or user role/flag.
   */
  private assertAdminAccess(user?: RequestUser, req?: Request): void {
    const adminApiKey = this.configService?.get<string>('ADMIN_API_KEY');
    const providedKey = req?.headers?.['x-admin-api-key'];

    if (adminApiKey && providedKey && providedKey === adminApiKey) {
      return;
    }

    const adminEmailsRaw =
      this.configService?.get<string>('ADMIN_EMAILS') || '';
    const adminEmails = adminEmailsRaw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (
      user?.email &&
      adminEmails.length > 0 &&
      adminEmails.includes(String(user.email).toLowerCase())
    ) {
      return;
    }

    const role = user as { role?: string; isAdmin?: boolean } | undefined;
    if (role?.role === 'ADMIN' || role?.isAdmin === true) {
      return;
    }

    throw new ForbiddenException('Admin access required');
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update AI profile',
    description:
      'Update the AI-powered productivity profile with new work patterns, preferences, and settings. Allows partial updates to specific profile fields.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI profile updated successfully',
    schema: {
      example: {
        userId: 'clx1234567890',
        workPatterns: {
          peakHours: ['09:00-12:00', '14:00-16:00'],
          averageTaskDuration: 45,
          preferredTaskTypes: ['development', 'writing'],
        },
        productivityScore: 82,
        lastUpdated: '2025-01-05T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() updateData: Record<string, any>,
  ) {
    return this.aiService.updateProfile(user.id, updateData);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete AI profile',
    description:
      'Permanently delete the AI-powered productivity profile. This will reset all personalized AI insights and recommendations. The profile will be rebuilt from scratch based on future activity.',
  })
  @ApiResponse({ status: 204, description: 'AI profile deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deleteProfile(@CurrentUser() user: RequestUser) {
    return this.aiService.deleteProfile(user.id);
  }

  @Get('optimal-schedule')
  @ApiOperation({
    summary: 'Get optimal task schedule',
    description:
      'Generate an optimal task schedule based on AI profile, energy levels, task priorities, and deadlines. Returns tasks ordered for maximum productivity.',
  })
  @ApiQuery({
    name: 'topN',
    required: false,
    type: Number,
    description: 'Limit to top N tasks (optional)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Optimal schedule',
    schema: {
      example: {
        scheduledTasks: [
          {
            taskId: 'task1',
            title: 'Complete feature implementation',
            recommendedTime: '09:00-11:00',
            confidence: 0.92,
            reason: 'Aligns with peak productivity hours',
          },
          {
            taskId: 'task2',
            title: 'Review pull requests',
            recommendedTime: '14:00-15:00',
            confidence: 0.85,
            reason: 'Lower cognitive load task',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getOptimalSchedule(
    @CurrentUser() user: RequestUser,
    @Query('topN') topN?: string,
  ) {
    const parsedTopN = topN ? parseInt(topN, 10) : undefined;
    return this.aiService.getOptimalSchedule(user.id, parsedTopN);
  }

  @Get('predict-duration')
  @ApiOperation({
    summary: 'Predict task duration',
    description:
      'AI-powered task duration prediction based on historical data, task attributes (title, description, category, priority), and user patterns.',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
    description: 'Task title',
    example: 'Write unit tests',
  })
  @ApiQuery({
    name: 'description',
    required: false,
    type: String,
    description: 'Task description',
    example: 'Write comprehensive unit tests for the new feature',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Task category',
    example: 'development',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    description: 'Task priority',
    example: 'HIGH',
  })
  @ApiResponse({
    status: 200,
    description: 'Duration prediction',
    schema: {
      example: {
        estimatedMinutes: 45,
        confidence: 0.88,
        range: { min: 30, max: 60 },
        factors: [
          'Similar tasks averaged 40-50 min',
          'High priority tasks take +15%',
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  predictTaskDuration(
    @CurrentUser() user: RequestUser,
    @Query('title') title?: string,
    @Query('description') description?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  ) {
    return this.aiService.predictTaskDuration(
      user.id,
      title,
      description,
      category,
      priority,
    );
  }

  // ============ REPORTS ============

  @Post('reports/weekly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate weekly productivity report',
    description:
      'Generate a comprehensive weekly productivity report including task completion, time tracking, focus metrics, and AI insights. Can specify the week with weekStart parameter.',
  })
  @ApiQuery({
    name: 'weekStart',
    required: false,
    type: String,
    description: 'Start date of the week (ISO 8601 format)',
    example: '2025-01-27',
  })
  @ApiResponse({
    status: 200,
    description: 'Weekly report generated',
    schema: {
      example: {
        id: 'report123',
        type: 'WEEKLY',
        weekStart: '2025-01-27',
        weekEnd: '2025-02-02',
        metrics: {
          tasksCompleted: 28,
          totalTimeMinutes: 1800,
          averageFocusScore: 78,
          pomodorosCompleted: 24,
        },
        insights: [
          'Peak productivity on Wednesday',
          'Consider more breaks on Tuesday',
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateWeeklyReport(
    @CurrentUser() user: RequestUser,
    @Query('weekStart') weekStart?: string,
  ) {
    const parsedWeekStart = weekStart ? new Date(weekStart) : undefined;
    return this.aiService.generateWeeklyReport(user.id, parsedWeekStart);
  }

  @Post('reports/monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate monthly productivity report',
    description:
      'Generate a comprehensive monthly productivity report including task completion, time tracking, focus metrics, trends, and AI insights. Can specify the month with monthStart parameter.',
  })
  @ApiQuery({
    name: 'monthStart',
    required: false,
    type: String,
    description: 'Start date of the month (ISO 8601 format)',
    example: '2025-01-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly report generated',
    schema: {
      example: {
        id: 'report456',
        type: 'MONTHLY',
        monthStart: '2025-01-01',
        monthEnd: '2025-01-31',
        metrics: {
          tasksCompleted: 112,
          totalTimeMinutes: 7200,
          averageFocusScore: 82,
          pomodorosCompleted: 96,
          weeklyAverages: [70, 85, 78, 92],
        },
        trends: {
          increasing: ['productivity', 'focus'],
          decreasing: ['task backlog'],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateMonthlyReport(
    @CurrentUser() user: RequestUser,
    @Query('monthStart') monthStart?: string,
  ) {
    const parsedMonthStart = monthStart ? new Date(monthStart) : undefined;
    return this.aiService.generateMonthlyReport(user.id, parsedMonthStart);
  }

  @Post('reports/project/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate project report',
    description:
      'Generate a comprehensive report for a specific project including task progress, team performance, time tracking, and AI insights.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    type: String,
    example: 'project123',
  })
  @ApiResponse({
    status: 200,
    description: 'Project report generated',
    schema: {
      example: {
        id: 'report789',
        type: 'PROJECT',
        projectId: 'project123',
        projectName: 'Q1 Feature Release',
        metrics: {
          tasksCompleted: 45,
          totalTasks: 60,
          progress: 75,
          totalTimeMinutes: 3600,
        },
        teamMetrics: {
          members: 5,
          averageProductivity: 85,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async generateProjectReport(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.aiService.generateProjectReport(user.id, projectId);
  }

  @Post('reports/daily')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate daily briefing (AM) or shutdown review (PM)',
    description:
      'Generates a daily report with a stable versioned payload (daily/v1) shared with the daily ritual: same keys every day, only data values change.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily report generated',
    schema: {
      example: {
        id: 'report123',
        scope: 'DAILY_AM',
        summary: 'Today: 3 tasks due, 1 completed yesterday.',
        productivityScore: 75,
        metricsSnapshot: {
          format: 'daily/v1',
          kind: 'AM',
          date: '2026-10-19',
          tasksDue: 3,
          tasksCompleted: 1,
          totalMinutesWorked: 120,
          totalPomodoros: 4,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateDailyReport(
    @Body() dto: AIDailyReportDto,
    @CurrentUser() user: RequestUser,
  ) {
    const parsedDate = dto.date ? new Date(dto.date) : undefined;
    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('date must be a valid date string');
    }
    return this.aiService.generateDailyReport(user.id, dto.kind, parsedDate);
  }

  @Get('reports')
  @ApiOperation({
    summary: 'Get generated reports',
    description:
      'Retrieve a paginated list of generated reports. Can filter by scope (WEEKLY, MONTHLY, PROJECT) and limit the number of results.',
  })
  @ApiQuery({
    name: 'scope',
    required: false,
    type: String,
    description: 'Filter by report type',
    enum: ['WEEKLY', 'MONTHLY', 'PROJECT'],
    example: 'WEEKLY',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of reports to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of reports to skip (for pagination)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'List of reports',
    schema: {
      example: {
        reports: [
          {
            id: 'report123',
            type: 'WEEKLY',
            createdAt: '2025-02-02T12:00:00.000Z',
          },
          {
            id: 'report456',
            type: 'MONTHLY',
            createdAt: '2025-02-01T12:00:00.000Z',
          },
        ],
        total: 15,
        limit: 10,
        offset: 0,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getReports(
    @CurrentUser() user: RequestUser,
    @Query('scope') scope?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.aiService.getReports(user.id, {
      scope,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('reports/:id')
  @ApiOperation({
    summary: 'Get report by ID',
    description: 'Retrieve a specific generated report by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Report ID',
    type: String,
    example: 'report123',
  })
  @ApiResponse({
    status: 200,
    description: 'Report details',
    schema: {
      example: {
        id: 'report123',
        type: 'WEEKLY',
        userId: 'clx1234567890',
        createdAt: '2025-02-02T12:00:00.000Z',
        metrics: {
          tasksCompleted: 28,
          totalTimeMinutes: 1800,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  getReport(@Param('id') id: string) {
    return this.aiService.getReport(id);
  }

  @Delete('reports/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete report',
    description: 'Permanently delete a generated report by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Report ID',
    type: String,
    example: 'report123',
  })
  @ApiResponse({ status: 204, description: 'Report deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  deleteReport(@Param('id') id: string) {
    return this.aiService.deleteReport(id);
  }
}
