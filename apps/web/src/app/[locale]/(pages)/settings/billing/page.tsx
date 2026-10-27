"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { BillingSection } from "@/components/settings/billing-section";
import { useTranslations } from "next-intl";

export default function BillingPage() {
  const t = useTranslations("Billing");

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header — patrón unificado de Ajustes */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div>
              <h1 className="text-xl font-bold text-foreground truncate">
                {t("pageTitle")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("pageSubtitle")}
              </p>
            </div>
          </div>
        </div>

        <BillingSection />
      </div>
    </AppLayout>
  );
}
