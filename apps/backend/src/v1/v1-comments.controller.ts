import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicApiGuard } from './public-api.guard';
import { TokenRateLimitGuard } from './token-rate-limit.guard';
import { V1CommentsService } from './v1-comments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@ApiTags('Public API v1 - Comments')
@ApiBearerAuth()
@Controller('v1/comments')
@UseGuards(PublicApiGuard, TokenRateLimitGuard)
export class V1CommentsController {
  constructor(private readonly v1CommentsService: V1CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a task (public API v1)' })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateCommentDto) {
    return this.v1CommentsService.create(user.id, dto);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'List comments of a task (public API v1)' })
  listByTask(@Param('taskId') taskId: string) {
    return this.v1CommentsService.listByTask(taskId);
  }
}
