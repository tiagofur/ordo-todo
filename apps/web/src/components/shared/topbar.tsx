"use client";

import { TopBar as TopBarUI } from "@ordo-todo/ui";
import { useAuth } from "@/contexts/auth-context";
import { SyncStatusIndicator } from "@/components/shared/sync-status-indicator";
import { NotificationPopover } from "@/components/shared/notification-popover";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const t = useTranslations("TopBar");
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <TopBarUI
      user={{
        name: user?.name,
        email: user?.email,
        level: (user as any)?.level,
        xp: (user as any)?.xp,
      }}
      onLogout={logout}
      onProfileClick={() => router.push("/profile")}
      onSettingsClick={() => router.push("/profile")}
      onMenuClick={onMenuClick}
      onAICopilotClick={() => {
        // TODO: Open AI Copilot
      }}
      renderNotifications={() => <NotificationPopover />}
      renderSyncStatus={() => <SyncStatusIndicator size="sm" />}
      labels={{
        searchPlaceholder: t("searchPlaceholder"),
        myAccount: t("myAccount"),
        profile: t("profile"),
        settings: t("settings"),
        logout: t("logout"),
        aiCopilot: "Ordo AI Copilot",
        level: "Lvl",
        menu: t("menu"),
      }}
    />
  );
}
