import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { TokenBlacklistService } from './token-blacklist.service';

/**
 * Session information for display to users
 */
export interface SessionInfo {
    id: string;
    deviceName: string;
    deviceType: 'web' | 'mobile' | 'desktop';
    os: string;
    browser?: string;
    ip: string;
    location?: string;
    lastActive: Date;
    createdAt: Date;
    isCurrent: boolean;
}

/**
 * Internal session storage structure
 */
interface StoredSession {
    id: string;
    userId: string;
    deviceName: string;
    deviceType: 'web' | 'mobile' | 'desktop';
    os: string;
    browser?: string;
    ip: string;
    location?: string;
    refreshTokenHash: string;
    lastActive: Date;
    createdAt: Date;
    expiresAt: Date;
    isRevoked: boolean;
}

/**
 * Sessions Service
 * 
 * Manages user sessions across multiple devices.
 * Allows users to view and revoke sessions for enhanced security.
 * 
 * @see {@link https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing | OWASP Session Management}
 */
@Injectable()
export class SessionsService {
    private readonly logger = new Logger(SessionsService.name);

    // In-memory session storage (TODO: Move to Redis or database for production)
    private readonly sessions: Map<string, StoredSession> = new Map();

    // Index for fast lookup by userId
    private readonly userSessions: Map<string, Set<string>> = new Map();

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService,
    ) { }

    /**
     * Create a new session for a user
     */
    async createSession(params: {
        userId: string;
        refreshToken: string;
        deviceInfo: {
            deviceName: string;
            deviceType: 'web' | 'mobile' | 'desktop';
            os: string;
            browser?: string;
        };
        ip: string;
        location?: string;
    }): Promise<string> {
        const sessionId = crypto.randomUUID();
        const refreshTokenHash = this.hashToken(params.refreshToken);

        const session: StoredSession = {
            id: sessionId,
            userId: params.userId,
            deviceName: params.deviceInfo.deviceName,
            deviceType: params.deviceInfo.deviceType,
            os: params.deviceInfo.os,
            browser: params.deviceInfo.browser,
            ip: params.ip,
            location: params.location,
            refreshTokenHash,
            lastActive: new Date(),
            createdAt: new Date(),
            expiresAt: this.calculateExpiryDate(),
            isRevoked: false,
        };

        // Store session
        this.sessions.set(sessionId, session);

        // Add to user index
        if (!this.userSessions.has(params.userId)) {
            this.userSessions.set(params.userId, new Set());
        }
        this.userSessions.get(params.userId)!.add(sessionId);

        this.logger.log(`Session created: ${sessionId} for user ${params.userId} on ${params.deviceInfo.deviceName}`);

        return sessionId;
    }

    /**
     * Get all active sessions for a user
     */
    async getUserSessions(userId: string, currentRefreshToken?: string): Promise<SessionInfo[]> {
        const sessionIds = this.userSessions.get(userId);

        if (!sessionIds || sessionIds.size === 0) {
            return [];
        }

        const currentTokenHash = currentRefreshToken
            ? this.hashToken(currentRefreshToken)
            : null;

        const sessions: SessionInfo[] = [];

        for (const sessionId of sessionIds) {
            const session = this.sessions.get(sessionId);

            if (!session || session.isRevoked || this.isExpired(session)) {
                continue;
            }

            sessions.push({
                id: session.id,
                deviceName: session.deviceName,
                deviceType: session.deviceType,
                os: session.os,
                browser: session.browser,
                ip: this.maskIp(session.ip),
                location: session.location,
                lastActive: session.lastActive,
                createdAt: session.createdAt,
                isCurrent: currentTokenHash === session.refreshTokenHash,
            });
        }

        // Sort by lastActive (most recent first)
        sessions.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());

        return sessions;
    }

    /**
     * Get session by ID
     */
    async getSession(sessionId: string): Promise<StoredSession | null> {
        return this.sessions.get(sessionId) || null;
    }

    /**
     * Update session's last active timestamp
     */
    async updateSessionActivity(refreshToken: string): Promise<void> {
        const tokenHash = this.hashToken(refreshToken);

        for (const session of this.sessions.values()) {
            if (session.refreshTokenHash === tokenHash && !session.isRevoked) {
                session.lastActive = new Date();
                this.logger.debug(`Session ${session.id} activity updated`);
                return;
            }
        }
    }

    /**
     * Revoke a specific session
     */
    async revokeSession(userId: string, sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        if (session.userId !== userId) {
            throw new NotFoundException('Session not found');
        }

        session.isRevoked = true;

        this.logger.log(`Session ${sessionId} revoked by user ${userId}`);
    }

    /**
     * Revoke all sessions except the current one
     */
    async revokeAllOtherSessions(userId: string, currentRefreshToken: string): Promise<number> {
        const sessionIds = this.userSessions.get(userId);

        if (!sessionIds || sessionIds.size === 0) {
            return 0;
        }

        const currentTokenHash = this.hashToken(currentRefreshToken);
        let revokedCount = 0;

        for (const sessionId of sessionIds) {
            const session = this.sessions.get(sessionId);

            if (!session || session.isRevoked) {
                continue;
            }

            // Skip current session
            if (session.refreshTokenHash === currentTokenHash) {
                continue;
            }

            session.isRevoked = true;
            revokedCount++;
        }

        this.logger.log(`${revokedCount} sessions revoked for user ${userId}`);

        return revokedCount;
    }

    /**
     * Revoke ALL sessions for a user (including current)
     * Used when password is changed or account is compromised
     */
    async revokeAllSessions(userId: string): Promise<number> {
        const sessionIds = this.userSessions.get(userId);

        if (!sessionIds || sessionIds.size === 0) {
            return 0;
        }

        let revokedCount = 0;

        for (const sessionId of sessionIds) {
            const session = this.sessions.get(sessionId);

            if (!session || session.isRevoked) {
                continue;
            }

            session.isRevoked = true;
            revokedCount++;
        }

        this.logger.log(`All ${revokedCount} sessions revoked for user ${userId}`);

        return revokedCount;
    }

    /**
     * Check if a refresh token belongs to a valid session
     */
    async isValidSession(refreshToken: string): Promise<boolean> {
        const tokenHash = this.hashToken(refreshToken);

        for (const session of this.sessions.values()) {
            if (session.refreshTokenHash === tokenHash) {
                return !session.isRevoked && !this.isExpired(session);
            }
        }

        return false;
    }

    /**
     * Get session count for a user
     */
    async getSessionCount(userId: string): Promise<number> {
        const sessionIds = this.userSessions.get(userId);

        if (!sessionIds) {
            return 0;
        }

        let count = 0;
        for (const sessionId of sessionIds) {
            const session = this.sessions.get(sessionId);
            if (session && !session.isRevoked && !this.isExpired(session)) {
                count++;
            }
        }

        return count;
    }

    /**
     * Clean up expired and revoked sessions
     * Should be called periodically by a scheduler
     */
    async cleanupExpiredSessions(): Promise<number> {
        let cleanedCount = 0;
        const now = new Date();

        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.isRevoked || this.isExpired(session)) {
                this.sessions.delete(sessionId);

                const userSessionIds = this.userSessions.get(session.userId);
                if (userSessionIds) {
                    userSessionIds.delete(sessionId);
                    if (userSessionIds.size === 0) {
                        this.userSessions.delete(session.userId);
                    }
                }

                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            this.logger.log(`Cleaned up ${cleanedCount} expired/revoked sessions`);
        }

        return cleanedCount;
    }

    /**
     * Hash a token for secure storage
     */
    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Check if a session is expired
     */
    private isExpired(session: StoredSession): boolean {
        return new Date() > session.expiresAt;
    }

    /**
     * Calculate session expiry date based on refresh token expiry
     */
    private calculateExpiryDate(): Date {
        const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
        const days = parseInt(refreshExpiry.replace('d', ''), 10) || 7;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        return expiryDate;
    }

    /**
     * Mask IP address for privacy (show only first two octets)
     */
    private maskIp(ip: string): string {
        if (ip === 'unknown') return ip;

        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.*.*`;
        }

        // IPv6 or other format
        return ip.substring(0, Math.min(ip.length, 10)) + '...';
    }
}
