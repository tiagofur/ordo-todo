import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { PrismaService } from '../database/prisma.service';

@ApiTags('Attachments')
@ApiBearerAuth()
@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly prisma: PrismaService,
  ) { }


  @Get('project/:projectId')
  @ApiOperation({
    summary: 'Get attachments by project',
    description: 'Retrieves all attachments for a specific project',
  })
  @ApiResponse({
    status: 200,
    description: 'Attachments retrieved successfully',
    schema: {
      example: [
        {
          id: 'clx1234567890',
          taskId: 'clx1234567891',
          filename: 'document.pdf',
          url: '/uploads/1234567890-1234567890_document.pdf',
          mimeType: 'application/pdf',
          filesize: 1024000,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findByProject(@Param('projectId') projectId: string) {
    return this.attachmentsService.findByProject(projectId);
  }

  /**
   * Upload file attachment
   *
   * SECURITY: Validates taskId is a valid UUID, verifies user has access to task,
   * and sanitizes filename to prevent path traversal attacks.
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload with task association',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        taskId: {
          type: 'string',
          description: 'Task ID to associate the attachment with',
        },
      },
      required: ['file', 'taskId'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          // SECURITY: Generate safe filename using UUID instead of user-provided taskId
          // This prevents path traversal attacks like taskId = "../../evil-files"
          const safeId = uuidv4();
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          // Sanitize filename: remove non-alphanumeric characters
          const sanitizedName = file.originalname
            .replace(ext, '')
            .replace(/[^a-zA-Z0-9]/g, '_');
          // Safe filename pattern: UUID-timestamp-random_sanitized-name.ext
          callback(null, `${safeId}-${uniqueSuffix}_${sanitizedName}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (
          !file.originalname.match(
            /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/,
          )
        ) {
          return callback(
            new BadRequestException(
              'Only image, pdf, word, excel, and text files are allowed!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload file attachment',
    description:
      'Uploads a file attachment and associates it with a task. Supports images, PDFs, Word, Excel, and text files up to 10MB.',
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: {
        success: true,
        url: '/uploads/taskId-1234567890-1234567890_document.pdf',
        filename: 'document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        attachment: {
          id: 'clx1234567890',
          taskId: 'clx1234567891',
          filename: 'document.pdf',
          url: '/uploads/taskId-1234567890-1234567890_document.pdf',
          mimeType: 'application/pdf',
          filesize: 1024000,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No file or taskId provided' })
  @ApiResponse({ status: 400, description: 'Invalid file type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 413, description: 'File too large (max 10MB)' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('taskId') taskId: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!taskId) {
      throw new BadRequestException('No taskId provided');
    }

    // SECURITY: Validate taskId is a valid UUID format (prevents injection attacks)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(taskId)) {
      throw new BadRequestException('Invalid taskId format');
    }

    // SECURITY: Verify task exists and user has access to it (workspace membership)
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { workspaceId: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify user is a member of the workspace
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: task.project.workspaceId,
          userId: user.id,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'You do not have permission to upload files to this task',
      );
    }

    const attachment = await this.attachmentsService.create(
      {
        taskId,
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        filesize: file.size,
      },
      user.id,
    );

    return {
      success: true,
      url: attachment.url,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      filesize: attachment.filesize,
      attachment,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create attachment record',
    description:
      'Creates a new attachment record without file upload. Use this for attachments hosted externally.',
  })
  @ApiResponse({
    status: 201,
    description: 'Attachment created successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        taskId: 'clx1234567891',
        filename: 'document.pdf',
        url: 'https://example.com/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  create(
    @Body() createAttachmentDto: CreateAttachmentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.attachmentsService.create(createAttachmentDto, user.id);
  }

  /**
   * Get a single attachment by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get attachment by ID',
    description: 'Retrieves a single attachment with all details',
  })
  @ApiResponse({
    status: 200,
    description: 'Attachment retrieved successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        taskId: 'clx1234567891',
        filename: 'document.pdf',
        url: 'https://example.com/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedById: 'user123',
        uploadedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  findOne(@Param('id') id: string) {
    return this.attachmentsService.findOne(id);
  }

  /**
   * Update attachment details
   * Only the attachment uploader can update
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update attachment',
    description:
      'Updates attachment details like filename. Only the uploader can update.',
  })
  @ApiResponse({
    status: 200,
    description: 'Attachment updated successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        taskId: 'clx1234567891',
        filename: 'updated-document.pdf',
        url: 'https://example.com/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the attachment uploader',
  })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  update(
    @Param('id') id: string,
    @Body() updateAttachmentDto: CreateAttachmentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.attachmentsService.update(id, updateAttachmentDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete attachment',
    description:
      'Deletes an attachment by ID. Only the attachment owner can delete it.',
  })
  @ApiResponse({ status: 204, description: 'Attachment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not the attachment owner',
  })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.attachmentsService.remove(id, user.id);
  }
}
