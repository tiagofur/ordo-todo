import { InviteCode } from "../model/invite-code.entity";
import { InviteCodeExhaustedError, InviteNotFoundError } from "../model/invite-errors";
import { InviteCodeRepository } from "../provider/invite-code.repository";

export interface ConsumeInviteCodeInput {
  code: string;
  /** Injected clock for hermetic tests. */
  now?: Date;
}

/**
 * Validates and consumes one use of an invite code.
 *
 * The readable checks (not found / inactive / expired / exhausted) produce
 * typed errors for the API layer; the final `consume` is atomic at the
 * repository so two concurrent registrations cannot both take the last use —
 * the loser gets INVITE_EXHAUSTED.
 */
export class ConsumeInviteCodeUseCase {
  constructor(private readonly repo: InviteCodeRepository) {}

  async execute(input: ConsumeInviteCodeInput): Promise<InviteCode> {
    const now = input.now ?? new Date();
    const invite = await this.repo.findByCode(InviteCode.normalize(input.code));
    if (!invite) throw new InviteNotFoundError();

    invite.assertRedeemable(now);

    const consumed = await this.repo.consume(invite.id, now);
    if (!consumed) throw new InviteCodeExhaustedError();

    return (await this.repo.findById(invite.id)) ?? invite;
  }
}
