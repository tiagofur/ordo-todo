'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Repeat, Plus, Flame, PauseCircle } from 'lucide-react';

export default function HabitsGuide() {
  const t = useTranslations('GuideHabits');

  const concepts = [
    { key: 'streaks', icon: Flame, color: '#F97316' },
    { key: 'pause', icon: PauseCircle, color: '#3B82F6' },
    { key: 'stats', icon: Repeat, color: '#10B981' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#F97316]/20 flex items-center justify-center">
          <Repeat className="h-5 w-5 text-[#F97316]" />
        </div>
        <span className="text-sm font-medium text-[#F97316]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">
        {t('subtitle')}
      </p>

      <h2>{t('create_title')}</h2>
      <div className="not-prose space-y-3 my-6">
        {[1, 2, 3].map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl border bg-card"
          >
            <div className="h-8 w-8 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold text-sm">
              {step}
            </div>
            <p className="text-foreground">{t(`steps.${step}`)}</p>
          </motion.div>
        ))}
      </div>

      <h2>{t('concepts_title')}</h2>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {concepts.map((concept, index) => {
          const Icon = concept.icon;
          return (
            <motion.div
              key={concept.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl border bg-card text-center"
            >
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${concept.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: concept.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`concepts.${concept.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`concepts.${concept.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('complete_title')}</h2>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#10B981] flex items-center justify-center">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('complete_text')}</p>
        </div>
      </div>

      <div className="not-prose p-6 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
