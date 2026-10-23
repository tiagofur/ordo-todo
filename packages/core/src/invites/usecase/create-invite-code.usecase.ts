import { InviteCode, RandomInt } from "../model/invite-code.entity";
import { InvalidInviteConfigError } from "../model/invite-errors";
import { InviteCodeRepository } from "../provider/invite-code.repository";

export interface CreateInviteCodeInput {
  label?: string | null;
  /** Defaults to 1 (single-use). */
  maxUses?: number;
  expiresAt?: Date | null;
  createdById?: string | null;
  /** Injected clock for hermetic tests. */
  now?: Date;
}

const MAX_GENERATION_ATTEMPTS = 5;

export class CreateInviteCodeUseCase {
  constructor(
    private readonly repo: InviteCodeRepository,
    private readonly randomInt?: RandomInt,
  ) {}

  async execute(input: CreateInviteCodeInput): Promise<InviteCode> {
    const now = input.now ?? new Date();
    const maxUses = input.maxUses ?? 1;

    if (!Number.isInteger(maxUses) || maxUses < 1) {
      throw new InvalidInviteConfigError("maxUses must be an integer >= 1");
    }
    if (input.expiresAt != null && input.expiresAt <= now) {
      throw new InvalidInviteConfigError("expiresAt must be in the future");
    }

    const label = input.label?.trim() || null;

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const code = InviteCode.generateCode(this.randomInt);
      const collision = await this.repo.findByCode(code);
      if (collision) continue;

      return this.repo.save(
        new InviteCode({
          code,
          label,
          maxUses,
          usedCount: 0,
          expiresAt: input.expiresAt ?? null,
          isActive: true,
          createdById: input.createdById ?? null,
        }),
      );
    }

    throw new Error("Could not generate a unique invite code");
  }
}
