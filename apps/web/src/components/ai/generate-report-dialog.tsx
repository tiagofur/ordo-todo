"use client";

import { GenerateReportDialog as GenerateReportDialogUI } from "@ordo-todo/ui";
import { useGenerateWeeklyReport } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";

interface GenerateReportDialogProps {
  onSuccess?: (report: any) => void;
  trigger?: React.ReactNode;
}

export function GenerateReportDialog({
  onSuccess,
  trigger,
}: GenerateReportDialogProps) {
  const t = useTranslations("GenerateReportDialog");
  const generateReport = useGenerateWeeklyReport();

  const handleGenerate = async () => {
    try {
      const result = await generateReport.mutateAsync(undefined);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw error;
    }
  };

  return (
    <GenerateReportDialogUI
      trigger={trigger}
      onGenerate={handleGenerate}
      onSuccess={() => {
        // Auto-close handled by UI component
      }}
      onReset={() => generateReport.reset()}
      isPending={generateReport.isPending}
      isSuccess={generateReport.isSuccess}
      isError={generateReport.isError}
      labels={{
        trigger: t("trigger"),
        title: t("title"),
        description: t("description"),
        includes: {
          title: t("includes.title"),
          metrics: t("includes.metrics"),
          strengths: t("includes.strengths"),
          recommendations: t("includes.recommendations"),
          patterns: t("includes.patterns"),
          score: t("includes.score"),
        },
        buttons: {
          cancel: t("buttons.cancel"),
          generate: t("buttons.generate"),
          close: t("buttons.close"),
          retry: t("buttons.retry"),
        },
        loading: {
          title: t("loading.title"),
          description: t("loading.description"),
        },
        success: {
          title: t("success.title"),
          description: t("success.description"),
        },
        error: t("error"),
      }}
    />
  );
}
