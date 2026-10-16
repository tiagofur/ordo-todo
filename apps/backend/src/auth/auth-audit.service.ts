import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthEventType } from './types/auth-event.types';
import { AuthAuditLogRepository } from '../repositories/auth-audit-log.repository';

export interface AuthAuditEvent {
  type: AuthEventType;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuthAuditService {
  private readonly logger = new Logger(AuthAuditService.name);

  constructor(
    private readonly configService: ConfigService,
    @Optional()
    @Inject('AuthAuditLogRepository')
    private readonly auditLogRepository?: AuthAuditLogRepository,
  ) {}

  async logEvent(event: AuthAuditEvent): Promise<void> {
    this.logger.log(
      `[AUTH_AUDIT] ${event.type} - User: ${event.userId ?? 'Anonymous'} - IP: ${event.ip ?? 'unknown'}`,
      {
        userId: event.userId,
        email: event.email,
        ip: event.ip,
        userAgent: event.userAgent,
        metadata: event.metadata,
      },
    );

    // Persist audit log in database if repository is available
    if (this.auditLogRepository) {
      try {
        await this.auditLogRepository.create({
          type: event.type as any, // AuthEventType enum mapping
          userId: event.userId,
          email: event.email,
          ip: event.ip,
          userAgent: event.userAgent,
          metadata: event.metadata,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to persist audit log: ${(error as Error).message}`,
        );
      }
    }
  }

  async loginSuccess(
    userId: string,
    email: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    await this.logEvent({
      type: AuthEventType.LOGIN_SUCCESS,
      userId,
      email,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  }

  async loginFailed(
    email: string,
    ip: string,
    userAgent: string,
    reason: string,
  ): Promise<void> {
    await this.logEvent({
      type: AuthEventType.LOGIN_FAILED,
      email,
      ip,
      userAgent,
      timestamp: new Date(),
      metadata: { reason },
    });
  }

  async registerSuccess(
    userId: string,
    email: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    await this.logEvent({
      type: AuthEventType.REGISTER_SUCCESS,
      userId,
      email,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  }

  async registerFailed(
    email: string,
    ip: string,
    userAgent: string,
    reason: string,
  ): Promise<void> {
    await this.logEvent({
      type: AuthEventType.REGISTER_FAILED,
      email,
      ip,
      userAgent,
      timestamp: new Date(),
      metadata: { reason },
    });
  }

  async logout(userId: string, ip: string, userAgent: string): Promise<void> {
    await this.logEvent({
      type: AuthEventType.LOGOUT,
      userId,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  }

  async refreshToken(userId: string, ip: string): Promise<void> {
    await this.logEvent({
      type: AuthEventType.REFRESH_TOKEN,
      userId,
      ip,
      timestamp: new Date(),
    });
  }

  async oauthSuccess(
    provider: string,
    userId: string,
    email: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    await this.logEvent({
      type: AuthEventType.OAUTH_SUCCESS,
      userId,
      email,
      ip,
      userAgent,
      timestamp: new Date(),
      metadata: { provider },
    });
  }

  async oauthFailed(
    provider: string,
    email: string | undefined,
    ip: string,
    userAgent: string,
    reason: string,
  ): Promise<void> {
    await this.logEvent({
      type: AuthEventType.OAUTH_FAILED,
      email,
      ip,
      userAgent,
      timestamp: new Date(),
      metadata: { provider, reason },
    });
  }

  async accountLocked(
    userId: string,
    email: string,
    ip: string,
    reason: string,
  ): Promise<void> {
    await this.logEvent({
      type: AuthEventType.ACCOUNT_LOCKED,
      userId,
      email,
      ip,
      timestamp: new Date(),
      metadata: { reason },
    });
  }
}
