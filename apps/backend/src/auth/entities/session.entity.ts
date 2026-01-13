/**
 * Session Entity
 * 
 * Represents a user session on a specific device.
 * Used for multi-device session management.
 */

export interface SessionProps {
    id: string;
    userId: string;
    deviceName: string;
    deviceType: 'web' | 'mobile' | 'desktop';
    os: string;
    browser?: string;
    ip: string;
    location?: string;
    refreshToken: string;
    lastActive: Date;
    createdAt: Date;
    expiresAt: Date;
    isRevoked: boolean;
}

export class Session {
    private _props: SessionProps;

    constructor(props: SessionProps) {
        this._props = { ...props };
    }

    get id(): string {
        return this._props.id;
    }

    get userId(): string {
        return this._props.userId;
    }

    get deviceName(): string {
        return this._props.deviceName;
    }

    get deviceType(): 'web' | 'mobile' | 'desktop' {
        return this._props.deviceType;
    }

    get os(): string {
        return this._props.os;
    }

    get browser(): string | undefined {
        return this._props.browser;
    }

    get ip(): string {
        return this._props.ip;
    }

    get location(): string | undefined {
        return this._props.location;
    }

    get refreshToken(): string {
        return this._props.refreshToken;
    }

    get lastActive(): Date {
        return this._props.lastActive;
    }

    get createdAt(): Date {
        return this._props.createdAt;
    }

    get expiresAt(): Date {
        return this._props.expiresAt;
    }

    get isRevoked(): boolean {
        return this._props.isRevoked;
    }

    get isExpired(): boolean {
        return new Date() > this._props.expiresAt;
    }

    get isActive(): boolean {
        return !this._props.isRevoked && !this.isExpired;
    }

    updateLastActive(): void {
        this._props.lastActive = new Date();
    }

    revoke(): void {
        this._props.isRevoked = true;
    }

    toJSON(): Omit<SessionProps, 'refreshToken'> {
        return {
            id: this._props.id,
            userId: this._props.userId,
            deviceName: this._props.deviceName,
            deviceType: this._props.deviceType,
            os: this._props.os,
            browser: this._props.browser,
            ip: this._props.ip,
            location: this._props.location,
            lastActive: this._props.lastActive,
            createdAt: this._props.createdAt,
            expiresAt: this._props.expiresAt,
            isRevoked: this._props.isRevoked,
        };
    }
}

