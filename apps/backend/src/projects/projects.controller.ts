import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { ProjectsService } from './projects.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly workspacesService: WorkspacesService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.projectsService.findAll(workspaceId);
  }

  @Get('all')
  findAllByUser(@CurrentUser() user: RequestUser) {
    return this.projectsService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get('by-slug/:workspaceSlug/:projectSlug')
  async findBySlug(
    @Param('workspaceSlug') workspaceSlug: string,
    @Param('projectSlug') projectSlug: string,
  ) {
    const workspace = await this.workspacesService.findBySlug(workspaceSlug);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return this.projectsService.findBySlug(projectSlug, workspace.id as string);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    this.logger.debug(`Archive endpoint called for project: ${id}`);
    return this.projectsService.archive(id);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    this.logger.debug(`Complete endpoint called for project: ${id}`);
    return this.projectsService.complete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
