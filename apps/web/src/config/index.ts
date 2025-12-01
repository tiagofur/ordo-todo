/**
 * Application Configuration
 * 
 * Centralized configuration for environment variables.
 * This ensures variables are read at build time and available throughout the app.
 */

// API Configuration
export const API_CONFIG = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101/api/v1',
} as const;

// Auth Configuration
export const AUTH_CONFIG = {
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3100',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production',
} as const;

// Database Configuration (server-side only)
export const DB_CONFIG = {
    databaseUrl: process.env.DATABASE_URL,
} as const;

// Export all configs
export const config = {
    api: API_CONFIG,
    auth: AUTH_CONFIG,
    db: DB_CONFIG,
} as const;

export default config;
