import {
  Controller,
  Get,
  Post,
  Put,
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
} from '@nestjs/swagger';
import { PaginationDto, toTakeSkip } from '../common/dto/pagination.dto';
import { ChangelogService } from './changelog.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';
import { AdminGuard } from '../admin/admin.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Changelog')
@Controller('changelog')
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all changelog entries' })
  @ApiResponse({ status: 200, description: 'Return all changelog entries.' })
  findAll(@Query() pagination: PaginationDto) {
    return this.changelogService.findAll({
      ...toTakeSkip(pagination),
      orderBy: 'publishedAt',
    });
  }

  @Get('latest')
  @Public()
  @ApiOperation({ summary: 'Get the latest changelog entry' })
  @ApiResponse({
    status: 200,
    description: 'Return the latest changelog entry.',
  })
  getLatest() {
    return this.changelogService.getLatestRelease();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a changelog entry by ID' })
  @ApiResponse({ status: 200, description: 'Return the changelog entry.' })
  @ApiResponse({ status: 404, description: 'Entry not found.' })
  findOne(@Param('id') id: string) {
    return this.changelogService.findOne(id);
  }

  // Admin endpoints: global JwtAuthGuard authenticates, AdminGuard authorizes.
  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new changelog entry' })
  @ApiResponse({ status: 201, description: 'Changelog entry created.' })
  create(@Body() createChangelogDto: CreateChangelogDto) {
    return this.changelogService.create(createChangelogDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a changelog entry' })
  @ApiResponse({ status: 200, description: 'Changelog entry updated.' })
  update(
    @Param('id') id: string,
    @Body() updateChangelogDto: UpdateChangelogDto,
  ) {
    return this.changelogService.update(id, updateChangelogDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a changelog entry' })
  @ApiResponse({ status: 200, description: 'Changelog entry deleted.' })
  delete(@Param('id') id: string) {
    return this.changelogService.delete(id);
  }
}
