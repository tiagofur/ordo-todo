"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { 
  AIWeeklyReport as AIWeeklyReportUI, 
  type ProductivityData,
  type AIReportSection 
} from "@ordo-todo/ui";
import { FileText } from "lucide-react";

interface AIWeeklyReportProps {
  data?: ProductivityData;
  onRefresh?: () => void;
  className?: string;
}

/**
 * AIWeeklyReport - Web wrapper for the shared AIWeeklyReport component
 * 
 * Integrates the platform-agnostic UI component with next-intl translations
 * and handles local state for report generation.
 */
export function AIWeeklyReport({ data, onRefresh, className }: AIWeeklyReportProps) {
  const t = useTranslations("AIReport");

  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<AIReportSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const labels = {
    title: t("title"),
    subtitle: t("subtitle"),
    generate: t("generateButton"),
    analyzing: t("analyzing"),
    emptyState: t("emptyState"),
    regenerate: t("regenerate"),
    export: t("export"),
    stats: {
      pomodoros: t("stats.pomodoros"),
      tasks: t("stats.tasks"),
      streak: t("stats.streak"),
      average: t("stats.average"),
    },
  };

  const defaultGenerateReport = async (data: ProductivityData): Promise<AIReportSection[]> => {
    // Default mock logic moved from UI
    if (!data) return [];
    
    // This logic should eventually be moved to a useAIReport hook or similar
    const completionRate = Math.round((data.completedTasks / (data.totalTasks || 1)) * 100);
    const sections: AIReportSection[] = [];

    sections.push({
      id: 'summary',
      title: 'Weekly Summary',
      icon: FileText,
      type: 'info',
      content: [
        `You completed ${data.totalPomodoros} pomodoros and ${data.completedTasks} tasks.`,
        `Completion rate: ${completionRate}%.`,
        `Daily average: ${data.avgPomodorosPerDay.toFixed(1)} pomodoros.`,
      ],
    });

    return sections;
  };

  const handleGenerate = async () => {
    if (!data) return;
    setIsGenerating(true);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const sections = await defaultGenerateReport(data);
    
    setReport(sections);
    setExpandedSections(sections.map((s) => s.id));
    setHasGenerated(true);
    setIsGenerating(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <AIWeeklyReportUI
      data={data}
      onRefresh={onRefresh}
      labels={labels}
      className={className}
      isGenerating={isGenerating}
      report={report}
      expandedSections={expandedSections}
      hasGenerated={hasGenerated}
      onGenerate={handleGenerate}
      onToggleSection={toggleSection}
    />
  );
}
