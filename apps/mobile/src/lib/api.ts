import { OrdoApiClient, LocalStorageTokenStorage } from "@ordo-todo/api-client";

/**
 * URL del backend. En el emulador Android, `localhost` del dispositivo se
 * mapea al host con `adb reverse tcp:3101 tcp:3101` (comando de desarrollo).
 */
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3101/api/v1";

/**
 * Instancia única del cliente API. Los tokens viven en el localStorage del
 * webview (persiste entre arranques); si más adelante se requiere
 * almacenamiento nativo reforzado, se cambia el TokenStorage aquí.
 */
export const apiClient = new OrdoApiClient({
  baseURL: API_URL,
  tokenStorage: new LocalStorageTokenStorage(),
});
