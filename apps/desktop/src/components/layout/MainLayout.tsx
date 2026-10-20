import { Outlet } from "react-router-dom";
import TitleBar from "../TitleBar";
import { Sidebar } from "../layout/Sidebar";
import { TopBar } from "../layout/TopBar";
import { useState, useEffect } from "react";
import { QuickActionsOverlay } from "../quick-actions/QuickActionsOverlay";
import { QuickAddTask } from "../quick-actions/QuickAddTask";
import { KeyboardShortcutsHelp } from "../keyboard-shortcuts/KeyboardShortcutsHelp";
import { useGlobalKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSystemIntegration } from "../system/SystemIntegration";
import { useElectron } from "@/hooks/use-electron";

import { desktopBridge } from "@/lib/desktop-bridge";

export function MainLayout() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  // Native shell: tray quick-add listener + global shortcuts (single
  // mount site — previously only registered while Profile was mounted).
  useElectron();

  // Initialize system integration
  const { updateBadgeCount } = useSystemIntegration();

  useEffect(() => {
    // Check window state on mount
    const checkWindowState = async () => {
      if (desktopBridge.isNative()) {
        const maximized = await desktopBridge.isMaximized();
        setIsMaximized(maximized);
      }
    };

    checkWindowState();

    // Listen for window state changes
    const handleWindowStateChange = () => {
      checkWindowState();
    };

    window.addEventListener("focus", handleWindowStateChange);
    window.addEventListener("resize", handleWindowStateChange);

    return () => {
      window.removeEventListener("focus", handleWindowStateChange);
      window.removeEventListener("resize", handleWindowStateChange);
    };
  }, []);

  // Handle custom events for quick add and other actions
  useEffect(() => {
    const handleOpenQuickAdd = () => setIsQuickAddOpen(true);

    window.addEventListener("openQuickAdd", handleOpenQuickAdd);
    return () => window.removeEventListener("openQuickAdd", handleOpenQuickAdd);
  }, []);

  return (
    <>
      {/* Title Bar for desktop app */}
      <TitleBar isMaximized={isMaximized} />

      {/* Main content with sidebar (sidebar is fixed positioned) */}
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground pt-8">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden pl-64 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto flex flex-col min-h-0 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Enhanced Desktop Features Overlays */}
      <QuickActionsOverlay />
      <QuickAddTask isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <KeyboardShortcutsHelp />
    </>
  );
}