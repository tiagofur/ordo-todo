/**
 * Auth Context
 *
 * Manages user authentication state using JWT tokens.
 * Replaces NextAuth with direct API client authentication.
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, setToken, removeToken, setRefreshToken, removeRefreshToken } from '@/lib/api-client';
import { useCurrentUser, useLogin, useRegister, useLogout } from '@/lib/api-hooks';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  // Query hooks
  const { data: currentUserData, isLoading: isLoadingUser, error } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Extract user from response
  const user = currentUserData || null;

  // Handle authentication initialization
  useEffect(() => {
    setIsInitializing(false);
  }, []);

  // Redirect to login if not authenticated and error is 401
  useEffect(() => {
    if (!isInitializing && error && !user) {
      // Only redirect if we're not already on an auth page
      if (typeof window !== 'undefined' && !['/login', '/register'].some(path => window.location.pathname.startsWith(path))) {
        router.push('/login');
      }
    }
  }, [error, user, isInitializing, router]);

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

  const value: AuthContextType = {
    user,
    isLoading: isInitializing || isLoadingUser,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
