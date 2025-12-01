import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { LoginDto, RegisterDto } from '@ordo-todo/api-client';

/**
 * Hook for user login
 */
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDto) => apiClient.login(data),
    onSuccess: (response) => {
      console.log('[useLogin] Login successful');
    },
    onError: (error: any) => {
      console.error('[useLogin] Login failed:', error.message);
    },
  });
}

/**
 * Hook for user registration
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterDto) => apiClient.register(data),
    onSuccess: () => {
      console.log('[useRegister] Registration successful');
    },
    onError: (error: any) => {
      console.error('[useRegister] Registration failed:', error.message);
    },
  });
}

/**
 * Hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();
      console.log('[useLogout] Logout successful, cache cleared');
    },
    onError: (error: any) => {
      console.error('[useLogout] Logout failed:', error.message);
    },
  });
}

/**
 * Hook to get the current authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) =>
      apiClient.updateProfile(data),
    onSuccess: () => {
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      console.log('[useUpdateProfile] Profile updated successfully');
    },
    onError: (error: any) => {
      console.error('[useUpdateProfile] Update failed:', error.message);
    },
  });
}
