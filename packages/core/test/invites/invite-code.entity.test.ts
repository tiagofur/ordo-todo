import { describe, it, expect } from "@jest/globals";
import {
  InviteCode,
  INVITE_CODE_ALPHABET,
} from "../../src/invites/model/invite-code.entity";
import {
  InviteCodeExhaustedError,
  InviteCodeExpiredError,
  InviteCodeInactiveError,
} from "../../src/invites/model/invite-errors";

// TZ-hermetic: every date is a fixed UTC instant, never local midnight.
const NOW = new Date("2026-01-15T12:00:00.000Z");
const HOUR = 60 * 60 * 1000;

const active = (overrides: Partial<ConstructorParameters<typeof InviteCode>[0]> = {}) =>
  new InviteCode({
    code: "ORDO-7KM2-QP9X",
    maxUses: 1,
    usedCount: 0,
    isActive: true,
    ...overrides,
  });

describe("InviteCode entity (ODD 019 S1)", () => {
  describe("format", () => {
    it("generates codes with the ORDO-XXXX-XXXX shape", () => {
      for (let i = 0; i < 20; i++) {
        expect(InviteCode.generateCode()).toMatch(/^ORDO-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
      }
    });

    it("draws one symbol per character through the injected randomInt", () => {
      let calls = 0;
      // 8 draws per code: first group all slot 0, second group all last slot.
      const code = InviteCode.generateCode((max) => (calls++ < 4 ? 0 : max - 1));
      const first = INVITE_CODE_ALPHABET[0];
      const last = INVITE_CODE_ALPHABET[INVITE_CODE_ALPHABET.length - 1];
      expect(code).toBe(`ORDO-${first.repeat(4)}-${last.repeat(4)}`);
      expect(calls).toBe(8);
    });

    it("excludes ambiguous glyphs (0, O, 1, I, L) from the alphabet", () => {
      expect(INVITE_CODE_ALPHABET).not.toMatch(/[0O1IL]/);
      expect(new Set(INVITE_CODE_ALPHABET).size).toBe(31);
    });

    it("validates and normalizes user input (case/whitespace)", () => {
      expect(InviteCode.isValidFormat(" ordo-7km2-qp9x ")).toBe(true);
      expect(InviteCode.normalize(" ordo-7km2-qp9x ")).toBe("ORDO-7KM2-QP9X");
      expect(InviteCode.isValidFormat("ORDO-7KM2-0P9X")).toBe(false); // 0 is not in the alphabet
      expect(InviteCode.isValidFormat("7KM2-QP9X")).toBe(false);
    });
  });

  describe("redeemability", () => {
    it("accepts an active, unexpired, non-exhausted code", () => {
      const invite = active({ expiresAt: new Date(NOW.getTime() + HOUR) });
      expect(invite.canBeRedeemed(NOW)).toBe(true);
    });

    it.each([
      ["inactive", active({ isActive: false }), InviteCodeInactiveError],
      [
        "expired",
        active({ expiresAt: new Date(NOW.getTime() - 1) }),
        InviteCodeExpiredError,
      ],
      ["exhausted", active({ maxUses: 2, usedCount: 2 }), InviteCodeExhaustedError],
    ] as const)("%s code is rejected with its typed error", (_name, invite, error) => {
      expect(invite.canBeRedeemed(NOW)).toBe(false);
      expect(() => invite.assertRedeemable(NOW)).toThrow(error);
    });

    it("treats the expiry instant as already expired", () => {
      const invite = active({ expiresAt: new Date(NOW.getTime()) });
      expect(() => invite.assertRedeemable(NOW)).toThrow(InviteCodeExpiredError);
    });

    it("never expires without expiresAt", () => {
      const invite = active();
      expect(invite.isExpired(new Date("2099-01-01T00:00:00.000Z"))).toBe(false);
    });

    it("counts remaining uses and never below zero", () => {
      expect(active({ maxUses: 5, usedCount: 3 }).remainingUses()).toBe(2);
      expect(active({ maxUses: 2, usedCount: 5 }).remainingUses()).toBe(0);
    });
  });

  describe("deactivate", () => {
    it("returns a deactivated copy without mutating the original", () => {
      const invite = active();
      const off = invite.deactivate();
      expect(off.isActive).toBe(false);
      expect(invite.isActive).toBe(true);
      expect(off.id).toBe(invite.id);
    });
  });
});
