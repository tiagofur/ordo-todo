import { UseCase } from '../../shared/use-case';
import { SubscriptionRepository } from '../provider/subscription.repository';
import { Subscription } from '../model/subscription.entity';

export interface GetUserSubscriptionInput {
  userId: string;
}

export class GetUserSubscriptionUseCase implements UseCase<GetUserSubscriptionInput, Subscription | null> {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async execute(input: GetUserSubscriptionInput): Promise<Subscription | null> {
    return await this.subscriptionRepo.findByUserId(input.userId);
  }
}
