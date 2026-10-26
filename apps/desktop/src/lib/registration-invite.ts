import type { RegistrationMode } from "@ordo-todo/api-client";

/**
 * Invite-code registration helpers (ODD 019).
 *
 * The backend answers invite failures with `{ statusCode, code, message }`;
 * these helpers turn that machine code into a message the signup form shows,
 * and centralise the "code required" rule.
 */

/** Backend machine codes → Spanish messages. */
export const INVITE_ERROR_MESSAGES: Record<string, string> = {
  INVITE_INVALID: "El código de invitación no es válido",
  INVITE_INACTIVE: "Este código de invitación está desactivado",
  INVITE_EXPIRED: "Este código de invitación ha caducado",
  INVITE_EXHAUSTED: "Este código de invitación ya se ha usado",
  REGISTRATION_INVITE_ONLY:
    "Necesitas un código de invitación para crear una cuenta",
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
  fallback: string,
): string {
  const code = extractApiErrorCode(error);
  if (code && INVITE_ERROR_MESSAGES[code]) return INVITE_ERROR_MESSAGES[code];
  return error instanceof Error && error.message ? error.message : fallback;
}

/** True when the gate applies and the user left the code empty. */
export function inviteCodeMissing(
  mode: RegistrationMode,
  code: string,
): boolean {
  return mode !== "open" && code.trim().length === 0;
}
