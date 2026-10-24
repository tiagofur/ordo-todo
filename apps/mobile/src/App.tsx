import { useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@ordo-todo/auth-provider";
import { apiClient } from "./lib/api";
import { initDeepLinks } from "./lib/deep-links";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Today from "./pages/Today";

const queryClient = new QueryClient();

/**
 * Gate de sesión: splash mientras se valida el token almacenado,
 * Login/Register sin sesión, Today con sesión. También escucha el deep link
 * ordo://auth/callback (OAuth) y refresca el usuario al recibir tokens.
 */
function Shell() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const qc = useQueryClient();
  const [screen, setScreen] = useState<"login" | "register">("login");
  const [oauthResult, setOauthResult] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    initDeepLinks((ok) => {
      setOauthResult({
        ok,
        text: ok ? "Sesión iniciada con OAuth" : "OAuth no completado",
      });
      // Con tokens nuevos en el storage, el currentUser se recalcula.
      qc.invalidateQueries();
    });
  }, [qc]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="animate-pulse text-sm text-zinc-500">Ordo…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div>
        {oauthResult && (
          <p
            className={`mx-auto mt-4 max-w-md rounded-lg border px-3 py-2 text-xs ${
              oauthResult.ok
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {oauthResult.text}
          </p>
        )}
        {screen === "login" ? (
          <Login onGoRegister={() => setScreen("register")} />
        ) : (
          <Register onGoLogin={() => setScreen("login")} />
        )}
      </div>
    );
  }

  return <Today user={user} onLogout={() => void logout()} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider platform="mobile" apiClient={apiClient}>
        <Shell />
      </AuthProvider>
    </QueryClientProvider>
  );
}
