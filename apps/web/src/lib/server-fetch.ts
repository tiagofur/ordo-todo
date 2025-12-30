import { cookies } from 'next/headers';
import { API_CONFIG } from '@/config';

/**
 * Server-side fetch helper that forwards auth cookies
 */
export async function serverFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cookieStore = await cookies();
    const allCookies = cookieStore.toString();

    const url = `${API_CONFIG.baseURL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Cookie: allCookies,
        },
    });

    if (!response.ok) {
        throw new Error(`Server fetch failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
