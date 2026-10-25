import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import {
  defaultShouldDehydrateQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@ordo-todo/auth-provider";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { apiClient } from "./lib/api";
import { initDeepLinks } from "./lib/deep-links";
import { persister, queryClient } from "./lib/query";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Today from "./pages/Today";
import NewTask from "./pages/NewTask";
import TaskDetail from "./pages/TaskDetail";
import Timer from "./pages/Timer";

/**
 * Gate de sesión: sin sesión → Login/Register; con sesión → app (Outlet).
 * Escucha el deep link ordo://auth/callback (OAuth) y refresca el usuario.
 */
function RequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuth();
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

  if (isAuthenticated && user) {
    return <Outlet />;
  }

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

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
        // El estado del timer es efímero: una sesión "activa" restaurada de
        // caché con horas de antigüedad haría que el motor la cerrara como
        // completada en el primer tick.
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.queryKey[0] !== "timer" && defaultShouldDehydrateQuery(query),
        },
      }}
    >
      <AuthProvider platform="mobile" apiClient={apiClient}>
        <Routes>
          <Route path="/login" element={<Navigate to="/today" replace />} />
          <Route element={<RequireAuth />}>
            <Route path="/today" element={<Today />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/tasks/new" element={<NewTask />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}
