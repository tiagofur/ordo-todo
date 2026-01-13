"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Home,
  CheckSquare,
  FolderKanban,
  Tags,
  BarChart3,
  Briefcase,
  Calendar,
  Download,
  Sparkles,
  Target,
  MessageSquare,
  Heart,
  Users,
  LayoutGrid,
  Trash2,
  StickyNote,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Sidebar as SidebarUI, type NavItem } from "@ordo-todo/ui";
import { WorkspaceSelector, type WorkspaceSelectorItem } from "@/components/workspace/workspace-selector";
import { useWorkspaces, useCreateWorkspace } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { TimerWidget } from "@/components/timer/timer-widget";
import { usePWA } from "@/components/providers/pwa-provider";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const CreateWorkspaceDialog = dynamic(
  () => import("@/components/workspace/create-workspace-dialog").then((mod) => mod.CreateWorkspaceDialog),
  { ssr: false }
);

export function Sidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const params = useParams();
  const workspaceSlug = params?.slug as string;
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  // Workspace data and state
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const createWorkspace = useCreateWorkspace();

  const selectedWorkspace = workspaces?.find((w) => w.id === selectedWorkspaceId);
  const effectiveSlug = workspaceSlug || selectedWorkspace?.slug;

  const handleCreateWorkspace = async (data: any) => {
    try {
      const result = await createWorkspace.mutateAsync(data);

      // Auto-select newly created workspace
      if (result?.id) {
        setSelectedWorkspaceId(result.id);
      }

      setShowCreateWorkspace(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Convert workspaces to selector items (use workspace properties directly)
  const workspaceItems: WorkspaceSelectorItem[] = (workspaces || []).map((ws) => ({
    id: ws.id,
    slug: ws.slug,
    name: ws.name,
    color: ws.color,
    stats: {
      projectCount: ws.stats?.projectCount || 0,
      taskCount: ws.stats?.taskCount || 0,
    },
  }));

  const handleSelectWorkspace = (workspace: WorkspaceSelectorItem) => {
    setSelectedWorkspaceId(workspace.id);
    // Navigate to selected workspace
    // You can add navigation logic here if needed
  };

  const navItems: NavItem[] = [
    { name: t("today"), href: "/dashboard", icon: Home, color: "cyan" },
    { name: t("tasks"), href: "/tasks", icon: CheckSquare, color: "purple" },
    ...(effectiveSlug ? [{
      name: t("notes"),
      href: `/workspaces/${effectiveSlug}/notes`,
      icon: StickyNote,
      color: "yellow" as const
    }] : []),
    { name: t("habits"), href: "/habits", icon: Sparkles, color: "green" },
    { name: t("goals"), href: "/goals", icon: Target, color: "pink" },
    { name: t("calendar"), href: "/calendar", icon: Calendar, color: "blue" },
    {
      name: t("eisenhower"),
      href: "/eisenhower",
      icon: MessageSquare,
      color: "cyan" as const
    },
    { name: t("ai"), href: "/ai", icon: BarChart3, color: "pink" },
    { name: t("search"), href: "/search", icon: Tags, color: "orange" },
    { name: t("people"), href: "/people", icon: Users, color: "purple" },
    { name: t("integrations"), href: "/integrations", icon: LayoutGrid, color: "green" },
    { name: t("templates"), href: "/templates", icon: Download, color: "green" },
  ];

  const handleLogout = async () => {
    try {
      // Use the logout from auth provider
      const { logout } = await import("@ordo-todo/auth-provider").then(m => ({ useAuth: m.useAuth }));
      const { logout: authLogout } = useAuth();
      await authLogout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SidebarUI
      workspaces={workspaces}
      selectedWorkspaceId={selectedWorkspaceId}
      onSelectWorkspace={handleSelectWorkspace}
      onCreateWorkspace={handleCreateWorkspace}
      workspaceItems={workspaceItems}
      navItems={navItems}
      onLogout={handleLogout}
      labels={{
        today: t("today"),
        tasks: t("tasks"),
        notes: t("notes"),
        habits: t("habits"),
        goals: t("goals"),
        calendar: t("calendar"),
        eisenhower: t("eisenhower"),
        ai: t("ai"),
        search: t("search"),
        people: t("people"),
        integrations: t("integrations"),
        templates: t("templates"),
      }}
    >
      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </SidebarUI>
  );
}
