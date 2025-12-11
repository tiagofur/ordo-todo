import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useCurrentUser, useLogin, useRegister, useLogout } from '../hooks/api';
import type { UserResponse, LoginDto, RegisterDto } from '@ordo-todo/api-client';
import { useRouter } from 'expo-router';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Auth Provider
 * Manages authentication state and provides auth methods
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, refetch } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  /**
   * Login handler
   */
  const login = async (data: LoginDto) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      console.log('[AuthContext] Login successful');

      // Refetch current user to update context
      await refetch();
    } catch (error: any) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    }
  };

  /**
   * Register handler
   */
  const register = async (data: RegisterDto) => {
    try {
      const response = await registerMutation.mutateAsync(data);
      console.log('[AuthContext] Registration successful');

      // Refetch current user to update context
      await refetch();
    } catch (error: any) {
      console.error('[AuthContext] Registration failed:', error);
      throw error;
    }
  };

  /**
   * Logout handler
   */
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      console.log('[AuthContext] Logout successful');

      // Navigate to auth screen
      router.replace('/screens/(external)/auth');
    } catch (error: any) {
      console.error('[AuthContext] Logout failed:', error);
      // Even if API call fails, clear local state
      router.replace('/screens/(external)/auth');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
