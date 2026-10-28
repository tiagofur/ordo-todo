import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/navigation';
import { LOCALE_COOKIE } from './i18n/locales';
import { resolvePreferredLocale } from './lib/locale-resolve';

const intlMiddleware = createMiddleware(routing);

const publicPages = ['/login', '/register', '/share', '/invitations', '/forgot-password', '/reset-password'];

/**
 * Locale for URLs without a prefix: explicit choice first, then the legacy
 * next-intl cookie (returns continuity for choices made before ordo-locale
 * existed), then the browser's languages in order, then the default.
 */
function preferredLocaleFromRequest(request: NextRequest): string {
    const browserLocales = (request.headers.get('accept-language') ?? '')
        .split(',')
        .map((part) => part.split(';')[0]?.trim() ?? '')
        .filter(Boolean);
    const stored =
        request.cookies.get(LOCALE_COOKIE)?.value ??
        request.cookies.get('NEXT_LOCALE')?.value;
    return resolvePreferredLocale(browserLocales, stored);
}

function isTokenValid(token?: string): boolean {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3 || !parts[1]) return false;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        if (!payload.exp) return true;
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for tokens and their validity
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const hasValidToken = isTokenValid(accessToken) || isTokenValid(refreshToken);
    const hasAnyToken = Boolean(accessToken || refreshToken);

    // Check if the request is for the root path
    const isRootPath = pathname === '/';

    // Check if it's a locale-only path (e.g., /es, /en, /pt-br)
    const isLocaleOnlyPath = routing.locales.some(
        (locale) => pathname === `/${locale}` || pathname === `/${locale}/`
    );

    // If it's the root path or locale-only path
    if (isRootPath || isLocaleOnlyPath) {
        // Locale-only paths keep their explicit locale; bare `/` negotiates
        // from the stored choice, then the browser languages.
        const locale = isLocaleOnlyPath
            ? pathname.replace(/^\//, '').replace(/\/$/, '')
            : preferredLocaleFromRequest(request);

        // If authenticated -> Dashboard, else -> Login
        const targetPath = hasValidToken ? 'dashboard' : 'login';
        const response = NextResponse.redirect(new URL(`/${locale}/${targetPath}`, request.url));
        if (!hasValidToken && hasAnyToken) {
            response.cookies.delete('access_token');
            response.cookies.delete('refresh_token');
        }
        return response;
    }

    // Identify current locale from path; unprefixed URLs (e.g. the OAuth
    // callback target `/dashboard`) negotiate like the root path so an
    // explicit choice or the browser language survives the round-trip.
    const localeMatch = pathname.match(/^\/(en|es|pt-br)/);
    const locale = localeMatch ? localeMatch[1] : preferredLocaleFromRequest(request);
    const pathWithoutLocale = pathname.replace(/^\/(en|es|pt-br)/, '');

    // Check if route is public
    const isPublic = publicPages.some(page => pathWithoutLocale.startsWith(page));

    // 1. Protected Route & No Valid Token -> Login
    if (!isPublic && !hasValidToken) {
        const response = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
        if (hasAnyToken) {
            response.cookies.delete('access_token');
            response.cookies.delete('refresh_token');
        }
        return response;
    }

    // 2. Auth Route (Login/Register) & Valid Token -> Dashboard
    if ((pathWithoutLocale.startsWith('/login') || pathWithoutLocale.startsWith('/register')) && hasValidToken) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    // For all other paths, use the intl middleware and clear stale tokens on auth pages
    const response = intlMiddleware(request);
    if ((pathWithoutLocale.startsWith('/login') || pathWithoutLocale.startsWith('/register')) && !hasValidToken && hasAnyToken) {
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
    }
    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
};
