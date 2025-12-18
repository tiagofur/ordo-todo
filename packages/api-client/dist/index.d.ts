/**
 * @ordo-todo/api-client
 *
 * Shared API client for Ordo-Todo applications.
 * Provides type-safe access to all 49 REST API endpoints.
 *
 * @example
 * ```typescript
 * import { OrdoApiClient, LocalStorageTokenStorage } from '@ordo-todo/api-client';
 *
 * const client = new OrdoApiClient({
 *   baseURL: 'http://localhost:3001/api/v1',
 *   tokenStorage: new LocalStorageTokenStorage(),
 * });
 *
 * // Use the client
 * const workspaces = await client.getWorkspaces();
 * ```
 */
export { OrdoApiClient } from './client';
export type { ClientConfig } from './client';
export type { TokenStorage } from './utils/storage';
export { MemoryTokenStorage, LocalStorageTokenStorage } from './utils/storage';
export * from './types';
//# sourceMappingURL=index.d.ts.map