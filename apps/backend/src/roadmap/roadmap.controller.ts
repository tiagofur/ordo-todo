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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RoadmapService } from './roadmap.service';
import { CreateRoadmapItemDto } from './dto/create-roadmap-item.dto';
import { UpdateRoadmapItemStatusDto } from './dto/update-roadmap-item-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { User } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Roadmap')
@Controller('roadmap')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all roadmap items' })
  @ApiResponse({ status: 200, description: 'Return list of roadmap items.' })
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.roadmapService.findAll({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 50,
      orderBy: { totalVotes: 'desc' },
    });
  }

  // User Endpoints
  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote for a roadmap item' })
  @ApiResponse({ status: 201, description: 'Voted successfully.' })
  vote(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.roadmapService.vote(id, user.id);
  }

  @Delete(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove vote for a roadmap item' })
  @ApiResponse({ status: 200, description: 'Vote removed.' })
  removeVote(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.roadmapService.removeVote(id, user.id);
  }

  // Admin Endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new roadmap item (Admin)' })
  @ApiResponse({ status: 201, description: 'Item created.' })
  create(@Body() createRoadmapItemDto: CreateRoadmapItemDto) {
    return this.roadmapService.create(createRoadmapItemDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update roadmap item status (Admin)' })
  @ApiResponse({ status: 200, description: 'Status updated.' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateRoadmapItemStatusDto,
  ) {
    return this.roadmapService.updateStatus(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a roadmap item (Admin)' })
  @ApiResponse({ status: 200, description: 'Item deleted.' })
  delete(@Param('id') id: string) {
    return this.roadmapService.delete(id);
  }
}
