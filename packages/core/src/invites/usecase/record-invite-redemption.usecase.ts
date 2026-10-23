import { InviteAlreadyRedeemedError } from "../model/invite-errors";
import { InviteRedemptionData } from "../model/invite-redemption";
import { InviteCodeRepository } from "../provider/invite-code.repository";

export interface RecordInviteRedemptionInput {
  inviteCodeId: string;
  userId: string;
}

/** Links a freshly created user to the code it consumed (one per user). */
export class RecordInviteRedemptionUseCase {
  constructor(private readonly repo: InviteCodeRepository) {}

  async execute(input: RecordInviteRedemptionInput): Promise<InviteRedemptionData> {
    const existing = await this.repo.findRedemptionByUserId(input.userId);
    if (existing) throw new InviteAlreadyRedeemedError();

    return this.repo.recordRedemption(input.inviteCodeId, input.userId);
  }
}
