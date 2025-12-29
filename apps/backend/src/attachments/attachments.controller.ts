import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@ApiTags('Attachments')
@ApiBearerAuth()
@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

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
          const taskId = req.body.taskId || 'temp';
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const sanitizedName = file.originalname
            .replace(ext, '')
            .replace(/[^a-zA-Z0-9]/g, '_');
          callback(null, `${taskId}-${uniqueSuffix}-${sanitizedName}${ext}`);
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
