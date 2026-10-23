/** A persisted redemption: which user consumed which code, exactly once. */
export interface InviteRedemptionData {
  id: string;
  inviteCodeId: string;
  userId: string;
  redeemedAt: Date;
}
