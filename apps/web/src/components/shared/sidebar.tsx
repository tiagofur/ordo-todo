"use client";
 
import { useState } from "react";
import { Home, CheckSquare, FolderKanban, Tags, BarChart3, Settings, Download, Briefcase } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "@/components/workspace/workspace-selector";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { TimerWidget } from "@/components/timer/timer-widget";
import { usePWA } from "@/components/providers/pwa-provider";
import { useTranslations } from "next-intl";

const colorClasses = {
  cyan: "group-hover:bg-cyan-500/10 group-hover:text-cyan-500",
  purple: "group-hover:bg-purple-500/10 group-hover:text-purple-500",
  pink: "group-hover:bg-pink-500/10 group-hover:text-pink-500",
  orange: "group-hover:bg-orange-500/10 group-hover:text-orange-500",
  green: "group-hover:bg-green-500/10 group-hover:text-green-500",
  blue: "group-hover:bg-blue-500/10 group-hover:text-blue-500",
};

const activeColorClasses = {
  cyan: "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20",
  purple: "bg-purple-500 text-white shadow-lg shadow-purple-500/20",
  pink: "bg-pink-500 text-white shadow-lg shadow-pink-500/20",
  orange: "bg-orange-500 text-white shadow-lg shadow-orange-500/20",
  green: "bg-green-500 text-white shadow-lg shadow-green-500/20",
  blue: "bg-blue-500 text-white shadow-lg shadow-blue-500/20",
};

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const navigation = [
    { name: t('today'), href: "/dashboard", icon: Home, color: "cyan" },
    { name: t('tasks'), href: "/tasks", icon: CheckSquare, color: "purple" },
    { name: t('projects'), href: "/projects", icon: FolderKanban, color: "pink" },
    { name: t('workspaces'), href: "/workspaces", icon: Briefcase, color: "orange" },
    { name: t('tags'), href: "/tags", icon: Tags, color: "green" },
    { name: t('analytics'), href: "/analytics", icon: BarChart3, color: "cyan" },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border/50 px-6">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <CheckSquare className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                Ordo
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? activeColorClasses[item.color as keyof typeof activeColorClasses]
                      : cn(
                          "text-muted-foreground hover:text-foreground",
                          colorClasses[item.color as keyof typeof colorClasses]
                        )
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "" : "group-hover:scale-110"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Timer Widget */}
          <div className="border-t border-border/50 p-3">
            <TimerWidget />
          </div>

          {/* Workspace Selector */}
          <div className="border-t border-border/50 p-3">
            <WorkspaceSelector onCreateClick={() => setShowCreateWorkspace(true)} />
          </div>

          {/* Settings & PWA */}
          <div className="border-t border-border/50 p-3 space-y-1">
            <Link
              href="/settings"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === "/settings" || pathname?.startsWith("/settings/")
                  ? activeColorClasses.blue
                  : cn(
                      "text-muted-foreground hover:text-foreground",
                      colorClasses.blue
                    )
              )}
            >
              <Settings className={cn(
                "h-5 w-5 transition-transform duration-200",
                pathname === "/settings" || pathname?.startsWith("/settings/") ? "" : "group-hover:scale-110"
              )} />
              {t('settings')}
            </Link>
            <InstallPWAButton />
          </div>
        </div>
      </aside>

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </>
  );
}

function InstallPWAButton() {
  const t = useTranslations('Sidebar');
  const { isInstallable, installPrompt } = usePWA();

  if (!isInstallable) return null;

  return (
    <button
      onClick={installPrompt}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
    >
      <Download className="h-5 w-5" />
      {t('installApp')}
    </button>
  );
}
