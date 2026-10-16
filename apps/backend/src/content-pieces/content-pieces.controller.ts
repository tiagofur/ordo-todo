import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ContentPiecesService } from './content-pieces.service';
import {
  CreateContentPieceDto,
  UpdateContentPieceDto,
  UpdateContentStatusDto,
  ContentPieceResponseDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { ContentPipelineStatus } from '@prisma/client';

@ApiTags('Content Pipeline')
@ApiBearerAuth()
@Controller('content')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class ContentPiecesController {
  constructor(private readonly contentPiecesService: ContentPiecesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new content piece' })
  @ApiResponse({
    status: 201,
    description: 'Content piece created successfully',
    type: ContentPieceResponseDto,
  })
  async create(
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateContentPieceDto,
  ): Promise<ContentPieceResponseDto> {
    return this.contentPiecesService.create(userId, workspaceId, dto);
  }

  @Post('promote/:ideaId')
  @ApiOperation({ summary: 'Promote an idea to content piece' })
  @ApiResponse({
    status: 201,
    description: 'Idea promoted to content piece',
    type: ContentPieceResponseDto,
  })
  async promoteFromIdea(
    @Param('ideaId') ideaId: string,
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateContentPieceDto,
  ): Promise<ContentPieceResponseDto> {
    return this.contentPiecesService.promoteFromIdea(
      ideaId,
      userId,
      workspaceId,
      dto,
    );
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get pipeline view (content grouped by status)' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline view with content pieces grouped by status',
  })
  async getPipelineView(
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
  ): Promise<{
    scripting: ContentPieceResponseDto[];
    filming: ContentPieceResponseDto[];
    editing: ContentPieceResponseDto[];
    scheduled: ContentPieceResponseDto[];
    published: ContentPieceResponseDto[];
  }> {
    return this.contentPiecesService.getPipelineView(userId, workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all content pieces' })
  @ApiQuery({ name: 'status', required: false, enum: ContentPipelineStatus })
  @ApiQuery({ name: 'seriesId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of content pieces',
    type: [ContentPieceResponseDto],
  })
  async findAll(
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
    @Query('status') status?: ContentPipelineStatus,
    @Query('seriesId') seriesId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: ContentPieceResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.contentPiecesService.findMany(userId, workspaceId, {
      status,
      seriesId,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content piece by ID' })
  @ApiResponse({
    status: 200,
    description: 'Content piece details',
    type: ContentPieceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Content piece not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
  ): Promise<ContentPieceResponseDto> {
    return this.contentPiecesService.findById(id, userId, workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a content piece' })
  @ApiResponse({
    status: 200,
    description: 'Content piece updated successfully',
    type: ContentPieceResponseDto,
  })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
    @Body() dto: UpdateContentPieceDto,
  ): Promise<ContentPieceResponseDto> {
    return this.contentPiecesService.update(id, userId, workspaceId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update content piece status (move in pipeline)' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: ContentPieceResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
    @Body() dto: UpdateContentStatusDto,
  ): Promise<ContentPieceResponseDto> {
    return this.contentPiecesService.updateStatus(
      id,
      userId,
      workspaceId,
      dto.status,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a content piece' })
  @ApiResponse({
    status: 204,
    description: 'Content piece deleted successfully',
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
  ): Promise<void> {
    return this.contentPiecesService.delete(id, userId, workspaceId);
  }
}
