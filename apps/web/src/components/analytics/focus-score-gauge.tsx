"use client";

import { useTranslations } from "next-intl";
import { FocusScoreGauge as FocusScoreGaugeUI } from "@ordo-todo/ui";

interface FocusScoreGaugeProps {
  score: number; // 0-1
  label?: string;
  description?: string;
}

/**
 * FocusScoreGauge - Web wrapper for the shared FocusScoreGauge component
 * 
 * Integrates the platform-agnostic UI component with next-intl translations.
 */
export function FocusScoreGauge({ score, label, description }: FocusScoreGaugeProps) {
  const t = useTranslations('FocusScoreGauge');

  const labels = {
    label: label || t('label'),
    description: description || t('description'),
    excellent: t('messages.excellent'),
    veryGood: t('messages.veryGood'),
    good: t('messages.good'),
    moderate: t('messages.moderate'),
    low: t('messages.low'),
    needsImprovement: t('messages.needsImprovement'),
  };

  return <FocusScoreGaugeUI score={score} labels={labels} />;
}
