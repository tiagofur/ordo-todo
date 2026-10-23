import { Entity, EntityProps } from "../../shared/entity";
import {
  InviteCodeExhaustedError,
  InviteCodeExpiredError,
  InviteCodeInactiveError,
} from "./invite-errors";

/**
 * Platform-level invite code (ODD 019): grants the right to CREATE an Ordo
 * account while registration is invite-only. Distinct from WorkspaceInvitation,
 * which grants membership of an existing workspace.
 */
export interface InviteCodeProps extends EntityProps<string> {
  /** Plaintext by design: the admin re-reads/copies it from the panel. */
  code: string;
  label?: string | null;
  maxUses: number;
  usedCount: number;
  expiresAt?: Date | null;
  isActive: boolean;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Alphabet without ambiguous glyphs (0/O, 1/I/L). 31 symbols. */
export const INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_PREFIX = "ORDO";
export const INVITE_CODE_GROUP_LENGTH = 4;
export const INVITE_CODE_GROUPS = 2;

export type RandomInt = (maxExclusive: number) => number;

function defaultRandomInt(maxExclusive: number): number {
  const crypto = globalThis.crypto;
  if (!crypto) {
    throw new Error("Web Crypto is not available in this runtime");
  }
  // Rejection sampling: avoids modulo bias.
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0]!;
  } while (value >= limit);
  return value % maxExclusive;
}

function randomGroup(randomInt: RandomInt): string {
  let group = "";
  for (let i = 0; i < INVITE_CODE_GROUP_LENGTH; i++) {
    group += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return group;
}

export class InviteCode extends Entity<InviteCodeProps> {
  constructor(props: InviteCodeProps) {
    super({
      ...props,
      code: InviteCode.normalize(props.code),
      maxUses: props.maxUses ?? 1,
      usedCount: props.usedCount ?? 0,
      isActive: props.isActive ?? true,
    });
  }

  get code(): string {
    return this.props.code;
  }

  get label(): string | null | undefined {
    return this.props.label;
  }

  get maxUses(): number {
    return this.props.maxUses;
  }

  get usedCount(): number {
    return this.props.usedCount;
  }

  get expiresAt(): Date | null | undefined {
    return this.props.expiresAt;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdById(): string | null | undefined {
    return this.props.createdById;
  }

  /** Trim + uppercase, so users can type the code in any case. */
  static normalize(input: string): string {
    return input.trim().toUpperCase();
  }

  static isValidFormat(code: string): boolean {
    const normalized = InviteCode.normalize(code);
    const pattern = new RegExp(
      `^${INVITE_CODE_PREFIX}(-[${INVITE_CODE_ALPHABET}]{${INVITE_CODE_GROUP_LENGTH}}){${INVITE_CODE_GROUPS}}$`,
    );
    return pattern.test(normalized);
  }

  /** Generates a code like ORDO-7KM2-QP9X. */
  static generateCode(randomInt: RandomInt = defaultRandomInt): string {
    const groups: string[] = [];
    for (let i = 0; i < INVITE_CODE_GROUPS; i++) {
      groups.push(randomGroup(randomInt));
    }
    return `${INVITE_CODE_PREFIX}-${groups.join("-")}`;
  }

  isExpired(now: Date): boolean {
    return this.props.expiresAt != null && this.props.expiresAt <= now;
  }

  isExhausted(): boolean {
    return this.props.usedCount >= this.props.maxUses;
  }

  remainingUses(): number {
    return Math.max(0, this.props.maxUses - this.props.usedCount);
  }

  canBeRedeemed(now: Date): boolean {
    return this.props.isActive && !this.isExpired(now) && !this.isExhausted();
  }

  /**
   * Throws the typed invite error explaining why the code cannot be redeemed
   * right now; returns silently when it can.
   */
  assertRedeemable(now: Date): void {
    if (!this.props.isActive) throw new InviteCodeInactiveError();
    if (this.isExpired(now)) throw new InviteCodeExpiredError();
    if (this.isExhausted()) throw new InviteCodeExhaustedError();
  }

  deactivate(): InviteCode {
    return this.clone({ isActive: false });
  }
}
