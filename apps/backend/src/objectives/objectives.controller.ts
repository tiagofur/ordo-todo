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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { LinkTaskDto } from './dto/link-task.dto';

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
  async findCurrentPeriod(@CurrentUser() user: RequestUser) {
    return this.objectivesService.findCurrentPeriod(user.id);
  }

  /**
   * Get dashboard summary
   * GET /api/v1/objectives/dashboard-summary
   */
  @Get('dashboard-summary')
  async getDashboardSummary(@CurrentUser() user: RequestUser) {
    return this.objectivesService.getDashboardSummary(user.id);
  }

  /**
   * Get a single objective
   * GET /api/v1/objectives/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.objectivesService.findOne(id, user.id);
  }

  /**
   * Update an objective
   * PATCH /api/v1/objectives/:id
   */
  @Patch(':id')
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
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.objectivesService.remove(id, user.id);
  }

  // ============ KEY RESULTS ============

  /**
   * Add a key result to an objective
   * POST /api/v1/objectives/:id/key-results
   */
  @Post(':id/key-results')
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
  async unlinkTask(
    @Param('id') keyResultId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.objectivesService.unlinkTask(keyResultId, taskId, user.id);
  }
}
