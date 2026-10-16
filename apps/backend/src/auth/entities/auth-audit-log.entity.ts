import { Entity, EntityProps } from '@ordo-todo/core';
import { AuthEventType } from '../types/auth-event.types';

export interface AuthAuditLogProps extends EntityProps<string> {
  type: AuthEventType;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class AuthAuditLog extends Entity<AuthAuditLogProps> {
  constructor(props: AuthAuditLogProps, mode: 'draft' | 'valid' = 'valid') {
    super(props, mode);
  }

  get type(): AuthEventType {
    return this.props.type;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get ip(): string | undefined {
    return this.props.ip;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }
}
