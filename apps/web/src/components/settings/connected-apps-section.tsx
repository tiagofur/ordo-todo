"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Bot, Loader2, Plug, Unplug } from "lucide-react";
import { Button, Label } from "@ordo-todo/ui";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { apiClient, type OAuthConnection } from "@/lib/api-client";

/** Scope → i18n key under `Connect.scopes` (shared with the consent screen). */
const SCOPE_KEYS: Record<string, string> = {
  read: "read",
  "tasks:write": "tasksWrite",
  "projects:write": "projectsWrite",
  "admin:webhooks": "adminWebhooks",
};

export function ConnectedAppsSection() {
  const t = useTranslations("Settings.connections");
  const tScopes = useTranslations("Connect.scopes");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const { data: connections, isLoading, error } = useQuery<OAuthConnection[]>({
    queryKey: ["oauth-connections"],
    queryFn: () => apiClient.getOAuthConnections(),
    staleTime: 30000,
  });

  const disconnectMutation = useMutation({
    mutationFn: (clientId: string) => apiClient.disconnectOAuthClient(clientId),
    onMutate: (clientId) => setDisconnectingId(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oauth-connections"] });
      toast.success(t("disconnectSuccess"));
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message || t("disconnectError"));
    },
    onSettled: () => setDisconnectingId(null),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>{t("loadError")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-[#ad46ff]/10 p-2.5 text-[#ad46ff]">
          <Plug className="h-4 w-4" />
        </div>
        <div>
          <Label className="text-base">{t("title")}</Label>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      {!connections || connections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {connections.map((connection, index) => (
              <motion.div
                key={connection.clientId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col gap-3 rounded-xl border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="rounded-xl bg-background p-2.5 text-foreground shadow-xs">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium">
                      {connection.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("connectedOn", { date: formatDate(connection.connectedAt) })}
                      {" · "}
                      {t("lastActivity", {
                        date: formatDate(connection.lastRefreshedAt),
                      })}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {connection.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="rounded-full bg-[#ad46ff]/10 px-2 py-0.5 text-[11px] font-medium text-[#ad46ff]"
                        >
                          {SCOPE_KEYS[scope]
                            ? tScopes(SCOPE_KEYS[scope])
                            : tScopes("unknown", { scope })}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectMutation.mutate(connection.clientId)}
                  disabled={disconnectingId === connection.clientId}
                  className="shrink-0 text-destructive hover:bg-red-500/10 hover:text-destructive"
                >
                  {disconnectingId === connection.clientId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("disconnecting")}
                    </>
                  ) : (
                    <>
                      <Unplug className="mr-2 h-4 w-4" />
                      {t("disconnect")}
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
