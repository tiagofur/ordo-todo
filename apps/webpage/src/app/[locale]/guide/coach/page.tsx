'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessagesSquare, Lightbulb, ShieldAlert } from 'lucide-react';

const starters = ['day_plan', 'triage', 'eisenhower', 'breaks'];

export default function CoachGuide() {
  const t = useTranslations('GuideCoach');

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
          <MessagesSquare className="h-5 w-5 text-[#3B82F6]" />
        </div>
        <span className="text-sm font-medium text-[#3B82F6]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('what_title')}</h2>
      <p>{t('what_text')}</p>

      <h2>{t('starters_title')}</h2>
      <p>{t('starters_text')}</p>
      <div className="not-prose flex flex-wrap gap-3 my-6">
        {starters.map((key, index) => (
          <motion.span
            key={key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
          >
            {t(`starters.${key}`)}
          </motion.span>
        ))}
      </div>

      <h2>{t('ask_title')}</h2>
      <p>{t('ask_text')}</p>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#10B981] flex items-center justify-center shrink-0">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('ask_box_text')}</p>
        </div>
      </div>

      <h2>{t('limits_title')}</h2>
      <p>{t('limits_text')}</p>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#F59E0B] flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('limits_box_text')}</p>
        </div>
      </div>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
