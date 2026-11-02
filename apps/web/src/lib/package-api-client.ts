/**
 * Package-backed API singleton for the web app.
 *
 * Same transport as the bespoke client it replaces: httpOnly cookies via
 * `withCredentials`, CSRF from the shared web token cache below (so the
 * sync store and the hooks use one cached token), and session refresh
 * through `POST /auth/refresh`. No bearer, no localStorage.
 */
import axios from "axios";
import { OrdoApiClient } from "@ordo-todo/api-client";
import { config } from "@/config";

// Tokens are managed via httpOnly cookies - no localStorage needed.
// The backend sets cookies on login/register/refresh and clears them on logout.

// CSRF Protection
let csrfToken: string | null = null;

export const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await axios.get<{ csrfToken: string }>(
      `${config.api.baseURL}/auth/csrf-token`,
      { withCredentials: true },
    );

    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("[API] Failed to fetch CSRF token:", error);
    throw error;
  }
};

export const invalidateCsrfToken = () => {
  csrfToken = null;
};

export const packageApiClient = new OrdoApiClient({
  baseURL: config.api.baseURL,
  authTransport: "credentialed",
  csrfTokenProvider: () => getCsrfToken(),
});
