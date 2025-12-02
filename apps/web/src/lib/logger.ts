/**
 * Logging utility for client-side logging
 * Only logs in development mode
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    debug: (...args: any[]) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },

    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },

    warn: (...args: any[]) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },

    error: (...args: any[]) => {
        // Always log errors, even in production
        console.error(...args);
    },

    captureException: (error: Error | unknown, context?: Record<string, any>) => {
        // Always log exceptions
        console.error('Exception captured:', error, context);

        // In production, this would send the error to a monitoring service
        if (!isDevelopment) {
            // TODO: Integrate with Sentry or similar
        }
    },
};
