import { type ReactNode, type ElementType } from "react";
import { Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet.js";
import { cn } from "../../utils/index.js";
import type { NavItem, NavSection } from "./sidebar.js";

// Re-export for convenience
export type { NavItem, NavSection };

interface MobileSidebarProps {
  /** Controls sheet open/close state */
  open: boolean;
  /** Called when sheet should close */
  onOpenChange: (open: boolean) => void;
  /** Current pathname to determine active state */
  pathname?: string;
  /** Navigation items (flat list) */
  navItems?: NavItem[];
  /** Navigation sections with optional labels (takes precedence over navItems) */
  navSections?: NavSection[];
  /** Render a Link component (for Next.js or React Router) */
  renderLink: (props: {
    href: string;
    className: string;
    children: ReactNode;
    onClick?: () => void;
  }) => ReactNode;
  /** Workspace selector component */
  renderWorkspaceSelector?: () => ReactNode;
  /** Timer widget component */
  renderTimerWidget?: () => ReactNode;
  /** Install PWA button renderer */
  renderInstallButton?: () => ReactNode;
  /** Logo click handler or href */
  logoHref?: string;
  /** Logo icon component */
  LogoIcon?: ElementType;
  /** Whether to show the settings button (default: false) */
  showSettingsButton?: boolean;
  labels?: {
    appName?: string;
    settings?: string;
  };
}

const colorClasses: Record<string, string> = {
  cyan: "hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400",
  purple:
    "hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400",
  pink: "hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-400",
  orange:
    "hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400",
  green:
    "hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-600 dark:hover:text-green-400",
  emerald:
    "hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400",
  blue: "hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400",
  yellow:
    "hover:bg-yellow-50 dark:hover:bg-yellow-950/40 hover:text-yellow-600 dark:hover:text-yellow-400",
  red: "hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400",
};

// Sombras elegidas para garantizar ≥4.5:1 de contraste con texto blanco (WCAG AA)
const activeColorClasses: Record<string, string> = {
  cyan: "bg-cyan-700 text-white shadow-sm shadow-cyan-700/25 font-semibold",
  purple:
    "bg-purple-600 text-white shadow-sm shadow-purple-600/25 font-semibold",
  pink: "bg-pink-600 text-white shadow-sm shadow-pink-600/25 font-semibold",
  orange:
    "bg-orange-700 text-white shadow-sm shadow-orange-700/25 font-semibold",
  green: "bg-green-700 text-white shadow-sm shadow-green-700/25 font-semibold",
  emerald:
    "bg-emerald-700 text-white shadow-sm shadow-emerald-700/25 font-semibold",
  blue: "bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-semibold",
  yellow:
    "bg-yellow-700 text-white shadow-sm shadow-yellow-700/25 font-semibold",
  red: "bg-red-600 text-white shadow-sm shadow-red-600/25 font-semibold",
};

const DEFAULT_LABELS = {
  appName: "Ordo",
  settings: "Settings",
};

export function MobileSidebar({
  open,
  onOpenChange,
  pathname = "",
  navItems = [],
  navSections,
  renderLink,
  renderWorkspaceSelector,
  renderTimerWidget,
  renderInstallButton,
  logoHref = "/dashboard",
  LogoIcon,
  showSettingsButton = false,
  labels = {},
}: MobileSidebarProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  // Build sections: prefer navSections, fall back to navItems as a single section
  const sections: NavSection[] = navSections || [{ items: navItems }];

  const isActiveRoute = (href: string) => {
    if (!pathname) return false;

    // Handle Projects routes: /projects, /projects/*, or nested /.../projects/*
    if (href === "/projects") {
      return (
        pathname === "/projects" ||
        pathname.startsWith("/projects/") ||
        pathname.includes("/projects")
      );
    }

    // Handle Workspaces routes:
    // 1. Direct /workspaces or /workspaces/* (excluding nested /projects)
    // 2. User workspace routes like /:username/:slug (excluding reserved top-level and nested /projects)
    if (href === "/workspaces") {
      if (pathname.includes("/projects")) return false;
      if (pathname === "/workspaces" || pathname.startsWith("/workspaces/"))
        return true;

      const segments = pathname
        .replace(/^\//, "")
        .replace(/\/$/, "")
        .split("/");
      const firstSegment = segments[0];
      const reservedTopLevel = [
        "dashboard",
        "tasks",
        "calendar",
        "projects",
        "workspaces",
        "habits",
        "goals",
        "notes",
        "ai-chat",
        "eisenhower",
        "meetings",
        "insights",
        "wellbeing",
        "tags",
        "settings",
        "profile",
        "notifications",
        "reports",
        "timer",
        "trash",
        "login",
        "register",
        "auth",
        "admin",
      ];
      if (
        segments.length === 2 &&
        firstSegment &&
        !reservedTopLevel.includes(firstSegment)
      ) {
        return true;
      }
      return false;
    }

    // Handle Trash routes: /trash, /trash/*, /tasks/trash
    if (href === "/trash" || href.startsWith("/trash")) {
      return (
        pathname === "/trash" ||
        pathname.startsWith("/trash/") ||
        pathname === "/tasks/trash"
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[280px] max-w-[85vw] p-0 pb-[env(safe-area-inset-bottom,0px)]"
      >
        <SheetTitle className="sr-only">{t.appName} Navigation Menu</SheetTitle>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-sidebar-border/50 px-6 shrink-0">
            {renderLink({
              href: logoHref,
              className: "flex items-center gap-3 group",
              onClick: handleLinkClick,
              children: (
                <>
                  {LogoIcon && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ad46ff] text-white shadow-md shadow-[#ad46ff]/30 transition-transform duration-300 group-hover:scale-105">
                      <LogoIcon className="h-6 w-6" />
                    </div>
                  )}
                  <span className="text-2xl font-bold text-foreground tracking-tight">
                    {t.appName}
                  </span>
                </>
              ),
            })}
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation */}
            <nav aria-label="Navegación principal" className="px-3 py-4">
              {sections.map((section, sectionIndex) => (
                <div
                  key={section.label || sectionIndex}
                  className={cn(sectionIndex > 0 && "mt-4")}
                >
                  {section.label && (
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {section.label}
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = isActiveRoute(item.href);
                      const itemColor = item.color || "cyan";
                      const activeClass =
                        activeColorClasses[itemColor] ||
                        activeColorClasses.cyan;
                      const hoverClass =
                        colorClasses[itemColor] || colorClasses.cyan;

                      return (
                        <div key={item.href}>
                          {renderLink({
                            href: item.href,
                            onClick: handleLinkClick,
                            className: cn(
                              "group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                              isActive
                                ? activeClass
                                : cn("text-muted-foreground", hoverClass),
                            ),
                            children: (
                              <>
                                <item.icon
                                  className={cn(
                                    "h-5 w-5 shrink-0",
                                    isActive && "text-white",
                                  )}
                                />
                                {item.name}
                              </>
                            ),
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Timer Widget */}
            {renderTimerWidget && (
              <div className="border-t border-sidebar-border/50 p-3">
                {renderTimerWidget()}
              </div>
            )}

            {/* Workspace Selector */}
            {renderWorkspaceSelector && (
              <div className="border-t border-sidebar-border/50 p-3">
                {renderWorkspaceSelector()}
              </div>
            )}

            {/* Settings & PWA */}
            {(showSettingsButton || renderInstallButton) && (
              <div className="border-t border-sidebar-border/50 p-3 space-y-1">
                {showSettingsButton &&
                  renderLink({
                    href: "/settings",
                    onClick: handleLinkClick,
                    className: cn(
                      "group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActiveRoute("/settings")
                        ? activeColorClasses.blue
                        : cn("text-muted-foreground", colorClasses.blue),
                    ),
                    children: (
                      <>
                        <Settings
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isActiveRoute("/settings") && "text-white",
                          )}
                        />
                        {t.settings}
                      </>
                    ),
                  })}
                {renderInstallButton?.()}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
