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
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProjectGuard } from '../common/guards/project.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CacheResult,
  CacheInvalidate,
  CacheTTL,
} from '../common/decorators/cache';
import {
  CacheInterceptor,
  CacheInvalidateInterceptor,
} from '../common/decorators/cache';
import type { RequestUser } from '../common/types/request-user.interface';
import { ProjectsService } from './projects.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Post()
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('projects')
  @UseGuards(ProjectGuard) // ProjectGuard handles logic for creation if workspaceId is in body
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new project',
    description:
      'Creates a new project within a workspace. User must be OWNER, ADMIN, or MEMBER of the workspace.',
  })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'User does not have permission to create projects in this workspace',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheResult('projects', CacheTTL.MEDIUM)
  // We need to ensure user can only list projects for workspaces they are in.
  // ProjectGuard with query logic handles this.
  @UseGuards(ProjectGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  @ApiOperation({
    summary: 'Get all projects in a workspace',
    description:
      'Retrieves all projects for the specified workspace. User must be a member of the workspace.',
  })
  @ApiQuery({
    name: 'workspaceId',
    required: true,
    description: 'ID of the workspace to get projects from',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Projects retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to this workspace',
  })
  findAll(@Query('workspaceId') workspaceId: string) {
    // Note: ProjectGuard returns false if workspaceId is missing in query.
    // So this endpoint is safe (returns 403 if no workspaceId).
    return this.projectsService.findAll(workspaceId);
  }

  @Get('all')
  @UseInterceptors(CacheInterceptor)
  @CacheResult('projects:all', CacheTTL.SHORT)
  @ApiOperation({
    summary: 'Get all projects for current user',
    description:
      'Retrieves all projects across all workspaces where the user is a member.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Projects retrieved successfully',
  })
  findAllByUser(@CurrentUser() user: RequestUser) {
    return this.projectsService.findAllByUser(user.id);
  }

  @Get('deleted')
  @UseGuards(ProjectGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  @ApiOperation({
    summary: 'Get deleted projects',
    description:
      'Retrieves all soft-deleted projects for the specified workspace.',
  })
  @ApiQuery({
    name: 'workspaceId',
    required: true,
    description: 'ID of the workspace to get deleted projects from',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deleted projects retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to this workspace',
  })
  getDeleted(@Query('workspaceId') workspaceId: string) {
    return this.projectsService.getDeleted(workspaceId);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheResult('project', CacheTTL.LONG)
  @UseGuards(ProjectGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  @ApiOperation({
    summary: 'Get project by ID',
    description:
      'Retrieves a single project by its ID. User must have access to the workspace.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to this project',
  })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get('by-slug/:workspaceSlug/:projectSlug')
  @UseGuards(ProjectGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  @ApiOperation({
    summary: 'Get project by workspace and project slugs',
    description:
      'Retrieves a project using human-readable slugs for both workspace and project. Requires workspace membership.',
  })
  @ApiParam({
    name: 'workspaceSlug',
    description: 'Workspace slug (URL-friendly name)',
  })
  @ApiParam({
    name: 'projectSlug',
    description: 'Project slug (URL-friendly name)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workspace or project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to this workspace',
  })
  async findBySlug(
    @Param('workspaceSlug') workspaceSlug: string,
    @Param('projectSlug') projectSlug: string,
    @CurrentUser() user: RequestUser,
  ) {
    const workspace = await this.workspacesService.findBySlug(
      workspaceSlug,
      user.id,
    );
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return this.projectsService.findBySlug(projectSlug, workspace.id as string);
  }

  @Put(':id')
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('projects')
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @ApiOperation({
    summary: 'Update project',
    description:
      'Updates an existing project. User must be OWNER, ADMIN, or MEMBER of the workspace.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
  })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to update this project',
  })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Patch(':id/archive')
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('projects')
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({
    summary: 'Archive/unarchive project',
    description:
      'Toggles the archived status of a project. Only OWNER and ADMIN can archive projects.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project archived status toggled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to archive this project',
  })
  archive(@Param('id') id: string) {
    this.logger.debug(`Archive endpoint called for project: ${id}`);
    return this.projectsService.archive(id);
  }

  @Patch(':id/complete')
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @ApiOperation({
    summary: 'Mark project as complete',
    description:
      'Marks a project as completed. User must be OWNER, ADMIN, or MEMBER.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project marked as complete successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to complete this project',
  })
  complete(@Param('id') id: string) {
    this.logger.debug(`Complete endpoint called for project: ${id}`);
    return this.projectsService.complete(id);
  }

  @Delete(':id')
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('projects')
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete project',
    description:
      'Marks a project as deleted (soft delete). Only OWNER and ADMIN can delete projects.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Project soft deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to delete this project',
  })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore deleted project',
    description:
      'Restores a soft-deleted project. Only OWNER and ADMIN can restore projects.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project restored successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to restore this project',
  })
  restore(@Param('id') id: string) {
    return this.projectsService.restore(id);
  }

  @Delete(':id/permanent')
  @UseGuards(ProjectGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Permanently delete project',
    description:
      'Permanently deletes a project and all its tasks. The project must be soft deleted first. This action cannot be undone. Only OWNER and ADMIN can permanently delete projects.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Project permanently deleted',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Project must be soft deleted first',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'User does not have permission to permanently delete this project',
  })
  permanentDelete(@Param('id') id: string) {
    return this.projectsService.permanentDelete(id);
  }
}
