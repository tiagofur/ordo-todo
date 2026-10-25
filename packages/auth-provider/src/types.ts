import type {
  UserResponse,
  LoginDto,
  RegisterDto,
  AuthResponse,
} from "@ordo-todo/api-client";
import type { ReactNode } from "react";

export interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: unknown;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
}

export type OAuthProvider = "google" | "github";

import type { QueryClient } from "@tanstack/react-query";

export interface AuthProviderProps {
  children: ReactNode;
  platform: "web" | "mobile" | "desktop";
  onError?: (error: Error) => void;
  onSuccess?: (event: "login" | "register" | "logout") => void;
  apiClient: ApiClient;
  /** Optional query client instance */
  queryClient?: QueryClient;
  /** Optional callback for OAuth login - each platform implements this differently */
  onOAuthLogin?: (provider: OAuthProvider) => Promise<void>;
  /**
   * Override for post-login/register/logout navigation. Por defecto es una
   * redirección dura de documento (window.location.href) con las rutas por
   * plataforma; un SPA con router propio (p. ej. hash router en la app móvil
   * Tauri) debe pasar aquí su navigate para no recargar el documento.
   */
  onRedirect?: (to: string) => void;
}

export interface ApiClient {
  login: (data: LoginDto) => Promise<AuthResponse>;
  register: (data: RegisterDto) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<UserResponse>;
}

export type PlatformType = "web" | "mobile" | "desktop";

export type AuthEvent = "login" | "register" | "logout";
