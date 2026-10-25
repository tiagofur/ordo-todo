import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MobileSidebar as MobileSidebarUI } from "@ordo-todo/ui";
import { WorkspaceSelector } from "../workspace/WorkspaceSelector";
import { CreateWorkspaceDialog } from "../workspace/CreateWorkspaceDialog";
import { TimerWidget } from "../timer/timer-widget";
import { useNavSections } from "./Sidebar";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Cajón de navegación para pantallas < lg (teléfono, tablet vertical y
 * ventanas estrechas). Mismas secciones que la sidebar fija; se cierra al
 * navegar.
 */
export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const { t } = (useTranslation as any)();
  const location = useLocation();
  const navSections = useNavSections();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  return (
    <>
      <MobileSidebarUI
        open={open}
        onOpenChange={onOpenChange}
        pathname={location.pathname}
        navSections={navSections}
        renderLink={({ href, className, children, onClick }) => (
          <Link
            to={href}
            className={className}
            onClick={() => {
              onClick?.();
              onOpenChange(false);
            }}
          >
            {children}
          </Link>
        )}
        renderTimerWidget={() => <TimerWidget />}
        renderWorkspaceSelector={() => (
          <WorkspaceSelector
            onCreateClick={() => {
              onOpenChange(false);
              setShowCreateWorkspace(true);
            }}
          />
        )}
        showSettingsButton={false}
        labels={{
          appName: "Ordo",
          settings: t("Sidebar.settings"),
        }}
      />

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </>
  );
}
