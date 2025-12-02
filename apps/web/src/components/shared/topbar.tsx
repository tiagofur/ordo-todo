"use client";

import { Bell, Search, User, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SyncStatusIndicator } from "@/components/shared/sync-status-indicator";

import { useTranslations } from "next-intl";

export function TopBar() {
  const t = useTranslations("TopBar");
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
      {/* Search */}
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-xl border border-border/50 bg-muted/30 pl-10 pr-4 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 focus:bg-background"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Sync Status */}
        <SyncStatusIndicator size="sm" />

        <Button
          variant="ghost"
          size="icon"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 h-10 w-10 rounded-xl"
          title="Ordo AI Copilot"
        >
          <Sparkles className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-muted/50 hover:scale-105">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-10 items-center gap-2 rounded-xl px-3 transition-all duration-200 hover:bg-muted/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden text-sm font-medium md:inline-block">
                {user?.name || "Usuario"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t("profile")}</DropdownMenuItem>
            <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
