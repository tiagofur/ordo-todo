import type { AuthContextType, AuthProviderProps } from "./types.js";
declare const defaultAuthContext: AuthContextType;
export declare function AuthProvider({ children, platform, onError, onSuccess, apiClient, onOAuthLogin, queryClient: propQueryClient, }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export { defaultAuthContext };
//# sourceMappingURL=auth-provider.d.ts.map