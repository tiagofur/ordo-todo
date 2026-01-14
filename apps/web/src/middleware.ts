import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/navigation';

const intlMiddleware = createMiddleware(routing);

const publicPages = ['/login', '/register', '/share', '/invitations', '/forgot-password', '/reset-password'];

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for tokens
    const token = request.cookies.get('access_token')?.value || request.cookies.get('refresh_token')?.value;

    // Check if the request is for the root path
    const isRootPath = pathname === '/';

    // Check if it's a locale-only path (e.g., /es, /en, /pt-br)
    const isLocaleOnlyPath = routing.locales.some(
        (locale) => pathname === `/${locale}` || pathname === `/${locale}/`
    );

    // If it's the root path or locale-only path
    if (isRootPath || isLocaleOnlyPath) {
        // Get the locale from the path or use default
        const locale = isLocaleOnlyPath
            ? pathname.replace(/^\//, '').replace(/\/$/, '')
            : routing.defaultLocale;

        // If authenticated -> Dashboard, else -> Login
        const targetPath = token ? 'dashboard' : 'login';
        return NextResponse.redirect(new URL(`/${locale}/${targetPath}`, request.url));
    }

    // Identify current locale from path
    const localeMatch = pathname.match(/^\/(en|es|pt-br)/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    const pathWithoutLocale = pathname.replace(/^\/(en|es|pt-br)/, '');

    // Check if route is public
    const isPublic = publicPages.some(page => pathWithoutLocale.startsWith(page));

    // 1. Protected Route & No Token -> Login
    if (!isPublic && !token) {
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // 2. Auth Route (Login/Register) & Token -> Dashboard
    if ((pathWithoutLocale.startsWith('/login') || pathWithoutLocale.startsWith('/register')) && token) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    // For all other paths, use the intl middleware
    return intlMiddleware(request);
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
};
