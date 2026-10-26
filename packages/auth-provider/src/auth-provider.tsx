import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type {
  UserResponse,
  LoginDto,
  RegisterDto,
} from "@ordo-todo/api-client";
import type {
  AuthContextType,
  AuthProviderProps,
  AuthRedirectOpts,
  PlatformType,
  ApiClient,
} from "./types.js";

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
  onRedirect,
  queryClient: propQueryClient,
}: AuthProviderProps) {
  // Tras login/registro/logout. Por defecto, redirección dura por plataforma
  // (legado de Expo/web); un SPA con router propio pasa `onRedirect`.
  // `redirectTo` (URL absoluta ya validada por el llamante, p. ej. el
  // `next` de un flujo OAuth) gana sobre ambos.
  const redirectAfterAuth = (kind: "dashboard" | "auth", redirectTo?: string) => {
    if (redirectTo) {
      window.location.href = redirectTo;
      return;
    }
    if (onRedirect) {
      onRedirect(kind === "dashboard" ? "/dashboard" : "/auth");
      return;
    }
    if (kind === "dashboard") {
      window.location.href = "/dashboard";
    } else if (platform === "mobile") {
      window.location.href = "/(external)/auth";
    } else {
      window.location.href = "/login";
    }
  };

  let contextQueryClient: QueryClient | undefined;
  try {
    contextQueryClient = useQueryClient();
  } catch {
    // Graceful fallback if context is isolated or during SSR
  }
  const queryClient = propQueryClient || contextQueryClient;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: currentUserData,
    isLoading: isLoadingUser,
    error,
  } = useQuery(
    {
      queryKey: [QUERY_KEY_CURRENT_USER],
      queryFn: () => apiClient.getCurrentUser(),
      retry: false,
      enabled: mounted,
    },
    queryClient,
  );

  const loginMutation = useMutation(
    {
      mutationFn: (data: LoginDto) => apiClient.login(data),
    },
    queryClient,
  );

  const registerMutation = useMutation(
    {
      mutationFn: (data: RegisterDto) => apiClient.register(data),
    },
    queryClient,
  );

  const logoutMutation = useMutation(
    {
      mutationFn: () => apiClient.logout(),
      onSuccess: () => {
        queryClient?.clear();
        onSuccess?.("logout");
      },
      onError: (error) => {
        onError?.(error as Error);
      },
    },
    queryClient,
  );

  const isUnauthorized = (error as any)?.response?.status === 401;
  const user = isUnauthorized ? null : currentUserData || null;

  const login = async (data: LoginDto, opts?: AuthRedirectOpts) => {
    try {
      await loginMutation.mutateAsync(data);
      onSuccess?.("login");
      redirectAfterAuth("dashboard", opts?.redirectTo);
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  const register = async (data: RegisterDto, opts?: AuthRedirectOpts) => {
    try {
      await registerMutation.mutateAsync(data);
      onSuccess?.("register");
      redirectAfterAuth("dashboard", opts?.redirectTo);
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      redirectAfterAuth("auth");
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
