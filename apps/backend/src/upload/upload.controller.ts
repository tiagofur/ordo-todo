import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  /**
   * Upload a file to the server
   * Accepts image, PDF, and document files up to 10MB
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a file',
    description:
      'Uploads a single file to the server. Supports images (jpg, jpeg, png, gif), PDF documents, and text files. Maximum file size is 10MB.',
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      example: {
        url: '/uploads/file-1735400000000-123456789.jpg',
        filename: 'my-document.pdf',
        size: 524288,
        mimeType: 'application/pdf',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No file uploaded or invalid file type',
    schema: {
      example: {
        statusCode: 400,
        message: 'No file uploaded',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'File type not allowed',
    schema: {
      example: {
        statusCode: 400,
        message: 'Only image, pdf, and document files are allowed!',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large - Maximum size is 10MB',
    schema: {
      example: {
        statusCode: 413,
        message: 'File too large',
        error: 'Payload Too Large',
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
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
              'Only image, pdf, and document files are allowed!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(`Upload request received`);

    if (!file) {
      this.logger.error('No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(`File uploaded successfully: ${file.filename}`);

    return {
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
