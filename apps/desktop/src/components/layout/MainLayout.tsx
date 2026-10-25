import { Outlet } from "react-router-dom";
import TitleBar from "../TitleBar";
import { Sidebar } from "../layout/Sidebar";
import { MobileSidebar } from "../layout/MobileSidebar";
import { MobileBottomNav } from "../layout/MobileBottomNav";
import { TopBar } from "../layout/TopBar";
import { useState, useEffect } from "react";
import { QuickActionsOverlay } from "../quick-actions/QuickActionsOverlay";
import { QuickAddTask } from "../quick-actions/QuickAddTask";
import { KeyboardShortcutsHelp } from "../keyboard-shortcuts/KeyboardShortcutsHelp";
import { useGlobalKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSystemIntegration } from "../system/SystemIntegration";
import { useElectron } from "@/hooks/use-electron";
import { cn } from "@/lib/utils";

import { desktopBridge } from "@/lib/desktop-bridge";

/**
 * Shell compartido por desktop y móvil (ODD 020 P4). Responsivo:
 * - `md+` (desktop, tablet vertical y horizontal): sidebar fija + TopBar.
 * - `< md` (teléfono y ventana estrecha): cajón desde la hamburguesa de la
 *   TopBar; en la app móvil además barra inferior.
 * La TitleBar propia y los overlays de atajos globales son solo desktop.
 */
export function MainLayout() {
  const isDesktop = desktopBridge.isDesktop();
  const isMobile = desktopBridge.isMobile();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  // Native shell: tray quick-add listener + global shortcuts (single
  // mount site — previously only registered while Profile was mounted).
  // El bridge los ignora fuera del shell de desktop.
  useElectron();

  // Initialize system integration
  useSystemIntegration();

  useEffect(() => {
    if (!isDesktop) return;

    // Check window state on mount
    const checkWindowState = async () => {
      const maximized = await desktopBridge.isMaximized();
      setIsMaximized(maximized);
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
  }, [isDesktop]);

  // Handle custom events for quick add and other actions
  useEffect(() => {
    const handleOpenQuickAdd = () => setIsQuickAddOpen(true);

    window.addEventListener("openQuickAdd", handleOpenQuickAdd);
    return () => window.removeEventListener("openQuickAdd", handleOpenQuickAdd);
  }, []);

  return (
    <>
      {/* Title Bar for desktop app */}
      {isDesktop && <TitleBar isMaximized={isMaximized} />}

      {/* Main content with sidebar (sidebar is fixed positioned) */}
      <div
        className={cn(
          "flex h-screen flex-col overflow-hidden bg-background text-foreground",
          isDesktop && "pt-8",
        )}
      >
        <Sidebar />
        <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        <div className="flex flex-1 flex-col overflow-hidden md:pl-64 min-w-0">
          <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
          <main
            className={cn(
              "flex-1 overflow-y-auto flex flex-col min-h-0 p-4 sm:p-6",
              // Hueco para la barra inferior del móvil
              isMobile && "pb-24 md:pb-6",
            )}
          >
            <Outlet />
          </main>
          {isMobile && (
            <MobileBottomNav onMenuClick={() => setMobileMenuOpen(true)} />
          )}
        </div>
      </div>

      {/* Enhanced Desktop Features Overlays */}
      {isDesktop && <QuickActionsOverlay />}
      <QuickAddTask
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
      <KeyboardShortcutsHelp />
    </>
  );
}
