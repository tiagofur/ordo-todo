import { InviteCode } from "../model/invite-code.entity";
import { InviteNotFoundError } from "../model/invite-errors";
import { InviteCodeRepository } from "../provider/invite-code.repository";

/** Soft-disables a code (no hard delete: redemptions stay auditable). Idempotent. */
export class DeactivateInviteCodeUseCase {
  constructor(private readonly repo: InviteCodeRepository) {}

  async execute(inviteCodeId: string): Promise<InviteCode> {
    const invite = await this.repo.findById(inviteCodeId);
    if (!invite) throw new InviteNotFoundError();
    if (!invite.isActive) return invite;

    return this.repo.update(invite.deactivate());
  }
}
