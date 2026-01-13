"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAuthContext = void 0;
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const AuthContext = (0, react_1.createContext)(null);
const QUERY_KEY_CURRENT_USER = "currentUser";
const defaultAuthContext = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
};
exports.defaultAuthContext = defaultAuthContext;
function AuthProvider({ children, platform, onError, onSuccess, apiClient, }) {
    const queryClient = (0, react_query_1.useQueryClient)();
    const [mounted, setMounted] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setMounted(true);
    }, []);
    const { data: currentUserData, isLoading: isLoadingUser, error, } = (0, react_query_1.useQuery)({
        queryKey: [QUERY_KEY_CURRENT_USER],
        queryFn: () => apiClient.getCurrentUser(),
        retry: false,
        enabled: mounted,
    });
    const loginMutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => apiClient.login(data),
    });
    const registerMutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => apiClient.register(data),
    });
    const logoutMutation = (0, react_query_1.useMutation)({
        mutationFn: () => apiClient.logout(),
        onSuccess: () => {
            queryClient.clear();
            onSuccess?.("logout");
        },
        onError: (error) => {
            onError?.(error);
        },
    });
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
    const value = (0, react_1.useMemo)(() => ({
        user,
        isLoading: !mounted || isLoadingUser,
        isAuthenticated: !!user,
        error,
        login,
        register,
        logout,
    }), [user, mounted, isLoadingUser, error]);
    return (0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: value, children: children });
}
function useAuth() {
    const context = (0, react_1.useContext)(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
//# sourceMappingURL=auth-provider.js.map