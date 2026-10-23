"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { AdminOverviewCards } from "@/components/admin/admin-overview-cards";

export default function AdminDashboardPage() {
  const t = useTranslations("Admin");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-500 shadow-xs">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="m-0 truncate text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <AdminOverviewCards />
    </div>
  );
}
