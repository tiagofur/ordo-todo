import { Injectable } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

/**
 * Public `/v1` comment operations.
 *
 * Thin adapter over {@link CommentsService}: the token owner is always
 * the author, and the underlying service keeps enforcing task access.
 */
@Injectable()
export class V1CommentsService {
  constructor(private readonly commentsService: CommentsService) {}

  create(userId: string, dto: CreateCommentDto) {
    return this.commentsService.create(dto, userId);
  }

  listByTask(taskId: string) {
    return this.commentsService.findByTask(taskId);
  }
}
