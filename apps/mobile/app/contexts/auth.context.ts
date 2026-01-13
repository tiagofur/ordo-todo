/**
 * Re-export auth context from shared package
 * This file exists for backwards compatibility with existing imports
 */
export { useAuth, AuthProvider, defaultAuthContext } from "@ordo-todo/auth-provider";
export type { AuthContextType, AuthProviderProps } from "@ordo-todo/auth-provider";
