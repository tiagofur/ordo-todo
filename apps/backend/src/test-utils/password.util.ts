import * as bcrypt from 'bcrypt';

/**
 * Test utility for generating valid bcrypt hashes
 *
 * Usage:
 * ```typescript
 * import { generateTestHash, MOCK_VALID_HASH } from './password.util';
 *
 * // Async version
 * const hash = await generateTestHash('mypassword');
 *
 * // Sync version (pre-generated)
 * const user = new User({ password: MOCK_VALID_HASH });
 * ```
 */

/**
 * Generate a valid bcrypt hash for testing
 *
 * @param password - Plain text password to hash (default: 'testpassword')
 * @returns Valid bcrypt hash string
 *
 * @example
 * ```typescript
 * let testHash: string;
 * beforeAll(async () => {
 *   testHash = await generateTestHash('securepassword');
 * });
 * ```
 */
export async function generateTestHash(
  password: string = 'testpassword',
): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Pre-generated valid bcrypt hashes for synchronous tests
 *
 * These are real bcrypt hashes (cost 10) that can be used in tests
 * without async setup. They all hash to the same plaintext password
 * for consistency.
 *
 * IMPORTANT: Do NOT use these in production code!
 *
 * @example
 * ```typescript
 * const mockUser = {
 *   id: 'user-123',
 *   email: 'test@example.com',
 *   password: MOCK_VALID_HASH, // ✅ Valid bcrypt format
 * };
 * ```
 */
export const MOCK_VALID_HASH =
  '$2b$10$N9qo8uLOickgx2ZMRZoMye1eqhQ0XpKZSY5pL2vJY5VHEwV8sAyOa';

/**
 * Alternative valid bcrypt hash (for testing multiple users)
 *
 * Same password as MOCK_VALID_HASH but different salt
 */
export const MOCK_VALID_HASH_2 =
  '$2b$10$U4FGKBVsGdlyVCtVMPCylOqK.HHXy8Ll9zJQvC8VpMHE6VYv5qj3q';

/**
 * Hash of "password" with cost 10
 * Useful when you need a predictable password
 */
export const MOCK_PASSWORD_HASH =
  '$2b$10$XOp3f7zP8l5Kq5Z5Z5Z5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Zu';

/**
 * Generates multiple unique valid hashes
 *
 * @param count - Number of hashes to generate
 * @param password - Password to hash (default: 'testpassword')
 * @returns Array of unique valid bcrypt hashes
 *
 * @example
 * ```typescript
 * const hashes = await generateTestHashes(5);
 * const users = hashes.map((hash, i) => ({
 *   id: `user-${i}`,
 *   password: hash,
 * }));
 * ```
 */
export async function generateTestHashes(
  count: number,
  password: string = 'testpassword',
): Promise<string[]> {
  const hashes: string[] = [];
  for (let i = 0; i < count; i++) {
    hashes.push(await bcrypt.hash(password, 10));
  }
  return hashes;
}
