"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn, Skeleton } from "@ordo-todo/ui";
import { AppLayout } from "@/components/shared/app-layout";
import { useIsAdmin } from "@/hooks/use-is-admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useIsAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Admin");

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4" data-testid="admin-layout-loading">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { href: "/admin", label: t("nav.dashboard") },
    { href: "/admin/users", label: t("nav.users") },
    { href: "/admin/codes", label: t("nav.codes") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        <nav className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/80 bg-muted/60 p-1.5 shadow-xs dark:bg-zinc-900/80 sm:w-fit">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-xs font-medium transition-all sm:text-sm",
                  isActive
                    ? "bg-background font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </AppLayout>
  );
}
