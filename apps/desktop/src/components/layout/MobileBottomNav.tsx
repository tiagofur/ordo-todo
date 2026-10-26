import { Calendar, CheckSquare, Home, Menu, Timer } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

/**
 * Barra de navegación inferior para teléfono (solo app móvil, < md): acceso
 * directo a las 4 pantallas principales + "Menú" que abre el cajón con el
 * resto de la navegación de desktop.
 */
export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const { t } = (useTranslation as any)();
  const { pathname } = useLocation();

  const items = [
    { name: t("Sidebar.today"), href: "/dashboard", icon: Home },
    { name: t("Sidebar.tasks"), href: "/tasks", icon: CheckSquare },
    { name: t("Sidebar.timer", "Timer"), href: "/timer", icon: Timer },
    { name: t("Sidebar.calendar"), href: "/calendar", icon: Calendar },
  ];

  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium leading-none";

  return (
    <nav
      aria-label={t("TopBar.menu", "Menú")}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {items.map(({ name, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            to={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              itemClass,
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="truncate">{name}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onMenuClick}
        className={cn(itemClass, "text-muted-foreground")}
      >
        <Menu className="size-5" aria-hidden="true" />
        <span>{t("TopBar.menu", "Menú")}</span>
      </button>
    </nav>
  );
}
