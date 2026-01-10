/**
 * UUID v4 Generator Utility
 *
 * This module provides a UUID v4 generator that works with Next.js Turbopack.
 * It avoids the "dynamic usage of require is not supported" error that occurs
 * when using the uuid package with Turbopack bundler.
 *
 * Uses crypto.randomUUID() when available (modern browsers, Node.js 16+),
 * with a fallback to Math.random()-based implementation for older environments.
 */

/**
 * Generates a UUID v4 string
 * @returns A valid UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
export function generateUuid(): string {
  // Check if crypto.randomUUID is available (modern browsers, Node.js 16+)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation using Math.random()
  // This implements the RFC 4122 version 4 UUID format
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validates if a string is a valid UUID v4
 * @param uuid - The string to validate
 * @returns true if the string is a valid UUID v4, false otherwise
 */
export function isValidUuid(uuid: string): boolean {
  // RFC 4122 UUID v4 format:
  // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // where x is any hexadecimal digit and y is one of 8, 9, A, or B
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
