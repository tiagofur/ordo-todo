import { User, UserProps } from "../model/user.entity";

/**
 * Properties required to create a new user (including OAuth users).
 *
 * Used for both email/password registration and OAuth provider authentication.
 */
export interface CreateUserProps {
  /** The user's full name or display name */
  name: string;
  /** The user's email address (must be unique) */
  email: string;
  /** The user's unique username (must be unique) */
  username: string;
  /** Optional profile image URL */
  image?: string | null;
  /** OAuth provider name (e.g., 'google', 'github') */
  provider?: string;
  /** Unique user ID from the OAuth provider */
  providerId?: string;
}

/**
 * Repository interface for User entity.
 *
 * Provides data access methods for user persistence, authentication,
 * and OAuth account management.
 *
 * @example
 * ```typescript
 * class PrismaUserRepository implements UserRepository {
 *   async save(user: User): Promise<void> {
 *     await prisma.user.create({ data: user.toJSON() });
 *   }
 *   // ... other methods
 * }
 * ```
 */
export default interface UserRepository {
  /**
   * Saves a new user to the database.
   *
   * @param user - The user entity to save
   * @returns Promise that resolves when the user is saved
   * @throws {Error} If the user already exists or database operation fails
   *
   * @example
   * ```typescript
   * const user = new User({
   *   email: 'user@example.com',
   *   username: 'johndoe',
   *   name: 'John Doe'
   * });
   * await repository.save(user);
   * ```
   */
  save(user: User): Promise<void>;

  /**
   * Updates specific properties of an existing user.
   *
   * Allows partial updates without replacing the entire user entity.
   *
   * @param user - The user entity to update
   * @param props - Partial properties to update (email, name, username, etc.)
   * @returns Promise that resolves when the user is updated
   * @throws {Error} If the user doesn't exist or validation fails
   *
   * @example
   * ```typescript
   * await repository.updateProps(user, {
   *   name: 'John Smith',
   *   jobTitle: 'Senior Developer'
   * });
   * ```
   */
  updateProps(user: User, props: Partial<UserProps>): Promise<void>;

  /**
   * Finds a user by their email address.
   *
   * Used primarily for authentication (login) purposes.
   *
   * @param email - The email address to search for
   * @param withPassword - Whether to include the password hash in the result
   * @returns Promise that resolves to the user if found, null otherwise
   *
   * @example
   * ```typescript
   * // For authentication (include password)
   * const user = await repository.findByEmail('user@example.com', true);
   * if (user && (await bcrypt.compare(password, user.password))) {
   *   // Authentication successful
   * }
   *
   * // For general queries (exclude password)
   * const user = await repository.findByEmail('user@example.com');
   * ```
   */
  findByEmail(email: string, withPassword?: boolean): Promise<User | null>;

  /**
   * Finds a user by their username.
   *
   * Used for profile lookup and @mention functionality.
   *
   * @param username - The username to search for
   * @returns Promise that resolves to the user if found, null otherwise
   *
   * @example
   * ```typescript
   * const user = await repository.findByUsername('johndoe');
   * if (user) {
   *   console.log(user.name);
   * }
   * ```
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Finds a user by their unique ID.
   *
   * @param id - The unique identifier of the user
   * @returns Promise that resolves to the user if found, null otherwise
   *
   * @example
   * ```typescript
   * const user = await repository.findById('user-123');
   * if (user) {
   *   console.log(user.email);
   * }
   * ```
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by their OAuth provider information.
   *
   * Used for OAuth authentication flows to check if a user has
   * previously linked their account with a specific provider.
   *
   * @param provider - The OAuth provider name (e.g., 'google', 'github')
   * @param providerId - The unique user ID from the OAuth provider
   * @returns Promise that resolves to the user if found, null otherwise
   *
   * @example
   * ```typescript
   * // Google OAuth login
   * const user = await repository.findByProvider('google', 'google-user-id-123');
   * if (user) {
   *   // User exists, log them in
   * } else {
   *   // Create new user account
   * }
   * ```
   */
  findByProvider(provider: string, providerId: string): Promise<User | null>;

  /**
   * Links an OAuth account to an existing user.
   *
   * Allows users to sign in with multiple providers (e.g., Google + GitHub).
   *
   * @param userId - The unique identifier of the user
   * @param provider - The OAuth provider name (e.g., 'google', 'github')
   * @param providerId - The unique user ID from the OAuth provider
   * @returns Promise that resolves to the updated user
   *
   * @example
   * ```typescript
   * // User already has Google account, now adding GitHub
   * const updated = await repository.linkOAuthAccount(
   *   'user-123',
   *   'github',
   *   'github-user-id-456'
   * );
   * ```
   */
  linkOAuthAccount(
    userId: string,
    provider: string,
    providerId: string,
  ): Promise<User>;

  /**
   * Creates a new user account.
   *
   * Used for both email/password registration and OAuth authentication.
   *
   * @param props - The user properties (email, username, name, OAuth info)
   * @returns Promise that resolves to the created user entity
   * @throws {Error} If email/username already exists or validation fails
   *
   * @example
   * ```typescript
   * // Email/password registration
   * const user = await repository.create({
   *   email: 'user@example.com',
   *   username: 'johndoe',
   *   name: 'John Doe'
   * });
   *
   * // OAuth registration
   * const user = await repository.create({
   *   email: 'user@gmail.com',
   *   username: 'johndoe',
   *   name: 'John Doe',
   *   provider: 'google',
   *   providerId: 'google-123',
   *   image: 'https://google.com/photo.jpg'
   * });
   * ```
   */
  create(props: CreateUserProps): Promise<User>;

  /**
   * Updates a user's XP (experience points) and level.
   *
   * Used for gamification features where users earn XP through
   * completing tasks, pomodoros, achievements, etc.
   *
   * @param userId - The user ID to update
   * @param xp - The new XP value
   * @param level - The new level value
   * @returns Promise that resolves when the user is updated
   * @throws {Error} If the user doesn't exist
   *
   * @example
   * ```typescript
   * await repository.updateXpAndLevel('user-123', 500, 3);
   * console.log('User leveled up to 3!');
   * ```
   */
  updateXpAndLevel(
    userId: string,
    xp: number,
    level: number,
  ): Promise<void>;

  /**
   * Deletes a user account and all associated data.
   *
   * @param id - The unique identifier of the user to delete
   * @returns Promise that resolves when the user is deleted
   * @throws {Error} If the user doesn't exist or database operation fails
   */
  delete(id: string): Promise<void>;
}
