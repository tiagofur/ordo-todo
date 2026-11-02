/**
 * User integration and OAuth connection DTOs.
 * Shapes mirror the consent screen, integrations tab and connected-apps
 * settings that consume them.
 */

export interface IntegrationActionResult {
  success: boolean;
  message: string;
  integration?: unknown;
}

export interface IntegrationDisconnectResult {
  success: boolean;
  message: string;
}

/** Public facts the OAuth consent screen shows about the requesting app. */
export interface OAuthClientInfo {
  clientId: string;
  clientName: string;
  /** Scopes a grant would carry; null when the request would be rejected. */
  grantedScopes: string[] | null;
}

/** An app/agent holding a live OAuth grant for the current user. */
export interface OAuthConnection {
  clientId: string;
  clientName: string;
  scopes: string[];
  connectedAt: string;
  lastRefreshedAt: string;
}

export interface OAuthDisconnectResult {
  revoked: number;
}
