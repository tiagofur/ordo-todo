import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all notifications',
    description:
      'Returns all notifications for the authenticated user, ordered by creation date (newest first). Includes read status and notification metadata.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'notif1',
          userId: 'user123',
          type: 'TASK_ASSIGNED',
          title: 'Task assigned to you',
          message: 'You have been assigned to "Complete documentation"',
          isRead: false,
          metadata: { taskId: 'task1', projectId: 'project1' },
          createdAt: '2025-12-29T10:00:00.000Z',
        },
        {
          id: 'notif2',
          userId: 'user123',
          type: 'TASK_DUE_SOON',
          title: 'Task due soon',
          message: '"Write API docs" is due in 2 hours',
          isRead: true,
          metadata: { taskId: 'task2' },
          createdAt: '2025-12-29T08:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findAll(@Request() req) {
    return this.notificationsService.findAll(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notifications count',
    description:
      'Returns the total number of unread notifications for the authenticated user. Useful for displaying notification badges.',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      example: {
        count: 5,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Marks a specific notification as read. Updates the isRead flag and readAt timestamp.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 'notif1',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    schema: {
      example: {
        id: 'notif1',
        userId: 'user123',
        type: 'TASK_ASSIGNED',
        title: 'Task assigned to you',
        message: 'You have been assigned to "Complete documentation"',
        isRead: true,
        readAt: '2025-12-29T12:00:00.000Z',
        metadata: { taskId: 'task1', projectId: 'project1' },
        createdAt: '2025-12-29T10:00:00.000Z',
        updatedAt: '2025-12-29T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('mark-all-read')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description:
      'Marks all unread notifications for the authenticated user as read. Useful for bulk clearing notifications.',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
    schema: {
      example: {
        count: 10,
        message: '10 notifications marked as read',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
