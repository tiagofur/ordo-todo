"use client";

import { useAuth } from "@ordo-todo/auth-provider";

export interface UseIsAdminResult {
  isAdmin: boolean;
  isLoading: boolean;
}

/**
 * Platform-admin flag (ODD 019 T6). `GET /users/me` returns `isAdmin` for the
 * platform admin; everyone else gets false/undefined. Gates both the admin
 * panel layout and the sidebar link.
 */
export function useIsAdmin(): UseIsAdminResult {
  const { user, isLoading } = useAuth();
  const isAdmin = Boolean((user as { isAdmin?: boolean } | null)?.isAdmin);
  return { isAdmin, isLoading };
}
