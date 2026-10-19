import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PublicApiGuard } from '../v1/public-api.guard';
import { WebhooksService } from './webhooks.service';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import {
  CreatedWebhookResponseDto,
  WebhookDeliveryResponseDto,
  WebhookResponseDto,
} from './dto/webhook-response.dto';

@ApiTags('Public API v1 - Webhooks')
@ApiBearerAuth()
@Controller('v1/webhooks')
@UseGuards(PublicApiGuard)
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly dispatcher: WebhookDispatcherService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to webhook events (public API v1)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription created. The secret is returned only once.',
    type: CreatedWebhookResponseDto,
  })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateWebhookDto,
  ): Promise<CreatedWebhookResponseDto> {
    return this.webhooksService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my webhook subscriptions (public API v1)' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [WebhookResponseDto],
  })
  list(@CurrentUser() user: RequestUser) {
    return this.webhooksService.list(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a webhook subscription (public API v1)' })
  remove(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.webhooksService.remove(user.id, id);
  }

  @Get(':id/deliveries')
  @ApiOperation({
    summary: 'List deliveries of a subscription (public API v1)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [WebhookDeliveryResponseDto],
  })
  listDeliveries(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.webhooksService.listDeliveries(user.id, id);
  }

  @Post('deliveries/:deliveryId/redeliver')
  @ApiOperation({ summary: 'Redeliver a failed delivery (public API v1)' })
  redeliver(
    @CurrentUser() user: RequestUser,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.dispatcher.redeliver(user.id, deliveryId);
  }
}
