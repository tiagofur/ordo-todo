'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { HeartPulse, Zap, Coffee, Moon, Gauge } from 'lucide-react';

const signals = [
  { key: 'energy', icon: Zap, color: '#EC4899' },
  { key: 'burnout', icon: Gauge, color: '#F59E0B' },
  { key: 'breaks', icon: Coffee, color: '#10B981' },
  { key: 'night', icon: Moon, color: '#6366F1' },
];

export default function WellbeingGuide() {
  const t = useTranslations('GuideWellbeing');

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#EC4899]/20 flex items-center justify-center">
          <HeartPulse className="h-5 w-5 text-[#EC4899]" />
        </div>
        <span className="text-sm font-medium text-[#EC4899]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('what_title')}</h2>
      <p>{t('what_text')}</p>

      <h2>{t('signals_title')}</h2>
      <p>{t('signals_text')}</p>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {signals.map((s, index) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border bg-card"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${s.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`signals.${s.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`signals.${s.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('analysis_title')}</h2>
      <p>{t('analysis_text')}</p>

      <h2>{t('weekly_title')}</h2>
      <p>{t('weekly_text')}</p>

      <h2>{t('data_title')}</h2>
      <p>{t('data_text')}</p>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
