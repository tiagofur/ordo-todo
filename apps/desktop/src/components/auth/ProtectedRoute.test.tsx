import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { sharedApiClient } from '@/lib/shared-api-client';
import { AuthProvider } from '@ordo-todo/auth-provider';

function unauthorized(url: string) {
  return {
    response: { status: 401, data: { message: 'Unauthorized' } },
    config: { url, headers: {} },
    isAxiosError: true,
  };
}

describe('ProtectedRoute with expired tokens', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('auth_token', 'expired-access');
    localStorage.setItem('refresh_token', 'expired-refresh');
    // Fake transport, real interceptors: every request 401s (access and
    // refresh tokens are both dead).
    (apiClient as any).axios.defaults.adapter = async (config: any) => {
      // Re-throw with the REAL request config (headers included), like
      // axios would: the 401 handler branches on the auth header.
      throw { ...unauthorized(config.url || ''), config };
    };
  });

  it('leaves the Loading spinner for the login page instead of spinning forever', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider
          platform="desktop"
          apiClient={sharedApiClient}
          queryClient={queryClient}
        >
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<div>Dashboard</div>} />
              </Route>
              <Route path="/auth" element={<div>Login page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText('Login page')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('reaches login even when the native token storage hangs', { timeout: 15000 }, async () => {
    // Production suspect: a hanging Tauri store must not hang teardown.
    const storage = (apiClient as any).tokenStorage;
    const hanging = () => new Promise<void>(() => {});
    storage.removeToken = hanging;
    storage.removeRefreshToken = hanging;
    try {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider
            platform="desktop"
            apiClient={sharedApiClient}
            queryClient={queryClient}
          >
            <MemoryRouter initialEntries={['/dashboard']}>
              <Routes>
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<div>Dashboard</div>} />
                </Route>
                <Route path="/auth" element={<div>Login page</div>} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>,
      );

      await waitFor(
        () => {
          expect(screen.getByText('Login page')).toBeInTheDocument();
        },
        { timeout: 12000 },
      );
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    } finally {
      delete storage.removeToken;
      delete storage.removeRefreshToken;
    }
  });
});
