/**
 * UUID v4 Generator Utility
 *
 * This module provides a UUID v4 generator that avoids bundling issues.
 * Uses crypto.randomUUID() when available (Node.js 16+),
 * with a fallback to the uuid package for older Node.js versions.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a UUID v4 string
 * @returns A valid UUID v4 string
 */
export function generateUuid(): string {
  // Check if crypto.randomUUID is available (Node.js 16+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to uuid package for older Node.js versions
  return uuidv4();
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
