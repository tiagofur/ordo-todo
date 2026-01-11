import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";
import { ConnectionStatusIndicator } from "@/components/shared/connection-status-indicator";
import type { SocketConnectionState } from "@/hooks/use-notifications-socket";

interface TopBarProps {
  connectionState?: SocketConnectionState;
  onReconnect?: () => void;
}

export function TopBar({ connectionState, onReconnect }: TopBarProps) {
  const { t } = (useTranslation as any)();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Search */}
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("TopBar.searchPlaceholder")}
            className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Connection Status Indicator */}
        {connectionState && (
          <ConnectionStatusIndicator
            connected={connectionState.connected}
            connecting={connectionState.connecting}
            error={connectionState.error}
            onReconnect={onReconnect}
          />
        )}

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-10 items-center gap-2 rounded-lg px-3 hover:bg-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden text-sm font-medium md:inline-block">
                {user?.name || "Usuario"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("TopBar.myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                {t("TopBar.profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                {t("TopBar.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer">
              <LogOut className="h-4 w-4" />
              {t("TopBar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

