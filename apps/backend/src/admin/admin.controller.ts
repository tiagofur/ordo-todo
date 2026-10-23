import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminGuard } from './admin.guard';
import { AdminUsersService } from './admin-users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  private extractRequestContext(req: Request): {
    ip?: string;
    userAgent?: string;
  } {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
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
}
