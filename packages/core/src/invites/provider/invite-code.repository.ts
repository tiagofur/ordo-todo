import { InviteCode } from "../model/invite-code.entity";
import { InviteRedemptionData } from "../model/invite-redemption";

/**
 * Repository port for platform invite codes (ODD 019).
 *
 * `consume`/`release` are the race-safety pair: consume performs an atomic
 * conditional increment (returns false when the code is not consumable right
 * now, e.g. a concurrent registration took the last use), and release is the
 * compensating decrement used when the registration that consumed a use fails
 * afterwards.
 */
export interface InviteCodeRepository {
  save(invite: InviteCode): Promise<InviteCode>;
  update(invite: InviteCode): Promise<InviteCode>;
  findById(id: string): Promise<InviteCode | null>;
  findByCode(code: string): Promise<InviteCode | null>;
  listAll(): Promise<InviteCode[]>;

  /** Atomic conditional increment; false when inactive/expired/exhausted. */
  consume(id: string, now?: Date): Promise<boolean>;
  /** Compensating decrement, floored at 0. */
  release(id: string): Promise<void>;

  recordRedemption(inviteCodeId: string, userId: string): Promise<InviteRedemptionData>;
  findRedemptionByUserId(userId: string): Promise<InviteRedemptionData | null>;
  countRedemptions(inviteCodeId: string): Promise<number>;
}

export const INVITE_CODE_REPOSITORY = "InviteCodeRepository";
