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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { UpdateWorkspaceSettingsDto } from './dto/update-workspace-settings.dto';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workspacesService.create(createWorkspaceDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.workspacesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.workspacesService.remove(id, user.id);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  addMember(
    @Param('id') workspaceId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.workspacesService.addMember(workspaceId, addMemberDto);
  }

  @Get(':id/members')
  getMembers(@Param('id') workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }

  @Get(':id/invitations')
  getInvitations(@Param('id') workspaceId: string) {
    return this.workspacesService.getInvitations(workspaceId);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('id') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return this.workspacesService.removeMember(workspaceId, userId);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.workspacesService.archive(id, user.id);
  }

  @Post(':id/invite')
  @HttpCode(HttpStatus.CREATED)
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

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workspacesService.acceptInvitation(
      acceptInvitationDto.token,
      user.id,
    );
  }

  // ============ WORKSPACE SETTINGS ============

  @Get(':id/settings')
  getSettings(@Param('id') workspaceId: string) {
    return this.workspacesService.getSettings(workspaceId);
  }

  @Put(':id/settings')
  updateSettings(
    @Param('id') workspaceId: string,
    @Body() updateSettingsDto: UpdateWorkspaceSettingsDto,
  ) {
    return this.workspacesService.updateSettings(workspaceId, updateSettingsDto);
  }

  // ============ AUDIT LOGS ============

  @Get(':id/audit-logs')
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
}
