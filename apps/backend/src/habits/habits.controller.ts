import {
  Controller,
  Get,
  Post,
  Put,
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
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';

@ApiTags('Habits')
@ApiBearerAuth()
@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  private readonly logger = new Logger(HabitsController.name);

  constructor(private readonly habitsService: HabitsService) {}

  /**
   * Create a new habit
   * POST /api/v1/habits
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new habit',
    description:
      'Creates a new habit for the authenticated user. Habits can be configured with frequency, target days, and reminders.',
  })
  @ApiBody({ type: CreateHabitDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Habit created successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        name: 'Morning exercise',
        description: '30 minutes of cardio',
        frequency: 'DAILY',
        targetDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        reminderTime: '07:00',
        userId: 'user123',
        isArchived: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async create(
    @Body() createHabitDto: CreateHabitDto,
    @CurrentUser() user: RequestUser,
  ) {
    this.logger.log(
      `Creating habit for user ${user.id}: ${createHabitDto.name}`,
    );
    return this.habitsService.create(createHabitDto, user.id);
  }

  /**
   * Get all habits for current user
   * GET /api/v1/habits
   */
  @Get()
  @ApiOperation({
    summary: 'Get all habits',
    description:
      'Returns all habits for the authenticated user. Can optionally include archived habits.',
  })
  @ApiQuery({
    name: 'includeArchived',
    description: 'Include archived habits in the response',
    required: false,
    example: 'false',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Habits retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'clx1234567890',
          name: 'Morning exercise',
          description: '30 minutes of cardio',
          frequency: 'DAILY',
          targetDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          reminderTime: '07:00',
          userId: 'user123',
          isArchived: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(
    @CurrentUser() user: RequestUser,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.habitsService.findAll(user.id, includeArchived === 'true');
  }

  /**
   * Get habits scheduled for today
   * GET /api/v1/habits/today
   */
  @Get('today')
  @ApiOperation({
    summary: 'Get habits for today',
    description:
      'Returns all habits that are scheduled for the current day based on their target days configuration.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Today's habits retrieved successfully",
    schema: {
      type: 'array',
      example: [
        {
          id: 'clx1234567890',
          name: 'Morning exercise',
          description: '30 minutes of cardio',
          frequency: 'DAILY',
          targetDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          reminderTime: '07:00',
          isArchived: false,
          completedToday: false,
          streakDays: 7,
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findForToday(@CurrentUser() user: RequestUser) {
    return this.habitsService.findForToday(user.id);
  }

  /**
   * Get a single habit
   * GET /api/v1/habits/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get habit by ID',
    description:
      'Returns a single habit by its ID. User must be the owner of the habit.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Habit retrieved successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        name: 'Morning exercise',
        description: '30 minutes of cardio',
        frequency: 'DAILY',
        targetDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        reminderTime: '07:00',
        userId: 'user123',
        isArchived: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.findOne(id, user.id);
  }

  /**
   * Get habit statistics
   * GET /api/v1/habits/:id/stats
   */
  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get habit statistics',
    description:
      'Returns statistics for a habit including completion rate, streak, and recent completion history.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        habitId: 'clx1234567890',
        totalCompletions: 45,
        currentStreak: 7,
        longestStreak: 14,
        completionRate: 0.85,
        last30Days: {
          total: 30,
          completed: 26,
          skipped: 4,
        },
        recentCompletions: [
          { date: '2025-12-29', completedAt: '07:30:00' },
          { date: '2025-12-28', completedAt: '07:15:00' },
        ],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found' })
  async getStats(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.getStats(id, user.id);
  }

  /**
   * Update a habit
   * PATCH /api/v1/habits/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a habit',
    description:
      'Updates an existing habit. User must be the owner of the habit.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
    example: 'clx1234567890',
  })
  @ApiBody({ type: UpdateHabitDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Habit updated successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        name: 'Morning exercise',
        description: '30 minutes of cardio and stretching',
        frequency: 'DAILY',
        targetDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        reminderTime: '07:00',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found' })
  async update(
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.habitsService.update(id, updateHabitDto, user.id);
  }

  /**
   * Delete a habit
   * DELETE /api/v1/habits/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a habit',
    description: 'Permanently deletes a habit. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Habit deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.remove(id, user.id);
  }

  /**
   * Complete a habit for today
   * POST /api/v1/habits/:id/complete
   */
  @Post(':id/complete')
  @ApiOperation({
    summary: 'Complete a habit for today',
    description:
      'Marks a habit as completed for the current day. Can include notes about the completion.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
    example: 'clx1234567890',
  })
  @ApiBody({ type: CompleteHabitDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Habit completed successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        habitId: 'clx1234567890',
        userId: 'user123',
        completedAt: '2025-12-29T07:30:00.000Z',
        notes: 'Great workout today!',
        createdAt: '2025-12-29T07:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or habit already completed today',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found' })
  async complete(
    @Param('id') id: string,
    @Body() completeDto: CompleteHabitDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.habitsService.complete(id, completeDto, user.id);
  }

  /**
   * Uncomplete a habit for today
   * DELETE /api/v1/habits/:id/complete
   */
  @Delete(':id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Uncomplete a habit for today',
    description:
      'Removes the completion status for the current day. This allows re-completing the habit.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Habit uncompleted successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found' })
  async uncomplete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.uncomplete(id, user.id);
  }

  /**
   * Pause a habit
   * POST /api/v1/habits/:id/pause
   */
  @Post(':id/pause')
  @ApiOperation({
    summary: 'Pause a habit',
    description:
      "Pauses a habit. Paused habits will not appear in today's habits and streak will not be affected.",
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Habit paused successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        isPaused: true,
        pausedAt: '2025-12-29T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found' })
  async pause(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.pause(id, user.id);
  }

  /**
   * Resume a habit
   * POST /api/v1/habits/:id/resume
   */
  @Post(':id/resume')
  @ApiOperation({
    summary: 'Resume a habit',
    description:
      "Resumes a paused habit. The habit will appear in today's habits if scheduled for today.",
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Habit resumed successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        isPaused: false,
        resumedAt: '2025-12-29T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found' })
  async resume(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.resume(id, user.id);
  }
}
