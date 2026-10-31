import type { RegistrationMode } from "@ordo-todo/api-client";

/**
 * Invite-code registration helpers (ODD 019).
 *
 * The backend answers invite failures with `{ statusCode, code, message }`;
 * these helpers turn that machine code into a message the signup form shows,
 * and centralise the "code required" rule.
 */

/** Backend machine codes → i18n keys (Auth.register.errors.*, ODD 025 S7). */
export const INVITE_ERROR_KEYS: Record<string, string> = {
  INVITE_INVALID: "Auth.register.errors.inviteInvalid",
  INVITE_INACTIVE: "Auth.register.errors.inviteInactive",
  INVITE_EXPIRED: "Auth.register.errors.inviteExpired",
  INVITE_EXHAUSTED: "Auth.register.errors.inviteExhausted",
  REGISTRATION_INVITE_ONLY: "Auth.register.errors.inviteRequired",
};

/** Reads the machine code out of an axios-style error, if any. */
export function extractApiErrorCode(error: unknown): string | undefined {
  const code = (
    error as { response?: { data?: { code?: unknown } } } | null | undefined
  )?.response?.data?.code;
  return typeof code === "string" ? code : undefined;
}

/** Reads the server message out of an axios-style error, if any. */
function extractServerMessage(error: unknown): string | undefined {
  const message = (
    error as { response?: { data?: { message?: unknown } } } | null | undefined
  )?.response?.data?.message;
  return typeof message === "string" && message.length > 0
    ? message
    : undefined;
}

/**
 * Message for a failed registration or login: a precise invite message when
 * the backend sent a known code (translated via `translate`), else the server
 * message, else the fallback. (Never the generic axios "Request failed with
 * status code …".)
 */
export function resolveRegisterErrorMessage(
  error: unknown,
  fallback: string,
  translate?: (key: string) => string,
): string {
  const code = extractApiErrorCode(error);
  const t = translate ?? ((key: string) => key);
  if (code && INVITE_ERROR_KEYS[code]) return t(INVITE_ERROR_KEYS[code]);
  return extractServerMessage(error) ?? fallback;
}

/** True when the gate applies and the user left the code empty. */
export function inviteCodeMissing(
  mode: RegistrationMode,
  code: string,
): boolean {
  return mode !== "open" && code.trim().length === 0;
}
