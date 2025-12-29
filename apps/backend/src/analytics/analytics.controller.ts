import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get daily productivity metrics
   * Supports single date or date range queries
   */
  @Get('daily')
  @ApiOperation({
    summary: 'Get daily metrics',
    description:
      'Returns productivity metrics for a specific day or date range. Includes tasks completed, time worked, pomodoros, and focus score.',
  })
  @ApiQuery({
    name: 'date',
    description: 'Single date in ISO 8601 format (e.g., 2025-12-29)',
    required: false,
    example: '2025-12-29',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for date range query (ISO 8601 format)',
    required: false,
    example: '2025-12-20',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for date range query (ISO 8601 format)',
    required: false,
    example: '2025-12-29',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily metrics retrieved successfully',
    schema: {
      example: {
        date: '2025-12-29',
        tasksCompleted: 8,
        tasksCreated: 12,
        tasksInProgress: 4,
        minutesWorked: 245,
        pomodorosCompleted: 6,
        focusScore: 0.85,
        averageSessionLength: 25,
        mostProductiveHour: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDailyMetrics(
    @CurrentUser() user: RequestUser,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Support both single date and date range queries
    // If startDate/endDate provided, use range; otherwise use single date
    if (startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : start;
      return this.analyticsService.getDateRangeMetrics(user.id, start, end);
    }

    // Convert string date to Date object if provided
    const parsedDate = date ? new Date(date) : undefined;
    return this.analyticsService.getDailyMetrics(user.id, parsedDate);
  }

  /**
   * Get weekly productivity metrics
   * Aggregates data for a 7-day week starting from the specified date
   */
  @Get('weekly')
  @ApiOperation({
    summary: 'Get weekly metrics',
    description:
      'Returns aggregated productivity metrics for a 7-day week. Defaults to the current week if no date provided.',
  })
  @ApiQuery({
    name: 'weekStart',
    description: 'Start date of the week (ISO 8601 format)',
    required: false,
    example: '2025-12-22',
  })
  @ApiResponse({
    status: 200,
    description: 'Weekly metrics retrieved successfully',
    schema: {
      example: {
        weekStart: '2025-12-22',
        weekEnd: '2025-12-28',
        totalTasksCompleted: 52,
        totalMinutesWorked: 1620,
        totalPomodoros: 40,
        averageFocusScore: 0.78,
        averageDailyTasks: 7.4,
        mostProductiveDay: 'Wednesday',
        dailyMetrics: [
          {
            date: '2025-12-22',
            tasksCompleted: 6,
            minutesWorked: 210,
            focusScore: 0.82,
          },
          // ... more days
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWeeklyMetrics(
    @CurrentUser() user: RequestUser,
    @Query('weekStart') weekStart?: string,
  ) {
    const parsedDate = weekStart ? new Date(weekStart) : undefined;
    return this.analyticsService.getWeeklyMetrics(user.id, parsedDate);
  }

  /**
   * Get monthly productivity metrics
   * Aggregates data for a full calendar month
   */
  @Get('monthly')
  @ApiOperation({
    summary: 'Get monthly metrics',
    description:
      'Returns aggregated productivity metrics for a full calendar month. Defaults to the current month if no date provided.',
  })
  @ApiQuery({
    name: 'monthStart',
    description: 'Start date of the month (ISO 8601 format)',
    required: false,
    example: '2025-12-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly metrics retrieved successfully',
    schema: {
      example: {
        monthStart: '2025-12-01',
        monthEnd: '2025-12-31',
        totalTasksCompleted: 215,
        totalMinutesWorked: 6840,
        totalPomodoros: 170,
        averageFocusScore: 0.75,
        averageDailyTasks: 6.9,
        mostProductiveWeek: 3,
        weeklyBreakdown: [
          {
            weekNumber: 1,
            tasksCompleted: 48,
            minutesWorked: 1540,
          },
          // ... more weeks
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMonthlyMetrics(
    @CurrentUser() user: RequestUser,
    @Query('monthStart') monthStart?: string,
  ) {
    const parsedDate = monthStart ? new Date(monthStart) : undefined;
    return this.analyticsService.getMonthlyMetrics(user.id, parsedDate);
  }

  /**
   * Get productivity metrics for a custom date range
   * Allows flexible time period analysis
   */
  @Get('range')
  @ApiOperation({
    summary: 'Get date range metrics',
    description:
      'Returns aggregated productivity metrics for a custom date range. Useful for tracking specific periods like sprints or goals.',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date of the range (ISO 8601 format)',
    required: true,
    example: '2025-12-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date of the range (ISO 8601 format)',
    required: true,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Date range metrics retrieved successfully',
    schema: {
      example: {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        totalTasksCompleted: 215,
        totalMinutesWorked: 6840,
        totalPomodoros: 170,
        averageFocusScore: 0.75,
        tasksPerDay: 6.9,
        mostProductiveDay: '2025-12-15',
        trend: 'improving',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date range (start date must be before end date)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDateRangeMetrics(
    @CurrentUser() user: RequestUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getDateRangeMetrics(
      user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Get dashboard statistics summary
   * Provides high-level metrics for the main dashboard
   */
  @Get('dashboard-stats')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description:
      "Returns high-level statistics for the main dashboard including today's metrics, current streak, and recent activity.",
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
    schema: {
      example: {
        today: {
          tasksCompleted: 8,
          minutesWorked: 245,
          focusScore: 0.85,
          pomodoros: 6,
        },
        week: {
          tasksCompleted: 52,
          averageFocusScore: 0.78,
          trend: 'up',
        },
        streak: {
          current: 12,
          longest: 28,
        },
        totalTasks: 156,
        activeProjects: 5,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDashboardStats(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getDashboardStats(user.id);
  }

  /**
   * Get productivity heatmap data
   * Returns activity data for calendar heatmap visualization
   */
  @Get('heatmap')
  @ApiOperation({
    summary: 'Get productivity heatmap',
    description:
      'Returns daily activity data for calendar heatmap visualization. Shows work intensity for each day over time.',
  })
  @ApiResponse({
    status: 200,
    description: 'Heatmap data retrieved successfully',
    schema: {
      example: {
        startDate: '2025-06-01',
        endDate: '2025-12-29',
        days: [
          {
            date: '2025-12-29',
            level: 4,
            minutesWorked: 245,
            tasksCompleted: 8,
          },
          {
            date: '2025-12-28',
            level: 2,
            minutesWorked: 90,
            tasksCompleted: 3,
          },
          // ... more days
        ],
        maxMinutes: 480,
        maxTasks: 15,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getHeatmap(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getHeatmapData(user.id);
  }

  /**
   * Get time distribution by project
   * Shows how much time was spent on each project
   */
  @Get('project-distribution')
  @ApiOperation({
    summary: 'Get project time distribution',
    description:
      'Returns time distribution across all projects. Shows total minutes and percentage breakdown for each project.',
  })
  @ApiResponse({
    status: 200,
    description: 'Project distribution retrieved successfully',
    schema: {
      example: {
        totalMinutes: 6840,
        projects: [
          {
            id: 'project1',
            name: 'Website Redesign',
            minutesWorked: 2540,
            percentage: 37.1,
            tasksCompleted: 85,
          },
          {
            id: 'project2',
            name: 'Mobile App',
            minutesWorked: 1980,
            percentage: 28.9,
            tasksCompleted: 62,
          },
          // ... more projects
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProjectDistribution(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getProjectTimeDistribution(user.id);
  }

  /**
   * Get task status distribution
   * Shows breakdown of tasks by status
   */
  @Get('task-status-distribution')
  @ApiOperation({
    summary: 'Get task status distribution',
    description:
      'Returns breakdown of all tasks by status (TODO, IN_PROGRESS, DONE). Useful for understanding workflow.',
  })
  @ApiResponse({
    status: 200,
    description: 'Task status distribution retrieved successfully',
    schema: {
      example: {
        totalTasks: 156,
        byStatus: {
          TODO: 45,
          IN_PROGRESS: 28,
          DONE: 83,
        },
        byStatusPercentage: {
          TODO: 28.8,
          IN_PROGRESS: 17.9,
          DONE: 53.2,
        },
        recentlyCompleted: 15,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTaskStatusDistribution(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getTaskStatusDistribution(user.id);
  }

  /**
   * Get productivity streak information
   * Returns current and longest consecutive work days
   */
  @Get('streak')
  @ApiOperation({
    summary: 'Get productivity streak',
    description:
      'Returns current productivity streak (consecutive days with completed tasks) and the longest streak ever achieved.',
  })
  @ApiResponse({
    status: 200,
    description: 'Streak information retrieved successfully',
    schema: {
      example: {
        currentStreak: 12,
        currentStreakStartDate: '2025-12-18',
        longestStreak: 28,
        longestStreakPeriod: {
          startDate: '2025-10-15',
          endDate: '2025-11-11',
        },
        totalActiveDays: 89,
        completedTasksInStreak: 84,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProductivityStreak(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getProductivityStreak(user.id);
  }

  /**
   * Get team productivity metrics for a workspace
   * Requires workspace membership
   */
  @Get('team/:workspaceId')
  @ApiOperation({
    summary: 'Get team metrics',
    description:
      'Returns aggregated productivity metrics for all team members in a workspace. Useful for team leaders and managers.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID to get team metrics for',
    example: 'clx1234567890',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for filtering (ISO 8601 format)',
    required: false,
    example: '2025-12-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for filtering (ISO 8601 format)',
    required: false,
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Team metrics retrieved successfully',
    schema: {
      example: {
        workspaceId: 'clx1234567890',
        workspaceName: 'Engineering Team',
        period: {
          startDate: '2025-12-01',
          endDate: '2025-12-31',
        },
        summary: {
          totalTasksCompleted: 892,
          totalMinutesWorked: 28450,
          totalPomodoros: 710,
          averageFocusScore: 0.76,
          activeMembers: 8,
        },
        members: [
          {
            userId: 'user1',
            userName: 'John Doe',
            tasksCompleted: 125,
            minutesWorked: 4020,
            focusScore: 0.85,
            pomodoros: 100,
            rank: 1,
          },
          {
            userId: 'user2',
            userName: 'Jane Smith',
            tasksCompleted: 98,
            minutesWorked: 3250,
            focusScore: 0.78,
            pomodoros: 82,
            rank: 2,
          },
          // ... more members
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the workspace',
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  getTeamMetrics(
    @Param('workspaceId') workspaceId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getTeamMetrics(
      workspaceId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
