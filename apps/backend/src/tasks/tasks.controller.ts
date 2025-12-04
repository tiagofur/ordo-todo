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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
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
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.complete(id, user.id);
  }

  @Get()
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
    return this.tasksService.findAll(user.id, projectId, tagList, filterAssignedToMe);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Get(':id/details')
  findOneWithDetails(@Param('id') id: string) {
    return this.tasksService.findOneWithDetails(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.update(id, updateTaskDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/subtasks')
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
  findTags(@Param('id') taskId: string) {
    return this.tagsService.findByTask(taskId);
  }

  @Get(':id/comments')
  findComments(@Param('id') taskId: string) {
    return this.commentsService.findByTask(taskId);
  }

  @Get(':id/attachments')
  findAttachments(@Param('id') taskId: string) {
    return this.attachmentsService.findByTask(taskId);
  }
}
