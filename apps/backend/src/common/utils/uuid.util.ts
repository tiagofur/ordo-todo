/**
 * UUID v4 Generator Utility
 *
 * Uses the Node.js built-in crypto.randomUUID() (engines require Node 22+).
 * No external `uuid` dependency: every runtime import must be declared in
 * apps/backend/package.json, otherwise the pruned production image crashes
 * with MODULE_NOT_FOUND (ODD 035).
 */

/**
 * Generates a UUID v4 string
 * @returns A valid UUID v4 string
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Validates if a string is a valid UUID v4
 * @param uuid - The string to validate
 * @returns true if the string is a valid UUID v4, false otherwise
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
