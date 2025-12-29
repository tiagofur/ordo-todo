import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { TeamWorkloadService } from './team-workload.service';

@ApiTags('Team Workload')
@ApiBearerAuth()
@Controller('workload')
@UseGuards(JwtAuthGuard)
export class TeamWorkloadController {
  constructor(private readonly workloadService: TeamWorkloadService) {}

  /**
   * Get workload summary for a workspace
   * Shows all members' workload, distribution, and suggestions
   */
  @Get('workspace/:workspaceId')
  @ApiOperation({
    summary: 'Get workspace workload summary',
    description:
      'Retrieves comprehensive workload information for all members in a workspace. Includes task metrics, time tracking, workload scores, and AI-powered redistribution suggestions.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID to get workload summary for',
    type: String,
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace workload summary retrieved successfully',
    schema: {
      example: {
        workspaceId: 'clx1234567890',
        workspaceName: 'My Workspace',
        totalMembers: 5,
        totalTasks: 45,
        totalCompleted: 23,
        totalOverdue: 3,
        averageWorkload: 65,
        membersOverloaded: 1,
        membersUnderutilized: 2,
        membersBalanced: 2,
        redistributionSuggestions: [
          {
            fromUserId: 'user1',
            fromUserName: 'John Doe',
            toUserId: 'user2',
            toUserName: 'Jane Smith',
            taskCount: 3,
            reason:
              'John Doe está sobrecargado (12 tareas) mientras Jane Smith tiene capacidad disponible (15h)',
          },
        ],
        members: [
          {
            userId: 'user1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            avatarUrl: 'https://example.com/avatar1.jpg',
            assignedTasks: 12,
            completedTasks: 8,
            overdueTasks: 2,
            inProgressTasks: 4,
            hoursWorkedThisWeek: 38.5,
            avgHoursPerDay: 7.7,
            workloadScore: 85,
            workloadLevel: 'OVERLOADED',
            capacityRemaining: 1.5,
            trend: 'INCREASING',
            currentTask: {
              id: 'task123',
              title: 'Complete project documentation',
              startedAt: '2025-12-29T10:00:00.000Z',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the workspace',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Workspace does not exist',
  })
  async getWorkspaceWorkload(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workloadService.getWorkspaceWorkload(workspaceId, user.id);
  }

  /**
   * Get workload for a specific team member
   */
  @Get('member/:userId')
  @ApiOperation({
    summary: 'Get workload for a specific team member',
    description:
      'Retrieves detailed workload information for a specific team member. If workspaceId is provided, filters by that workspace only. Includes task counts, time tracking, workload score, and current task being worked on.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to get workload for',
    type: String,
    example: 'clx9876543210',
  })
  @ApiQuery({
    name: 'workspaceId',
    required: false,
    description: 'Optional workspace ID to filter workload by',
    type: String,
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Member workload retrieved successfully',
    schema: {
      example: {
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        avatarUrl: 'https://example.com/avatar1.jpg',
        assignedTasks: 12,
        completedTasks: 8,
        overdueTasks: 2,
        inProgressTasks: 4,
        hoursWorkedThisWeek: 38.5,
        avgHoursPerDay: 7.7,
        workloadScore: 85,
        workloadLevel: 'OVERLOADED',
        capacityRemaining: 1.5,
        trend: 'INCREASING',
        currentTask: {
          id: 'task123',
          title: 'Complete project documentation',
          startedAt: '2025-12-29T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - User does not exist',
  })
  async getMemberWorkload(
    @Param('userId') userId: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.workloadService.getMemberWorkload(userId, workspaceId);
  }

  /**
   * Get my own workload
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get current user workload',
    description:
      'Retrieves workload information for the authenticated user. If workspaceId is provided, filters by that workspace only. Includes task counts, time tracking, workload score, and current task being worked on.',
  })
  @ApiQuery({
    name: 'workspaceId',
    required: false,
    description: 'Optional workspace ID to filter workload by',
    type: String,
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user workload retrieved successfully',
    schema: {
      example: {
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        avatarUrl: 'https://example.com/avatar1.jpg',
        assignedTasks: 12,
        completedTasks: 8,
        overdueTasks: 2,
        inProgressTasks: 4,
        hoursWorkedThisWeek: 38.5,
        avgHoursPerDay: 7.7,
        workloadScore: 85,
        workloadLevel: 'OVERLOADED',
        capacityRemaining: 1.5,
        trend: 'INCREASING',
        currentTask: {
          id: 'task123',
          title: 'Complete project documentation',
          startedAt: '2025-12-29T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getMyWorkload(
    @CurrentUser() user: RequestUser,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.workloadService.getMemberWorkload(user.id, workspaceId);
  }

  /**
   * Get suggestions for balancing workload in a workspace
   */
  @Get('suggestions/:workspaceId')
  @ApiOperation({
    summary: 'Get workload balancing suggestions',
    description:
      'Retrieves AI-powered suggestions for balancing workload across team members in a workspace. Includes task redistribution, delegation opportunities, prioritization needs, and actionable steps. Suggestions are prioritized by severity.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID to get balancing suggestions for',
    type: String,
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Balancing suggestions retrieved successfully',
    schema: {
      example: [
        {
          type: 'REDISTRIBUTE',
          priority: 'HIGH',
          description:
            'John Doe está sobrecargado (12 tareas) mientras Jane Smith tiene capacidad disponible (15h)',
          affectedUsers: ['user1', 'user2'],
          action: {
            type: 'REASSIGN_TASKS',
            data: {
              fromUser: 'user1',
              toUser: 'user2',
              count: 3,
            },
          },
        },
        {
          type: 'PRIORITIZE',
          priority: 'HIGH',
          description:
            'John Doe tiene 5 tareas vencidas que necesitan atención',
          affectedUsers: ['user1'],
          action: {
            type: 'REVIEW_OVERDUE',
            data: { userId: 'user1' },
          },
        },
        {
          type: 'DELEGATE',
          priority: 'MEDIUM',
          description:
            'Jane Smith tiene capacidad disponible (20h esta semana)',
          affectedUsers: ['user2'],
          action: {
            type: 'SUGGEST_TASKS',
            data: { userId: 'user2' },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the workspace',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Workspace does not exist',
  })
  async getBalancingSuggestions(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workloadService.getBalancingSuggestions(workspaceId);
  }
}
