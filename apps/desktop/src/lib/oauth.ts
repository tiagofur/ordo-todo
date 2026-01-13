/**
 * OAuth utilities for Desktop (Electron)
 * 
 * Implements OAuth flow using external browser and deep link callback.
 * The flow works as follows:
 * 1. Open OAuth URL in system's default browser
 * 2. User authenticates with Google/GitHub
 * 3. Backend redirects to ordo://auth/callback?...
 * 4. Electron intercepts the deep link
 * 5. Tokens are extracted and stored
 */

import type { OAuthProvider } from "@ordo-todo/auth-provider";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

/**
 * Start OAuth flow by opening the provider's auth URL in the system browser
 */
export async function startOAuthFlow(provider: OAuthProvider): Promise<void> {
    // Construct the OAuth URL with platform parameter
    const oauthUrl = `${API_BASE_URL}/auth/${provider}?platform=desktop`;

    // Open in system's default browser using shell.openExternal via IPC
    // For now, fallback to window.open which works in development
    // TODO: Add IPC handler for shell.openExternal in main process
    window.open(oauthUrl, "_blank");
}

/**
 * Handle OAuth callback from deep link
 * Called when the app receives ordo://auth/callback?...
 */
export interface OAuthCallbackData {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
}

export function parseOAuthCallback(params: Record<string, string>): OAuthCallbackData {
    return {
        accessToken: params.access_token || params.accessToken,
        refreshToken: params.refresh_token || params.refreshToken,
        error: params.error,
    };
}

/**
 * Store tokens from OAuth callback
 */
export async function storeOAuthTokens(data: OAuthCallbackData): Promise<boolean> {
    if (data.error) {
        console.error("[OAuth] Auth error:", data.error);
        return false;
    }

    if (!data.accessToken || !data.refreshToken) {
        console.error("[OAuth] Missing tokens in callback");
        return false;
    }

    // Store tokens using Electron's secure storage
    if (window.electronAPI?.storeSet) {
        await window.electronAPI.storeSet("accessToken", data.accessToken);
        await window.electronAPI.storeSet("refreshToken", data.refreshToken);
        return true;
    }

    // Fallback to localStorage (less secure, for development)
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return true;
}

/**
 * Create OAuth login handler that can be passed to AuthProvider
 */
export function createDesktopOAuthHandler(): (provider: OAuthProvider) => Promise<void> {
    return async (provider: OAuthProvider) => {
        // Start the OAuth flow - actual completion handled by deep link callback
        await startOAuthFlow(provider);

        // Note: The actual token storage happens when the deep link callback is received
        // This promise resolves immediately after opening the browser
        // The app needs to handle the auth completion via the deep link listener
    };
}
