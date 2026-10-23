"use client";

import {
  Activity,
  Briefcase,
  CheckSquare,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Card, CardContent, Skeleton } from "@ordo-todo/ui";

import { useAdminOverview } from "@/hooks/use-admin";

function OverviewCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  accent: string;
}) {
  return (
    <Card className="rounded-2xl border-border/80 shadow-xs">
      <CardContent className="flex items-center gap-3.5 p-5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminOverviewCards() {
  const t = useTranslations("Admin.dashboard");
  const { data, isLoading } = useAdminOverview();

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="admin-overview-loading"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const plans = Object.entries(data.planDistribution).sort((a, b) =>
    b[1] - a[1]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          label={t("usersTotal")}
          value={data.users.total}
          icon={Users}
          accent="bg-primary/10 text-primary"
        />
        <OverviewCard
          label={t("usersNew7")}
          value={data.users.newLast7Days}
          icon={UserPlus}
          accent="bg-cyan-500/10 text-cyan-500"
        />
        <OverviewCard
          label={t("usersNew30")}
          value={data.users.newLast30Days}
          icon={UserPlus}
          accent="bg-blue-500/10 text-blue-500"
        />
        <OverviewCard
          label={t("usersActive30")}
          value={data.users.activeLast30Days}
          icon={Activity}
          accent="bg-emerald-500/10 text-emerald-500"
        />
        <OverviewCard
          label={t("tasksTotal")}
          value={data.tasks.total}
          icon={CheckSquare}
          accent="bg-purple-500/10 text-purple-500"
        />
        <OverviewCard
          label={t("tasksCompleted")}
          value={data.tasks.completed}
          icon={CheckSquare}
          accent="bg-green-500/10 text-green-500"
        />
        <OverviewCard
          label={t("workspacesTotal")}
          value={data.workspaces.total}
          icon={Briefcase}
          accent="bg-orange-500/10 text-orange-500"
        />
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                {t("planDistribution")}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {plans.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  {t("noPlans")}
                </span>
              ) : (
                plans.map(([plan, count]) => (
                  <span
                    key={plan}
                    className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-foreground"
                  >
                    {t("planName", { plan })}: {count}
                  </span>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("generatedAt", {
          date: format(new Date(data.generatedAt), "MMM d, yyyy HH:mm"),
        })}
      </p>
    </div>
  );
}
