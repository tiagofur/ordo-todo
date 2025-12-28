import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { AIService } from './ai.service';
import { BurnoutPreventionService } from './burnout-prevention.service';
import {
  AIChatDto,
  AIParseTaskDto,
  AIWorkflowSuggestionDto,
  AIDecomposeTaskDto,
} from './dto/ai-chat.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly burnoutService: BurnoutPreventionService,
  ) {}

  // ============ AI CHAT ============

  @Post('chat')
  async chat(@Body() chatDto: AIChatDto, @CurrentUser() user: RequestUser) {
    return this.aiService.chat(user.id, chatDto.message, chatDto.history, {
      workspaceId: chatDto.workspaceId,
      projectId: chatDto.projectId,
    });
  }

  // ============ NATURAL LANGUAGE TASK PARSING ============

  @Post('parse-task')
  async parseTask(@Body() parseDto: AIParseTaskDto) {
    return this.aiService.parseNaturalLanguageTask(
      parseDto.input,
      parseDto.projectId,
      parseDto.timezone,
    );
  }

  // ============ WELLBEING ============

  @Get('wellbeing')
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

  /**
   * Get comprehensive burnout risk analysis
   * Returns risk level, score, patterns, warnings, and AI insights
   */
  @Get('burnout/analysis')
  async getBurnoutAnalysis(@CurrentUser() user: RequestUser) {
    return this.burnoutService.analyzeBurnoutRisk(user.id);
  }

  /**
   * Get work pattern analysis for the last N days
   */
  @Get('burnout/patterns')
  async getWorkPatterns(
    @CurrentUser() user: RequestUser,
    @Query('days') days?: string,
  ) {
    const parsedDays = days ? parseInt(days, 10) : 14;
    return this.burnoutService.analyzeWorkPatterns(user.id, parsedDays);
  }

  /**
   * Get personalized rest recommendations based on current state
   */
  @Get('burnout/recommendations')
  async getRestRecommendations(@CurrentUser() user: RequestUser) {
    return this.burnoutService.getRestRecommendations(user.id);
  }

  /**
   * Check if user needs an intervention (for proactive notifications)
   */
  @Get('burnout/intervention')
  async checkIntervention(@CurrentUser() user: RequestUser) {
    return this.burnoutService.checkForIntervention(user.id);
  }

  /**
   * Get weekly wellbeing summary with metrics and insights
   */
  @Get('burnout/weekly-summary')
  async getWeeklyWellbeingSummary(@CurrentUser() user: RequestUser) {
    return this.burnoutService.generateWeeklyWellbeingSummary(user.id);
  }

  // ============ WORKFLOW SUGGESTIONS ============

  @Post('workflow-suggestion')
  async suggestWorkflow(@Body() suggestionDto: AIWorkflowSuggestionDto) {
    return this.aiService.suggestWorkflow(
      suggestionDto.projectName,
      suggestionDto.projectDescription,
      suggestionDto.objectives,
    );
  }

  // ============ TASK DECOMPOSITION ============

  /**
   * Decompose a complex task into manageable subtasks using AI
   */
  @Post('decompose-task')
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
  getProfile(@CurrentUser() user: RequestUser) {
    return this.aiService.getProfile(user.id);
  }

  @Get('optimal-schedule')
  getOptimalSchedule(
    @CurrentUser() user: RequestUser,
    @Query('topN') topN?: string,
  ) {
    const parsedTopN = topN ? parseInt(topN, 10) : undefined;
    return this.aiService.getOptimalSchedule(user.id, parsedTopN);
  }

  @Get('predict-duration')
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
  async generateWeeklyReport(
    @CurrentUser() user: RequestUser,
    @Query('weekStart') weekStart?: string,
  ) {
    const parsedWeekStart = weekStart ? new Date(weekStart) : undefined;
    return this.aiService.generateWeeklyReport(user.id, parsedWeekStart);
  }

  @Post('reports/monthly')
  async generateMonthlyReport(
    @CurrentUser() user: RequestUser,
    @Query('monthStart') monthStart?: string,
  ) {
    const parsedMonthStart = monthStart ? new Date(monthStart) : undefined;
    return this.aiService.generateMonthlyReport(user.id, parsedMonthStart);
  }

  @Post('reports/project/:projectId')
  async generateProjectReport(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.aiService.generateProjectReport(user.id, projectId);
  }

  @Get('reports')
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
  getReport(@Param('id') id: string) {
    return this.aiService.getReport(id);
  }

  @Delete('reports/:id')
  deleteReport(@Param('id') id: string) {
    return this.aiService.deleteReport(id);
  }

  // ============ MODEL STATS (DEBUG) ============

  @Get('model-stats')
  getModelStats() {
    return this.aiService.getModelStats();
  }
}
