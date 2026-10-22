'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, CalendarCheck, RotateCcw, TriangleAlert } from 'lucide-react';

export default function SchedulingGuide() {
  const t = useTranslations('GuideScheduling');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[#06B6D4]" />
        </div>
        <span className="text-sm font-medium text-[#06B6D4]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">
        {t('subtitle')}
      </p>

      <h2>{t('doday_title')}</h2>
      <p>{t('doday_text')}</p>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <CalendarCheck className="h-5 w-5 text-[#06B6D4]" />
            <h4 className="font-semibold text-foreground">{t('doday_card_title')}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{t('doday_card_text')}</p>
        </div>
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <RotateCcw className="h-5 w-5 text-[#EC4899]" />
            <h4 className="font-semibold text-foreground">{t('replan_card_title')}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{t('replan_card_text')}</p>
        </div>
      </div>

      <h2>{t('plan_title')}</h2>
      <div className="not-prose space-y-3 my-6">
        {[1, 2, 3].map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl border bg-card"
          >
            <div className="h-8 w-8 rounded-full bg-[#06B6D4] flex items-center justify-center text-white font-bold text-sm">
              {step}
            </div>
            <p className="text-foreground">{t(`steps.${step}`)}</p>
          </motion.div>
        ))}
      </div>

      <h2>{t('risks_title')}</h2>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-start gap-4">
          <TriangleAlert className="h-6 w-6 text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{t('risks_text')}</p>
        </div>
      </div>

      <div className="not-prose p-6 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
