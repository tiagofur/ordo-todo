import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminGuard } from './admin.guard';
import { AdminUsersService } from './admin-users.service';
import { AdminOverviewService } from './admin-overview.service';
import { AdminInviteCodesService } from './admin-invite-codes.service';
import {
  CreateInviteCodeDto,
  GrantProDto,
  UpdateInviteCodeDto,
} from './dto/admin.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly adminOverviewService: AdminOverviewService,
    private readonly adminInviteCodesService: AdminInviteCodesService,
  ) {}

  private extractRequestContext(req: Request): {
    ip?: string;
    userAgent?: string;
  } {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }

  @Get('overview')
  @ApiOperation({ summary: 'Platform metrics (ODD 019 S4)' })
  overview() {
    return this.adminOverviewService.getOverview();
  }

  @Get('users')
  @ApiOperation({
    summary: 'List users (identification data only, paginated)',
  })
  listUsers(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminOverviewService.listUsers({ search, page, limit });
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'User detail (aggregates + identification, no content)',
  })
  userDetail(@Param('id') id: string) {
    return this.adminOverviewService.getUserDetail(id);
  }

  @Post('users/:id/block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block a user account (platform admin)' })
  block(
    @Param('id') id: string,
    @CurrentUser() admin: { id: string; email: string },
    @Req() req: Request,
  ) {
    return this.adminUsersService.blockUser(
      id,
      admin,
      this.extractRequestContext(req),
    );
  }

  @Post('users/:id/unblock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unblock a user account (platform admin)' })
  unblock(
    @Param('id') id: string,
    @CurrentUser() admin: { id: string; email: string },
    @Req() req: Request,
  ) {
    return this.adminUsersService.unblockUser(
      id,
      admin,
      this.extractRequestContext(req),
    );
  }

  @Post('users/:id/grant-pro')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gift Pro without Stripe (days or indefinite)' })
  grantPro(
    @Param('id') id: string,
    @Body() body: GrantProDto,
    @CurrentUser() admin: { id: string; email: string },
    @Req() req: Request,
  ) {
    return this.adminUsersService.grantPro(
      id,
      body.days ?? null,
      admin,
      this.extractRequestContext(req),
    );
  }

  @Post('users/:id/revoke-pro')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a gifted Pro (back to FREE)' })
  revokePro(
    @Param('id') id: string,
    @CurrentUser() admin: { id: string; email: string },
    @Req() req: Request,
  ) {
    return this.adminUsersService.revokePro(
      id,
      admin,
      this.extractRequestContext(req),
    );
  }

  @Get('invite-codes')
  @ApiOperation({ summary: 'List invite codes with live usage' })
  listInviteCodes() {
    return this.adminInviteCodesService.list();
  }

  @Post('invite-codes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an invite code' })
  createInviteCode(
    @Body() body: CreateInviteCodeDto,
    @CurrentUser() admin: { id: string; email: string },
    @Req() req: Request,
  ) {
    return this.adminInviteCodesService.create(
      body,
      admin,
      this.extractRequestContext(req),
    );
  }

  @Patch('invite-codes/:id')
  @ApiOperation({ summary: 'Deactivate an invite code (isActive=false only)' })
  updateInviteCode(
    @Param('id') id: string,
    @Body() _body: UpdateInviteCodeDto,
    @CurrentUser() admin: { id: string; email: string },
    @Req() req: Request,
  ) {
    return this.adminInviteCodesService.deactivate(
      id,
      admin,
      this.extractRequestContext(req),
    );
  }
}
