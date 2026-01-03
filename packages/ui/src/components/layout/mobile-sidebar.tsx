
import { type ReactNode, type ElementType } from 'react';
import { Settings } from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from '../ui/sheet.js';
import { cn } from '../../utils/index.js';
import type { NavItem } from './sidebar.js';

// Re-export NavItem for convenience
export type { NavItem };

interface MobileSidebarProps {
  /** Controls sheet open/close state */
  open: boolean;
  /** Called when sheet should close */
  onOpenChange: (open: boolean) => void;
  /** Current pathname to determine active state */
  pathname?: string;
  /** Navigation items */
  navItems?: NavItem[];
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

const colorClasses = {
  cyan: 'group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950 group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
  purple: 'group-hover:bg-purple-50 dark:group-hover:bg-purple-950 group-hover:text-purple-600 dark:group-hover:text-purple-400',
  pink: 'group-hover:bg-pink-50 dark:group-hover:bg-pink-950 group-hover:text-pink-600 dark:group-hover:text-pink-400',
  orange: 'group-hover:bg-orange-50 dark:group-hover:bg-orange-950 group-hover:text-orange-600 dark:group-hover:text-orange-400',
  green: 'group-hover:bg-green-50 dark:group-hover:bg-green-950 group-hover:text-green-600 dark:group-hover:text-green-400',
  blue: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-blue-600 dark:group-hover:text-blue-400',
  yellow: 'group-hover:bg-yellow-50 dark:group-hover:bg-yellow-950 group-hover:text-yellow-600 dark:group-hover:text-yellow-400',
  red: 'group-hover:bg-red-50 dark:group-hover:bg-red-950 group-hover:text-red-600 dark:group-hover:text-red-400',
};

const activeColorClasses = {
  cyan: 'bg-cyan-500 text-white shadow-md',
  purple: 'bg-purple-500 text-white shadow-md',
  pink: 'bg-pink-500 text-white shadow-md',
  orange: 'bg-orange-500 text-white shadow-md',
  green: 'bg-green-500 text-white shadow-md',
  blue: 'bg-blue-500 text-white shadow-md',
  yellow: 'bg-yellow-500 text-white shadow-md',
  red: 'bg-red-500 text-white shadow-md',
};

const DEFAULT_LABELS = {
  appName: 'Ordo',
  settings: 'Settings',
};

export function MobileSidebar({
  open,
  onOpenChange,
  pathname = '',
  navItems = [],
  renderLink,
  renderWorkspaceSelector,
  renderTimerWidget,
  renderInstallButton,
  logoHref = '/dashboard',
  LogoIcon,
  showSettingsButton = false,
  labels = {},
}: MobileSidebarProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border/50 px-6 shrink-0">
            {renderLink({
              href: logoHref,
              className: 'flex items-center gap-3 group',
              onClick: handleLinkClick,
              children: (
                <>
                  {LogoIcon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <LogoIcon className="h-6 w-6" />
                    </div>
                  )}
                  <span className="text-2xl font-bold text-foreground">
                    {t.appName}
                  </span>
                </>
              ),
            })}
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation */}
            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                const color = item.color || 'cyan';
                return (
                  <div key={item.href}>
                    {renderLink({
                      href: item.href,
                      onClick: handleLinkClick,
                      className: cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive
                          ? activeColorClasses[color]
                          : cn(
                              'text-muted-foreground hover:text-foreground',
                              colorClasses[color]
                            )
                      ),
                      children: (
                        <>
                          <item.icon
                            className={cn(
                              'h-5 w-5 transition-transform duration-200',
                              isActive ? '' : 'group-hover:scale-110'
                            )}
                          />
                          {item.name}
                        </>
                      ),
                    })}
                  </div>
                );
              })}
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
                {showSettingsButton && renderLink({
                  href: '/settings',
                  onClick: handleLinkClick,
                  className: cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActiveRoute('/settings')
                      ? activeColorClasses.blue
                      : cn('text-muted-foreground hover:text-foreground', colorClasses.blue)
                  ),
                  children: (
                    <>
                      <Settings
                        className={cn(
                          'h-5 w-5 transition-transform duration-200',
                          isActiveRoute('/settings') ? '' : 'group-hover:scale-110'
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
