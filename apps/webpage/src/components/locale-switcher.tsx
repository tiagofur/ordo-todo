"use client";

import { useLocale } from "next-intl";
import { Link, routing, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";

const LOCALE_LABEL: Record<string, string> = {
  en: "EN",
  es: "ES",
  "pt-br": "PT",
};

/**
 * Selector de idioma. Cambia la ruta localizada de la página actual
 * (p. ej. /es/pricing → /pt-br/pricing); next-intl guarda NEXT_LOCALE.
 */
export function LocaleSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-sm" aria-label="Language">
      <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/50">·</span>}
          <Link
            href={pathname}
            locale={loc}
            onClick={onNavigate}
            aria-current={loc === locale ? "true" : undefined}
            className={
              loc === locale
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-brand-soft transition-colors"
            }
          >
            {LOCALE_LABEL[loc] ?? loc.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
