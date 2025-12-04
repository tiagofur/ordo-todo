import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/navigation';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the request is for the root path
    const isRootPath = pathname === '/';

    // Check if it's a locale-only path (e.g., /es, /en, /pt-br)
    const isLocaleOnlyPath = routing.locales.some(
        (locale) => pathname === `/${locale}` || pathname === `/${locale}/`
    );

    // If it's the root path or locale-only path, redirect to dashboard
    if (isRootPath || isLocaleOnlyPath) {
        // Get the locale from the path or use default
        const locale = isLocaleOnlyPath
            ? pathname.replace(/^\//, '').replace(/\/$/, '')
            : routing.defaultLocale;

        // Redirect to dashboard
        const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
        return NextResponse.redirect(dashboardUrl);
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
