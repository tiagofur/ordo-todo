import {
  Controller,
  Post,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) { }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
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
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/)) {
          return callback(new BadRequestException('Only image, pdf, word, excel, and text files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
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

    // Create attachment record
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
  create(
    @Body() createAttachmentDto: CreateAttachmentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.attachmentsService.create(createAttachmentDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.attachmentsService.remove(id, user.id);
  }
}
