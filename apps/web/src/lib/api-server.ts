/**
 * Server-Side API Client
 *
 * For use in Next.js Server Components and Server Actions.
 * Does not use browser-based token storage.
 */

import { OrdoApiClient } from '@ordo-todo/api-client';
import { cookies } from 'next/headers';
import { config } from '@/config';

/**
 * Get a server-side API client instance
 * Optionally accepts a token for authenticated requests
 */
export async function getServerApiClient(token?: string) {
  const baseURL = config.api.baseURL;

  const client = new OrdoApiClient({
    baseURL,
    // No token storage for server-side
  });

  // If token is provided, set it for this request
  if (token) {
    // Access the internal axios instance to set Authorization header
    (client as any).axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Try to get token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (accessToken) {
      (client as any).axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  return client;
}

/**
 * Get the current user's token from cookies
 */
export async function getServerToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
}
