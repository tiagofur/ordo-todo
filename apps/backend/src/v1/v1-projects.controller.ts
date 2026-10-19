import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PublicApiGuard } from './public-api.guard';
import { V1ProjectsService } from './v1-projects.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { CreateProjectDto } from '../projects/dto/create-project.dto';
import { UpdateProjectDto } from '../projects/dto/update-project.dto';

@ApiTags('Public API v1 - Projects')
@ApiBearerAuth()
@Controller('v1/projects')
@UseGuards(PublicApiGuard)
export class V1ProjectsController {
  constructor(private readonly v1ProjectsService: V1ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List my projects (public API v1)' })
  list(@CurrentUser() user: RequestUser) {
    return this.v1ProjectsService.list(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id (public API v1)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The project.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found.' })
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.v1ProjectsService.get(user.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a project (public API v1)' })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateProjectDto) {
    return this.v1ProjectsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project (public API v1)' })
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.v1ProjectsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project (public API v1)' })
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.v1ProjectsService.remove(user.id, id);
  }
}
