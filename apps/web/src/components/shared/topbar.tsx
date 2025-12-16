"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar as TopBarUI } from "@ordo-todo/ui";
import { useAuth } from "@/contexts/auth-context";
import { SyncStatusIndicator } from "@/components/shared/sync-status-indicator";
import { NotificationPopover } from "@/components/shared/notification-popover";
import { SmartSearch } from "@/components/search/smart-search";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Dialog, DialogContent } from "@ordo-todo/ui";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const t = useTranslations("TopBar");
  const tSearch = useTranslations("Search");
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
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
        onSearchClick={() => setIsSearchOpen(true)}
        onAICopilotClick={() => {
          // Open AI Copilot - navigate to chat
          router.push("/chat");
        }}
        renderNotifications={() => <NotificationPopover />}
        renderSyncStatus={() => <SyncStatusIndicator size="sm" />}
        labels={{
          searchPlaceholder: tSearch("placeholderWithAI"),
          myAccount: t("myAccount"),
          profile: t("profile"),
          settings: t("settings"),
          logout: t("logout"),
          aiCopilot: "Ordo AI Copilot",
          level: "Lvl",
          menu: t("menu"),
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
