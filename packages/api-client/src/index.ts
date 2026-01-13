// Main exports
export { OrdoApiClient } from './client';
export type { ClientConfig } from './client';

// Storage utilities
export { LocalStorageTokenStorage, MemoryTokenStorage } from './utils/storage';
export type { TokenStorage } from './utils/storage';

// Types
export * from './types';

// Pre-configured instance
export { apiClient } from './api-instance';
