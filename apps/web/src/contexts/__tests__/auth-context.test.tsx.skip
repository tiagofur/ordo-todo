import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../auth-context';
import type { ReactNode } from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the API client
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
  setToken: vi.fn(),
  removeToken: vi.fn(),
}));

// Mock the API hooks
const mockUseCurrentUser = vi.fn();
const mockUseLogin = vi.fn();
const mockUseRegister = vi.fn();
const mockUseLogout = vi.fn();

vi.mock('../../lib/api-hooks', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
  useLogin: () => mockUseLogin(),
  useRegister: () => mockUseRegister(),
  useLogout: () => mockUseLogout(),
}));

describe('AuthContext', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();

    // Default mock implementations
    mockUseCurrentUser.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    mockUseLogin.mockReturnValue({
      mutateAsync: vi.fn(),
    });

    mockUseRegister.mockReturnValue({
      mutateAsync: vi.fn(),
    });

    mockUseLogout.mockReturnValue({
      mutateAsync: vi.fn(),
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth(), {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        });
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('returns null user when not authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('returns user data when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUseCurrentUser.mockReturnValue({
        data: mockUser,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('returns loading state while fetching user', () => {
      mockUseCurrentUser.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('provides login function', async () => {
      const mockLoginResponse = { accessToken: 'test-token' };
      const mockMutateAsync = vi.fn().mockResolvedValue(mockLoginResponse);
      
      mockUseLogin.mockReturnValue({
        mutateAsync: mockMutateAsync,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Note: login triggers window.location.href redirect
      // In tests, we can't fully test the redirect behavior
      expect(result.current.login).toBeDefined();
      expect(typeof result.current.login).toBe('function');
    });

    it('provides register function', () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({ accessToken: 'test-token' });
      
      mockUseRegister.mockReturnValue({
        mutateAsync: mockMutateAsync,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.register).toBeDefined();
      expect(typeof result.current.register).toBe('function');
    });

    it('provides logout function', () => {
      const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
      
      mockUseLogout.mockReturnValue({
        mutateAsync: mockMutateAsync,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.logout).toBeDefined();
      expect(typeof result.current.logout).toBe('function');
    });
  });

  describe('authentication state', () => {
    it('isAuthenticated is true when user exists', () => {
      mockUseCurrentUser.mockReturnValue({
        data: { id: 'user-123', email: 'test@example.com' },
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('isAuthenticated is false when user is null', () => {
      mockUseCurrentUser.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('passes error from useCurrentUser', () => {
      const error = new Error('Unauthorized');
      
      mockUseCurrentUser.mockReturnValue({
        data: null,
        isLoading: false,
        error,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.error).toBe(error);
    });
  });
});
