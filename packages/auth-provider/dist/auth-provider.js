import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useMemo, } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
const AuthContext = createContext(null);
const QUERY_KEY_CURRENT_USER = "currentUser";
const defaultAuthContext = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    signInWithGoogle: async () => { },
    signInWithGitHub: async () => { },
};
export function AuthProvider({ children, platform, onError, onSuccess, apiClient, onOAuthLogin, queryClient: propQueryClient, }) {
    let contextQueryClient;
    try {
        contextQueryClient = useQueryClient();
    }
    catch {
        // Graceful fallback if context is isolated or during SSR
    }
    const queryClient = propQueryClient || contextQueryClient;
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const { data: currentUserData, isLoading: isLoadingUser, error, } = useQuery({
        queryKey: [QUERY_KEY_CURRENT_USER],
        queryFn: () => apiClient.getCurrentUser(),
        retry: false,
        enabled: mounted,
    }, queryClient);
    const loginMutation = useMutation({
        mutationFn: (data) => apiClient.login(data),
    }, queryClient);
    const registerMutation = useMutation({
        mutationFn: (data) => apiClient.register(data),
    }, queryClient);
    const logoutMutation = useMutation({
        mutationFn: () => apiClient.logout(),
        onSuccess: () => {
            queryClient?.clear();
            onSuccess?.("logout");
        },
        onError: (error) => {
            onError?.(error);
        },
    }, queryClient);
    const isUnauthorized = error?.response?.status === 401;
    const user = isUnauthorized ? null : currentUserData || null;
    const login = async (data) => {
        try {
            await loginMutation.mutateAsync(data);
            onSuccess?.("login");
            if (platform === "web") {
                window.location.href = "/dashboard";
            }
            else if (platform === "mobile") {
                window.location.href = "/(internal)/dashboard";
            }
            else if (platform === "desktop") {
                window.location.href = "/dashboard";
            }
        }
        catch (error) {
            onError?.(error);
            throw error;
        }
    };
    const register = async (data) => {
        try {
            await registerMutation.mutateAsync(data);
            onSuccess?.("register");
            if (platform === "web") {
                window.location.href = "/dashboard";
            }
            else if (platform === "mobile") {
                window.location.href = "/(internal)/dashboard";
            }
            else if (platform === "desktop") {
                window.location.href = "/dashboard";
            }
        }
        catch (error) {
            onError?.(error);
            throw error;
        }
    };
    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
            if (platform === "web") {
                window.location.href = "/login";
            }
            else if (platform === "mobile") {
                window.location.href = "/(external)/auth";
            }
            else if (platform === "desktop") {
                window.location.href = "/login";
            }
        }
        catch (error) {
            onError?.(error);
            throw error;
        }
    };
    const signInWithGoogle = async () => {
        if (onOAuthLogin) {
            try {
                await onOAuthLogin("google");
                onSuccess?.("login");
            }
            catch (error) {
                onError?.(error);
                throw error;
            }
        }
        else {
            console.warn("OAuth login not configured for this platform");
        }
    };
    const signInWithGitHub = async () => {
        if (onOAuthLogin) {
            try {
                await onOAuthLogin("github");
                onSuccess?.("login");
            }
            catch (error) {
                onError?.(error);
                throw error;
            }
        }
        else {
            console.warn("OAuth login not configured for this platform");
        }
    };
    const value = useMemo(() => ({
        user,
        isLoading: !mounted || isLoadingUser,
        isAuthenticated: !!user,
        error,
        login,
        register,
        logout,
        signInWithGoogle,
        signInWithGitHub,
    }), [user, mounted, isLoadingUser, error]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
export { defaultAuthContext };
//# sourceMappingURL=auth-provider.js.map