"use client";

import { AuthProvider as OrdoAuthProvider, useAuth } from "@ordo-todo/auth-provider";
import type { OrdoApiClient } from "@ordo-todo/api-client";
import { ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";

interface AuthProviderProps {
  children: ReactNode;
  apiClient: OrdoApiClient;
}

export function AuthProvider({ children, apiClient }: AuthProviderProps) {
  return <OrdoAuthProvider platform="web" apiClient={apiClient}>{children}</OrdoAuthProvider>;
}

export { useAuth };
