import { Entity } from '../../shared/entity';

/**
 * Properties for Account entity (OAuth)
 */
export interface AccountProps {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

/**
 * Account entity represents OAuth connected account
 *
 * Simple entity for third-party OAuth providers.
 * No complex business logic.
 *
 * @example
 * ```typescript
 * const account = new Account({
 *   id: 'acc-123',
 *   userId: 'user-456',
 *   type: 'oauth',
 *   provider: 'google',
 *   providerAccountId: 'google-123',
 *   access_token: 'token',
 * });
 *
 * account.isExpired(); // checks expires_at
 * ```
 */
export class Account extends Entity<AccountProps> {
  constructor(props: AccountProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim() === '') {
      throw new Error('Account must have a valid userId');
    }
    if (!this.props.provider || this.props.provider.trim() === '') {
      throw new Error('Account must have a provider');
    }
    if (!this.props.providerAccountId || this.props.providerAccountId.trim() === '') {
      throw new Error('Account must have a providerAccountId');
    }
  }

  // ===== Getters =====
  get userId(): string {
    return this.props.userId;
  }

  get provider(): string {
    return this.props.provider;
  }

  get providerAccountId(): string {
    return this.props.providerAccountId;
  }

  get access_token(): string | undefined {
    return this.props.access_token;
  }

  get refresh_token(): string | undefined {
    return this.props.refresh_token;
  }

  get expires_at(): number | undefined {
    return this.props.expires_at;
  }

  // ===== Business Methods =====

  /**
   * Check if OAuth token is expired
   */
  isExpired(): boolean {
    if (!this.props.expires_at) {
      return false;
    }
    return Date.now() > this.props.expires_at * 1000;
  }

  /**
   * Check if account has refresh token
   */
  hasRefreshToken(): boolean {
    return !!this.props.refresh_token;
  }
}
