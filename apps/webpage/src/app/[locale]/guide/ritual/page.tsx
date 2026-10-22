'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MoonStar, Sunrise, Sunset, Flame, BellRing } from 'lucide-react';

export default function RitualGuide() {
  const t = useTranslations('GuideRitual');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#A855F7]/20 flex items-center justify-center">
          <MoonStar className="h-5 w-5 text-[#A855F7]" />
        </div>
        <span className="text-sm font-medium text-[#A855F7]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">
        {t('subtitle')}
      </p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Sunrise className="h-5 w-5 text-[#F59E0B]" />
            <h4 className="font-semibold text-foreground">{t('morning_title')}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{t('morning_text')}</p>
        </div>
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Sunset className="h-5 w-5 text-[#4A154B]" />
            <h4 className="font-semibold text-foreground">{t('evening_title')}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{t('evening_text')}</p>
        </div>
      </div>

      <h2>{t('flow_title')}</h2>
      <div className="not-prose space-y-3 my-6">
        {[1, 2, 3, 4].map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl border bg-card"
          >
            <div className="h-8 w-8 rounded-full bg-[#A855F7] flex items-center justify-center text-white font-bold text-sm">
              {step}
            </div>
            <p className="text-foreground">{t(`steps.${step}`)}</p>
          </motion.div>
        ))}
      </div>

      <h2>{t('streak_title')}</h2>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="h-5 w-5 text-[#F97316]" />
            <h4 className="font-semibold text-foreground">{t('streak_card_title')}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{t('streak_card_text')}</p>
        </div>
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <BellRing className="h-5 w-5 text-[#06B6D4]" />
            <h4 className="font-semibold text-foreground">{t('reminders_card_title')}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{t('reminders_card_text')}</p>
        </div>
      </div>

      <div className="not-prose p-6 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
