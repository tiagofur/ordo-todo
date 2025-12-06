import { createContext, useContext, ReactNode } from "react";
import { useCurrentUser, useLogin, useRegister, useLogout } from "@/hooks/api/use-auth";
import type { User, LoginDto, RegisterDto } from "@ordo-todo/api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: RegisterDto) => Promise<void>;
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

  return (
    <AuthContext.Provider
      value={{
        user: (user as any) || null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
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
