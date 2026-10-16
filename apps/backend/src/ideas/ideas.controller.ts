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
import { IdeasService } from './ideas.service';
import { CreateIdeaDto, UpdateIdeaDto, IdeaResponseDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { IdeaStatus } from '@prisma/client';

@ApiTags('Ideas')
@ApiBearerAuth()
@Controller('ideas')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new idea' })
  @ApiResponse({
    status: 201,
    description: 'Idea created successfully',
    type: IdeaResponseDto,
  })
  async create(
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateIdeaDto,
  ): Promise<IdeaResponseDto> {
    return this.ideasService.create(userId, workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ideas for current workspace' })
  @ApiQuery({ name: 'status', required: false, enum: IdeaStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of ideas',
    type: [IdeaResponseDto],
  })
  async findAll(
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
    @Query('status') status?: IdeaStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: IdeaResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.ideasService.findMany(userId, workspaceId, {
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get idea by ID' })
  @ApiResponse({
    status: 200,
    description: 'Idea details',
    type: IdeaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Idea not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
  ): Promise<IdeaResponseDto> {
    return this.ideasService.findById(id, userId, workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an idea' })
  @ApiResponse({
    status: 200,
    description: 'Idea updated successfully',
    type: IdeaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Idea not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
    @Body() dto: UpdateIdeaDto,
  ): Promise<IdeaResponseDto> {
    return this.ideasService.update(id, userId, workspaceId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an idea' })
  @ApiResponse({ status: 204, description: 'Idea deleted successfully' })
  @ApiResponse({ status: 404, description: 'Idea not found' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
  ): Promise<void> {
    return this.ideasService.delete(id, userId, workspaceId);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive an idea' })
  @ApiResponse({
    status: 200,
    description: 'Idea archived successfully',
    type: IdeaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Idea not found' })
  async archive(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @WorkspaceId() workspaceId: string,
  ): Promise<IdeaResponseDto> {
    return this.ideasService.archive(id, userId, workspaceId);
  }
}
