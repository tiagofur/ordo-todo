"use client";

import { ReactNode, useState } from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileSidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { ErrorBoundary } from "./error-boundary";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/shortcuts/keyboard-shortcuts-help";
import { QuickAddDialog } from "@/components/task/quick-add-dialog";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const { showShortcutsHelp, setShowShortcutsHelp } = useKeyboardShortcuts({
    enabled: true,
    onToggleSidebar: () => setSidebarCollapsed((prev) => !prev),
    onNewTask: () => setQuickAddOpen(true),
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <DesktopSidebar collapsed={sidebarCollapsed} />

      {/* Mobile Sidebar (Sheet) */}
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      {/* Main Content */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
        <main 
          id="main-content"
          role="main"
          aria-label="Contenido principal"
          className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col min-h-0"
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        open={showShortcutsHelp}
        onOpenChange={setShowShortcutsHelp}
      />

      {/* Global Quick-Add (Cmd/Ctrl+N) */}
      <QuickAddDialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
}

