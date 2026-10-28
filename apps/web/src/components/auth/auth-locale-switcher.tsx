"use client";

import { useLocale } from "next-intl";
import { Link, routing, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";

const LOCALE_LABEL: Record<string, string> = {
  en: "EN",
  es: "ES",
  "pt-br": "PT",
};

const SWITCHER_LABEL: Record<string, string> = {
  en: "Language",
  es: "Idioma",
  "pt-br": "Idioma",
};

/**
 * Language switcher for the auth pages (login, register, password reset).
 * Navigates to the same page in the new locale; next-intl persists the
 * explicit choice in the locale cookie, which the middleware honors.
 */
export function AuthLocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-center gap-1 text-sm" aria-label={SWITCHER_LABEL[locale] ?? "Language"}>
      <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/50">·</span>}
          <Link
            href={pathname}
            locale={loc}
            aria-current={loc === locale ? "true" : undefined}
            className={
              loc === locale
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {LOCALE_LABEL[loc] ?? loc.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
