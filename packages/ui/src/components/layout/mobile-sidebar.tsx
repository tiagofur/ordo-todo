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
  cyan: "group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950/40 group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
  purple: "group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40 group-hover:text-purple-600 dark:group-hover:text-purple-400",
  pink: "group-hover:bg-pink-50 dark:group-hover:bg-pink-950/40 group-hover:text-pink-600 dark:group-hover:text-pink-400",
  orange: "group-hover:bg-orange-50 dark:group-hover:bg-orange-950/40 group-hover:text-orange-600 dark:group-hover:text-orange-400",
  green: "group-hover:bg-green-50 dark:group-hover:bg-green-950/40 group-hover:text-green-600 dark:group-hover:text-green-400",
  emerald: "group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
  blue: "group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600 dark:group-hover:text-blue-400",
  yellow: "group-hover:bg-yellow-50 dark:group-hover:bg-yellow-950/40 group-hover:text-yellow-600 dark:group-hover:text-yellow-400",
  red: "group-hover:bg-red-50 dark:group-hover:bg-red-950/40 group-hover:text-red-600 dark:group-hover:text-red-400",
};

const activeColorClasses: Record<string, string> = {
  cyan: "bg-cyan-500 text-white shadow-sm shadow-cyan-500/25 font-semibold",
  purple: "bg-purple-500 text-white shadow-sm shadow-purple-500/25 font-semibold",
  pink: "bg-pink-500 text-white shadow-sm shadow-pink-500/25 font-semibold",
  orange: "bg-orange-500 text-white shadow-sm shadow-orange-500/25 font-semibold",
  green: "bg-green-500 text-white shadow-sm shadow-green-500/25 font-semibold",
  emerald: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 font-semibold",
  blue: "bg-blue-500 text-white shadow-sm shadow-blue-500/25 font-semibold",
  yellow: "bg-yellow-500 text-white shadow-sm shadow-yellow-500/25 font-semibold",
  red: "bg-red-500 text-white shadow-sm shadow-red-500/25 font-semibold",
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
    if (href === '/projects') {
      return pathname === '/projects' || pathname.startsWith('/projects/') || pathname.includes('/projects');
    }

    // Handle Workspaces routes:
    // 1. Direct /workspaces or /workspaces/* (excluding nested /projects)
    // 2. User workspace routes like /:username/:slug (excluding reserved top-level and nested /projects)
    if (href === '/workspaces') {
      if (pathname.includes('/projects')) return false;
      if (pathname === '/workspaces' || pathname.startsWith('/workspaces/')) return true;

      const segments = pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
      const firstSegment = segments[0];
      const reservedTopLevel = [
        'dashboard', 'tasks', 'calendar', 'projects', 'workspaces', 'habits',
        'goals', 'notes', 'ai-chat', 'eisenhower', 'meetings', 'insights',
        'wellbeing', 'tags', 'settings', 'profile', 'notifications', 'reports',
        'timer', 'trash', 'login', 'register', 'auth'
      ];
      if (segments.length === 2 && firstSegment && !reservedTopLevel.includes(firstSegment)) {
        return true;
      }
      return false;
    }

    // Handle Trash routes: /trash, /trash/*, /tasks/trash
    if (href === '/trash' || href.startsWith('/trash')) {
      return pathname === '/trash' || pathname.startsWith('/trash/') || pathname === '/tasks/trash';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">{t.appName} Navigation Menu</SheetTitle>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border/50 px-6 shrink-0">
            {renderLink({
              href: logoHref,
              className: "flex items-center gap-3 group",
              onClick: handleLinkClick,
              children: (
                <>
                  {LogoIcon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-sm shadow-purple-500/20 transition-transform duration-300 group-hover:scale-105">
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
            <nav className="px-3 py-4">
              {sections.map((section, sectionIndex) => (
                <div key={section.label || sectionIndex} className={cn(sectionIndex > 0 && "mt-4")}>
                  {section.label && (
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {section.label}
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = isActiveRoute(item.href);
                      const itemColor = item.color || "cyan";
                      const activeClass = activeColorClasses[itemColor] || activeColorClasses.cyan;
                      const hoverClass = colorClasses[itemColor] || colorClasses.cyan;

                      return (
                        <div key={item.href}>
                          {renderLink({
                            href: item.href,
                            onClick: handleLinkClick,
                            className: cn(
                              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                              isActive
                                ? activeClass
                                : cn("text-muted-foreground hover:text-foreground", hoverClass)
                            ),
                            children: (
                              <>
                                <item.icon
                                  className={cn(
                                    "h-5 w-5 shrink-0 transition-transform duration-200",
                                    isActive ? "text-white" : "text-muted-foreground group-hover:scale-110"
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
              <div className="border-t border-border/50 p-3">
                {renderTimerWidget()}
              </div>
            )}

            {/* Workspace Selector */}
            {renderWorkspaceSelector && (
              <div className="border-t border-border/50 p-3">
                {renderWorkspaceSelector()}
              </div>
            )}

            {/* Settings & PWA */}
            {(showSettingsButton || renderInstallButton) && (
              <div className="border-t border-border/50 p-3 space-y-1">
                {showSettingsButton &&
                  renderLink({
                    href: "/settings",
                    onClick: handleLinkClick,
                    className: cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActiveRoute("/settings")
                        ? activeColorClasses.blue
                        : cn("text-muted-foreground hover:text-foreground", colorClasses.blue)
                    ),
                    children: (
                      <>
                        <Settings
                          className={cn(
                            "h-5 w-5 shrink-0 transition-transform duration-200",
                            isActiveRoute("/settings") ? "text-white" : "text-muted-foreground group-hover:scale-110"
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
