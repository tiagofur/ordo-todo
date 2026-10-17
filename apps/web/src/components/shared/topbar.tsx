"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar as TopBarUI } from "@ordo-todo/ui";
import { useAuth } from "@ordo-todo/auth-provider";
import { SyncStatusIndicator } from "@/components/shared/sync-status-indicator";
import { NotificationPopover } from "@/components/shared/notification-popover";
import { SmartSearch } from "@/components/search/smart-search";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Dialog, DialogContent } from "@ordo-todo/ui";
import { useGamificationProfile } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useCollaborationSocket } from "@/hooks/use-collaboration-socket";
import { useNotificationsSocket } from "@/hooks/use-notifications-socket";
import { PresenceAvatars } from "@/components/collaboration/presence-avatars";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const t = useTranslations("TopBar");
  const tSearch = useTranslations("Search");
  const { user, logout } = useAuth();
  const { data: gamification } = useGamificationProfile({ enabled: !!user });
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useNotificationsSocket();

  const { selectedWorkspaceId } = useWorkspaceStore();
  const { workspaceUsers } = useCollaborationSocket({
    workspaceId: selectedWorkspaceId,
    enabled: !!selectedWorkspaceId && !!user,
  });

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
          level: gamification?.level ?? (user as any)?.level ?? 1,
          xp: gamification?.xp ?? (user as any)?.xp ?? 0,
        }}
        onLogout={logout}
        onProfileClick={() => router.push("/profile")}
        onSettingsClick={() => router.push("/settings")}
        onMenuClick={onMenuClick}
        onSearchClick={() => setIsSearchOpen(true)}
        onAICopilotClick={() => {
          // Open AI Copilot - navigate to chat
          router.push("/ai-chat");
        }}
        renderNotifications={() => <NotificationPopover />}
        renderSyncStatus={() => (
          <div className="flex items-center gap-2">
            {workspaceUsers.length > 0 && (
              <div className="flex items-center pr-2 border-r border-border/60">
                <PresenceAvatars
                  users={workspaceUsers}
                  currentUserId={user?.id}
                  size="sm"
                />
              </div>
            )}
            <SyncStatusIndicator size="sm" />
          </div>
        )}
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
