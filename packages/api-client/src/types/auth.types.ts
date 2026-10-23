/**
 * Authentication-related types and DTOs
 */

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  name: string;
  /** ODD 019: required by the backend while registration is invite-only. */
  inviteCode?: string;
}

export type RegistrationMode = 'invite-only' | 'open';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface SessionInfo {
  id: string;
  deviceName: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  os: string;
  browser?: string;
  ip: string;
  location?: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}
