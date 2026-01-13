import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UserResponse,
  LoginDto,
  RegisterDto,
} from "@ordo-todo/api-client";
import type {
  AuthContextType,
  AuthProviderProps,
  PlatformType,
  ApiClient,
} from "./types";

const AuthContext = createContext<AuthContextType | null>(null);

const QUERY_KEY_CURRENT_USER = "currentUser";

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  signInWithGoogle: async () => {},
  signInWithGitHub: async () => {},
};

export function AuthProvider({
  children,
  platform,
  onError,
  onSuccess,
  apiClient,
  onOAuthLogin,
}: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: currentUserData,
    isLoading: isLoadingUser,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY_CURRENT_USER],
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
      onSuccess?.("logout");
    },
    onError: (error) => {
      onError?.(error as Error);
    },
  });

  const isUnauthorized = (error as any)?.response?.status === 401;
  const user = isUnauthorized ? null : currentUserData || null;

  const login = async (data: LoginDto) => {
    try {
      await loginMutation.mutateAsync(data);
      onSuccess?.("login");

      if (platform === "web") {
        window.location.href = "/dashboard";
      } else if (platform === "mobile") {
        window.location.href = "/(internal)/dashboard";
      } else if (platform === "desktop") {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      await registerMutation.mutateAsync(data);
      onSuccess?.("register");

      if (platform === "web") {
        window.location.href = "/dashboard";
      } else if (platform === "mobile") {
        window.location.href = "/(internal)/dashboard";
      } else if (platform === "desktop") {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();

      if (platform === "web") {
        window.location.href = "/login";
      } else if (platform === "mobile") {
        window.location.href = "/(external)/auth";
      } else if (platform === "desktop") {
        window.location.href = "/login";
      }
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (onOAuthLogin) {
      try {
        await onOAuthLogin("google");
        onSuccess?.("login");
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    } else {
      console.warn("OAuth login not configured for this platform");
    }
  };

  const signInWithGitHub = async () => {
    if (onOAuthLogin) {
      try {
        await onOAuthLogin("github");
        onSuccess?.("login");
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    } else {
      console.warn("OAuth login not configured for this platform");
    }
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading: !mounted || isLoadingUser,
      isAuthenticated: !!user,
      error,
      login,
      register,
      logout,
      signInWithGoogle,
      signInWithGitHub,
    }),
    [user, mounted, isLoadingUser, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { defaultAuthContext };
