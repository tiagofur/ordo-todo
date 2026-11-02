/**
 * Admin panel DTOs and response shapes.
 * Aggregated/identifying data only, never task content.
 */

export interface AdminOverview {
  users: {
    total: number;
    newLast7Days: number;
    newLast30Days: number;
    activeLast30Days: number;
  };
  tasks: {
    total: number;
    completed: number;
  };
  workspaces: {
    total: number;
  };
  planDistribution: Record<string, number>;
  generatedAt: string;
}

export type AdminUserStatus = 'ACTIVE' | 'BLOCKED';
export type AdminUserPlan = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';

export interface AdminUserListItem {
  id: string;
  email: string;
  username: string;
  name: string;
  status: AdminUserStatus;
  blockedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  plan: AdminUserPlan;
}

export interface AdminUsersPage {
  total: number;
  page: number;
  limit: number;
  users: AdminUserListItem[];
}

export interface AdminUserDetail {
  id: string;
  email: string;
  username: string;
  name: string;
  status: AdminUserStatus;
  blockedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  locale: string;
  timezone: string;
  plan: AdminUserPlan;
  inviteCode: string | null;
  invitedAt: string | null;
  counts: {
    tasks: number;
    workspaces: number;
  };
}

export interface AdminUserStatusResult {
  id: string;
  status: AdminUserStatus;
}

export interface AdminProResult {
  id: string;
  plan: AdminUserPlan;
  expiresAt: string | null;
}

export interface AdminInviteCode {
  id: string;
  code: string;
  label: string | null;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  redemptions: number;
}

export interface CreateAdminInviteCodeDto {
  label?: string;
  maxUses?: number;
  expiresAt?: string;
}

export interface GetAdminUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GrantProDto {
  days?: number | null;
}
