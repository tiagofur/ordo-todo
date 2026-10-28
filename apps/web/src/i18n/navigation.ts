import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale, LOCALE_COOKIE } from './locales';

export const routing = defineRouting({
    locales: [...locales],
    defaultLocale,
    // Unprefixed URLs (e.g. the OAuth callback target `/dashboard`) resolve
    // through this cookie first, so an explicit choice survives the round-trip.
    localeCookie: { name: LOCALE_COOKIE, maxAge: 31536000, sameSite: 'lax', path: '/' },
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
