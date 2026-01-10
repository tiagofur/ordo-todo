import { UseCase } from '../../shared/use-case';
import { SubscriptionRepository, SubscriptionInput } from '../provider/subscription.repository';
import { Subscription } from '../model/subscription.entity';
import { SubscriptionPlan } from '../model/subscription-enums';

export interface UpgradePlanInput {
  subscriptionId: string;
  newPlan: SubscriptionPlan;
  stripePriceId?: string;
}

export class UpgradePlanUseCase implements UseCase<UpgradePlanInput, Subscription> {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) { }

  async execute(input: UpgradePlanInput): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findById(input.subscriptionId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Validate upgrade
    if (!subscription.canUpgradeTo(input.newPlan)) {
      throw new Error(`Cannot upgrade from ${subscription.plan} to ${input.newPlan}`);
    }

    // Update subscription
    return await this.subscriptionRepo.update(input.subscriptionId, {
      plan: input.newPlan,
      stripePriceId: input.stripePriceId,
    });
  }
}
