import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicApiGuard } from './public-api.guard';
import { UsersService } from '../users/users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';

@ApiTags('Public API v1 - Users')
@ApiBearerAuth()
@Controller('v1/users')
@UseGuards(PublicApiGuard)
export class V1UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the token owner (public API v1)' })
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.getMe(user.email);
  }
}
