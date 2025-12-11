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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';

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
  async findForToday(@CurrentUser() user: RequestUser) {
    return this.habitsService.findForToday(user.id);
  }

  /**
   * Get a single habit
   * GET /api/v1/habits/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.findOne(id, user.id);
  }

  /**
   * Get habit statistics
   * GET /api/v1/habits/:id/stats
   */
  @Get(':id/stats')
  async getStats(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.getStats(id, user.id);
  }

  /**
   * Update a habit
   * PATCH /api/v1/habits/:id
   */
  @Patch(':id')
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
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.remove(id, user.id);
  }

  /**
   * Complete a habit for today
   * POST /api/v1/habits/:id/complete
   */
  @Post(':id/complete')
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
  async uncomplete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.uncomplete(id, user.id);
  }

  /**
   * Pause a habit
   * POST /api/v1/habits/:id/pause
   */
  @Post(':id/pause')
  async pause(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.pause(id, user.id);
  }

  /**
   * Resume a habit
   * POST /api/v1/habits/:id/resume
   */
  @Post(':id/resume')
  async resume(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.habitsService.resume(id, user.id);
  }
}
