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
  ApiQuery,
} from '@nestjs/swagger';
import { ChangelogService } from './changelog.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Changelog')
@Controller('changelog')
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all changelog entries' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all changelog entries.' })
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.changelogService.findAll({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 20,
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

  // Admin Endpoints protected by JwtAuthGuard
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new changelog entry' })
  @ApiResponse({ status: 201, description: 'Changelog entry created.' })
  create(@Body() createChangelogDto: CreateChangelogDto) {
    return this.changelogService.create(createChangelogDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a changelog entry' })
  @ApiResponse({ status: 200, description: 'Changelog entry deleted.' })
  delete(@Param('id') id: string) {
    return this.changelogService.delete(id);
  }
}
