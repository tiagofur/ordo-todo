import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { GamificationService } from './gamification.service';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get gamification profile for current user',
    description:
      'Returns XP, level, progress to next level, and achievement status.',
  })
  @ApiResponse({
    status: 200,
    description: 'User gamification profile',
  })
  async getMyProfile(@CurrentUser() user: RequestUser) {
    return this.gamificationService.getUserGamificationProfile(user.id);
  }
}
