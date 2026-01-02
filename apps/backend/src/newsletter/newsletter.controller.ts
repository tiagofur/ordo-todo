import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @Public()
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({ status: 201, description: 'Subscribed successfully.' })
  @ApiResponse({ status: 400, description: 'Email already subscribed.' })
  subscribe(@Body() subscribeDto: SubscribeDto) {
    return this.newsletterService.subscribe(subscribeDto);
  }

  @Post('subscribe/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe current user to newsletter' })
  @ApiResponse({ status: 201, description: 'Subscribed successfully.' })
  async subscribeMe(@Body() body: any, @CurrentUser() user: RequestUser) {
    if (!user.email) {
      throw new BadRequestException('User email not found');
    }
    return this.newsletterService.subscribe({
      email: user.email,
      userId: user.id,
    });
  }

  @Delete('unsubscribe/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe current user from newsletter' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully.' })
  async unsubscribeMe(@CurrentUser() user: RequestUser) {
    if (!user.email) {
      throw new BadRequestException('User email not found');
    }
    return this.newsletterService.unsubscribe({ email: user.email });
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription status for current user' })
  @ApiResponse({ status: 200, description: 'Returns true/false.' })
  async getStatus(@CurrentUser() user: RequestUser) {
    if (!user.email) return false;
    return this.newsletterService.checkStatus(user.email);
  }

  @Post('unsubscribe')
  @Public()
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully.' })
  @ApiResponse({ status: 404, description: 'Subscriber not found.' })
  unsubscribe(@Body() unsubscribeDto: UnsubscribeDto) {
    return this.newsletterService.unsubscribe(unsubscribeDto);
  }

  // Admin Endpoint
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all newsletter subscribers' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns list of subscribers.' })
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.newsletterService.findAll({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 20,
      orderBy: { createdAt: 'desc' },
    });
  }
}
