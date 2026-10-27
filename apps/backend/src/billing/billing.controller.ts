import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { RequestUser } from '../common/types/request-user.interface';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

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
}
