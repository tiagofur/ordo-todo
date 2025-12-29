import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
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
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { LinkTaskDto } from './dto/link-task.dto';

@ApiTags('Objectives')
@ApiBearerAuth()
@Controller('objectives')
@UseGuards(JwtAuthGuard)
export class ObjectivesController {
  private readonly logger = new Logger(ObjectivesController.name);

  constructor(private readonly objectivesService: ObjectivesService) {}

  /**
   * Create a new objective
   * POST /api/v1/objectives
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new objective',
    description:
      'Creates a new OKR objective with title, description, and optional period tracking. Objectives can be organized by workspace and tracked across time periods.',
  })
  @ApiResponse({
    status: 201,
    description: 'Objective created successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        title: 'Increase user engagement',
        description: 'Improve daily active users by 20%',
        status: 'IN_PROGRESS',
        progress: 0,
        startDate: '2025-01-01T00:00:00.000Z',
        targetDate: '2025-03-31T23:59:59.000Z',
        workspaceId: 'workspace123',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async create(
    @Body() createDto: CreateObjectiveDto,
    @CurrentUser() user: RequestUser,
  ) {
    this.logger.log(
      `Creating objective for user ${user.id}: ${createDto.title}`,
    );
    return this.objectivesService.create(createDto, user.id);
  }

  /**
   * Get all objectives for current user
   * GET /api/v1/objectives
   */
  @Get()
  @ApiOperation({
    summary: 'Get all objectives',
    description:
      'Returns all objectives for the current user with optional filtering by status, time period, and workspace.',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by objective status',
    required: false,
    example: 'IN_PROGRESS',
  })
  @ApiQuery({
    name: 'period',
    description: 'Filter by time period (e.g., 2025-Q1)',
    required: false,
    example: '2025-Q1',
  })
  @ApiQuery({
    name: 'workspaceId',
    description: 'Filter by workspace ID',
    required: false,
    example: 'workspace123',
  })
  @ApiResponse({
    status: 200,
    description: 'Objectives retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'clx1234567890',
          title: 'Increase user engagement',
          description: 'Improve daily active users by 20%',
          status: 'IN_PROGRESS',
          progress: 0.65,
          keyResults: [
            {
              id: 'kr1',
              title: 'Increase DAU to 10k',
              targetValue: 10000,
              currentValue: 6500,
              unit: 'users',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(
    @CurrentUser() user: RequestUser,
    @Query('status') status?: string,
    @Query('period') period?: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.objectivesService.findAll(user.id, {
      status,
      period,
      workspaceId,
    });
  }

  /**
   * Get objectives for the current period
   * GET /api/v1/objectives/current-period
   */
  @Get('current-period')
  @ApiOperation({
    summary: 'Get current period objectives',
    description:
      'Returns all active objectives for the current time period (quarter or year). Useful for dashboard views.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current period objectives retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'clx1234567890',
          title: 'Increase user engagement',
          description: 'Improve daily active users by 20%',
          status: 'IN_PROGRESS',
          progress: 0.65,
          period: '2025-Q1',
          keyResults: [
            {
              id: 'kr1',
              title: 'Increase DAU to 10k',
              targetValue: 10000,
              currentValue: 6500,
              unit: 'users',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findCurrentPeriod(@CurrentUser() user: RequestUser) {
    return this.objectivesService.findCurrentPeriod(user.id);
  }

  /**
   * Get dashboard summary
   * GET /api/v1/objectives/dashboard-summary
   */
  @Get('dashboard-summary')
  @ApiOperation({
    summary: 'Get objectives dashboard summary',
    description:
      'Returns a high-level summary of objectives including total count, progress statistics, and status breakdown for the current period.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary retrieved successfully',
    schema: {
      example: {
        totalObjectives: 10,
        inProgress: 6,
        completed: 2,
        notStarted: 2,
        averageProgress: 0.62,
        totalKeyResults: 25,
        completedKeyResults: 15,
        overallHealth: 'GOOD',
        period: '2025-Q1',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getDashboardSummary(@CurrentUser() user: RequestUser) {
    return this.objectivesService.getDashboardSummary(user.id);
  }

  /**
   * Get a single objective
   * GET /api/v1/objectives/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a single objective',
    description:
      'Returns detailed information about a specific objective including all key results and linked tasks.',
  })
  @ApiParam({
    name: 'id',
    description: 'Objective ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Objective retrieved successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        title: 'Increase user engagement',
        description: 'Improve daily active users by 20%',
        status: 'IN_PROGRESS',
        progress: 0.65,
        startDate: '2025-01-01T00:00:00.000Z',
        targetDate: '2025-03-31T23:59:59.000Z',
        workspaceId: 'workspace123',
        workspace: {
          id: 'workspace123',
          name: 'Marketing Team',
        },
        keyResults: [
          {
            id: 'kr1',
            title: 'Increase DAU to 10k',
            description: 'Daily active users target',
            targetValue: 10000,
            currentValue: 6500,
            unit: 'users',
            progress: 0.65,
            status: 'IN_PROGRESS',
            tasks: [
              {
                id: 'task1',
                title: 'Implement referral program',
                status: 'DONE',
              },
            ],
          },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-15T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your objective' })
  @ApiResponse({ status: 404, description: 'Objective not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.objectivesService.findOne(id, user.id);
  }

  /**
   * Update an objective
   * PATCH /api/v1/objectives/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update an objective',
    description:
      'Updates an existing objective. Can modify title, description, status, dates, and progress. Progress is automatically recalculated based on key results.',
  })
  @ApiParam({
    name: 'id',
    description: 'Objective ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Objective updated successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        title: 'Increase user engagement',
        description: 'Updated description',
        status: 'IN_PROGRESS',
        progress: 0.75,
        targetDate: '2025-04-30T23:59:59.000Z',
        updatedAt: '2025-01-20T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your objective' })
  @ApiResponse({ status: 404, description: 'Objective not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateObjectiveDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.objectivesService.update(id, updateDto, user.id);
  }

  /**
   * Delete an objective
   * DELETE /api/v1/objectives/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an objective',
    description:
      'Permanently deletes an objective and all associated key results. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Objective ID',
    example: 'clx1234567890',
  })
  @ApiResponse({ status: 204, description: 'Objective deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your objective' })
  @ApiResponse({ status: 404, description: 'Objective not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.objectivesService.remove(id, user.id);
  }

  // ============ KEY RESULTS ============

  /**
   * Add a key result to an objective
   * POST /api/v1/objectives/:id/key-results
   */
  @Post(':id/key-results')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add key result to objective',
    description:
      'Adds a new key result to an objective. Key results are measurable outcomes that track progress toward the objective.',
  })
  @ApiParam({
    name: 'id',
    description: 'Objective ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 201,
    description: 'Key result created successfully',
    schema: {
      example: {
        id: 'kr1',
        title: 'Increase DAU to 10k',
        description: 'Daily active users target',
        targetValue: 10000,
        currentValue: 0,
        unit: 'users',
        progress: 0,
        status: 'NOT_STARTED',
        objectiveId: 'clx1234567890',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your objective' })
  @ApiResponse({ status: 404, description: 'Objective not found' })
  async addKeyResult(
    @Param('id') objectiveId: string,
    @Body() createDto: CreateKeyResultDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.objectivesService.addKeyResult(objectiveId, createDto, user.id);
  }

  /**
   * Update a key result
   * PATCH /api/v1/key-results/:id
   */
  @Patch('key-results/:id')
  @ApiOperation({
    summary: 'Update a key result',
    description:
      'Updates an existing key result. Can modify title, description, target value, current value, and unit. Progress and status are automatically calculated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Key result ID',
    example: 'kr1',
  })
  @ApiResponse({
    status: 200,
    description: 'Key result updated successfully',
    schema: {
      example: {
        id: 'kr1',
        title: 'Increase DAU to 10k',
        targetValue: 10000,
        currentValue: 7500,
        unit: 'users',
        progress: 0.75,
        status: 'IN_PROGRESS',
        updatedAt: '2025-01-20T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your key result' })
  @ApiResponse({ status: 404, description: 'Key result not found' })
  async updateKeyResult(
    @Param('id') keyResultId: string,
    @Body() updateDto: UpdateKeyResultDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.objectivesService.updateKeyResult(
      keyResultId,
      updateDto,
      user.id,
    );
  }

  /**
   * Delete a key result
   * DELETE /api/v1/key-results/:id
   */
  @Delete('key-results/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a key result',
    description:
      'Permanently deletes a key result. The parent objective progress will be recalculated based on remaining key results.',
  })
  @ApiParam({
    name: 'id',
    description: 'Key result ID',
    example: 'kr1',
  })
  @ApiResponse({ status: 204, description: 'Key result deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your key result' })
  @ApiResponse({ status: 404, description: 'Key result not found' })
  async removeKeyResult(
    @Param('id') keyResultId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.objectivesService.removeKeyResult(keyResultId, user.id);
  }

  // ============ TASK LINKING ============

  /**
   * Link a task to a key result
   * POST /api/v1/key-results/:id/tasks
   */
  @Post('key-results/:id/tasks')
  @ApiOperation({
    summary: 'Link task to key result',
    description:
      'Links a task to a key result. Tasks contribute to key result progress and help track actual work toward objectives.',
  })
  @ApiParam({
    name: 'id',
    description: 'Key result ID',
    example: 'kr1',
  })
  @ApiResponse({
    status: 201,
    description: 'Task linked successfully',
    schema: {
      example: {
        keyResultId: 'kr1',
        taskId: 'task123',
        linkedAt: '2025-01-20T00:00:00.000Z',
        task: {
          id: 'task123',
          title: 'Implement referral program',
          status: 'TODO',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Task already linked or not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your key result' })
  @ApiResponse({ status: 404, description: 'Key result not found' })
  async linkTask(
    @Param('id') keyResultId: string,
    @Body() linkDto: LinkTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.objectivesService.linkTask(keyResultId, linkDto, user.id);
  }

  /**
   * Unlink a task from a key result
   * DELETE /api/v1/key-results/:id/tasks/:taskId
   */
  @Delete('key-results/:id/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Unlink task from key result',
    description:
      'Removes the link between a task and a key result. The task remains in the project but no longer contributes to key result progress.',
  })
  @ApiParam({
    name: 'id',
    description: 'Key result ID',
    example: 'kr1',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID to unlink',
    example: 'task123',
  })
  @ApiResponse({ status: 204, description: 'Task unlinked successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your key result' })
  @ApiResponse({ status: 404, description: 'Key result or task not found' })
  async unlinkTask(
    @Param('id') keyResultId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.objectivesService.unlinkTask(keyResultId, taskId, user.id);
  }
}
