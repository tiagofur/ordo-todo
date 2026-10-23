import { describe, it, expect } from "@jest/globals";
import { InviteCode } from "../../src/invites/model/invite-code.entity";
import {
  InviteAlreadyRedeemedError,
  InviteCodeExhaustedError,
  InviteCodeExpiredError,
  InviteCodeInactiveError,
  InvalidInviteConfigError,
  InviteNotFoundError,
} from "../../src/invites/model/invite-errors";
import { InviteRedemptionData } from "../../src/invites/model/invite-redemption";
import { InviteCodeRepository } from "../../src/invites/provider/invite-code.repository";
import { CreateInviteCodeUseCase } from "../../src/invites/usecase/create-invite-code.usecase";
import { ConsumeInviteCodeUseCase } from "../../src/invites/usecase/consume-invite-code.usecase";
import { DeactivateInviteCodeUseCase } from "../../src/invites/usecase/deactivate-invite-code.usecase";
import { RecordInviteRedemptionUseCase } from "../../src/invites/usecase/record-invite-redemption.usecase";

// TZ-hermetic: fixed UTC instants only.
const NOW = new Date("2026-01-15T12:00:00.000Z");
const HOUR = 60 * 60 * 1000;

class InMemoryInviteRepository implements InviteCodeRepository {
  codes = new Map<string, InviteCode>();
  redemptions = new Map<string, InviteRedemptionData>();
  private seq = 0;
  /** When set, `consume` reports false even for valid codes (concurrent race). */
  raceStolen = false;

  async save(invite: InviteCode): Promise<InviteCode> {
    const stored = invite.clone({ id: invite.props.id ?? `ic-${++this.seq}` });
    this.codes.set(stored.id, stored);
    return stored;
  }

  async update(invite: InviteCode): Promise<InviteCode> {
    this.codes.set(invite.id, invite);
    return invite;
  }

  async findById(id: string): Promise<InviteCode | null> {
    return this.codes.get(id) ?? null;
  }

  async findByCode(code: string): Promise<InviteCode | null> {
    const normalized = InviteCode.normalize(code);
    for (const invite of this.codes.values()) {
      if (invite.code === normalized) return invite;
    }
    return null;
  }

  async listAll(): Promise<InviteCode[]> {
    return [...this.codes.values()];
  }

  async consume(id: string, now: Date = new Date()): Promise<boolean> {
    const invite = this.codes.get(id);
    if (!invite || this.raceStolen) return false;
    if (!invite.canBeRedeemed(now)) return false;
    this.codes.set(id, invite.clone({ usedCount: invite.usedCount + 1 }));
    return true;
  }

  async release(id: string): Promise<void> {
    const invite = this.codes.get(id);
    if (invite && invite.usedCount > 0) {
      this.codes.set(id, invite.clone({ usedCount: invite.usedCount - 1 }));
    }
  }

  async recordRedemption(
    inviteCodeId: string,
    userId: string,
  ): Promise<InviteRedemptionData> {
    const redemption: InviteRedemptionData = {
      id: `ir-${++this.seq}`,
      inviteCodeId,
      userId,
      redeemedAt: NOW,
    };
    this.redemptions.set(userId, redemption);
    return redemption;
  }

  async findRedemptionByUserId(userId: string): Promise<InviteRedemptionData | null> {
    return this.redemptions.get(userId) ?? null;
  }

  async countRedemptions(inviteCodeId: string): Promise<number> {
    let count = 0;
    for (const redemption of this.redemptions.values()) {
      if (redemption.inviteCodeId === inviteCodeId) count++;
    }
    return count;
  }
}

describe("Invite code use cases (ODD 019 S1)", () => {
  describe("CreateInviteCodeUseCase", () => {
    it("creates a single-use active code by default", async () => {
      const repo = new InMemoryInviteRepository();
      const invite = await new CreateInviteCodeUseCase(repo).execute({ now: NOW });

      expect(invite.code).toMatch(/^ORDO-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
      expect(invite.maxUses).toBe(1);
      expect(invite.usedCount).toBe(0);
      expect(invite.isActive).toBe(true);
    });

    it("persists label, maxUses, expiry and creator", async () => {
      const repo = new InMemoryInviteRepository();
      const invite = await new CreateInviteCodeUseCase(repo).execute({
        label: "beta-cerrada",
        maxUses: 10,
        expiresAt: new Date(NOW.getTime() + 7 * 24 * HOUR),
        createdById: "admin-1",
        now: NOW,
      });

      expect(invite.label).toBe("beta-cerrada");
      expect(invite.maxUses).toBe(10);
      expect(invite.createdById).toBe("admin-1");
      expect(await repo.listAll()).toHaveLength(1);
    });

    it.each([
      [{ maxUses: 0, now: NOW }],
      [{ maxUses: 1.5, now: NOW }],
      [{ expiresAt: new Date(NOW.getTime() - HOUR), now: NOW }],
    ])("rejects invalid config %j", async (input) => {
      const repo = new InMemoryInviteRepository();
      await expect(
        new CreateInviteCodeUseCase(repo).execute(input),
      ).rejects.toThrow(InvalidInviteConfigError);
      expect(await repo.listAll()).toHaveLength(0);
    });

    it("retries generation on a code collision", async () => {
      let roll = 0;
      const repo = new InMemoryInviteRepository();
      const seeded = new CreateInviteCodeUseCase(repo, (max) => {
        // 8 draws per code. Draws 1-8 (first code) and 9-16 (second code's
        // first attempt) produce the same code; from draw 17 on it diverges.
        roll++;
        return roll <= 16 ? 0 : max - 1;
      });

      const first = await seeded.execute({ now: NOW });
      const second = await seeded.execute({ now: NOW });

      expect(first.code).not.toBe(second.code);
      expect(roll).toBe(24); // 8 + 8 (collision) + 8 (retry)
      expect(await repo.listAll()).toHaveLength(2);
    });
  });

  describe("ConsumeInviteCodeUseCase", () => {
    const setup = async (overrides: Partial<InviteCode["props"]> = {}) => {
      const repo = new InMemoryInviteRepository();
      const invite = await repo.save(
        new InviteCode({
          code: "ORDO-7KM2-QP9X",
          maxUses: 2,
          usedCount: 0,
          isActive: true,
          ...overrides,
        }),
      );
      return { repo, invite };
    };

    it("consumes one use and returns the fresh entity", async () => {
      const { repo, invite } = await setup();
      const result = await new ConsumeInviteCodeUseCase(repo).execute({
        code: " ordo-7km2-qp9x ",
        now: NOW,
      });

      expect(result.usedCount).toBe(1);
      expect((await repo.findById(invite.id))!.usedCount).toBe(1);
    });

    it("rejects an unknown code with INVITE_INVALID", async () => {
      const repo = new InMemoryInviteRepository();
      await expect(
        new ConsumeInviteCodeUseCase(repo).execute({ code: "ORDO-ZZZZ-ZZZZ", now: NOW }),
      ).rejects.toThrow(InviteNotFoundError);
    });

    it.each([
      ["inactive", { isActive: false }, InviteCodeInactiveError],
      ["expired", { expiresAt: new Date(NOW.getTime() - 1) }, InviteCodeExpiredError],
      ["exhausted", { maxUses: 2, usedCount: 2 }, InviteCodeExhaustedError],
    ] as const)("%s code is rejected without consuming", async (_name, overrides, error) => {
      const { repo, invite } = await setup(overrides);
      await expect(
        new ConsumeInviteCodeUseCase(repo).execute({ code: invite.code, now: NOW }),
      ).rejects.toThrow(error);
      expect((await repo.findById(invite.id))!.usedCount).toBe(
        overrides.usedCount ?? 0,
      );
    });

    it("maps a lost concurrent consume to INVITE_EXHAUSTED", async () => {
      const { repo, invite } = await setup({ maxUses: 1 });
      const useCase = new ConsumeInviteCodeUseCase(repo);

      // Simulate another registration taking the last use between the
      // readability check and the atomic consume; nothing is consumed here.
      repo.raceStolen = true;
      await expect(
        useCase.execute({ code: invite.code, now: NOW }),
      ).rejects.toThrow(InviteCodeExhaustedError);
      expect((await repo.findById(invite.id))!.usedCount).toBe(0);
    });
  });

  describe("RecordInviteRedemptionUseCase", () => {
    it("records the redemption for a fresh user", async () => {
      const repo = new InMemoryInviteRepository();
      const redemption = await new RecordInviteRedemptionUseCase(repo).execute({
        inviteCodeId: "ic-1",
        userId: "user-1",
      });

      expect(redemption.inviteCodeId).toBe("ic-1");
      expect(redemption.userId).toBe("user-1");
      expect(await repo.countRedemptions("ic-1")).toBe(1);
    });

    it("rejects a user that already redeemed", async () => {
      const repo = new InMemoryInviteRepository();
      const useCase = new RecordInviteRedemptionUseCase(repo);
      await useCase.execute({ inviteCodeId: "ic-1", userId: "user-1" });

      await expect(
        useCase.execute({ inviteCodeId: "ic-2", userId: "user-1" }),
      ).rejects.toThrow(InviteAlreadyRedeemedError);
    });
  });

  describe("DeactivateInviteCodeUseCase", () => {
    it("deactivates without deleting redemptions", async () => {
      const repo = new InMemoryInviteRepository();
      const invite = await repo.save(
        new InviteCode({ code: "ORDO-7KM2-QP9X", maxUses: 1, usedCount: 0, isActive: true }),
      );
      await new RecordInviteRedemptionUseCase(repo).execute({
        inviteCodeId: invite.id,
        userId: "user-1",
      });

      const off = await new DeactivateInviteCodeUseCase(repo).execute(invite.id);

      expect(off.isActive).toBe(false);
      expect(await repo.countRedemptions(invite.id)).toBe(1);
    });

    it("is idempotent and rejects unknown ids", async () => {
      const repo = new InMemoryInviteRepository();
      const invite = await repo.save(
        new InviteCode({ code: "ORDO-7KM2-QP9X", maxUses: 1, usedCount: 0, isActive: true }),
      );
      const useCase = new DeactivateInviteCodeUseCase(repo);

      await useCase.execute(invite.id);
      await expect(useCase.execute(invite.id)).resolves.toMatchObject({
        isActive: false,
      });
      await expect(useCase.execute("nope")).rejects.toThrow(InviteNotFoundError);
    });
  });
});
