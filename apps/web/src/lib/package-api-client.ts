/**
 * Package-backed API singleton for the web app.
 *
 * Same transport as the bespoke client it replaces: httpOnly cookies via
 * `withCredentials`, CSRF from the shared web token cache (`getCsrfToken`,
 * so the sync store and the hooks use one cached token), and session
 * refresh through `POST /auth/refresh`. No bearer, no localStorage.
 */
import { OrdoApiClient } from "@ordo-todo/api-client";
import { config } from "@/config";
import { getCsrfToken } from "./api-client";

export const packageApiClient = new OrdoApiClient({
  baseURL: config.api.baseURL,
  authTransport: "credentialed",
  csrfTokenProvider: () => getCsrfToken(),
});
