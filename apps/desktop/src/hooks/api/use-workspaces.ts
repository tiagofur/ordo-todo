import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';

/**
 * Smart workspace hook for desktop
 * Handles both legacy routes (slug only) and new routes (username + slug)
 */
export function useDesktopWorkspaceBySlug(slug: string, username?: string) {
    return useQuery({
        queryKey: ['workspaces', 'slug', username, slug],
        queryFn: () => {
            // If username provided, use standard endpoint
            if (username) {
                return apiClient.getWorkspaceBySlug(username, slug);
            }
            // Otherwise use legacy desktop endpoint
            return apiClient.getWorkspaceBySlugLegacy(slug);
        },
        enabled: !!slug,
    });
}

// Keep legacy for direct usages if any
export function useLegacyWorkspaceBySlug(slug: string) {
    return useQuery({
        queryKey: ['workspaces', 'slug', 'legacy', slug],
        queryFn: () => apiClient.getWorkspaceBySlugLegacy(slug),
        enabled: !!slug,
    });
}
