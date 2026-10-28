"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiClient } from "@/lib/api-client";

const DAY = 24 * 60 * 60 * 1000;

export function DashboardTrialBanner() {
  const t = useTranslations("Billing.dashboardBanner");
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Solo muestra si no fue descartado en las últimas 24h
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("ordo_trial_banner_dismissed_at");
      if (!stored || Date.now() - parseInt(stored, 10) > DAY) {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  const { data: overview } = useQuery({
    queryKey: ["billing-overview"],
    queryFn: () => apiClient.getBillingOverview(),
  });

  if (
    dismissed ||
    !overview ||
    overview.status !== "TRIALING" ||
    !overview.trialEndsAt
  ) {
    return null;
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(overview.trialEndsAt).getTime() - Date.now()) / DAY),
  );

  const handleDismiss = () => {
    try {
      localStorage.setItem(
        "ordo_trial_banner_dismissed_at",
        Date.now().toString(),
      );
    } catch {
      // Ignorar si localStorage está deshabilitado
    }
    setDismissed(true);
  };

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            {t("title", { days: daysLeft })}
          </p>
          <p className="text-xs text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:self-center shrink-0">
        <Link
          href="/settings/billing"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 cursor-pointer"
        >
          <span>{t("cta")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
