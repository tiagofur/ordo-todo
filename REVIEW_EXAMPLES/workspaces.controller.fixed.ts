/**
 * EJEMPLO DE CORRECCIÓN: Controller con Swagger completo
 * Archivo: apps/backend/src/workspaces/workspaces.controller.ts
 */

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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { UpdateWorkspaceSettingsDto } from './dto/update-workspace-settings.dto';

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  /**
   * Creates a new workspace
   * The authenticated user becomes the workspace owner
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new workspace',
    description: 'Creates a new workspace with the authenticated user as owner. A default workflow named "General" is automatically created.'
  })
  @ApiResponse({
    status: 201,
    description: 'Workspace created successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        name: 'My Workspace',
        slug: 'my-workspace',
        description: 'A workspace for my projects',
        type: 'PERSONAL',
        tier: 'FREE',
        color: '#2563EB',
        icon: null,
        ownerId: 'user123',
        isArchived: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Workspace slug already exists for this user' })
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workspacesService.create(createWorkspaceDto, user.id);
  }

  /**
   * Lists all workspaces accessible to the current user
   * Includes owned workspaces and workspaces where user is a member
   */
  @Get()
  @ApiOperation({
    summary: 'Get all workspaces for current user',
    description: 'Returns all workspaces where the user is owner or member. Includes statistics (projects, members, tasks count).'
  })
  @ApiResponse({
    status: 200,
    description: 'List of workspaces retrieved successfully',
    schema: {
      type: 'array',
      example: [{
        id: 'clx1234567890',
        name: 'My Workspace',
        slug: 'my-workspace',
        type: 'PERSONAL',
        tier: 'FREE',
        owner: {
          id: 'user123',
          username: 'john_doe',
          name: 'John Doe',
          email: 'john@example.com'
        },
        stats: {
          projectCount: 5,
          memberCount: 3,
          taskCount: 42
        },
        isArchived: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: RequestUser) {
    return this.workspacesService.findAll(user.id);
  }

  /**
   * Gets workspace details by ID
   * Requires user to be a member with any role
   */
  @Get(':id')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VIEWER)
  @ApiOperation({
    summary: 'Get workspace by ID',
    description: 'Retrieves workspace details. Requires user to be a member of the workspace.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID', example: 'clx1234567890' })
  @ApiResponse({ status: 200, description: 'Workspace retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a member of this workspace' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  findOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id);
  }

  /**
   * Gets workspace by slug (globally - first match)
   * Note: With user namespaces, this may be ambiguous
   */
  @Get('by-slug/:slug')
  @ApiOperation({
    summary: 'Get workspace by slug',
    description: 'Finds workspace by slug. With user namespaces, returns first match. Prefer using /:username/:slug instead.'
  })
  @ApiParam({ name: 'slug', description: 'Workspace slug', example: 'my-workspace' })
  @ApiResponse({ status: 200, description: 'Workspace found' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.workspacesService.findBySlug(slug);
  }

  /**
   * Gets workspace by username and slug (namespaced)
   * Format: /:username/:slug
   */
  @Get(':username/:slug')
  @ApiOperation({
    summary: 'Get workspace by username and slug',
    description: 'Finds workspace using user namespace. This is the preferred way to access workspaces.'
  })
  @ApiParam({ name: 'username', description: 'Workspace owner username', example: 'john_doe' })
  @ApiParam({ name: 'slug', description: 'Workspace slug', example: 'my-workspace' })
  @ApiResponse({ status: 200, description: 'Workspace found' })
  @ApiResponse({ status: 404, description: 'User or workspace not found' })
  findByUserAndSlug(
    @Param('username') username: string,
    @Param('slug') slug: string,
  ) {
    return this.workspacesService.findByUserAndSlug(username, slug);
  }

  /**
   * Updates workspace information
   * Requires OWNER or ADMIN role
   */
  @Put(':id')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({
    summary: 'Update workspace',
    description: 'Updates workspace details. Only OWNER and ADMIN can perform this action.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({ status: 200, description: 'Workspace updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, updateWorkspaceDto);
  }

  /**
   * Soft deletes a workspace
   * Only the OWNER can delete the workspace
   */
  @Delete(':id')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete workspace (soft delete)',
    description: 'Marks workspace as deleted. Only the OWNER can perform this action.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({ status: 204, description: 'Workspace deleted successfully' })
  @ApiResponse({ status: 403, description: 'Only workspace owner can delete' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.workspacesService.remove(id, user.id);
  }

  // ============ MEMBER MANAGEMENT ============

  /**
   * Adds a member to the workspace
   * Requires OWNER or ADMIN role
   */
  @Post(':id/members')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add member to workspace',
    description: 'Adds an existing user to the workspace. User must already be registered in the system.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID or role' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Workspace or user not found' })
  addMember(
    @Param('id') workspaceId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.workspacesService.addMember(workspaceId, addMemberDto);
  }

  /**
   * Lists all members of a workspace
   * All workspace members can view this
   */
  @Get(':id/members')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VIEWER)
  @ApiOperation({
    summary: 'Get workspace members',
    description: 'Returns list of all workspace members with their roles and user information.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'Members list retrieved successfully',
    schema: {
      type: 'array',
      example: [{
        id: 'member123',
        workspaceId: 'workspace123',
        userId: 'user123',
        role: 'OWNER',
        joinedAt: '2025-01-01T00:00:00.000Z',
        user: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://avatar.com/john.jpg'
        }
      }]
    }
  })
  @ApiResponse({ status: 403, description: 'Not a member of this workspace' })
  getMembers(@Param('id') workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }

  /**
   * Removes a member from the workspace
   * Requires OWNER or ADMIN role
   */
  @Delete(':id/members/:userId')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove member from workspace',
    description: 'Removes a user from workspace membership.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  @ApiResponse({ status: 204, description: 'Member removed successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Workspace or member not found' })
  removeMember(
    @Param('id') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return this.workspacesService.removeMember(workspaceId, userId);
  }

  // ============ INVITATIONS ============

  /**
   * Creates an invitation to join the workspace
   * Sends invite via email (in production)
   */
  @Post(':id/invite')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Invite member by email',
    description: 'Sends an invitation email to join the workspace. Returns a dev token for testing without email service.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({
    status: 201,
    description: 'Invitation created and sent',
    schema: {
      example: {
        success: true,
        message: 'Invitation created',
        invitationId: 'inv123',
        devToken: 'abc123def456' // Only for development
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  inviteMember(
    @Param('id') workspaceId: string,
    @Body() inviteMemberDto: InviteMemberDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workspacesService.inviteMember(
      workspaceId,
      user.id,
      inviteMemberDto.email,
      inviteMemberDto.role ?? 'MEMBER',
    );
  }

  /**
   * Accepts a workspace invitation
   * User must be authenticated
   */
  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept workspace invitation',
    description: 'Accepts an invitation using the token received via email. User is added to the workspace with the invited role.'
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully',
    schema: {
      example: {
        success: true,
        message: 'Invitation accepted'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Invitation not found or expired' })
  acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workspacesService.acceptInvitation(
      acceptInvitationDto.token,
      user.id,
    );
  }

  /**
   * Lists pending invitations for a workspace
   * Only OWNER and ADMIN can view invitations
   */
  @Get(':id/invitations')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({
    summary: 'Get workspace invitations',
    description: 'Returns all pending invitations for the workspace.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({ status: 200, description: 'Invitations retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  getInvitations(@Param('id') workspaceId: string) {
    return this.workspacesService.getInvitations(workspaceId);
  }

  // ============ WORKSPACE SETTINGS ============

  /**
   * Gets workspace settings
   * Only OWNER and ADMIN can access settings
   */
  @Get(':id/settings')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({
    summary: 'Get workspace settings',
    description: 'Retrieves workspace configuration settings (default view, timezone, locale, etc.).'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    schema: {
      example: {
        id: 'settings123',
        workspaceId: 'workspace123',
        defaultView: 'KANBAN',
        defaultDueTime: 540, // 9:00 AM
        timezone: 'America/Mexico_City',
        locale: 'es-MX',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  getSettings(@Param('id') workspaceId: string) {
    return this.workspacesService.getSettings(workspaceId);
  }

  /**
   * Updates workspace settings
   * Only OWNER and ADMIN can modify settings
   */
  @Put(':id/settings')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({
    summary: 'Update workspace settings',
    description: 'Updates workspace configuration. All fields are optional.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid settings data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  updateSettings(
    @Param('id') workspaceId: string,
    @Body() updateSettingsDto: UpdateWorkspaceSettingsDto,
  ) {
    return this.workspacesService.updateSettings(
      workspaceId,
      updateSettingsDto,
    );
  }

  // ============ AUDIT LOGS ============

  /**
   * Gets audit logs for workspace activity
   * Only OWNER and ADMIN can access audit logs
   */
  @Get(':id/audit-logs')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({
    summary: 'Get workspace audit logs',
    description: 'Returns audit trail of workspace activities. Supports pagination.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of logs to return', example: 50 })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of logs to skip', example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    schema: {
      example: {
        logs: [{
          id: 'log123',
          workspaceId: 'workspace123',
          actorId: 'user123',
          action: 'WORKSPACE_CREATED',
          payload: { name: 'My Workspace', type: 'PERSONAL' },
          createdAt: '2025-01-01T00:00:00.000Z'
        }],
        total: 42
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  getAuditLogs(
    @Param('id') workspaceId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.workspacesService.getAuditLogs(
      workspaceId,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
  }

  // ============ ARCHIVING ============

  /**
   * Archives a workspace
   * Only OWNER can archive
   */
  @Post(':id/archive')
  @UseGuards(WorkspaceGuard)
  @Roles(MemberRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive workspace',
    description: 'Marks workspace as archived (soft archive). Only the OWNER can perform this action.'
  })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({ status: 200, description: 'Workspace archived successfully' })
  @ApiResponse({ status: 403, description: 'Only workspace owner can archive' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  archive(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.workspacesService.archive(id, user.id);
  }
}
