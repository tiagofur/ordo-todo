/**
 * Auth Context
 *
 * Manages user authentication state using JWT tokens.
 * Replaces NextAuth with direct API client authentication.
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, setToken, removeToken, setRefreshToken, removeRefreshToken } from '@/lib/api-client';
import { queryKeys } from '@/lib/api-hooks';
import type { UserResponse, LoginDto, RegisterDto } from '@ordo-todo/api-client';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: unknown;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
}

// Default context for SSR or when not mounted
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * SSR-safe Auth Provider
 * 
 * Provides a default context during SSR so that `useAuth` can be called
 * without throwing. All auth state is "loading" during SSR.
 */
export function SSRAuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={defaultAuthContext}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Full Auth Provider with React Query hooks
 * 
 * This provider checks if it's running on the client and only enables
 * React Query hooks after the component mounts.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  // Mount check - hooks below use `enabled: mounted` to prevent SSR execution
  useEffect(() => {
    setMounted(true);
  }, []);

  // Query hooks - disabled during SSR with enabled: mounted
  const { data: currentUserData, isLoading: isLoadingUser, error } = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    enabled: mounted,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => apiClient.login(data),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => apiClient.register(data),
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  // Handle 401 errors specifically
  const isUnauthorized = (error as any)?.response?.status === 401;
  const user = isUnauthorized ? null : (currentUserData || null);

  // Redirect to login if not authenticated and error is 401
  useEffect(() => {
    if (mounted && isUnauthorized) {
      // Only redirect if we're not already on an auth page
      if (typeof window !== 'undefined' && !['/login', '/register'].some(path => window.location.pathname.startsWith(path))) {
        removeToken();
        removeRefreshToken();
        router.push('/login');
      }
    }
  }, [isUnauthorized, mounted, router]);

  const login = async (data: LoginDto) => {
    const response = await loginMutation.mutateAsync(data);
    
    if (response.accessToken) {
      setToken(response.accessToken);
    }
    if (response.refreshToken) {
      setRefreshToken(response.refreshToken);
    }

    // Force refetch current user
    window.location.href = '/dashboard';
  };

  const register = async (data: RegisterDto) => {
    const response = await registerMutation.mutateAsync(data);
    
    if (response.accessToken) {
      setToken(response.accessToken);
    }
    if (response.refreshToken) {
      setRefreshToken(response.refreshToken);
    }

    window.location.href = '/dashboard';
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    removeToken();
    removeRefreshToken();

    // Redirect to signin
    window.location.href = '/login';
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    isLoading: !mounted || isLoadingUser,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
  }), [user, mounted, isLoadingUser, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
