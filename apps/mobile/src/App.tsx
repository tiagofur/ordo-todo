import { RouterProvider } from "react-router-dom";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { AuthProvider } from "@ordo-todo/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { queryClient } from "@/lib/query-client";
import { sharedApiClient } from "@/lib/shared-api-client";
import {
  createDesktopOAuthHandler,
  parseOAuthCallback,
  storeOAuthTokens,
} from "@/lib/oauth";
import { useOAuthDeepLinks } from "./lib/deep-links";
import { router } from "@/routes";

/**
 * Escucha del deep link ordo://auth/callback (OAuth del navegador del
 * sistema). Los tokens se guardan con el mismo mecanismo que desktop
 * (plugin store), se recarga la sesión y se navega al dashboard. El
 * listener vive fuera del RouterProvider, así que navega por hash como
 * el onRedirect de AuthProvider.
 */
function MobileOAuthLinks() {
  const qc = useQueryClient();
  useOAuthDeepLinks(async (params) => {
    const data = parseOAuthCallback(params);
    if (data.error) {
      toast.error(`Error de OAuth: ${data.error}`);
      return false;
    }
    const ok = await storeOAuthTokens(data);
    if (ok) {
      await qc.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Sesión iniciada correctamente");
      window.location.hash = "/dashboard";
    } else {
      toast.error("No se pudo completar el inicio de sesión");
    }
    return ok;
  });
  return null;
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="ordo-theme"
      disableTransitionOnChange={false}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider
          platform="mobile"
          apiClient={sharedApiClient}
          onOAuthLogin={createDesktopOAuthHandler()}
          // El auth-provider redirige con window.location por defecto (rompe
          // los assets relativos al recargar el documento); el hash router
          // navega sin recarga.
          onRedirect={(to) => {
            window.location.hash = to;
          }}
        >
          <MobileOAuthLinks />
          <RouterProvider router={router} />
          {/* position distinta a desktop porque en móvil tapa poco */}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
