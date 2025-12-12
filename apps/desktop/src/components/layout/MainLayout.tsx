import { Outlet } from "react-router-dom";
import { TitleBar } from "../TitleBar";
import { Sidebar } from "../layout/Sidebar";
import { useState, useEffect } from "react";
import { QuickActionsOverlay } from "../quick-actions/QuickActionsOverlay";
import { QuickAddTask } from "../quick-actions/QuickAddTask";
import { KeyboardShortcutsHelp } from "../keyboard-shortcuts/KeyboardShortcutsHelp";
import { useGlobalKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSystemIntegration } from "../system/SystemIntegration";

export function MainLayout() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  // Initialize system integration
  const { updateBadgeCount } = useSystemIntegration();

  useEffect(() => {
    // Check window state on mount
    const checkWindowState = async () => {
      if (window.electronAPI) {
        const maximized = await window.electronAPI.isMaximized();
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
      <div className="pt-16">
        <Sidebar />
        <main className="pl-64 min-h-screen bg-background">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Enhanced Desktop Features Overlays */}
      <QuickActionsOverlay />
      <QuickAddTask isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <KeyboardShortcutsHelp />
    </>
  );
}