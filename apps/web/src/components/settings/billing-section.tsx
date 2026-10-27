"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowUpRight, Check, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@ordo-todo/ui";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { PLANS } from "@ordo-todo/config";
import {
  apiClient,
  type BillingInterval,
  type BillingPlanId,
  type BillingUsageOverview,
} from "@/lib/api-client";

const GB = 1e9;
const DAY = 24 * 60 * 60 * 1000;

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBytes(bytes: number, locale: string): string {
  const nf = (v: number, digits = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(v);
  const gb = bytes / GB;
  if (gb < 0.001) return `${nf(bytes / 1e3)} KB`;
  if (gb < 1) return `${nf(gb * 1000)} MB`;
  return `${nf(gb, 1)} GB`;
}

/** Uso/límite → porcentaje para la barra (0-100; límites -1 = ilimitado). */
function percent(used: number, limit: number): number | null {
  if (limit < 0) return null;
  if (limit === 0) return used > 0 ? 100 : 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function BillingSection() {
  const t = useTranslations("Billing");
  const locale = useLocale();
  // Vuelta de Stripe Checkout: se lee una vez al montar (evita el boundary
  // de Suspense que useSearchParams exige en Next 16). Guard SSR: este
  // componente solo se renderiza en cliente (páginas "use client").
  const [checkoutOutcome] = useState(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("checkout"),
  );
  const [interval, setInterval] = useState<BillingInterval>("year");
  const [teamSeats, setTeamSeats] = useState(2);
  const [starting, setStarting] = useState<string | null>(null);
  const outcomeHandled = useRef(false);

  const overviewQuery = useQuery({
    queryKey: ["billing-overview"],
    queryFn: () => apiClient.getBillingOverview(),
  });
  const overview: BillingUsageOverview | undefined = overviewQuery.data;

  // Resultado de la vuelta de Stripe Checkout (una sola vez: StrictMode
  // monta dos veces en dev)
  useEffect(() => {
    if (!checkoutOutcome || outcomeHandled.current) return;
    outcomeHandled.current = true;
    if (checkoutOutcome === "success") {
      toast.success(t("checkoutSuccess"));
      overviewQuery.refetch();
    } else if (checkoutOutcome === "canceled") {
      toast.info(t("checkoutCanceled"));
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("session_id");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutOutcome]);

  const daysLeft = useMemo(() => {
    if (!overview?.trialEndsAt) return null;
    return Math.max(
      0,
      Math.ceil((new Date(overview.trialEndsAt).getTime() - Date.now()) / DAY),
    );
  }, [overview]);

  const startCheckout = async (planId: BillingPlanId, seats?: number) => {
    setStarting(planId);
    try {
      const { url } = await apiClient.createCheckoutSession(
        planId,
        interval,
        seats,
      );
      window.location.href = url;
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? t("errors.checkout");
      toast.error(message);
      setStarting(null);
    }
  };

  const openPortal = async () => {
    setStarting("portal");
    try {
      const { url } = await apiClient.createPortalSession();
      window.location.href = url;
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? t("errors.portal");
      toast.error(message);
      setStarting(null);
    }
  };

  if (overviewQuery.isError) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
        <div className="flex flex-col items-start gap-3 text-sm">
          <span className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {t("errors.load")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => overviewQuery.refetch()}
          >
            {t("errors.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (overviewQuery.isLoading || !overview) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{t("loading")}</span>
        </div>
      </div>
    );
  }

  const usageRows = [
    {
      label: t("usage.projects"),
      used: overview.usage.projects,
      limit: overview.limits.projects,
    },
    {
      label: t("usage.workspaces"),
      used: overview.usage.workspaces,
      limit: overview.limits.workspaces,
    },
    {
      label: t("usage.storage"),
      used: overview.usage.storageUsedBytes,
      limit:
        overview.limits.storageGb == null ? -1 : overview.limits.storageGb * GB,
      usedLabel: formatBytes(overview.usage.storageUsedBytes, locale),
      limitLabel:
        overview.limits.storageGb == null
          ? t("usage.custom")
          : formatBytes(overview.limits.storageGb * GB, locale),
    },
  ];

  const trialActive = overview.status === "TRIALING";

  return (
    <div className="space-y-6">
      {/* Estado de la suscripción */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <CreditCard className="h-4 w-4 text-primary" />
              {t("currentPlan.title")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {trialActive && daysLeft != null
                ? t("currentPlan.trial", { days: daysLeft })
                : overview.status === "CANCELED" && overview.graceEndsAt
                  ? t("currentPlan.grace", {
                      date: formatDate(overview.graceEndsAt, locale),
                    })
                  : overview.currentPeriodEnd
                    ? t("currentPlan.renews", {
                        date: formatDate(overview.currentPeriodEnd, locale),
                      })
                    : t("currentPlan.free")}
            </p>
          </div>
          {overview.hasStripeCustomer && (
            <Button
              variant="outline"
              size="sm"
              onClick={openPortal}
              disabled={starting === "portal"}
            >
              {starting === "portal" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {t("currentPlan.manage")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Aviso de gracia */}
        {overview.status === "CANCELED" && overview.graceEndsAt && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-400">
              {t("currentPlan.graceNotice", {
                date: formatDate(overview.graceEndsAt, locale),
              })}
            </span>
          </div>
        )}

        {/* Uso vs límites */}
        <div className="mt-5 space-y-3">
          {usageRows.map((row) => {
            const pct = percent(row.used, row.limit);
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">
                    {row.usedLabel ?? row.used}
                    {" / "}
                    {row.limitLabel ??
                      (row.limit < 0 ? t("usage.unlimited") : row.limit)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  {pct != null && (
                    <div
                      className={`h-full rounded-full ${
                        pct >= 100 ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-muted-foreground">{t("usage.credits")}</span>
            <span className="font-medium">
              {overview.aiCredits.balance}
              {overview.limits.aiCreditsPerMonth != null &&
              overview.limits.aiCreditsPerMonth > 0
                ? ` / ${t("usage.creditsPerMonth", {
                    credits: overview.limits.aiCreditsPerMonth,
                  })}`
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Planes disponibles (oculto para Enterprise contratado) */}
      {overview.plan !== "ENTERPRISE" && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-semibold">{t("plans.title")}</h3>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1 text-xs">
              {(["month", "year"] as const).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInterval(i)}
                  className={`rounded-md px-3 py-1.5 font-medium transition ${
                    interval === i
                      ? "bg-card shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  {i === "month"
                    ? t("plans.monthly")
                    : t("plans.annual", { discount: 25 })}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["pro", "team"] as const).map((planId) => {
              const isCurrent =
                (planId === "pro" && overview.plan === "PRO") ||
                (planId === "team" && overview.plan === "TEAM");
              // Precios SIEMPRE de la tabla única (ODD 012 S1) — nunca
              // hardcodeados aquí.
              const price =
                interval === "month"
                  ? PLANS[planId].priceUsd!
                  : PLANS[planId].annualPriceUsd!;
              return (
                <div
                  key={planId}
                  className={`rounded-xl border p-4 ${
                    isCurrent
                      ? "border-primary/60 bg-primary/5"
                      : "border-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {planId === "pro" ? t("plans.pro") : t("plans.team")}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Check className="h-3 w-3" />
                        {t("plans.current")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    ${price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {interval === "month"
                        ? t("plans.perMonth")
                        : planId === "team"
                          ? t("plans.perSeatPerYear")
                          : t("plans.perYear")}
                    </span>
                  </p>
                  {planId === "team" && (
                    <label className="mt-2 block text-xs text-muted-foreground">
                      {t("plans.seats")}
                      <input
                        type="number"
                        min={2}
                        max={999}
                        value={teamSeats}
                        onChange={(e) =>
                          setTeamSeats(
                            Math.min(
                              999,
                              Math.max(2, parseInt(e.target.value || "2", 10)),
                            ),
                          )
                        }
                        className="ml-2 w-20 rounded-md border border-border bg-background px-2 py-1 text-foreground"
                      />
                    </label>
                  )}
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    disabled={isCurrent || starting !== null}
                    onClick={() =>
                      startCheckout(
                        planId,
                        planId === "team" ? teamSeats : undefined,
                      )
                    }
                  >
                    {starting === planId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {isCurrent
                      ? t("plans.currentPlan")
                      : overview.plan === "FREE" || overview.status === "CANCELED"
                        ? t("plans.upgrade")
                        : t("plans.changeTo")}
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("plans.enterpriseNote")}{" "}
            <a
              href="mailto:hola@ordotodo.app"
              className="underline hover:no-underline"
            >
              hola@ordotodo.app
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
