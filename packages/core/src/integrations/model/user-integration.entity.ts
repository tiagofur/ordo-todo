import { Entity } from '../../shared/entity';
import { IntegrationProvider } from './integration-provider.enum';

// Re-export IntegrationProvider for convenience
export { IntegrationProvider };

/**
 * Properties for UserIntegration entity
 */
export interface UserIntegrationProps {
  id: string;
  userId: string;
  provider: IntegrationProvider;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  providerUserId?: string;
  providerEmail?: string;
  settings?: Record<string, unknown>;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UserIntegration entity represents third-party service integrations
 *
 * Handles connections to Google, Slack, GitHub, etc.
 * Manages OAuth tokens and sync status.
 *
 * @example
 * ```typescript
 * const integration = new UserIntegration({
 *   id: 'int-123',
 *   userId: 'user-456',
 *   provider: IntegrationProvider.GOOGLE_CALENDAR,
 *   accessToken: 'xyz',
 *   isActive: true,
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 *
 * integration.needsSync(); // true if last sync > 1 hour ago
 * integration.isExpired(); // checks token expiry
 * ```
 */
export class UserIntegration extends Entity<UserIntegrationProps> {
  constructor(props: UserIntegrationProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim() === '') {
      throw new Error('UserIntegration must have a valid userId');
    }
    if (!this.props.provider) {
      throw new Error('UserIntegration must have a provider');
    }
  }

  // ===== Getters =====
  get userId(): string {
    return this.props.userId;
  }

  get provider(): IntegrationProvider {
    return this.props.provider;
  }

  get accessToken(): string | undefined {
    return this.props.accessToken;
  }

  get refreshToken(): string | undefined {
    return this.props.refreshToken;
  }

  get expiresAt(): Date | undefined {
    return this.props.expiresAt;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastSyncAt(): Date | undefined {
    return this.props.lastSyncAt;
  }

  get settings(): Record<string, unknown> | undefined {
    return this.props.settings;
  }

  // ===== Business Methods =====

  /**
   * Check if integration is active and connected
   */
  isConnected(): boolean {
    return this.props.isActive && !!this.props.accessToken;
  }

  /**
   * Check if access token is expired
   */
  isExpired(): boolean {
    if (!this.props.expiresAt) {
      return false; // No expiry set
    }
    return new Date() > this.props.expiresAt;
  }

  /**
   * Check if token will expire soon (within 1 hour)
   */
  willExpireSoon(): boolean {
    if (!this.props.expiresAt) {
      return false;
    }
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    return this.props.expiresAt < oneHourFromNow;
  }

  /**
   * Check if integration needs sync (no sync in last hour)
   */
  needsSync(): boolean {
    if (!this.props.lastSyncAt) {
      return true; // Never synced
    }

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    return this.props.lastSyncAt < oneHourAgo;
  }

  /**
   * Check if sync is recent (within last hour)
   */
  hasRecentSync(): boolean {
    return !this.needsSync();
  }

  /**
   * Get time since last sync in minutes
   */
  getMinutesSinceLastSync(): number | null {
    if (!this.props.lastSyncAt) {
      return null;
    }

    const now = new Date();
    const diffMs = now.getTime() - this.props.lastSyncAt.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Update sync timestamp
   */
  markAsSynced(): UserIntegration {
    return this.clone({
      lastSyncAt: new Date(),
    });
  }

  /**
   * Deactivate integration
   */
  deactivate(): UserIntegration {
    return this.clone({
      isActive: false,
    });
  }

  /**
   * Activate integration
   */
  activate(): UserIntegration {
    return this.clone({
      isActive: true,
    });
  }

  /**
   * Update settings
   */
  updateSettings(settings: Record<string, unknown>): UserIntegration {
    return this.clone({
      settings: { ...this.props.settings, ...settings },
    });
  }

  /**
   * Get a specific setting value
   */
  getSetting<K extends keyof Record<string, unknown>>(
    key: K
  ): Record<string, unknown>[K] | undefined {
    return this.props.settings?.[key];
  }
}
