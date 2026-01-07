import { Entity } from '../../shared/entity';

/**
 * Properties for Session entity
 */
export interface SessionProps {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

/**
 * Session entity represents user authentication session
 *
 * Simple entity for session management.
 * No complex business logic.
 *
 * @example
 * ```typescript
 * const session = new Session({
 *   id: 'sess-123',
 *   sessionToken: 'token-xyz',
 *   userId: 'user-456',
 *   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
 * });
 *
 * session.isExpired(); // false
 * session.getDaysUntilExpiry(); // 7
 * ```
 */
export class Session extends Entity<SessionProps> {
  constructor(props: SessionProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  private validate(): void {
    if (!this.props.sessionToken || this.props.sessionToken.trim() === '') {
      throw new Error('Session must have a valid sessionToken');
    }
    if (!this.props.userId || this.props.userId.trim() === '') {
      throw new Error('Session must have a valid userId');
    }
    if (!this.props.expires) {
      throw new Error('Session must have an expiry date');
    }
  }

  // ===== Getters =====
  get sessionToken(): string {
    return this.props.sessionToken;
  }

  get userId(): string {
    return this.props.userId;
  }

  get expires(): Date {
    return this.props.expires;
  }

  // ===== Business Methods =====

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return new Date() > this.props.expires;
  }

  /**
   * Check if session is valid (not expired)
   */
  isValid(): boolean {
    return !this.isExpired();
  }

  /**
   * Get days until expiry
   */
  getDaysUntilExpiry(): number {
    const now = new Date();
    const diffMs = this.props.expires.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
