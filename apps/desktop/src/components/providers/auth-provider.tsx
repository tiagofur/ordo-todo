import { createContext, useContext, ReactNode } from "react";
import { useCurrentUser, useLogin, useRegister, useLogout } from "@/hooks/api/use-auth";
import type { User, LoginDto, RegisterDto } from "@ordo-todo/api-client";
import { apiClient } from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: RegisterDto) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading, refetch } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = async (data: LoginDto) => {
    await loginMutation.mutateAsync(data);
    await refetch();
  };

  const signup = async (data: RegisterDto) => {
    await registerMutation.mutateAsync(data);
    await refetch();
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // OAuth functions for desktop app
  const signInWithGoogle = async () => {
    // For desktop, we'll open OAuth flow in system browser
    const oauthUrl = `${apiClient.getBaseUrl()}/auth/google`;

    // Open OAuth URL in default browser
    if (window.electronAPI) {
      await window.electronAPI.showNotification({
        title: "OAuth Authentication",
        body: "Opening Google authentication in your browser...",
        silent: false,
      });
    }

    // Open in browser (Electron shell.openExternal)
    window.open(oauthUrl, '_blank');

    // For now, this is a simplified version
    // In a full implementation, we would:
    // 1. Generate a state parameter for security
    // 2. Open OAuth flow
    // 3. Listen for callback via deep links or websockets
    // 4. Exchange auth code for tokens
    throw new Error("OAuth flow requires backend implementation. Please check console for OAuth URL.");
  };

  const signInWithGitHub = async () => {
    // Similar to Google OAuth
    const oauthUrl = `${apiClient.getBaseUrl()}/auth/github`;

    if (window.electronAPI) {
      await window.electronAPI.showNotification({
        title: "OAuth Authentication",
        body: "Opening GitHub authentication in your browser...",
        silent: false,
      });
    }

    window.open(oauthUrl, '_blank');
    throw new Error("OAuth flow requires backend implementation. Please check console for OAuth URL.");
  };

  return (
    <AuthContext.Provider
      value={{
        user: (user as any) || null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
        signInWithGoogle,
        signInWithGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
