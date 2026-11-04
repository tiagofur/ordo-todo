/**
 * Desktop API Client
 *
 * Uses the shared OrdoApiClient from @ordo-todo/api-client with
 * Electron-specific token storage.
 */

import { OrdoApiClient } from "@ordo-todo/api-client";
import { ElectronStoreTokenStorage } from "./storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3101/api/v1";

/**
 * Desktop-specific API client with Electron storage
 *
 * Extends the base client only with endpoints the shared package does not
 * expose yet (legacy slug route, upload progress, plain analytics,
 * task sharing links, report generation). Everything else is inherited
 * from OrdoApiClient — do not re-add duplicates here.
 */
export class DesktopApiClient extends OrdoApiClient {
  // Public method to access base URL
  getBaseUrl(): string {
    return this.axios.defaults.baseURL || "";
  }

  // ============ WORKSPACE ENDPOINTS ============

  async getWorkspaceBySlugLegacy(slug: string) {
    const response = await this.axios.get(`/workspaces/slug/${slug}`);
    return response.data;
  }

  // ============ ANALYTICS ============

  async getAnalytics(params?: { startDate?: string; endDate?: string }) {
    const response = await this.axios.get("/analytics", { params });
    return response.data;
  }

  // ============ TASK SHARING ============

  async generateShareToken(taskId: string) {
    const response = await this.axios.post(`/tasks/${taskId}/share`);
    return response.data;
  }

  async getSharedTask(token: string) {
    const response = await this.axios.get(`/tasks/share/${token}`);
    return response.data;
  }

  async getShareUrl(taskId: string) {
    const shareData = await this.generateShareToken(taskId);
    const baseUrl = this.getBaseUrl().endsWith("/api/v1")
      ? this.getBaseUrl().slice(0, -7) // Remove '/api/v1'
      : this.getBaseUrl();
    return `${baseUrl}/share/task/${shareData.token}`;
  }

  // ============ FILE UPLOADS ============

  async uploadFile(
    taskId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", taskId);

    const response = await this.axios.post("/attachments/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // ============ REPORTS ============

  async generateReport(params: { type: "WEEKLY" | "MONTHLY"; scope: string }) {
    const response = await this.axios.post("/reports/generate", params);
    return response.data;
  }
}

import { QueryClient } from "@tanstack/react-query";

let queryClientInstance: QueryClient | null = null;

export const registerQueryClient = (client: QueryClient) => {
  queryClientInstance = client;
};

// El 401 del propio logout dentro de onAuthError re-entra aquí; sin guardia,
// la promesa original no resuelve nunca y las pantallas quedan en loading.
let handlingAuthError = false;

export const apiClient = new DesktopApiClient({
  baseURL: API_URL,
  tokenStorage: new ElectronStoreTokenStorage(),
  onTokenRefresh: (response) => {
    console.log("[API Client] Token refreshed successfully");
  },
  onAuthError: async () => {
    if (handlingAuthError) return;
    handlingAuthError = true;
    try {
      console.log("[API Client] Auth error - token expired or invalid");
      // 1. Limpieza local síncrona PRIMERO: los guards leen localStorage en
      // cada render; si el storage de Tauri se cuelga, esto garantiza que la
      // próxima pintura ya ve hasToken=false en vez de un spinner eterno.
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      } catch {
        // Sin DOM/privacidad estricta: sigue con el resto del teardown.
      }

      // 2. Logout best-effort con techo: nunca puede colgar el teardown.
      try {
        await Promise.race([
          apiClient.logout(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("logout timeout")), 5000),
          ),
        ]);
      } catch {
        // La sesión ya no es válida: basta con limpiar el estado local.
      }

      if (queryClientInstance) {
        queryClientInstance.clear();
      }

      // 3. Salida dura a /auth: desmonta los guards y corta cualquier
      // tormenta clear→refetch antes de que pinte otro spinner.
      if (
        typeof window !== "undefined" &&
        !window.location.hash.startsWith("#/auth")
      ) {
        window.location.hash = "#/auth";
      }
    } finally {
      handlingAuthError = false;
    }
  },
});

export const getApiUrl = () => API_URL;
