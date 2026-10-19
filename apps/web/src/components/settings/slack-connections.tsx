"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MessageSquare, Plug } from "lucide-react";
import {
  useSlackInstall,
  useSlackMappingUpdate,
  useSlackTeams,
  useSlackUninstall,
} from "@/hooks/use-slack-sync";

/**
 * Slack connections section for settings.
 * Install/uninstall + per-team channel/project mapping + daily
 * summary and focus-sync toggles.
 */
export function SlackConnections() {
  const t = useTranslations("Settings");
  const { data: teams, isLoading } = useSlackTeams();
  const install = useSlackInstall();
  const uninstall = useSlackUninstall();
  const updateMapping = useSlackMappingUpdate();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("slack.loading")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
      <p className="text-sm text-muted-foreground">{t("slack.description")}</p>
      {(teams ?? []).map((team) => (
        <div
          key={team.id}
          className="flex flex-col gap-3 p-4 rounded-xl border bg-card"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#4A154B]/10 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5 text-[#4A154B] dark:text-[#E01E5A]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground">
                {team.teamName ?? team.teamId}
              </h4>
              <p className="text-sm text-muted-foreground">
                {team.channelId
                  ? t("slack.channelLinked", { channel: team.channelId })
                  : t("slack.noChannel")}
              </p>
            </div>
            <button
              onClick={() =>
                uninstall.mutate(team.teamId, {
                  onSuccess: () =>
                    toast.success(
                      t("slack.disconnected", {
                        name: team.teamName ?? team.teamId,
                      }),
                    ),
                  onError: () => toast.error(t("slack.disconnectError")),
                })
              }
              disabled={uninstall.isPending}
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted disabled:opacity-50 shrink-0"
            >
              {t("slack.disconnect")}
            </button>
          </div>
          <label className="flex items-center justify-between text-sm gap-3">
            <span>{t("slack.dailySummary")}</span>
            <input
              type="checkbox"
              checked={team.dailySummary}
              onChange={(event) =>
                updateMapping.mutate({
                  id: team.id,
                  data: { dailySummary: event.target.checked },
                })
              }
              className="h-4 w-4 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between text-sm gap-3">
            <span>{t("slack.focusSync")}</span>
            <input
              type="checkbox"
              checked={team.focusSync}
              onChange={(event) =>
                updateMapping.mutate({
                  id: team.id,
                  data: { focusSync: event.target.checked },
                })
              }
              className="h-4 w-4 accent-primary"
            />
          </label>
        </div>
      ))}
      <button
        onClick={() => install.mutate()}
        disabled={install.isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        <Plug className="h-4 w-4" />
        {t("slack.connect")}
      </button>
    </div>
  );
}
