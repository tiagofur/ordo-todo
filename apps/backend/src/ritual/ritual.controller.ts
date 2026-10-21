import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody as ApiBodyDecorator, ApiOperation } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { RitualService } from './ritual.service';
import { CompleteMorningDto } from './dto/complete-morning.dto';

// ODD 006 S1 (T1): morning ritual endpoints. Skippable with one touch;
// the ritual never blocks the app (no guards beyond auth).
@Controller('ritual')
@UseGuards(JwtAuthGuard)
export class RitualController {
  constructor(private readonly ritualService: RitualService) {}

  @Get('morning')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @ApiOperation({
    summary: 'Get the morning ritual (plan + overdue + suggested top-3)',
  })
  getMorning(@CurrentUser() user: RequestUser) {
    return this.ritualService.getMorning(user.id);
  }

  @Post('morning/complete')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete the morning ritual with a top-3' })
  @ApiBodyDecorator({ type: CompleteMorningDto })
  completeMorning(
    @Body() dto: CompleteMorningDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.ritualService.completeMorning(user.id, dto.top3);
  }

  @Post('morning/skip')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Skip the morning ritual (one touch)' })
  skipMorning(@CurrentUser() user: RequestUser) {
    return this.ritualService.skipMorning(user.id);
  }
}
