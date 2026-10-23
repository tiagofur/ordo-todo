import { DomainError } from "../../shared/errors";

/** Codes are machine-readable so the API layer can map them to i18n messages. */
export class InviteNotFoundError extends DomainError {
  constructor() {
    super("Invite code not found", "INVITE_INVALID");
  }
}

export class InviteCodeInactiveError extends DomainError {
  constructor() {
    super("Invite code is deactivated", "INVITE_INACTIVE");
  }
}

export class InviteCodeExpiredError extends DomainError {
  constructor() {
    super("Invite code has expired", "INVITE_EXPIRED");
  }
}

export class InviteCodeExhaustedError extends DomainError {
  constructor() {
    super("Invite code has no uses left", "INVITE_EXHAUSTED");
  }
}

export class InviteAlreadyRedeemedError extends DomainError {
  constructor() {
    super("This user has already redeemed an invite code", "INVITE_ALREADY_REDEEMED");
  }
}

export class InvalidInviteConfigError extends DomainError {
  constructor(message: string) {
    super(message, "INVITE_INVALID_INPUT");
  }
}
