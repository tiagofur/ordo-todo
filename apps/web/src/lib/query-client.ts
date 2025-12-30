import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * Creates a QueryClient for server-side usage
 * Wrapped in React cache to ensure one instance per request
 */
export const getQueryClient = cache(() => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
        },
        dehydrate: {
            // per default, only successful queries are included, 
            // but we can customize this if we want to include others
            shouldDehydrateQuery: (query) =>
                defaultShouldDehydrateQuery(query) ||
                query.state.status === 'pending',
        },
    },
}));
