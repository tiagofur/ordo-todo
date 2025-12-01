import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.tagsService.findAll(workspaceId);
  }

  @Post(':tagId/tasks/:taskId')
  @HttpCode(HttpStatus.CREATED)
  assignToTask(@Param('tagId') tagId: string, @Param('taskId') taskId: string) {
    return this.tagsService.assignToTask(tagId, taskId);
  }

  @Delete(':tagId/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromTask(
    @Param('tagId') tagId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tagsService.removeFromTask(tagId, taskId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
