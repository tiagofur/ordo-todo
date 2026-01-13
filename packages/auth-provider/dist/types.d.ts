import type { UserResponse, LoginDto, RegisterDto, AuthResponse } from "@ordo-todo/api-client";
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
export interface AuthProviderProps {
    children: ReactNode;
    platform: "web" | "mobile" | "desktop";
    onError?: (error: Error) => void;
    onSuccess?: (event: "login" | "register" | "logout") => void;
    apiClient: ApiClient;
    /** Optional callback for OAuth login - each platform implements this differently */
    onOAuthLogin?: (provider: OAuthProvider) => Promise<void>;
}
export interface ApiClient {
    login: (data: LoginDto) => Promise<AuthResponse>;
    register: (data: RegisterDto) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<UserResponse>;
}
export type PlatformType = "web" | "mobile" | "desktop";
export type AuthEvent = "login" | "register" | "logout";
//# sourceMappingURL=types.d.ts.map