/**
 * Application Configuration
 * 
 * Centralized configuration for environment variables.
 * This ensures variables are read at build time and available throughout the app.
 */

import { env } from '@/env';

// API Configuration
export const API_CONFIG = {
    baseURL: env.NEXT_PUBLIC_API_URL,
} as const;

// Auth Configuration
export const AUTH_CONFIG = {
    nextAuthUrl: env.NEXTAUTH_URL || 'http://localhost:3100',
    nextAuthSecret: env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production',
} as const;

// Database Configuration (server-side only)
export const DB_CONFIG = {
    databaseUrl: env.DATABASE_URL,
} as const;

// Export all configs
export const config = {
    api: API_CONFIG,
    auth: AUTH_CONFIG,
    db: DB_CONFIG,
} as const;

export default config;
