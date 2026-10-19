import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PublicApiGuard } from './public-api.guard';
import { V1TasksService } from './v1-tasks.service';
import type { V1TaskFilters } from './v1-tasks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';

@ApiTags('Public API v1 - Tasks')
@ApiBearerAuth()
@Controller('v1/tasks')
@UseGuards(PublicApiGuard)
export class V1TasksController {
  constructor(private readonly v1TasksService: V1TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List my tasks (public API v1)' })
  list(@CurrentUser() user: RequestUser, @Query() filters: V1TaskFilters) {
    return this.v1TasksService.list(user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id (public API v1)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The task.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found.' })
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.v1TasksService.get(user.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a task (public API v1)' })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateTaskDto) {
    return this.v1TasksService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (public API v1)' })
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.v1TasksService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task (public API v1)' })
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.v1TasksService.remove(user.id, id);
  }
}
