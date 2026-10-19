"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarConnectionCard } from "@ordo-todo/ui";
import {
  useCalendarConnect,
  useCalendarDisconnect,
  useCalendarStatus,
} from "@/hooks/use-calendar-sync";

const PROVIDERS = [
  { id: "GOOGLE_CALENDAR", name: "Google Calendar" },
  { id: "MICROSOFT_CALENDAR", name: "Outlook" },
] as const;

/**
 * Calendar connections section for settings.
 * Connect/disconnect Google + Outlook with human sync status.
 */
export function CalendarConnections() {
  const t = useTranslations("Settings");
  const { data: accounts, isLoading } = useCalendarStatus();
  const connect = useCalendarConnect();
  const disconnect = useCalendarDisconnect();

  const handleDisconnect = (provider: string, name: string) => {
    disconnect.mutate(provider, {
      onSuccess: () => toast.success(t("calendar.disconnected", { name })),
      onError: () => toast.error(t("calendar.disconnectError", { name })),
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("calendar.loading")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
      <p className="text-sm text-muted-foreground">{t("calendar.description")}</p>
      {PROVIDERS.map((provider) => {
        const account =
          accounts?.find((a) => a.provider === provider.id) ?? null;
        return (
          <CalendarConnectionCard
            key={provider.id}
            account={account}
            provider={provider.id}
            providerName={provider.name}
            labels={{
              connect: t("calendar.connect"),
              disconnect: t("calendar.disconnect"),
              reconnect: t("calendar.reconnect"),
              connectedAs: t("calendar.connectedAs"),
              neverSynced: t("calendar.neverSynced"),
              conflicts: (count: number) =>
                t("calendar.conflicts", { count }),
            }}
            onConnect={() => connect.mutate(provider.id)}
            onDisconnect={() => handleDisconnect(provider.id, provider.name)}
            busy={connect.isPending || disconnect.isPending}
          />
        );
      })}
    </div>
  );
}
