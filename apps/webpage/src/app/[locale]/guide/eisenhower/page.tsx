'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { LayoutGrid, Flame, CalendarClock, Users, Trash2 } from 'lucide-react';

const quadrants = [
  { key: 'do', icon: Flame, color: '#EC4899' },
  { key: 'schedule', icon: CalendarClock, color: '#3B82F6' },
  { key: 'delegate', icon: Users, color: '#F59E0B' },
  { key: 'delete', icon: Trash2, color: '#64748B' },
];

export default function EisenhowerGuide() {
  const t = useTranslations('GuideEisenhower');

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
          <LayoutGrid className="h-5 w-5 text-[#8B5CF6]" />
        </div>
        <span className="text-sm font-medium text-[#8B5CF6]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('what_title')}</h2>
      <p>{t('what_text')}</p>

      <h2>{t('quadrants_title')}</h2>
      <p>{t('quadrants_text')}</p>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {quadrants.map((q, index) => {
          const Icon = q.icon;
          return (
            <motion.div
              key={q.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border bg-card"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${q.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: q.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`quadrants.${q.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`quadrants.${q.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('drag_title')}</h2>
      <p>{t('drag_text')}</p>

      <h2>{t('when_title')}</h2>
      <p>{t('when_text')}</p>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
