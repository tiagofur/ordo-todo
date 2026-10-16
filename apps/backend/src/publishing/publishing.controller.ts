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
import { PublishingService } from './publishing.service';
import {
  CreateSocialPostDto,
  UpdateSocialPostDto,
  SchedulePostDto,
  BulkScheduleDto,
  SocialPostResponseDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ContentPlatform } from '@prisma/client';

@ApiTags('Publishing')
@ApiBearerAuth()
@Controller('publishing')
@UseGuards(JwtAuthGuard)
export class PublishingController {
  constructor(private readonly publishingService: PublishingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a social post draft or scheduled post' })
  @ApiResponse({ status: 201, type: SocialPostResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSocialPostDto,
  ): Promise<SocialPostResponseDto> {
    return this.publishingService.create(userId, dto);
  }

  @Post('bulk-schedule')
  @ApiOperation({ summary: 'Schedule content to multiple platforms at once' })
  @ApiResponse({ status: 201, type: [SocialPostResponseDto] })
  async bulkSchedule(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkScheduleDto,
  ): Promise<SocialPostResponseDto[]> {
    return this.publishingService.bulkSchedule(userId, dto);
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Get all scheduled posts' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'platform', required: false, enum: ContentPlatform })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: [SocialPostResponseDto] })
  async getScheduled(
    @CurrentUser('id') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('platform') platform?: ContentPlatform,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: SocialPostResponseDto[]; total: number }> {
    return this.publishingService.getScheduledPosts(userId, {
      from,
      to,
      platform,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get calendar view of posts' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, type: [SocialPostResponseDto] })
  async getCalendar(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<SocialPostResponseDto[]> {
    return this.publishingService.getCalendarView(userId, startDate, endDate);
  }

  @Get('content/:contentPieceId')
  @ApiOperation({ summary: 'Get all posts for a content piece' })
  @ApiResponse({ status: 200, type: [SocialPostResponseDto] })
  async findByContentPiece(
    @Param('contentPieceId') contentPieceId: string,
  ): Promise<SocialPostResponseDto[]> {
    return this.publishingService.findByContentPiece(contentPieceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get social post by ID' })
  @ApiResponse({ status: 200, type: SocialPostResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<SocialPostResponseDto> {
    return this.publishingService.findById(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a social post' })
  @ApiResponse({ status: 200, type: SocialPostResponseDto })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSocialPostDto,
  ): Promise<SocialPostResponseDto> {
    return this.publishingService.update(id, userId, dto);
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Schedule a draft post' })
  @ApiResponse({ status: 200, type: SocialPostResponseDto })
  async schedule(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SchedulePostDto,
  ): Promise<SocialPostResponseDto> {
    return this.publishingService.schedule(id, userId, dto.scheduledAt);
  }

  @Post(':id/unschedule')
  @ApiOperation({ summary: 'Unschedule a post (move back to draft)' })
  @ApiResponse({ status: 200, type: SocialPostResponseDto })
  async unschedule(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<SocialPostResponseDto> {
    return this.publishingService.unschedule(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a social post' })
  @ApiResponse({ status: 204 })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.publishingService.delete(id, userId);
  }
}
