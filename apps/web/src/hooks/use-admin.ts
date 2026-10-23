"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  AdminOverview,
  AdminUserDetail,
  AdminUsersPage,
  CreateAdminInviteCodeDto,
  GetAdminUsersParams,
  GrantProDto,
} from "@/lib/api-client";

/** Query keys for every admin surface, all rooted under ["admin", ...]. */
export const adminKeys = {
  overview: ["admin", "overview"] as const,
  users: (params: GetAdminUsersParams) => ["admin", "users", params] as const,
  user: (userId: string) => ["admin", "user", userId] as const,
  inviteCodes: ["admin", "invite-codes"] as const,
};

export function useAdminOverview() {
  return useQuery<AdminOverview>({
    queryKey: adminKeys.overview,
    queryFn: () => apiClient.getAdminOverview(),
  });
}

export function useAdminUsers(params: GetAdminUsersParams) {
  return useQuery<AdminUsersPage>({
    queryKey: adminKeys.users(params),
    queryFn: () => apiClient.getAdminUsers(params),
  });
}

export function useAdminUser(userId: string | null | undefined) {
  return useQuery<AdminUserDetail>({
    queryKey: adminKeys.user(userId ?? ""),
    queryFn: () => apiClient.getAdminUser(userId as string),
    enabled: Boolean(userId),
  });
}

function useInvalidateAdminUserQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    queryClient.invalidateQueries({ queryKey: adminKeys.overview });
  };
}

export function useBlockUser() {
  const invalidate = useInvalidateAdminUserQueries();
  return useMutation({
    mutationFn: (userId: string) => apiClient.blockAdminUser(userId),
    onSuccess: () => invalidate(),
  });
}

export function useUnblockUser() {
  const invalidate = useInvalidateAdminUserQueries();
  return useMutation({
    mutationFn: (userId: string) => apiClient.unblockAdminUser(userId),
    onSuccess: () => invalidate(),
  });
}

export function useGrantPro() {
  const invalidate = useInvalidateAdminUserQueries();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data?: GrantProDto;
    }) => apiClient.grantAdminPro(userId, data),
    onSuccess: () => invalidate(),
  });
}

export function useRevokePro() {
  const invalidate = useInvalidateAdminUserQueries();
  return useMutation({
    mutationFn: (userId: string) => apiClient.revokeAdminPro(userId),
    onSuccess: () => invalidate(),
  });
}

export function useInviteCodes() {
  return useQuery({
    queryKey: adminKeys.inviteCodes,
    queryFn: () => apiClient.getAdminInviteCodes(),
  });
}

export function useCreateInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdminInviteCodeDto) =>
      apiClient.createAdminInviteCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.inviteCodes });
    },
  });
}

export function useDeactivateInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (codeId: string) => apiClient.deactivateAdminInviteCode(codeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.inviteCodes });
    },
  });
}
