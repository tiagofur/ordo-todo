import { openUrl } from "@tauri-apps/plugin-opener";
import { LocalStorageTokenStorage } from "@ordo-todo/api-client";
import { API_URL } from "./api";

const tokenStorage = new LocalStorageTokenStorage();

/**
 * Abre el flujo OAuth en el navegador del sistema. El backend, al terminar,
 * redirige a ordo://auth/callback?access_token=…&refresh_token=… y el deep
 * link vuelve a la app (ver lib/deep-links.ts).
 *
 * El backend decide el redirect por el parámetro state: "desktop" usa el
 * deep link ordo:// (lo usan desktop y mobile, mismo scheme).
 */
export async function startOAuthFlow(
  provider: "google" | "github",
): Promise<void> {
  await openUrl(`${API_URL}/auth/${provider}?platform=desktop`);
}

/**
 * Guarda los tokens que llegan en el callback del deep link.
 * Devuelve true si el callback era válido y la sesión quedó iniciada.
 */
export async function storeOAuthCallbackTokens(
  params: URLSearchParams,
): Promise<boolean> {
  const accessToken = params.get("access_token") || params.get("accessToken");
  const refreshToken =
    params.get("refresh_token") || params.get("refreshToken");
  const error = params.get("error");

  if (error) {
    console.error("[OAuth] error del proveedor:", error);
    return false;
  }
  if (!accessToken || !refreshToken) {
    console.error("[OAuth] callback sin tokens");
    return false;
  }

  await tokenStorage.setToken(accessToken);
  await tokenStorage.setRefreshToken(refreshToken);
  return true;
}
