"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AgentJobCard } from "@ordo-todo/ui";
import {
  useAgentJobs,
  useCreateAgentJob,
  useDeleteAgentJob,
  useRunAgentJobNow,
  useUpdateAgentJob,
} from "@/hooks/use-agent-jobs";

/**
 * Agent jobs section for settings (AI tab).
 * Create recurrent NL-scheduled jobs, pause/resume, run now, delete.
 */
export function AgentJobsSection() {
  const t = useTranslations("Settings");
  const { data: jobs, isLoading } = useAgentJobs();
  const createJob = useCreateAgentJob();
  const updateJob = useUpdateAgentJob();
  const deleteJob = useDeleteAgentJob();
  const runNow = useRunAgentJobNow();

  const [name, setName] = useState("");
  const [scheduleText, setScheduleText] = useState("");
  const [taskPrompt, setTaskPrompt] = useState("");

  const handleCreate = () => {
    createJob.mutate(
      { name, scheduleText, taskPrompt },
      {
        onSuccess: () => {
          toast.success(t("agentJobs.created"));
          setName("");
          setScheduleText("");
          setTaskPrompt("");
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? t("agentJobs.createError");
          toast.error(Array.isArray(message) ? message[0] : message);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("agentJobs.loading")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("agentJobs.description")}
      </p>

      <div className="space-y-3">
        <input
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          placeholder={t("agentJobs.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          placeholder={t("agentJobs.schedulePlaceholder")}
          value={scheduleText}
          onChange={(e) => setScheduleText(e.target.value)}
        />
        <p className="-mt-1 text-xs text-muted-foreground">
          {t("agentJobs.scheduleHint")}
        </p>
        <input
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          placeholder={t("agentJobs.promptPlaceholder")}
          value={taskPrompt}
          onChange={(e) => setTaskPrompt(e.target.value)}
        />
        <button
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          disabled={
            createJob.isPending ||
            !name.trim() ||
            !scheduleText.trim() ||
            !taskPrompt.trim()
          }
          onClick={handleCreate}
        >
          {createJob.isPending ? t("agentJobs.creating") : t("agentJobs.create")}
        </button>
      </div>

      {(jobs ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("agentJobs.empty")}</p>
      ) : (
        <div className="space-y-3">
          {(jobs ?? []).map((job) => (
            <AgentJobCard
              key={job.id}
              job={job}
              labels={{
                active: t("agentJobs.active"),
                paused: t("agentJobs.paused"),
                nextRun: t("agentJobs.nextRun"),
                neverRan: t("agentJobs.neverRan"),
                pause: t("agentJobs.pause"),
                resume: t("agentJobs.resume"),
                runNow: t("agentJobs.runNow"),
                del: t("agentJobs.delete"),
              }}
              runningId={runNow.isPending ? runNow.variables : null}
              onToggle={(id, isActive) =>
                updateJob.mutate({ id, input: { isActive } })
              }
              onRunNow={(id) =>
                runNow.mutate(id, {
                  onSuccess: (result) =>
                    result.ok
                      ? toast.success(t("agentJobs.ranOk"))
                      : toast.error(result.error ?? t("agentJobs.ranError")),
                  onError: () => toast.error(t("agentJobs.ranError")),
                })
              }
              onDelete={(id) => deleteJob.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
