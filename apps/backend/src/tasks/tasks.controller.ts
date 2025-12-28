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
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { MemberRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TaskGuard } from '../common/guards/task.guard';
import { CreateTaskGuard } from '../common/guards/create-task.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { TasksService } from './tasks.service';
import { TagsService } from '../tags/tags.service';
import { CommentsService } from '../comments/comments.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(
    private readonly tasksService: TasksService,
    @Inject(forwardRef(() => TagsService))
    private readonly tagsService: TagsService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
    @Inject(forwardRef(() => AttachmentsService))
    private readonly attachmentsService: AttachmentsService,
  ) {}

  @Post()
  @UseGuards(CreateTaskGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Patch(':id/complete')
  @UseGuards(TaskGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  complete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.complete(id, user.id);
  }

  /**
   * Get tasks categorized for today view
   * Returns: overdue, dueToday, scheduledToday, available, notYetAvailable
   */
  @Get('today')
  findToday(@CurrentUser() user: RequestUser) {
    return this.tasksService.findToday(user.id);
  }

  /**
   * Get tasks scheduled for a specific date
   */
  @Get('scheduled')
  findScheduled(
    @CurrentUser() user: RequestUser,
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.tasksService.findScheduledForDate(user.id, date);
  }

  /**
   * Get all available tasks (can be started today)
   */
  @Get('available')
  findAvailable(
    @CurrentUser() user: RequestUser,
    @Query('projectId') projectId?: string,
  ) {
    return this.tasksService.findAvailable(user.id, projectId);
  }

  /**
   * Get time-blocked tasks within a date range for calendar view
   */
  @Get('time-blocks')
  findTimeBlocks(
    @CurrentUser() user: RequestUser,
    @Query('start') startStr?: string,
    @Query('end') endStr?: string,
  ) {
    const now = new Date();
    // Default to current week
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    defaultStart.setHours(0, 0, 0, 0);

    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultStart.getDate() + 6); // End of week (Saturday)
    defaultEnd.setHours(23, 59, 59, 999);

    const start = startStr ? new Date(startStr) : defaultStart;
    const end = endStr ? new Date(endStr) : defaultEnd;

    return this.tasksService.findTimeBlocks(user.id, start, end);
  }

  @Get()
  // List filtering is usually done by service (only return tasks user can see).
  // The service currently filters by 'ownerId' which is WRONG for a team app (should be workspace based).
  // But fixing the service logic is a bigger refactor of the 'findAll' method.
  // For now, let's keep it but ideally we should update findAll to filter by workspace permissions.
  findAll(
    @CurrentUser() user: RequestUser,
    @Query('projectId') projectId?: string,
    @Query('tags') tags?: string | string[],
    @Query('assignedToMe') assignedToMe?: string,
  ) {
    const tagList = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;
    const filterAssignedToMe = assignedToMe === 'true';
    this.logger.debug(`Received tags query param: ${JSON.stringify(tags)}`);
    this.logger.debug(`Processed tagList: ${JSON.stringify(tagList)}`);
    this.logger.debug(`Filter assignedToMe: ${filterAssignedToMe}`);
    return this.tasksService.findAll(
      user.id,
      projectId,
      tagList,
      filterAssignedToMe,
    );
  }

  @Get('deleted')
  @UseGuards(TaskGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  getDeleted(@Query('projectId') projectId: string) {
    return this.tasksService.getDeleted(projectId);
  }

  @Delete(':id')
  @UseGuards(TaskGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(TaskGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string) {
    return this.tasksService.restore(id);
  }

  @Delete(':id/permanent')
  @UseGuards(TaskGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentDelete(@Param('id') id: string) {
    return this.tasksService.permanentDelete(id);
  }

  @Post(':id/subtasks')
  @UseGuards(TaskGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @HttpCode(HttpStatus.CREATED)
  createSubtask(
    @Param('id') parentTaskId: string,
    @Body() createSubtaskDto: CreateSubtaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.createSubtask(
      parentTaskId,
      createSubtaskDto,
      user.id,
    );
  }

  @Get(':id/tags')
  @UseGuards(TaskGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  findTags(@Param('id') taskId: string) {
    return this.tagsService.findByTask(taskId);
  }

  @Get(':id/comments')
  @UseGuards(TaskGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  findComments(@Param('id') taskId: string) {
    return this.commentsService.findByTask(taskId);
  }

  @Get(':id/attachments')
  @UseGuards(TaskGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  findAttachments(@Param('id') taskId: string) {
    return this.attachmentsService.findByTask(taskId);
  }

  @Post(':id/share')
  @UseGuards(TaskGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  generatePublicToken(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.generatePublicToken(id, user.id);
  }

  @Public()
  @Get('share/:token')
  findByPublicToken(@Param('token') token: string) {
    return this.tasksService.findByPublicToken(token);
  }

  // Dependencies Reference
  @Get(':id/dependencies')
  @UseGuards(TaskGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  getDependencies(@Param('id') id: string) {
    return this.tasksService.getDependencies(id);
  }

  @Post(':id/dependencies')
  @UseGuards(TaskGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  addDependency(
    @Param('id') id: string,
    @Body('blockingTaskId') blockingTaskId: string,
  ) {
    return this.tasksService.addDependency(id, blockingTaskId);
  }

  @Delete(':id/dependencies/:blockingTaskId')
  @UseGuards(TaskGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  removeDependency(
    @Param('id') id: string,
    @Param('blockingTaskId') blockingTaskId: string,
  ) {
    return this.tasksService.removeDependency(id, blockingTaskId);
  }
}
