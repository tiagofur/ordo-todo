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
import { MemberRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProjectGuard } from '../common/guards/project.guard';
import { Roles } from '../common/decorators/roles.decorator';
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
  ) {}

  @Post()
  @UseGuards(ProjectGuard) // ProjectGuard handles logic for creation if workspaceId is in body
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  // We need to ensure user can only list projects for workspaces they are in.
  // ProjectGuard with query logic handles this.
  @UseGuards(ProjectGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  findAll(@Query('workspaceId') workspaceId: string) {
    // Note: ProjectGuard returns false if workspaceId is missing in query.
    // So this endpoint is safe (returns 403 if no workspaceId).
    return this.projectsService.findAll(workspaceId);
  }

  @Get('all')
  findAllByUser(@CurrentUser() user: RequestUser) {
    return this.projectsService.findAllByUser(user.id);
  }

  @Get(':id')
  @UseGuards(ProjectGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
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
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Patch(':id/archive')
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  archive(@Param('id') id: string) {
    this.logger.debug(`Archive endpoint called for project: ${id}`);
    return this.projectsService.archive(id);
  }

  @Patch(':id/complete')
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  complete(@Param('id') id: string) {
    this.logger.debug(`Complete endpoint called for project: ${id}`);
    return this.projectsService.complete(id);
  }

  @Delete(':id')
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
