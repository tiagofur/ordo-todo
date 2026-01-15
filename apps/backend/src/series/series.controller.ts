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
import { SeriesService } from './series.service';
import { CreateSeriesDto, UpdateSeriesDto, SeriesResponseDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';

@ApiTags('Series')
@ApiBearerAuth()
@Controller('series')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class SeriesController {
    constructor(private readonly seriesService: SeriesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new series' })
    @ApiResponse({ status: 201, type: SeriesResponseDto })
    async create(
        @CurrentUser('id') userId: string,
        @WorkspaceId() workspaceId: string,
        @Body() dto: CreateSeriesDto,
    ): Promise<SeriesResponseDto> {
        return this.seriesService.create(userId, workspaceId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all series' })
    @ApiQuery({ name: 'isActive', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiResponse({ status: 200, type: [SeriesResponseDto] })
    async findAll(
        @CurrentUser('id') userId: string,
        @WorkspaceId() workspaceId: string,
        @Query('isActive') isActive?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ): Promise<{ data: SeriesResponseDto[]; total: number; page: number; limit: number }> {
        return this.seriesService.findMany(userId, workspaceId, {
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get series by ID' })
    @ApiResponse({ status: 200, type: SeriesResponseDto })
    async findOne(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @WorkspaceId() workspaceId: string,
    ): Promise<SeriesResponseDto> {
        return this.seriesService.findById(id, userId, workspaceId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a series' })
    @ApiResponse({ status: 200, type: SeriesResponseDto })
    async update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @WorkspaceId() workspaceId: string,
        @Body() dto: UpdateSeriesDto,
    ): Promise<SeriesResponseDto> {
        return this.seriesService.update(id, userId, workspaceId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a series' })
    @ApiResponse({ status: 204 })
    async delete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @WorkspaceId() workspaceId: string,
    ): Promise<void> {
        return this.seriesService.delete(id, userId, workspaceId);
    }

    @Post(':id/content/:contentPieceId')
    @ApiOperation({ summary: 'Add content piece to series' })
    @ApiResponse({ status: 200, type: SeriesResponseDto })
    async addContentPiece(
        @Param('id') seriesId: string,
        @Param('contentPieceId') contentPieceId: string,
        @CurrentUser('id') userId: string,
        @WorkspaceId() workspaceId: string,
        @Body('episodeNumber') episodeNumber?: number,
    ): Promise<SeriesResponseDto> {
        return this.seriesService.addContentPiece(seriesId, contentPieceId, userId, workspaceId, episodeNumber);
    }

    @Delete(':id/content/:contentPieceId')
    @ApiOperation({ summary: 'Remove content piece from series' })
    @ApiResponse({ status: 200, type: SeriesResponseDto })
    async removeContentPiece(
        @Param('id') seriesId: string,
        @Param('contentPieceId') contentPieceId: string,
        @CurrentUser('id') userId: string,
        @WorkspaceId() workspaceId: string,
    ): Promise<SeriesResponseDto> {
        return this.seriesService.removeContentPiece(seriesId, contentPieceId, userId, workspaceId);
    }
}
