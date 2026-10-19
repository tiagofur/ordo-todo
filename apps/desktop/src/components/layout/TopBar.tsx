import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TopBar as TopBarUI, Dialog, DialogContent } from "@ordo-todo/ui";
import { useAuth } from "@ordo-todo/auth-provider";
import { useGamificationProfile } from "@/lib/shared-hooks";
import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { SmartSearch } from "@/components/search/SmartSearch";

interface TopBarProps {
  onMenuClick?: () => void;
  connectionState?: any;
  onReconnect?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { t } = (useTranslation as any)();
  const { user, logout } = useAuth();
  const { data: gamification } = useGamificationProfile({ enabled: !!user });
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global CMD+K / Ctrl+K listener for search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setIsSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const userInitial = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <>
      <TopBarUI
        user={{
          name: user?.name,
          email: user?.email,
          level: gamification?.level ?? (user as any)?.level ?? 1,
          xp: gamification?.xp ?? (user as any)?.xp ?? 0,
        }}
        onLogout={logout}
        onProfileClick={() => navigate("/profile")}
        onSettingsClick={() => navigate("/settings")}
        onMenuClick={onMenuClick}
        onSearchClick={() => setIsSearchOpen(true)}
        onAICopilotClick={() => navigate("/ai-chat")}
        renderNotifications={() => <NotificationPopover />}
        renderSyncStatus={() => (
          <div className="flex items-center gap-2">
            {/* User Presence Avatar with Online Dot */}
            <div
              className="relative flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-[11px] font-semibold ring-1 ring-border cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/profile")}
              title={`${user?.name || "Usuario"} (En línea)`}
            >
              {userInitial}
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background" />
            </div>

            {/* Tactical Sync Status Indicator */}
            <SyncStatusIndicator size="sm" />
          </div>
        )}
        labels={{
          searchPlaceholder: t("TopBar.searchPlaceholder", "Buscar con lenguaje natural (IA)"),
          myAccount: t("TopBar.myAccount", "Mi Cuenta"),
          profile: t("TopBar.profile", "Perfil"),
          settings: t("TopBar.settings", "Configuración"),
          logout: t("TopBar.logout", "Cerrar sesión"),
          aiCopilot: "Ordo AI Copilot",
          level: "Lvl",
          menu: t("TopBar.menu", "Menú"),
        }}
      />

      {/* Smart Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-transparent border-none shadow-none">
          <SmartSearch
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TopBar;
