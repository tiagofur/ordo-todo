/**
 * Invite-code registration helpers (ODD 019 S5).
 *
 * The backend answers invite failures with `{ statusCode, code, message }`
 * (see odd/tasks/019 Log L3); these helpers turn that machine code into the
 * i18n key the signup form shows, and centralise the "code required" rule.
 */

export type RegistrationMode = "invite-only" | "open";

/** Backend machine codes → `RegisterInvite.*` i18n keys. */
export const INVITE_ERROR_KEYS: Record<string, string> = {
  INVITE_INVALID: "errorInvalid",
  INVITE_INACTIVE: "errorInactive",
  INVITE_EXPIRED: "errorExpired",
  INVITE_EXHAUSTED: "errorExhausted",
  REGISTRATION_INVITE_ONLY: "errorInviteOnly",
};

/** Reads the machine code out of an axios-style error, if any. */
export function extractApiErrorCode(error: unknown): string | undefined {
  const code = (
    error as { response?: { data?: { code?: unknown } } } | null | undefined
  )?.response?.data?.code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Message for a failed registration: a precise invite message when the
 * backend sent a known code, otherwise the raw error message (or fallback).
 */
export function resolveRegisterErrorMessage(
  error: unknown,
  t: (key: string) => string,
  fallback: string,
): string {
  const code = extractApiErrorCode(error);
  const key = code ? INVITE_ERROR_KEYS[code] : undefined;
  if (key) return t(key);
  return error instanceof Error && error.message ? error.message : fallback;
}

/** True when the gate applies and the user left the code empty. */
export function inviteCodeMissing(mode: RegistrationMode, code: string): boolean {
  return mode !== "open" && code.trim().length === 0;
}
