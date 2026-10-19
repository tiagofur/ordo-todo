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

  // Search is opened from the command palette (Cmd/Ctrl+K lives there
  // now) via the ordo:open-search event, or by clicking the search box.
  const openSearch = useCallback(() => setIsSearchOpen(true), []);

  useEffect(() => {
    const listener = () => openSearch();
    document.addEventListener("ordo:open-search", listener);
    return () => document.removeEventListener("ordo:open-search", listener);
  }, [openSearch]);

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
        renderSyncStatus={() => <SyncStatusIndicator size="sm" />}
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
