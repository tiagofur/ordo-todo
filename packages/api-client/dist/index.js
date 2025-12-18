"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageTokenStorage = exports.MemoryTokenStorage = exports.OrdoApiClient = void 0;
// Export main client class
var client_1 = require("./client");
Object.defineProperty(exports, "OrdoApiClient", { enumerable: true, get: function () { return client_1.OrdoApiClient; } });
var storage_1 = require("./utils/storage");
Object.defineProperty(exports, "MemoryTokenStorage", { enumerable: true, get: function () { return storage_1.MemoryTokenStorage; } });
Object.defineProperty(exports, "LocalStorageTokenStorage", { enumerable: true, get: function () { return storage_1.LocalStorageTokenStorage; } });
// Export all types
__exportStar(require("./types"), exports);
