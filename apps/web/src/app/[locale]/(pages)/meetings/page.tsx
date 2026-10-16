"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { MeetingAnalyzer } from "@/components/meetings/meeting-analyzer";
import { MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function MeetingsPage() {
  const t = useTranslations("Meetings");

  const features = [
    { title: t("featureSummaryTitle"), desc: t("featureSummaryDesc") },
    { title: t("featureActionItemsTitle"), desc: t("featureActionItemsDesc") },
    { title: t("featureDecisionsTitle"), desc: t("featureDecisionsDesc") },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <motion.div
              initial={{ rotate: -8, scale: 0.92 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-sm shadow-violet-500/25"
            >
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            {t("subtitle")}
          </p>
        </div>

        {/* Features callout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ y: -2 }}
              className="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:shadow-xs hover:border-border/80 transition-all duration-200"
            >
              <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Main analyzer */}
        <MeetingAnalyzer />
      </div>
    </AppLayout>
  );
}

