import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type Stripe from 'stripe';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { RequestUser } from '../common/types/request-user.interface';
import { BillingConfig } from './billing.config';
import { BillingService } from './billing.service';
import { BillingWebhookService } from './billing-webhook.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { StripeService } from './stripe.service';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly billingWebhookService: BillingWebhookService,
    private readonly stripeService: StripeService,
    private readonly billingConfig: BillingConfig,
  ) {}

  @Post('checkout-session')
  @ApiOperation({
    summary: 'Crea una sesión de Stripe Checkout para suscribirse a Pro o Team',
  })
  createCheckoutSession(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.billingService.createCheckoutSession(user.id, dto);
  }

  @Post('portal-session')
  @ApiOperation({
    summary:
      'Crea una sesión del Customer Portal (facturas, pago, cancelación)',
  })
  createPortalSession(@CurrentUser() user: RequestUser) {
    return this.billingService.createPortalSession(user.id);
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Estado de la suscripción del usuario actual' })
  getSubscription(@CurrentUser() user: RequestUser) {
    return this.billingService.getSubscriptionState(user.id);
  }

  /**
   * Stripe calls this with the raw body; the signature check needs those
   * exact bytes, hence request.rawBody (enabled in main.ts). @Public()
   * because Stripe cannot authenticate with our JWTs — the signature IS the
   * auth here (ODD 012 S3).
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() request: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<{ received: boolean; result: string }> {
    if (!signature) {
      throw new BadRequestException('Falta la cabecera stripe-signature.');
    }
    const secret = this.billingConfig.webhookSecret;
    if (!secret) {
      throw new BadRequestException(
        'Webhook de billing no configurado (falta STRIPE_WEBHOOK_SECRET).',
      );
    }

    // getClient() fuera del try: un 503 por falta de configuración no debe
    // reportarse como "firma inválida".
    const stripe = this.stripeService.getClient();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        request.rawBody ?? Buffer.alloc(0),
        signature,
        secret,
      );
    } catch (error) {
      throw new BadRequestException(
        `Firma de webhook inválida: ${(error as Error).message}`,
      );
    }

    const result = await this.billingWebhookService.processEvent(event);
    return { received: true, result };
  }
}
