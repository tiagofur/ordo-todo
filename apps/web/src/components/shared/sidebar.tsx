"use client";

import { CheckSquare, Download } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { MobileSidebar as MobileSidebarUI } from "@ordo-todo/ui";
import { buildNavSections } from "./nav-config";
import { WorkspaceSelector } from "@/components/workspace/workspace-selector";
import {
  CreateWorkspaceDialog,
  type CreateWorkspaceFormData,
} from "@/components/workspace/create-workspace-dialog";
import { TimerWidget } from "@/components/timer/timer-widget";
import { usePWA } from "@/components/providers/pwa-provider";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCreateWorkspace } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { useIsAdmin } from "@/hooks/use-is-admin";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const t = useTranslations("Sidebar");
  const tCreate = useTranslations("CreateWorkspaceDialog");
  const pathname = usePathname();
  const { isAdmin } = useIsAdmin();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const createWorkspace = useCreateWorkspace();
  const { setSelectedWorkspaceId } = useWorkspaceStore();

  const handleCreateWorkspace = async (data: CreateWorkspaceFormData) => {
    try {
      const created = await createWorkspace.mutateAsync(data);
      if (created?.id) {
        setSelectedWorkspaceId(created.id);
      }
      toast.success(tCreate("toast.success"));
      setShowCreateWorkspace(false);
    } catch (error) {
      toast.error(getErrorMessage(error, tCreate("toast.error")));
    }
  };

  const navSections = buildNavSections(t, isAdmin);

  return (
    <>
      <MobileSidebarUI
        open={open}
        onOpenChange={onOpenChange}
        pathname={pathname}
        navSections={navSections}
        LogoIcon={CheckSquare}
        renderLink={({ href, className, children, onClick }) => (
          <Link href={href} className={className} onClick={onClick}>
            {children}
          </Link>
        )}
        renderTimerWidget={() => <TimerWidget />}
        renderWorkspaceSelector={() => (
          // El drawer mide 280px con p-3: el dropdown no puede exceder 256px
          // o sobresale del drawer sobre el scrim.
          <WorkspaceSelector
            onCreateClick={() => setShowCreateWorkspace(true)}
            contentClassName="max-w-[256px]"
          />
        )}
        renderInstallButton={() => <InstallPWAButton />}
        showSettingsButton={false}
        labels={{
          appName: "Ordo",
          settings: t("settings"),
        }}
      />

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onSubmit={handleCreateWorkspace}
        isPending={createWorkspace.isPending}
      />
    </>
  );
}

function InstallPWAButton() {
  const t = useTranslations("Sidebar");
  const { isInstallable, installPrompt } = usePWA();

  if (!isInstallable) return null;

  return (
    <button
      onClick={installPrompt}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
    >
      <Download className="h-5 w-5" />
      {t("installApp")}
    </button>
  );
}
